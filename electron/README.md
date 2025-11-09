# BigDaddyG IDE - Professional Edition

A powerful, AI-enhanced desktop IDE built with Electron, featuring multi-agent AI integration, advanced code intelligence, and professional development tools.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

### Launch Instructions

#### Windows
```bash
# Double-click to launch
launch-ide.bat

# Or via command line
cd "D:\Security Research aka GitHub Repos\ProjectIDEAI\electron"
npm start
```

#### macOS/Linux
```bash
# Make executable and run
chmod +x launch-ide.sh
./launch-ide.sh

# Or via command line
cd "/path/to/ProjectIDEAI/electron"
npm start
```

#### Manual Launch
```bash
# Install dependencies (first time only)
npm install

# Start the IDE
npm start

# Development mode with hot reload
npm run dev

# Demo mode
npm run demo
```

## 🎯 Features

### Core IDE Features
- **Monaco Editor** - VS Code-quality code editing
- **Multi-language Support** - JavaScript, TypeScript, Python, Java, C++, and more
- **Integrated Terminal** - PowerShell, CMD, Bash, WSL support
- **File Explorer** - Full filesystem browsing with drive detection
- **Project Management** - Workspace and project organization
- **Syntax Highlighting** - Advanced code colorization
- **Auto-completion** - Intelligent code suggestions

### AI-Powered Features
- **Multi-Provider AI Chat** - OpenAI, Anthropic, Gemini, Groq, DeepSeek, Ollama
- **Agentic Code Generation** - AI-powered code creation and optimization
- **Auto-Fix Everything** - Intelligent error detection and correction
- **Code Analysis** - Deep code understanding and suggestions
- **Natural Language Coding** - Write code using plain English
- **AI-Powered Debugging** - Intelligent error diagnosis

### Advanced Features
- **Extension Marketplace** - Install and manage IDE extensions
- **Multi-Agent Swarm** - Collaborative AI agents for complex tasks
- **Browser Integration** - Built-in web browser with developer tools
- **Memory System** - Persistent AI memory across sessions
- **Voice Coding** - Speech-to-code functionality
- **Performance Optimization** - High refresh rate display support (up to 600fps)
- **Security Hardening** - Advanced security features and scanning

## 🔧 Configuration

### API Keys Setup
Configure AI providers via the marketplace UI:
```
Ctrl+Shift+P → Click "🔑 API Keys" → Add your keys
```

Supported providers:
- **OpenAI** - `sk-...`
- **Anthropic** - `sk-ant-...`
- **Google Gemini** - `AIza...`
- **Groq** - `gsk_...`
- **DeepSeek** - `sk-...`
- **Ollama** - Local (no key needed)

### Extension Installation
Install popular extensions:
```
Ctrl+Shift+P → Search for:
- "amazon q" → Amazon Q Developer
- "copilot" → GitHub Copilot
- "prettier" → Code formatter
```

## ⌨️ Keyboard Shortcuts

### File Operations
- `Ctrl+N` - New file
- `Ctrl+O` - Open file
- `Ctrl+S` - Save file
- `Ctrl+Shift+S` - Save as

### AI Features
- `Ctrl+K` - Ask AI assistant
- `Ctrl+L` - Open floating chat
- `Ctrl+E` - Explain selected code
- `Ctrl+Shift+F` - Auto-fix everything
- `Ctrl+Shift+O` - Optimize code

