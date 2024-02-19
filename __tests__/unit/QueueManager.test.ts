// __tests__/unit/QueueManager.test.ts
import { QueueManager } from '../../src/Services/Matchmaking/QueueManager';
import { MatchmakingProfile } from '../../src/Services/Matchmaking/MatchmakingProfileManager';
import { GameMode, ModeType } from '../../src/Validation/messageTypes';

describe('QueueManager', () => {
    let queueManager: QueueManager;
    let testProfile: MatchmakingProfile;
    let queueId: string;

    beforeEach(() => {
        queueManager = new QueueManager();
        queueId = 'test-queue';
        testProfile = {
            uuid: 'test-uuid',
            username: 'test-user',
            gameMode: GameMode.RANK,
            modeType: ModeType.NORMAL,
            elo: 1000,
        };
    });

    describe('addToQueue', () => {
        it('should add a profile to an empty queue', () => {
            queueManager.addToQueue(testProfile, queueId);
            const queue = queueManager.getQueue(queueId);
            expect(queue).toContainEqual(testProfile);
        });

        it('should add a profile to an existing queue', () => {
            // Add initial profile
            queueManager.addToQueue(testProfile, queueId);

            // Add another profile
            const anotherProfile = { ...testProfile, uuid: 'another-uuid' };
            queueManager.addToQueue(anotherProfile, queueId);

            const queue = queueManager.getQueue(queueId);
            expect(queue).toContainEqual(testProfile);
            expect(queue).toContainEqual(anotherProfile);
        });
    });

    describe('removeFromQueue', () => {
        it('should remove a profile from the queue', () => {
            // Add two profiles
            queueManager.addToQueue(testProfile, queueId);
            const anotherProfile = { ...testProfile, uuid: 'another-uuid' };
            queueManager.addToQueue(anotherProfile, queueId);

            // Remove one profile
            queueManager.removeFromQueue(queueId, testProfile.uuid);

            const queue = queueManager.getQueue(queueId);
            expect(queue).not.toContainEqual(testProfile);
            expect(queue).toContainEqual(anotherProfile);
        });

        it('should do nothing if queue does not exist', () => {
            expect(() => queueManager.removeFromQueue('nonexistent-queue', 'nonexistent-uuid')).not.toThrow();
        });
    });

    describe('getQueue', () => {
        it('should return undefined for a non-existent queue', () => {
            const queue = queueManager.getQueue('nonexistent-queue');
            expect(queue).toBeUndefined();
        });

        it('should return a queue if it exists', () => {
            queueManager.addToQueue(testProfile, queueId);
            const queue = queueManager.getQueue(queueId);
            expect(queue).toContainEqual(testProfile);
        });
    });

    describe('setQueue', () => {
        it('should set a new queue', () => {
            const newQueue = [testProfile];
            queueManager.setQueue(queueId, newQueue);
            const queue = queueManager.getQueue(queueId);
            expect(queue).toEqual(newQueue);
        });

        it('should overwrite an existing queue', () => {
            // Add a profile to the queue
            queueManager.addToQueue(testProfile, queueId);

            // Overwrite with a new queue
            const anotherProfile = { ...testProfile, uuid: 'another-uuid' };
            const newQueue = [anotherProfile];
            queueManager.setQueue(queueId, newQueue);

            const queue = queueManager.getQueue(queueId);
            expect(queue).toEqual(newQueue);
        });
    });
});
