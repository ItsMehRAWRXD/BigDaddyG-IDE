/**
 * BigDaddyG IDE - Professional Embedded Browser
 * Cursor-level features: Screenshots, Debugging, Network Inspection, AI Analysis
 */

const { BrowserView, BrowserWindow, ipcMain, session } = require('electron');
const fs = require('fs');
const path = require('path');

// ============================================================================
// BROWSER VIEW MANAGER
// ============================================================================

class EmbeddedBrowser {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.browserView = null;
        this.currentURL = 'about:blank';
        this.isVisible = false;
        this.history = [];
        this.historyIndex = -1;
        this.devToolsOpen = false;
        this.networkLogs = [];
        this.consoleLogs = [];
        this.screenshots = [];
        
        this.setupBrowserView();
        this.setupIPCHandlers();
        this.setupNetworkMonitoring();
    }
    
    // ========================================================================
    // BROWSER VIEW SETUP
    // ========================================================================
    
    setupBrowserView() {
        this.browserView = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                webSecurity: true,
                allowRunningInsecureContent: false,
                javascript: true,
                images: true,
                webgl: true,
                plugins: false,
                experimentalFeatures: true,
                enableRemoteModule: false
            }
        });
        
        // Set initial bounds
        this.updateBounds();
        
        // Navigation events
        this.browserView.webContents.on('did-start-loading', () => {
            this.sendToRenderer('browser:loading', { url: this.currentURL });
        });
        
        this.browserView.webContents.on('did-finish-load', () => {
            this.currentURL = this.browserView.webContents.getURL();
            this.addToHistory(this.currentURL);
            this.sendToRenderer('browser:loaded', { 
                url: this.currentURL,
                title: this.browserView.webContents.getTitle()
            });
        });
        
        this.browserView.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            this.sendToRenderer('browser:error', { 
                url: this.currentURL,
                error: errorDescription 
            });
        });
        
        // Page title updates
        this.browserView.webContents.on('page-title-updated', (event, title) => {
            this.sendToRenderer('browser:title', { title });
        });
        
        // New window requests
        this.browserView.webContents.setWindowOpenHandler(({ url }) => {
            // Open in external browser
            require('electron').shell.openExternal(url);
            return { action: 'deny' };
        });
        
        // Console messages (for debugging)
        this.browserView.webContents.on('console-message', (event, level, message, line, sourceId) => {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: ['verbose', 'info', 'warning', 'error'][level] || 'info',
                message,
                source: sourceId,
                line
            };
            
            this.consoleLogs.push(logEntry);
            
            // Keep only last 1000 logs
            if (this.consoleLogs.length > 1000) {
                this.consoleLogs.shift();
            }
            
            this.sendToRenderer('browser:console', logEntry);
        });
        
        console.log('[Browser] ✅ BrowserView initialized');
    }
    
    // ========================================================================
    // NETWORK MONITORING (LIKE CHROME DEVTOOLS)
    // ========================================================================
    
    setupNetworkMonitoring() {
        const ses = this.browserView.webContents.session;
        
        // Monitor all requests
        ses.webRequest.onBeforeRequest((details, callback) => {
            const requestLog = {
                id: details.id,
                url: details.url,
                method: details.method,
                type: details.resourceType,
                timestamp: Date.now(),
                status: 'pending'
            };
            
            this.networkLogs.push(requestLog);
            
            callback({});
        });
        
        // Monitor responses
        ses.webRequest.onCompleted((details) => {
            const log = this.networkLogs.find(l => l.id === details.id);
            if (log) {
                log.status = details.statusCode;
                log.duration = Date.now() - log.timestamp;
                log.fromCache = details.fromCache;
                
                this.sendToRenderer('browser:network', log);
            }
        });
        
        // Monitor errors
        ses.webRequest.onErrorOccurred((details) => {
            const log = this.networkLogs.find(l => l.id === details.id);
            if (log) {
                log.status = 'error';
                log.error = details.error;
                
                this.sendToRenderer('browser:network-error', log);
            }
        });
        
        console.log('[Browser] ✅ Network monitoring enabled');
    }
    
    // ========================================================================
    // NAVIGATION
    // ========================================================================
    
    navigate(url) {
        // Clean and validate URL
        let cleanURL = url.trim();
        
        // Add protocol if missing
        if (!cleanURL.match(/^https?:\/\//)) {
            // Check if it looks like a domain
            if (cleanURL.includes('.') && !cleanURL.includes(' ')) {
                cleanURL = 'https://' + cleanURL;
            } else {
                // Treat as search query
                cleanURL = `https://www.google.com/search?q=${encodeURIComponent(cleanURL)}`;
            }
        }
        
        this.currentURL = cleanURL;
        this.browserView.webContents.loadURL(cleanURL);
        
        console.log(`[Browser] 🌐 Navigating to: ${cleanURL}`);
    }
    
    goBack() {
        if (this.browserView.webContents.canGoBack()) {
            this.browserView.webContents.goBack();
            console.log('[Browser] ⬅️ Going back');
        }
    }
    
    goForward() {
        if (this.browserView.webContents.canGoForward()) {
            this.browserView.webContents.goForward();
            console.log('[Browser] ➡️ Going forward');
        }
    }
    
    reload() {
        this.browserView.webContents.reload();
        console.log('[Browser] 🔄 Reloading');
    }
    
    stop() {
        this.browserView.webContents.stop();
        console.log('[Browser] 🛑 Stopped');
    }
    
    // ========================================================================
    // HISTORY
    // ========================================================================
    
    addToHistory(url) {
        // Remove any forward history if we navigated from middle
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push({
            url,
            title: this.browserView.webContents.getTitle(),
            timestamp: Date.now()
        });
        
        this.historyIndex = this.history.length - 1;
        
        // Keep only last 100 entries
        if (this.history.length > 100) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    // ========================================================================
    // SCREENSHOTS (CURSOR FEATURE)
    // ========================================================================
    
    async takeScreenshot(options = {}) {
        try {
            const image = await this.browserView.webContents.capturePage();
            
            const screenshot = {
                timestamp: Date.now(),
                url: this.currentURL,
                title: this.browserView.webContents.getTitle(),
                dataURL: image.toDataURL(),
                size: {
                    width: image.getSize().width,
                    height: image.getSize().height
                }
            };
            
            // Save to screenshots array
            this.screenshots.push(screenshot);
            
            // Keep only last 20 screenshots
            if (this.screenshots.length > 20) {
                this.screenshots.shift();
            }
            
            // Optionally save to disk
            if (options.saveToDisk) {
                const filename = `screenshot_${Date.now()}.png`;
                const filepath = path.join(require('os').tmpdir(), filename);
                fs.writeFileSync(filepath, image.toPNG());
                screenshot.filepath = filepath;
            }
            
            this.sendToRenderer('browser:screenshot', screenshot);
            
            console.log(`[Browser] 📸 Screenshot captured`);
            
            return screenshot;
        } catch (error) {
            console.error('[Browser] ❌ Screenshot failed:', error);
            throw error;
        }
    }
    
    // ========================================================================
    // DEBUGGING (CURSOR FEATURE)
    // ========================================================================
    
    async analyzeForIssues() {
        console.log('[Browser] 🐛 Analyzing page for issues...');
        
        const issues = {
            javascript_errors: [],
            console_warnings: [],
            network_failures: [],
            performance_issues: [],
            accessibility_issues: []
        };
        
        // JavaScript errors from console
        issues.javascript_errors = this.consoleLogs
            .filter(log => log.level === 'error')
            .map(log => ({
                message: log.message,
                source: log.source,
                line: log.line
            }));
        
        // Network failures
        issues.network_failures = this.networkLogs
            .filter(log => log.status === 'error' || (log.status >= 400 && log.status < 600))
            .map(log => ({
                url: log.url,
                status: log.status,
                error: log.error
            }));
        
        // Performance issues
        const metrics = await this.browserView.webContents.executeJavaScript(`
            (function() {
                const perf = performance.getEntriesByType('navigation')[0];
                return {
                    loadTime: perf ? perf.loadEventEnd - perf.fetchStart : 0,
                    domContentLoaded: perf ? perf.domContentLoadedEventEnd - perf.fetchStart : 0,
                    resources: performance.getEntriesByType('resource').length
                };
            })()
        `);
        
        if (metrics.loadTime > 3000) {
            issues.performance_issues.push({
                type: 'slow_load',
                message: `Page load time: ${(metrics.loadTime / 1000).toFixed(2)}s (slow)`,
                threshold: '3s'
            });
        }
        
        // Send to renderer for AI analysis
        this.sendToRenderer('browser:issues', issues);
        
        console.log(`[Browser] ✅ Found ${Object.values(issues).flat().length} issues`);
        
        return issues;
    }
    
    async suggestUIImprovements() {
        console.log('[Browser] 🎨 Analyzing UI for improvements...');
        
        // Extract page structure
        const pageData = await this.browserView.webContents.executeJavaScript(`
            (function() {
                return {
                    buttons: document.querySelectorAll('button').length,
                    forms: document.querySelectorAll('form').length,
                    images: document.querySelectorAll('img').length,
                    links: document.querySelectorAll('a').length,
                    headings: document.querySelectorAll('h1, h2, h3').length,
                    colorScheme: window.getComputedStyle(document.body).backgroundColor,
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                };
            })()
        `);
        
        const suggestions = {
            layout: [],
            accessibility: [],
            performance: [],
            ux: []
        };
        
        // Generate suggestions based on analysis
        if (pageData.buttons === 0 && pageData.forms > 0) {
            suggestions.ux.push('Consider adding submit buttons to forms');
        }
        
        if (pageData.images > 20) {
            suggestions.performance.push('Many images detected - consider lazy loading');
        }
        
        if (pageData.headings === 0) {
            suggestions.accessibility.push('No headings found - add semantic HTML structure');
        }
        
        this.sendToRenderer('browser:ui-suggestions', suggestions);
        
        console.log(`[Browser] ✅ Generated ${Object.values(suggestions).flat().length} UI suggestions`);
        
        return suggestions;
    }
    
    // ========================================================================
    // DEVTOOLS
    // ========================================================================
    
    toggleDevTools() {
        if (this.devToolsOpen) {
            this.browserView.webContents.closeDevTools();
            this.devToolsOpen = false;
            console.log('[Browser] 🔧 DevTools closed');
        } else {
            this.browserView.webContents.openDevTools({ mode: 'detach' });
            this.devToolsOpen = true;
            console.log('[Browser] 🔧 DevTools opened');
        }
    }
    
    // ========================================================================
    // VISIBILITY & LAYOUT
    // ========================================================================
    
    show() {
        if (!this.isVisible) {
            this.mainWindow.addBrowserView(this.browserView);
            this.updateBounds();
            this.isVisible = true;
            console.log('[Browser] 👁️ Browser shown');
        }
    }
    
    hide() {
        if (this.isVisible) {
            this.mainWindow.removeBrowserView(this.browserView);
            this.isVisible = false;
            console.log('[Browser] 🙈 Browser hidden');
        }
    }
    
    updateBounds(customBounds = null) {
        if (!this.isVisible) return;
        
        const bounds = customBounds || this.mainWindow.getBounds();
        
        // Position browser view (leave space for IDE UI)
        this.browserView.setBounds({
            x: 0,
            y: 0,
            width: bounds.width,
            height: bounds.height
        });
    }
    
    // ========================================================================
    // IPC HANDLERS
    // ========================================================================
    
    setupIPCHandlers() {
        ipcMain.handle('browser:navigate', (event, url) => {
            this.navigate(url);
        });
        
        ipcMain.handle('browser:back', () => {
            this.goBack();
        });
        
        ipcMain.handle('browser:forward', () => {
            this.goForward();
        });
        
        ipcMain.handle('browser:reload', () => {
            this.reload();
        });
        
        ipcMain.handle('browser:stop', () => {
            this.stop();
        });
        
        ipcMain.handle('browser:show', () => {
            this.show();
        });
        
        ipcMain.handle('browser:hide', () => {
            this.hide();
        });
        
        ipcMain.handle('browser:screenshot', async (event, options) => {
            return await this.takeScreenshot(options);
        });
        
        ipcMain.handle('browser:analyze', async () => {
            return await this.analyzeForIssues();
        });
        
        ipcMain.handle('browser:suggest-ui', async () => {
            return await this.suggestUIImprovements();
        });
        
        ipcMain.handle('browser:devtools', () => {
            this.toggleDevTools();
        });
        
        ipcMain.handle('browser:get-console-logs', () => {
            return this.consoleLogs;
        });
        
        ipcMain.handle('browser:get-network-logs', () => {
            return this.networkLogs;
        });
        
        ipcMain.handle('browser:get-screenshots', () => {
            return this.screenshots;
        });
        
        ipcMain.handle('browser:clear-logs', () => {
            this.consoleLogs = [];
            this.networkLogs = [];
            console.log('[Browser] 🧹 Logs cleared');
        });
        
        console.log('[Browser] ✅ IPC handlers registered');
    }
    
    sendToRenderer(channel, data) {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send(channel, data);
        }
    }
    
    // ========================================================================
    // CLEANUP
    // ========================================================================
    
    destroy() {
        if (this.browserView) {
            this.hide();
            this.browserView.webContents.destroy();
            this.browserView = null;
        }
        console.log('[Browser] 🗑️ Browser destroyed');
    }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = { EmbeddedBrowser };

console.log('[Browser] 💎 Professional browser module loaded');
console.log('[Browser] 🎯 Features: Screenshots, Debugging, Network Inspector, AI Analysis');

