# 🎯 BigDaddyG IDE - Quick Reference Guide

## ⌨️ Essential Keyboard Shortcuts

### File Operations
- `Ctrl+N` - New File
- `Ctrl+O` - Open File
- `Ctrl+S` - Save File
- `Ctrl+Shift+S` - Save As
- `Ctrl+K Ctrl+S` - **Save All Files** 💾

### Tab Management
- `Ctrl+Tab` - Next Tab
- `Ctrl+Shift+Tab` - Previous Tab
- `Ctrl+W` - Close Tab
- `Ctrl+1-9` - Jump to Tab
- `Alt+Left/Right` - Navigate Tabs

### AI & Commands
- `Ctrl+L` - AI Chat
- `Ctrl+Enter` - Send Message
- `Ctrl+Shift+P` - **Command Palette** 🔍
- `Ctrl+Shift+M` - Memory Dashboard
- `Ctrl+Shift+D` - **Performance Dashboard** 📊

### Terminal
- `` Ctrl+` `` - Toggle Terminal
- `Ctrl+J` - Open/Close Terminal

### Editor
- `Ctrl+F` - Find
- `Ctrl+H` - Find & Replace
- `Ctrl+/` - Toggle Comment

---

## 🔧 Performance Monitoring

### Check IDE Health
```javascript
// Press Ctrl+Shift+D or run in console:
window.perfDashboard.toggle()
```

### Check for Memory Leaks
```javascript
getTimerStats()
// Look for "leak rate" - should be 0%
```

### Check API Efficiency
```javascript
getRequestPoolStats()
// "pending" should be low (<5)
```

### Check Storage Usage
```javascript
await storage.getUsage()
// Returns MB used and quota
```

---

## 🎯 Auto-Optimize (One-Click Fix)

**Press `Ctrl+Shift+D` then click "Auto-Optimize"**

This automatically:
- ✅ Cleans up leaked timers
- ✅ Clears pending requests
- ✅ Disposes unused Monaco models
- ✅ Clears old data
- ✅ Triggers garbage collection

---

## 💾 Storage System

### Unlimited Storage (IndexedDB)
```javascript
// Save data
await storage.saveTabs(tabState)
await storage.saveChat(message)
await storage.cacheFile(path, content)

// Load data
await storage.loadTabs()
await storage.getChatHistory(sessionId, limit)
await storage.getCachedFile(path)

// Cleanup
await storage.clearOldChat(7)  // Keep last 7 days
await storage.clearCache()
```

---

## 🚀 Advanced Features

### Lazy Loading
```javascript
// Load heavy module on-demand
await lazyLoader.load('image-generator')
await lazyLoader.load('cinematic-viz')
await lazyLoader.load('multi-agent-swarm')

// Check loading progress
getLazyLoaderStats()
```

### Virtual Scrolling (For Custom Lists)
```javascript
const scroller = new VirtualScroller('#my-container', {
    itemHeight: 60,
    buffer: 5,
    renderItem: (item, index) => `<div>${item.text}</div>`
});

scroller.setItems(myLargeArray);
```

### Request Pooling
```javascript
// Use pooled fetch (automatic deduplication)
const response = await pooledFetch(url, options);

// Or use with retry
const response = await fetchWithRetry(url, options, 3);
```

---

## 🐛 Troubleshooting

### IDE Running Slow?
1. Press `Ctrl+Shift+D`
2. Check metrics (red = bad, green = good)
3. Click "Auto-Optimize"
4. Restart if memory >500MB

### Tab Won't Close?
- Orange dot (●) = unsaved changes
- Save first (`Ctrl+S`) or force close (confirm dialog)

### Monaco Won't Load?
- Wait 15 seconds
- Error screen will show with "Retry" button
- Check internet connection

### Memory Growing?
```javascript
// Check for leaks
getTimerStats()

// If leak rate >20%, run:
cleanupAllTimers()

// Then:
perfDashboard.optimize()
```

---

## 📊 Monitoring Best Practices

### Daily Health Check (30 seconds)
1. Press `Ctrl+Shift+D`
2. Verify all metrics green/yellow
3. If any red → Click "Auto-Optimize"
4. Check timer leak rate (should be 0%)

### Before Important Work
1. Save All Files (`Ctrl+K Ctrl+S`)
2. Close unused tabs
3. Check performance dashboard
4. If memory >400MB, restart IDE

### After Long Sessions (8+ hours)
1. Save All Files
2. Run `perfDashboard.optimize()`
3. Consider restarting for fresh state

---

## 🎨 Quality of Life Features

### Dirty File Tracking
- Orange dot (●) = unsaved changes
- Tooltip shows "(unsaved)"
- Warning before closing dirty tabs

### Auto-Save
- Saves tab state every 30 seconds
- Uses IndexedDB (unlimited)
- Smart: Only saves dirty/new files

### Tab Recovery
- Prompts on IDE restart
- Shows timestamp and tab count
- One-click recovery

### Loading Feedback
- Spinner for file operations
- Progress for Save All
- Smooth transitions

---

## 💡 Pro Tips

### Maximize Performance
1. Use `Ctrl+K Ctrl+S` instead of saving individually
2. Close tabs you're not using
3. Enable "Eco Mode" for longer battery life
4. Press `Ctrl+Shift+D` weekly to check health

### Maximize Productivity
1. Use `Ctrl+Shift+P` to quickly find files
2. Use `Ctrl+1-9` to jump between tabs
3. Right-click code → AI actions
4. Use terminal (`Ctrl+``) for builds

### Data Management
1. Chat history auto-cleans after 30 days
2. File cache auto-evicts old entries
3. Manual cleanup: `storage.clearCache()`
4. Check usage: `storage.getUsage()`

---

## 📚 Documentation

- `OPTIMIZATION-COMPLETE.md` - Full optimization report
- `IMPROVEMENTS-SUMMARY.md` - Session improvements
- `QUICK-REFERENCE.md` - This guide

---

## 🆘 Need Help?

### Console Commands
```javascript
// Show all available commands
help()

// Performance
getTimerStats()
getRequestPoolStats()
getLazyLoaderStats()

// Storage
await storage.getUsage()

// Dashboards
perfDashboard.toggle()
memoryDashboard.toggle()
```

### Emergency Recovery
```javascript
// If IDE is frozen:
perfDashboard.optimize()  // Try this first

// If still frozen:
cleanupAllTimers()        // Nuclear option

// Last resort:
location.reload()         // Restart IDE
```

---

## ✨ **You're Ready to Code!**

Press `Ctrl+N` to create a new file and start coding! 🚀

**All optimizations active, monitoring enabled, ready for professional use!**
