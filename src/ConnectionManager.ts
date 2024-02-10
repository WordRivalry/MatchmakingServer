// ConnectionManager.ts
import http, { createServer } from 'http';
import express from 'express';
import {WebSocket, WebSocketServer} from 'ws';
import { createScopedLogger } from './logger/logger';
import config from "../config";

export interface IMessageHandler {
    handleMessage(ws: WebSocket, message: string, playerUUID: string | undefined): void;
    handleDisconnect(playerUUID: string | undefined): void;
}

export class ConnectionManager {
    private readonly app: express.Application;
    private server: http.Server;
    private wss: WebSocketServer;
    private logger = createScopedLogger('ConnectionManager');

    constructor(private messageHandler: IMessageHandler) {
        this.app = express();
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ noServer: true });
        this.setupUpgradeHandler();
        this.setupWebSocketServer();
    }

    public listen(): void {
        const PORT = process.env.PORT || 8079;
        this.server.listen(PORT, () => {
            this.logger.context("listen").info(`Server is listening on port ${PORT}`);
        });
    }

    private setupUpgradeHandler(): void {
        this.server.on('upgrade', (request, socket, head) => {
            this.logger.context("setupUpgradeHandler").info('Upgrade request received');

            const apiKey = request.headers['x-api-key'] as string | undefined;

            if (!this.isValidApiKey(apiKey)) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            this.wss.handleUpgrade(request, socket, head, (ws) => {
                this.wss.emit('connection', ws, request);
            });
        });
    }

    private isValidApiKey(apiKey: string | undefined): boolean {
        const VALID_API_KEY = config.upgradeApiKey;
        return apiKey === VALID_API_KEY;
    }

    private setupWebSocketServer(): void {
        this.wss.on('connection', (ws) => {
            let playerUUID: string | undefined = undefined;

            ws.on('message', (message) => {

                let action;
                try {
                    action = JSON.parse(message.toString());
                } catch (error) {
                    this.logger.context("handleMessage").error('Error parsing message:', error);
                    ws.close(1007, 'Invalid JSON');
                    return;
                }

                if (action.type === 'handshake') { // If the action is a handshake, store the playerUUID
                    playerUUID = action.uuid;
                }

                this.messageHandler.handleMessage(ws, action, playerUUID);
            });

            ws.on('close', () => {
                this.messageHandler.handleDisconnect(playerUUID);
            });
        });
    }
}
