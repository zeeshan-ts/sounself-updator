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
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import os from 'os';
import fs from 'fs';
import { applySubstitutions, resolveHtmlPath } from './util';
import { checkHummingbirdUpdates } from './apis';
import { LoggingMessage } from './constants';
import { saveDownloadProgress, saveUpdateInfo } from './Store';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('checkHummingbirdUpdates', async () => {
  const response = await checkHummingbirdUpdates({
    operatingSystem: os.platform(),
    currentVersion: app.getVersion(),
  });
  return response;
});

ipcMain.handle('downloadHummingbird', async (event, downloadLink) => {
  try {
    // Clear any existing listeners to prevent duplicates
    autoUpdater.removeAllListeners();

    log.info(
      applySubstitutions(LoggingMessage.DOWNLOADING_REQUEST, {
        url: downloadLink,
      }),
    );

    // Configure the updater
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoRunAppAfterInstall = true;

    // Log the current app version
    log.info(`Current app version: ${app.getVersion()}`);

    // Set up event listeners
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info(`Update available: ${JSON.stringify(info)}`);
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info(`Update not available: ${JSON.stringify(info)}`);
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send(`download-no-update`);
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
        win.webContents.send(
          `download-progress`,
          Math.trunc(progressObj.percent),
        );
      });
      saveDownloadProgress({ percent: progressObj?.percent, isError: false });
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info(`Update downloaded: ${JSON.stringify(info)}`);

      // Store update info with additional metadata for tracking
      const updateInfo = {
        version: info.version,
        downloadedAt: new Date().toISOString(),
        downloadLink,
        installAttempts: 0,
        releaseNotes: info.releaseNotes || '',
      };

      // Make sure directory exists
      const updateFilePath = path.join(
        app.getPath('userData'),
        'update-pending.json',
      );
      try {
        fs.writeFileSync(updateFilePath, JSON.stringify(updateInfo));
        log.info(`Update information saved to ${updateFilePath}`);
        saveUpdateInfo(updateInfo);
      } catch (err) {
        if (err instanceof Error) {
          log.error(`Failed to save update information: ${err.message}`);
        } else {
          log.error(
            `Failed to save update information: ${JSON.stringify(err)}`,
          );
        }
      }

      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send(`download-finish`);
      });
      saveDownloadProgress({ percent: 100, isError: false });
    });

    autoUpdater.on('error', (error) => {
      log.info(
        applySubstitutions(LoggingMessage.AUTO_UPDATE_ERROR, {
          error: error.toString(),
          stack: error.stack || 'No stack trace',
        }),
      );
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send(`download-error`, error.message);
      });
      saveDownloadProgress({ percent: 0, isError: true });
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
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error(`Error in downloadHummingbird: ${error.toString()}`);
    } else {
      log.error(`Error in downloadHummingbird: ${JSON.stringify(error)}`);
    }
    return false;
  }
});

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
    height: 300,
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
