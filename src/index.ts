// Index.ts
import { PlayerSessionStore } from './Services/PlayerSessionStore';
import { MatchmakingService } from './Services/Matchmaking/MatchmakingService';
import { ConnectionManager } from './ConnectionManager';
import { MatchFoundService } from "./Services/MatchFoundService";
import { WebSocketEventHandler } from "./Services/WebSocketEventHandler";

// Instantiate the PlayerSessionStore
const playerSessionStore: PlayerSessionStore = new PlayerSessionStore();

// Instantiate the CommunicationService
const matchFoundService: MatchFoundService = new MatchFoundService(playerSessionStore);

// Instantiate the MatchmakingQueue with the PlayerSessionStore
const matchmakingService: MatchmakingService = new MatchmakingService();

// Instantiate the MessageHandler with the MatchmakingQueue and PlayerSessionStore
const messageHandler: WebSocketEventHandler = new WebSocketEventHandler(matchmakingService, playerSessionStore, matchFoundService);

// Instantiate the ConnectionManager with the MatchmakingQueue and PlayerSessionStore
const connectionManager: ConnectionManager = new ConnectionManager(messageHandler);

// Start the server
connectionManager.listen();
