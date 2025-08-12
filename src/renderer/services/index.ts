import { HummingbirdUpdateResponse } from '../../main/apis/types';

export const hasInternetConnection = async () => {
  try {
    const isInternetConnected =
      await window.electron.invokeMainProcessMethod<boolean>(
        'hasInternetConnection',
      );
    if (isInternetConnected.data) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const openNetworkSettings = async () => {
  try {
    await window.electron.invokeMainProcessMethod<boolean>(
      'openNetworkSettings',
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const logger = {
  info: (message: string) =>
    window.electron.invokeMainProcessMethod('logger', {
      type: 'info',
      message,
    }),
  error: (message: string) =>
    window.electron.invokeMainProcessMethod('logger', {
      type: 'error',
      message,
    }),
};

export const checkUpdates = async () => {
  return window.electron.invokeMainProcessMethod<HummingbirdUpdateResponse>(
    'checkUpdates',
  );
};

export const downloadUpdates = async (downloadLink: string) => {
  return window.electron.invokeMainProcessMethod(
    'downloadUpdates',
    downloadLink,
  );
};
