// Index.ts
import { PlayerSessionStore } from './PlayerSessionStore';
import { MatchmakingService } from './MatchmakingService';
import { ConnectionManager } from './ConnectionManager';
import { MatchFoundService } from "./MatchFoundService";

// Instantiate the PlayerSessionStore
const playerSessionStore: PlayerSessionStore = new PlayerSessionStore();

// Instantiate the CommunicationService
const matchFoundService: MatchFoundService = new MatchFoundService(playerSessionStore);

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
