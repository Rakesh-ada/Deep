/**
 * Message Processor Module
 * 
 * This module is responsible for processing user messages before sending them to AI services.
 * It handles message parsing, command detection, and content preparation.
 */

/**
 * Process a user message before sending to AI service
 * @param {string} message - The raw user message
 * @param {Object} options - Additional processing options
 * @returns {string} - The processed message
 */
function processMessage(message, options = {}) {
  if (!message || typeof message !== 'string') {
    return '';
  }
  
  // Trim whitespace
  let processedMessage = message.trim();
  
  // Check for special commands
  if (processedMessage.startsWith('/')) {
    return handleCommand(processedMessage, options);
  }
  
  // Process message based on options
  if (options.preprocessor) {
    try {
      processedMessage = options.preprocessor(processedMessage);
    } catch (error) {
      console.error('Error in message preprocessor:', error);
    }
  }
  
  return processedMessage;
}

/**
 * Handle special command messages
 * @param {string} message - Command message starting with /
 * @param {Object} options - Command options
 * @returns {string} - Processed command or original message
 */
function handleCommand(message, options = {}) {
  const commandParts = message.slice(1).split(' ');
  const command = commandParts[0].toLowerCase();
  
  switch (command) {
    case 'clear':
      // This is handled by the controller, just pass it through
      return message;
      
    case 'help':
      return 'Available commands:\n/clear - Clear conversation history\n/help - Show this help message';
      
    case 'search':
      // Format search command properly
      const searchQuery = commandParts.slice(1).join(' ');
      return `Search for: ${searchQuery}`;
      
    case 'system':
      // Parse system prompt command
      const systemMessage = commandParts.slice(1).join(' ');
      return `[SYSTEM]: ${systemMessage}`;
      
    default:
      // If not a recognized command, treat as normal message
      return message;
  }
}

module.exports = {
  processMessage
}; 