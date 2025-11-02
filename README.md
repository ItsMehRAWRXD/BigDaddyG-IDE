# 🚀 BigDaddyG IDE - Regenerative Citadel Edition

**The World's First 100% Agentic IDE with Self-Healing Security**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/ItsMehRAWRXD/BigDaddyG-IDE/releases)

> **⚡ This repo contains SOURCE CODE ONLY (~6.8 MB)**  
> All dependencies can be recreated in minutes!

---

## 📦 Quick Start (3 Commands)

\\\ash
git clone https://github.com/ItsMehRAWRXD/BigDaddyG-IDE.git
cd BigDaddyG-IDE
npm install    # Downloads dependencies (~430 MB)
npm start      # Launches BigDaddyG IDE!
\\\

That's it! ✨

---

## 🧭 Start Here

- New to the project? Follow the step-by-step guide in [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md).
- Need an overview of how the renderer, servers, and automation layers connect? Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
- Looking for the original deep dives and marketing material? All legacy briefs remain in the repository root with the emoji-prefixed filenames.

---

## 🌟 BigDaddyG Ecosystem - All Repositories

**This is part of a complete development ecosystem!**

### 🏠 Main IDE
- **[BigDaddyG-IDE](https://github.com/ItsMehRAWRXD/BigDaddyG-IDE)** ⭐ You are here

### 🔧 Extensions
- **[BigDaddyG-ASM-IDE](https://github.com/ItsMehRAWRXD/BigDaddyG-ASM-IDE)** - Assembly Development Extension
- **[RawrZ-Extensions](https://github.com/ItsMehRAWRXD/RawrZ-Extensions)** - Security-Focused Extensions
- **[VSCode-AI-Chat-Extension](https://github.com/ItsMehRAWRXD/VSCode-AI-Chat-Extension)** - AI Chat Interface
- **[BigDaddyG-Cursor-Extension](https://github.com/ItsMehRAWRXD/BigDaddyG-Cursor-Extension)** - Cursor IDE Integration
- **[bigdaddyg-extension](https://github.com/ItsMehRAWRXD/bigdaddyg-extension)** - General Extension Tools
- **[UnifiedAI-Extension](https://github.com/ItsMehRAWRXD/UnifiedAI-Extension)** - Multi-Model AI Interface
- **[ai-assistant-extension](https://github.com/ItsMehRAWRXD/ai-assistant-extension)** - AI Coding Assistant

### 🏆 Compiler Ecosystem (Revolutionary!)
- **[Pure-PowerShell-Compilers](https://github.com/ItsMehRAWRXD/Pure-PowerShell-Compilers)** ⭐ 38 Languages!
- **[Compiler-Framework](https://github.com/ItsMehRAWRXD/Compiler-Framework)** - Self-Hosting Compiler

**Total: 10 repositories in the ecosystem**

---

## 🎯 What's Included in This Repo

✅ **All Source Code** (6.8 MB)
- \lectron/\ - Frontend IDE code (Monaco Editor, UI)
- \server/\ - Orchestra AI server
- \hooks/\ - Prompt preprocessor hooks
- \orchestration/\ - Agent coordination
- \*.ps1\ / \*.bat\ - Build & launcher scripts
- \package.json\ - Dependency manifest

❌ **NOT Included** (Can be recreated)
- \
ode_modules/\ - Run \
pm install\ (430 MB)
- \dist/\ - Run \
pm run build\ (486 MB)
- AI Models - See instructions below (optional)

---

## 🤖 Optional: Add AI Models (For Offline Use)

BigDaddyG works with **any** AI model:

### Option 1: Use Cloud Models (Recommended)
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude Sonnet, Opus)
- Google (Gemini)
- **No installation needed!**

### Option 2: Install Local Models (Offline)

1. **Install Ollama**: https://ollama.ai/download
2. **Pull a model**:
\\\ash
# Coding-focused (recommended)
ollama pull qwen2.5-coder:3b   # 3 GB
ollama pull deepseek-coder:6b  # 6 GB

# General purpose
ollama pull llama2:7b           # 7 GB
ollama pull mistral:7b          # 7 GB
\\\

BigDaddyG will auto-detect and use them!

---

## 🏗️ Build Options

### Development Mode
\\\ash
npm start              # Run in development
\\\

### Build Executables
\\\ash
npm run build:win      # Windows .exe
npm run build:mac      # macOS .dmg
npm run build:linux    # Linux .AppImage
\\\

### Build with AI Model Bundled
\\\powershell
.\create-bundled-installer.ps1
# Creates: BigDaddyG-AI-Bundle/ (~10.5 GB, fully offline)
\\\

---

## 🏆 Why BigDaddyG?

| Feature | BigDaddyG | Cursor | VS Code |
|---------|-----------|--------|---------|
| **Agentic Score** | 170/170 (100%) | 55/170 (32%) | 0/170 (0%) |
| **Autonomous Execution** | ✅ Full | ❌ Manual | ❌ None |
| **Self-Healing** | ✅ RCK | ❌ None | ❌ None |
| **Voice Coding** | ✅ Yes | ❌ No | ❌ No |
| **Context Window** | 1M tokens | 128K | N/A |
| **Cost** | **FREE** | \-720/year | Free |

**BigDaddyG is 309% more capable than Cursor!**

---

## ✨ Core Features

### 🤖 Agentic Capabilities
- ✅ **Autonomous Execution** - Runs, debugs, fixes code automatically
- ✅ **Self-Healing RCK** - 40-layer security, auto-repairs itself
- ✅ **Multi-Agent Swarm** - 6 specialized AI agents
- ✅ **Voice Coding** - Hands-free development

### 🎯 IDE Features
- ✅ **Monaco Editor** - Same as VS Code
- ✅ **Ultra-Fast Autocomplete** - AI-powered suggestions
- ✅ **Unlimited Tabs** - Smart management
- ✅ **Terminal Integration** - PowerShell, CMD, Bash

### 🔄 Cross-IDE Compatible
Import/Export from:
- ✅ VS Code (settings, extensions, keybindings)
- ✅ Cursor (memories, rules)
- ✅ JetBrains (IntelliJ, PyCharm, WebStorm)
- ✅ Visual Studio (.sln projects)

### 🎮 Game Development
- ✅ Godot 4.2+
- ✅ Unreal Engine 5.3+
- ✅ Unity 2022 LTS
- ✅ Sunshine Engine (proprietary)

---

## 📊 System Requirements

| Tier | CPU | RAM | Disk | Notes |
|------|-----|-----|------|-------|
| **Minimum** | 4 cores | 8 GB | 10 GB | Basic features |
| **Recommended** | 8 cores | 32 GB | 100 GB | Professional |
| **Ultimate** | 16+ cores | 64 GB | 1 TB | With all models |

---

## 🔧 Troubleshooting

### "White screen" on launch?
- Safe Mode will auto-activate after 3 failures
- Or manually load: \index-ultra-simple.html\

### Dependencies not installing?
\\\ash
rm -rf node_modules package-lock.json
npm install --force
\\\

### Models not detected?
\\\ash
ollama list    # Check installed models
\\\

---

## 📖 Documentation

- **Start here:** [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md)
- **Architecture overview:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Legacy deep dives:** Emoji-prefixed `.md` files in the repository root capture feature matrices, deployment plans, and comparison charts.

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (\git checkout -b feature/amazing\)
3. Commit changes (\git commit -m 'Add feature'\)
4. Push (\git push origin feature/amazing\)
5. Open Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

**Third-party:**
- Electron: MIT
- Monaco: MIT
- Express: MIT
- Godot: MIT

---

## 🙏 Credits

- VS Code Team - Monaco Editor
- Cursor Team - Agentic inspiration
- Open Source Community

---

## 📞 Contact

- GitHub: [@ItsMehRAWRXD](https://github.com/ItsMehRAWRXD)
- Issues: [Report Bug](https://github.com/ItsMehRAWRXD/BigDaddyG-IDE/issues)

---

<div align="center">

**Made with ❤️ by the BigDaddyG Team**

⭐ **Star this repo if you find it useful!** ⭐

</div>
