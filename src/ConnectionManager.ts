// ConnectionManager.ts
import http, { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createScopedLogger } from './logger/logger';
import { MatchmakingService } from './MatchmakingService';
import { PlayerSession, PlayerSessionStore } from "./PlayerSessionStore";
import { MatchFoundService } from "./MatchFoundService";
import config from "../config";


export class ConnectionManager {
    private readonly app: express.Application;
    private server: http.Server;
    private wss: WebSocketServer;
    private logger = createScopedLogger('ConnectionManager');

    constructor(
        private matchmakingService: MatchmakingService,
        private playerSessionStore: PlayerSessionStore,
        private MatchFoundService: MatchFoundService
    ) {
        this.app = express();
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ noServer: true });
        this.setupUpgradeHandler();
        this.setupWebSocketServer();
    }

    public listen(): void {
        const PORT = process.env.PORT || 8080;
        this.server.listen(PORT, () => {
            this.logger.context("listen").info(`Server is listening on port ${PORT}`);
        });
    }

    private setupUpgradeHandler(): void {
        this.server.on('upgrade', (request, socket, head) => {
            this.logger.context("setupUpgradeHandler").info('Upgrade request received');

            // Extract API key from headers
            const apiKey = request.headers['x-api-key'] as string | undefined;

            if (!this.isValidApiKey(apiKey)) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            // Proceed with the WebSocket upgrade since the API key is valid
            this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit('connection', ws, request);
            });
        });
    }

    private isValidApiKey(apiKey: string | undefined): boolean {
        const VALID_API_KEY = config.upgradeApiKey; // This should be stored securely
        return apiKey === VALID_API_KEY;
    }

    private setupWebSocketServer(): void {
        this.wss.on('connection', (ws) => {

            // Store the player's UUID once it's received for easier access
            let playerUUID: string | undefined = undefined;

            ws.on('message', (message) => {
                // Handle incoming messages
                try {
                    const action = JSON.parse(message.toString());

                    if (action.type === 'handshake') {
                        const { uuid, username } = action;
                        playerUUID = uuid;
                        this.playerSessionStore.createSession(uuid, username, ws);
                        this.logger.context("ws.on.message.handshake").info('Player session created', { uuid, username });
                    } else if (playerUUID !== undefined) {

                        const session = this.playerSessionStore.getSession(playerUUID);
                        if (session !== undefined) {
                            switch (action.type) {
                                case 'joinQueue':
                                    this.handlePlayerJoinQueue(session, action.payload);
                                    break;
                                case 'leaveQueue':
                                    this.matchmakingService.leaveQueue(playerUUID);
                                    break;
                            }
                        }
                    } else {
                        this.logger.context("ws.on.message").warn('Received message from unidentified player', { message });
                    }
                } catch (error) {
                    this.logger.context("ws.on.message").error('Error parsing message:', error);
                    ws.close(1007, 'Invalid JSON');
                }
            });

            ws.on('close', () => {
                this.handlePlayerDisconnect(playerUUID);
            });
        });
    }

    private handlePlayerJoinQueue(session: PlayerSession, payload: any) {
        this.matchmakingService.joinQueue(session, payload);
        const results = this.matchmakingService.tryMatch(session.uuid);
        if (results) {
            this.MatchFoundService.requestBattleServerSlotFor(results)
                .then(() => this.logger.context("handlePlayerJoinQueue").info('Match found and notified players', { player1: results[0].uuid, player2: results[1].uuid }))
                .catch((error) => this.logger.context("handlePlayerJoinQueue").error('Error requesting battle server slot:', error));
        }
    }

    private handlePlayerDisconnect(playerUUID: string | undefined) {
        if (playerUUID === undefined) {
            this.logger.context("handlePlayerDisconnect").warn('Received disconnect from unidentified player');
            return;
        }

        this.matchmakingService.handlePlayerDisconnect(playerUUID);
        this.playerSessionStore.deleteSession(playerUUID);
    }
}
