# 🚀 BigDaddyG IDE - Quick Start Guide

## 🎯 You're All Set! Here's How to Use Everything

---

## 📝 **Code Editing**

### Create & Edit Files:
```
Ctrl+N              New file
Ctrl+O              Open file
Ctrl+S              Save file
Ctrl+Shift+S        Save as
Ctrl+W              Close tab
Ctrl+Tab            Next tab
Ctrl+1-9            Jump to tab 1-9
```

### Monaco Editor Features:
- **IntelliSense:** Auto-completion as you type
- **Syntax Highlighting:** Automatic language detection
- **Multiple Cursors:** Alt+Click
- **Find/Replace:** Ctrl+F / Ctrl+H
- **Format Code:** Alt+Shift+F

---

## 💻 **Terminal Usage**

### Open Terminal:
```
Ctrl+J              Toggle terminal
Ctrl+`              Toggle terminal (alternate)
```

### Available Shells:
- **PowerShell 7 (pwsh)** ← Default
- **Windows PowerShell**
- **Command Prompt (CMD)**
- **Git Bash** (if installed)

### Switch Shells:
Click dropdown in terminal header or:
```javascript
// In console:
window.terminalPanelInstance.launchShell('terminal-1', 'cmd');
```

### Example Commands:
```powershell
# Navigate directories
cd src

# Install packages
npm install

# Compile code
clang main.c -o program

# Run programs
./program.exe

# Git commands
git status
git add .
git commit -m "message"
```

**Note:** Terminal maintains working directory between commands!

---

## 🤖 **AI Chat & Commands**

### Open Chat:
```
Ctrl+L              Floating chat
Ctrl+Shift+C        Chat center tab
```

### Quick Commands:
```
!pic                Generate image
!code               Generate code
!fix                Auto-fix code
!test               Generate tests
!docs               Add documentation
!refactor           Refactor code
!optimize           Optimize code
```

### Example Usage:
```
You: "!code Create a React component for a login form"
AI: [Generates code] → Inserted into editor

You: "!test Write tests for this function"
AI: [Generates tests] → Added to file

You: [Select code] → Right-click → Auto Fix
AI: [Analyzes and fixes automatically]
```

---

## 🎨 **Layout Customization**

### Customize Layout:
```
Ctrl+Shift+L        Open panel selector
Ctrl+Alt+L          Reset to default
```

### Add Panels:
1. Press `Ctrl+Shift+L`
2. Select panel type:
   - 📝 Code Editor
   - 💻 Terminal
   - 💬 AI Chat
   - 🌐 Browser
   - 📊 Output
3. Panel is added to layout

### Resize Panels:
- Drag the divider between panels
- Or right-click divider → "Set Size"

### Current Layout:
```
┌────────────────────────────────┐
│   Editor (75% height)          │
│                                │
│   [Your code here]             │
│                                │
├────────────────────────────────┤
│   Terminal (25% height)        │
│   PS> _                        │
└────────────────────────────────┘
```

---

## 🔍 **Diagnostics & Debugging**

### Quick Health Check:
```javascript
quickHealthCheck()
```
Shows:
- ✅ What's working
- ❌ What's not
- 💡 How to fix issues

### Full Diagnostic:
```javascript
runSystemDiagnostic()
```
Comprehensive system scan

### Monaco Specific:
```javascript
diagnoseMonaco()
```
Debug Monaco editor issues

### Get IDE Status:
```javascript
getIDEStatus()
```
Returns initialization status

### Auto-Repair:
```javascript
repairConnections()
```
Fixes common wiring issues

---

## 🎹 **All Hotkeys Reference**

### File Operations:
```
Ctrl+N              New File
Ctrl+O              Open File
Ctrl+S              Save File
Ctrl+Shift+S        Save As
Ctrl+W              Close Tab
Ctrl+Shift+W        Close All Tabs
```

### Navigation:
```
Ctrl+Tab            Next Tab
Ctrl+Shift+Tab      Previous Tab
Ctrl+1-9            Jump to Tab
Alt+←              Previous Tab
Alt+→              Next Tab
```

### Center Tabs:
```
Ctrl+Shift+C        Chat Tab
Ctrl+Shift+E        Explorer Tab
Ctrl+Shift+G        GitHub Tab
Ctrl+Shift+A        Agents Tab
Ctrl+Shift+T        Team Tab
Ctrl+,              Settings Tab
```

### Panels:
```
Ctrl+J              Toggle Terminal
Ctrl+`              Toggle Terminal (Alt)
Ctrl+Shift+U        Toggle Console
Ctrl+Shift+B        Toggle Browser
```

