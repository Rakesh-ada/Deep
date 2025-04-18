// Main Client-side Application

// Application State
const AppState = {
  isMinimized: false,
  isSettingsOpen: false,
  isRecording: false,
  isLoading: false,
  connectionStatus: 'disconnected', // 'disconnected', 'n8n', 'gemini'
  config: {
    n8nEnabled: true,
    useGemini: true,
    n8nWebhookUrl: '',
    voiceEnabled: true,
    voiceGender: 'female',
    theme: 'light'
  }
};

// DOM Elements
const elements = {
  // Main UI elements
  appContainer: document.querySelector('.app-container'),
  connectionStatus: document.getElementById('connection-status'),
  chatContainer: document.getElementById('chat-container'),
  userInput: document.getElementById('user-input'),
  sendBtn: document.getElementById('send-btn'),
  voiceBtn: document.getElementById('voice-btn'),
  
  // Window controls
  minimizeBtn: document.getElementById('minimize-btn'),
  expandBtn: document.getElementById('expand-btn'),
  closeBtn: document.getElementById('close-btn'),
  settingsBtn: document.getElementById('settings-btn'),
  
  // Settings panel
  settingsPanel: document.getElementById('settings-panel'),
  closeSettingsBtn: document.getElementById('close-settings-btn'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),
  n8nEnabled: document.getElementById('n8n-enabled'),
  useGemini: document.getElementById('use-gemini'),
  n8nWebhookUrl: document.getElementById('n8n-webhook'),
  voiceEnabled: document.getElementById('voice-enabled'),
  voiceGender: document.getElementById('voice-gender'),
  themeSelector: document.getElementById('theme-selector'),
  n8nEditorBtn: document.getElementById('n8n-editor-btn'),
  
  // Indicators
  voiceIndicator: document.getElementById('voice-indicator'),
  stopVoiceBtn: document.getElementById('stop-voice-btn'),
  loadingIndicator: document.getElementById('loading-indicator')
};

// Initialize the application
function initApp() {
  // Setup event listeners
  setupWindowControls();
  setupSettingsPanel();
  setupChatInput();
  
  // Get configuration from main process
  window.api.onceAppConfig(setupConfiguration);
  
  // Setup n8n status listener
  window.api.onN8nStatus(updateConnectionStatus);
  
  // Settings button from tray
  window.api.onShowSettings(() => {
    toggleSettingsPanel(true);
  });
  
  // Auto-resize textarea as user types
  elements.userInput.addEventListener('input', autoResizeTextarea);

  // Initial state - loading until we get a connection
  showLoading(true);
}

// Set up the window control buttons
function setupWindowControls() {
  elements.minimizeBtn.addEventListener('click', () => {
    AppState.isMinimized = true;
    elements.appContainer.classList.add('minimized');
    window.api.minimizeWindow();
  });
  
  elements.expandBtn.addEventListener('click', () => {
    AppState.isMinimized = false;
    elements.appContainer.classList.remove('minimized');
    window.api.expandWindow();
  });
  
  elements.closeBtn.addEventListener('click', () => {
    window.api.closeWindow();
  });
  
  elements.settingsBtn.addEventListener('click', () => {
    toggleSettingsPanel(true);
  });
}

// Set up the chat input and send functionality
function setupChatInput() {
  // Send button click
  elements.sendBtn.addEventListener('click', sendMessage);
  
  // Send on Enter (but not with shift for new line)
  elements.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Voice button
  elements.voiceBtn.addEventListener('click', startVoiceRecording);
  elements.stopVoiceBtn.addEventListener('click', stopVoiceRecording);
}

// Set up the settings panel
function setupSettingsPanel() {
  elements.closeSettingsBtn.addEventListener('click', () => {
    toggleSettingsPanel(false);
  });
  
  elements.saveSettingsBtn.addEventListener('click', saveSettings);
  
  elements.n8nEditorBtn.addEventListener('click', () => {
    window.api.openN8nEditor();
  });
  
  // Theme change
  elements.themeSelector.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });
}

// Apply configuration from main process
function setupConfiguration(config) {
  // Update our local config with the received values
  AppState.config = config;
  
  // Apply values to UI controls
  elements.n8nEnabled.checked = config.n8nEnabled;
  elements.useGemini.checked = config.useGemini;
  elements.n8nWebhookUrl.value = config.n8nWebhookUrl || '';
  elements.voiceEnabled.checked = config.voiceEnabled;
  elements.voiceGender.value = config.voiceGender;
  elements.themeSelector.value = config.theme;
  
  // Apply theme
  applyTheme(config.theme);
  
  // We're ready - hide loading
  showLoading(false);
}

// Apply the selected theme
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
}

