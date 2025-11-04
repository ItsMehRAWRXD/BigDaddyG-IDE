# 🎼 Orchestra 3-Pane Layout Guide

**BigDaddyG IDE - Professional 3-Pane Interface**

---

## 🎯 What is Orchestra 3-Pane Layout?

Orchestra Layout transforms BigDaddyG IDE into a beautiful 3-pane interface inspired by Ollama and professional IDEs:

```
┌─────────────────┬──────────────────────┬───────────────────┐
│                 │                      │                   │
│   File          │   AI Chat            │   Code Editor     │
│   Explorer      │   (Center Stage)     │   (Monaco)        │
│                 │                      │                   │
│   • Browse      │   • 100 parallel     │   • Syntax        │
│   • Search      │     sessions         │     highlight     │
│   • Upload      │   • Model select     │   • Auto-         │
│                 │   • Multi-file       │     complete      │
│                 │     upload           │   • Debugging     │
│                 │   • Conversation     │                   │
│                 │     history          │                   │
│                 │                      │                   │
└─────────────────┴──────────────────────┴───────────────────┘
     280px                 flex                    50%
```

---

## ✨ Features

### Left Pane: Conversation History
- **New Chat Button**: Create new AI sessions instantly
- **System Info**: Shows CPU cores, recommended parallel sessions
- **Active Sessions**: `0 / 100` counter
- **Search**: Find past conversations
- **Grouped History**:
  - Today
  - This Week
  - Older
- **Drive Scanner**: Scan C:\ and D:\ for models
- **Settings**: Configure Orchestra

### Center Pane: AI Chat (Main Stage)
- **Model Selector**: Choose from 12+ models
- **Auto-Discovery**: Finds Ollama/GGUF models
- **Session Tabs**: Switch between 100 parallel chats
- **Multi-File Upload**: Attach files to conversations
- **Real-Time Streaming**: See AI think in real-time
- **Message History**: Full conversation context

### Right Pane: Code Editor
- **Monaco Editor**: VS Code's editor engine
- **Syntax Highlighting**: 100+ languages
- **IntelliSense**: Auto-completion
- **Multi-Tab**: Edit multiple files
- **Live Preview**: See changes instantly

---

## 🚀 How to Enable

### Option 1: Automatic (Default)
Orchestra 3-Pane is **enabled by default**. Just launch the IDE!

### Option 2: Manual Toggle
```javascript
// In Browser Console (F12)
localStorage.setItem('orchestra-3pane-enabled', 'true');
location.reload();
```

### Option 3: Settings Panel
1. Open Settings (Ctrl+,)
2. Navigate to "Layout"
3. Toggle "Orchestra 3-Pane Mode"
4. Restart IDE

---

## ⌨️ Hotkeys

### Global Hotkeys
| Hotkey | Action |
|--------|--------|
| `Ctrl+L` | Open floating chat (overlay mode) |
| `Ctrl+[` | Collapse left sidebar |
| `Ctrl+]` | Collapse right sidebar |
| `Ctrl+\` | Toggle both sidebars |
| `Ctrl+Shift+O` | Toggle Orchestra mode |
| `Ctrl+N` | New chat session |
| `Ctrl+W` | Close active session tab |
| `Ctrl+Tab` | Next session tab |
| `Ctrl+Shift+Tab` | Previous session tab |

### Chat Hotkeys
| Hotkey | Action |
|--------|--------|
| `Ctrl+Enter` | Send message |
| `/` | Open command palette |
| `@` | Mention file/context |
| `Ctrl+/` | Toggle code block |
| `Ctrl+Shift+V` | Paste with formatting |

---

## 🎨 Customization

### Adjust Pane Sizes

Edit `orchestra-layout.js`:
```javascript
grid-template-columns: 280px 1fr 50%;
//                     ↑     ↑   ↑
//                     Left  Mid Right
```

Examples:
- **Narrow left**: `200px 1fr 50%`
- **Wide right**: `280px 1fr 60%`
- **Balanced**: `300px 1fr 400px`

### Change Colors

Edit `cursor-theme.css`:
```css
:root {
    --orchestra-sidebar: #1a1a2e;
    --orchestra-chat: #16213e;
    --orchestra-editor: #0f3460;
}

