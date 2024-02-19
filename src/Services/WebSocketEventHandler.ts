// WebSocketMessageHandler.ts
import { WebSocket, RawData } from 'ws';
import { PlayerSessionStore, PlayerSession } from "./PlayerSessionStore";
import { MatchmakingService } from './Matchmaking/MatchmakingService';
import { MatchFoundService } from "./MatchFoundService";
import { IMessageHandler as IWebSocketEventHandler } from "../ConnectionManager";
import { createScopedLogger } from '../logger/logger';
import { ActionType, JoinQueueAction, JoinQueuePayload, LeaveQueueAction } from '../Validation/messageTypes';
import { BattleServerSlotRequestError } from '../Error/Errors';
import { MessageParsingService } from './MessageParsingService';

export class WebSocketEventHandler implements IWebSocketEventHandler {
  private logger = createScopedLogger('WebSocketMessageHandler');

  constructor(
    private matchmakingService: MatchmakingService,
    private playerSessionStore: PlayerSessionStore,
    private matchFoundService: MatchFoundService
  ) { }

  public handleConnection(ws: WebSocket, playerUUID: string, playerUsername: string): void {
    this.playerSessionStore.createSession(playerUUID, playerUsername, ws);
    this.sendSuccessMessage(ws, 'Connected successfully');
  }

  public handleDisconnect(ws: WebSocket, playerUUID: string | undefined): void {
    if (playerUUID) {
      this.matchmakingService.leaveQueue(playerUUID);
      this.playerSessionStore.deleteSession(playerUUID);
    }
  }

  public handleMessage(ws: WebSocket, message: RawData, playerUUID: string): void {
    const session: PlayerSession = this.playerSessionStore.getSession(playerUUID);
    const parsedAction: JoinQueueAction | LeaveQueueAction = MessageParsingService.parseAndValidateMessage(message);

    switch (parsedAction.type) {
      case ActionType.JOIN_QUEUE:
        this.handlePlayerJoinQueue(ws, session, parsedAction.payload);
        break;
      case ActionType.LEAVE_QUEUE:
        this.handlePlayerLeaveQueue(ws, playerUUID);
        break;
    }
  }

  private handlePlayerJoinQueue(ws: WebSocket, session: PlayerSession, payload: JoinQueuePayload): void {
    const results = this.matchmakingService.joinQueue(session, payload);
    this.sendSuccessMessage(ws, 'Joined queue successfully');
    if (results) {
      this.matchFoundService.requestBattleServerSlotFor(results)
        .then(() => this.logger.context("handlePlayerJoinQueue").info('Match found and notified players', { player1: results[0].uuid, player2: results[1].uuid }))
        .catch((error) => {
          throw new BattleServerSlotRequestError(error);
        });
    }
  }

  private handlePlayerLeaveQueue(ws: WebSocket, playerUUID: string): void {
    this.matchmakingService.leaveQueue(playerUUID);
    this.sendSuccessMessage(ws, 'Left queue successfully');
  }

  private sendSuccessMessage(ws: WebSocket, message: string): void {
    this.sendMessage(ws, { type: 'success', message });
  }

  private sendMessage(ws: WebSocket, message: object): void {
    ws.send(JSON.stringify(message));
  }
}
