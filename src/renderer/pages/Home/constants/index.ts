import { Processes } from '../interfaces';

export const MESSAGES: { [key in Processes]: string } = {
  [Processes.CheckingInternet]: 'Checking Internet Connection...',
  [Processes.CheckingUpdates]: 'Checking Latest Version...',
  [Processes.RetryInternet]: 'Retrying Internet Connection...',
  [Processes.LastVersion]:
    'A newer version of SoundSelf is available. Downloading now...',
  [Processes.Downloading]: 'Downloading Latest Version... ({{PROGRESS}}%)',
  [Processes.Downloaded]: 'Download Completed. (100%)',
  [Processes.Installing]: 'Installing...',
  [Processes.NoInternet]:
    'No network connection. Connect to Wi-Fi and try again.',
};
