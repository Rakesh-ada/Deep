const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Set console color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}Deep The AI - Installation Script${colors.reset}`);
console.log(`${colors.yellow}This script will install all necessary dependencies for the application.${colors.reset}\n`);

// Create needed directories
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`${colors.green}Created directory: ${dir}${colors.reset}`);
  }
};

// Main directories
ensureDirectoryExists(path.join(__dirname, 'app'));
ensureDirectoryExists(path.join(__dirname, 'app', 'components'));
ensureDirectoryExists(path.join(__dirname, 'app', 'styles'));
ensureDirectoryExists(path.join(__dirname, 'app', 'utils'));
ensureDirectoryExists(path.join(__dirname, 'assets'));
ensureDirectoryExists(path.join(__dirname, 'data'));

// Check for n8n installation
const checkN8n = () => {
  return new Promise((resolve) => {
    exec('npx n8n --version', (error) => {
      if (error) {
        console.log(`${colors.yellow}n8n not found, will be installed by npm dependencies${colors.reset}`);
      } else {
        console.log(`${colors.green}n8n already installed${colors.reset}`);
      }
      resolve();
    });
  });
};

// Install npm dependencies
const installDependencies = () => {
  return new Promise((resolve) => {
    console.log(`${colors.blue}Installing npm dependencies...${colors.reset}`);
    
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const installProcess = exec(`${npmCommand} install`, (error) => {
      if (error) {
        console.error(`${colors.red}Error installing dependencies:${colors.reset}`, error);
        console.log(`${colors.yellow}Please try running 'npm install' manually${colors.reset}`);
      } else {
        console.log(`${colors.green}Dependencies installed successfully${colors.reset}`);
      }
      resolve();
    });

    // Pipe the output to console
    installProcess.stdout.pipe(process.stdout);
    installProcess.stderr.pipe(process.stderr);
  });
};

// Create bat/sh files for easy startup
const createStartupFiles = () => {
  // Windows .bat file
  fs.writeFileSync(
    path.join(__dirname, 'start.bat'),
    '@echo off\r\necho Starting Deep The AI...\r\nnpm start\r\n'
  );
  
  // Unix .sh file
  fs.writeFileSync(
    path.join(__dirname, 'start.sh'),
    '#!/bin/bash\necho "Starting Deep The AI..."\nnpm start\n'
  );
  
  // Make the .sh file executable on Unix systems
  if (process.platform !== 'win32') {
    exec(`chmod +x ${path.join(__dirname, 'start.sh')}`);
  }
  
  console.log(`${colors.green}Created startup files:${colors.reset}`);
  console.log(`- Windows: start.bat`);
  console.log(`- Mac/Linux: start.sh`);
};

// Main installation sequence
async function runInstallation() {
  try {
    await checkN8n();
    await installDependencies();
    createStartupFiles();
    
    console.log(`\n${colors.green}Installation completed!${colors.reset}`);
    console.log(`${colors.yellow}To start the application, run:${colors.reset}`);
    console.log(`- Windows: Double-click on start.bat`);
    console.log(`- Mac/Linux: ./start.sh`);
    console.log(`- or use 'npm start' command\n`);
  } catch (error) {
    console.error(`${colors.red}Installation failed:${colors.reset}`, error);
  }
}

runInstallation(); 