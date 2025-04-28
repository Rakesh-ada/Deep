// Chat Demo for Deep AI Landing Page
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const chatPopup = document.getElementById('chat-popup');
  const chatBtn = document.getElementById('open-chat-btn');
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
  const API_KEY = ;
  
  // Event Listeners
  chatBtn.addEventListener('click', function(e) {
    e.preventDefault();
    chatMessages.innerHTML = '';
    chatPopup.style.display = 'flex';
    chatPopup.classList.add('show');
    chatPopup.classList.remove('minimized'); // Always restore on open
    isMinimized = false;
    
    // Remove previous minimize event listener if any
    minimizeBtn.replaceWith(minimizeBtn.cloneNode(true));
    const newMinimizeBtn = document.getElementById('minimize-chat-popup');
    newMinimizeBtn.addEventListener('click', function() {
      if (isMinimized) {
        chatPopup.classList.remove('minimized');
        isMinimized = false;
        newMinimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        newMinimizeBtn.title = 'Minimize';
      } else {
        chatPopup.classList.add('minimized');
        isMinimized = true;
        newMinimizeBtn.innerHTML = '<i class="fas fa-window-maximize"></i>';
        newMinimizeBtn.title = 'Maximize';
      }
    });
    // Always reset to minimize icon when opening
    newMinimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
    newMinimizeBtn.title = 'Minimize';
    
    startDemo();
  });
  
  closeBtn.addEventListener('click', function() {
    chatPopup.classList.remove('show');
    chatPopup.classList.remove('minimized'); // Ensure minimized state is reset on close
    isMinimized = false;
    setTimeout(() => {
      chatPopup.style.display = 'none';
    }, 300);
  });
  
  // Handle sending messages
  function sendMessage() {
    startDemo();
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
    // Remove any existing typing indicators first
    removeTypingIndicator();
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing';
    typingDiv.id = 'typing-indicator';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'typing-indicator';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'typing-dot';
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
  
  // Enhanced Demo Chat Flow with simplified timing
  function startDemo() {
    chatMessages.innerHTML = '';
    
    // Step 1: Deep greets first
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      addMessage("Hello! I'm Deep, your AI assistant. How can I help you today?", false);
      
      // Step 2: User responds immediately
      addMessage("Hi Deep!", true);
      
      // Step 3: Deep responds
      setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          addMessage("Hi there! 😊 What would you like to do today?", false);
          
          // Step 4: User asks for email
          addMessage("Can you write an email to my boss about completion of work?", true);
          
          // Step 5: Deep writes email
          setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
              removeTypingIndicator();
              const emailContent = `Subject: Completion of Project Work\n\nHi Boss,\n\nI'm pleased to inform you that I have successfully completed the assigned project work ahead of schedule. Please let me know if you need any further details or documentation.\n\nBest regards,\nYour Name`;
              addMessage(emailContent, false);
              
              // Step 6: Deep confirms sending
              setTimeout(() => {
                showTypingIndicator();
                setTimeout(() => {
                  removeTypingIndicator();
                  addMessage("Email sent to boss@gmail.com ✅", false);
                }, 1000);
              }, 1500);
            }, 2000);
          }, 1000);
        }, 1500);
      }, 1000);
    }, 1500);
  }
});
