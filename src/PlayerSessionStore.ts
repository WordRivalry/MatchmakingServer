// PlayerSessionStore.ts
import WebSocket from 'ws';

export interface PlayerSession {
    uuid: string;
    username: string;
    ws: WebSocket;
}

export class PlayerSessionStore {
    private sessions: Map<string, PlayerSession> = new Map();

    createSession(uuid: string, username: string, ws: WebSocket): void {
        const session: PlayerSession = { uuid, username, ws };
        this.sessions.set(uuid, session);
    }

    getSession(uuid: string): PlayerSession | undefined {
        return this.sessions.get(uuid);
    }

    deleteSession(uuid: string): void {
        this.sessions.delete(uuid);
    }
}
