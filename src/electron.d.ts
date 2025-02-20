interface ElectronAPI {
  showOpenDialog: (options: {
    properties: string[];
    defaultPath?: string;
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 