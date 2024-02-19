// MessageParsingService.ts
import { RawData } from 'ws';
import { joinQueueActionSchema, actionFormatSchema, leaveQueueActionSchema } from '../Validation/validationSchemas';
import { ActionType, JoinQueueAction, LeaveQueueAction, WebSocketAction } from '../Validation/messageTypes';
import { InvalidActionFormatError, InvalidJoinQueueActionError, InvalidJsonError, InvalidLeaveQueueActionError, ValidationFailedError } from '../Error/Errors';

export class MessageParsingService {
  public static parseAndValidateMessage(message: RawData): JoinQueueAction | LeaveQueueAction {
    const json = this.messageToJSON(message);

    const actionFormatValidation = actionFormatSchema.validate(json, { allowUnknown: false });
    if (actionFormatValidation.error) {
      throw new InvalidActionFormatError(actionFormatValidation.error);
    }

    const action: WebSocketAction = actionFormatValidation.value;
    return this.validateAction(action);
  }

  private static messageToJSON(message: RawData): any {
    try {
      return JSON.parse(message.toString());
    } catch (error) {
      throw new InvalidJsonError(error);
    }
  }

  private static validateAction(action: WebSocketAction): JoinQueueAction | LeaveQueueAction {
    switch (action.type) {
      case ActionType.JOIN_QUEUE:
        return this.validateJoinQueueAction(action);
      case ActionType.LEAVE_QUEUE:
        return this.validateLeaveQueueAction(action);
      default:
        throw new ValidationFailedError()
    }
  }

  private static validateJoinQueueAction(action: WebSocketAction): JoinQueueAction {
    const validation = joinQueueActionSchema.validate(action, { allowUnknown: false });
    if (validation.error) {
      throw new InvalidJoinQueueActionError(validation.error);
    }
    return validation.value;
  }

  private static validateLeaveQueueAction(action: WebSocketAction): LeaveQueueAction {
    const validation = leaveQueueActionSchema.validate(action, { allowUnknown: false });
    if (validation.error) {
      throw new InvalidLeaveQueueActionError(validation.error);
    }
    return validation.value;
  }
}
