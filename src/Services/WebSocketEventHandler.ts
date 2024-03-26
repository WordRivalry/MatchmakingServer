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

  public handleConnection(ws: WebSocket, playerUUID: string, playerName: string): void {
    this.playerSessionStore.createSession(playerUUID, playerName, ws);
    this.sendSuccessMessage(ws, 'CONNECTION_SUCCESS');
  }

  public handleDisconnect(ws: WebSocket, playerUUID: string | undefined): void {
    if (playerUUID) {
      // Check if the player is in the queue and remove them
      if (this.matchmakingService.isProfileInQueue(playerUUID)) {
        this.matchmakingService.leaveQueue(playerUUID);
      }

      if (this.playerSessionStore.hasSession(playerUUID)) {
        this.playerSessionStore.deleteSession(playerUUID);
      }
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
    this.sendSuccessMessage(ws, 'JOIN_QUEUE_SUCCESS');
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
    this.sendSuccessMessage(ws, 'LEFT_QUEUE_SUCCESS');
  }

  private sendSuccessMessage(ws: WebSocket, type: string): void {
    this.sendMessage(ws, { type });
  }

  private sendMessage(ws: WebSocket, message: object): void {
    ws.send(JSON.stringify(message));
  }
}
