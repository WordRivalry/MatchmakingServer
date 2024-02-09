import WebSocket from 'ws';
import { PlayerSessionStore } from './PlayerSessionStore';
import { MatchmakingQueue } from './MatchmakingQueue';
import { ConnectionManager } from './ConnectionManager';
import config from '../config';

const PORT = Number(process.env.PORT) || 3000;
const BATTLE_SERVER_URL = config.battleServerUrl;

// Create the WebSocket server
const server = new WebSocket.Server({ port: PORT });

// Instantiate the MatchmakingQueue with the URL of the battle server
const matchmakingQueue = new MatchmakingQueue(BATTLE_SERVER_URL);

// Instantiate the PlayerSessionStore with the MatchmakingQueue
const playerSessionStore = new PlayerSessionStore(matchmakingQueue);

// Instantiate the ConnectionManager with the WebSocket server and PlayerSessionStore
new ConnectionManager(server, playerSessionStore);

console.log(`Matchmaking server started on port ${PORT}`);
