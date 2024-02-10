// __tests__/unit/PlayerSessionStore.test.ts
import { PlayerSessionStore } from '../../src/PlayerSessionStore';

describe('PlayerSessionStore', () => {
    let sessionStore: PlayerSessionStore;
    let mockWebSocket: any;

    beforeEach(() => {
        sessionStore = new PlayerSessionStore();
        // Mock the WebSocket as a simple object
        mockWebSocket = {};
    });

    test('should create and retrieve a session', () => {
        const uuid = 'test-uuid';
        const username = 'test-user';

        sessionStore.createSession(uuid, username, mockWebSocket);
        const session = sessionStore.getSession(uuid);

        expect(session).toBeDefined();
        expect(session?.uuid).toBe(uuid);
        expect(session?.username).toBe(username);
        expect(session?.ws).toBe(mockWebSocket);
    });

    test('should delete a session', () => {
        const uuid = 'test-uuid';
        const username = 'test-user';

        sessionStore.createSession(uuid, username, mockWebSocket);
        let session = sessionStore.getSession(uuid);
        expect(session).toBeDefined();

        sessionStore.deleteSession(uuid);
        session = sessionStore.getSession(uuid);
        expect(session).toBeUndefined();
    });
});
