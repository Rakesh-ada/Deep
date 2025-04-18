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

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  animateSections();
  simulateTyping();
  createParallax();
  enhanceMockup();
  animateGlows();
  animateAboutSection();
  animateFeatureCards();
  animateWorkflow();
  
  // Add CSS for dynamic elements
  const style = document.createElement('style');
  style.textContent = ``;
  document.head.appendChild(style);
  
  // Initial animation for landing section
  const tl = gsap.timeline();
  tl.from(".navbar", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" })
    .from(".landing h1", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.2")
    .from(".landing p", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.7")
    .from(".btn", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.7")
    .from(".mockup", { y: 50, opacity: 0, duration: 1.2, ease: "power3.out" }, "-=0.5");
  
  // Form submission handling
  document.getElementById("contact-form").addEventListener("submit", function(e) {
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
  