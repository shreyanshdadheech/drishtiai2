import exposeContexts from "./helpers/ipc/context-exposer";
import { contextBridge, ipcRenderer } from 'electron';
import fs from 'fs';
import crypto from 'crypto';

exposeContexts();

contextBridge.exposeInMainWorld('cryptoUtils', {
  generateCode: () => crypto.randomInt(100000, 999999).toString(),
});

contextBridge.exposeInMainWorld('electron', {
  enableScrollbar: () => {
    const style = document.createElement("style");
    style.innerHTML = `
      html, body {
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
      return { data: null, error: error.message };
    }
  },
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
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
