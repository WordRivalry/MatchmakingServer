// PlayerSessionStore.ts
import WebSocket from 'ws';
import { createScopedLogger } from './logger/logger';

export interface PlayerSession {
    uuid: string;
    username: string;
    ws: WebSocket;
}

export class PlayerSessionStore {
    private sessions: Map<string, PlayerSession> = new Map();
    private logger = createScopedLogger('PlayerSessionStore');

    createSession(uuid: string, username: string, ws: WebSocket): void {
        const session: PlayerSession = { uuid, username, ws };
        this.sessions.set(uuid, session);
        this.logger.context('createSession').info('Player session created', { uuid, username });
    }

    getSession(uuid: string): PlayerSession | undefined {
        return this.sessions.get(uuid);
    }

    deleteSession(uuid: string): void {
        this.sessions.delete(uuid);
        this.logger.context('deleteSession').info('Player session deleted', { uuid });
    }
}
