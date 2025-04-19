const { spawn } = require('child_process');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const childProcess = spawn(command, args, { shell: true, stdio: 'inherit', ...options });
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
    childProcess.on('error', reject);
  });
}

async function main() {
  console.log('=== Installing Electron ===');
  try {
    await runCommand('npm', ['install', '--save', 'electron@28.0.0']);
    console.log('✅ Electron installed successfully!');
  } catch (err) {
    console.error('❌ Failed to install Electron:', err.message);
    process.exit(1);
  }
}

main();
