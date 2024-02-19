import { MatchmakingProfile } from "./MatchmakingProfileManager";

export class QueueManager {
    private queues: Map<string, MatchmakingProfile[]> = new Map();

    addToQueue(profile: MatchmakingProfile, queueId: string): void {
        if (!this.queues.has(queueId)) {
            this.queues.set(queueId, []);
        }
        this.queues.get(queueId)?.push(profile);
    }

    removeFromQueue(queueId: string, uuid: string): void {
        const queue = this.queues.get(queueId);
        if (queue) {
            this.queues.set(queueId, queue.filter(p => p.uuid !== uuid));
        }
    }

    getQueue(queueId: string): MatchmakingProfile[] | undefined {
        return this.queues.get(queueId);
    }

    setQueue(queueId: string, queue: MatchmakingProfile[]): void {
        this.queues.set(queueId, queue);
    }
}
