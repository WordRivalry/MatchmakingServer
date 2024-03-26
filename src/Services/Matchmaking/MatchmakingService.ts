// MatchmakingService.ts
import { PlayerSession } from "../PlayerSessionStore";
import { GameMode, JoinQueuePayload, ModeType } from "../../Validation/messageTypes";
import { MatchmakingProfile, MatchmakingProfileManager } from "./MatchmakingProfileManager";
import { QueueManager } from "./QueueManager";
import { MatchFinder } from "./MatchFinder";

export class MatchmakingService {
    private profileManager = new MatchmakingProfileManager();
    private queueManager = new QueueManager();
    private matchFinder = new MatchFinder(this.queueManager);

    public joinQueue(session: PlayerSession, { gameMode, modeType, elo }: JoinQueuePayload): [MatchmakingProfile, MatchmakingProfile] | undefined{
        const profile: MatchmakingProfile = {
            uuid: session.uuid,
            playerName: session.playerName,
            gameMode,
            modeType,
            elo
        };

        this.profileManager.addProfile(profile);
        const queueId = this.computeQueueId(gameMode, modeType);
        this.queueManager.addToQueue(profile, queueId);

        // Attempt to find a match
        const results = this.matchFinder.findMatch(queueId);

        if (results) {
            // clean up the queue and profiles
            this.removeProfilesFromQueueAndCleanUp(queueId, results.map(p => p.uuid));
            return results;
        }

        return;
    }

    public leaveQueue(uuid: string): void {
        const profile = this.profileManager.getProfile(uuid);
        const queueId = this.computeQueueId(profile.gameMode, profile.modeType);
        const queue = this.queueManager.getQueue(queueId);
        if (queue) {
            this.queueManager.setQueue(queueId, queue.filter(p => p.uuid !== uuid));
        }

        this.profileManager.removeProfile(uuid);
    }

    public isProfileInQueue(uuid: string): boolean {
        return this.profileManager.isProfileInQueue(uuid);
    }

    private computeQueueId(gameMode: GameMode, modeType: ModeType): string {
        return `${gameMode}-${modeType}`;
    }

    private removeProfilesFromQueueAndCleanUp(queueId: string, uuids: string[]): void {
        const queue = this.queueManager.getQueue(queueId);
        if (!queue) return;

        // Filter out matched profiles from the queue
        this.queueManager.setQueue(queueId, queue.filter(profile => !uuids.includes(profile.uuid)));

        // Clean up matchmaking profiles
        uuids.forEach(uuid => {
            this.leaveQueue(uuid);
        });
    }
}
