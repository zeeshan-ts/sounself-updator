// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IPC_METHODS } from './constants';
import { ErrorResponse, SuccessResponse } from './types';

export type Channels = 'ipc-example';
export type Methods = (typeof IPC_METHODS)[keyof typeof IPC_METHODS];

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  invokeMainProcessMethod: async <T>(
    methods: Methods,
    ...args: unknown[]
  ): Promise<SuccessResponse<T> | ErrorResponse> => {
    return ipcRenderer.invoke(methods, ...args);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