### Navigation
- `Ctrl+P` - Quick file search
- `Ctrl+Shift+P` - Command palette
- `Ctrl+B` - Toggle sidebar
- `Ctrl+`` - Toggle terminal

### Browser
- `Ctrl+Shift+B` - Show browser
- `Ctrl+L` - Navigate to URL
- `F5` - Reload page
- `F12` - Open DevTools

## 🏗️ Architecture

### Core Components
```
electron/
├── main.js                 # Electron main process
├── renderer.js             # Main renderer logic
├── preload.js             # Secure IPC bridge
├── package.json           # Dependencies and scripts
├── index.html             # Main UI
└── styles.css             # Global styles
```

### AI System
```
├── ai-provider-manager.js  # Multi-provider AI interface
├── agentic-ai-bridge.js   # AI integration bridge
├── agentic-coder.js       # AI-powered coding features
├── agentic-executor.js    # AI task execution
└── memory-service.js      # Persistent AI memory
```

### Extension System
```
├── marketplace/           # Extension marketplace
├── extensions/           # Installed extensions
├── extension-host/       # Extension runtime
└── plugins/             # Plugin system
```

### UI Components
```
├── ui/                   # UI components
│   ├── agent-panel.js   # AI agent interface
│   ├── chat-customizer.js # Chat UI
│   ├── file-explorer.js # File browser
│   └── terminal-panel.js # Terminal UI
└── browser-integration.js # Web browser
```

## 🔌 Extensions

### Built-in Extensions
- **ASM IDE** - Assembly language support
- **Code Stats** - Development statistics
- **Live Preview** - Real-time web preview
- **Git Integration** - Version control

### Marketplace Extensions
Access the extension marketplace:
```
Ctrl+Shift+P → "Extensions" → Browse marketplace
```

Popular extensions:
- Amazon Q Developer
- GitHub Copilot
- Prettier Code Formatter
- ESLint
- Python Support
- Java Language Server

## 🛠️ Development

### Building from Source
```bash
# Clone repository
git clone <repository-url>
cd ProjectIDEAI/electron

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Create distributable
npm run dist
```

### Project Structure
```
ProjectIDEAI/electron/
├── src/                  # Source code
├── assets/              # Static assets
├── build/               # Build configuration
├── dist/                # Distribution files
├── node_modules/        # Dependencies
├── package.json         # Project configuration
└── README.md           # This file
```

### Adding Features
1. Create feature module in appropriate directory
2. Register IPC handlers in `main.js`
3. Add UI components in `ui/` directory
4. Update renderer logic in `renderer.js`
5. Test thoroughly

## 🐛 Troubleshooting

### Common Issues

#### White Screen on Startup
```bash
# Try safe mode
npm start -- --safe-mode

# Clear cache
rm -rf node_modules
npm install
```

#### AI Features Not Working
```bash
# Check API keys
Ctrl+Shift+P → "🔑 API Keys"

# Install Ollama for local AI
# Download from: https://ollama.ai
```

#### Extensions Not Loading
```bash
# Restart marketplace
Ctrl+Shift+P → "Reload Extensions"

# Check extension directory
%APPDATA%/BigDaddyG/extensions/
```

#### Performance Issues
```bash
# Enable GPU acceleration
npm start -- --enable-gpu-acceleration

# Reduce memory usage
npm start -- --max-memory=4096
```

### Debug Mode
```bash
# Enable debug logging
npm start -- --debug

# Open DevTools automatically
npm start -- --dev-tools
```

### Log Files
Logs are stored in:
- **Windows**: `%APPDATA%/BigDaddyG/logs/`
- **macOS**: `~/Library/Application Support/BigDaddyG/logs/`
- **Linux**: `~/.config/BigDaddyG/logs/`

## 📊 System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, Ubuntu 18.04
- **RAM**: 4GB
- **Storage**: 2GB free space
- **CPU**: Dual-core 2GHz

### Recommended Requirements
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM**: 16GB
- **Storage**: 10GB free space
- **CPU**: Quad-core 3GHz (AMD 7800X3D optimized)
- **GPU**: Dedicated graphics card

### High-Performance Setup
- **Display**: 4K+ with high refresh rate (up to 540Hz supported)
- **RAM**: 32GB+
- **Storage**: NVMe SSD
- **Network**: High-speed internet for AI features

## 🔒 Security

### Security Features
- **Sandboxed Renderer** - Isolated execution environment
- **Context Isolation** - Secure IPC communication
- **CSP Headers** - Content Security Policy protection
- **API Key Encryption** - Secure credential storage
- **Extension Validation** - Verified extension system

### Privacy
- **Local Processing** - Code analysis happens locally
- **Encrypted Storage** - Sensitive data is encrypted
- **No Telemetry** - No usage data collection
- **Offline Mode** - Full functionality without internet

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Test on multiple platforms

### Bug Reports
Please include:
- Operating system and version
- Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Log files (if applicable)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Monaco Editor** - Microsoft's excellent code editor
- **Electron** - Cross-platform desktop app framework
- **OpenAI** - AI language models
- **Ollama** - Local AI model runtime
- **VS Code** - Inspiration for many features

## 📞 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Extension Development](docs/extension-dev.md)

### Community
- [GitHub Issues](https://github.com/bigdaddyg/ide/issues)
- [Discussions](https://github.com/bigdaddyg/ide/discussions)
- [Discord Server](https://discord.gg/bigdaddyg-ide)

### Professional Support
For enterprise support and custom development:
- Email: support@bigdaddyg.dev
- Website: https://bigdaddyg.dev

---

**BigDaddyG IDE** - Where AI meets professional development 🚀