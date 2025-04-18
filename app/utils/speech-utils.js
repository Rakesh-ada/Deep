// Speech Utilities for Text-to-Speech
const SpeechUtils = (() => {
  // Speech synthesis instance
  const synth = window.speechSynthesis;
  
  // Voice cache
  let maleVoice = null;
  let femaleVoice = null;
  let defaultVoice = null;
  
  // Rate and pitch settings
  const DEFAULT_RATE = 1.0;
  const DEFAULT_PITCH = 1.0;
  
  // Check if speech synthesis is supported
  function isSpeechSynthesisSupported() {
    return 'speechSynthesis' in window;
  }
  
  // Initialize voices
  function initVoices() {
    if (!isSpeechSynthesisSupported()) return;
    
    // Get available voices
    const voices = synth.getVoices();
    
    if (voices.length === 0) {
      // In some browsers, voices are loaded asynchronously
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = findVoices;
      }
      return;
    }
    
    findVoices(voices);
  }
  
  // Find appropriate voices
  function findVoices(voiceList) {
    if (!voiceList) {
      voiceList = synth.getVoices();
    }
    
    if (voiceList.length === 0) return;
    
    // Set default voice
    defaultVoice = voiceList[0];
    
    // Try to find good English voices
    const englishVoices = voiceList.filter(voice => voice.lang.includes('en-'));
    
    if (englishVoices.length > 0) {
      // Find male and female voices - often they contain certain keywords in their names
      const potentialFemaleVoices = englishVoices.filter(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('girl') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('lisa')
      );
      
      const potentialMaleVoices = englishVoices.filter(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('man') ||
        voice.name.toLowerCase().includes('boy') ||
        voice.name.toLowerCase().includes('david') ||
        voice.name.toLowerCase().includes('mark') ||
        voice.name.toLowerCase().includes('daniel')
      );
      
      // Set voices if found
      if (potentialFemaleVoices.length > 0) {
        femaleVoice = potentialFemaleVoices[0];
      } else {
        femaleVoice = englishVoices[0]; // Default to first English voice
      }
      
      if (potentialMaleVoices.length > 0) {
        maleVoice = potentialMaleVoices[0];
      } else if (englishVoices.length > 1) {
        // Try to pick a different voice than female
        maleVoice = englishVoices.find(voice => voice !== femaleVoice) || englishVoices[0];
      } else {
        maleVoice = englishVoices[0];
      }
    } else {
      // Just use the first available voices
      femaleVoice = voiceList[0];
      maleVoice = voiceList.length > 1 ? voiceList[1] : voiceList[0];
    }
  }
  
  // Speak text
  function speak(text, gender = 'female') {
    if (!isSpeechSynthesisSupported()) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    // Cancel any ongoing speech
    synth.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on gender
    if (gender === 'male') {
      utterance.voice = maleVoice || defaultVoice;
    } else {
      utterance.voice = femaleVoice || defaultVoice;
    }
    
    // Set other properties
    utterance.rate = DEFAULT_RATE;
    utterance.pitch = DEFAULT_PITCH;
    
    // Speak
    synth.speak(utterance);
  }
  
  // Stop speaking
  function stop() {
    if (!isSpeechSynthesisSupported()) return;
    synth.cancel();
  }
  
  // Get available voices
  function getVoices() {
    if (!isSpeechSynthesisSupported()) return [];
    return synth.getVoices();
  }
  
  // Initialize on load
  function init() {
    if (isSpeechSynthesisSupported()) {
      initVoices();
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }
  
  // Public API
  return {
    speak,
    stop,
    getVoices,
    isSpeechSynthesisSupported,
    init
  };
})();

// Initialize speech utilities
document.addEventListener('DOMContentLoaded', () => {
  SpeechUtils.init();
}); 