const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  startDrag: () => ipcRenderer.invoke('start-drag'),
  resizeWindow: (width, height) => ipcRenderer.invoke('resize-window', width, height),
  
  // Add n8n related functions
  checkN8nStatus: () => ipcRenderer.invoke('check-n8n-status'),
  startN8n: () => ipcRenderer.invoke('start-n8n'),
  
  // Add Gemini API function for direct AI responses
  geminiChat: (message) => ipcRenderer.invoke('gemini-chat', message),
  
  // Add dependency check function
  getDependencyStatus: () => ipcRenderer.invoke('get-dependency-status'),
  
  // Add speech recognition function
  recognizeSpeech: (audioBuffer) => ipcRenderer.invoke('recognize-speech', audioBuffer),
  
  // Add text-to-speech function
  textToSpeech: (text, voiceGender) => ipcRenderer.invoke('text-to-speech', text, voiceGender),
  
  // Add app termination function
  quitApp: () => ipcRenderer.invoke('quit-app')
});

// Listen for n8n started event
ipcRenderer.on('n8n-started', () => {
  document.dispatchEvent(new CustomEvent('n8n-started'));
});

// Listen for n8n not installed event
ipcRenderer.on('n8n-not-installed', (event, details) => {
  document.dispatchEvent(new CustomEvent('n8n-not-installed', { 
    detail: details || { error: 'n8n is not installed or not accessible' }
  }));
});

// Listen for dependency status updates
ipcRenderer.on('dependency-status', (event, status) => {
  document.dispatchEvent(new CustomEvent('dependency-status', { 
    detail: status
  }));
}); 