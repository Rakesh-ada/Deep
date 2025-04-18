const { app, BrowserWindow, ipcMain, Tray, Menu, shell, dialog } = require('electron');
const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const Store = require('electron-store');

// Initialize store for app settings
const store = new Store({
  name: 'settings',
  defaults: {
    n8nEnabled: true,
    useGemini: true,
    n8nPort: 5678,
    n8nWebhookUrl: '',
    windowPosition: { x: null, y: null },
    windowSize: { width: 400, height: 600 },
    minimized: false,
    voiceEnabled: true,
    voiceGender: 'female',
    theme: 'light'
  }
});

// Application state
let mainWindow;
let tray;
let n8nProcess = null;
let n8nRunning = false;
let isQuitting = false;
let devMode = process.argv.includes('--dev');

// Check if n8n is already running (externally)
async function checkExternalN8n() {
  try {
    const response = await fetch(`http://localhost:${store.get('n8nPort')}/healthz`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Start n8n if needed and not already running
async function startN8nIfNeeded() {
  if (!store.get('n8nEnabled')) {
    console.log('n8n integration disabled in settings');
    return;
  }

  const externalN8n = await checkExternalN8n();
  if (externalN8n) {
    console.log('External n8n instance detected');
    n8nRunning = true;
    mainWindow.webContents.send('n8n-status', true);
    return;
  }

  console.log('Starting embedded n8n...');
  try {
    n8nProcess = spawn('npx', ['n8n', 'start'], {
      detached: false,
      windowsHide: true
    });

    n8nProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`n8n: ${output}`);
      
      // Check if n8n is ready
      if (output.includes('Editor is now accessible via')) {
        n8nRunning = true;
        mainWindow.webContents.send('n8n-status', true);
      }
    });

    n8nProcess.stderr.on('data', (data) => {
      console.error(`n8n error: ${data}`);
    });

    n8nProcess.on('close', (code) => {
      console.log(`n8n process exited with code ${code}`);
      n8nRunning = false;
      if (mainWindow) {
        mainWindow.webContents.send('n8n-status', false);
      }
    });
  } catch (error) {
    console.error('Failed to start n8n:', error);
    dialog.showErrorBox('n8n Error', 
      'Failed to start n8n. The application will fallback to Gemini AI only mode.');
  }
}

// Stop n8n if we started it
function stopN8n() {
  if (n8nProcess && !n8nProcess.killed) {
    console.log('Stopping n8n...');
    if (process.platform === 'win32') {
      // On Windows we need to use taskkill to terminate the tree
      try {
        execSync(`taskkill /pid ${n8nProcess.pid} /T /F`);
      } catch (error) {
        console.error('Error terminating n8n:', error);
      }
    } else {
      // On Unix systems
      n8nProcess.kill('SIGTERM');
    }
    n8nProcess = null;
    n8nRunning = false;
  }
}

// Create the main application window
function createWindow() {
  const { width, height } = store.get('windowSize');
  const position = store.get('windowPosition');
  
  mainWindow = new BrowserWindow({
    width,
    height,
    x: position.x,
    y: position.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));
  
  // Open DevTools in dev mode
  if (devMode) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle window events
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    store.set('windowSize', { width, height });
  });

  mainWindow.on('moved', () => {
    const [x, y] = mainWindow.getPosition();
    store.set('windowPosition', { x, y });
  });

  // Apply saved minimized state
  if (store.get('minimized')) {
    mainWindow.setSize(400, 80);
  }

  // Send configuration to renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-config', {
      n8nEnabled: store.get('n8nEnabled'),
      useGemini: store.get('useGemini'),
      n8nWebhookUrl: store.get('n8nWebhookUrl'),
      voiceEnabled: store.get('voiceEnabled'),
      voiceGender: store.get('voiceGender'),
      theme: store.get('theme')
    });
  });
}

// Create tray icon
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show/Hide', click: () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }},
    { type: 'separator' },
    { label: 'Settings', click: () => {
      mainWindow.webContents.send('show-settings');
      mainWindow.show();
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => {
      isQuitting = true;
      app.quit();
    }}
  ]);
  
  tray.setToolTip('Deep The AI');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

// App event handlers
app.on('ready', async () => {
  try {
    createWindow();
    createTray();
    startN8nIfNeeded();
  } catch (error) {
    console.error('Error during startup:', error);
    dialog.showErrorBox('Startup Error', 
      'An error occurred during application startup. Please check logs for details.');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopN8n();
});

// IPC event handlers
ipcMain.on('window-minimize', () => {
  mainWindow.setSize(400, 80);
  store.set('minimized', true);
});

ipcMain.on('window-expand', () => {
  const { width, height } = store.get('windowSize');
  mainWindow.setSize(width, height);
  store.set('minimized', false);
});

ipcMain.on('window-close', () => {
  mainWindow.hide();
});

ipcMain.on('open-n8n-editor', () => {
  shell.openExternal(`http://localhost:${store.get('n8nPort')}`);
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set(settings);
  
  // Send updated config to renderer
  mainWindow.webContents.send('app-config', {
    n8nEnabled: store.get('n8nEnabled'),
    useGemini: store.get('useGemini'),
    n8nWebhookUrl: store.get('n8nWebhookUrl'),
    voiceEnabled: store.get('voiceEnabled'),
    voiceGender: store.get('voiceGender'),
    theme: store.get('theme')
  });
  
  return { success: true };
}); 