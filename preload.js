const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Window controls
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    expandWindow: () => ipcRenderer.send('window-expand'),
    closeWindow: () => ipcRenderer.send('window-close'),
    
    // n8n functions 
    openN8nEditor: () => ipcRenderer.send('open-n8n-editor'),
    
    // Settings functions
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    
    // Receive events from main process
    onAppConfig: (callback) => ipcRenderer.on('app-config', (_, data) => callback(data)),
    onN8nStatus: (callback) => ipcRenderer.on('n8n-status', (_, status) => callback(status)),
    onShowSettings: (callback) => ipcRenderer.on('show-settings', () => callback()),
    
    // One-time events
    onceAppConfig: (callback) => ipcRenderer.once('app-config', (_, data) => callback(data)),
  }
); 