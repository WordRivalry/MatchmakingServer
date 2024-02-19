// Index.ts
import { PlayerSessionStore } from './Services/PlayerSessionStore';
import { MatchmakingService } from './Services/Matchmaking/MatchmakingService';
import { ConnectionManager } from './ConnectionManager';
import { MatchFoundService } from "./Services/MatchFoundService";
import { WebSocketEventHandler } from "./Services/WebSocketEventHandler";

const playerSessionStore: PlayerSessionStore = new PlayerSessionStore();
const matchFoundService: MatchFoundService = new MatchFoundService(playerSessionStore);
const matchmakingService: MatchmakingService = new MatchmakingService();
const messageHandler: WebSocketEventHandler = new WebSocketEventHandler(
    matchmakingService, 
    playerSessionStore, 
    matchFoundService
);
const connectionManager: ConnectionManager = new ConnectionManager(messageHandler);

// Start the server
connectionManager.listen();
