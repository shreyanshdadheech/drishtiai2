import exposeContexts from "./helpers/ipc/context-exposer";
import { contextBridge, ipcRenderer } from 'electron';
import fs from 'fs';
import crypto from 'crypto';

exposeContexts();

contextBridge.exposeInMainWorld('cryptoUtils', {
  generateCode: () => crypto.randomInt(100000, 999999).toString(),
});

contextBridge.exposeInMainWorld('electron', {
  focusWindow: () => ipcRenderer.invoke('focus-window'),
  enableScrollbar: () => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
          overflow: scroll !important;
          scrollbar-width: thin;
      }
      ::-webkit-scrollbar {
          width: 8px;
      }
    `;
    document.head.appendChild(style); 
  },
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  readJsonFile: async (filePath: string) => {
    try {
      return await ipcRenderer.invoke('read-json-file', filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      return { data: null, error: 'Failed to read file' };
    }
  },
  readBinaryFile: async (path: string) => {
    try {
      const data = await fs.promises.readFile(path);
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateAvailable: (callback: (info: any) => void) => 
    ipcRenderer.on('update-available', (_event, info) => callback(info)),
  onUpdateNotAvailable: (callback: () => void) => 
    ipcRenderer.on('update-not-available', callback),
  onUpdateError: (callback: (err: any) => void) => 
    ipcRenderer.on('update-error', (_event, err) => callback(err)),
  onUpdateProgress: (callback: (progress: number) => void) => 
    ipcRenderer.on('update-progress', (_event, progress) => callback(progress)),
  onUpdateDownloaded: (callback: () => void) => 
    ipcRenderer.on('update-downloaded', callback),
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('update-not-available');
    ipcRenderer.removeAllListeners('update-error');
    ipcRenderer.removeAllListeners('update-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
  }
});

// Make sure the process is defined
window.process = {
  ...window.process,
  platform: process.platform,
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV
  }
};
