// Test if Electron is working
console.log('Testing Electron import...');

try {
  const electron = require('electron');
  console.log('Electron imported successfully:', !!electron);
  console.log('App available:', !!electron.app);
  console.log('BrowserWindow available:', !!electron.BrowserWindow);
  
  const { app, BrowserWindow } = electron;
  
  app.whenReady().then(() => {
    console.log('App is ready!');
    
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    
    win.loadFile('index.html');
    console.log('Window created and loading...');
  });
  
} catch (error) {
  console.error('Error importing Electron:', error);
}