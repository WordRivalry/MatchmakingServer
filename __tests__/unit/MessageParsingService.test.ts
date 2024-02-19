// __tests__/unit/MessageParsingService.test.ts
import { MessageParsingService } from '../../src/Services/MessageParsingService';
import { InvalidActionFormatError, InvalidJoinQueueActionError, InvalidJsonError, InvalidLeaveQueueActionError, ValidationFailedError } from '../../src/Error/Errors';
import { ActionType, GameMode, ModeType } from '../../src/Validation/messageTypes';

describe('MessageParsingService', () => {

  describe('parseAndValidateMessage', () => {
    it('should throw InvalidJsonError for invalid JSON', () => {
      const invalidJson = 'Invalid JSON';
      expect(() => MessageParsingService.parseAndValidateMessage(invalidJson as any)).toThrow(InvalidJsonError);
    });

    it('should throw InvalidActionFormatError for invalid action format', () => {
      const invalidActionFormat = JSON.stringify({ wrongField: 'test' });
      expect(() => MessageParsingService.parseAndValidateMessage(invalidActionFormat as any)).toThrow(InvalidActionFormatError);
    });

    it('should throw InvalidActionFormatError for unexpected action type', () => {
      const unexpectedActionType = JSON.stringify({ type: 'unexpectedType', payload: {} });
      expect(() => MessageParsingService.parseAndValidateMessage(unexpectedActionType as any)).toThrow(InvalidActionFormatError);
    });

    it('should throw InvalidJoinQueueActionError for invalid join queue action', () => {
      const invalidJoinQueueAction = JSON.stringify({ type: ActionType.JOIN_QUEUE, payload: { gameMode: 'invalidMode', modeType: 'invalidType', elo: -1 } });
      expect(() => MessageParsingService.parseAndValidateMessage(invalidJoinQueueAction as any)).toThrow(InvalidJoinQueueActionError);
    });

    it('should successfully parse and validate a valid join queue action', () => {
      const validJoinQueueAction = JSON.stringify({ type: ActionType.JOIN_QUEUE, payload: { gameMode: GameMode.RANK, modeType: ModeType.NORMAL, elo: 1000 } });
      const result = MessageParsingService.parseAndValidateMessage(validJoinQueueAction as any);
      expect(result).toEqual({
        type: ActionType.JOIN_QUEUE,
        payload: { gameMode: GameMode.RANK, modeType: ModeType.NORMAL, elo: 1000 },
      });
    });

    it('should throw InvalidLeaveQueueActionError for leave queue action with payload', () => {
      const invalidLeaveQueueAction = JSON.stringify({ type: ActionType.LEAVE_QUEUE, payload: { someField: 'value' } });
      expect(() => MessageParsingService.parseAndValidateMessage(invalidLeaveQueueAction as any)).toThrow(InvalidLeaveQueueActionError);
    });

    it('should successfully parse and validate a valid leave queue action', () => {
      const validLeaveQueueAction = JSON.stringify({ type: ActionType.LEAVE_QUEUE });
      const result = MessageParsingService.parseAndValidateMessage(validLeaveQueueAction as any);
      expect(result).toEqual({ type: ActionType.LEAVE_QUEUE });
    });
  });

});
