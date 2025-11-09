console.log('Testing Electron import...');

try {
  const electron = require('electron');
  console.log('Electron imported successfully:', !!electron);
  console.log('Electron keys:', Object.keys(electron));
  console.log('App available:', !!electron.app);
  console.log('BrowserWindow available:', !!electron.BrowserWindow);
  
  if (electron.app) {
    console.log('App methods:', Object.getOwnPropertyNames(electron.app));
  }
} catch (error) {
  console.error('Failed to import Electron:', error.message);
  console.error('Stack:', error.stack);
}

console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Arch:', process.arch);
console.log('Process type:', process.type);