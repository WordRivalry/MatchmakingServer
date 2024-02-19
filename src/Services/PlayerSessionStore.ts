// PlayerSessionStore.ts
import WebSocket from 'ws';
import { SessionCreationFailed, SessionDeletionFailed, SessionNotFoundError } from '../Error/Errors';

export interface PlayerSession {
    uuid: string;
    username: string;
    ws: WebSocket;
}

export class PlayerSessionStore {
    private sessions: Map<string, PlayerSession> = new Map();
    createSession(uuid: string, username: string, ws: WebSocket): void {
        if (this.sessions.has(uuid)) {
            throw new SessionCreationFailed();
        }
        const session: PlayerSession = { uuid, username, ws };
        this.sessions.set(uuid, session);
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
