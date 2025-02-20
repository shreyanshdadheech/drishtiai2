import { getStoredPath } from '@/helpers/path_helpers';

// Remove path module dependency and handle paths directly
export const getUploadsPath = () => {
  const serverPath = getStoredPath();
  if (!serverPath) return '';
  
  // Use forward slashes for file URLs
  const normalizedPath = serverPath.replace(/\\/g, '/');
  return `file:///${normalizedPath}/uploads`;
};

export const joinServerPath = (basePath: string, ...parts: string[]) => {
  return [basePath, ...parts].join('/').replace(/\\/g, '/');
};

export const joinUploadPath = (...parts: string[]) => {
  const serverPath = getStoredPath();
  if (!serverPath) return '';
  
  return joinServerPath(serverPath, 'uploads', ...parts);
};

export const getImagePath = (filename: string) => {
  const uploadsPath = getUploadsPath();
  return `${uploadsPath}/${filename}`;
};

export const getDatabasePaths = () => {
  const serverPath = getStoredPath();
  if (!serverPath) {
    return {
      patient: '',
      record: '',
      mediafile: ''
    };
  }

  return {
    patient: `${serverPath}/patient.db`.replace(/\\/g, '/'),
    record: `${serverPath}/record.db`.replace(/\\/g, '/'),
    mediafile: `${serverPath}/mediafile.db`.replace(/\\/g, '/')
  };
};
