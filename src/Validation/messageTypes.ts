// messageTypes.ts

export enum GameMode {
  RANK = 'RANK',
  QUICK_DUEL = 'QUICK_DUEL',
}

export enum ModeType {
  NORMAL = 'NORMAL',
  BLITZ = 'BLITZ',
}

export enum ActionType {
  JOIN_QUEUE = 'joinQueue',
  LEAVE_QUEUE = 'leaveQueue',
}

// Generic WebSocket action
export interface WebSocketAction {
  type: ActionType;
  payload?: JoinQueuePayload;
}

// Join queue action
export interface JoinQueueAction {
  type: ActionType.JOIN_QUEUE;
  payload: JoinQueuePayload;
}

export interface JoinQueuePayload {
  gameMode: GameMode;
  modeType: ModeType;
  elo: number;
}

// Leave queue action
export interface LeaveQueueAction {
  type: ActionType.LEAVE_QUEUE;
}


