// CustomErrors.ts

import Joi from "joi";
import WebSocket from 'ws';
import { createScopedLogger } from "../logger/logger";

export class ErrorHandlingService {

  static logger = createScopedLogger('ErrorHandlingService');

  static sendError(ws: WebSocket, error: any) {
    if (error instanceof CustomError) {
      const message = error.toWebSocketMessage();
      ErrorHandlingService.logger.context(error.name).error(message, { error });
      ws.send(message);
      return;
    } else {
      ws.send(JSON.stringify({ type: 'error', code: 1008, message: 'An unexpected error occurred', error }));
    }
  }
}

export class CustomError extends Error {
  public statusCode: number;
  public cause?: string;

  constructor(message: string, statusCode: number, cause?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.cause = cause;
    Error.captureStackTrace(this, this.constructor);
  }

  public toWebSocketMessage() {
    return JSON.stringify(this.sanetizedData());
  }

  private sanetizedData() {
    return {
      type: this.errorType,
      statusCode: this.statusCode,
      message: this.message
    };
  }

  protected get errorType() {
    return 'Custom Error';
  }
}

export class InvalidJsonError extends CustomError {
  constructor(error?: any) {
    super(error?.message || 'Invalid JSON', 2000);
  }
}

// SESSION ERRORS

export class SessionError extends CustomError {
  
  constructor(message: string, statusCode: number, cause?: string) {
    super(message, statusCode, cause);
  }

  override get errorType() {
    return 'Session Error';
  }
}

export class SessionNotFoundError extends SessionError {
  constructor() {
    super('Session not found', 3000);
  }
}

export class SessionDeletionFailed extends SessionError {
  constructor() {
    super('Session cannot be removed since it does not exist', 3001);
  }
}

export class SessionCreationFailed extends SessionError {
  constructor() {
    super('Session cannot be created', 3002);
  }
}

// VALIDATION ERRORS

export class ValidationError extends CustomError {
  constructor(message: string, statusCode: number, cause?: string) {
    super(message, statusCode, cause);
  }
}

export class ValidationFailedError extends ValidationError {
  constructor() {
    super('Validation failed', 2000);
  }
}

export class InvalidActionFormatError extends ValidationError {
  constructor(error: Joi.ValidationError) {
    super(error.message, 2001);
  }
}

export class InvalidJoinQueueActionError extends ValidationError {
  constructor(error: Joi.ValidationError) {
    super(error.message, 2002);
  }
}

export class InvalidLeaveQueueActionError extends ValidationError {
  constructor(error: Joi.ValidationError) {
    super(error.message, 2003);
  }
}

// MATCHMAKING ERRORS

export class MatchmakingError extends CustomError {
  constructor(message: string, statusCode: number, cause?: string) {
    super(message, statusCode, cause);
  }
}

export class MatchmakingProfileNotFoundError extends MatchmakingError {
  constructor() {
    super('Matchmaking profile not found', 4000);
  }
}

export class MatchmakingProfileCreationError extends MatchmakingError {
  constructor() {
    super('Matchmaking profile cannot be created', 4001);
  }
}

export class MatchmakingProfileDeletionError extends MatchmakingError {
  constructor() {
    super('Matchmaking profile cannot be removed since it does not exist', 4002);
  }
}

export class MatchmakingProfileAlreadyInQueueError extends MatchmakingError {
  constructor() {
    super('Matchmaking profile already in queue', 4003);
  }
}

export class BattleServerSlotRequestError extends MatchmakingError {
  constructor(error: any) {
    if (error instanceof Error) {
      super(error.message, 4004);
    } else {
      super('Error requesting battle server slot', 4004);
    }
  }
}