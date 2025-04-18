const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const speech = require('@google-cloud/speech');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Google API key
const GOOGLE_API_KEY = 'AIzaSyDG6ln6ljylsBOFmTmIgG9_Y2IkpInRZ84';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Create a custom user data directory in the app's directory
const userDataPath = path.join(app.getPath('userData'), 'ChatAppData');

// Ensure the directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Set the user data directory
app.setPath('userData', userDataPath);

let win;
let n8nProcess = null;

// Function to check dependencies
function checkDependencies() {
  const requiredDependencies = [
    { name: 'node-fetch', module: 'node-fetch' },
    { name: '@google-cloud/speech', module: '@google-cloud/speech' },
    { name: '@google/generative-ai', module: '@google/generative-ai' },
    { name: 'sqlite3', module: 'sqlite3' }
  ];
  
  const missingDependencies = [];
  
  for (const dep of requiredDependencies) {
    try {
      require.resolve(dep.module);
      console.log(`Dependency ${dep.name} is installed.`);
    } catch (error) {
      console.error(`Dependency ${dep.name} is missing or cannot be loaded: ${error.message}`);
      missingDependencies.push(dep.name);
    }
  }
  
  return missingDependencies;
}

// Function to install missing dependencies
async function installMissingDependencies(dependencies) {
  console.log(`Installing missing dependencies: ${dependencies.join(', ')}`);
  
  return new Promise((resolve, reject) => {
    const installProcess = spawn('npm', ['install', '--save', ...dependencies], { 
      shell: true, 
      stdio: 'pipe' 
    });
    
    let output = '';
    
    installProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log(`npm install stdout: ${chunk}`);
    });
    
    installProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.error(`npm install stderr: ${chunk}`);
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Dependencies installed successfully.');
        resolve(true);
      } else {
        console.error(`Failed to install dependencies. Exit code: ${code}`);
        console.error('Installation output:', output);
        reject(new Error(`npm install failed with exit code ${code}`));
      }
    });
    
    installProcess.on('error', (error) => {
      console.error('Error starting npm install:', error);
      reject(error);
    });
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      partition: 'persist:chatapp'
    },
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    titleBarStyle: 'hidden',
    roundedCorners: true,
    hasShadow: true,
    icon: path.join(__dirname, 'assets/deep.ico')
  });

  win.loadFile('index.html');
  
  // Position window in the bottom right corner
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;
  win.setPosition(width - 420, height - 620);
  
  // Disable main menu
  win.setMenu(null);
  
  // Handle window errors
  win.webContents.on('crashed', () => {
    console.log('Window crashed, restarting...');
    if (win) {
      win.destroy();
      createWindow();
    }
  });
  
  // Handle window closed event
  win.on('closed', () => {
    console.log('Window closed, terminating n8n...');
    terminateN8n();
    win = null;
  });
}

