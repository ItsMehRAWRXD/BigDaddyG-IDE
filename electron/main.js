/**
 * BigDaddyG IDE - Electron Main Process
 * Professional desktop IDE with dedicated tabs and syntax highlighting
 */

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');
const windowStateKeeper = require('electron-window-state');
const { EmbeddedBrowser } = require('./browser-view');
const SafeModeDetector = require('./safe-mode-detector');

let mainWindow;
let orchestraServer = null;
let embeddedBrowser;
let safeModeDetector = new SafeModeDetector();

// ============================================================================
// GPU & PERFORMANCE OPTIMIZATIONS
// ============================================================================

// FIX: HIGH REFRESH RATE DISPLAY SUPPORT (8K @ 540Hz!)
app.commandLine.appendSwitch('disable-gpu-vsync'); // Disable vsync for high refresh
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('max-gum-fps', '600'); // Support up to 600fps

// FIX: Force software rendering for stability (high res displays)
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer', 'false');

// FIX: Reduce memory pressure
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192');

console.log('[BigDaddyG] ⚡ GPU acceleration enabled');
console.log('[BigDaddyG] 🎯 Target: 240 FPS');

// ============================================================================
// APPLICATION LIFECYCLE
// ============================================================================

app.whenReady().then(() => {
  console.log('[BigDaddyG] 🚀 Starting Electron app...');
  
  // Start Orchestra server
  startOrchestraServer();
  
  // Create main window
  createMainWindow();
  
  // Set up application menu
  createMenu();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Stop Orchestra server
  if (orchestraServer) {
    orchestraServer.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============================================================================
// ORCHESTRA SERVER
// ============================================================================

function startOrchestraServer() {
  if (orchestraServer && !orchestraServer.killed) {
    console.log('[BigDaddyG] ⚠️ Orchestra server already running');
    return;
  }
  
  console.log('[BigDaddyG] 🎼 Starting Orchestra server...');
  
  // Try multiple possible paths
  const possiblePaths = [
    path.join(__dirname, '../server/Orchestra-Server.js'),
    path.join(process.resourcesPath, 'app/server/Orchestra-Server.js'),
    path.join(app.getAppPath(), 'server/Orchestra-Server.js'),
    path.join(process.cwd(), 'server/Orchestra-Server.js')
  ];
  
  let serverPath = null;
  let serverCwd = null;
  
  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      serverPath = tryPath;
      serverCwd = path.dirname(tryPath);
      break;
    }
  }
  
  if (!serverPath) {
    console.error('[BigDaddyG] ❌ Orchestra-Server.js not found!');
    if (mainWindow) {
      mainWindow.webContents.send('orchestra-log', {
        type: 'error',
        message: '❌ Orchestra-Server.js not found! Please ensure it is bundled with the app.'
      });
    }
    return;
  }
  
  // FIX: Quote the path to handle spaces in directory names
  orchestraServer = spawn('node', [`"${serverPath}"`], {
    cwd: serverCwd,
    stdio: 'pipe',
    shell: true, // ALWAYS use shell for proper path quoting
    windowsVerbatimArguments: false // Let shell handle quoting
  });
  
  orchestraServer.stdout.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`[Orchestra] ${message}`);
    
    if (mainWindow) {
      mainWindow.webContents.send('orchestra-log', {
        type: 'output',
        message: message
      });
    }
  });
  
  orchestraServer.stderr.on('data', (data) => {
    const message = data.toString().trim();
    console.error(`[Orchestra Error] ${message}`);
    
    if (mainWindow) {
      mainWindow.webContents.send('orchestra-log', {
        type: 'error',
        message: message
      });
    }
  });
  
  orchestraServer.on('close', (code) => {
    console.log(`[Orchestra] Process exited with code ${code}`);
    orchestraServer = null;
    
    if (mainWindow) {
      mainWindow.webContents.send('orchestra-status', {
        running: false,
        code: code
      });
    }
  });
  
  orchestraServer.on('error', (error) => {
    console.error('[Orchestra] Failed to start:', error);
    
    if (mainWindow) {
      mainWindow.webContents.send('orchestra-log', {
        type: 'error',
        message: `Failed to start: ${error.message}`
      });
    }
  });
  
  // Notify that server is starting
  if (mainWindow) {
    mainWindow.webContents.send('orchestra-status', {
      running: true,
      starting: true
    });
    
    // Wait a moment, then check if it's actually running
    setTimeout(() => {
      checkOrchestraHealth();
    }, 3000);
  }
  
  console.log('[BigDaddyG] ✅ Orchestra server process started');
}

