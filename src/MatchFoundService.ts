// WebSocketCommunicationService.ts
import { PlayerSessionStore } from "./PlayerSessionStore";
import {MatchmakingProfile} from "./MatchmakingService";
import {createScopedLogger} from "./logger/logger";

export class MatchFoundService {
    private logger = createScopedLogger('WebSocketCommunicationService');

    constructor(private sessionStore: PlayerSessionStore) {}

    public async requestBattleServerSlotFor(profiles: MatchmakingProfile[]): Promise<void> {
        // https request to battle server for rss allocation, wait for good response then call notifyPlayersOfMatch

        // Simulate a successful response
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.notifyPlayersOfMatch(profiles, "gameSessionId");
    }

    private notifyPlayersOfMatch(profiles: MatchmakingProfile[], gameSessionId: string): void {

        for (const profile of profiles) {
            this.sendMessage(profile.uuid, {
                type: 'MATCH_FOUND',
                payload: {
                    gameSessionId,
                    opponent: profiles.find(p => p.uuid !== profile.uuid)
                }
            });
        }

        this.logger.context('notifyPlayersOfMatch').info('Notified players of match.', { gameSessionId });
    }

    private sendMessage(uuid: string, message: object): void {
        const session = this.sessionStore.getSession(uuid);
        if (session) {
            session.ws.send(JSON.stringify(message));
        }
    }
}
