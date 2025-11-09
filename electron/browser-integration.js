// Enhanced Browser Integration Module
const { BrowserView, BrowserWindow } = require('electron');

class BrowserIntegration {
    constructor() {
        this.mainWindow = null;
        this.browserView = null;
        this.isVisible = false;
        this.currentUrl = 'https://youtube.com';
        this.history = [];
        this.bookmarks = ['https://youtube.com', 'https://github.com', 'https://stackoverflow.com'];
    }

    init(mainWindow) {
        this.mainWindow = mainWindow;
        this.createBrowserView();
        this.setupControls();
        this.setupKeyboardShortcuts();
        this.setupIPC();
    }

    createBrowserView() {
        this.browserView = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                webSecurity: true,
                allowRunningInsecureContent: false
            }
        });

        this.browserView.webContents.on('did-navigate', (event, url) => {
            this.currentUrl = url;
            this.history.push(url);
            this.updateAddressBar();
        });

        this.browserView.webContents.setWindowOpenHandler(({ url }) => {
            this.navigate(url);
            return { action: 'deny' };
        });
    }

    setupControls() {
        const controlsHTML = `
            <div id="browser-controls" style="display:none; position:fixed; top:0; left:0; right:0; height:40px; background:#2d2d2d; z-index:9999; padding:5px; display:flex; align-items:center;">
                <button onclick="browserIntegration.back()" style="margin:0 5px; padding:5px 10px; background:#444; color:white; border:none; cursor:pointer;">←</button>
                <button onclick="browserIntegration.forward()" style="margin:0 5px; padding:5px 10px; background:#444; color:white; border:none; cursor:pointer;">→</button>
                <button onclick="browserIntegration.refresh()" style="margin:0 5px; padding:5px 10px; background:#444; color:white; border:none; cursor:pointer;">⟳</button>
                <input id="address-bar" type="text" value="${this.currentUrl}" style="flex:1; margin:0 10px; padding:5px; background:#1e1e1e; color:white; border:1px solid #555;" onkeypress="if(event.key==='Enter') browserIntegration.navigate(this.value)">
                <button onclick="browserIntegration.openYouTube()" style="margin:0 5px; padding:5px 10px; background:#ff0000; color:white; border:none; cursor:pointer;">YouTube</button>
                <button onclick="browserIntegration.toggle()" style="margin:0 5px; padding:5px 10px; background:#444; color:white; border:none; cursor:pointer;">✕</button>
            </div>
        `;
        
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.executeJavaScript(`
                if (!document.getElementById('browser-controls')) {
                    document.body.insertAdjacentHTML('afterbegin', \`${controlsHTML}\`);
                }
                window.browserIntegration = {
                    back: () => require('electron').ipcRenderer.send('browser-back'),
                    forward: () => require('electron').ipcRenderer.send('browser-forward'),
                    refresh: () => require('electron').ipcRenderer.send('browser-refresh'),
                    navigate: (url) => require('electron').ipcRenderer.send('browser-navigate', url),
                    openYouTube: () => require('electron').ipcRenderer.send('browser-youtube'),
                    toggle: () => require('electron').ipcRenderer.send('browser-toggle')
                };
            `);
        }
    }

    setupKeyboardShortcuts() {
        if (!this.mainWindow) return;
        
        this.mainWindow.webContents.on('before-input-event', (event, input) => {
            if (input.control || input.meta) {
                if (input.key === 'b') {
                    event.preventDefault();
                    this.toggle();
                }
                if (input.key === 'y' && this.isVisible) {
                    event.preventDefault();
                    this.openYouTube();
                }
            }
        });
    }

    toggle() {
        if (!this.browserView || !this.mainWindow) return;
        
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.mainWindow.setBrowserView(this.browserView);
            const bounds = this.mainWindow.getBounds();
            this.browserView.setBounds({ x: 0, y: 40, width: bounds.width, height: bounds.height - 40 });
            this.browserView.webContents.loadURL(this.currentUrl);
            this.showControls();
        } else {
            this.mainWindow.setBrowserView(null);
            this.hideControls();
        }
    }

    showControls() {
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.executeJavaScript(`
                const controls = document.getElementById('browser-controls');
                if (controls) controls.style.display = 'flex';
            `);
        }
    }

    hideControls() {
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.executeJavaScript(`
                const controls = document.getElementById('browser-controls');
                if (controls) controls.style.display = 'none';
            `);
        }
    }

    navigate(url) {
        if (!url.startsWith('http')) url = 'https://' + url;
        this.currentUrl = url;
        if (this.browserView) {
            this.browserView.webContents.loadURL(url);
        }
        this.updateAddressBar();
    }

    openYouTube() {
        this.navigate('https://youtube.com');
        if (!this.isVisible) this.toggle();
    }

    back() {
        if (this.browserView && this.browserView.webContents.canGoBack()) {
            this.browserView.webContents.goBack();
        }
    }

    forward() {
        if (this.browserView && this.browserView.webContents.canGoForward()) {
            this.browserView.webContents.goForward();
        }
    }

    refresh() {
        if (this.browserView) {
            this.browserView.webContents.reload();
        }
    }

    updateAddressBar() {
        if (this.mainWindow && this.mainWindow.webContents) {
            this.mainWindow.webContents.executeJavaScript(`
                const addressBar = document.getElementById('address-bar');
                if (addressBar) addressBar.value = '${this.currentUrl}';
            `);
        }
    }

    setupIPC() {
        const { ipcMain } = require('electron');
        
        ipcMain.on('browser-back', () => this.back());
        ipcMain.on('browser-forward', () => this.forward());
        ipcMain.on('browser-refresh', () => this.refresh());
        ipcMain.on('browser-navigate', (event, url) => this.navigate(url));
        ipcMain.on('browser-youtube', () => this.openYouTube());
        ipcMain.on('browser-toggle', () => this.toggle());
    }

    // YouTube specific features
    searchYouTube(query) {
        const searchUrl = `https://youtube.com/results?search_query=${encodeURIComponent(query)}`;
        this.navigate(searchUrl);
        if (!this.isVisible) this.toggle();
    }

    // Quick access methods
    openGitHub() {
        this.navigate('https://github.com');
        if (!this.isVisible) this.toggle();
    }

    openStackOverflow() {
        this.navigate('https://stackoverflow.com');
        if (!this.isVisible) this.toggle();
    }

    // Picture-in-picture for YouTube videos
    enablePiP() {
        if (this.browserView && this.currentUrl.includes('youtube.com')) {
            this.browserView.webContents.executeJavaScript(`
                const video = document.querySelector('video');
                if (video && document.pictureInPictureEnabled) {
                    video.requestPictureInPicture();
                }
            `);
        }
    }
}

module.exports = new BrowserIntegration();