app.whenReady().then(async () => {
  // Clear any corrupted cache before starting
  app.commandLine.appendSwitch('disable-http-cache');
  
  // Check for dependencies
  const missingDependencies = checkDependencies();
  
  if (missingDependencies.length > 0) {
    console.log(`Missing dependencies detected: ${missingDependencies.join(', ')}`);
    try {
      await installMissingDependencies(missingDependencies);
      console.log('All dependencies are now installed.');
    } catch (error) {
      console.error('Failed to install missing dependencies:', error);
      // Continue anyway, but some features might not work
    }
  } else {
    console.log('All required dependencies are installed.');
  }
  
  // Check if n8n is installed
  const n8nInstalled = await isN8nInstalled();
  console.log('n8n installation status:', n8nInstalled ? 'Installed ✅' : 'Not installed ❌');
  
  if (!n8nInstalled) {
    console.log('n8n is not installed, attempting to install...');
    try {
      await installN8n();
      console.log('n8n was installed successfully.');
    } catch (error) {
      console.error('Failed to install n8n:', error);
      console.log('Will continue without n8n and use Gemini API instead.');
    }
  } else {
    console.log('n8n is already installed, no need to reinstall.');
  }
  
  // Start n8n process or detect running instance
  await startN8n();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill n8n process if it's running
  terminateN8n();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Function to handle n8n process when app is quitting
app.on('will-quit', async (event) => {
  console.log('App is quitting, ensuring n8n is properly cleaned up...');
  
  // Check if we should terminate n8n
  const shouldTerminateN8n = await shouldTerminateExternalN8n();
  
  if (shouldTerminateN8n) {
    console.log('Attempting to terminate n8n process...');
    
    // If n8n process is still running, prevent immediate quit to allow for cleanup
    if (n8nProcess !== null) {
      event.preventDefault();
      
      // Terminate n8n with a proper callback
      terminateN8n(() => {
        console.log('n8n termination complete, resuming app quit sequence');
        setTimeout(() => app.quit(), 500);
      });
    } else {
      console.log('No n8n child process to terminate');
    }
  } else {
    console.log('n8n process was started externally - leaving it running');
  }
});

// Helper function to determine if we should terminate the external n8n process
async function shouldTerminateExternalN8n() {
  // If we have an n8nProcess, we started it and should terminate it
  if (n8nProcess !== null) {
    return true;
  }
  
  // If n8n is running but we didn't start it, check user preferences
  // For now, we default to leaving externally started n8n processes running
  return false;
}

// Function to terminate n8n process with callback
function terminateN8n(callback) {
  if (n8nProcess !== null) {
    console.log('Terminating n8n process...');
    
    // Flag to track if the callback has been called
    let callbackCalled = false;
    
    // Function to ensure callback is only called once
    const safeCallback = () => {
      if (!callbackCalled) {
        callbackCalled = true;
        if (typeof callback === 'function') {
          callback();
        }
      }
    };
    
    // Set a timeout to ensure the callback is called even if termination fails
    const timeoutId = setTimeout(() => {
      console.log('n8n termination timeout reached');
      safeCallback();
    }, 3000);
    
    try {
      // On Windows, we need to kill the entire process tree
      if (process.platform === 'win32') {
        // First try taskkill to kill the process tree
        const taskkill = spawn('taskkill', ['/pid', n8nProcess.pid, '/f', '/t'], { detached: true });
        
        taskkill.on('close', (code) => {
          if (code !== 0) {
            console.log(`taskkill exited with code ${code}, trying alternative method`);
            try {
              process.kill(n8nProcess.pid, 'SIGKILL');
            } catch (e) {
              console.error('Failed to kill process with process.kill:', e);
            }
          }
          
          // Clear the timeout and call the callback
          clearTimeout(timeoutId);
          safeCallback();
        });
      } else {
        // For Unix-like systems, try SIGTERM first
        try {
          n8nProcess.kill('SIGTERM');
          
          // Wait for the process to exit
          n8nProcess.on('exit', () => {
            clearTimeout(timeoutId);
            safeCallback();
          });
          
          // If the process doesn't exit in 2 seconds, try SIGKILL
          setTimeout(() => {
            try {
              if (n8nProcess && !n8nProcess.killed) {
                console.log('Process did not terminate with SIGTERM, using SIGKILL');
                n8nProcess.kill('SIGKILL');
              }
            } catch (e) {
              console.error('Error in SIGKILL fallback:', e);
            }
          }, 2000);
        } catch (e) {
          console.error('Failed to terminate process with SIGTERM:', e);
          try {
            n8nProcess.kill('SIGKILL');
            setTimeout(safeCallback, 500);
          } catch (e2) {
            console.error('Failed to terminate process with SIGKILL:', e2);
            safeCallback();
          }
        }
      }
    } catch (error) {
      console.error('Error terminating n8n process:', error);
      clearTimeout(timeoutId);
      safeCallback();
    }
    
    // Reset the process reference
    n8nProcess = null;
  } else if (typeof callback === 'function') {
    // No process to terminate, call the callback directly
    callback();
  }
}

// IPC handlers
ipcMain.handle('minimize-window', () => {
  // Don't minimize to taskbar - we're handling this in the renderer
  // with our own UI minimization
});

ipcMain.handle('start-drag', () => {
  win.setMovable(true);
});

ipcMain.handle('resize-window', (event, width, height) => {
  // Get current position
  const [x, y] = win.getPosition();
  
  // If minimizing, keep the x position but adjust y to keep it at the bottom
  if (height === 60) {
    const screenHeight = require('electron').screen.getPrimaryDisplay().workAreaSize.height;
    win.setSize(width, height);
    win.setPosition(x, screenHeight - height);
    
    // For Windows: ensure the window corners are correct when minimized
    if (process.platform === 'win32') {
      win.setOpacity(0.98); // Quick trick to refresh the window shape
      setTimeout(() => win.setOpacity(1), 50);
    }
  } else {
    // If expanding, maintain the x position but adjust y to keep bottom aligned
    const screenHeight = require('electron').screen.getPrimaryDisplay().workAreaSize.height;
    win.setSize(width, height);
    win.setPosition(x, screenHeight - height);
    
    // For Windows: ensure the window corners are correct when maximized
    if (process.platform === 'win32') {
      win.setOpacity(0.98); // Quick trick to refresh the window shape
      setTimeout(() => win.setOpacity(1), 50);
    }
  }
});

// Function to check if n8n is installed with a simple version check
async function isN8nInstalled() {
  return new Promise((resolve) => {
    console.log('Checking if n8n is available...');
    
    // Use the --no-install flag to prevent npx from installing missing packages
    const checkCmd = process.platform === 'win32' ? 
      'npx --no-install n8n --version' : 
      'npx --no-install n8n --version';
    
    const checkProcess = spawn(checkCmd, [], { 
      shell: true, 
      stdio: 'pipe',
      // Set a longer timeout of 15 seconds
      timeout: 15000
    });
    
    let output = '';
    let errorOutput = '';
    
    checkProcess.stdout.on('data', (data) => {
      output += data.toString().trim();
    });
    
    checkProcess.stderr.on('data', (data) => {
      errorOutput += data.toString().trim();
    });
    
    checkProcess.on('close', (code) => {
      if (code === 0 && output) {
        console.log(`✅ n8n is available: version ${output}`);
        resolve(true);
      } else {
        console.log('n8n version check with npx failed, trying alternative method');
        
        // Try alternative approach with execSync for immediate result
        try {
          const { execSync } = require('child_process');
          const result = execSync('npx --no-install n8n --version', { 
            timeout: 10000,  // Increase to 10 seconds
            encoding: 'utf8'
          }).trim();
          
          if (result) {
            console.log(`✅ n8n is available (exec check): version ${result}`);
            resolve(true);
            return;
          }
        } catch (e) {
          console.log('Alternative version check failed:', e.message);
        }
        
        // Check if n8n is in node_modules as last resort
        try {
          const n8nPath = require.resolve('n8n');
          console.log(`✅ Found n8n in node_modules at: ${n8nPath}`);
          resolve(true);
          return;
        } catch (moduleErr) {
          console.log('n8n not found in node_modules');
        }
        
        console.log('❌ n8n appears to be not installed or not accessible');
        if (errorOutput) {
          console.log('Error output:', errorOutput);
        }
        resolve(false);
      }
    });
    
    checkProcess.on('error', (error) => {
      console.log(`n8n check error: ${error.message}`);
      
      // Try with require.resolve as fallback
      try {
        const n8nPath = require.resolve('n8n');
        console.log(`✅ Found n8n in node_modules at: ${n8nPath}`);
        resolve(true);
      } catch (e) {
        console.log('❌ n8n is not installed in node_modules');
        resolve(false);
      }
    });
    
    // Set a timeout in case the check hangs - increased to 15 seconds
    setTimeout(() => {
      if (checkProcess.exitCode === null) {
        checkProcess.kill();
        console.log('n8n check timed out after 15 seconds, trying alternative detection method');
        
        // Use synchronous exec as a more reliable check
        try {
          const { execSync } = require('child_process');
          const result = execSync('npx --no-install n8n --version', { 
            timeout: 10000,  // Increase to 10 seconds
            encoding: 'utf8'
          }).trim();
          
          if (result) {
            console.log(`✅ n8n is available (backup check): version ${result}`);
            resolve(true);
            return;
          }
        } catch (e) {
          console.log('Backup version check failed:', e.message);
        }
        
        // Last resort - check if module exists in node_modules
        try {
          const n8nPath = require.resolve('n8n');
          console.log(`✅ Found n8n in node_modules at: ${n8nPath}`);
          resolve(true);
        } catch (e) {
          console.log('❌ n8n is not found in node_modules');
          resolve(false);
        }
      }
    }, 15000); // Increased to 15 seconds
  });
}

// Function to check if n8n is already running on the standard port
async function isN8nRunning() {
  try {
    // First check if n8n is installed at all
    const n8nInstalled = await isN8nInstalled();
    if (!n8nInstalled) {
      console.log('n8n is not installed, so it cannot be running');
      return false;
    }
    
    console.log('Checking if n8n is already running on localhost:5678...');
    
    // Use a longer timeout of 15 seconds since n8n can sometimes be slow to respond
    const response = await fetch('http://localhost:5678/healthz', {
      method: 'GET',
      timeout: 15000 // Increased to 15 seconds
    }).catch(error => {
      console.log(`Network error when checking n8n: ${error.message}`);
      return null;
    });
    
    if (response && response.ok) {
      console.log('✅ n8n is already running on localhost:5678');
      return true;
    } else if (response) {
      console.log(`n8n responded with status: ${response.status}`);
    }
    
    // If the above check failed, try checking if we can access the editor page
    // Sometimes the healthz endpoint might not respond but the editor is available
    try {
      const editorResponse = await fetch('http://localhost:5678', {
        method: 'GET',
        timeout: 15000 // Increased to 15 seconds
      }).catch(() => null);
      
      if (editorResponse && (editorResponse.ok || editorResponse.status === 302)) {
        console.log('✅ n8n editor page is accessible');
        return true;
      }
    } catch (editorError) {
      console.log('Could not connect to n8n editor page');
    }
  } catch (error) {
    console.log(`Error checking if n8n is running: ${error.message}`);
  }
  
  return false;
}

// Function to start n8n
async function startN8n() {
  // Check if n8n is already running
  if (n8nProcess) {
    console.log('n8n child process is already running');
    return;
  }
  
  // Check if n8n is already running as an external process, with increased timeout
  console.log('Checking if n8n is already running (with 15 second timeout)...');
  let startTime = Date.now();
  const alreadyRunning = await isN8nRunning();
  let elapsed = Date.now() - startTime;
  console.log(`n8n running check completed in ${elapsed}ms`);
  
  if (alreadyRunning) {
    console.log('n8n is already running externally (possibly in your terminal) - will connect to it');
    if (win && !win.isDestroyed()) {
      // Notify the renderer that n8n is ready
      setTimeout(() => {
        win.webContents.send('n8n-started');
        console.log('Sent n8n-started event to renderer');
      }, 1000);
    }
    return;
  }

  console.log('Starting n8n...');
  
  // Path to the bundled n8n executable
  let n8nPath = path.join(process.resourcesPath, 'app', 'node_modules', 'n8n', 'bin', 'n8n');
  
  // If we're in development mode, use the local node_modules path
  if (process.env.NODE_ENV === 'development' || !process.resourcesPath) {
    n8nPath = path.join(__dirname, 'node_modules', 'n8n', 'bin', 'n8n');
  }

  // Check if n8n is installed
  if (!fs.existsSync(n8nPath)) {
    console.error(`n8n executable not found at: ${n8nPath}`);
    
    // Try with npx as a fallback
    try {
      console.log('Attempting to start n8n using npx...');
      n8nProcess = spawn('npx', ['n8n', 'start'], { shell: true });
      
      // Check if npx is not found or n8n is not installed globally
      n8nProcess.stderr.once('data', (data) => {
        const output = data.toString();
        if (output.includes('not found') || output.includes('not recognized') || 
            output.includes('Cannot find') || output.includes('not installed')) {
          console.error('n8n is not installed globally or npx is not available');
          if (win && !win.isDestroyed()) {
            win.webContents.send('n8n-not-installed', {
              error: 'n8n is not installed. Using Gemini AI instead.'
            });
          }
        }
      });
    } catch (error) {
      console.error('Failed to start n8n with npx:', error);
      if (win && !win.isDestroyed()) {
        win.webContents.send('n8n-not-installed', {
          error: `Failed to start n8n: ${error.message}`
        });
      }
      return;
    }
  } else {
    // Use the bundled n8n
    try {
      n8nProcess = spawn(process.platform === 'win32' ? 'node' : 'node', [n8nPath, 'start'], { shell: true });
    } catch (error) {
      console.error('Failed to start bundled n8n:', error);
      if (win && !win.isDestroyed()) {
        win.webContents.send('n8n-not-installed', {
          error: `Failed to start bundled n8n: ${error.message}`
        });
      }
      return;
    }
  }

  n8nProcess.stdout.on('data', (data) => {
    console.log(`n8n stdout: ${data}`);
    // Notify renderer that n8n has started when we see it's ready
    if (data.toString().includes('n8n ready')) {
      if (win && !win.isDestroyed()) {
        win.webContents.send('n8n-started');
      }
    }
  });

  n8nProcess.stderr.on('data', (data) => {
    console.error(`n8n stderr: ${data}`);
  });

  n8nProcess.on('close', (code) => {
    console.log(`n8n process exited with code ${code}`);
    n8nProcess = null;
  });
}

// Additional IPC handler for direct Gemini API integration
ipcMain.handle('gemini-chat', async (event, message) => {
  try {
    console.log('Processing message with Gemini API:', message);
    
    // Use Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Send the message to Gemini API
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini API response:', text);
    return { success: true, response: text };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { 
      success: false, 
      error: error.message
    };
  }
});

// Function to check n8n status with fallback to Gemini
ipcMain.handle('check-n8n-status', async () => {
  try {
    // Try to connect to n8n to check if it's running
    const response = await fetch('http://localhost:5678/healthz', {
      method: 'GET',
      timeout: 2000 // Add a timeout to prevent long waits
    });
    
    if (response.ok) {
      // n8n is running properly
      console.log('n8n health check successful - running on localhost:5678');
      return { running: true, useGemini: false };
    } else {
      console.log('n8n responded but with an error:', response.status);
      // Only use Gemini if n8n explicitly fails
      return { running: false, useGemini: true, error: `Unexpected response: ${response.status}` };
    }
  } catch (error) {
    console.error('Error checking n8n status:', error);
    // Only use Gemini as fallback when n8n is not available
    return { running: false, useGemini: true };
  }
});

ipcMain.handle('start-n8n', () => {
  if (n8nProcess === null) {
    startN8n();
    return { started: true };
  } else {
    return { started: false, message: 'n8n is already running' };
  }
});

// IPC handler for application termination
ipcMain.handle('quit-app', () => {
  console.log('Quit command received from renderer process');
  
  // Make sure n8n is terminated
  terminateN8n();
  
  // Force quit the app after a short delay to allow for cleanup
  setTimeout(() => {
    console.log('Force quitting application...');
    app.exit(0); // Force exit with success code
  }, 1000);
  
  return { success: true };
});

// Additional IPC handlers for speech recognition
ipcMain.handle('recognize-speech', async (event, audioBuffer) => {
  try {
    console.log('Received audio for speech recognition');
    
    // Validate the audio buffer
    if (!audioBuffer) {
      console.error('Audio buffer is undefined or empty');
      return { 
        success: false, 
        error: 'No audio data received', 
        useBrowser: true
      };
    }
    
    // Additional validation to ensure buffer has content
    if (typeof audioBuffer !== 'string' || audioBuffer.length < 100) {
      console.error('Audio buffer is invalid or too small:', 
        typeof audioBuffer === 'string' ? `Length: ${audioBuffer.length}` : typeof audioBuffer);
      return { 
        success: false, 
        error: 'Invalid audio data received', 
        useBrowser: true
      };
    }
    
    // API key provided by the user
    const apiKey = 'AIzaSyDG6ln6ljylsBOFmTmIgG9_Y2IkpInRZ84';
    
    // Log audio buffer information for debugging
    console.log('Audio buffer length:', audioBuffer.length);
    
    // Prepare the request data - ensure audio content is properly formatted
    const requestData = {
      config: {
        encoding: 'WEBM_OPUS',  // Changed to match what MediaRecorder produces
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        model: 'command_and_search'  // Better for short commands
      },
      audio: {
        content: audioBuffer  // This is already base64 encoded from the client
      }
    };
    
    // Make a direct HTTP request to the Speech-to-Text API
    try {
      console.log('Sending request to Speech-to-Text API...');
      
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData)
        }
      );
      
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}\nResponse: ${responseText}`);
      }
      
      // Parse the response text to JSON
      const data = JSON.parse(responseText);
      console.log('Speech API response:', data);
      
      // Extract the transcription
      if (data.results && data.results.length > 0) {
        const transcription = data.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
        
        console.log('Speech recognition result:', transcription);
        return { success: true, text: transcription };
      } else {
        console.log('No speech recognized');
        return { success: false, error: 'No speech recognized', useBrowser: true };
      }
    } catch (error) {
      console.error('Error calling Speech-to-Text API:', error);
      return { success: false, error: error.message, useBrowser: true };
    }
  } catch (error) {
    console.error('Speech recognition error:', error);
    
    // Instruct the renderer to use browser's speech recognition as fallback
    return { 
      success: false, 
      error: error.message,
      useBrowser: true 
    };
  }
});

// Additional IPC handlers for text-to-speech
ipcMain.handle('text-to-speech', async (event, text, voiceGender = 'FEMALE') => {
  try {
    console.log('Generating speech for text:', text);
    console.log('Using voice gender:', voiceGender);
    
    // API key provided by the user
    const apiKey = 'AIzaSyDG6ln6ljylsBOFmTmIgG9_Y2IkpInRZ84';
    
    // Select voice based on gender
    const voiceName = voiceGender === 'MALE' ? 'en-US-Neural2-D' : 'en-US-Neural2-F';
    const ssmlGender = voiceGender === 'MALE' ? 'MALE' : 'FEMALE';
    
    // Prepare the request data for Text-to-Speech
    const requestData = {
      input: {
        text: text
      },
      voice: {
        languageCode: 'en-US',
        name: voiceName, // Neural voice based on gender
        ssmlGender: ssmlGender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 1.0
      }
    };
    
    // Make a direct HTTP request to the Text-to-Speech API
    try {
      console.log('Sending request to Text-to-Speech API...');
      
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        }
      );
      
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response text:', responseText);
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
      
      // Parse the response to get the audio content (base64 encoded)
      const data = JSON.parse(responseText);
      if (data.audioContent) {
        console.log('Speech generated successfully');
        return { success: true, audioContent: data.audioContent };
      } else {
        console.error('No audio content in response');
        return { success: false, error: 'No audio content received' };
      }
    } catch (error) {
      console.error('Error calling Text-to-Speech API:', error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return { success: false, error: error.message };
  }
});

// Function to check if n8n is installed globally
async function checkN8nInstallation() {
  return new Promise((resolve) => {
    console.log('Checking if n8n is installed...');
    
    // First, check if n8n is bundled with the app
    let n8nPath = path.join(process.resourcesPath, 'app', 'node_modules', 'n8n', 'bin', 'n8n');
    
    // If we're in development mode, use the local node_modules path
    if (process.env.NODE_ENV === 'development' || !process.resourcesPath) {
      n8nPath = path.join(__dirname, 'node_modules', 'n8n', 'bin', 'n8n');
    }
    
    if (fs.existsSync(n8nPath)) {
      console.log(`n8n is installed locally at: ${n8nPath}`);
      return resolve({ installed: true, path: n8nPath, isLocal: true });
    }
    
    // If not found locally, check if it's available via npx
    const checkProcess = spawn('npx', ['n8n', '--version'], { 
      shell: true, 
      stdio: 'pipe' 
    });
    
    let output = '';
    let errorOutput = '';
    
    checkProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    checkProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    checkProcess.on('close', (code) => {
      if (code === 0 && output.trim()) {
        console.log(`n8n is installed globally: version ${output.trim()}`);
        resolve({ installed: true, version: output.trim(), isGlobal: true });
      } else {
        console.log('n8n is not installed globally or is not accessible');
        console.log('Error output:', errorOutput);
        resolve({ installed: false, error: errorOutput });
      }
    });
    
    checkProcess.on('error', (error) => {
      console.error('Error checking n8n installation:', error);
      resolve({ installed: false, error: error.message });
    });
    
    // Set a timeout in case the check hangs
    setTimeout(() => {
      if (checkProcess.exitCode === null) {
        checkProcess.kill();
        console.log('n8n installation check timed out');
        resolve({ installed: false, error: 'Check timed out' });
      }
    }, 5000);
  });
}

// Function to attempt installing n8n
async function installN8n() {
  console.log('Attempting to install n8n locally...');
  
  return new Promise((resolve, reject) => {
    const installProcess = spawn('npm', ['install', '--save', 'n8n@latest'], { 
      shell: true, 
      stdio: 'pipe' 
    });
    
    let output = '';
    
    installProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log(`n8n install stdout: ${chunk}`);
    });
    
    installProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.error(`n8n install stderr: ${chunk}`);
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('n8n installed successfully.');
        resolve(true);
      } else {
        console.error(`Failed to install n8n. Exit code: ${code}`);
        console.error('Installation output:', output);
        reject(new Error(`n8n installation failed with exit code ${code}`));
      }
    });
    
    installProcess.on('error', (error) => {
      console.error('Error starting n8n installation:', error);
      reject(error);
    });
  });
}

// Function to notify renderer about dependency status
function notifyDependencyStatus(window, status) {
  if (window && !window.isDestroyed()) {
    window.webContents.send('dependency-status', status);
  }
}

// Add an IPC handler to get dependency status
ipcMain.handle('get-dependency-status', async () => {
  const missingDependencies = checkDependencies();
  const n8nStatus = await checkN8nInstallation();
  
  return {
    allDependenciesInstalled: missingDependencies.length === 0,
    missingDependencies: missingDependencies,
    n8n: n8nStatus
  };
}); 