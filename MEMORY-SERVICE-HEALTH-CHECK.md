# Memory Bridge Service - Health Check and Fallback System

## Overview

The Memory Bridge service now includes robust health checking and automatic fallback to in-memory storage when the backend service is unavailable. This ensures the IDE continues to function even when the OpenMemory PowerShell modules are not accessible.

## Features

### 1. Service Health Monitoring

The memory bridge now continuously monitors service availability and provides clear status indicators:

- **Full Mode** (✅ Green): Backend service is fully operational
- **Limited Mode** (⚡ Orange): Running in in-memory fallback mode
- **Offline Mode** (⚠️ Red): Service is unavailable

### 2. Automatic Fallback

When the backend memory service is unavailable, the bridge automatically falls back to an in-memory storage system:

```javascript
// Automatic initialization with fallback
await window.memory.initialize();

// Check service status
const status = window.memory.getStatus();
console.log(status.mode); // 'full', 'limited', or 'offline'
```

### 3. Health Check API

New methods for checking service availability:

```javascript
// Check if memory service is available
if (window.memory.isAvailable()) {
  // Safe to use memory operations
}

// Get detailed status
const status = window.memory.getStatus();
console.log(status.available);  // boolean
console.log(status.mode);       // 'full', 'limited', 'offline', 'not-initialized'
console.log(status.message);    // Human-readable status message
```

### 4. User-Friendly Error Messages

Operations that fail due to service unavailability now show clear error messages:

```javascript
// Attempting to clear memories when offline
window.memory.clear();
// Alert: "⚠️ Memory service is offline. Cannot clear memories."
```

## Architecture

### Memory Bridge (memory-bridge.js)

**Key Components:**

1. **setupInMemoryMode()**: Creates a fallback Map-based storage
2. **storeMemory()**: Tries IPC first, falls back to in-memory
3. **queryMemory()**: Searches with IPC or in-memory text search
4. **getRecentMemories()**: Retrieves and sorts memories by timestamp

**Initialization Flow:**

```
Initialize
    ↓
Try Electron IPC
    ↓
Success? → Full Mode (backend connected)
    ↓
Failure? → Limited Mode (in-memory fallback)
```

### Memory Dashboard (memory-dashboard.js)

**UI Updates:**

1. **Service Status Display**: Shows real-time service availability
2. **Gated Controls**: Disables dangerous operations when offline
3. **Visual Indicators**: Color-coded status with icons
4. **Error Handling**: User-friendly alerts for failed operations

**Status Panel:**

```
Context Status
┌─────────────────────────────────┐
│ ✅ Memory service fully available │
│ Mode: full                       │
└─────────────────────────────────┘
```

## Usage Examples

### Basic Operations

```javascript
// Store a memory
const memory = await window.memory.store('Important context', {
  type: 'conversation',
  source: 'IDE',
  context: { project: 'BigDaddyG' }
});

// Query memories
const results = await window.memory.query('context', 10);

// Get recent memories
const recent = await window.memory.recent(20);
```

### Health Monitoring

```javascript
// Monitor service status
setInterval(async () => {
  const status = window.memory.getStatus();
  console.log(`Memory Service: ${status.mode} - ${status.message}`);
}, 5000);
```

### Conditional Operations

```javascript
// Only perform expensive operations when backend is available
const status = window.memory.getStatus();
if (status.mode === 'full') {
  // Perform embedding operations
  const embedding = await window.memory.embed(text);
  const similar = await window.memory.similar(embedding);
} else {
  console.warn('Using basic search in limited mode');
  const results = await window.memory.query(text);
}
```

## In-Memory Fallback Details

### Storage Structure

```javascript
inMemoryStore = Map {
  1 => {
    id: 1,
    Content: "memory content",
    Timestamp: "2024-11-10T17:00:00.000Z",
    Type: "conversation",
    Source: "IDE",
    Context: { ... }
  },
  2 => { ... }
}
```

### Limitations

The in-memory fallback has the following limitations:

1. **No Persistence**: Data is lost when the app restarts
2. **No Embeddings**: Semantic search not available (uses text search)
3. **Basic Search**: Simple substring matching instead of semantic search
4. **No Decay**: Memory decay not supported in fallback mode
5. **Limited Capacity**: Constrained by browser memory limits

### When to Use Each Mode

**Full Mode (Backend):**
- Long-term memory persistence
- Semantic search with embeddings
- Memory decay and optimization
- Large-scale memory storage

**Limited Mode (In-Memory):**
- Session-based temporary storage
- Simple text search
- Rapid prototyping/testing
- Graceful degradation when backend unavailable

## Testing

Run the test suite:

```bash
npm test -- memory-bridge.test.js
```

### Test Coverage

- ✅ Initialization with Electron IPC
- ✅ Fallback to in-memory mode
- ✅ Health check methods
- ✅ Storage operations (IPC and fallback)
- ✅ Query operations (IPC and in-memory search)
- ✅ Recent memories (sorting and filtering)
- ✅ Global API exposure

## Monaco Editor Loading

The Monaco editor initialization has been simplified to fix loading issues:

### Changes

1. **Removed Duplicate CSS Loading**: CSS now loads once in index.html
2. **Simplified AMD Setup**: Consolidated loader configuration
3. **Fixed Race Conditions**: Proper sequencing of initialization steps
4. **Better Error Handling**: Clear error messages when loading fails

### Loading Sequence

```
1. Load AMD loader.js
   ↓
2. Configure AMD paths
   ↓
3. Load vs/editor/editor.main
   ↓
4. Call onMonacoLoad()
   ↓
5. Initialize editor instance
```

## Troubleshooting

### Memory Service Not Initializing

**Symptoms:**
- Status shows "not-initialized"
- Memory operations return empty results

**Solution:**
```javascript
// Manually trigger initialization
await window.memory.initialize();
```

### In-Memory Fallback Active

**Symptoms:**
- Status shows "limited" mode
- Orange ⚡ indicator in dashboard

**Cause:**
- OpenMemory PowerShell modules not accessible
- Electron IPC not configured

**Solution:**
- Check OpenMemory installation
- Verify file paths in memory-service.js

### Monaco Editor Not Loading

**Symptoms:**
- Editor container shows error message
- Console shows AMD loader errors

**Solution:**
1. Verify monaco-editor is installed: `npm install`
2. Check browser console for specific errors
3. Run diagnostic: `window.diagnoseMonaco()`

## Future Enhancements

Potential improvements for the memory service:

1. **IndexedDB Persistence**: Use IndexedDB for in-memory fallback persistence
2. **WebWorker Embeddings**: Lightweight embeddings in browser
3. **Sync on Reconnect**: Sync in-memory data when backend becomes available
4. **Compression**: Compress stored memories to save space
5. **Smart Caching**: Cache frequently accessed memories

## References

- `electron/memory-bridge.js` - Main bridge implementation
- `electron/memory-service.js` - Backend service (main process)
- `electron/memory-dashboard.js` - UI dashboard
- `electron/preload.js` - IPC bridge definitions
- `electron/main.js` - IPC handler setup
