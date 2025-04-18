#!/bin/bash

echo "=== Deep AI Chat Dependency Installer ==="
echo
echo "This script will install all required dependencies for the application."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in your PATH."
    echo "Please install Node.js from https://nodejs.org/ and try again."
    echo
    exit 1
fi

# Show Node.js version
echo "Using Node.js:"
node --version
echo

# Show npm version
echo "Using npm:"
npm --version
echo

# Make the installation script executable
chmod +x install-dependencies.js

# Run the installer script
echo "Starting dependency installation..."
echo
node install-dependencies.js

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo
    echo "Installation failed. Please check the error messages above."
    exit 1
fi

echo
echo "=== Installation completed successfully ==="
echo
echo "You can now run the application with:"
echo "  npm start"
echo
echo "Or build the application with:"
echo "  npm run build"
echo 