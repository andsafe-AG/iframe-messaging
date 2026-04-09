/**
 * @packageDocumentation
 * IFrame Resizing - Standalone iframe height resizing for applications
 *
 * This package provides automatic iframe height resizing functionality by monitoring
 * the documentElement and communicating size changes to the parent window.
 */

export { pushToDataLayer } from './datalayer-push';
export { autoInitIFrameResizing, initIFrameResizing } from './iframe-resizing';
export type {
  Command,
  CommandResponse,
  IFrameCommandOptions,
  IFrameResizingOptions,
  Participant,
} from './types';
export { participants } from './types';
