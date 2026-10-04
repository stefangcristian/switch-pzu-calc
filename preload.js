const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  shareViberScreenshot: () => ipcRenderer.invoke('share-viber-screenshot')
});
