import { LoggingMessage } from '../constants';
import { logger } from './logger';

export async function checkInternetConnectivity() {
  try {
    const isOnlineModule = await import('is-online');
    const online = await isOnlineModule.default();
    return online;
  } catch (error) {
    logger.info(LoggingMessage.INTERNET_DISCONNECT);
    return false;
  }
}
