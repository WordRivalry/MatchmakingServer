// /ProfileManager.ts

import { MatchmakingProfileAlreadyInQueueError, MatchmakingProfileDeletionError, MatchmakingProfileNotFoundError } from "../../Error/Errors";
import { GameMode, ModeType } from "../../Validation/messageTypes";

export interface MatchmakingProfile {
    uuid: string;
    playerName: string;
    gameMode: GameMode;
    modeType: ModeType;
    elo: number;
}

export class MatchmakingProfileManager {
    private profiles: Map<string, MatchmakingProfile> = new Map();

    addProfile(profile: MatchmakingProfile): void {
        if (this.profiles.has(profile.uuid)) {
            throw new MatchmakingProfileAlreadyInQueueError();
        }
        this.profiles.set(profile.uuid, profile);
    }

    removeProfile(uuid: string): void {
        const profile = this.profiles.get(uuid);
        if (!profile) {
            throw new MatchmakingProfileDeletionError();
        }
        this.profiles.delete(uuid);
    }

    getProfile(uuid: string): MatchmakingProfile {
        const profile = this.profiles.get(uuid);
        if (!profile) {
            throw new MatchmakingProfileNotFoundError();
        }
        return profile;
    }

    isProfileInQueue(uuid: string): boolean {
        return this.profiles.has(uuid);
    }
}
