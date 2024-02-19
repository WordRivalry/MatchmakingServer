// // __tests__/unit/MatchmakingService.test.ts
// import { MatchmakingService } from '../../src/Services/Matchmaking/MatchmakingService';
// import { GameMode, ModeType } from '../../src/Validation/messageTypes';
// import { MatchmakingProfile, MatchmakingProfileManager } from '../../src/Services/Matchmaking/MatchmakingProfileManager';
// import { QueueManager } from '../../src/Services/Matchmaking/QueueManager';
// import { MatchFinder } from '../../src/Services/Matchmaking/MatchFinder';
// import { PlayerSession } from '../../src/Services/PlayerSessionStore';

// jest.mock('../../src/Services/Matchmaking/MatchmakingProfileManager');
// jest.mock('../../src/Services/Matchmaking/QueueManager');
// jest.mock('../../src/Services/Matchmaking/MatchFinder');

// describe('MatchmakingService', () => {
//     let matchmakingService: MatchmakingService;
//     let mockProfileManager: jest.Mocked<MatchmakingProfileManager>;
//     let mockQueueManager: jest.Mocked<QueueManager>;
//     let mockMatchFinder: jest.Mocked<MatchFinder>;

//     beforeEach(() => {
//         // Reset all mocks before each test
//         jest.clearAllMocks();

//         // Re-initialize the MatchmakingService to ensure fresh instances
//         matchmakingService = new MatchmakingService();

//         // Obtain the mock instances
//         mockProfileManager = new MatchmakingProfileManager() as jest.Mocked<MatchmakingProfileManager>;
//         mockQueueManager = new QueueManager() as jest.Mocked<QueueManager>;
//         mockMatchFinder = new MatchFinder(mockQueueManager) as jest.Mocked<MatchFinder>;

//         // Setup the default behavior of mocked methods if necessary
//         mockMatchFinder.findMatch.mockReturnValue(undefined);
//     });

//     const session: PlayerSession = {
//         uuid: 'player-uuid',
//         username: 'player-username',
//         ws: {} as any, // Mock WebSocket as it's not directly used
//     };

//     const joinQueuePayload = {
//         gameMode: GameMode.RANK,
//         modeType: ModeType.NORMAL,
//         elo: 1000,
//     };

//     describe('joinQueue', () => {
//         it('should add a profile and attempt to find a match', () => {
//             matchmakingService.joinQueue(session, joinQueuePayload);

//             expect(mockProfileManager.addProfile).toHaveBeenCalledWith(expect.objectContaining({
//                 uuid: session.uuid,
//                 username: session.username,
//                 gameMode: joinQueuePayload.gameMode,
//                 modeType: joinQueuePayload.modeType,
//                 elo: joinQueuePayload.elo,
//             }));

//             const queueId = `${joinQueuePayload.gameMode}-${joinQueuePayload.modeType}`;
//             expect(mockQueueManager.addToQueue).toHaveBeenCalledWith(expect.anything(), queueId);
//             expect(mockMatchFinder.findMatch).toHaveBeenCalledWith(queueId);
//         });

//         it('should clean up profiles from queue if a match is found', () => {
//             const matchedProfile: MatchmakingProfile = {
//                 uuid: 'matched-uuid',
//                 username: 'matched-username',
//                 gameMode: GameMode.RANK,
//                 modeType: ModeType.NORMAL,
//                 elo: 1050,
//             };

//             mockMatchFinder.findMatch.mockReturnValue([session as any, matchedProfile]);
//             const result = matchmakingService.joinQueue(session, joinQueuePayload);
//             expect(result).toEqual([session as any, matchedProfile]);

//             const queueId = `${joinQueuePayload.gameMode}-${joinQueuePayload.modeType}`;
//             expect(mockQueueManager.setQueue).toHaveBeenCalledWith(queueId, expect.any(Array));
//             expect(mockProfileManager.removeProfile).toHaveBeenCalledTimes(2);
//         });
//     });

//     describe('leaveQueue', () => {
//         it('should remove a profile from the queue and profile manager', () => {
//             matchmakingService.leaveQueue(session.uuid);

//             const queueId = `${joinQueuePayload.gameMode}-${joinQueuePayload.modeType}`;
//             expect(mockQueueManager.getQueue).toHaveBeenCalledWith(queueId);
//             expect(mockProfileManager.removeProfile).toHaveBeenCalledWith(session.uuid);
//         });
//     });
// });
