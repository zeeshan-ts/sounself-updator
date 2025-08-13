/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  IpcMainInvokeEvent,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import { logger as log } from './utils/logger';
import { resolveHtmlPath } from './util';
import { checkInternetConnectivity } from './utils/internetConnectivity';
import {
  applySubstitutions,
  IPC_METHODS,
  LoggingMessage,
  OperatingSystems,
  CHANNELS,
} from './constants';
import { checkHummingbirdUpdates } from './apis';
import os from 'os';
import { logger } from './utils/logger';
import { saveDownloadProgress } from './store';
import { NetworkRecoveryManager } from './utils/updates';

class AppUpdater {
  constructor() {
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let hasWifiCached = false;
const networkRecovery = new NetworkRecoveryManager();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 900,
    height: 500,
    resizable: false,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true, // Hide the menu bar
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // Set application menu to null (removes the menu bar)
  mainWindow.setMenu(null);
  ipcMain.handle(IPC_METHODS.hasInternetConnection, async () => {
    const isInternetConnected = await checkInternetConnectivity();
    return {
      data: isInternetConnected,
      success: true,
    };
  });

  ipcMain.handle(IPC_METHODS.openNetworkSettings, async () => {
    if (process.platform === OperatingSystems.WINDOWS) {
      const uri = hasWifiCached
        ? 'ms-settings:network-wifi'
        : 'ms-settings:network';
      shell.openExternal(uri);
    } else if (process.platform === OperatingSystems.MACOS) {
      shell.openExternal(
        'x-apple.systempreferences:com.apple.preference.network',
      );
    }
  });

  ipcMain.handle(
    IPC_METHODS.logger,
    async (
      event: IpcMainInvokeEvent,
      { type = 'info', message }: { type?: 'info' | 'error'; message: string },
    ) => {
      if (type === 'info') {
        log.info(message);
      } else if (type === 'error') {
        log.error(message);
      }
    },
  );

  ipcMain.handle(IPC_METHODS.checkUpdates, async () => {
    logger.info(LoggingMessage.CHECK_FOR_UPDATES);
    const response = await checkHummingbirdUpdates({
      operatingSystem: os.platform(),
      currentVersion: app.getVersion(),
    });
    return response;
  });

  ipcMain.handle(
    IPC_METHODS.downloadUpdates,
    async (event: IpcMainInvokeEvent, downloadLink: string) => {
      if (!downloadLink) return;

      // Reset network recovery manager for new download
      networkRecovery.reset();

      const startDownload = async () => {
        try {
          // Clear any existing listeners to prevent duplicates
          autoUpdater.removeAllListeners();

          log.info(
            applySubstitutions(LoggingMessage.DOWNLOADING_REQUEST, {
              url: downloadLink,
            }),
          );

          // Configure the updater
          autoUpdater.autoInstallOnAppQuit = true;
          autoUpdater.autoRunAppAfterInstall = true;

          // Log the current app version
          log.info(`Current app version: ${app.getVersion()}`);

          // Set up network recovery callback
          networkRecovery.setDownloadParams(downloadLink, startDownload);

          // Set up event listeners
          autoUpdater.on('checking-for-update', () => {
            log.info('Checking for update...');
          });

          autoUpdater.on('update-available', (info) => {
            log.info(`Update available: ${JSON.stringify(info)}`);
            networkRecovery.setDownloadingState(true);
            BrowserWindow.getAllWindows().forEach((win) => {
              win.webContents.send(CHANNELS.updateStatus, {
                available: true,
                info,
              });
            });
          });

          autoUpdater.on('update-not-available', (info) => {
            log.info(`Update not available: ${JSON.stringify(info)}`);
            networkRecovery.setDownloadingState(false);
            BrowserWindow.getAllWindows().forEach((win) => {
              win.webContents.send(CHANNELS.updateStatus, {
                available: false,
                info,
              });
            });
          });

          autoUpdater.on('download-progress', (progressObj) => {
            log.info(
              applySubstitutions(LoggingMessage.DOWNLOADING_PROGRESS, {
                percent: String(progressObj?.percent),
                obj: JSON.stringify(progressObj),
              }),
            );
            BrowserWindow.getAllWindows().forEach((win) => {
              win.webContents.send(CHANNELS.downloadProgress, {
                percent: progressObj?.percent,
                isError: false,
              });
            });
            saveDownloadProgress({
              percent: progressObj?.percent,
              isError: false,
            });
          });

          autoUpdater.on('update-downloaded', (info) => {
            log.info(`Update downloaded: ${JSON.stringify(info)}`);
            networkRecovery.setDownloadingState(false);
            networkRecovery.reset(); // Clear any retry logic

            BrowserWindow.getAllWindows().forEach((win) => {
              win.webContents.send(CHANNELS.downloadProgress, {
                percent: 100,
                isError: false,
                updateReady: true,
              });
            });
            saveDownloadProgress({ percent: 100, isError: false });

            // Schedule the update installation after a short delay
            setTimeout(() => {
              try {
                log.info('Installing update silently...');
                autoUpdater.quitAndInstall(true, true);
              } catch (error) {
                log.error(`Failed to quit and install: ${error}`);
              }
            }, 3000);
          });

          autoUpdater.on('error', (error) => {
            log.error(
              applySubstitutions(LoggingMessage.DOWNLOADING_ERROR, {
                error: error.toString(),
              }),
            );

            networkRecovery.setDownloadingState(false);

            // Check if it's a network error and handle accordingly
            if (networkRecovery.isNetworkError(error)) {
              log.info(
                'Network error detected during download. Starting continuous monitoring...',
              );

              // Notify renderer about network issue and monitoring
              BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send(CHANNELS.downloadProgress, {
                  percent: 0,
                  isError: true,
                  error:
                    'Network connection lost. Monitoring for reconnection...',
                  isNetworkError: true,
                  isMonitoring: true,
                });
              });

              // Start continuous network recovery process
              networkRecovery.startNetworkRecovery();
            } else {
              // Handle non-network errors normally
              BrowserWindow.getAllWindows().forEach((win) => {
                win.webContents.send(CHANNELS.downloadProgress, {
                  percent: 0,
                  isError: true,
                  error: error.toString(),
                });
              });
              saveDownloadProgress({ isError: true, error: error.toString() });
              networkRecovery.cleanup();
            }
          });

          autoUpdater.setFeedURL({
            provider: 'generic',
            url: downloadLink,
          });

          try {
            log.info('Calling checkForUpdates()...');
            const result = await autoUpdater.checkForUpdates();
            log.info(
              `checkForUpdates returned: ${result ? JSON.stringify(result) : 'undefined'}`,
            );
            return true;
          } catch (err) {
            log.error(
              `Error in checkForUpdates: ${
                err instanceof Error ? err.toString() : JSON.stringify(err)
              }`,
            );
            networkRecovery.cleanup();
            return false;
          }
        } catch (error) {
          if (error instanceof Error) {
            log.error(`Error in downloadUpdates: ${error.toString()}`);
          } else {
            log.error(`Error in downloadUpdates: ${JSON.stringify(error)}`);
          }
          networkRecovery.cleanup();
          return false;
        }
      };

      // Start the initial download
      return await startDownload();
    },
  );

  // Add a method to manually stop monitoring (useful for user cancellation)
  ipcMain.handle(
    IPC_METHODS.cancelNetworkMonitoring,
    async (event: IpcMainInvokeEvent) => {
      log.info('Network monitoring cancelled by user');
      networkRecovery.cleanup();

      // Notify renderer that monitoring is stopped
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send(CHANNELS.downloadProgress, {
          percent: 0,
          isError: true,
          error: 'Download cancelled by user.',
          isCancelled: true,
        });
      });

      return true;
    },
  );

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  // Add a manual retry handler for the renderer process
  ipcMain.handle(
    IPC_METHODS.retryDownloadUpdates,
    async (event: IpcMainInvokeEvent) => {
      log.info('Manual retry requested from renderer');
      networkRecovery.reset(); // Reset retry count for manual retry

      // You'll need to store the downloadLink somewhere accessible or pass it again
      // For now, assuming you have a way to get the current download link
      // Return success/failure status
      return true;
    },
  );
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
app.on('before-quit', () => {
  log.info('Cleaning up network resources...');
  networkRecovery.cleanup();
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
