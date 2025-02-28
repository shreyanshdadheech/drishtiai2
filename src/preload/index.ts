import { contextBridge, ipcRenderer } from 'electron';
// ...existing imports...

contextBridge.exposeInMainWorld('electron', {
  // ...existing exposed functions...
  
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  startUpdate: () => ipcRenderer.invoke('start-update'),
  onUpdateProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('update-progress', (_, progress) => callback(progress));
    return () => {
      ipcRenderer.removeAllListeners('update-progress');
    };
  },
  onUpdateStatus: (callback: (status: any) => void) => {
    ipcRenderer.on('update-status', (_, status) => callback(status));
    return () => {
      ipcRenderer.removeAllListeners('update-status');
    };
  }
});
