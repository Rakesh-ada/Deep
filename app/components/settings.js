// Settings Component
const Settings = (() => {
  // DOM Elements
  const settingsPanel = document.getElementById('settings-panel');
  const n8nEnabled = document.getElementById('n8n-enabled');
  const useGemini = document.getElementById('use-gemini');
  const n8nWebhookUrl = document.getElementById('n8n-webhook');
  const voiceEnabled = document.getElementById('voice-enabled');
  const voiceGender = document.getElementById('voice-gender');
  const themeSelector = document.getElementById('theme-selector');
  
  // Test n8n webhook connection
  async function testConnection(url) {
    try {
      // Simple test ping to the webhook
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'test',
          type: 'connection_test'
        })
      });
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, message: `HTTP error: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  // Validate settings before saving
  function validateSettings() {
    // If n8n is enabled, validate webhook URL
    if (n8nEnabled.checked) {
      const url = n8nWebhookUrl.value.trim();
      
      if (!url) {
        showValidationError('Please enter a webhook URL for n8n integration.');
        return false;
      }
      
      try {
        new URL(url);
      } catch (error) {
        showValidationError('Please enter a valid URL for the n8n webhook.');
        return false;
      }
    }
    
    // If neither n8n nor Gemini is enabled, show error
    if (!n8nEnabled.checked && !useGemini.checked) {
      showValidationError('At least one AI backend (n8n or Gemini) must be enabled.');
      return false;
    }
    
    return true;
  }
  
  // Show validation error
  function showValidationError(message) {
    // Create error element if it doesn't exist
    let errorElement = document.querySelector('.settings-error');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'settings-error';
      settingsPanel.querySelector('.settings-footer').prepend(errorElement);
    }
    
    // Set error message
    errorElement.textContent = message;
    
    // Automatically remove after a few seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }, 5000);
  }
  
  // Get current settings
  function getCurrentSettings() {
    return {
      n8nEnabled: n8nEnabled.checked,
      useGemini: useGemini.checked,
      n8nWebhookUrl: n8nWebhookUrl.value.trim(),
      voiceEnabled: voiceEnabled.checked,
      voiceGender: voiceGender.value,
      theme: themeSelector.value
    };
  }
  
  // Apply settings to UI
  function applySettings(settings) {
    if (!settings) return;
    
    // Apply each setting
    if (settings.n8nEnabled !== undefined) n8nEnabled.checked = settings.n8nEnabled;
    if (settings.useGemini !== undefined) useGemini.checked = settings.useGemini;
    if (settings.n8nWebhookUrl !== undefined) n8nWebhookUrl.value = settings.n8nWebhookUrl;
    if (settings.voiceEnabled !== undefined) voiceEnabled.checked = settings.voiceEnabled;
    if (settings.voiceGender !== undefined) voiceGender.value = settings.voiceGender;
    if (settings.theme !== undefined) themeSelector.value = settings.theme;
  }
  
  // Set up event handlers
  function setupEventHandlers() {
    // Toggle dependencies on n8n enabled/disabled
    n8nEnabled.addEventListener('change', () => {
      const isDisabled = !n8nEnabled.checked;
      n8nWebhookUrl.disabled = isDisabled;
      
      // If n8n is disabled and Gemini is also disabled, enable Gemini
      if (isDisabled && !useGemini.checked) {
        useGemini.checked = true;
      }
    });
    
    // Toggle dependencies on Gemini enabled/disabled
    useGemini.addEventListener('change', () => {
      // If Gemini is disabled and n8n is also disabled, enable n8n
      if (!useGemini.checked && !n8nEnabled.checked) {
        n8nEnabled.checked = true;
      }
    });
    
    // Toggle voice gender based on voice enabled
    voiceEnabled.addEventListener('change', () => {
      voiceGender.disabled = !voiceEnabled.checked;
    });
  }
  
  // Initialize
  function init() {
    setupEventHandlers();
  }
  
  // Run initialization
  init();
  
  // Public API
  return {
    getCurrentSettings,
    applySettings,
    validateSettings,
    testConnection
  };
})(); 