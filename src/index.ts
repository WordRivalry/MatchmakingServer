// Index.ts
import { PlayerSessionStore } from './PlayerSessionStore';
import { MatchmakingService } from './MatchmakingService';
import { ConnectionManager } from './ConnectionManager';
import { MatchFoundService } from "./MatchFoundService";
import {WebSocketMessageHandler} from "./WebSocketMessageHandler";

// Instantiate the PlayerSessionStore
const playerSessionStore: PlayerSessionStore = new PlayerSessionStore();

// Instantiate the CommunicationService
const matchFoundService: MatchFoundService = new MatchFoundService(playerSessionStore);

// Instantiate the MatchmakingQueue with the PlayerSessionStore
const matchmakingService: MatchmakingService = new MatchmakingService();

// Instantiate the MessageHandler with the MatchmakingQueue and PlayerSessionStore
const messageHandler: WebSocketMessageHandler = new WebSocketMessageHandler(matchmakingService, playerSessionStore, matchFoundService);

// Instantiate the ConnectionManager with the MatchmakingQueue and PlayerSessionStore
const connectionManager: ConnectionManager = new ConnectionManager(messageHandler);

// Start the server
connectionManager.listen();
