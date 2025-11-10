# 🎮 BigDaddyG IDE - Quick Start Guide

## 🚀 **Getting Started in 5 Minutes**

---

## 1️⃣ **Using the CLI**

### **Node.js CLI**
```bash
# Start interactive mode
node bigdaddyg-cli.js

# Or use single commands
node bigdaddyg-cli.js ai "create a REST API"
node bigdaddyg-cli.js generate "user authentication system"
node bigdaddyg-cli.js fix main.js
node bigdaddyg-cli.js refactor src/utils.js
```

### **PowerShell CLI**
```powershell
# Start interactive mode
.\bigdaddyg-cli.ps1

# Or use single commands
.\bigdaddyg-cli.ps1 ai "create game loop"
.\bigdaddyg-cli.ps1 init godot
.\bigdaddyg-cli.ps1 open main.gd
```

### **Available CLI Commands**
- **ai** - Ask AI anything
- **generate** - Generate code from description
- **fix** - Fix bugs in file
- **refactor** - Refactor code
- **explain** - Explain code
- **init** - Initialize project (godot/unity/unreal/node)
- **open** - Open file
- **create** - Create file
- **ls** - List files
- **cd** - Change directory
- **run** - Run project
- **build** - Build project
- **test** - Run tests
- **git** - Git commands

---

## 2️⃣ **Starting a Game Project**

### **Godot 4.2+ Project**
```bash
# CLI
node bigdaddyg-cli.js init godot MyGame

# What you get:
# ✅ project.godot
# ✅ main.tscn
# ✅ Full IDE support
# ✅ Scene editor
# ✅ Debugger
# ✅ GDScript IntelliSense
```

### **Unity 2022 LTS Project**
```bash
node bigdaddyg-cli.js init unity MyGame
# Note: Requires Unity Editor installed
```

### **Unreal Engine 5.3+ Project**
```bash
node bigdaddyg-cli.js init unreal MyGame
# Note: Requires Unreal Engine installed
```

---

## 3️⃣ **Using AI Features**

### **AI Chat**
```bash
# Start AI chat
node bigdaddyg-cli.js chat

# AI will respond interactively
```

### **Generate Code**
```bash
# Generate code from description
node bigdaddyg-cli.js generate "player controller with WASD movement"

# AI creates complete code
```

### **Fix Bugs**
```bash
# AI analyzes and fixes bugs
node bigdaddyg-cli.js fix src/player.js

# AI automatically repairs issues
```

### **Explain Code**
```bash
# AI explains code in plain English
node bigdaddyg-cli.js explain src/inventory.js

# AI provides detailed explanation
```

---

## 4️⃣ **Keyboard Shortcuts**

### **Essential Shortcuts**
- `Ctrl+S` / `Cmd+S` - Save file
- `Ctrl+O` / `Cmd+O` - Open file
- `Ctrl+N` / `Cmd+N` - New file
- `Ctrl+F` / `Cmd+F` - Find
- `Ctrl+H` / `Cmd+H` - Replace
- `Ctrl+/` / `Cmd+/` - Toggle comment
- `Ctrl+Space` - Trigger IntelliSense
- `F12` - Go to definition
- `Shift+F12` - Find references
- `F2` - Rename symbol
- `Ctrl+Shift+F` / `Cmd+Shift+F` - Format document

### **AI Shortcuts**
- `Ctrl+I` / `Cmd+I` - AI assistant
- `Ctrl+Shift+A` / `Cmd+Shift+A` - AI chat
- `Ctrl+Shift+E` / `Cmd+Shift+E` - Explain code
- `Ctrl+Shift+X` / `Cmd+Shift+X` - Fix code

---

## 5️⃣ **Using Visual Editors**

### **Scene Editor**
1. Open a scene file (.tscn, .unity, .umap)
2. Scene hierarchy appears on left
3. Properties panel on right
4. 3D/2D viewport in center

### **Shader Editor**
1. Open a shader file (.glsl, .hlsl, .gdshader)
2. Code editor on left
3. Live preview on right
4. Supports: GLSL, HLSL, Godot, Unity, Unreal, Sunshine

### **Animation Timeline**
1. Open animation in timeline editor
2. Add keyframes by clicking timeline
3. Use playback controls to preview
4. Adjust curves for smooth motion

---

## 6️⃣ **Settings & Themes**

### **Change Theme**
```javascript
// In console or settings UI
themeManager.setTheme('dark');    // Dark theme
themeManager.setTheme('light');   // Light theme
themeManager.setTheme('high-contrast'); // High contrast
themeManager.setTheme('monokai'); // Monokai
```

