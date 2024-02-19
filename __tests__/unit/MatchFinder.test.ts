// __tests__/unit/MatchFinder.test.ts
import { MatchFinder } from '../../src/Services/Matchmaking/MatchFinder';
import { QueueManager } from '../../src/Services/Matchmaking/QueueManager';
import { MatchmakingProfile } from '../../src/Services/Matchmaking/MatchmakingProfileManager';
import { GameMode, ModeType } from '../../src/Validation/messageTypes';

jest.mock('../../src/logger/logger');

describe('MatchFinder', () => {
    let matchFinder: MatchFinder;
    let queueManager: QueueManager;

    beforeEach(() => {
        queueManager = new QueueManager();
        matchFinder = new MatchFinder(queueManager);
    });

    const profile1: MatchmakingProfile = {
        uuid: 'uuid1',
        username: 'user1',
        gameMode: GameMode.RANK,
        modeType: ModeType.NORMAL,
        elo: 1000,
    };

    const profile2: MatchmakingProfile = {
        uuid: 'uuid2',
        username: 'user2',
        gameMode: GameMode.RANK,
        modeType: ModeType.NORMAL,
        elo: 1500, // Within 500 ELO of profile1
    };

    const profile3: MatchmakingProfile = {
        uuid: 'uuid3',
        username: 'user3',
        gameMode: GameMode.RANK,
        modeType: ModeType.NORMAL,
        elo: 2500, // Not within 500 ELO of profile1 or profile2
    };

    describe('findMatch', () => {
        it('should return undefined if the queue does not exist or has less than 2 profiles', () => {
            expect(matchFinder.findMatch('nonexistent-queue')).toBeUndefined();
            queueManager.addToQueue(profile1, 'small-queue');
            expect(matchFinder.findMatch('small-queue')).toBeUndefined();
        });

        it('should find a match for profiles within 500 ELO difference', () => {
            queueManager.addToQueue(profile1, 'test-queue');
            queueManager.addToQueue(profile2, 'test-queue');
            const match = matchFinder.findMatch('test-queue');
            expect(match).toEqual([profile1, profile2]);
        });

        it('should not find a match if no profiles are within 500 ELO difference', () => {
            queueManager.addToQueue(profile1, 'difficult-queue');
            queueManager.addToQueue(profile3, 'difficult-queue');
            const match = matchFinder.findMatch('difficult-queue');
            expect(match).toBeUndefined();
        });
    });
});
