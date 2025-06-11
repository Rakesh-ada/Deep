# Deep AI Chat

![Platform](https://img.shields.io/badge/platform-windows%20%7C%20macOS%20%7C%20linux-blue)
![Node Version](https://img.shields.io/badge/node.js-16%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A floating, always-on-top desktop chat app powered by Google Gemini AI and n8n automation. Stay productive with a modern AI assistant that understands text and voice, handles automation, and looks good while doing it.

[![Deep AI Chat Demo](https://img.youtube.com/vi/UDvBAb-0Dgk/maxresdefault.jpg)](https://www.youtube.com/watch?v=UDvBAb-0Dgk)
*Click the image above to watch the demo video*


---

## 🚀 Quick Start

1. **Install Node.js 16+** ([Download](https://nodejs.org/))
2. **Clone the repository:**
   ```bash
   git clone https://github.com/Rakesh-ada/Deep.git
   cd Deep
   ```
3. **Install dependencies and launch:**
   ```bash
   npm install
   npm start
   ```
   The app will:
   - Install required dependencies
   - Check and install n8n (if not already present)
   - Start n8n in the background
   - Launch the floating AI chat interface

---

## 💡 How It Works

- **Integrated n8n:** App auto-starts n8n and connects, or uses your running n8n instance.
- **Dual AI Engine:** Switches between n8n (automation) and Google Gemini (natural language) for best results.
- **No manual n8n setup required!**

---


## ✨ Features

### 🪟 Floating Chat Interface
- Always-on-top, resizable, and minimizable
- Modern, animated UI
- Message history with one-click copy

### 🤖 Dual AI Engine
- **n8n AI:** Automation and custom workflows
- **Google Gemini AI:** Natural language understanding (fallback)
- **Smart Switching:** Automatic failover and status lights (🔵 n8n, 🟣 Gemini)

### 🎤 Voice Capabilities
- Google Speech-to-Text for voice input
- Text-to-Speech with male/female voices
- Visual mic controls and auto-timeout

### ⚙️ Configuration
- Launch the app and click the gear icon (⚙️) to open settings.
- Enter your n8n Webhook URL (optional, for custom workflows).
- The app will use Gemini AI if n8n is unavailable.

### 🛠️ Build & Distribution
- Cross-platform: Windows, macOS, Linux
- Build installer or portable executable (`npm run build`)

### 🧑‍💻 Developer Tools
- Real-time logs, modular code, IPC
- Auto repair for dependencies

### 🔐 Security & Privacy
- No telemetry or tracking
- Local voice fallback
- Visual network indicators

### 🔑 API Keys

### Getting API Keys
To use all features of Deep AI Chat, you'll need to obtain the following API keys:

#### Google Gemini API
1. Visit the [Google AI Studio](https://aistudio.google.com/) and sign in with your Google account
2. Navigate to the API keys section (usually found in settings or dashboard)
3. Create a new API key and copy it
4. For more details, visit the [Google AI documentation](https://ai.google.dev/tutorials/setup)

#### ElevenLabs API (for enhanced Text-to-Speech)
1. Create an account at [ElevenLabs](https://elevenlabs.io/)
2. Navigate to your profile settings
3. Find your API key in the "API" section
4. Copy your API key
5. Free tier includes limited usage; paid plans offer more voice options and usage

### Updating API Keys in the App
1. Launch Deep AI Chat
2. Click the gear icon (⚙️) in the top-right corner to open settings
3. Paste your Google Gemini API key in the "Gemini API Key" field
4. Paste your ElevenLabs API key in the "ElevenLabs API Key" field
5. Click "Save Settings"
6. The app will immediately begin using your API keys for enhanced functionality

**Note:** If you don't provide API keys, some features may be limited or unavailable. The app will attempt to use default services where possible.

---


1. Open your terminal in this project directory.
2. Run the following commands:
   ```sh
   npm install
   npm start
   ```
3. The application will launch.

## 🖥️ Installation

### Requirements
- [Node.js 16+](https://nodejs.org/)
- npm (bundled with Node.js)

### Automatic Setup
```bash
git clone https://github.com/Rakesh-ada/Deep.git
cd Deep
npm install
npm start
```

### Manual Setup (if auto-install fails)
```bash
node install-electron.js          # Downloads Electron (~250MB)
node install-dependencies.js      # Installs other dependencies
npm start
```

---

## 🏗️ Build for Distribution

```bash
npm run build
```
Creates an installer and a portable executable in the `dist/` folder.

---

## 🩺 Troubleshooting
| Problem                  | Solution                                               |
|--------------------------|--------------------------------------------------------|
| n8n not connecting       | Check if webhook URL is correct in settings            |
| App won't start          | Re-run `node install-electron.js` and `install-dependencies.js` |
| Voice not working        | Ensure microphone permissions are enabled              |
| Build fails              | Delete `dist/` and try `npm run build` again          |
| API features not working | Check that you've entered valid API keys in settings   |
| Rate limit errors        | You may have exceeded your API quota; consider upgrading your plan |

---

## 📦 Dependencies
- Electron (UI framework)
- n8n (workflow automation)
- Google Gemini (Generative AI)
- Google Cloud Speech API (voice recognition)
- ElevenLabs (Text-to-Speech)
- SQLite3 (local storage)

---

## 🙌 Credits
Built with ❤️ using [n8n](https://n8n.io/) and Google AI.

- [n8n GitHub](https://github.com/n8n-io/n8n)
- [n8n Official Website](https://n8n.io/)
- [Google AI](https://ai.google.dev/)
- [ElevenLabs](https://elevenlabs.io/)

We thank the n8n team and community for their outstanding work in workflow automation!

[![Deep AI Chat Features](https://img.youtube.com/vi/NNUuvdshQyI/maxresdefault.jpg)](https://www.youtube.com/watch?v=NNUuvdshQyI)
*Click the image above to watch the features video*