### **Adjust Settings**
```javascript
settingsManager.set('fontSize', 14);
settingsManager.set('autoSave', true);
settingsManager.set('theme', 'dark');
settingsManager.set('aiModel', 'bigdaddya');
```

---

## 7️⃣ **Professional Logging**

### **Use Logger Instead of console.log**
```javascript
// ❌ OLD WAY
console.log('User logged in');

// ✅ NEW WAY
logger.info('Auth', 'User logged in', { userId: 123 });
logger.debug('Engine', 'Rendering frame', { fps: 60 });
logger.error('Network', 'Connection failed', error);
logger.warn('Memory', 'High memory usage', { mb: 512 });
```

### **Log Levels**
- `logger.trace()` - Very detailed debugging
- `logger.debug()` - Debug information
- `logger.info()` - General information
- `logger.warn()` - Warning messages
- `logger.error()` - Error messages
- `logger.fatal()` - Critical failures

---

## 8️⃣ **Memory Management**

### **Proper Event Listener Cleanup**
```javascript
// ❌ OLD WAY
element.addEventListener('click', handler);
// Memory leak if not cleaned up!

// ✅ NEW WAY
memoryManager.addEventListener(element, 'click', handler);
// Automatically cleaned up!
```

### **Tracked Resources**
- Event listeners
- Timers (setTimeout)
- Intervals (setInterval)
- Animation frames (requestAnimationFrame)
- Observers (MutationObserver, IntersectionObserver)

---

## 9️⃣ **Hot Reload**

### **Enable Hot Reload**
```javascript
// Automatically watches and reloads:
// - .js files
// - .ts files
// - .css files
// - .html files
// - .json files

// No need to restart IDE!
```

---

## 🔟 **Marketplace**

### **Install Extension**
1. Open Marketplace panel
2. Search for extension
3. Click "Install"
4. Extension auto-activates

### **Manage Extensions**
- **Installed** - View installed extensions
- **Updates** - Check for updates
- **Discover** - Browse new extensions
- **Settings** - Configure marketplace

---

## 💡 **Pro Tips**

### **1. Use AI Generously**
```bash
# AI is your coding partner
node bigdaddyg-cli.js ai "how do I optimize this loop?"
node bigdaddyg-cli.js generate "inventory system with drag and drop"
```

### **2. Keyboard Navigation**
- Tab through all UI elements
- Arrow keys in lists
- Escape closes modals
- Enter activates buttons

### **3. Adaptive UI**
The IDE learns your patterns:
- Suggests shortcuts you use
- Predicts next actions
- Optimizes UI layout

### **4. Multiple Themes**
Switch themes based on time:
- Morning: Light theme
- Evening: Dark theme
- Presentation: High contrast

### **5. CLI Productivity**
```bash
# Chain commands
node bigdaddyg-cli.js create player.js && node bigdaddyg-cli.js generate "player class" > player.js

# Use with git
node bigdaddyg-cli.js git status
node bigdaddyg-cli.js git commit -m "Add player"
```

---

## 🆘 **Troubleshooting**

### **CLI Not Working?**
```bash
# Make executable
chmod +x bigdaddyg-cli.js
chmod +x bigdaddyg-cli.ps1

# Or use node directly
node bigdaddyg-cli.js help
```

### **Engine Not Detected?**
```bash
# Ensure engine is in PATH
# Windows: Add to System Environment Variables
# Mac/Linux: Add to ~/.bashrc or ~/.zshrc

export PATH=$PATH:/path/to/godot
export PATH=$PATH:/path/to/unity
```

### **AI Not Responding?**
```bash
# Check AI system
node bigdaddyg-cli.js settings

# Try different AI model
settingsManager.set('aiModel', 'standalone');
```

### **Performance Issues?**
```javascript
// Enable throttling
throttleManager.throttle(myFunction, 100);

// Check memory
memoryManager.getStats();

// Monitor leaks
memoryManager.monitorLeaks();
```

---

## 📚 **Learn More**

- **Full Documentation:** `/docs`
- **API Reference:** `/docs/api`
- **Keyboard Shortcuts:** `Ctrl+Shift+?` / `Cmd+Shift+?`
- **Settings:** `Ctrl+,` / `Cmd+,`
- **Command Palette:** `Ctrl+Shift+P` / `Cmd+Shift+P`

---

## 🎉 **You're Ready!**

BigDaddyG IDE is now configured and ready to use.

**Start coding with:**
- ✅ AI-powered assistance
- ✅ Multi-engine game development
- ✅ Professional CLI
- ✅ World-class UX
- ✅ Enterprise-grade features

**Happy coding! 🚀**

---

*BigDaddyG IDE - Beyond World-Class. Beyond Limits.*
