// MatchmakingService.test.ts
import {PlayerSession} from "../../src/PlayerSessionStore";
import {MatchmakingService} from "../../src/MatchmakingService";

describe('MatchmakingService', () => {
    let matchmakingService: MatchmakingService;
    let mockPlayerSession: PlayerSession;
    let mockPlayerSession2: PlayerSession;

    beforeEach(() => {
        matchmakingService = new MatchmakingService();
        mockPlayerSession = {
            uuid: 'player1',
            username: 'PlayerOne',
            ws: {} as any,
        };
        mockPlayerSession2 = {
            uuid: 'player2',
            username: 'PlayerTwo',
            ws: {} as any,
        };

        // Reset mocks before each test
        jest.clearAllMocks();
    });

    it('allows a player to join a queue successfully', () => {
        expect(matchmakingService.joinQueue(mockPlayerSession, { gameMode: 'RANK', modeType: 'normal', elo: 1000 })).toBeUndefined();

        // Check if the player's profile is added to the matchmakingProfiles and queues
        const profile = matchmakingService['matchmakingProfiles'].get(mockPlayerSession.uuid);
        expect(profile).toBeDefined();
        expect(profile?.gameMode).toEqual('RANK');
        expect(profile?.modeType).toEqual('normal');
        expect(profile?.elo).toEqual(1000);
    });

    it('prevents a player from joining the queue twice', () => {
        matchmakingService.joinQueue(mockPlayerSession, { gameMode: 'RANK', modeType: 'normal', elo: 1000 });
        expect(() => matchmakingService.joinQueue(mockPlayerSession, { gameMode: 'RANK', modeType: 'normal', elo: 1000 })).toThrowError('Player already in queue.');
    });

    it('allows a player to leave a queue successfully', () => {
        // Add a player to the queue
        matchmakingService.joinQueue(mockPlayerSession, { gameMode: 'RANK', modeType: 'normal', elo: 1000 });

        // Remove the player from the queue
        matchmakingService.leaveQueue(mockPlayerSession.uuid);

        // Check if the player's profile is removed from the matchmakingProfiles and queues
        const profile = matchmakingService['matchmakingProfiles'].get(mockPlayerSession.uuid);
        expect(profile).toBeUndefined();
        const queue = matchmakingService['queues'].get('RANK:normal');
        expect(matchmakingService['queues'].has('RANK:normal')).toBeFalsy();
        expect(matchmakingService['matchmakingProfiles'].has(mockPlayerSession.uuid)).toBeFalsy();
    });

    it('prevents a player from leaving the queue twice', () => {
        matchmakingService.joinQueue(mockPlayerSession, { gameMode: 'RANK', modeType: 'normal', elo: 1000 });
        matchmakingService.leaveQueue(mockPlayerSession.uuid);
        expect(() => matchmakingService.leaveQueue(mockPlayerSession.uuid)).toThrowError('Player not in queue.');
    });

    it('matches players within the ELO range correctly', () => {
        matchmakingService.joinQueue(mockPlayerSession, { gameMode: 'RANK', modeType: 'normal', elo: 1000 });
        const match = matchmakingService.joinQueue(mockPlayerSession2, { gameMode: 'RANK', modeType: 'normal', elo: 1050 });

        expect(match).toEqual(expect.any(Array));
        expect(match).toHaveLength(2);
        expect(match).toContainEqual(expect.objectContaining({ uuid: mockPlayerSession.uuid }));
        expect(match).toContainEqual(expect.objectContaining({ uuid: mockPlayerSession2.uuid }));
    });

    it('keeps players in the queue if no suitable match is found', () => {
        matchmakingService.joinQueue(mockPlayerSession, { gameMode: 'RANK', modeType: 'normal', elo: 1000 });
        expect(matchmakingService['queues'].get('RANK-normal')).toContainEqual(expect.objectContaining({ uuid: mockPlayerSession.uuid }));
    });

    it('handles multiple players joining and matches them as expected', () => {
        const player1 = {uuid: 'player1', username: 'PlayerOne', ws: {} as any};
        const player2 = {uuid: 'player2', username: 'PlayerTwo', ws: {} as any};
        const player3 = {uuid: 'player3', username: 'PlayerThree', ws: {} as any};

        // Add players to the queue
        matchmakingService.joinQueue(player1, {gameMode: 'RANK', modeType: 'normal', elo: 1000});
        matchmakingService.joinQueue(player2, {gameMode: 'RANK', modeType: 'normal', elo: 1050});
        matchmakingService.joinQueue(player3, {gameMode: 'RANK', modeType: 'normal', elo: 1100});

        // Verify that the players are matched as expected
        expect(matchmakingService['queues'].get('RANK-normal')).toHaveLength(1);
        expect(matchmakingService['matchmakingProfiles'].size).toBe(1);
    });
});
