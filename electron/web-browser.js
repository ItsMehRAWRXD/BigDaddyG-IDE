/**
 * Integrated Web Browser for BigDaddyG IDE
 * 
 * Full-featured browser with navigation, tabs, and dev tools
 * Perfect for documentation, testing, and research
 */

(function() {
'use strict';

class WebBrowser {
    constructor() {
        this.currentUrl = 'https://www.google.com';
        this.history = [];
        this.historyIndex = -1;
        this.bookmarks = this.loadBookmarks();
        this.isDevToolsOpen = false;
        
        console.log('[WebBrowser] 🌐 Initializing web browser...');
        this.init();
    }
    
    init() {
        this.createBrowserUI();
        
        // Register keyboard shortcuts
        this.registerShortcuts();
        
        console.log('[WebBrowser] ✅ Web browser ready!');
        console.log('[WebBrowser] 💡 Press Ctrl+Shift+B to open browser');
    }
    
    createBrowserUI() {
        if (this.browserContainer) {
            this.browserContainer.remove();
        }

        // Create browser container (hidden by default)
        const browserContainer = document.createElement('div');
        browserContainer.id = 'web-browser-container';
        browserContainer.style.cssText = `
            position: fixed;
            top: 40px;
            left: 0;
            right: 0;
            bottom: 0;
            background: #1e1e1e;
            z-index: 99999;
            display: none;
            flex-direction: column;
            pointer-events: auto;
        `;

        // Create browser toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'browser-toolbar';
        toolbar.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #2d2d2d;
            border-bottom: 1px solid #404040;
        `;
        
        // Navigation buttons
        const backBtn = this.createButton('←', 'Go back', () => this.goBack());
        const forwardBtn = this.createButton('→', 'Go forward', () => this.goForward());
        const refreshBtn = this.createButton('⟳', 'Refresh', () => this.refresh());
        const homeBtn = this.createButton('⌂', 'Home', () => this.goHome());
        
        // Address bar
        const addressBar = document.createElement('input');
        addressBar.id = 'browser-address-bar';
        addressBar.type = 'text';
        addressBar.placeholder = 'Enter URL or search...';
        addressBar.value = this.currentUrl;
        addressBar.style.cssText = `
            flex: 1;
            padding: 8px 12px;
            background: #3c3c3c;
            border: 1px solid #555;
            border-radius: 4px;
            color: #fff;
            font-size: 13px;
            outline: none;
        `;
        
        addressBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.navigate(addressBar.value);
            }
        });
        
        // Browser controls
        const devToolsBtn = this.createButton('🔧', 'Toggle DevTools', () => this.toggleDevTools());
        const bookmarkBtn = this.createButton('⭐', 'Bookmark', () => this.addBookmark());
        const closeBtn = this.createButton('✕', 'Close Browser', () => this.closeBrowser());
        
        toolbar.appendChild(backBtn);
        toolbar.appendChild(forwardBtn);
        toolbar.appendChild(refreshBtn);
        toolbar.appendChild(homeBtn);
        toolbar.appendChild(addressBar);
        toolbar.appendChild(devToolsBtn);
        toolbar.appendChild(bookmarkBtn);
        toolbar.appendChild(closeBtn);
        
        const webview = document.createElement('webview');
        webview.id = 'browser-webview';
        webview.src = this.currentUrl;
        webview.style.cssText = `
            flex: 1;
            width: 100%;
            border: none;
        `;
        
        // Enable dev tools, node integration, etc
        webview.setAttribute('webpreferences', 'contextIsolation=yes');
        webview.setAttribute('allowpopups', '');
        
        // Webview event handlers
        webview.addEventListener('did-start-loading', () => {
            console.log('[WebBrowser] Loading...');
        });
        
        webview.addEventListener('did-finish-load', () => {
            const url = webview.getURL();
            addressBar.value = url;
            this.currentUrl = url;
            this.addToHistory(url);
            console.log('[WebBrowser] ✅ Loaded:', url);
        });
        
        webview.addEventListener('page-title-updated', (e) => {
            console.log('[WebBrowser] 📄 Title:', e.title);
        });
        
        browserContainer.appendChild(toolbar);
        browserContainer.appendChild(webview);
        
        document.body.appendChild(browserContainer);
        
        this.browserContainer = browserContainer;
        this.webview = webview;
        this.addressBar = addressBar;
    }
    
    createButton(text, title, onclick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.title = title;
        btn.onclick = onclick;
        btn.style.cssText = `
            padding: 6px 12px;
            background: #404040;
            border: 1px solid #555;
            border-radius: 4px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        `;
        
        btn.onmouseenter = () => btn.style.background = '#4a4a4a';
        btn.onmouseleave = () => btn.style.background = '#404040';
        
        return btn;
    }
    
    openBrowser(url = null) {
        if (url) {
            this.navigate(url);
        }
        if (!this.browserContainer) {
            this.createBrowserUI();
        }
        this.browserContainer.style.display = 'flex';
        this.isVisible = true;
        if (this.addressBar) {
            setTimeout(() => {
                this.addressBar.focus({ preventScroll: true });
                this.addressBar.select();
            }, 0);
        }
        console.log('[WebBrowser] 🌐 Browser opened');
    }
    
    closeBrowser() {
        if (this.browserContainer) {
            this.browserContainer.style.display = 'none';
        }
        this.isVisible = false;
        console.log('[WebBrowser] 🌐 Browser closed');
    }
    
    toggleBrowser() {
        if (!this.browserContainer) {
            this.createBrowserUI();
        }
        if (this.browserContainer.style.display === 'flex') {
            this.closeBrowser();
        } else {
            this.openBrowser();
        }
    }
    
    navigate(urlOrSearch) {
        let url = urlOrSearch.trim();
        
        // If no protocol, check if it's a URL or search query
        if (!url.includes('://')) {
            if (url.includes('.') && !url.includes(' ')) {
                // Looks like a domain
                url = 'https://' + url;
            } else {
                // Search query
                url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            }
        }
        
        this.webview.src = url;
        this.addressBar.value = url;
        console.log('[WebBrowser] 🔗 Navigating to:', url);
    }
    
    goBack() {
        if (this.webview.canGoBack()) {
            this.webview.goBack();
        }
    }
    
    goForward() {
        if (this.webview.canGoForward()) {
            this.webview.goForward();
        }
    }
    
    refresh() {
        if (!this.webview) return;
        if (typeof this.webview.reload === 'function') {
            try {
                this.webview.reload();
                return;
            } catch (error) {
                console.warn('[WebBrowser] ⚠️ Failed to reload via webview.reload:', error);
            }
        }

        if (this.webview.contentWindow && typeof this.webview.contentWindow.location?.reload === 'function') {
            this.webview.contentWindow.location.reload();
        } else if (this.webview.src) {
            const current = this.webview.src;
            this.webview.src = '';
            this.webview.src = current;
        } else {
            console.warn('[WebBrowser] ⚠️ Cannot reload browser view');
        }
    }
    
    goHome() {
        this.navigate('https://www.google.com');
    }
    
    toggleDevTools() {
        if (this.isDevToolsOpen) {
            this.webview.closeDevTools();
            this.isDevToolsOpen = false;
        } else {
            this.webview.openDevTools();
            this.isDevToolsOpen = true;
        }
    }
    
    addToHistory(url) {
        // Remove any forward history if we navigated to new page
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(url);
        this.historyIndex = this.history.length - 1;
    }
    
    addBookmark() {
        const url = this.currentUrl;
        const title = this.webview.getTitle() || url;
        
        if (!this.bookmarks.find(b => b.url === url)) {
            this.bookmarks.push({ title, url, date: new Date().toISOString() });
            this.saveBookmarks();
            
            if (window.showNotification) {
                window.showNotification('✅ Bookmarked', title, 'success', 2000);
            }
            
            console.log('[WebBrowser] ⭐ Bookmarked:', title);
        }
    }
    
    loadBookmarks() {
        try {
            const saved = localStorage.getItem('browser-bookmarks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }
    
    saveBookmarks() {
        try {
            localStorage.setItem('browser-bookmarks', JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('[WebBrowser] Failed to save bookmarks:', error);
        }
    }
    
    registerShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+B - Toggle browser
            if (e.ctrlKey && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                this.toggleBrowser();
            }
            
            // Escape - Close browser
            if (e.key === 'Escape' && this.isVisible) {
                e.preventDefault();
                this.closeBrowser();
            }
        });
    }
    
    // Public API
    getBookmarks() {
        return this.bookmarks;
    }
    
    getHistory() {
        return this.history;
    }
}

// Initialize and expose globally
window.webBrowser = new WebBrowser();

console.log('[WebBrowser] 🌐 Web browser module loaded');
console.log('[WebBrowser] 💡 Usage:');
console.log('  • Ctrl+Shift+B - Toggle browser');
console.log('  • webBrowser.openBrowser(url) - Open to specific URL');
console.log('  • webBrowser.getBookmarks() - Get saved bookmarks');

})();

