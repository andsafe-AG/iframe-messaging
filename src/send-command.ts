import { v4 as uuidv4 } from 'uuid';
import { type Command, type CommandResponse, participants } from './types';

/**
 * Sends a command to the parent window
 * @param name - The name of the command
 * @param payload - The payload to send with the command
 * @returns Promise that resolves when the command is acknowledged
 * @internal
 */
export function sendCommand(name: string, payload: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const command: Command = {
      id: uuidv4(),
      sender: participants.CHILD,
      receiver: participants.PARENT,
      name: name,
      payload: [payload],
    };

    const timeout = setTimeout(() => {
      window.removeEventListener('message', listener);
      reject(new Error(`Timeout exceeded for command ${name}`));
    }, 20000);

    function listener({ data: commandResponse }: MessageEvent<CommandResponse>) {
      if (
        command.sender !== commandResponse.receiver ||
        command.id !== commandResponse.correspondingCommandId
      ) {
        // this is not the response we are looking for
        return;
      }

      clearTimeout(timeout);
      window.removeEventListener('message', listener);
      resolve();
    }

    window.addEventListener('message', listener, false);
    window.parent.postMessage(command, '*');
  });
}
