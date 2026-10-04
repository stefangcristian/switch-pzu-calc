const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 690,
    resizable: false,
    maximizable: false,
    alwaysOnTop: true,
    transparent: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL('https://pptcalc.vercel.app');

}

// IPC Handlers - Registered once globally
ipcMain.on('set-always-on-top', (event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag, 'floating');
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

// Capture Screenshot, save to Clipboard & Focus Viber safely
ipcMain.handle('share-viber-screenshot', async () => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    // 1. Capture exact high-res screenshot of the application window
    const image = await mainWindow.webContents.capturePage();

    // 2. Put screenshot image into macOS system clipboard
    clipboard.writeImage(image);

    // 3. Bring Viber safely to the front WITHOUT synthetic keystrokes
    // This eliminates any bot/spam heuristic flags in Viber; user manually pastes with Cmd+V
    exec('open -a Viber', (err) => {
      if (err) {
        console.warn('Could not launch Viber:', err);
      }
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to capture and share screenshot:', err);
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
