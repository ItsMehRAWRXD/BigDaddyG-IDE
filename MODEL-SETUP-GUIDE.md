# BigDaddyG IDE - AI Model Setup Guide

## 📦 Pre-built Version (Recommended)

The IDE comes with a **114GB pre-built version** that includes all AI models:

**Location:** `dist\win-unpacked\BigDaddyG IDE.exe`

Just run it - all 9 AI specialists are included!

---

## 🤖 Included AI Specialists (9 Total)

### 1. **BigDaddyG C/C++**
- File: `models/bigdaddyg-c.modelfile`
- Auto-triggers on: `.c`, `.cpp`, `.h`, `.hpp`
- Best for: Systems programming, memory management, performance

### 2. **BigDaddyG C#**
- File: `models/bigdaddyg-csharp.modelfile`
- Auto-triggers on: `.cs`
- Best for: .NET, Unity, ASP.NET, enterprise apps

### 3. **BigDaddyG Visual Basic**
- File: `models/bigdaddyg-visualbasic.modelfile`
- Auto-triggers on: `.vb`, `.vba`
- Best for: Office automation, legacy apps

### 4. **BigDaddyG Python**
- File: `models/bigdaddyg-python.modelfile`
- Auto-triggers on: `.py`
- Best for: Data science, ML, scripting

### 5. **BigDaddyG JavaScript**
- File: `models/bigdaddyg-javascript.modelfile`
- Auto-triggers on: `.js`, `.ts`, `.jsx`, `.tsx`
- Best for: Web development, Node.js, React

### 6. **BigDaddyG Image Generation**
- File: `models/bigdaddyg-image.modelfile`
- Trigger: `!pic` command or Settings → Image Generation
- Best for: AI art, image prompts, computer vision

### 7. **BigDaddyG Assembly** ⚡ NEW!
- File: `models/bigdaddyg-asm.modelfile`
- Auto-triggers on: `.asm`, `.s`, `.nasm`
- Best for: x86/x64/ARM assembly, reverse engineering, shellcode
- **Integrates with RawrZ Security Platform**

### 8. **Cheetah Stealth**
- File: `models/cheetah_stealth_latest.modelfile`
- Focus: Security, penetration testing, stealth operations
- Fast and concise responses

### 9. **Code Supernova**
- File: `models/code_supernova_1m.modelfile`
- Focus: Multi-language code generation
- 1M token context window

---

## 🔧 Manual Model Setup (If Building from Source)

### Step 1: Get the AI Models

The IDE uses models from **Ollama** or similar model providers.

```bash
# Install Ollama (if not already installed)
# Windows: Download from https://ollama.ai

# Pull the base model
ollama pull bigdaddyg:latest
```

### Step 2: Model Location

Models are typically stored at:
- **Windows:** `C:\Users\<Username>\.ollama\models\blobs\`
- **Linux/Mac:** `~/.ollama/models/blobs/`

### Step 3: Link Models to IDE

The IDE's `Orchestra-Server.js` automatically loads models from Ollama cache.

No manual copying needed - just ensure Ollama is running!

---

## 🔗 Integrated Extensions

### RawrZ Security Platform
- **Port:** 8080
- **API:** `http://localhost:8080/api/rawrz/execute`
- **Status:** Optional (works offline without it)
- **Best for:** Assembly analysis, binary exploitation, security research

### Multi AI Aggregator
- **Port:** 3003
- **Providers:** Claude, ChatGPT-4o, Kimi, DeepSeek, AmazonQ, Gemini
- **Status:** Optional (internet required)
- **Best for:** Getting multiple AI perspectives

---

## 📊 Total Model Size

- **Core AI models:** 114 GB
- **Specialist configs:** ~10 KB (9 .modelfile files)
- **IDE application:** ~400 MB
- **Total installed:** ~114.5 GB

---

## 🚀 Quick Start

1. **Launch the IDE:**
   ```powershell
   cd "D:\Security Research aka GitHub Repos\ProjectIDEAI\dist\win-unpacked"
   .\BigDaddyG IDE.exe
   ```

2. **Test AI:**
   - Press `Ctrl+L` for chat
   - Type: "Hello! Which specialist are you?"
   - The IDE auto-selects based on your current file

3. **Try Assembly specialist:**
   - Create new file: `test.asm`
   - Press `Ctrl+L`
   - Ask: "Write x86 assembly to print hello world"
   - BigDaddyG ASM activates automatically!

---

## 🔍 Troubleshooting

### "AI models not found"
1. Check `C:\Users\<You>\.ollama\models\blobs\` exists
2. Restart IDE
3. Check Orchestra Server logs in console (`Ctrl+Shift+I`)

### "RawrZ/Multi AI offline"
- These are **optional** services
- IDE works perfectly without them
- Only affects advanced features

### "Model too slow"
1. Check GPU usage (Performance Overlay: `Ctrl+Shift+O`)
2. Close other AI apps
3. Consider using smaller model variants

---

## 📚 More Info

- **Full feature list:** `COMPLETE-FEATURE-LIST.md`
- **Cursor comparison:** `CURSOR-ALTERNATIVE.md`
- **Roadmap:** `ROADMAP-2025-2026.md`

**Happy coding!** 🎉

