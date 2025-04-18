// Voice Input Component
const VoiceInput = (() => {
  // Speech recognition instance
  let recognition = null;
  
  // Callback for transcription result
  let resultCallback = null;
  
  // Animation elements
  const voiceAnimation = document.querySelector('.voice-animation');
  const voiceBars = document.querySelectorAll('.voice-bar');
  
  // Silence detection
  let silenceTimer = null;
  const SILENCE_TIMEOUT = 3000; // 3 seconds
  
  // Initialize speech recognition
  function initSpeechRecognition() {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return false;
    }
    
    try {
      // Create speech recognition instance
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      
      // Configure
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Set up event handlers
      setupRecognitionEvents();
      
      return true;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      return false;
    }
  }
  
  // Set up recognition event handlers
  function setupRecognitionEvents() {
    // Handle results
    recognition.onresult = (event) => {
      // Reset silence timer as we got a result
      resetSilenceTimer();
      
      // Get latest transcription
      const lastResult = event.results[event.results.length - 1];
      const transcription = lastResult[0].transcript.trim();
      
      // Display interim results in animation
      updateVoiceAnimation(lastResult.isFinal ? 'idle' : 'active');
      
      // If it's final, return the result
      if (lastResult.isFinal && resultCallback) {
        resultCallback(transcription);
      }
    };
    
    // Handle end event
    recognition.onend = () => {
      // If manually stopped, don't restart
      if (!resultCallback) return;
      
      // Try to restart if it ended unexpectedly
      try {
        recognition.start();
      } catch (error) {
        console.error('Error restarting recognition:', error);
        stopRecording();
      }
    };
    
    // Handle errors
    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      
      // Special handling for certain errors
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone access denied. Please enable microphone access to use voice input.');
        stopRecording();
      }
    };
    
    // Audio level detection for animation
    recognition.onaudiostart = () => {
      updateVoiceAnimation('idle');
      resetSilenceTimer();
    };
    
    recognition.onaudioend = () => {
      updateVoiceAnimation('idle');
    };
    
    // Handle no speech
    recognition.onnomatch = () => {
      console.log('No speech detected');
    };
  }
  
  // Start the voice recording
  function startRecording(callback) {
    if (!recognition && !initSpeechRecognition()) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    // Save the callback
    resultCallback = callback;
    
    // Start recognition
    try {
      recognition.start();
      resetSilenceTimer();
    } catch (error) {
      console.error('Error starting recognition:', error);
      alert('Could not start speech recognition. Please try again.');
    }
  }
  
  // Stop the voice recording
  function stopRecording() {
    // Clear silence timer
    clearTimeout(silenceTimer);
    silenceTimer = null;
    
    // Clear callback
    resultCallback = null;
    
    // Stop recognition
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    // Reset animation
    updateVoiceAnimation('idle');
  }
  
  // Reset silence timer
  function resetSilenceTimer() {
    // Clear existing timer
    clearTimeout(silenceTimer);
    
    // Set new timer
    silenceTimer = setTimeout(() => {
      console.log('Silence detected, stopping recording');
      
      // If we have a callback, send the final result
      if (resultCallback) {
        const finalTranscription = getFinalTranscription();
        if (finalTranscription) {
          resultCallback(finalTranscription);
        } else {
          resultCallback(null);
        }
      }
      
      // Stop recording
      stopRecording();
    }, SILENCE_TIMEOUT);
  }
  
  // Get the final transcription from the recognition results
  function getFinalTranscription() {
    if (!recognition) return null;
    
    try {
      // Try to get last transcription if available
      if (recognition.results && recognition.results.length > 0) {
        const lastResult = recognition.results[recognition.results.length - 1];
        return lastResult[0].transcript.trim();
      }
    } catch (error) {
      console.error('Error getting final transcription:', error);
    }
    
    return null;
  }
  
  // Update voice animation based on status
  function updateVoiceAnimation(status) {
    if (!voiceAnimation) return;
    
    if (status === 'active') {
      // Randomize bar heights for active animation
      voiceBars.forEach(bar => {
        const randomHeight = Math.floor(Math.random() * 20) + 10;
        bar.style.height = `${randomHeight}px`;
      });
    } else {
      // Reset to idle animation (controlled by CSS)
      voiceBars.forEach(bar => {
        bar.style.height = '';
      });
    }
  }
  
  // Check if browser supports speech recognition
  function isSpeechRecognitionSupported() {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }
  
  // Public API
  return {
    startRecording,
    stopRecording,
    isSpeechRecognitionSupported
  };
})(); 