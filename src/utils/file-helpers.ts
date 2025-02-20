export const ensureDirectoryExists = async (dirPath: string): Promise<boolean> => {
  try {
    if (!dirPath) {
      console.error('Directory path is empty');
      return false;
    }

    console.log('Attempting to create/verify directory:', dirPath);
    const result = await window.electron.ensureDir(dirPath);
    
    if (result.error) {
      console.error('Failed to create directory:', {
        path: dirPath,
        error: result.error
      });
      return false;
    }

    console.log('Directory created/verified successfully:', dirPath);
    return true;
  } catch (error) {
    console.error('Exception while creating directory:', {
      path: dirPath,
      error: error instanceof Error ? error.message : error
    });
    return false;
  }
};

export const writeJsonToFile = async (filePath: string, data: any): Promise<boolean> => {
  try {
    console.log('Attempting to write file:', filePath);
    const result = await window.electron.writeJsonFile(filePath, data);
    
    if (result.error) {
      console.error('Failed to write file:', {
        path: filePath,
        error: result.error
      });
      return false;
    }

    console.log('File written successfully:', filePath);
    return true;
  } catch (error) {
    console.error('Exception while writing file:', {
      path: filePath,
      error: error instanceof Error ? error.message : error
    });
    return false;
  }
};
