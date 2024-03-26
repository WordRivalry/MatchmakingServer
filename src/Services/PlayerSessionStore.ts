// PlayerSessionStore.ts
import WebSocket from 'ws';
import { SessionCreationFailed, SessionDeletionFailed, SessionNotFoundError } from '../Error/Errors';

export interface PlayerSession {
    uuid: string;
    playerName: string;
    ws: WebSocket;
}

export class PlayerSessionStore {
    private sessions: Map<string, PlayerSession> = new Map();
    createSession(uuid: string, playerName: string, ws: WebSocket): void {
        if (this.sessions.has(uuid)) {
            console.log('Session already exists, reconnecting...');
        }
        const session: PlayerSession = { uuid, playerName, ws };
        this.sessions.set(uuid, session);
    }

    hasSession(uuid: string): boolean {
        return this.sessions.has(uuid);
    }

    getSession(uuid: string): PlayerSession {
        const session = this.sessions.get(uuid);
        if (!session) {
            throw new SessionNotFoundError();
        }
        return session;
    }

    deleteSession(uuid: string): void { 
        const session = this.sessions.get(uuid);      
        if (!session) {
            throw new SessionDeletionFailed();
        }
        this.sessions.delete(uuid);
    }
}
