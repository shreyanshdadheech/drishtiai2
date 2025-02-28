import { app, BrowserWindow, ipcMain } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { dialog } from 'electron';
import * as fsPromises from 'fs/promises';
import fs from 'fs';


const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, "icon.ico"), // <-- Set your icon here
    webPreferences: {
      webSecurity:false,
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
      enableWebSQL: false,
      spellcheck: false,
      backgroundThrottling: false
    },
  });
  registerListeners(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

app.whenReady().then(createWindow).then(installExtensions);
// Add this after your window creation code
app.on('browser-window-created', (_, window) => {
  window.on('ready-to-show', () => {
    window.show();
    window.focus();
  });
});
//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    BrowserWindow.getAllWindows()[0].focus();
  }
});
// Add this after your existing IPC handlers
ipcMain.handle('focus-window', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const mainWindow = windows[0];
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    return true;
  }
  return false;
});
//osX only ends

ipcMain.handle('show-open-dialog', async (_, options) => {
  return dialog.showOpenDialog(options);
});

// Add IPC handler for file reading
ipcMain.handle('read-json-file', async (_, filePath: string) => {
  try {
    const content = await fsPromises.readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const jsonArray = lines.map(line => JSON.parse(line));
    return { data: jsonArray, error: null };
  } catch (error) {
    console.error('Error reading file:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
});

ipcMain.handle('read-binary-file', async (event, filePath: string) => {
  try {
   // Remove 'file://' from the file path
   const normalizedPath = filePath.startsWith('file://')
   ? new URL(filePath).pathname
   : filePath;

 // Ensure the path is correctly formatted for the current platform
 const platformPath = path.normalize(normalizedPath);

 // Read the file as a Buffer
 const fileBuffer = fs.readFileSync(platformPath); // Change to readFileSync for synchronous reading
 return fileBuffer; // Return the binary data to the renderer
  } catch (error) {
    console.error('Error reading binary file:', error);
    throw new Error('Failed to read binary file');
  }
});