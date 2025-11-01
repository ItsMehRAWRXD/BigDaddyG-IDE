# 🎼 BigDaddyG Orchestra Server - Settings Guide

## 📋 Overview

The Orchestra server now uses **settings.ini** for persistent configuration. This file is automatically created on first run with sensible defaults.

---

## 📁 File Location

```
D:\Security Research aka GitHub Repos\ProjectIDEAI\server\settings.ini
```

---

## ⚙️ Configuration Sections

### **[server]**
```ini
port=11441                  ; Server port (default: 11441)
host=0.0.0.0               ; Listen on all interfaces
cors_enabled=true          ; Enable CORS for browser access
```

### **[models]**
```ini
scan_c_drive=true          ; Scan C:/ drive for models
scan_d_drive=true          ; Scan D:/ drive for models
scan_depth=5               ; Directory depth (1-10)
min_file_size_mb=0.1       ; Minimum file size to consider
cache_duration_minutes=60  ; Cache before re-scanning
```

### **[bigdaddyg]**
```ini
model_type=trained                 ; 'trained' or 'algorithmic'
training_lines=200000             ; Lines of training data
specialization=assembly,security,encryption,reverse-engineering,exploit-development
context_window=1000000            ; 1M context window
```

### **[ollama]**
```ini
enabled=true                      ; Enable Ollama integration
port=11434                        ; Ollama port
fallback_to_trained=true          ; Use BigDaddyG if Ollama offline
```

### **[scan_results]** (Auto-updated)
```ini
total_models=300                  ; Auto-updated after scan
total_agents=57                   ; Auto-updated after scan
last_scan=2025-10-31T15:30:00Z   ; Last scan timestamp
```

---

## 🚀 Key Changes

### ✅ **BigDaddyG is TRAINED, not algorithmic**
- **200,000 lines** of ASM/Security/Encryption training
- **Real expertise**, not template generation
- **Specializations**: x86/x64 Assembly, Security Research, Encryption, Reverse Engineering

### ✅ **Automatic C:/ and D:/ Scanning**
- Scans both drives for models
- Saves results to INI
- Configurable depth and size filtering

### ✅ **Ollama Integration**
- Chat with ANY Ollama model through BigDaddyG IDE
- Automatic routing: BigDaddyG models → Trained engine, Others → Ollama
- Fallback to trained model if Ollama offline

---

## 💡 Usage Tips

**To change scan settings:**
1. Edit `settings.ini`
2. Restart Orchestra server
3. New settings applied automatically

**To disable C:/ scanning:**
```ini
[models]
scan_c_drive=false
```

**To increase scan depth:**
```ini
[models]
scan_depth=10
```

**To require larger files only:**
```ini
[models]
min_file_size_mb=5.0
```

---

## 🔐 BigDaddyG Model Types

| Model | Type | Description |
|-------|------|-------------|
| BigDaddyG:Latest | **Trained** | 200K lines ASM/Security/Encryption |
| BigDaddyG:Code | **Trained** | Code generation specialist |
| BigDaddyG:Debug | **Trained** | Debugging & error analysis |
| BigDaddyG:Crypto | **Trained** | Security & polymorphic encryption |

**NOT algorithmic** - these are real trained models with specialized knowledge!

---

## 🦙 Ollama Model Support

**Any Ollama model works:**
- `llama3:latest`
- `mistral:latest`
- `codellama:7b`
- `gemma:latest`
- **ANY model you have!**

**Automatic routing:**
```javascript
// BigDaddyG:Latest → Trained model (200K lines)
askBigDaddyG("Help", "BigDaddyG:Latest") → Trained engine

// llama3:latest → Ollama service
askBigDaddyG("Help", "llama3:latest") → Ollama API
```

---

## 📊 Monitoring

**View scan results in console:**
```
🎉 SCAN COMPLETE!
✅ Found 1,234 models
✅ Found 57 agents
💾 Scan results saved to settings.ini
```

**Check settings.ini:**
```ini
[scan_results]
total_models=1234
total_agents=57
last_scan=2025-10-31T15:30:00.000Z
```

---

## 🔧 Troubleshooting

**If scanning is slow:**
- Reduce `scan_depth` (try 3-4)
- Increase `min_file_size_mb` (try 1.0)
- Disable C:/ scan if not needed

**If models not found:**
- Check scan paths in console output
- Ensure drives are accessible
- Try manual scan: Delete settings.ini and restart

**If Ollama models don't work:**
- Ensure Ollama is running (`ollama serve`)
- Check `[ollama] port=11434` matches your Ollama port
- Verify CORS: `set OLLAMA_ORIGINS=*`

---

**🎼 ORCHESTRA SERVER - TRAINED & INTELLIGENT!** 🧠🔐✨

