import { BrowserWindow, net } from 'electron';
import { logger as log } from './logger';
import { checkInternetConnectivity } from './internetConnectivity';
import { CHANNELS } from '../constants';

export class NetworkRecoveryManager {
  private isDownloading: boolean = false;
  private retryAttempts: number = 0;
  private maxRetryAttempts: number = 3;
  private retryDelay: number = 5000; // 5 seconds
  private networkCheckInterval: NodeJS.Timeout | null = null;
  private downloadLink: string = '';
  private onRetryCallback: (() => void) | null = null;

  constructor() {}

  setDownloadParams(downloadLink: string, onRetry: () => void) {
    this.downloadLink = downloadLink;
    this.onRetryCallback = onRetry;
  }

  setDownloadingState(isDownloading: boolean) {
    this.isDownloading = isDownloading;
  }

  isNetworkError(error: Error): boolean {
    const networkErrorCodes = [
      'ERR_CONNECTION_RESET',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ERR_NETWORK_CHANGED',
      'ERR_INTERNET_DISCONNECTED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'net::ERR_CONNECTION_RESET',
    ];

    return networkErrorCodes.some(
      (code) => error.message.includes(code) || error.toString().includes(code),
    );
  }

  async checkNetworkConnectivity(): Promise<boolean> {
    return await checkInternetConnectivity();
  }

  startNetworkRecovery() {
    log.info('Starting continuous network monitoring for download recovery...');
    this.startContinuousNetworkMonitoring();
  }

  private startContinuousNetworkMonitoring() {
    // Clear any existing monitoring
    if (this.networkCheckInterval) {
      clearTimeout(this.networkCheckInterval);
    }

    const checkConnection = async () => {
      try {
        const isConnected = await this.checkNetworkConnectivity();

        if (isConnected && !this.isDownloading && this.onRetryCallback) {
          log.info('Network connectivity restored! Resuming download...');
          this.retryAttempts++;

          // Notify renderer that we're resuming
          BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(CHANNELS.downloadProgress, {
              percent: 0,
              isError: false,
              message: `Reconnected! Resuming download... (Attempt ${this.retryAttempts})`,
              isResuming: true,
            });
          });

          // Wait a moment before retrying to ensure stable connection
          setTimeout(() => {
            if (this.onRetryCallback) {
              this.onRetryCallback();
            }
          }, this.retryDelay);

          return; // Stop this monitoring cycle
        } else if (!isConnected) {
          // Log periodically to show we're still monitoring (every 10th check to avoid spam)
          if (this.retryAttempts % 10 === 0) {
            log.info(
              `Still monitoring network connectivity... (Check #${this.retryAttempts + 1})`,
            );
          }

          // Continue monitoring - schedule next check
          this.networkCheckInterval = setTimeout(checkConnection, 3000);
        }
      } catch (error) {
        log.error(`Error during network monitoring: ${error}`);
        // Continue monitoring even if there's an error
        this.networkCheckInterval = setTimeout(checkConnection, 3000);
      }
    };

    // Start the monitoring
    checkConnection();
  }

  private notifyNetworkMonitoring() {
    // Notify renderer process that we're continuously monitoring
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send(CHANNELS.downloadProgress, {
        percent: 0,
        isError: true,
        error: 'Network connection lost. Monitoring for reconnection...',
        isMonitoring: true,
      });
    });
  }

  reset() {
    this.isDownloading = false;
    this.retryAttempts = 0;
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
      this.networkCheckInterval = null;
    }
  }

  cleanup() {
    this.reset();
    this.onRetryCallback = null;
  }
}

export default NetworkRecoveryManager;
