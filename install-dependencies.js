const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// List of core dependencies required by the application
const CORE_DEPENDENCIES = [
  'electron@28.0.0',
  'node-fetch@2.7.0',
  '@google-cloud/speech@7.0.1',
  '@google/generative-ai@0.2.1',
  'sqlite3@5.1.7'
];

// Optional dependencies that enhance functionality
const OPTIONAL_DEPENDENCIES = [
  'n8n@1.30.1',
  'electron-builder@24.9.1'
];

// Utility function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    // Default timeout of 15 seconds if not specified
    const timeout = options.timeout || 15000;
    let timeoutId = null;
    
    const childProcess = spawn(command, args, { 
      shell: true, 
      stdio: 'pipe',
      ...options 
    });
    
    let stdout = '';
    let stderr = '';
    
    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });
    
    childProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });
    
    childProcess.on('close', (code) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        reject({ success: false, code, stdout, stderr });
      }
    });
    
    childProcess.on('error', (error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      reject({ success: false, error, stdout, stderr });
    });
    
    // Set timeout to kill the process if it takes too long
    timeoutId = setTimeout(() => {
      console.log(`Command timed out after ${timeout}ms: ${command} ${args.join(' ')}`);
      
      if (!childProcess.killed) {
        childProcess.kill();
        reject({ 
          success: false, 
          stdout, 
          stderr, 
          error: new Error(`Command timed out after ${timeout}ms`) 
        });
      }
    }, timeout);
  });
}

// Function to check if a dependency is installed
function isDependencyInstalled(dependency) {
  const name = dependency.split('@')[0];
  
  try {
    require.resolve(name);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to install a single dependency
async function installDependency(dependency) {
  try {
    console.log(`Installing ${dependency}...`);
    await runCommand('npm', ['install', '--save', dependency]);
    console.log(`✅ ${dependency} installed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install ${dependency}: ${error.stderr || error.message}`);
    return false;
  }
}

// Function to install multiple dependencies
async function installDependencies(dependencies) {
  console.log(`Installing ${dependencies.length} dependencies...`);
  
  const results = [];
  for (const dependency of dependencies) {
    const success = await installDependency(dependency);
    results.push({ dependency, success });
  }
  
  return results;
}

// Function to check if n8n is installed
async function checkN8nInstallation() {
  try {
    console.log('Checking if n8n is installed...');
    
    // Simply check if n8n version command works, with increased timeout
    try {
      console.log('Running n8n version check with 15 second timeout...');
      const result = await runCommand('npx', ['--no-install', 'n8n', '--version'], { 
        timeout: 15000 // Increased to 15 seconds
      });
      
      if (result && result.success) {
        const version = result.stdout.trim();
        console.log(`✅ n8n is installed! Version: ${version}`);
        return { installed: true, version };
      }
    } catch (e) {
      console.log('n8n version check failed with npx:', e.message || e);
    }
    
    // Alternative method: try with plain n8n command
    try {
      let command = 'n8n';
      if (process.platform === 'win32') {
        command = 'cmd /c n8n';
      }
      
      console.log('Trying direct n8n command with 15 second timeout...');
      const result = await runCommand(command, ['--version'], { 
        timeout: 15000 // Increased to 15 seconds
      });
      
      if (result && result.success) {
        const version = result.stdout.trim();
        console.log(`✅ n8n is installed globally! Version: ${version}`);
        return { installed: true, version, isGlobal: true };
      }
    } catch (e) {
      console.log('Global n8n command not available:', e.message || e);
    }
    
    // If we get here, try one more check - see if n8n is in node_modules
    try {
      const n8nPath = require.resolve('n8n');
      console.log(`✅ Found n8n at: ${n8nPath}`);
      return { installed: true, local: true };
    } catch (e) {
      // Not found locally
      console.log('n8n not found in node_modules');
    }
    
    console.log('❌ n8n is not installed');
    return { installed: false };
  } catch (error) {
    console.error('Error checking n8n installation:', error);
    return { installed: false, error: error.message };
  }
}

// Function to ensure a package.json exists
function ensurePackageJson() {
  if (!fs.existsSync('package.json')) {
    console.log('Creating package.json...');
    const defaultPackage = {
      "name": "deep-ai-chat",
      "version": "1.0.0",
      "description": "A floating chat interface desktop application using n8n",
      "main": "main.js",
      "scripts": {
        "start": "electron .",
        "dev": "electron .",
        "clean": "rimraf dist node_modules/.cache",
        "build": "electron-builder --win",
        "build:win": "electron-builder --win",
        "build:portable": "electron-builder --win portable"
      },
      "keywords": ["electron", "chat", "ai", "n8n"],
      "author": "",
      "license": "ISC"
    };
    
    fs.writeFileSync('package.json', JSON.stringify(defaultPackage, null, 2));
  }
}

// Main installation function
async function main() {
  console.log('=== Deep AI Chat Dependency Installer ===');
  console.log('This script will install all required dependencies for the application.');
  
  // Ensure we have a package.json file
  ensurePackageJson();
  
  // Check for existing dependencies
  console.log('\nChecking core dependencies...');
  const missingCoreDependencies = CORE_DEPENDENCIES.filter(dep => !isDependencyInstalled(dep.split('@')[0]));
  
  // Install missing core dependencies
  if (missingCoreDependencies.length > 0) {
    console.log(`\nInstalling ${missingCoreDependencies.length} missing core dependencies...`);
    await installDependencies(missingCoreDependencies);
  } else {
    console.log('All core dependencies are already installed.');
  }
  
  // Check for n8n installation
  console.log('\nChecking n8n installation...');
  const n8nStatus = await checkN8nInstallation();
  
  if (n8nStatus.installed) {
    if (n8nStatus.version) {
      console.log(`✅ n8n is installed (version ${n8nStatus.version}).`);
    } else if (n8nStatus.local) {
      console.log('✅ n8n is installed locally in node_modules.');
    } else {
      console.log('✅ n8n is installed.');
    }
    console.log('You can start n8n with: npx n8n start');
  } else {
    console.log('n8n is not installed. Installing it locally...');
    const result = await installDependency('n8n@1.30.1');
    if (result) {
      console.log('✅ n8n installed successfully. You can start it with: npx n8n start');
    } else {
      console.log('⚠️ Failed to install n8n. You may need to install it manually with: npm install n8n@1.30.1');
    }
  }
  
  // Check if electron-builder is needed
  console.log('\nChecking build tools...');
  if (!isDependencyInstalled('electron-builder')) {
    console.log('Installing electron-builder for application packaging...');
    await installDependency('electron-builder@24.9.1');
  } else {
    console.log('electron-builder is already installed.');
  }
  
  console.log('\n=== Installation Complete ===');
  console.log('You can now run the application with:');
  console.log('  npm start');
  console.log('\nOr build the application with:');
  console.log('  npm run build');
  console.log('\nTo start n8n separately (if needed):');
  console.log('  npx n8n start');
}

// Run the installation
main().catch(error => {
  console.error('Installation failed:', error);
  process.exit(1);
}); 