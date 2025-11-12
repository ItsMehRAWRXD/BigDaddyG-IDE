# 🎯 BigDaddyG IDE - Complete Usage Guide

## 🚀 Quick Start

### Windows:
```batch
Double-click: START-IDE.bat
```

### Linux/Mac:
```bash
./START-IDE.sh
```

### Manual:
```bash
npm install  # First time only
npm start
```

---

## 📋 System Requirements

### Required:
- **Node.js** v16+ (https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for auto-updates)
- **4GB RAM** minimum
- **500MB disk space**

### Optional (for AI features):
- **Ollama** (https://ollama.ai/)
- **GPU** (for faster AI)
- **8GB+ RAM** (for better performance)

---

## 🎨 IDE Features

### Core Features (Always Available):
✅ **Code Editor** - Syntax highlighting, multiple files
✅ **File Explorer** - Browse, open, create, save files
✅ **Terminal** - Built-in command line
✅ **Debugger** - Breakpoints, watches, call stack
✅ **Tabs** - Unlimited tabs, Ctrl+T to create
✅ **Keyboard Shortcuts** - Full VS Code-like shortcuts
✅ **Themes** - Dark/light mode, customizable
✅ **Settings** - All IDE preferences
✅ **Auto-Update** - Automatic updates from GitHub

### AI Features (Requires Ollama):
🤖 **AI Chat** - Chat with AI about code
🧠 **Agentic Coding** - AI writes code for you
🎨 **Image Generator** - Generate images from text
🗣️ **Voice Coding** - Code by voice commands

### Tools:
🛒 **Marketplace** - Install extensions
🐙 **GitHub** - Clone, commit, push, pull
👥 **Team Collaboration** - Real-time collaboration
📊 **Performance Monitor** - CPU, RAM, FPS tracking
🌐 **Browser** - Built-in browser with dev tools

### Game Dev:
🎮 **Game Editor** - Visual game editor
🎯 **Godot Integration** - Connect to Godot Engine
🔷 **Unreal Integration** - Connect to Unreal Engine
🎲 **Unity Integration** - Connect to Unity

---

## ⌨️ Keyboard Shortcuts

### File Operations:
- `Ctrl+N` - New file
- `Ctrl+O` - Open file
- `Ctrl+S` - Save file
- `Ctrl+Shift+S` - Save as
- `Ctrl+W` - Close tab

### Editing:
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+C` - Copy
- `Ctrl+X` - Cut
- `Ctrl+V` - Paste
- `Ctrl+F` - Find
- `Ctrl+H` - Replace

### Navigation:
- `Ctrl+T` - New tab / Tab selector
- `Ctrl+Tab` - Next tab
- `Ctrl+Shift+Tab` - Previous tab
- `Ctrl+P` - Quick open file
- `Ctrl+Shift+P` - Command palette

### View:
- `Ctrl+B` - Toggle file explorer
- `Ctrl+J` - Toggle terminal
- `F11` - Fullscreen
- `Ctrl+,` - Settings

### Terminal:
- `Ctrl+Enter` - Run command
- `↑` / `↓` - Command history

### AI:
- `Ctrl+Shift+A` - Open AI Chat
- `Ctrl+Shift+G` - Agentic Coding
- `Ctrl+Shift+I` - Image Generator

---

## 🎯 Tab System

### Creating Tabs:
1. Press `Ctrl+T` or click "📑 Create New Tab"
2. Select tab type from menu
3. Tab opens instantly

### Available Tab Types:

#### 💻 Core:
- **Code Editor** - Edit code files
- **File Explorer** - Browse file system
- **Terminal** - Command line interface
- **Debugger** - Debug your code

#### 🤖 AI:
- **AI Chat** - Chat with AI assistant
- **Agentic Coding** - AI generates code
- **Image Generator** - Create images from text
- **Voice Coding** - Voice commands

#### ⚙️ Settings:
- **Theme Settings** - Colors, fonts, appearance
- **Editor Settings** - Tab size, line numbers, etc.
- **Extensions Settings** - Manage extensions
- **Network Settings** - Proxy, API keys
- **Security Settings** - Permissions, sandboxing
- **Performance Settings** - Memory, GPU, FPS

#### 🛠️ Tools:
- **Marketplace** - Browse/install extensions
- **GitHub** - Git operations
- **Team Collaboration** - Multi-user editing
- **Performance Monitor** - System metrics
- **Browser** - Built-in web browser

#### 🎮 Game Dev:
- **Game Editor** - Visual game creation
- **Godot Integration** - Godot projects
- **Unreal Integration** - Unreal projects
- **Unity Integration** - Unity projects

### Managing Tabs:
- **Switch tabs**: Click tab or `Ctrl+Tab`
- **Close tab**: Click ✕ or `Ctrl+W`
- **Reorder**: Drag tabs left/right

---

## 📁 File Operations

### File Explorer:
1. Click "📁 File Explorer" in sidebar
2. Click "Open Folder" to browse
3. Click files to open in editor
4. Right-click for context menu

### Creating Files:
1. `Ctrl+N` or "File → New"
2. Type in editor
3. `Ctrl+S` to save

### Opening Files:
1. `Ctrl+O` or "File → Open"
2. Browse and select file
3. File opens in new tab

### Saving Files:
- `Ctrl+S` - Save current file
- `Ctrl+Shift+S` - Save as (new name/location)

---

## 🤖 AI Features

### Prerequisites:
Install Ollama from https://ollama.ai/

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull codellama

# Verify it's running
curl http://localhost:11434/api/version
```

### AI Chat:
1. Press `Ctrl+Shift+A` or click "💬 AI Chat"
2. Type your question
3. Press Enter or click "Send"
4. AI responds in chat

**Example prompts:**
```
- "How do I create a React component?"
- "Explain this code: [paste code]"
- "What's wrong with this function?"
- "Write a Python web scraper"
```

### Agentic Coding:
1. Press `Ctrl+Shift+G` or click "🧠 Agentic Coding"
2. Describe what you want: "Create a REST API with Express"
3. Click "▶ Start Agent"
4. AI generates code
5. Code appears in new editor tab

**Example tasks:**
```
- "Create a todo list app with React"
- "Build a REST API for user authentication"
- "Write unit tests for this module"
- "Refactor this code to use async/await"
```

### Image Generator:
1. Press `Ctrl+Shift+I` or click "🎨 Image Generator"
2. Enter prompt: "A futuristic city at sunset"
3. Click "Generate Image"
4. Image appears below
5. Click "Save Image" to download

**Requirements:**
- Stable Diffusion model in Ollama
- GPU recommended (CPU is very slow)

### Voice Coding:
1. Click "🗣️ Voice Coding"
2. Click "Start Listening"
3. Speak commands: "Create function called hello world"
4. Code appears in editor

---

## 🎨 Customization

### Themes:
1. Press `Ctrl+,` for Settings
2. Click "🎨 Theme Settings"
3. Select theme:
   - **Dark** - Default dark theme
   - **Light** - Light theme
   - **High Contrast** - Accessibility
   - **Custom** - Create your own

### Editor Settings:
1. Press `Ctrl+,` for Settings
2. Click "⌨️ Editor Settings"
3. Adjust:
   - Font size (10-72px)
   - Tab size (2/4/8 spaces)
   - Line numbers (on/off)
   - Word wrap (on/off)
   - Auto-save (on/off)

### Performance:
1. Press `Ctrl+,` for Settings
2. Click "⚡ Performance Settings"
3. Adjust:
   - **Max FPS**: 30/60/120/240
   - **GPU Acceleration**: On/Off
   - **Memory Limit**: 2GB/4GB/8GB
   - **Background Throttling**: On/Off

---

## 🔧 Troubleshooting

### IDE Won't Start:
```bash
# Check Node.js
node --version  # Should be v16+

# Reinstall dependencies
rm -rf node_modules
npm install

# Try again
npm start
```

### Black Screen:
```bash
# Clear cache
rm -rf ~/.config/bigdaddyg-ide
npm start
```

### AI Features Not Working:
```bash
# Check Ollama is running
curl http://localhost:11434/api/version

# If not running, start it
ollama serve

# Pull a model if needed
ollama pull codellama
```

### Performance Issues:
1. Open Performance Monitor (`Ctrl+Shift+M`)
2. Check CPU/RAM usage
3. If high:
   - Lower FPS in Performance Settings
   - Close unused tabs
   - Disable GPU acceleration
   - Increase memory limit

### Can't Type in Terminal/Chat:
1. Click inside the input field
2. If still not working:
   - Press F12 to open DevTools
   - Check Console for errors
   - Report issue on GitHub

### Tabs Not Creating:
1. Press F12 for DevTools
2. Check Console for errors
3. Try: `window.completeTabSystem.createEditorTab()`
4. If error, report on GitHub

### Module Errors:
If you see "module is not defined":
1. These should be fixed by auto-update
2. If not, manually pull latest from GitHub
3. Run `npm start` again

---

## 🔄 Auto-Update System

### How It Works:
Every time you launch (`npm start`):
1. Checks GitHub for updates
2. Downloads changed files
3. Applies updates automatically
4. Shows dialog if updates applied
5. Launches with latest code

### Configuration:
Location: `%APPDATA%/BigDaddyG-IDE/update-settings.json`

```json
{
  "autoUpdate": true,          // Enable/disable
  "checkOnStartup": true,       // Check every launch
  "checkInterval": "daily",     // startup/daily/weekly
  "branch": "main"              // Which branch to track
}
```

### Disable Auto-Update:
Change `"autoUpdate": false` in file above.

### Manual Update:
```bash
git pull origin main
npm install
npm start
```

---

## 🐛 Debugging

### Open DevTools:
- **F12** or **Ctrl+Shift+I**

### Console Commands:
```javascript
// Test tab system
window.completeTabSystem.createEditorTab()

// Test AI chat
window.testAIConnection()

// Check settings
window.SettingsManager

// Check theme
window.ThemeManager

// Run tests
window.runComprehensiveTest()
```

### Logs:
- **Main Process**: Terminal where you ran `npm start`
- **Renderer Process**: DevTools Console (F12)
- **Remote Logs**: http://localhost:11442

---

## 📊 Performance Monitoring

### Built-in Monitor:
1. Click "📊 Performance Monitor"
2. View real-time:
   - **FPS**: Frames per second
   - **CPU**: Processor usage
   - **RAM**: Memory usage
   - **Heap**: JavaScript memory
   - **Active Tabs**: Open tabs count

### Optimization Tips:
- **Close unused tabs** - Each tab uses memory
- **Lower FPS** - 60 FPS is enough for most work
- **Disable GPU** - If glitchy, disable GPU acceleration
- **Increase memory** - If swapping, increase limit

---

## 🌐 Network Features

### Proxy Settings:
1. Settings → Network Settings
2. Enter proxy URL: `http://proxy.company.com:8080`
3. Save and restart

### API Keys:
1. Settings → Security Settings
2. Add API keys for:
   - OpenAI
   - Anthropic
   - GitHub
   - Other services

### Remote Logging:
Access logs from any device:
```
http://your-ip:11442
```

---

## 🎮 Game Development

### Godot Integration:
1. Open "🎯 Godot Integration" tab
2. Set Godot project path
3. Click "Connect"
4. Edit .gd files in BigDaddyG IDE
5. Hot-reload in Godot

### Unreal Integration:
1. Open "🔷 Unreal Integration" tab
2. Set Unreal project path
3. Edit C++ files
4. Build from IDE

### Unity Integration:
1. Open "🎲 Unity Integration" tab
2. Set Unity project path
3. Edit C# files
4. Compile from IDE

---

## 📦 Extensions

### Marketplace:
1. Click "🛒 Marketplace"
2. Browse extensions
3. Click "Install"
4. Extension loads automatically

### Creating Extensions:
```javascript
// my-extension.js
module.exports = {
  name: 'My Extension',
  version: '1.0.0',
  
  activate() {
    console.log('Extension activated!');
  },
  
  deactivate() {
    console.log('Extension deactivated!');
  }
};
```

---

## 🤝 Contributing

### Report Issues:
GitHub: https://github.com/ItsMehRAWRXD/BigDaddyG-IDE/issues

### Submit Features:
1. Fork repo
2. Create branch: `feature/my-feature`
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📝 License

See LICENSE file in repository.

---

## 🆘 Support

### Community:
- **GitHub Discussions**: Ask questions
- **Discord**: Real-time chat (if available)
- **Email**: support@bigdaddyg-ide.com

### Documentation:
- 🎯 This guide (COMPLETE-IDE-GUIDE.md)
- 🔄 Auto-Update (AUTO-UPDATE-SYSTEM.md)
- 🎤 Voice & Emoji (VOICE-AND-EMOJI-SYSTEM.md)
- 📚 Feature Comparison (CURSOR-VS-BIGDADDYG-FEATURES.md)

---

## 🎉 Tips & Tricks

### Productivity:
- Use `Ctrl+P` for quick file opening
- Use `Ctrl+Shift+P` for command palette
- Use `Ctrl+T` often - tabs are free!
- Save layouts with different tab arrangements

### AI Usage:
- Be specific in prompts
- Include context: "In Python, using FastAPI..."
- Ask for explanations: "Explain this code step by step"
- Iterate: "Now add error handling to that"

### Performance:
- Keep < 10 tabs open
- Close heavy tabs (Browser, Game Editor) when not needed
- Monitor RAM usage
- Restart IDE daily

### Customization:
- Create custom themes
- Set up keyboard shortcuts
- Configure auto-save
- Adjust font sizes for your screen

---

**Version**: 2.1.0  
**Last Updated**: 2025-11-12  
**Status**: ✅ Production Ready

**Happy Coding!** 🚀
