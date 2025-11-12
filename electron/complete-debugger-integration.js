const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class DebuggerIntegration {
  constructor() {
    this.mainWindow = null;
    this.debugSession = null;
    this.breakpoints = new Map();
  }

  init() {
    this.setupIPC();
    this.createWindow();
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });

    this.mainWindow.loadFile('index.html');
    
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }
  }

  setupIPC() {
    ipcMain.handle('debugger:start', async (event, config) => {
      try {
        this.debugSession = {
          id: Date.now(),
          config,
          status: 'running'
        };
        return { success: true, sessionId: this.debugSession.id };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('debugger:stop', async () => {
      if (this.debugSession) {
        this.debugSession.status = 'stopped';
        this.debugSession = null;
      }
      return { success: true };
    });

    ipcMain.handle('debugger:setBreakpoint', async (event, file, line) => {
      const key = `${file}:${line}`;
      this.breakpoints.set(key, { file, line, enabled: true });
      return { success: true, breakpointId: key };
    });

    ipcMain.handle('debugger:removeBreakpoint', async (event, breakpointId) => {
      this.breakpoints.delete(breakpointId);
      return { success: true };
    });

    ipcMain.handle('debugger:getStatus', async () => {
      return {
        session: this.debugSession,
        breakpoints: Array.from(this.breakpoints.entries())
      };
    });
  }
}

const debuggerInstance = new DebuggerIntegration();

app.whenReady().then(() => {
  debuggerInstance.init();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

module.exports = DebuggerIntegration;