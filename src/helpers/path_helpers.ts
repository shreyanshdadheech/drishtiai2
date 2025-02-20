const STORAGE_KEY = 'serverPath';

export const getStoredPath = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const storePath = (path: string): void => {
  // Normalize path separators to forward slashes
  const normalizedPath = path.replace(/\\/g, '/');
  localStorage.setItem(STORAGE_KEY, normalizedPath);
};

export const clearStoredPath = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};