// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Moving glow effects with increased intensity
const moveGlow = (event) => {
  const glows = document.querySelectorAll('.glow');
  const mouseX = event.clientX / window.innerWidth;
  const mouseY = event.clientY / window.innerHeight;
  
  glows.forEach(glow => {
    const speed = glow.classList.contains('glow-1') ? 40 : 30;
    gsap.to(glow, {
      duration: 1.5,
      x: (mouseX - 0.5) * speed,
      y: (mouseY - 0.5) * speed,
      ease: "power2.out"
    });
  });
};

// Create ambient glow animation 
const animateGlows = () => {
  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true
  });
  
  tl.to('.glow-1', {
    opacity: 0.8,
    scale: 1.1,
    duration: 4,
    ease: "sine.inOut"
  })
  .to('.glow-2', {
    opacity: 0.7,
    scale: 1.15,
    duration: 3.5,
    ease: "sine.inOut",
  }, "-=2");
  
  return tl;
};

document.addEventListener('mousemove', moveGlow);

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      // Skip the explore button - it will be handled separately
      if (this.closest('.landing-content') && this.classList.contains('btn')) {
        return;
      }
      
      e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    
    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: target,
        offsetY: 80
      },
      ease: "power3.inOut"
    });
  });
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-links a, .btn[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only if the href starts with #
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});

// Animate elements on scroll
const animateSections = () => {
  // Animate section headings
  gsap.utils.toArray('.section h2').forEach(heading => {
    ScrollTrigger.create({
      trigger: heading,
      start: "top 80%",
      onEnter: () => {
        gsap.to(heading, {
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power3.out"
        });
      },
      once: true
    });
  });
  
  // Animate section paragraphs
  gsap.utils.toArray('.section p').forEach(paragraph => {
    ScrollTrigger.create({
      trigger: paragraph,
      start: "top 85%",
      onEnter: () => {
        gsap.to(paragraph, {
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "power2.out"
        });
      },
      once: true
    });
  });
  
  // Animate form elements
  gsap.utils.toArray('form input, form textarea, form button').forEach((element, index) => {
    ScrollTrigger.create({
      trigger: element,
      start: "top 90%",
      onEnter: () => {
        gsap.to(element, {
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          delay: index * 0.1,
          ease: "power2.out"
        });
      },
      once: true
    });
  });
  
  // Animate feature cards
  const featureCards = gsap.utils.toArray('.feature-card');
  featureCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 85%",
      onEnter: () => {
        gsap.to(card, {
          opacity: 1, 
          y: 0, 
          duration: 0.7,
          delay: index * 0.1,
          ease: "back.out(1.4)"
        });
      },
      once: true
    });
  });
  
  // Animate cards
  const cards = gsap.utils.toArray('.card');
  cards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 85%",
      onEnter: () => {
        gsap.to(card, {
          opacity: 1, 
          y: 0, 
          duration: 0.7,
          delay: index * 0.2,
          ease: "elastic.out(1, 0.8)"
        });
      },
      once: true
    });
  });
  
  // Animate list items
  gsap.utils.toArray('.section li').forEach((item, index) => {
    ScrollTrigger.create({
      trigger: item,
      start: "top 85%",
      onEnter: () => {
        gsap.to(item, {
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          delay: index * 0.1, 
          ease: "power2.out"
        });
      },
      once: true
    });
  });
  
  // Animate step cards
  const stepCards = gsap.utils.toArray('.step-card');
  stepCards.forEach((step, index) => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 85%",
      onEnter: () => {
        gsap.to(step, {
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          delay: index * 0.2,
          ease: "back.out(1.4)"
        });
      },
      once: true
    });
  });
};

