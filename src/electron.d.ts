interface ElectronAPI {
  
  showOpenDialog: (options: {
    properties: string[];
    defaultPath?: string;
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;
  readJsonFile: (filePath: string) => Promise<{ data: any; error: string | null }>;
  focusWindow: () => Promise<void>;
  checkForUpdates: () => Promise<{ updateAvailable: boolean; version?: string }>;
  startUpdate: () => Promise<void>;
  onUpdateProgress: (callback: (progress: number) => void) => void;
  removeUpdateProgressListener: () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

// Add image module declarations
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

export {}; 