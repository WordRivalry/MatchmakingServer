import { MatchmakingProfile } from "./MatchmakingProfileManager";
import { QueueManager } from "./QueueManager";

export class MatchFinder {

    constructor(private queueManager: QueueManager) {}

    findMatch(queueId: string): [MatchmakingProfile, MatchmakingProfile] | undefined {
        const queue = this.queueManager.getQueue(queueId);
        if (!queue || queue.length < 2) return;

        let i = 0;
        while (i < queue.length) {
            const initiatingProfile = queue[i];
            const matchIndex = this.findMatchIndex(queue, initiatingProfile, i + 1);

            if (matchIndex !== -1) {
                const matchedProfile = queue[matchIndex];

                // Return the matched players
                return [initiatingProfile, matchedProfile];
            } else {
                i++; // No match found, move to the next player in the queue
            }
        }

        return;
    }

    private findMatchIndex(queue: MatchmakingProfile[], initiatingProfile: MatchmakingProfile, startIndex: number): number {
        for (let i = startIndex; i < queue.length; i++) {
            const potentialMatchProfile = queue[i];
            if (Math.abs(initiatingProfile.elo - potentialMatchProfile.elo) <= 500) {
                return i; // Found a suitable match
            }
        }
        return -1; // No match found
    }
}