// Enhanced Feature Cards Animation
const animateFeatureCards = () => {
  // Manually handle flip on click for mobile support
  document.querySelectorAll('.feature-card').forEach(card => {
    // For mobile: toggle flip on click
    card.addEventListener('click', () => {
      const inner = card.querySelector('.feature-card-inner');
      
      // If already has .is-flipped, remove it, otherwise add it
      if (inner.classList.contains('is-flipped')) {
        inner.classList.remove('is-flipped');
        gsap.to(inner, {
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      } else {
        inner.classList.add('is-flipped');
        gsap.to(inner, {
          rotationY: 180,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });
    
    // Subtle movement on mousemove, only when not flipped
    card.addEventListener('mousemove', (e) => {
      const inner = card.querySelector('.feature-card-inner');
      
      // Skip tilt effect if card is flipped
      if (inner.classList.contains('is-flipped')) return;
      
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      
      // Calculate position relative to center
      const relativeX = (e.clientX - cardCenterX) / (cardRect.width / 2);
      const relativeY = (e.clientY - cardCenterY) / (cardRect.height / 2);
      
      // Apply subtle rotation (only when not flipped)
      gsap.to(inner, {
        rotationY: relativeX * 5,
        rotationX: -relativeY * 5,
        duration: 0.5,
        ease: "power2.out"
      });
    });
    
    // Reset rotation on mouse leave
    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.feature-card-inner');
      
      // Skip reset if card is flipped
      if (inner.classList.contains('is-flipped')) return;
      
      gsap.to(inner, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    });
  });
};

// Enhanced Workflow Animation
const animateWorkflow = () => {
  // Animate the step markers on scroll
  const markers = document.querySelectorAll('.step-marker');
  const stepCards = document.querySelectorAll('.step-card.clean');
  
  // Set up scroll triggers for each step
  stepCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 70%",
      onEnter: () => {
        // Reset all markers
        markers.forEach(m => {
          m.style.opacity = "0.5";
          m.style.boxShadow = "0 0 8px rgba(0, 240, 255, 0.3)";
        });
        
        // Highlight the current marker and all previous ones
        for (let i = 0; i <= index; i++) {
          if (markers[i]) {
            markers[i].style.opacity = "1";
            markers[i].style.boxShadow = "0 0 12px rgba(0, 240, 255, 0.5)";
            markers[i].setAttribute('data-step', i + 1);
          }
        }
      },
      once: false
    });
  });
  
  // Animate step cards with clean stagger
  stepCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 85%",
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: index * 0.15,
          ease: "power2.out"
        });
      },
      once: true
    });
  });
  
  // Add subtle hover effect to icons
  stepCards.forEach(card => {
    const icon = card.querySelector('.step-icon');
    if (!icon) return;
    
    card.addEventListener('mouseenter', () => {
      gsap.to(icon, {
        y: -5,
        scale: 1.1,
        duration: 0.3,
        ease: "back.out(1.5)"
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(icon, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
};

// Typing animation in the mockup with longer delay
const simulateTyping = () => {
  const typeContainer = document.querySelector('.message.typing');
  
  if (!typeContainer) return;
  
  // Get current time for the message timestamp
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeString = `${hours > 12 ? hours - 12 : hours}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  
  // Create typing animation effect with more realistic timing
  let initialDelay = 1000; // Initial pause before typing starts
  let typingDuration = 3500; // How long the typing animation is visible
  
  // Make typing indicator visible after a short delay
  setTimeout(() => {
    // Show typing animation
    typeContainer.style.opacity = 1;
    
    // After typing duration, show the response
    setTimeout(() => {
      // Create a new message element that will appear after typing
      const newMessage = document.createElement('div');
      newMessage.className = 'message sent';
      newMessage.textContent = "I'd be happy to discuss the project timeline. When would you like to schedule a call?";
      newMessage.setAttribute('data-time', timeString);
      newMessage.style.opacity = 0;
      newMessage.style.transform = 'translateY(5px)';
      
      // Insert after typing indicator
      typeContainer.parentNode.appendChild(newMessage);
      
      // Hide typing indicator and show new message
      gsap.to(typeContainer, {
        opacity: 0,
        y: -5,
        duration: 0.3,
        onComplete: () => {
          // Remove typing indicator to avoid overlap
          typeContainer.style.display = 'none';
          
          gsap.to(newMessage, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      });
    }, typingDuration);
  }, initialDelay);
};

// Parallax effect on landing section
const createParallax = () => {
  gsap.to(".landing-content", {
    y: (i, el) => -ScrollTrigger.maxScroll(window) * 0.1,
    ease: "none",
    scrollTrigger: {
      trigger: ".landing",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true
    }
  });
};

// Enhance the mockup animation
const enhanceMockup = () => {
  // Add a subtle hover effect to the mockup
  gsap.set(".mockup", { 
    transformOrigin: "center center",
    transformPerspective: 1000
  });
  
  const mockupHover = gsap.timeline({ paused: true });
  mockupHover.to(".mockup", {
    scale: 1.02,
    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.4)",
    duration: 0.5,
    ease: "power2.out"
  });
  
  document.querySelector(".mockup")?.addEventListener("mouseenter", () => mockupHover.play());
  document.querySelector(".mockup")?.addEventListener("mouseleave", () => mockupHover.reverse());
};

// Enhanced animations for About section
const animateAboutSection = () => {
  // Animate section header
  const aboutHeaderTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.section-header',
      start: "top 80%",
      once: true
    }
  });
  
  aboutHeaderTimeline
    .to('.section-header h2', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .to('.section-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4");
  
  // Animate the callout
  gsap.to('.about-callout', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "back.out(1.4)",
    scrollTrigger: {
      trigger: '.about-callout',
      start: "top 85%",
      once: true
    }
  });
  
  // Animate description
  gsap.to('.about-description', {
    opacity: 1,
    y: 0,
    duration: 0.7,
    delay: 0.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: '.about-description',
      start: "top 85%",
      once: true
    }
  });
  
  // Animate stats with stagger
  gsap.to('.about-stats', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: '.about-stats',
      start: "top 85%",
      once: true
    },
    onComplete: () => {
      gsap.to('.stat-item', {
        stagger: 0.15,
        scale: 1.05,
        duration: 0.4,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 1
      });
    }
  });
  
  // Animate the visual section
  const visualTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-visual',
      start: "top 80%",
      once: true
    }
  });
  
  visualTimeline
    .to('.about-visual', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out"
    })
    .from('.platform-icon', {
      scale: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.5")
    .from('.ai-core', {
      scale: 0,
      rotation: -45,
      duration: 0.8,
      ease: "elastic.out(1, 0.5)"
    }, "-=0.3");
  
  // Create connection lines animation
  gsap.set('.platform-icon', { zIndex: 2 });
  
  // Add floating animation to platform icons
  gsap.to('.platform-icon', {
    y: 10,
    duration: 2,
    ease: "sine.inOut",
    stagger: 0.2,
    repeat: -1,
    yoyo: true
  });
  
  // Add pulsing animation to AI core
  gsap.to('.ai-core', {
    boxShadow: '0 0 30px rgba(0, 240, 255, 0.6)',
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
};

// Installation Guide Tabs Functionality
function initInstallationTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  if (tabBtns.length > 0 && tabContents.length > 0) {
    console.log('Installation tabs initialized');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Show corresponding content
        const tabId = btn.getAttribute('data-tab');
        const tabContent = document.getElementById(`${tabId}-tab`);
        
        if (tabContent) {
          tabContent.classList.add('active');
          console.log(`Activated tab: ${tabId}`);
        } else {
          console.error(`Tab content not found: ${tabId}-tab`);
        }
      });
    });
  } else {
    console.error('Installation tabs elements not found');
  }
}

// Chat Interface Functionality
const initChatInterface = () => {
  const chatInput = document.querySelector('.chat-input');
  const sendBtn = document.querySelector('.send-btn');
  const chatMessages = document.querySelector('.chat-messages');
  const clearChatBtn = document.querySelector('.control-btn[title="Clear chat"]');
  const popupChatMessages = document.querySelector('.chat-popup .chat-messages');
  const popupChatInput = document.querySelector('.chat-popup .chat-input');
  const popupSendBtn = document.querySelector('.chat-popup .send-btn');
  
  // Function to handle message sending for either regular or popup chat
  const handleSendMessage = async (msgInput, msgContainer) => {
    if (!msgInput || !msgContainer) return;
    
    const userMessage = msgInput.value.trim();
    if (userMessage === '') return;
    
    // Add user message to chat
    addMessage(userMessage, 'user', msgContainer);
    
    // Clear input
    msgInput.value = '';
    msgInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator(msgContainer);
    
    // Update status indicators to show connecting status
    document.querySelectorAll('.status-indicator').forEach(indicator => {
      indicator.style.backgroundColor = '#ffcc00';
      indicator.style.boxShadow = '0 0 10px #ffcc00';
    });
    
    // Send to n8n workflow
    const response = await sendToN8n(userMessage);
    if (response) {
      // Handle n8n response
      addMessage(response.message || 'Workflow executed successfully', 'assistant', msgContainer);
    }
  };
  
  // Auto-resize textarea as user types (both regular and popup)
  document.querySelectorAll('.chat-input').forEach(input => {
    input.addEventListener('input', () => {
      input.style.height = '1px';
      input.style.height = (input.scrollHeight) + 'px';
    });
    
    // Send message on Enter key (but allow shift+enter for new line)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const container = input.closest('.chat-popup') ? 
          popupChatMessages : chatMessages;
        handleSendMessage(input, container);
      }
    });
  });
  
  // Send button click handlers
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      handleSendMessage(chatInput, chatMessages);
    });
  }
  
  if (popupSendBtn) {
    popupSendBtn.addEventListener('click', () => {
      handleSendMessage(popupChatInput, popupChatMessages);
    });
  }
  
  // Clear chat history
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      // Keep only the system message
      const systemMessage = chatMessages.querySelector('.message.system');
      chatMessages.innerHTML = '';
      if (systemMessage) chatMessages.appendChild(systemMessage);
    });
  }
  
  // Add a message to the chat
  const addMessage = (text, type, container) => {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', type);
    
    const contentEl = document.createElement('div');
    contentEl.classList.add('message-content');
    
    // Parse markdown-like syntax for code
    let formattedText = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle code blocks
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    const paragraph = document.createElement('p');
    paragraph.innerHTML = formattedText;
    contentEl.appendChild(paragraph);
    messageEl.appendChild(contentEl);
    
    container.appendChild(messageEl);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  };
  
  // Show typing indicator
  const showTypingIndicator = (container) => {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'assistant', 'typing-message');
    
    const contentEl = document.createElement('div');
    contentEl.classList.add('message-content');
    
    const indicatorEl = document.createElement('div');
    indicatorEl.classList.add('typing-indicator');
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.classList.add('typing-dot');
      indicatorEl.appendChild(dot);
    }
    
    contentEl.appendChild(indicatorEl);
    typingIndicator.appendChild(contentEl);
    container.appendChild(typingIndicator);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  };
  
  // Remove typing indicator
  const removeTypingIndicator = (container) => {
    const typingMessage = container.querySelector('.typing-message');
    if (typingMessage) {
      typingMessage.remove();
    }
  };
  
  // Handle minimize button for popup
  const minimizeBtn = document.getElementById('minimize-chat-popup');
  const chatPopup = document.getElementById('chat-popup');
  
  if (minimizeBtn && chatPopup) {
    minimizeBtn.addEventListener('click', () => {
      // Minimize animation
      gsap.to(chatPopup, {
        height: '60px',
        duration: 0.3,
        ease: "power3.out"
      });
      
      // Change minimize to maximize
      minimizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
      minimizeBtn.title = "Maximize";
      
      // Swap event listener
      minimizeBtn.onclick = () => {
        gsap.to(chatPopup, {
          height: '520px',
          duration: 0.3,
          ease: "power3.out"
        });
        
        minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        minimizeBtn.title = "Minimize";
        minimizeBtn.onclick = minimizeBtn.originalHandler;
      };
      
      // Store original handler
      if (!minimizeBtn.originalHandler) {
        minimizeBtn.originalHandler = minimizeBtn.onclick;
      }
    });
  }
};

// Initialize floating chat button
const initFloatingChatButton = () => {
  const floatingBtn = document.getElementById('floating-chat-btn');
  
  if (floatingBtn) {
    // Show button after scrolling past landing section
    ScrollTrigger.create({
      trigger: '.landing',
      start: 'bottom center',
      onEnter: () => {
        floatingBtn.classList.add('visible');
      },
      onLeaveBack: () => {
        floatingBtn.classList.remove('visible');
      }
    });
    
    // Hide button when the chat section is visible
    ScrollTrigger.create({
      trigger: '#chat',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        floatingBtn.classList.remove('visible');
      },
      onLeave: () => {
        floatingBtn.classList.add('visible');
      },
      onEnterBack: () => {
        floatingBtn.classList.remove('visible');
      },
      onLeaveBack: () => {
        floatingBtn.classList.add('visible');
      }
    });
    
    // Button click handler
    floatingBtn.addEventListener('click', () => {
      // Handle popup display
      const chatPopup = document.getElementById('chat-popup');
      if (chatPopup) {
        chatPopup.style.display = 'flex';
        chatPopup.style.height = '520px';
        
        // Reset minimize button if needed
        const minimizeBtn = document.getElementById('minimize-chat-popup');
        if (minimizeBtn) {
          minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
          minimizeBtn.title = "Minimize";
        }
        
        // Animate popup
        gsap.fromTo(chatPopup, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
        );
        
        // Focus input
        setTimeout(() => {
          const chatInput = chatPopup.querySelector('.chat-input');
          if (chatInput) chatInput.focus();
        }, 600);
      }
    });
  }
};

// Section Fade Animation on Scroll
const initSectionFadeEffect = () => {
  // Set all sections to initially visible
  const sections = document.querySelectorAll('.section');
  
  // Make each section aware of its position
  sections.forEach((section, index) => {
    section.dataset.sectionIndex = index;
    
    // Ensure all sections are initially visible
    if (index === 0) {
      gsap.set(section, { opacity: 1 });
    } else {
      gsap.set(section, { opacity: 0.3 });
    }
  });
  
  // Track the current visible section
  let currentVisibleSection = 0;
  
  // Create a single ScrollTrigger that updates all sections
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      // Determine which section is most visible in the viewport
      let newCurrentSection = 0;
      let highestVisibility = 0;
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the section is visible
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const percentVisible = visibleHeight / windowHeight;
        
        if (percentVisible > highestVisibility && percentVisible > 0.2) { // Must be at least 20% visible
          highestVisibility = percentVisible;
          newCurrentSection = index;
        }
      });
      
      // Only update if the current section has changed
      if (newCurrentSection !== currentVisibleSection) {
        console.log(`Switching to section ${newCurrentSection}`);
        
        // Handle section visibility changes
        sections.forEach((section, index) => {
          if (index === newCurrentSection) {
            // Make current section fully visible
            gsap.to(section, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.inOut"
            });
          } else if (index < newCurrentSection) {
            // Make previous sections completely invisible
            gsap.to(section, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.inOut"
            });
          } else {
            // Make future sections partially visible
            gsap.to(section, {
              opacity: 0.2,
              duration: 0.5,
              ease: "power2.inOut"
            });
          }
        });
        
        // Update current section tracker
        currentVisibleSection = newCurrentSection;
      }
    }
  });
};

// Initialize bottom gradient light
const initBottomGradientLight = () => {
  // Create a blue gradient light element that follows the scroll
  const body = document.querySelector('body');
  const gradientLight = document.createElement('div');
  gradientLight.className = 'bottom-gradient-light';
  body.appendChild(gradientLight);
  
  // Position the gradient light based on scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    
    // Calculate the scroll percentage
    const scrollPercentage = scrollY / (documentHeight - windowHeight);
    
    // Update the gradient light opacity
    gradientLight.style.opacity = Math.min(0.5 + scrollPercentage * 0.5, 0.9);
  });
  
  // Make gradient subtly follow mouse movement
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    // Subtle movement based on mouse position
    gsap.to(gradientLight, {
      x: (mouseX - 0.5) * 30,
      duration: 1,
      ease: "power2.out"
    });
  });
  
  // Animate the gradient with a gentle pulsing effect
  gsap.to(gradientLight, {
    scale: 1.1,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
};

// n8n Integration Settings
let n8nConfig = {
  url: '',
  apiKey: '',
  workflowId: '',
  instanceType: 'local'
};

// Populate settings form with saved values
function populateSettingsForm() {
  document.getElementById('n8n-url').value = n8nConfig.url;
  document.getElementById('n8n-api-key').value = n8nConfig.apiKey;
  document.getElementById('n8n-workflow-id').value = n8nConfig.workflowId;
  document.getElementById('n8n-instance-type').value = n8nConfig.instanceType;
}

// Save settings
function saveSettings() {
  n8nConfig = {
    url: document.getElementById('n8n-url').value,
    apiKey: document.getElementById('n8n-api-key').value,
    workflowId: document.getElementById('n8n-workflow-id').value,
    instanceType: document.getElementById('n8n-instance-type').value
  };

  localStorage.setItem('n8nSettings', JSON.stringify(n8nConfig));
  document.getElementById('settings-modal').style.display = 'none';
  
  // Show success message
  showMessage('Settings saved successfully!', 'success');
}

// Send message to n8n workflow
async function sendToN8n(message) {
  if (!n8nConfig.url || !n8nConfig.apiKey || !n8nConfig.workflowId) {
    showMessage('Please configure n8n settings first', 'error');
    return;
  }

  try {
    const response = await fetch(`${n8nConfig.url}/webhook/${n8nConfig.workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${n8nConfig.apiKey}`
      },
      body: JSON.stringify({
        message: message
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message to n8n');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to n8n:', error);
    showMessage('Error connecting to n8n workflow', 'error');
    return null;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize bottom gradient light first to ensure it's active
  initBottomGradientLight();
  
  // Initialize all animations and interactions
  animateGlows();
  animateSections();
  animateFeatureCards();
  animateWorkflow();
  simulateTyping();
  createParallax();
  enhanceMockup();
  animateAboutSection();
  initChatInterface();
  initFloatingChatButton();
  initSectionFadeEffect();
  
  // Initialize installation tabs
  initInstallationTabs();
  
  // Populate settings form
  populateSettingsForm();
  
  // Add CSS for dynamic elements
  const style = document.createElement('style');
  style.textContent = `
    .chat-controls .settings-icon {
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.2rem;
      padding: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .chat-controls .settings-icon:hover {
      color: #00ff88;
      transform: rotate(90deg);
      background: rgba(255, 255, 255, 0.2);
    }
  `;
  document.head.appendChild(style);
  
  // Initialize settings modal
  const settingsIcon = document.querySelector('.settings-icon');
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.querySelector('.close-modal');
  const settingsForm = document.getElementById('n8n-settings-form');

  // Load saved settings
  const savedSettings = localStorage.getItem('n8nSettings');
  if (savedSettings) {
    n8nConfig = JSON.parse(savedSettings);
    populateSettingsForm();
  }

  // Open modal
  settingsIcon.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Handle form submission
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
  });
  
  // Initial animation for landing section
  const tl = gsap.timeline();
  tl.from(".navbar", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" })
    .from(".landing h1", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.2")
    .from(".landing p", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.7")
    .from(".btn", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.7")
    .from(".mockup", { y: 50, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=0.5");
  
  // Form submission handling
  document.getElementById("contact-form")?.addEventListener("submit", function(e) {
    e.preventDefault();
    
    // Animate button to show processing
    const btn = this.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Simulate form submission
    setTimeout(() => {
    this.reset();
      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    }, 1500);
  });
  
  // Make chat interface appear when clicking on the Explore button
  const exploreBtn = document.querySelector('.landing-content .btn');
  const chatPopup = document.querySelector('#chat-popup');
  
  // Initial state - chat popup is hidden
  if (chatPopup) {
    chatPopup.style.display = 'none';
  }
  
  // Handle Explore button click
  exploreBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show the chat popup
    if (chatPopup) {
      chatPopup.style.display = 'flex';
      // Reset height in case it was minimized
      chatPopup.style.height = '520px';
      
      // Reset minimize button if needed
      const minimizeBtn = document.getElementById('minimize-chat-popup');
      if (minimizeBtn) {
        minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        minimizeBtn.title = "Minimize";
      }
      
      // Animate popup
      gsap.fromTo(chatPopup, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
      
      // Focus input
      setTimeout(() => {
        const chatInput = chatPopup.querySelector('.chat-input');
        if (chatInput) chatInput.focus();
      }, 600);
    }
  });
  
  // Close button functionality for chat popup
  const closePopupBtn = document.querySelector('#close-chat-popup');
  closePopupBtn?.addEventListener('click', () => {
    if (chatPopup) {
      gsap.to(chatPopup, {
        opacity: 0, 
        y: 20, 
        duration: 0.3, 
        ease: "power3.in",
        onComplete: () => {
          chatPopup.style.display = 'none';
        }
      });
    }
  });
  
  // View full chat button functionality
  const viewFullChatBtn = document.querySelector('#view-full-chat');
  viewFullChatBtn?.addEventListener('click', () => {
    // Close the popup
    if (chatPopup) {
      gsap.to(chatPopup, {
        opacity: 0, 
        y: 20, 
        duration: 0.3, 
        ease: "power3.in",
        onComplete: () => {
          chatPopup.style.display = 'none';
        }
      });
    }
    
    // Scroll to the chat section
    const chatSection = document.querySelector('#chat');
    if (chatSection) {
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: chatSection,
          offsetY: 80
        },
        ease: "power3.inOut"
      });
    }
  });
  
  // Mobile Menu Toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      
      // Change icon based on menu state
      const icon = this.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
    
    // Close menu when clicking on a nav link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        navLinks.classList.remove('active');
        const icon = mobileMenuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      });
    });
  }
});

// Floating effect on scroll for mockup
ScrollTrigger.create({
  trigger: ".mockup",
  start: "top bottom",
  end: "bottom top",
  scrub: 1,
  onUpdate: (self) => {
    gsap.to(".mockup", {
      y: (self.progress * 50) - 25,
      duration: 0.8
    });
  }
});

// Add parallax effect to glow elements
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  scrub: 1,
  onUpdate: (self) => {
    gsap.to(".glow-1", {
      y: self.progress * -100,
      x: self.progress * 50,
      duration: 0.8
    });
    gsap.to(".glow-2", {
      y: self.progress * 100,
      x: self.progress * -50,
      duration: 0.8
    });
  }
  });