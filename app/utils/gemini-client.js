// Google Gemini AI Client
const GeminiClient = (() => {
  // Chat history for context
  const chatHistory = [];
  
  // Maximum history messages to keep (for context window)
  const MAX_HISTORY = 10;
  
  // Default model configurations
  const DEFAULT_MODEL = 'gemini-pro';
  const DEFAULT_TEMPERATURE = 0.7;
  const DEFAULT_TOP_K = 40;
  const DEFAULT_TOP_P = 0.95;
  
  // The Gemini API key (will be set by the main process)
  let apiKey = '';
  
  // Initialize Google Generative AI
  let genAI = null;
  let chatSession = null;
  
  // Initialize the Gemini client
  async function init() {
    try {
      // Load the Google Generative AI library dynamically
      await loadGoogleGenerativeAI();
      
      // If we already have a local API key, use it
      const localApiKey = localStorage.getItem('geminiApiKey');
      if (localApiKey) {
        apiKey = localApiKey;
        setupGenAI();
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing Gemini client:', error);
      return false;
    }
  }
  
  // Load the Google Generative AI library
  function loadGoogleGenerativeAI() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.GoogleGenerativeAI) {
        resolve();
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@google/generative-ai@latest';
      script.async = true;
      
      // Handle script loading events
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Generative AI library'));
      
      // Add script to document
      document.head.appendChild(script);
    });
  }
  
  // Set up the Google Generative AI client
  function setupGenAI() {
    if (!window.GoogleGenerativeAI || !apiKey) return;
    
    genAI = new window.GoogleGenerativeAI(apiKey);
    
    // Create a new chat session
    createChatSession();
  }
  
  // Create a new chat session
  function createChatSession() {
    if (!genAI) return;
    
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        temperature: DEFAULT_TEMPERATURE,
        topK: DEFAULT_TOP_K,
        topP: DEFAULT_TOP_P
      }
    });
    
    chatSession = model.startChat({
      history: formatHistoryForGemini(chatHistory),
      generationConfig: {
        maxOutputTokens: 1024,
      }
    });
  }
  
  // Format history for Gemini API
  function formatHistoryForGemini(history) {
    return history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }
  
  // Set the API key
  function setApiKey(key) {
    apiKey = key;
    localStorage.setItem('geminiApiKey', key);
    setupGenAI();
  }
  
  // Add a message to history
  function addToHistory(sender, text) {
    chatHistory.push({ sender, text });
    
    // Trim history if needed
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory.shift();
    }
  }
  
  // Send a message to Gemini and get a response
  async function sendMessage(message) {
    // Initialize Gemini if needed
    if (!genAI) {
      const initialized = await init();
      if (!initialized) {
        throw new Error('Failed to initialize Gemini client');
      }
    }
    
    // If we still don't have genAI, something went wrong
    if (!genAI || !chatSession) {
      throw new Error('Gemini client not initialized');
    }
    
    try {
      // Add user message to history
      addToHistory('user', message);
      
      // Send to Gemini
      const result = await chatSession.sendMessage(message);
      const response = await result.response;
      const responseText = response.text();
      
      // Add bot response to history
      addToHistory('bot', responseText);
      
      return responseText;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      
      // If API key is invalid, clear it
      if (error.message.includes('API key')) {
        apiKey = '';
        localStorage.removeItem('geminiApiKey');
      }
      
      throw error;
    }
  }
  
  // Reset the chat history
  function resetHistory() {
    chatHistory.length = 0;
    
    // Recreate chat session
    if (genAI) {
      createChatSession();
    }
  }
  
  // Get API key status
  function hasApiKey() {
    return !!apiKey;
  }
  
  // Public API
  return {
    init,
    sendMessage,
    setApiKey,
    resetHistory,
    hasApiKey
  };
})();

// Initialize on load
GeminiClient.init(); 