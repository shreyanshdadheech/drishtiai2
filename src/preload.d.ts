interface ElectronAPI {
  // ... other existing methods
  readBinaryFile: (path: string) => Promise<{ data: Buffer | null; error: string | null }>;
}

declare interface Window {
  electron: ElectronAPI;
} 