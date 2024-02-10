// Index.ts

import { PlayerSessionStore } from './PlayerSessionStore';
import { MatchmakingService } from './MatchmakingService';
import { ConnectionManager } from './ConnectionManager';
import config from '../config';
import {MatchFoundService} from "./MatchFoundService";

const BATTLE_SERVER_URL = config.battleServerUrl;

// Instantiate the PlayerSessionStore
const playerSessionStore: PlayerSessionStore = new PlayerSessionStore();

// Instantiate the CommunicationService
const matchFoundService = new MatchFoundService(playerSessionStore);

// Instantiate the MatchmakingQueue with the PlayerSessionStore
const matchmakingService: MatchmakingService = new MatchmakingService();

// Instantiate the ConnectionManager with the MatchmakingQueue and PlayerSessionStore
const connectionManager: ConnectionManager = new ConnectionManager(
    matchmakingService,
    playerSessionStore,
    matchFoundService
);

// Start the server
connectionManager.listen();
