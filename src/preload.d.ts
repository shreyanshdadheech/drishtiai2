interface ElectronAPI {
  // ... other existing methods
  readBinaryFile: (path: string) => Promise<{ data: Buffer | null; error: string | null }>;
  checkForUpdates: () => Promise<UpdateInfo>;
  startUpdate: () => Promise<boolean>;
  cancelUpdate: () => Promise<boolean>;
  onUpdateProgress: (callback: (progress: number) => void) => void;
  removeUpdateProgressListener: () => void;
}

declare interface Window {
  electron: ElectronAPI;
} 

interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseDate?: string;
  releaseNotes?: string;
}
