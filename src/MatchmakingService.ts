// MatchmakingService.ts
import { PlayerSession } from "./PlayerSessionStore";
import { createScopedLogger } from "./logger/logger";

export type GameMode = 'RANK' | 'QUICK_DUEL';
export type ModeType = 'normal' | 'blitz';

export interface MatchmakingProfile {
    uuid: string;
    gameMode: GameMode;
    modeType: ModeType;
    elo: number;
}

export class MatchmakingService {
    private matchmakingProfiles: Map<string, MatchmakingProfile> = new Map();
    private queues: Map<string, MatchmakingProfile[]> = new Map();
    private logger = createScopedLogger('MatchmakingService');

    public joinQueue(session: PlayerSession, { gameMode, modeType, elo }: { gameMode: GameMode; modeType: ModeType; elo: number }): [MatchmakingProfile, MatchmakingProfile] | undefined{
        const profile: MatchmakingProfile = { uuid: session.uuid, gameMode, modeType, elo };

        // Validate that the player is not already in the queue
        if (this.matchmakingProfiles.has(session.uuid)) {
            this.logger.context('joinQueue').warn('Player already in queue.', { playerUUID: session.uuid });
            throw new Error('Player already in queue.');
        }

        this.matchmakingProfiles.set(session.uuid, profile); // Store the matchmaking profile

        // Create a queue identifier based on gameMode and modeType
        const queueId = this.computeQueueId(profile.gameMode, profile.modeType);
        if (!this.queues.has(queueId)) {
            this.queues.set(queueId, []);
        }

        // Add the profile to the appropriate queue
        this.queues.get(queueId)?.push(profile);

        this.logger.context('joinQueue').debug(`Player joined the queue.`, { playerUUID: session.uuid, gameMode, modeType, elo });

        return this.tryMatch(queueId);
    }

    public leaveQueue(uuid: string): void {
        const profile = this.matchmakingProfiles.get(uuid);
        if (!profile) {
            this.logger.context('leaveQueue').warn('Player not in queue.', { playerUUID: uuid });
            throw new Error('Player not in queue.');
        }

        const queueId = this.computeQueueId(profile.gameMode, profile.modeType);
        const queue = this.queues.get(queueId);
        if (queue) {
            this.queues.set(queueId, queue.filter(p => p.uuid !== uuid));
        }

        this.matchmakingProfiles.delete(uuid); // Clean up the matchmaking profile

        this.logger.context('leaveQueue').debug(`Player left the queue.`, { playerUUID: uuid, gameMode: profile.gameMode, modeType: profile.modeType });
    }

    private computeQueueId(gameMode: GameMode, modeType: ModeType): string {
        return `${gameMode}-${modeType}`;
    }

    private tryMatch(queueId: string):  [MatchmakingProfile, MatchmakingProfile] | undefined {
        const queue = this.queues.get(queueId);
        if (!queue || queue.length < 2) return;

        let i = 0;
        while (i < queue.length) {
            const initiatingProfile = queue[i];
            const matchIndex = this.findMatchIndex(queue, initiatingProfile, i + 1);

            if (matchIndex !== -1) {
                const matchedProfile = queue[matchIndex];

                this.logger.context('tryMatch').debug(`Match found.`, { player1: initiatingProfile.uuid, player2: matchedProfile.uuid });

                // Remove both players from the matchmaking queue and profiles
                this.removeProfilesFromQueueAndCleanUp(queueId, [initiatingProfile.uuid, matchedProfile.uuid]);

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

    private removeProfilesFromQueueAndCleanUp(queueId: string, uuids: string[]): void {
        const queue = this.queues.get(queueId);
        if (!queue) return;

        // Filter out matched profiles from the queue
        this.queues.set(queueId, queue.filter(profile => !uuids.includes(profile.uuid)));

        // Clean up matchmaking profiles
        uuids.forEach(uuid => {
            this.leaveQueue(uuid);
        });
    }

    handlePlayerDisconnect(uuid: string): void {
        // Handle player disconnection
        this.leaveQueue(uuid);

        this.logger.context('handlePlayerDisconnect').debug(`Player disconnected.`, { playerUUID: uuid });
    }
}