### Chat:
```
Ctrl+L              Floating Chat
Ctrl+Enter          Send Message
Ctrl+Shift+X        Stop AI
```

### Tools:
```
Ctrl+Shift+M        Memory Dashboard
Ctrl+Alt+S          Swarm Engine
Ctrl+Shift+L        Customize Layout
Ctrl+Alt+L          Reset Layout
Ctrl+Shift+P        Command Palette
```

### Voice & Speech:
```
Ctrl+Shift+V        Voice Coding
```

---

## 📊 **Status Indicators**

### Terminal Status:
```
🟢 [PowerShell 7 ready]     ← Shell is running
🔴 [PowerShell stopped]     ← Shell needs restart
🟡 [Starting...]            ← Shell is loading
```

### AI Status:
```
🟢 Orchestra: Running       ← AI server active
🔴 Orchestra: Offline       ← Start server
🟡 Processing...            ← AI working
```

### File Status:
```
📄 Saved                    ← File up to date
📝 Modified                 ← Unsaved changes
⚠️ Error                    ← Syntax error
```

---

## 🔧 **Common Tasks**

### Task 1: Create a New Project
```
1. Ctrl+Shift+E (Open Explorer)
2. Click "New File"
3. Name: index.js
4. Start coding!
```

### Task 2: Run Code in Terminal
```
1. Ctrl+J (Open Terminal)
2. cd your-project
3. node index.js
4. View output
```

### Task 3: Get AI Help
```
1. Write some code
2. Select code
3. Right-click → Auto Fix
OR
1. Ctrl+L (Open chat)
2. Type: "!code Make a calculator"
3. Code appears in editor
```

### Task 4: Split View Coding
```
1. Editor visible at top (code)
2. Terminal at bottom (output)
3. Chat on right (AI help)
4. Code + Run + Help all visible!
```

---

## 🐛 **Troubleshooting**

### Monaco Editor Not Showing?
```javascript
diagnoseMonaco()      // Run diagnostic
tryCreateEditor()     // Attempt manual fix
```

### Terminal Not Working?
```javascript
// Check if terminal loaded
console.log(window.terminalPanelInstance)

// Manually toggle
window.terminalPanelInstance.toggle()
```

### AI Not Responding?
```javascript
// Check Orchestra status
statusManager.getStatus('orchestra')

// Check executor
const executor = getAgenticExecutor()
console.log(executor)
```

### Hotkeys Not Working?
```javascript
// Check hotkey manager
console.log(window.hotkeyManager)

// Repair
repairConnections()
```

### General Issues?
```javascript
// Run full diagnostic
runSystemDiagnostic()

// Auto-repair
repairConnections()

// Check health
quickHealthCheck()
```

---

## 💡 **Pro Tips**

### Tip 1: Use Command Palette
```
Ctrl+Shift+P
Type what you want to do
Press Enter
```

### Tip 2: Terminal History
```
Up Arrow            Previous command
Down Arrow          Next command
Ctrl+R              Search history
```

### Tip 3: Multi-Cursor Editing
```
Alt+Click           Add cursor
Ctrl+Alt+↓         Add cursor below
Ctrl+Alt+↑         Add cursor above
```

### Tip 4: Quick AI Fixes
```
Select code
Right-click
Choose:
  🔧 Auto Fix
  💡 Explain Code
  ⚡ Optimize
  🧪 Generate Tests
```

### Tip 5: Save Layout
Your layout auto-saves! Your panel positions, sizes, and terminal state persist between sessions.

---

## 📚 **Learning Resources**

### In-Console Help:
```javascript
// View all available commands
hotkeyManager.listHotkeys()

// View chat commands
commandSystem.listCommands()

// View available shells
terminalPanelInstance.shells
```

### Documentation Files:
- `SYSTEM-CHECK-GUIDE.md` - System diagnostics
- `NAMING-WIRING-FIXES.md` - Recent fixes
- `COMPLETE-INTEGRATION-REPORT.md` - Full status
- `FLEXIBLE-LAYOUT-GUIDE.md` - Layout system

---

## 🎉 **You're Ready!**

### Start Coding:
1. **Reload the page**
2. **Press Ctrl+N** to create new file
3. **Start typing** - Monaco has IntelliSense
4. **Press Ctrl+J** to open terminal
5. **Press Ctrl+L** for AI help

### System Will:
- ✅ Auto-initialize everything
- ✅ Display status in console
- ✅ Connect all systems
- ✅ Show health report

### First Run Commands:
```javascript
// See what's working
getIDEStatus()

// Quick health check
quickHealthCheck()

// Enjoy coding! 🚀
```

---

**Happy Coding!** 🎊

*Your 6-month IDE project is complete and ready to use!*
