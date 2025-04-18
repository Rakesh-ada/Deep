/**
 * Service Connector Module
 * 
 * This module manages connections to various AI services,
 * including n8n, Google Gemini, and webhook integrations.
 */

const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Connect to the appropriate AI service based on configuration
 * @param {Object} config - Configuration settings
 * @returns {Object} - Connected service interface
 */
async function connectToAIService(config = {}) {
  // Attempt to connect to n8n first if configured
  if (config.n8nWebhookUrl) {
    try {
      const n8nService = createN8nConnector(config.n8nWebhookUrl);
      const testResult = await n8nService.testConnection();
      
      if (testResult.success) {
        console.log('Successfully connected to n8n');
        return n8nService;
      } else {
        console.warn('n8n connection test failed, falling back to Gemini:', testResult.error);
      }
    } catch (error) {
      console.error('Error connecting to n8n:', error);
      console.log('Falling back to Gemini API');
    }
  }
  
  // Fall back to Gemini if n8n is not available or connection failed
  try {
    const geminiService = createGeminiConnector(config.apiKey, config.defaultModel);
    return geminiService;
  } catch (error) {
    console.error('Failed to create Gemini connector:', error);
    throw new Error('Could not connect to any AI service');
  }
}

/**
 * Create a connector for n8n webhook
 * @param {string} webhookUrl - The n8n webhook URL
 * @returns {Object} - n8n service interface
 */
function createN8nConnector(webhookUrl) {
  return {
    type: 'n8n',
    
    testConnection: async () => {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'connection_test',
            message: 'Testing connection to n8n webhook' 
          })
        });
        
        if (response.ok) {
          return { success: true };
        } else {
          return { 
            success: false, 
            error: `HTTP error ${response.status}: ${response.statusText}`
          };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    
    generateResponse: async (message, context) => {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            context: context.map(({ role, content }) => ({ role, content }))
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.response || 'No response received from n8n';
      } catch (error) {
        console.error('Error calling n8n webhook:', error);
        throw error;
      }
    }
  };
}

/**
 * Create a connector for Google Gemini API
 * @param {string} apiKey - The Gemini API key
 * @param {string} model - The model to use
 * @returns {Object} - Gemini service interface
 */
function createGeminiConnector(apiKey, model = 'gemini-pro') {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });
  
  return {
    type: 'gemini',
    
    testConnection: async () => {
      try {
        const result = await geminiModel.generateContent('Test connection');
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    
    generateResponse: async (message, context) => {
      try {
        // Format context for Gemini
        const formattedContext = context.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        }));
        
        // Add current message
        formattedContext.push({
          role: 'user',
          parts: [{ text: message }]
        });
        
        // Create chat session
        const chat = geminiModel.startChat({
          history: formattedContext.slice(0, -1),
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          }
        });
        
        // Generate response
        const result = await chat.sendMessage(message);
        const response = result.response.text();
        
        return response;
      } catch (error) {
        console.error('Error generating response with Gemini:', error);
        throw error;
      }
    }
  };
}

module.exports = {
  connectToAIService,
  createN8nConnector,
  createGeminiConnector
}; 