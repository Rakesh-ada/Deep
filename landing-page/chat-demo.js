// Chat Demo for Deep AI Landing Page
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const chatPopup = document.getElementById('chat-popup');
  const chatBtn = document.querySelector('.btn');
  const closeBtn = document.getElementById('close-chat-popup');
  const minimizeBtn = document.getElementById('minimize-chat-popup');
  const chatInput = document.querySelector('.chat-input');
  const sendBtn = document.querySelector('.send-btn');
  const chatMessages = document.querySelector('.chat-messages');
  const statusIndicator = document.querySelector('.status-indicator');
  
  // Set initial state
  let isMinimized = false;
  chatPopup.style.display = 'none';
  
  // Gemini API Key
  const API_KEY = "AIzaSyDjonLXdO1u8KdXllXSiAsZB0VFXG2iRbU";
  
  // Event Listeners
  chatBtn.addEventListener('click', function(e) {
    e.preventDefault();
    chatPopup.style.display = 'flex';
    chatPopup.classList.add('show');
    chatInput.focus();
  });
  
  closeBtn.addEventListener('click', function() {
    chatPopup.classList.remove('show');
    setTimeout(() => {
      chatPopup.style.display = 'none';
    }, 300);
  });
  
  minimizeBtn.addEventListener('click', function() {
    if (isMinimized) {
      chatPopup.classList.remove('minimized');
      isMinimized = false;
    } else {
      chatPopup.classList.add('minimized');
      isMinimized = true;
    }
  });
  
  // Handle sending messages
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      // Add user message
      addMessage(message, true);
      
      // Clear input
      chatInput.value = '';
      
      // Auto resize input
      autoResizeTextarea();
      
      // Show typing indicator
      showTypingIndicator();
      
      // Use fallback responses for the demo
      setTimeout(() => {
        removeTypingIndicator();
        useFallbackResponse(message);
      }, 1000);
    }
  }
  
  sendBtn.addEventListener('click', sendMessage);
  
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Auto resize textarea as user types
  chatInput.addEventListener('input', autoResizeTextarea);
  
  function autoResizeTextarea() {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
  }
  
  // Add message to chat
  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user' : 'message ai';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const paragraph = document.createElement('p');
    paragraph.innerHTML = formatMessage(text);
    
    contentDiv.appendChild(paragraph);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Format message with markdown-like features
  function formatMessage(text) {
    // Convert URLs to links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    
    // Convert **text** to bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert `code` to code tags
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert line breaks to <br>
    text = text.replace(/\\n/g, '<br>');
    
    return text;
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing';
    typingDiv.id = 'typing-indicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'typing-dots';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dotsDiv.appendChild(dot);
    }
    
    contentDiv.appendChild(dotsDiv);
    typingDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Function to provide fallback responses when API fails
  function useFallbackResponse(userMessage) {
    // Fallback responses if API call fails
    const fallbackResponses = [
      "I'm here to help you with any questions about Deep AI!",
      "Deep AI combines n8n workflows with Google's Gemini AI to provide a powerful chat experience.",
      "You can use Deep AI for research, creative writing, coding assistance, and much more.",
      "The floating interface allows you to access AI assistance from any application on your desktop.",
      "Deep AI supports both text and voice interactions for a natural conversation experience.",
      "You can customize workflows in n8n to extend Deep AI's capabilities for your specific needs.",
      "Deep AI works offline with local models when you don't have an internet connection.",
      "The installation process is simple - just download and run the installer from the website.",
      "Deep AI automatically manages the n8n server for you, so you don't need to worry about setup.",
      "You can find pre-built workflow templates in the Templates section of this website."
    ];
    
    // Get a semi-relevant fallback response based on the user message
    let response = "";
    
    if (userMessage.toLowerCase().includes("install") || userMessage.toLowerCase().includes("download")) {
      response = "Installing Deep AI is easy! Just download the installer from the website and run it. The application will guide you through the setup process.";
    } else if (userMessage.toLowerCase().includes("workflow") || userMessage.toLowerCase().includes("n8n")) {
      response = "Deep AI uses n8n workflows to process your requests. You can create custom workflows or use our pre-built templates to extend functionality.";
    } else if (userMessage.toLowerCase().includes("voice") || userMessage.toLowerCase().includes("speak")) {
      response = "Yes, Deep AI supports voice interactions! You can speak to the AI and hear responses through text-to-speech technology.";
    } else if (userMessage.toLowerCase().includes("offline") || userMessage.toLowerCase().includes("internet")) {
      response = "Deep AI can work offline with local models when you don't have an internet connection, ensuring you always have AI assistance.";
    } else if (userMessage.toLowerCase().includes("feature") || userMessage.toLowerCase().includes("do")) {
      response = "Deep AI offers intelligent chat, dual AI systems with n8n integration, voice capabilities, and a floating interface that's always accessible while using other applications.";
    } else if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
      response = "Hello! I'm Deep, your AI assistant. How can I help you today?";
    } else {
      // Pick a random response if no keywords match
      response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    // Add the fallback response to the chat
    addMessage(response);
  }
});
