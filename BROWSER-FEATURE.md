# 🌐 Integrated Web Browser - User Guide

## ✨ **NEW FEATURE: Full Web Browser Inside BigDaddyG IDE!**

You can now browse the internet **without leaving your IDE!**

---

## 🎯 **How to Use:**

### **Open the Browser:**
- Press **`Ctrl+Shift+B`** to toggle the browser
- Or call `webBrowser.openBrowser()` from console
- Or `webBrowser.openBrowser('https://github.com')` to open a specific URL

### **Close the Browser:**
- Press **`Escape`**
- Or click the **✕** button in the toolbar
- Or press **`Ctrl+Shift+B`** again

---

## 🎮 **Browser Controls:**

### **Toolbar Buttons:**
- **←** - Go Back
- **→** - Go Forward  
- **⟳** - Refresh/Reload
- **⌂** - Go to Home (Google)
- **🔧** - Toggle DevTools (inspect pages!)
- **⭐** - Bookmark current page
- **✕** - Close browser

### **Address Bar:**
- Type a URL: `github.com` or `https://stackoverflow.com`
- Type a search: `react hooks tutorial`
- Press **Enter** to navigate

---

## 💡 **Use Cases:**

### **1. Look Up Documentation While Coding**
```javascript
// Stuck on a React hook?
// Press Ctrl+Shift+B
// Search "react useEffect cleanup"
// Code alongside the docs!
```

### **2. Test Your Web Apps**
```javascript
// Built a local server?
webBrowser.openBrowser('http://localhost:3000')
// See it live in the IDE!
```

### **3. Stack Overflow While Debugging**
- Hit an error?
- Press Ctrl+Shift+B
- Search the error message
- Copy solution
- Keep coding!

### **4. GitHub, NPM, MDN Docs**
- `github.com/user/repo` - Check your repos
- `npmjs.com/package/react` - Package docs
- `developer.mozilla.org` - MDN reference

---

## 🎨 **Features:**

✅ **Full Navigation**
- Back/Forward buttons
- Address bar with autocomplete
- Refresh page
- Home button (Google)

✅ **DevTools Access**
- Click 🔧 to open DevTools
- Inspect any web page
- Debug third-party sites
- Learn from others' code!

✅ **Bookmarks**
- Click ⭐ to bookmark
- Saved to localStorage
- Access with `webBrowser.getBookmarks()`

✅ **History**
- All visited pages tracked
- Access with `webBrowser.getHistory()`

✅ **Smart Search**
- Type URLs directly: `github.com`
- Or search Google: `javascript arrays`
- Auto-detects intent!

---

## 🔧 **API Reference:**

```javascript
// Open browser
webBrowser.openBrowser()
webBrowser.openBrowser('https://github.com')

// Close browser
webBrowser.closeBrowser()

// Toggle browser
webBrowser.toggleBrowser()

// Navigate
webBrowser.navigate('https://example.com')
webBrowser.navigate('how to code')  // Google search

// Navigation
webBrowser.goBack()
webBrowser.goForward()
webBrowser.refresh()
webBrowser.goHome()

// DevTools
webBrowser.toggleDevTools()

// Bookmarks & History
webBrowser.addBookmark()
webBrowser.getBookmarks()  // Returns array
webBrowser.getHistory()    // Returns array
```

---

## 🎹 **Keyboard Shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+B` | Toggle browser |
| `Escape` | Close browser |
| `Enter` (in address bar) | Navigate/Search |
| `F12` | Toggle DevTools |

---

## 🚀 **Pro Tips:**

### **Side-by-Side Coding**
1. Open browser (`Ctrl+Shift+B`)
2. Navigate to docs
3. Resize IDE window
4. Code + Docs side-by-side!

### **Quick Documentation**
```javascript
// Press Ctrl+Shift+B
// Type: "mdn array methods"
// Press Enter
// Instant docs!
```

### **Test Local Servers**
```bash
# Start your server
npm start

# In IDE console:
webBrowser.openBrowser('http://localhost:3000')
# Test while you code!
```

### **Learn from Source**
1. Visit any website
2. Click 🔧 (DevTools)
3. Inspect their code
4. Learn their techniques!

---

## 🎨 **UI Design:**

**Dark Theme:** Matches IDE perfectly  
**Seamless:** No context switching  
**Professional:** Clean, modern toolbar  
**Fast:** Chromium engine (same as Chrome!)

---

## ⚡ **Performance:**

- **Separate Process:** Browser runs in isolation
- **Full Chromium:** Same engine as Chrome/Edge
- **Hardware Accelerated:** GPU rendering
- **Memory Efficient:** Shared with IDE

---

## 🔒 **Security:**

- **Context Isolation:** Browser is sandboxed
- **No Node Access:** Websites can't access your system
- **HTTPS Supported:** Secure connections
- **Same as Chrome:** Inherits Chromium security

---

## 📊 **Examples:**

### **GitHub Integration**
```javascript
// Open your GitHub repos
webBrowser.openBrowser('https://github.com/ItsMehRAWRXD')

// Check pull requests
webBrowser.openBrowser('https://github.com/pulls')
```

### **NPM Package Research**
```javascript
// Research a package
webBrowser.openBrowser('https://npmjs.com/package/axios')
```

### **Stack Overflow Search**
```javascript
// Search for solutions
webBrowser.navigate('react hooks memory leak')
// Auto-searches Google, find Stack Overflow
```

---

## 🎉 **Get Started NOW:**

1. Press **`Ctrl+Shift+B`**
2. Type **`github.com`**
3. Press **`Enter`**
4. **Welcome to browsing while coding!**

---

**Status:** ✅ **PRODUCTION READY**  
**Version:** 1.0.0  
**Engine:** Chromium (Electron Webview)  

---

**Happy Browsing! 🌐✨**

