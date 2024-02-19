// __tests__/unit/PlayerSessionStore.test.ts
import { PlayerSessionStore } from '../../src/Services/PlayerSessionStore';
import { SessionCreationFailed, SessionDeletionFailed, SessionNotFoundError } from '../../src/Error/Errors';
import WebSocket from 'ws';

describe('PlayerSessionStore', () => {
    let sessionStore: PlayerSessionStore;
    let mockWebSocket: jest.Mocked<WebSocket>;

    beforeEach(() => {
        sessionStore = new PlayerSessionStore();
        // Mock the WebSocket as empty object
        mockWebSocket = {} as any;
    });

    describe('createSession', () => {
        it('should successfully create a session', () => {
            const uuid = 'test-uuid';
            const username = 'test-user';

            expect(() => sessionStore.createSession(uuid, username, mockWebSocket)).not.toThrow();
            expect(sessionStore.getSession(uuid)).toEqual({ uuid, username, ws: mockWebSocket });
        });

        it('should throw SessionCreationFailed if session with uuid already exists', () => {
            const uuid = 'test-uuid';
            const username = 'test-user';

            sessionStore.createSession(uuid, username, mockWebSocket);
            expect(() => sessionStore.createSession(uuid, username, mockWebSocket)).toThrow(SessionCreationFailed);
        });
    });

    describe('getSession', () => {
        it('should retrieve an existing session', () => {
            const uuid = 'test-uuid';
            const username = 'test-user';

            sessionStore.createSession(uuid, username, mockWebSocket);
            const session = sessionStore.getSession(uuid);
            expect(session).toEqual({ uuid, username, ws: mockWebSocket });
        });

        it('should throw SessionNotFoundError if session does not exist', () => {
            const uuid = 'non-existent-uuid';
            expect(() => sessionStore.getSession(uuid)).toThrow(SessionNotFoundError);
        });
    });

    describe('deleteSession', () => {
        it('should successfully delete an existing session', () => {
            const uuid = 'test-uuid';
            const username = 'test-user';

            sessionStore.createSession(uuid, username, mockWebSocket);
            expect(() => sessionStore.deleteSession(uuid)).not.toThrow();
            expect(() => sessionStore.getSession(uuid)).toThrow(SessionNotFoundError);
        });

        it('should throw SessionDeletionFailed if session does not exist', () => {
            const uuid = 'non-existent-uuid';
            expect(() => sessionStore.deleteSession(uuid)).toThrow(SessionDeletionFailed);
        });
    });
});
