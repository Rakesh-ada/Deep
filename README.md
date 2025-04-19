# Deep AI Chat

A floating chat interface desktop application using n8n for workflow automation and Google Gemini AI.

## Important Note About n8n

This application can work with n8n in two ways:
1. **Integrated Mode**: The app will automatically start n8n when launched, and stop it when closed
2. **External Mode**: If n8n is already running (e.g., you started it separately with `npx n8n start`), the app will detect and connect to it automatically

You don't need to manually install or start n8n - the application handles this automatically!

## Detailed Features

### Intelligent Chat Interface
- **Floating Window**: Always-on-top chat interface that stays accessible while using other applications
- **Resizable & Minimizable**: Expand for full conversations or minimize to a compact bar
- **Elegant UI**: Modern, clean design with smooth animations and visual feedback
- **Message History**: Stores your conversation for context and reference
- **Copy Functionality**: Easily copy any message with a single click

### Dual AI Backend System
- **n8n Integration**: Connect to custom n8n workflows for complete automation flexibility
- **Gemini 2.0 Flash**: Automatic fallback to Google's powerful Gemini AI when n8n is unavailable
- **Status Indicators**: Visual feedback shows connection status (blue for n8n, purple for Gemini)
- **Smart Failover**: Seamlessly switches between backends without disrupting the user experience
- **Real-time Status**: Shows when the system is processing or waiting for input

### Voice Capabilities
- **Speech Recognition**: Record and transcribe voice inputs using Google's Speech-to-Text API
- **Text-to-Speech**: AI responses can be read aloud with natural-sounding voice
- **Voice Gender Selection**: Choose between male and female voice options
- **Recording Controls**: Simple microphone interface with visual feedback during recording
- **Automatic Timeout**: Recording stops automatically after silence is detected

### Installation & Deployment
- **Dependency Management**: Automatic installation of all required packages
- **Cross-Platform**: Works on Windows, macOS, and Linux systems
- **Portable Option**: Create a single executable that runs without installation
- **Installer Package**: Option to create a standard installer for proper system integration
- **Automatic Updates**: Easy way to check for and install updates

### Advanced Configuration
- **Settings Interface**: Simple UI for configuring all aspects of the application
- **Connection Testing**: Built-in webhook testing to verify n8n connectivity
- **API Failover Options**: Configure how the system prioritizes different AI backends
- **Voice Settings**: Customize speech recognition and synthesis parameters
- **Appearance Options**: Adjust the application's look and behavior

### Developer-Friendly
- **Error Handling**: Comprehensive error reporting and graceful degradation
- **Logging**: Detailed console logs for troubleshooting and development
- **Well-Organized Code**: Clean, modular structure for easy modification
- **Robust IPC**: Efficient communication between renderer and main processes
- **Dependency Checking**: Runtime verification of requirements with automatic repair

### Security & Privacy
- **Local Processing**: Voice recognition with local fallback options
- **Isolated Context**: Application runs in its own environment for better security
- **No Telemetry**: No data collection or usage tracking
- **Transparent Connections**: Clear indication of where data is being sent
- **Configurable Endpoints**: Control which external services the app connects to

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- npm (included with Node.js)

### Manual Installation (Recommended)

1. **Install Electron (large download, do this first!):**
   ```
   node install-electron.js
   ```
2. **Install all other dependencies:**
   ```
   node install-dependencies.js
   ```
   - You must run both scripts from the project directory.
   - Installing Electron may take several minutes due to its large size (over 250 MB).
   - All other dependencies will install quickly in comparison.

**Troubleshooting:**
- If your install is interrupted or fails, try running the scripts again.
- A slow or unstable internet connection may cause Electron to take longer to download.


### Dependencies

The installation scripts will ensure all required dependencies are installed:

- Electron (UI framework)
- n8n (workflow automation)
- Google Cloud Speech API (voice recognition)
- Google Generative AI (Gemini model)
- SQLite3 (local storage)
- Other required packages

## Running the Application

After installation, simply run the application with:

```bash
npm start
```

This command will:
1. Check for and install any missing dependencies
2. Verify if n8n is installed and install it if needed
3. Start n8n in the background (if not already running)
4. Launch the chat interface

## Building the Application

To create a standalone executable:

```
npm run build
```

This will create:
- An installer in the `dist` folder
- A portable executable for distribution without installation

## Configuration

1. On first launch, click the gear icon to access settings
2. Configure your n8n webhook URL if you're using n8n
3. The application will automatically use Gemini AI if n8n is not configured

## Troubleshooting

- If you encounter missing dependency errors, run the installer again
- For n8n connection issues, ensure n8n is running and your webhook URL is correct
- Check the application logs for detailed error messages

## Acknowledgments

This project uses and is inspired by the amazing open-source project [n8n](https://n8n.io/).

- [n8n GitHub Repository](https://github.com/n8n-io/n8n)
- [n8n Official Website](https://n8n.io/)

We thank the n8n team and community for their outstanding work in workflow automation!