// ConnectionManager.ts
import http, { createServer } from 'http';
import express from 'express';
import cors from "cors";
import { WebSocket, WebSocketServer, RawData } from 'ws';
import { createScopedLogger } from './logger/logger';
import config from "../config";
import { ErrorHandlingService } from './Error/Errors';

export interface IMessageHandler {
 handleConnection(ws: WebSocket, playerUUID: string, username: string): void;
 handleMessage(ws: WebSocket, message: RawData, playerUUID: string): void;
 handleDisconnect(ws: WebSocket, playerUUID: string | undefined): void;
}

export class ConnectionManager {
 private readonly app: express.Application;
 private server: http.Server;
 private wss: WebSocketServer;
 private logger = createScopedLogger('ConnectionManager');

 constructor(private messageHandler: IMessageHandler) {
  this.app = express();
  this.app.use(cors());
  this.server = createServer(this.app);
  this.wss = new WebSocketServer({ noServer: true });
  this.setupUpgradeHandler();
  this.setupWebSocketServer();
 }

 public listen(): void {
  const PORT = process.env.PORT || 8079;
  this.server.listen(PORT, () => {
   this.logger.context("listen").info(`Server is listening on port ${PORT}`);
  });
 }

 private setupUpgradeHandler(): void {
  this.server.on('upgrade', (request, socket, head) => {
   this.logger.context("setupUpgradeHandler").info('Upgrade request received');

   const apiKey = request.headers['x-api-key'] as string | undefined;

   const playerUUID = request.headers['x-player-uuid'] as string | undefined;
   const playerUsername = request.headers['x-player-username'] as string | undefined;

   if (!playerUUID || !playerUsername) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
   }

   if (!this.isValidApiKey(apiKey)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
   }

   this.wss.handleUpgrade(request, socket, head, (ws) => {
    this.wss.emit('connection', ws, request);
   });
  });
 }

 private isValidApiKey(apiKey: string | undefined): boolean {
  const VALID_API_KEY = config.upgradeApiKey;
  return apiKey === VALID_API_KEY;
 }

 private setupWebSocketServer(): void {
  this.wss.on('connection', (ws, request) => {
   const playerUUID = request.headers['x-player-uuid'] as string;
   const playerUsername = request.headers['x-player-username'] as string;
   this.messageHandler.handleConnection(ws, playerUUID, playerUsername);

   ws.on('message', (message) => {
    try {
        this.messageHandler.handleMessage(ws, message, playerUUID);
    } catch (error) {
        ErrorHandlingService.sendError(ws, error);
    }
   });

   ws.on('close', () => {
    this.messageHandler.handleDisconnect(ws, playerUUID);
   });
  });
 }
}
