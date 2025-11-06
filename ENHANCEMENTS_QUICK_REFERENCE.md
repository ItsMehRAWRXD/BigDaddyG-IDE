# 🚀 Enhancements Quick Reference Guide

## ⚡ Fast Access Commands

### **1. Fetch Timeout Wrapper**
```javascript
// Get statistics
getFetchStats()

// Abort all requests
abortAllFetches()

// Custom timeout (default: 30s)
fetchWrapper.setDefaultTimeout(60000)

// Retry with backoff
fetchWithRetry(url, options, 3)
```

### **2. Drive Polling Control**
```javascript
// Check status
electron.drivePolling.status()

// Manual control (usually automatic)
electron.drivePolling.start()
electron.drivePolling.stop()
```

### **3. Debug Mode**
```javascript
// Quick presets
debugMode.setProduction()      // Warnings & errors only
debugMode.setDevelopment()     // Full logging

// Toggle (or Ctrl+Shift+Alt+D)
debugMode.enable()
debugMode.disable()

// Stats
debugMode.getStats()

// Granular control
debugMode.setLevel('log', false)
debugMode.setLevel('debug', false)
```

### **4. Event Listener Manager**
```javascript
// Statistics
eventListenerManager.getStats()

// Find leaks
eventListenerManager.findLeaks()

// Details
eventListenerManager.getDetails()

// Manual cleanup
eventListenerManager.cleanupElement(element)
eventListenerManager.cleanupByType('click')
eventListenerManager.cleanupAll()
```

---

## 📊 Health Check Dashboard

### **Copy-Paste This Into Console:**
```javascript
console.log('=== IDE HEALTH CHECK ===\n');

// Fetch health
const fetchStats = getFetchStats();
console.log('📡 Fetch Requests:');
console.log(`   Success Rate: ${fetchStats.successRate}`);
console.log(`   Active: ${fetchStats.active}`);
console.log(`   Total: ${fetchStats.total}`);

// Debug mode
console.log('\n🐛 Debug Mode:');
console.log(`   Enabled: ${debugMode.isEnabled()}`);
const debugStats = debugMode.getStats();
console.log(`   Logs/sec: ${debugStats.logsPerSecond}`);

// Event listeners
const eventStats = eventListenerManager.getStats();
console.log('\n🎧 Event Listeners:');
console.log(`   Active: ${eventStats.total.active}`);
console.log(`   Total: ${eventStats.total.added}`);
console.log(`   Removed: ${eventStats.total.removed}`);

// Leaks
const leaks = eventListenerManager.findLeaks();
console.log(`\n⚠️  Potential Leaks: ${leaks.length}`);
if (leaks.length > 0) {
    leaks.forEach(leak => {
        console.log(`   - ${leak.combination}: ${leak.count} listeners`);
    });
}

console.log('\n✅ Health check complete!');
```

---

## 🎯 Production Deployment

### **One-Line Setup:**
```javascript
// Add this to startup code:
debugMode.setProduction();
```

### **Or Edit Configuration:**
Edit `debug-mode.js` line 13:
```javascript
enabled: false,  // Disables all logging
```

---

## 🔧 Troubleshooting

### **Problem: Too many console logs**
```javascript
debugMode.setProduction()
```

### **Problem: Request hanging**
```javascript
// Check active requests
getFetchStats().activeRequests

// Abort all
abortAllFetches()
```

### **Problem: Memory increasing**
```javascript
// Check for listener leaks
eventListenerManager.findLeaks()

// Check stats
eventListenerManager.getStats()
```

### **Problem: High CPU usage**
```javascript
// Check if drive polling is running unnecessarily
electron.drivePolling.status()

// Stop it if needed
electron.drivePolling.stop()
```

---

## 📈 Performance Monitoring

### **Real-Time Stats (every 10 seconds):**
```javascript
setInterval(() => {
    console.log('\n=== PERFORMANCE SNAPSHOT ===');
    console.log('Fetch:', getFetchStats().successRate);
    console.log('Listeners:', eventListenerManager.getStats().total.active);
    console.log('Logs/sec:', debugMode.getStats().logsPerSecond);
}, 10000);
```

---

## 🎨 Keyboard Shortcuts

- **Ctrl+Shift+Alt+D** - Toggle debug mode

---

## 📞 API Reference

### **Global Objects:**
- `window.fetchWrapper` - Fetch management system
- `window.debugMode` - Debug mode controller
- `window.eventListenerManager` - Event listener tracker
- `window.electron.drivePolling` - Drive polling control

### **Quick Functions:**
- `getFetchStats()` - Fetch statistics
- `abortAllFetches()` - Abort all requests
- `fetchWithRetry(url, options, retries)` - Retry logic

---

## 💡 Best Practices

1. **Use `debugMode.setProduction()` in production**
2. **Monitor `eventListenerManager.findLeaks()` during development**
3. **Check `getFetchStats()` if network seems slow**
4. **Let drive polling auto-manage (don't call manually)**

---

## ⚙️ Configuration Files

| Feature | File | Key Line |
|---------|------|----------|
| Fetch Timeout | `fetch-timeout-wrapper.js` | Line 17 (`defaultTimeout`) |
| Debug Mode | `debug-mode.js` | Line 13 (`enabled`) |
| Drive Polling | `main.js` | Line 1450 (interval) |
| Event Listeners | `event-listener-manager.js` | Line 97 (warning threshold) |

---

**Need more details?** See `OPTIONAL_ENHANCEMENTS_IMPLEMENTED.md`