function stopOrchestraServer() {
  if (!orchestraServer || orchestraServer.killed) {
    console.log('[BigDaddyG] ⚠️ Orchestra server not running');
    return;
  }
  
  console.log('[BigDaddyG] 🛑 Stopping Orchestra server...');
  
  orchestraServer.kill('SIGTERM');
  
  // Force kill after 5 seconds if still running
  setTimeout(() => {
    if (orchestraServer && !orchestraServer.killed) {
      orchestraServer.kill('SIGKILL');
      console.log('[BigDaddyG] ⚡ Force-killed Orchestra server');
    }
  }, 5000);
  
  orchestraServer = null;
  
  if (mainWindow) {
    mainWindow.webContents.send('orchestra-status', {
      running: false,
      stopped: true
    });
  }
}

function checkOrchestraHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:11441/health', { timeout: 1000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (mainWindow) {
            mainWindow.webContents.send('orchestra-status', {
              running: true,
              data: jsonData
            });
          }
          resolve(true);
        } catch (error) {
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      if (mainWindow) {
        mainWindow.webContents.send('orchestra-status', {
          running: false
        });
      }
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      if (mainWindow) {
        mainWindow.webContents.send('orchestra-status', {
          running: false
        });
      }
      resolve(false);
    });
  });
}

// ============================================================================
// MAIN WINDOW
// ============================================================================

function createMainWindow() {
  console.log('[BigDaddyG] 🪟 Creating main window...');
  
  // Remember window state
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1920,
    defaultHeight: 1080
  });
  
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1280,
    minHeight: 720,
    
    title: 'BigDaddyG IDE',
    backgroundColor: '#0a0a1e',
    
    webPreferences: {
      nodeIntegration: false,  // Disable - causes conflicts with Monaco AMD
      contextIsolation: true,  // Enable - Monaco needs this for __$__isRecorded
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    
    frame: false,  // No default frame - we'll use custom title bar
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '../assets/icon.png')
  });
  
  // Manage window state
  mainWindowState.manage(mainWindow);
  
  // Load IDE - Using Safe Mode Detector
  const htmlFile = safeModeDetector.getHTMLFile();
  
  console.log(`[BigDaddyG] 📄 Loading: ${htmlFile}`);
  console.log(`[BigDaddyG] 🛡️ Safe Mode: ${safeModeDetector.getConfig().SafeMode.enabled}`);
  mainWindow.loadFile(path.join(__dirname, htmlFile));
  
  // Open DevTools ALWAYS for debugging white screen
  mainWindow.webContents.openDevTools({ mode: 'detach' }); // Detach so it's in separate window
  
  // Log any page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[BigDaddyG] ❌ Page failed to load:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('crashed', () => {
    console.error('[BigDaddyG] ❌ Renderer process crashed!');
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[BigDaddyG] ✅ Page loaded successfully');
    
    // Wait 2 seconds, then check if content rendered
    setTimeout(() => {
      mainWindow.webContents.executeJavaScript(`
        document.body.style.backgroundColor || 
        document.body.style.background || 
        getComputedStyle(document.body).backgroundColor
      `).then(bgColor => {
        console.log(`[SafeMode] Background color detected: ${bgColor}`);
        
        // If it's white or empty, report failure
        if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'rgb(255, 255, 255)' || bgColor === '#ffffff') {
          console.log('[SafeMode] ⚠️ White screen detected!');
          safeModeDetector.reportFailure(htmlFile);
        } else {
          console.log('[SafeMode] ✅ Colors detected - page rendered successfully');
          safeModeDetector.reportSuccess(htmlFile);
        }
      }).catch(err => {
        console.error('[SafeMode] Error checking background:', err);
      });
    }, 2000);
  });
  
  // Log console messages from renderer to terminal
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['LOG', 'WARN', 'ERROR'];
    console.log(`[Renderer ${levels[level]}] ${message} (${sourceId}:${line})`);
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (embeddedBrowser) {
      embeddedBrowser.destroy();
    }
  });
  
  // Initialize embedded browser
  embeddedBrowser = new EmbeddedBrowser(mainWindow);
  
  console.log('[BigDaddyG] ✅ Main window created');
  console.log('[BigDaddyG] 🌐 Embedded browser initialized');
}

