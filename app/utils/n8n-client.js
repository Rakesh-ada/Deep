// n8n Client Utility
const N8nClient = (() => {
  // Default timeout for requests (10 seconds)
  const DEFAULT_TIMEOUT = 10000;
  
  // Store the webhook URL
  let webhookUrl = '';
  
  // Set the webhook URL
  function setWebhookUrl(url) {
    webhookUrl = url;
  }
  
  // Send a message to the n8n webhook
  async function sendMessage(message, options = {}) {
    // Get webhook URL from settings if not set yet
    if (!webhookUrl) {
      const appConfig = await getAppConfig();
      webhookUrl = appConfig.n8nWebhookUrl;
      
      if (!webhookUrl) {
        throw new Error('No n8n webhook URL configured');
      }
    }
    
    // Prepare request
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
        ...options
      })
    };
    
    // Set up timeout
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    
    // Make request with timeout
    try {
      const response = await promiseWithTimeout(
        fetch(webhookUrl, requestOptions),
        timeout,
        'Request timed out'
      );
      
      // Check response
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      // Parse response
      const data = await response.json();
      
      // Return response text
      return data.response || data.message || "I received your message but couldn't generate a response.";
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      throw error;
    }
  }
  
  // Get app configuration from parent window
  function getAppConfig() {
    return new Promise((resolve) => {
      // Listen for app config once
      window.api.onceAppConfig((config) => {
        resolve(config);
      });
      
      // Wait a bit, if we don't get a config assume it's already been sent
      setTimeout(() => {
        resolve({
          n8nWebhookUrl: localStorage.getItem('n8nWebhookUrl') || ''
        });
      }, 500);
    });
  }
  
  // Promise with timeout
  function promiseWithTimeout(promise, timeoutMs, errorMessage) {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeoutMs);
    });
    
    // Race the original promise against the timeout
    return Promise.race([promise, timeoutPromise]);
  }
  
  // Public API
  return {
    sendMessage,
    setWebhookUrl
  };
})(); 