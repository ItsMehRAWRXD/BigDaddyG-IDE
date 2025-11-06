/**
 * BigDaddyG IDE - Electron Preload Script
 * Secure bridge between main process and renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // File system operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  readDir: (dirPath) => ipcRenderer.invoke('read-dir', dirPath),
  getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  
  // Agentic file system operations (unlimited)
  searchFiles: (query, options) => ipcRenderer.invoke('search-files', query, options),
  readDirRecursive: (dirPath, maxDepth) => ipcRenderer.invoke('read-dir-recursive', dirPath, maxDepth),
  readFileChunked: (filePath, chunkSize) => ipcRenderer.invoke('read-file-chunked', filePath, chunkSize),
  readMultipleFiles: (filePaths) => ipcRenderer.invoke('read-multiple-files', filePaths),
  findByPattern: (pattern, startPath) => ipcRenderer.invoke('find-by-pattern', pattern, startPath),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Orchestra server control
  startOrchestra: () => ipcRenderer.invoke('orchestra:start'),
  stopOrchestra: () => ipcRenderer.invoke('orchestra:stop'),
  getOrchestraStatus: () => ipcRenderer.invoke('orchestra:status'),
  
  // Native speech recognition (offline, cross-platform)
  windowsSpeechRecognize: () => ipcRenderer.invoke('windows-speech-recognize'),
  macSpeechRecognize: () => ipcRenderer.invoke('mac-speech-recognize'),
  linuxSpeechRecognize: () => ipcRenderer.invoke('linux-speech-recognize'),
  
  // Drive & file system browsing
  listDrives: () => ipcRenderer.invoke('list-drives'),
  onDrivesChanged: (callback) => ipcRenderer.on('drives-changed', (_, drives) => callback(drives)),
  
  // Advanced file operations
  createDirectory: (dirPath) => ipcRenderer.invoke('createDirectory', dirPath),
  deleteItem: (itemPath, isDirectory) => ipcRenderer.invoke('deleteItem', itemPath, isDirectory),
  copyItem: (sourcePath, destPath) => ipcRenderer.invoke('copyItem', sourcePath, destPath),
  moveItem: (sourcePath, destPath) => ipcRenderer.invoke('moveItem', sourcePath, destPath),
  getStats: (itemPath) => ipcRenderer.invoke('getStats', itemPath),
  
  // Memory bridge
  memory: {
    getStats: () => ipcRenderer.invoke('memory:getStats'),
    store: (content, metadata = {}) => ipcRenderer.invoke('memory:store', { content, metadata }),
    query: (query, limit = 10) => ipcRenderer.invoke('memory:query', { query, limit }),
    recent: (limit = 20) => ipcRenderer.invoke('memory:recent', limit),
    embedding: (text, model = 'local') => ipcRenderer.invoke('memory:embedding', { text, model }),
    similar: (embedding, threshold = 0.7, limit = 10) => ipcRenderer.invoke('memory:similar', { embedding, threshold, limit }),
    decay: () => ipcRenderer.invoke('memory:decay'),
    clear: () => ipcRenderer.invoke('memory:clear')
  },

  // System integration
  launchProgram: (programPath) => ipcRenderer.invoke('launchProgram', programPath),
  openInExplorer: (itemPath) => ipcRenderer.invoke('openInExplorer', itemPath),
  openUrl: (url) => ipcRenderer.invoke('openUrl', url),
  getSystemInfo: () => ipcRenderer.invoke('getSystemInfo'),
  
  // Terminal execution
  executeCommand: (command, shell, cwd) => ipcRenderer.invoke('execute-command', { command, shell, cwd }),
  onTerminalOutput: (callback) => ipcRenderer.on('terminal-output', (_, data) => callback(data)),
  onTerminalExit: (callback) => ipcRenderer.on('terminal-exit', (_, data) => callback(data)),
  
  // Browser operations
  browser: {
    navigate: (url) => ipcRenderer.invoke('browser:navigate', url),
    back: () => ipcRenderer.invoke('browser:back'),
    forward: () => ipcRenderer.invoke('browser:forward'),
    reload: () => ipcRenderer.invoke('browser:reload'),
    stop: () => ipcRenderer.invoke('browser:stop'),
    show: () => ipcRenderer.invoke('browser:show'),
    hide: () => ipcRenderer.invoke('browser:hide'),
    screenshot: (options) => ipcRenderer.invoke('browser:screenshot', options),
    analyze: () => ipcRenderer.invoke('browser:analyze'),
    suggestUI: () => ipcRenderer.invoke('browser:suggest-ui'),
    devTools: () => ipcRenderer.invoke('browser:devtools'),
    getConsoleLogs: () => ipcRenderer.invoke('browser:get-console-logs'),
    getNetworkLogs: () => ipcRenderer.invoke('browser:get-network-logs'),
    getScreenshots: () => ipcRenderer.invoke('browser:get-screenshots'),
    clearLogs: () => ipcRenderer.invoke('browser:clear-logs'),
    
    // Browser events
    onLoading: (callback) => ipcRenderer.on('browser:loading', (_, data) => callback(data)),
    onLoaded: (callback) => ipcRenderer.on('browser:loaded', (_, data) => callback(data)),
    onError: (callback) => ipcRenderer.on('browser:error', (_, data) => callback(data)),
    onTitle: (callback) => ipcRenderer.on('browser:title', (_, data) => callback(data)),
    onConsole: (callback) => ipcRenderer.on('browser:console', (_, data) => callback(data)),
    onNetwork: (callback) => ipcRenderer.on('browser:network', (_, data) => callback(data)),
    onScreenshot: (callback) => ipcRenderer.on('browser:screenshot', (_, data) => callback(data)),
    onIssues: (callback) => ipcRenderer.on('browser:issues', (_, data) => callback(data)),
    onUISuggestions: (callback) => ipcRenderer.on('browser:ui-suggestions', (_, data) => callback(data))
  },
  
  // Menu events (receive only)
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu-new-file', () => callback('new-file'));
    ipcRenderer.on('menu-open-file', () => callback('open-file'));
    ipcRenderer.on('menu-save-file', () => callback('save-file'));
    ipcRenderer.on('menu-save-as', () => callback('save-as'));
    ipcRenderer.on('menu-toggle-sidebar', () => callback('toggle-sidebar'));
    ipcRenderer.on('menu-toggle-terminal', () => callback('toggle-terminal'));
    ipcRenderer.on('menu-ask-ai', () => callback('ask-ai'));
    ipcRenderer.on('menu-ai-explain', () => callback('ai-explain'));
    ipcRenderer.on('menu-ai-fix', () => callback('ai-fix'));
    ipcRenderer.on('menu-ai-optimize', () => callback('ai-optimize'));
    ipcRenderer.on('menu-ai-tune', () => callback('ai-tune'));
    ipcRenderer.on('menu-about', () => callback('about'));
    
    // Browser menu events
    ipcRenderer.on('menu-show-browser', () => callback('show-browser'));
    ipcRenderer.on('menu-browser-navigate', () => callback('browser-navigate'));
    ipcRenderer.on('menu-browser-back', () => callback('browser-back'));
    ipcRenderer.on('menu-browser-forward', () => callback('browser-forward'));
    ipcRenderer.on('menu-browser-reload', () => callback('browser-reload'));
    ipcRenderer.on('menu-browser-screenshot', () => callback('browser-screenshot'));
    ipcRenderer.on('menu-browser-analyze', () => callback('browser-analyze'));
    ipcRenderer.on('menu-browser-suggest-ui', () => callback('browser-suggest-ui'));
    ipcRenderer.on('menu-browser-devtools', () => callback('browser-devtools'));
  }
});

console.log('[BigDaddyG] ✅ Preload script loaded');

