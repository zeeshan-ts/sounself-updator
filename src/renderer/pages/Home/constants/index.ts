import { Processes } from '../interfaces';

export const MESSAGES: { [key in Processes]: string } = {
  [Processes.CheckingInternet]: 'Checking Internet Connection...',
  [Processes.CheckingUpdates]: 'Checking the latest version...',
  [Processes.RetryInternet]: 'Retrying Internet Connection...',
  [Processes.LastVersion]: 'Checking for the latest version...',
  [Processes.Downloading]: 'Downloading update...',
  [Processes.Downloaded]: 'Download complete.',
  [Processes.Installing]: 'Installing update...',
  [Processes.NoInternet]:
    'No network connection. Connect to Wi-Fi and try again.',
};
