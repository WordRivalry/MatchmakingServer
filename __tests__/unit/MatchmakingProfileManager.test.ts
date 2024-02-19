// __tests__/unit/ProfileManager.test.ts
import { MatchmakingProfileAlreadyInQueueError, MatchmakingProfileNotFoundError, MatchmakingProfileDeletionError } from '../../src/Error/Errors';
import { MatchmakingProfile, MatchmakingProfileManager } from '../../src/Services/Matchmaking/MatchmakingProfileManager';
import { GameMode, ModeType } from '../../src/Validation/messageTypes';

describe('MatchmakingProfileManager', () => {
    let profileManager: MatchmakingProfileManager;
    let testProfile: MatchmakingProfile;

    beforeEach(() => {
        profileManager = new MatchmakingProfileManager();
        testProfile = {
            uuid: 'test-uuid',
            username: 'test-user',
            gameMode: GameMode.RANK,
            modeType: ModeType.NORMAL,
            elo: 1000,
        };
    });

    describe('addProfile', () => {
        it('should successfully add a profile', () => {
            expect(() => profileManager.addProfile(testProfile)).not.toThrow();
            expect(profileManager.getProfile(testProfile.uuid)).toEqual(testProfile);
        });

        it('should throw MatchmakingProfileAlreadyInQueueError if profile with uuid already exists', () => {
            profileManager.addProfile(testProfile);
            expect(() => profileManager.addProfile(testProfile)).toThrow(MatchmakingProfileAlreadyInQueueError);
        });
    });

    describe('removeProfile', () => {
        it('should successfully remove an existing profile', () => {
            profileManager.addProfile(testProfile);
            expect(() => profileManager.removeProfile(testProfile.uuid)).not.toThrow();
            expect(() => profileManager.getProfile(testProfile.uuid)).toThrow(MatchmakingProfileNotFoundError);
        });

        it('should throw MatchmakingProfileDeletionError if trying to remove a non-existent profile', () => {
            const nonExistentUuid = 'non-existent-uuid';
            expect(() => profileManager.removeProfile(nonExistentUuid)).toThrow(MatchmakingProfileDeletionError);
        });
    });

    describe('getProfile', () => {
        it('should retrieve an existing profile', () => {
            profileManager.addProfile(testProfile);
            const profile = profileManager.getProfile(testProfile.uuid);
            expect(profile).toEqual(testProfile);
        });

        it('should throw MatchmakingProfileNotFoundError if profile does not exist', () => {
            const nonExistentUuid = 'non-existent-uuid';
            expect(() => profileManager.getProfile(nonExistentUuid)).toThrow(MatchmakingProfileNotFoundError);
        });
    });
});
