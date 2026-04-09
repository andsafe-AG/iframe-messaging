/**
 * Unit tests for sendCommand
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendCommand } from '../send-command';
import { participants } from '../types';

describe('sendCommand', () => {
  beforeEach(() => {
    global.window.parent = {
      postMessage: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function getSentCommand() {
    const calls = (window.parent.postMessage as any).mock.calls;
    return calls[calls.length - 1][0];
  }

  function ackCommand(commandId: string) {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          id: 'response-id',
          correspondingCommandId: commandId,
          sender: participants.PARENT,
          receiver: participants.CHILD,
          payload: undefined,
        },
      }),
    );
  }

  describe('postMessage call', () => {
    it('should send a message to window.parent', async () => {
      const promise = sendCommand('resize', [500]);
      ackCommand(getSentCommand().id);

      await promise;

      expect(window.parent.postMessage).toHaveBeenCalledOnce();
    });

    it('should send with wildcard origin', async () => {
      const promise = sendCommand('resize', [500]);
      ackCommand(getSentCommand().id);

      await promise;

      expect(window.parent.postMessage).toHaveBeenCalledWith(expect.any(Object), '*');
    });
  });

  describe('command structure', () => {
    it('should set sender to child', async () => {
      const promise = sendCommand('resize', [500]);
      const command = getSentCommand();
      ackCommand(command.id);
      await promise;

      expect(command.sender).toBe(participants.CHILD);
    });

    it('should set receiver to parent', async () => {
      const promise = sendCommand('resize', [500]);
      const command = getSentCommand();
      ackCommand(command.id);
      await promise;

      expect(command.receiver).toBe(participants.PARENT);
    });

    it('should set the command name', async () => {
      const promise = sendCommand('pushToDataLayer', [{ event: 'pageView' }]);
      const command = getSentCommand();
      ackCommand(command.id);
      await promise;

      expect(command.name).toBe('pushToDataLayer');
    });

    it('should wrap the payload in an outer array', async () => {
      const promise = sendCommand('resize', [500]);
      const command = getSentCommand();
      ackCommand(command.id);
      await promise;

      expect(command.payload).toEqual([[500]]);
    });

    it('should generate a UUID for command id', async () => {
      const promise = sendCommand('resize', [500]);
      const command = getSentCommand();
      ackCommand(command.id);
      await promise;

      expect(command.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate a unique id per call', async () => {
      const p1 = sendCommand('resize', [100]);
      const id1 = getSentCommand().id;
      ackCommand(id1);
      await p1;

      const p2 = sendCommand('resize', [200]);
      const id2 = getSentCommand().id;
      ackCommand(id2);
      await p2;

      expect(id1).not.toBe(id2);
    });
  });

  describe('promise resolution', () => {
    it('should return a Promise', () => {
      const result = sendCommand('resize', [500]);
      expect(result).toBeInstanceOf(Promise);

      // Prevent unhandled rejection from the 20s timeout
      ackCommand(getSentCommand().id);
      return result;
    });

    it('should resolve when a matching acknowledgment is received', async () => {
      const promise = sendCommand('resize', [500]);
      ackCommand(getSentCommand().id);

      await expect(promise).resolves.toBeUndefined();
    });

    it('should ignore responses with a non-matching correspondingCommandId', async () => {
      const promise = sendCommand('resize', [500]);
      const command = getSentCommand();

      // First send a response with wrong ID — should be ignored
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            id: 'response-1',
            correspondingCommandId: 'wrong-id',
            sender: participants.PARENT,
            receiver: participants.CHILD,
            payload: undefined,
          },
        }),
      );

      // Promise should still be pending; now send the correct ack
      ackCommand(command.id);

      await expect(promise).resolves.toBeUndefined();
    });

    it('should ignore responses where receiver does not match command sender', async () => {
      const promise = sendCommand('resize', [500]);
      const command = getSentCommand();

      // Send response with wrong receiver (parent instead of child)
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            id: 'response-1',
            correspondingCommandId: command.id,
            sender: participants.PARENT,
            receiver: participants.PARENT, // should be 'child'
            payload: undefined,
          },
        }),
      );

      // Promise should still be pending; now send the correct ack
      ackCommand(command.id);

      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('event listener cleanup', () => {
    it('should remove the message listener after resolving', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const promise = sendCommand('resize', [500]);
      ackCommand(getSentCommand().id);
      await promise;

      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should remove the message listener after timing out', async () => {
      vi.useFakeTimers();
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const promise = sendCommand('resize', [500]);
      // Attach rejection handler before advancing timers to prevent unhandled rejection
      const assertion = expect(promise).rejects.toThrow();
      await vi.advanceTimersByTimeAsync(21000);
      await assertion;

      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

      vi.useRealTimers();
    });
  });

  describe('timeout', () => {
    it('should reject with a timeout error after 20 seconds', async () => {
      vi.useFakeTimers();

      const promise = sendCommand('resize', [500]);
      const assertion = expect(promise).rejects.toThrow('Timeout exceeded for command resize');
      await vi.advanceTimersByTimeAsync(21000);
      await assertion;

      vi.useRealTimers();
    });

    it('should include the command name in the timeout error message', async () => {
      vi.useFakeTimers();

      const promise = sendCommand('pushToDataLayer', [{ event: 'pageView' }]);
      const assertion = expect(promise).rejects.toThrow(
        'Timeout exceeded for command pushToDataLayer',
      );
      await vi.advanceTimersByTimeAsync(21000);
      await assertion;

      vi.useRealTimers();
    });

    it('should not reject before 20 seconds have passed', async () => {
      vi.useFakeTimers();

      const promise = sendCommand('resize', [500]);

      let rejected = false;
      promise.catch(() => {
        rejected = true;
      });

      await vi.advanceTimersByTimeAsync(19000);
      expect(rejected).toBe(false);

      // Cleanup to avoid unhandled rejection
      await vi.advanceTimersByTimeAsync(2000);
      await expect(promise).rejects.toThrow();

      vi.useRealTimers();
    });
  });
});
