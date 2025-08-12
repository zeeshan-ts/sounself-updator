import axios from 'axios';
import https from 'https';
import {
  CheckHummingbirdUpdatesParams,
  HummingbirdUpdateResponse,
} from './types';
import { logger } from '../utils/logger';
import { applySubstitutions, LoggingMessage } from '../constants';
import { Axios } from 'axios';
import config from '../config';

const axiosInstance = axios.create({
  baseURL: config.backendUrl,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export async function checkHummingbirdUpdates({
  currentVersion,
  operatingSystem,
}: CheckHummingbirdUpdatesParams): Promise<
  HummingbirdUpdateResponse | undefined
> {
  try {
    const response = await axiosInstance.get<HummingbirdUpdateResponse>(
      '/update/hummingbird',
      {
        params: {
          operatingSystem,
          currentVersion,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    logger.error(
      applySubstitutions(LoggingMessage.ERROR_CHECKING_UPDATES, {
        error: error?.toString(),
      }),
    );
    return error.response?.data;
  }
}
