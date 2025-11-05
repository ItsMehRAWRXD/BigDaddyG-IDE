# 🧠 OpenMemory

**PowerShell-native cognitive memory system**

Local-first | Vector embeddings | Adaptive decay | Zero dependencies

---

## ✨ Features

- 📝 **Persistent JSONL storage** - Memories survive restarts
- 🧬 **Vector embeddings** - Ollama + SHA256 fallback
- 🔍 **Semantic search** - Cosine similarity ranking
- 🔄 **Adaptive decay** - Memories fade naturally
- 🎯 **Multi-sector** - Semantic, Episodic, Procedural, Emotional, Reflective
- 🌐 **HTTP API** - RESTful endpoints
- 🎨 **Web dashboard** - Visual tuning station
- ⚡ **Pure PowerShell** - No Node.js, Docker, or VPS

---

## 🚀 Quick Start

```powershell
# Start OpenMemory
.\Start-OpenMemory.ps1

# Add memory
Add-OMMemory "User prefers dark mode" -UserId "ada"

# Search
Search-OMMemory "preferences" -UserId "ada"

# Dashboard
http://localhost:8765/dashboard
```

---

## 📦 Installation

```powershell
# Clone
git clone https://github.com/ItsMehRAWRXD/BigDaddyG-IDE.git
cd BigDaddyG-IDE/OpenMemory

# Run
.\Start-OpenMemory.ps1
```

---

## 🎯 Use Cases

- **User preference memory** - Remember likes/dislikes
- **Project context** - Store project-specific knowledge
- **Conversation history** - Semantic conversation recall
- **Code patterns** - Remember common solutions
- **Bug tracking** - Memory of past issues

---

## 🌐 API

```bash
POST /memory/add      # Add memory
POST /memory/query    # Search memories
GET  /memory/list     # List all
POST /config/update   # Update settings
GET  /dashboard       # Web UI
```

---

## 📚 Documentation

See `OPENMEMORY-INTEGRATION.md` for complete documentation.

---

## 🛠️ Requirements

- PowerShell 5.1+ or PowerShell Core
- Optional: Ollama for better embeddings

---

## 🎨 Architecture

```
OpenMemory/
├── Modules/          ← Core logic
├── Store/            ← JSONL data
├── Dashboard/        ← Web UI
└── Start-OpenMemory  ← Launcher
```

---

## 💎 Philosophy

OpenMemory embodies **regenerative architecture**:

- **Birth** - New memories created
- **Life** - Accessed and boosted
- **Decay** - Fade over time
- **Rebirth** - Fresh context, adaptive embeddings

---

**Built for BigDaddyG IDE | Local-first | Privacy-focused | Free forever**

