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
import * as fs from 'fs/promises';

const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {{
      devTools: inDevelopment,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
      webSecurity: false,  // ⚠️ Disables security (not recommended for production)
      contextIsolation: true,
    },nodeIntegration: true,
  }); nodeIntegrationInSubFrames: false,
  registerListeners(mainWindow);
      webSecurity: false,  // ⚠️ Disables security (not recommended for production)
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(Window);
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  } mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
} } else {
    mainWindow.loadFile(
async function installExtensions() {rer/${MAIN_WINDOW_VITE_NAME}/index.html`),
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }ry {
}   const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
app.whenReady().then(createWindow).then(installExtensions);
    console.error("Failed to install extensions");
//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();.then(createWindow).then(installExtensions);
  }
});sX only
app.on("window-all-closed", () => {
app.on("activate", () => { "darwin") {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only endse", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
ipcMain.handle('show-open-dialog', async (_, options) => {
  return dialog.showOpenDialog(options);
});
//osX only ends
// Add this IPC handler for path operations
ipcMain.handle('join-paths', (_, ...parts) => {tions) => {
  return path.join(...parts);g(options);
});

// Update the read-json-file handlerrations
ipcMain.handle('read-json-file', async (_, filePath: string) => {
  try {n path.join(...parts);
    // Normalize path for the operating system
    const normalizedPath = path.normalize(filePath);
    const content = await fs.readFile(normalizedPath, 'utf-8');
    const lines = content.trim().split('\n');lePath: string) => {
    const jsonArray = lines.map(line => JSON.parse(line));
    return { data: jsonArray, error: null };em
  } catch (error) {dPath = path.normalize(filePath);
    console.error('Error reading file:', error);Path, 'utf-8');
    return { es = content.trim().split('\n');
      data: null, y = lines.map(line => JSON.parse(line));
      error: error instanceof Error ? error.message : 'Unknown error' 
    };tch (error) {
  } console.error('Error reading file:', error);
}); return { 
      data: null, 






















});  if (win) win.close();  const win = BrowserWindow.getFocusedWindow();ipcMain.handle('window-close', () => {});  }    }      win.maximize();    } else {      win.unmaximize();    if (win.isMaximized()) {  if (win) {  const win = BrowserWindow.getFocusedWindow();ipcMain.handle('window-maximize', () => {});  if (win) win.minimize();  const win = BrowserWindow.getFocusedWindow();ipcMain.handle('window-minimize', () => {// Add these IPC handlers      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
});