// Save settings from the settings panel
function saveSettings() {
  const settings = {
    n8nEnabled: elements.n8nEnabled.checked,
    useGemini: elements.useGemini.checked,
    n8nWebhookUrl: elements.n8nWebhookUrl.value,
    voiceEnabled: elements.voiceEnabled.checked,
    voiceGender: elements.voiceGender.value,
    theme: elements.themeSelector.value
  };
  
  window.api.saveSettings(settings)
    .then(response => {
      if (response.success) {
        toggleSettingsPanel(false);
        
        // Update local config
        AppState.config = {
          ...AppState.config,
          ...settings
        };
        
        // Apply theme if changed
        applyTheme(settings.theme);
      }
    });
}

// Toggle the settings panel visibility
function toggleSettingsPanel(show) {
  AppState.isSettingsOpen = show;
  
  if (show) {
    elements.settingsPanel.classList.remove('hidden');
  } else {
    elements.settingsPanel.classList.add('hidden');
  }
}

// Start voice recording
function startVoiceRecording() {
  if (!AppState.config.voiceEnabled) return;
  
  AppState.isRecording = true;
  elements.voiceIndicator.classList.remove('hidden');
  
  // Start the voice recognition process
  VoiceInput.startRecording(transcription => {
    if (transcription) {
      elements.userInput.value = transcription;
      sendMessage();
    }
    stopVoiceRecording();
  });
}

// Stop voice recording
function stopVoiceRecording() {
  AppState.isRecording = false;
  elements.voiceIndicator.classList.add('hidden');
  VoiceInput.stopRecording();
}

// Send a chat message
function sendMessage() {
  const message = elements.userInput.value.trim();
  if (!message) return;
  
  // Add user message to chat
  ChatUI.addUserMessage(message);
  
  // Clear input
  elements.userInput.value = '';
  autoResizeTextarea();
  
  // Show loading indicator
  showLoading(true);
  
  // Choose between n8n and Gemini based on connection status and settings
  if (AppState.connectionStatus === 'n8n') {
    // Use n8n
    N8nClient.sendMessage(message)
      .then(response => {
        ChatUI.addBotMessage(response);
        if (AppState.config.voiceEnabled) {
          SpeechUtils.speak(response, AppState.config.voiceGender);
        }
      })
      .catch(error => {
        console.error('n8n error:', error);
        // Fallback to Gemini if enabled
        if (AppState.config.useGemini) {
          useGeminiFallback(message);
        } else {
          ChatUI.addBotMessage("Sorry, I couldn't connect to n8n workflow. Please check your connection.");
        }
      })
      .finally(() => {
        showLoading(false);
      });
  } else if (AppState.config.useGemini) {
    // Use Gemini
    useGeminiFallback(message);
  } else {
    // No AI service available
    ChatUI.addBotMessage("No AI service is available. Please enable Gemini or check your n8n connection.");
    showLoading(false);
  }
}

// Use Gemini as fallback
function useGeminiFallback(message) {
  GeminiClient.sendMessage(message)
    .then(response => {
      ChatUI.addBotMessage(response);
      if (AppState.config.voiceEnabled) {
        SpeechUtils.speak(response, AppState.config.voiceGender);
      }
    })
    .catch(error => {
      console.error('Gemini error:', error);
      ChatUI.addBotMessage("Sorry, I couldn't connect to Google Gemini. Please check your internet connection.");
    })
    .finally(() => {
      showLoading(false);
    });
}

// Auto-resize textarea
function autoResizeTextarea() {
  const textarea = elements.userInput;
  textarea.style.height = 'auto';
  
  // Set minimum height to avoid collapse
  const minHeight = 40;
  const scrollHeight = textarea.scrollHeight;
  
  textarea.style.height = Math.max(minHeight, Math.min(scrollHeight, 120)) + 'px';
}

// Show/hide loading indicator
function showLoading(show) {
  AppState.isLoading = show;
  
  if (show) {
    elements.loadingIndicator.classList.remove('hidden');
  } else {
    elements.loadingIndicator.classList.add('hidden');
  }
}

// Update connection status indicator
function updateConnectionStatus(n8nConnected) {
  const statusElem = elements.connectionStatus;
  
  if (n8nConnected) {
    AppState.connectionStatus = 'n8n';
    statusElem.className = 'connection-status status-n8n';
    statusElem.querySelector('.status-text').textContent = 'n8n Connected';
  } else if (AppState.config.useGemini) {
    AppState.connectionStatus = 'gemini';
    statusElem.className = 'connection-status status-gemini';
    statusElem.querySelector('.status-text').textContent = 'Using Gemini';
  } else {
    AppState.connectionStatus = 'disconnected';
    statusElem.className = 'connection-status';
    statusElem.querySelector('.status-text').textContent = 'Disconnected';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 