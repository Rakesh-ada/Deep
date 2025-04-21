# Deep AI Chat

![Platform](https://img.shields.io/badge/platform-windows%20%7C%20macOS%20%7C%20linux-blue)
![Node Version](https://img.shields.io/badge/node.js-16%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A floating, always-on-top desktop chat app powered by Google Gemini AI and n8n automation. Stay productive with a modern AI assistant that understands text and voice, handles automation, and looks good while doing it.

---

## 🚀 Quick Start

1. **Install Node.js 16+** ([Download](https://nodejs.org/))
2. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/deep-ai-chat.git
   cd deep-ai-chat
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
- In-app settings (gear icon)
- Set n8n webhook URL or use Gemini fallback

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
git clone https://github.com/your-username/deep-ai-chat.git
cd deep-ai-chat
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

## ⚙️ Configuration
- Launch the app and click the gear icon (⚙️) to open settings.
- Enter your n8n Webhook URL (optional, for custom workflows).
- The app will use Gemini AI if n8n is unavailable.

---

## 🩺 Troubleshooting
| Problem                  | Solution                                               |
|--------------------------|--------------------------------------------------------|
| n8n not connecting       | Check if webhook URL is correct in settings            |
| App won’t start          | Re-run `node install-electron.js` and `install-dependencies.js` |
| Voice not working        | Ensure microphone permissions are enabled              |
| Build fails              | Delete `dist/` and try `npm run build` again          |

---

## 📦 Dependencies
- Electron (UI framework)
- n8n (workflow automation)
- Google Gemini (Generative AI)
- Google Cloud Speech API (voice recognition)
- SQLite3 (local storage)

---

## 🙌 Credits
Built with ❤️ using [n8n](https://n8n.io/) and Google AI.

- [n8n GitHub](https://github.com/n8n-io/n8n)
- [n8n Official Website](https://n8n.io/)

We thank the n8n team and community for their outstanding work in workflow automation!
