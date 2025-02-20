import { ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { access, constants } from 'fs/promises';

export const setupIpcHandlers = () => {
  ipcMain.handle('ensureDir', async (_event, dirPath: string) => {
    try {
      // Check if directory exists and is accessible
      try {
        await access(dirPath, constants.W_OK);
        console.log('Directory exists and is writable:', dirPath);
        return { success: true };
      } catch (error) {
        console.log('Directory does not exist or is not writable, creating:', dirPath);
      }

      // Create directory with full permissions
      await fs.mkdir(dirPath, { recursive: true, mode: 0o777 });
      
      // Verify directory was created
      await access(dirPath, constants.W_OK);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to create/verify directory:', {
        path: dirPath,
        error: errorMessage
      });
      return { error: `Failed to create directory: ${errorMessage}` };
    }
  });

  ipcMain.handle('writeJsonFile', async (_event, filePath: string, data: any) => {
    try {
      const dir = path.dirname(filePath);
      
      // Ensure directory exists with proper permissions
      await fs.mkdir(dir, { recursive: true, mode: 0o777 });
      
      // Handle both JSON and text content
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, content, { mode: 0o666 });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to write file:', {
        path: filePath,
        error: errorMessage
      });
      return { error: `Failed to write file: ${errorMessage}` };
    }
  });
};
