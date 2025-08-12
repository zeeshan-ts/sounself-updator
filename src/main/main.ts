/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
require('dotenv').config({
  path: require('path').join(__dirname, '../../.env'),
});
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
import { IPC_METHODS, LoggingMessage, OperatingSystems } from './constants';
import { checkHummingbirdUpdates } from './apis';
import os from 'os';
import { logger } from './utils/logger';

class AppUpdater {
  constructor() {
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let hasWifiCached = false;

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
