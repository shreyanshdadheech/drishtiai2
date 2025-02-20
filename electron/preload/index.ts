import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // ...existing code...
  ensureDir: (dirPath: string) => ipcRenderer.invoke('ensureDir', dirPath),
  writeJsonFile: (filePath: string, data: any) => ipcRenderer.invoke('writeJsonFile', filePath, data),
  // ...existing code...
});
