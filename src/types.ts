/**
 * Participant types in iframe communication
 */
export const participants = {
  PARENT: 'parent',
  CHILD: 'child',
} as const;

export type Participant = (typeof participants)[keyof typeof participants];

/**
 * Command structure for iframe messaging
 */
export interface Command {
  id: string;
  sender: Participant;
  receiver: Participant;
  name: string;
  payload: unknown[][];
}

/**
 * Command response structure
 */
export interface CommandResponse {
  id: string;
  correspondingCommandId: string;
  sender: Participant;
  receiver: Participant;
  payload: unknown;
}

/**
 * Configuration options for iframe commands
 */
export type IFrameCommandOptions = {
  /**
   * Error callback function called when resize command fails
   */
  onError?: (error: Error) => void;
  /**
   * Error capture function for monitoring/logging services
   */
  captureError?: (error: Error) => void;
};

/**
 * Configuration options for iframe resizing
 */
export type IFrameResizingOptions = IFrameCommandOptions & {
  /**
   * Method used to calculate the iframe height
   * - 'contentRect': Uses the height from ResizeObserver's contentRect (default)
   * - 'scrollHeight': Uses document.documentElement.scrollHeight
   */
  heightCalculationMethod?: 'contentRect' | 'scrollHeight';
};