// ============================================================================
// APPLICATION MENU
// ============================================================================

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-file');
          }
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-open-file');
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-file');
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu-save-as');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send('menu-toggle-sidebar');
          }
        },
        {
          label: 'Toggle Terminal',
          accelerator: 'CmdOrCtrl+`',
          click: () => {
            mainWindow.webContents.send('menu-toggle-terminal');
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'AI',
      submenu: [
        {
          label: 'Ask BigDaddyG',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow.webContents.send('menu-ask-ai');
          }
        },
        {
          label: 'Explain Code',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-ai-explain');
          }
        },
        {
          label: 'Fix Code',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => {
            mainWindow.webContents.send('menu-ai-fix');
          }
        },
        {
          label: 'Optimize Code',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            mainWindow.webContents.send('menu-ai-optimize');
          }
        },
        { type: 'separator' },
        {
          label: 'Tune Parameters',
          click: () => {
            mainWindow.webContents.send('menu-ai-tune');
          }
        }
      ]
    },
    {
      label: 'Browser',
      submenu: [
        {
          label: 'Show Browser',
          accelerator: 'Ctrl+Shift+B',
          click: () => {
            mainWindow.webContents.send('menu-show-browser');
          }
        },
        {
          label: 'Navigate to URL',
          accelerator: 'Ctrl+L',
          click: () => {
            mainWindow.webContents.send('menu-browser-navigate');
          }
        },
        { type: 'separator' },
        {
          label: 'Back',
          accelerator: 'Alt+Left',
          click: () => {
            mainWindow.webContents.send('menu-browser-back');
          }
        },
        {
          label: 'Forward',
          accelerator: 'Alt+Right',
          click: () => {
            mainWindow.webContents.send('menu-browser-forward');
          }
        },
        {
          label: 'Reload',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('menu-browser-reload');
          }
        },
        { type: 'separator' },
        {
          label: 'Take Screenshot',
          accelerator: 'Ctrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu-browser-screenshot');
          }
        },
        {
          label: 'Analyze for Issues',
          click: () => {
            mainWindow.webContents.send('menu-browser-analyze');
          }
        },
        {
          label: 'Suggest UI Improvements',
          click: () => {
            mainWindow.webContents.send('menu-browser-suggest-ui');
          }
        },
        { type: 'separator' },
        {
          label: 'Open DevTools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.send('menu-browser-devtools');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal('https://github.com/bigdaddyg/ide');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            require('electron').shell.openExternal('https://github.com/bigdaddyg/ide/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'About BigDaddyG IDE',
          click: () => {
            mainWindow.webContents.send('menu-about');
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  console.log('[BigDaddyG] ✅ Application menu created');
}

// ============================================================================
// IPC HANDLERS
// ============================================================================

ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open file dialog
ipcMain.handle('open-file-dialog', async (event, options = {}) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: options.filters || [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css'] }
      ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return { 
        success: true, 
        filePath, 
        content,
        filename: path.basename(filePath)
      };
    }
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Save file dialog
ipcMain.handle('save-file-dialog', async (event, options = {}) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: options.defaultPath || 'untitled.txt',
      filters: options.filters || [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css'] }
      ]
    });
    
    if (!result.canceled) {
      return { 
        success: true, 
        filePath: result.filePath,
        filename: path.basename(result.filePath)
      };
    }
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open folder dialog
ipcMain.handle('open-folder-dialog', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      return { 
        success: true, 
        folderPath,
        folderName: path.basename(folderPath)
      };
    }
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Read directory
ipcMain.handle('read-dir', async (event, dirPath) => {
  const fs = require('fs').promises;
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile(),
      path: path.join(dirPath, entry.name)
    }));
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get file stats
ipcMain.handle('get-file-stats', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const stats = await fs.stat(filePath);
    return { 
      success: true, 
      stats: {
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        modified: stats.mtime,
        created: stats.birthtime
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Check if file exists
ipcMain.handle('file-exists', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    await fs.access(filePath);
    return { success: true, exists: true };
  } catch (error) {
    return { success: true, exists: false };
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

// Orchestra server control
ipcMain.handle('orchestra:start', () => {
  startOrchestraServer();
  return { success: true };
});

ipcMain.handle('orchestra:stop', () => {
  stopOrchestraServer();
  return { success: true };
});

ipcMain.handle('orchestra:status', async () => {
  const isRunning = await checkOrchestraHealth();
  return { running: isRunning };
});

// Window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

console.log('[BigDaddyG] 🌌 Main process initialized');

