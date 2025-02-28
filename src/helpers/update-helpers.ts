import log from 'electron-log';

export const getUpdateError = (error: any): string => {
  if (error?.message?.includes('no published versions')) {
    return 'No published versions found. Please try again later.';
  }
  if (error?.message?.includes('network error')) {
    return 'Network error. Please check your internet connection.';
  }
  if (error?.code === 'ERR_UPDATER_INVALID_RELEASE_NAME') {
    return 'Invalid release version format.';
  }
  return error?.message || 'Unknown error occurred during update check.';
};

export const logUpdateError = (error: any) => {
  log.error('Update error details:', {
    message: error?.message,
    code: error?.code,
    stack: error?.stack,
    meta: error?.meta
  });
};
