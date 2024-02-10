// WebSocketMessageHandler.ts
import { WebSocket } from 'ws';
import { PlayerSessionStore, PlayerSession } from "./PlayerSessionStore";
import { MatchmakingService } from './MatchmakingService';
import { MatchFoundService } from "./MatchFoundService";
import { createScopedLogger } from './logger/logger';
import {IMessageHandler} from "./ConnectionManager";

export class WebSocketMessageHandler implements IMessageHandler {
    private logger = createScopedLogger('WebSocketMessageHandler');

    constructor(
        private matchmakingService: MatchmakingService,
        private playerSessionStore: PlayerSessionStore,
        private matchFoundService: MatchFoundService
    ) {}

    public handleMessage(ws: WebSocket, action: any, playerUUID: string | undefined): void {

        try {
            if (action.type === 'handshake') {
                const {uuid, username} = action;
                this.playerSessionStore.createSession(uuid, username, ws);
                this.logger.context("handleMessage.handshake").info('Player session created', {uuid, username});
                return;
            }

            if (playerUUID === undefined) {
                this.logger.context("handleMessage").warn('Received message from unidentified player', { action });
                return;
            }

            const session = this.playerSessionStore.getSession(playerUUID);
            if (session === undefined) {
                this.logger.context("handleMessage").warn('Player session not found', { playerUUID });
                ws.close(1008, 'Session not found');
                return;
            }

            switch (action.type) {
                case 'joinQueue':
                    this.handlePlayerJoinQueue(ws, session, action.payload);
                    break;
                case 'leaveQueue':
                    this.handlePlayerLeaveQueue(ws, playerUUID);
                    break;
                default:
                    this.logger.context("handleMessage").warn('Unhandled action type', { type: action.type });
            }
        } catch (error) {
            this.logger.context("handleMessage").error('Error handling message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'An error occurred' }));
        }
    }

    public handleDisconnect(playerUUID: string | undefined): void {
        if (playerUUID) {
            this.matchmakingService.handlePlayerDisconnect(playerUUID);
            this.playerSessionStore.deleteSession(playerUUID);
            this.logger.context("handleDisconnect").info('Player disconnected', { uuid: playerUUID });
        }
    }

    private handlePlayerJoinQueue(ws: WebSocket, session: PlayerSession, payload: any): void {
        const results = this.matchmakingService.joinQueue(session, payload);
        if (results) {
            this.matchFoundService.requestBattleServerSlotFor(results)
                .then(() => this.logger.context("handlePlayerJoinQueue").info('Match found and notified players', { player1: results[0].uuid, player2: results[1].uuid }))
                .catch((error) => {
                    this.logger.context("handlePlayerJoinQueue").error('Error requesting battle server slot:', error);
                    ws.send(JSON.stringify({ type: 'error', message: 'Error processing join queue request' }));
                });
        }
    }

    private handlePlayerLeaveQueue(ws: WebSocket, playerUUID: string): void {
        try {
            this.matchmakingService.leaveQueue(playerUUID);
            ws.send(JSON.stringify({ type: 'success', message: 'Left queue successfully' }));
        } catch (error) {
            this.logger.context("handlePlayerLeaveQueue").error('Error leaving queue:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Error leaving queue' }));
        }
    }
}
