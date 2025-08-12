import { applySubstitutions, LoggingMessage } from '../constants';
import { logger } from './logger';

export async function checkInternetConnectivity() {
  try {
    const isOnlineModule = await import('is-online');
    const online = await isOnlineModule.default();
    return online;
  } catch (error) {
    logger.info(
      applySubstitutions(LoggingMessage.ERROR_CHECKING_INTERNET, {
        error,
      }),
    );
    return false;
  }
}
