import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
// ...existing imports...

// Configure logging
log.transports.file.level = 'debug';
autoUpdater.logger = log;

// Configure auto updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = true;
autoUpdater.channel = 'latest';

// Add this configuration
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'shreyanshdadheech',
  repo: 'drishtiai2',
  private: false, // Set to true if it's a private repository
});

// Create main window function
function createWindow() {
  // ...existing window creation code...

  // Check for updates immediately when app starts
  checkForUpdates();
}

// Add this function to handle update checks
async function checkForUpdates() {
  try {
    log.info('Checking for updates...');
    const result = await autoUpdater.checkForUpdates();
    log.info('Update check result:', result);
    
    if (result?.updateInfo) {
      log.info('Update available:', {
        currentVersion: app.getVersion(),
        availableVersion: result.updateInfo.version
      });
    }
  } catch (error) {
    log.error('Update check failed:', error);
  }
}

// Add detailed logging for update events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
  mainWindow?.webContents.send('update-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  mainWindow?.webContents.send('update-status', { 
    status: 'available',
    version: info.version,
    releaseDate: info.releaseDate
  });
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
  mainWindow?.webContents.send('update-status', { 
    status: 'not-available',
    currentVersion: app.getVersion(),
    latestVersion: info.version
  });
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
  mainWindow?.webContents.send('update-status', { 
    status: 'error',
    error: err.message
  });
});

// Add more detailed update event handlers
autoUpdater.on('download-progress', (progressObj) => {
  log.info('Download progress:', progressObj);
  mainWindow?.webContents.send('update-progress', {
    percent: progressObj.percent,
    bytesPerSecond: progressObj.bytesPerSecond,
    total: progressObj.total,
    transferred: progressObj.transferred
  });
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  mainWindow?.webContents.send('update-status', { 
    status: 'downloaded',
    version: info.version
  });
  
  // Install on next restart
  autoUpdater.quitAndInstall(false, true);
});

// Add IPC handlers for update operations
ipcMain.handle('check-for-updates', async () => {
  try {
    log.info('Manual update check triggered');
    const result = await autoUpdater.checkForUpdates();
    
    if (!result) {
      throw new Error('No update check result');
    }

    const updateInfo = {
      updateAvailable: !!result.updateInfo,
      currentVersion: app.getVersion(),
      latestVersion: result.updateInfo?.version,
      releaseDate: result.updateInfo?.releaseDate,
      releaseNotes: result.updateInfo?.releaseNotes
    };

    log.info('Update check info:', updateInfo);
    return updateInfo;
  } catch (error) {
    log.error('Failed to check for updates:', error);
    throw error;
  }
});

ipcMain.handle('start-update', async () => {
  try {
    log.info('Starting update download');
    await autoUpdater.downloadUpdate();
    return true;
  } catch (error) {
    log.error('Failed to start update:', error);
    throw error;
  }
});

// ...rest of your main process code...
