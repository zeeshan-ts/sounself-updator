import axios from 'axios';
import https from 'https';
import config from './config';
import { ConfigKeys } from './constants';

const axiosInstance = axios.create({
  baseURL: config[ConfigKeys.API_URL],
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

interface CheckHummingbirdUpdatesParams {
  operatingSystem: string;
  currentVersion: string;
}

interface HummingbirdUpdateResponse {
  data: {
    version: string;
    buildLink: string;
  };
  code: number;
  success: boolean;
  message: string;
}

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
    return error.response?.data;
  }
}

export default axios;
