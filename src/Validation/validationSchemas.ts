// validationSchemas.ts
import Joi from 'joi';
import { GameMode, JoinQueuePayload, ModeType, ActionType, WebSocketAction, JoinQueueAction, LeaveQueueAction } from './messageTypes';

export const actionFormatSchema = Joi.object<WebSocketAction>({
  type: Joi.string().valid(...Object.values(ActionType)).required(),
  payload: Joi.object(),
});

export const joinQueueActionSchema = Joi.object<JoinQueueAction>({
  type: Joi.string().valid(ActionType.JOIN_QUEUE).required(),
  payload: {
    gameMode: Joi.string().valid(...Object.values(GameMode)).required(),
    modeType: Joi.string().valid(...Object.values(ModeType)).required(),
    elo: Joi.number().integer().min(0).required(),
  }
});

export const leaveQueueActionSchema = Joi.object<LeaveQueueAction>({
  type: Joi.string().valid(ActionType.LEAVE_QUEUE).required(),
});
  
export const joinQueuePayloadSchema = Joi.object<JoinQueuePayload>({
  gameMode: Joi.string().valid(...Object.values(GameMode)).required(),
  modeType: Joi.string().valid(...Object.values(ModeType)).required(),
  elo: Joi.number().integer().min(0).required(),
});