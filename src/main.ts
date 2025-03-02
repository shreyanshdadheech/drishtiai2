import { app, BrowserWindow, ipcMain,dialog } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import * as fsPromises from 'fs/promises';
import fs from 'fs';
import { autoUpdater  } from '../node_modules/electron-updater';
import log from '../node_modules/electron-log';
// Configure logging
log.transports.file.level = 'debug';
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs/main.log');
log.transports.console.level = 'debug';

const inDevelopment = process.env.NODE_ENV === "development";
// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
// Add these configurations
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'shreyanshdadheech',
  repo: 'drishtiai2',
  private: false
});

autoUpdater.logger = log;
log.info('App starting...');
function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, "icon.ico"), // <-- Set your icon here
    webPreferences: {
      webSecurity:false,
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
      enableWebSQL: false,
      spellcheck: false,
      backgroundThrottling: false
    },
  });
  setupAutoUpdater(mainWindow);
  registerListeners(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}


// Replace the auto-updater configuration section
function setupAutoUpdater(mainWindow: BrowserWindow) {
  if (inDevelopment) return;

  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Update events with window notifications
  autoUpdater.on("error", (error) => {
    log.error('Auto-updater error:', error);
    mainWindow.webContents.send('update-error', error.message);
  });

  autoUpdater.on("checking-for-update", () => {
    log.info('Checking for updates...');
    mainWindow.webContents.send('checking-update');
  });

  autoUpdater.on("update-available", (info) => {
    log.info('Update available:', info);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Would you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    log.info(`Download progress: ${progress.percent}%`);
    mainWindow.webContents.send('download-progress', progress.percent);
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info('Update downloaded:', info);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Would you like to install it now?',
      buttons: ['Install and Restart', 'Later'],
      defaultId: 0
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  // Check for updates every hour
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Error checking for updates:', err);
    });
  }, 60 * 60 * 1000);
}

// Modify createWindow function to use setupAutoUpdater


// Add these IPC handlers
ipcMain.handle('check-for-updates', () => {
  if (!inDevelopment) {
    return autoUpdater.checkForUpdates();
  }
});

ipcMain.handle('start-download', () => {
  return autoUpdater.downloadUpdate();
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true);
});












app.whenReady().then(async () => {
  createWindow();
  
  if (!inDevelopment) {
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      log.error('Initial update check failed:', err);
    }
  }
  
  await installExtensions();
});// Add this after your window creation code
app.on('browser-window-created', (_, window) => {
  window.on('ready-to-show', () => {
    window.show();
    window.focus();
  });
});
//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    BrowserWindow.getAllWindows()[0].focus();
  }
});
// Add this after your existing IPC handlers
ipcMain.handle('focus-window', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const mainWindow = windows[0];
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    return true;
  }
  return false;
});
//osX only ends

ipcMain.handle('show-open-dialog', async (_, options) => {
  return dialog.showOpenDialog(options);
});

// Add IPC handler for file reading
ipcMain.handle('read-json-file', async (_, filePath: string) => {
  try {
    const content = await fsPromises.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const jsonArray = lines.map(line => JSON.parse(line));
    return { data: jsonArray, error: null };
  } catch (error) {
    console.error('Error reading file:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
});

ipcMain.handle('read-binary-file', async (event, filePath: string) => {
  try {
   // Remove 'file://' from the file path
   const normalizedPath = filePath.startsWith('file://')
   ? new URL(filePath).pathname
   : filePath;

 // Ensure the path is correctly formatted for the current platform
 const platformPath = path.normalize(normalizedPath);

 // Read the file as a Buffer
 const fileBuffer = fs.readFileSync(platformPath); // Change to readFileSync for synchronous reading
 return fileBuffer; // Return the binary data to the renderer
  } catch (error) {
    console.error('Error reading binary file:', error);
    throw new Error('Failed to read binary file');
  }
});