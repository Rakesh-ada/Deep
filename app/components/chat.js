// Chat UI Component
const ChatUI = (() => {
  // Chat Element
  const chatContainer = document.getElementById('chat-container');
  
  // Chat History
  const chatHistory = [];
  
  // Create and add user message to chat
  function addUserMessage(text) {
    const message = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    
    chatHistory.push(message);
    renderMessage(message);
    saveHistory();
    scrollToBottom();
  }
  
  // Create and add bot message to chat
  function addBotMessage(text) {
    const message = {
      sender: 'bot',
      text,
      timestamp: new Date()
    };
    
    chatHistory.push(message);
    renderMessage(message);
    saveHistory();
    scrollToBottom();
  }
  
  // Render a message in the chat container
  function renderMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Process text - handle markdown-like formatting
    let formattedText = formatText(message.text);
    
    // Add formatted text to message content
    messageContent.innerHTML = formattedText;
    
    // Add message actions for bot messages only
    if (message.sender === 'bot') {
      const messageActions = document.createElement('div');
      messageActions.className = 'message-actions';
      
      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'message-action-btn';
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      copyBtn.title = 'Copy to clipboard';
      copyBtn.addEventListener('click', () => {
        copyToClipboard(message.text);
        
        // Show copied feedback
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      });
      
      messageActions.appendChild(copyBtn);
      messageContent.appendChild(messageActions);
    }
    
    messageElement.appendChild(messageContent);
    chatContainer.appendChild(messageElement);
  }
  
  // Format text with basic markdown-like syntax
  function formatText(text) {
    // Convert newlines to <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Convert code blocks with syntax highlighting
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre><code>$2</code></pre>');
    
    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Bulleted lists
    formatted = formatted.replace(/^\s*\*\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/<li>(.+)<\/li>\s*<li>/g, '<li>$1</li><li>');
    formatted = formatted.replace(/(<li>.+<\/li>)+/g, '<ul>$&</ul>');
    
    // Simple URLs
    formatted = formatted.replace(/https?:\/\/[^\s<)]+/g, '<a href="$&" target="_blank">$&</a>');
    
    return formatted;
  }
  
  // Copy text to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }
  
  // Scroll chat to bottom
  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  // Save chat history to local storage
  function saveHistory() {
    const historyToSave = chatHistory.map(msg => ({
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp.toISOString()
    }));
    localStorage.setItem('chatHistory', JSON.stringify(historyToSave));
  }
  
  // Load chat history from local storage
  function loadHistory() {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        
        // Clear existing messages
        chatContainer.innerHTML = '';
        chatHistory.length = 0;
        
        // Add each message from history
        parsedHistory.forEach(msg => {
          const message = {
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.timestamp)
          };
          
          chatHistory.push(message);
          renderMessage(message);
        });
        
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }
  
  // Initialize and load history
  function init() {
    loadHistory();
  }
  
  // Run initialization
  init();
  
  // Public API
  return {
    addUserMessage,
    addBotMessage,
    scrollToBottom
  };
})(); 