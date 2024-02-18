// WebSocketCommunicationService.ts
import { PlayerSessionStore } from "./PlayerSessionStore";
import { MatchmakingProfile } from "./MatchmakingService";
import { createScopedLogger } from "./logger/logger";
import config from "../config";
import axios from "axios";


export class MatchFoundService {
    private logger = createScopedLogger('MatchFoundService');

    constructor(private sessionStore: PlayerSessionStore) { }

    public async requestBattleServerSlotFor(profiles: MatchmakingProfile[]): Promise<void> {
        const BATTLE_SERVER_URL = config.battleServerUrl + '/request-alloc';
        const playerMetadata = profiles.map(profile => ({ uuid: profile.uuid, username: profile.username }));
    
        try {
            // Perform a POST request to the battle server
            const response = await axios.post(BATTLE_SERVER_URL, {
                playersMetadata: playerMetadata,
                // TODO: Better Validation
                gameMode: profiles[0].gameMode.toUpperCase(),
                modeType: profiles[0].modeType.toUpperCase(),
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Assuming the battle server responds with a JSON object containing a gameSessionId
            const gameSessionId = response.data.gameSessionId;

            if (gameSessionId) {
                this.notifyPlayersOfMatch(profiles, gameSessionId);
                this.logger.context('requestBattleServerSlotFor').info('Battle server slot requested successfully.', { gameSessionId });
                
                // Close the connection from player
                profiles.forEach(profile => {
                    this.sessionStore.getSession(profile.uuid)?.ws.close(1000,'Match found');
                    this.logger.context('requestBattleServerSlotFor').info('Player ws connection closed.', { playerUUID: profile.uuid, gameSessionId });
                });
                
                // Delete player session from PlayerSessionStore
                profiles.forEach(profile => {
                    this.sessionStore.deleteSession(profile.uuid);
                    this.logger.context('requestBattleServerSlotFor').info('Player sessions deleted.', { playerUUID: profile.uuid, gameSessionId });
                });
            } else {
                // Handle the case where gameSessionId is not present in the response
                this.logger.context('requestBattleServerSlotFor').error('No gameSessionId received from battle server.');
                throw new Error('No gameSessionId received from battle server.');
            }
        } catch (error) {
            // Log the error
            this.logger.context('requestBattleServerSlotFor').error('Error requesting battle server slot.', { error });
            throw error; // Rethrow or handle the error as needed
        }
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
