/**
 * BigDaddyG IDE - Hot Reload Manager
 * Enables hot reloading of code without full restart
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class HotReloadManager {
    constructor() {
        this.watchers = new Map();
        this.moduleCache = new Map();
        this.reloadCallbacks = [];
        this.enabled = true;
        
        console.log('[HotReloadManager] Initialized');
    }
    
    /**
     * Watch directory for changes
     */
    watch(directory, options = {}) {
        if (this.watchers.has(directory)) {
            console.warn(`[HotReloadManager] Already watching: ${directory}`);
            return;
        }
        
        const watcher = chokidar.watch(directory, {
            ignored: options.ignored || ['**/node_modules/**', '**/.git/**'],
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 100
            }
        });
        
        watcher
            .on('change', (filePath) => this.onFileChange(filePath))
            .on('add', (filePath) => this.onFileAdd(filePath))
            .on('unlink', (filePath) => this.onFileRemove(filePath))
            .on('error', (error) => console.error(`[HotReloadManager] Watcher error:`, error));
        
        this.watchers.set(directory, watcher);
        console.log(`[HotReloadManager] Watching: ${directory}`);
    }
    
    /**
     * Unwatch directory
     */
    unwatch(directory) {
        const watcher = this.watchers.get(directory);
        if (watcher) {
            watcher.close();
            this.watchers.delete(directory);
            console.log(`[HotReloadManager] Stopped watching: ${directory}`);
        }
    }
    
    /**
     * Handle file change
     */
    async onFileChange(filePath) {
        if (!this.enabled) return;
        
        console.log(`[HotReloadManager] File changed: ${filePath}`);
        
        const ext = path.extname(filePath);
        
        try {
            if (ext === '.js' || ext === '.ts') {
                await this.reloadJavaScript(filePath);
            } else if (ext === '.css') {
                await this.reloadCSS(filePath);
            } else if (ext === '.html') {
                await this.reloadHTML(filePath);
            } else if (ext === '.json') {
                await this.reloadJSON(filePath);
            }
            
            // Notify listeners
            this.notifyReload(filePath, 'change');
        } catch (error) {
            console.error(`[HotReloadManager] Reload error:`, error);
        }
    }
    
    /**
     * Handle file add
     */
    async onFileAdd(filePath) {
        console.log(`[HotReloadManager] File added: ${filePath}`);
        this.notifyReload(filePath, 'add');
    }
    
    /**
     * Handle file remove
     */
    async onFileRemove(filePath) {
        console.log(`[HotReloadManager] File removed: ${filePath}`);
        
        // Clear from cache
        delete require.cache[require.resolve(filePath)];
        this.moduleCache.delete(filePath);
        
        this.notifyReload(filePath, 'remove');
    }
    
    /**
     * Reload JavaScript module
     */
    async reloadJavaScript(filePath) {
        try {
            // Clear from require cache
            delete require.cache[require.resolve(filePath)];
            
            // Reload module
            const newModule = require(filePath);
            this.moduleCache.set(filePath, newModule);
            
            console.log(`[HotReloadManager] ✅ Reloaded JS: ${path.basename(filePath)}`);
            return newModule;
        } catch (error) {
            console.error(`[HotReloadManager] ❌ JS reload failed:`, error);
            throw error;
        }
    }
    
    /**
     * Reload CSS
     */
    async reloadCSS(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // In renderer process, update style tag
            if (typeof document !== 'undefined') {
                let styleTag = document.getElementById(`hot-reload-${filePath}`);
                
                if (!styleTag) {
                    styleTag = document.createElement('style');
                    styleTag.id = `hot-reload-${filePath}`;
                    document.head.appendChild(styleTag);
                }
                
                styleTag.textContent = content;
            }
            
            console.log(`[HotReloadManager] ✅ Reloaded CSS: ${path.basename(filePath)}`);
        } catch (error) {
            console.error(`[HotReloadManager] ❌ CSS reload failed:`, error);
            throw error;
        }
    }
    
    /**
     * Reload HTML
     */
    async reloadHTML(filePath) {
        console.log(`[HotReloadManager] HTML changed, full reload recommended`);
        
        // For HTML changes, typically need full page reload
        if (typeof location !== 'undefined') {
            location.reload();
        }
    }
    
    /**
     * Reload JSON
     */
    async reloadJSON(filePath) {
        try {
            delete require.cache[require.resolve(filePath)];
            const newData = require(filePath);
            this.moduleCache.set(filePath, newData);
            
            console.log(`[HotReloadManager] ✅ Reloaded JSON: ${path.basename(filePath)}`);
            return newData;
        } catch (error) {
            console.error(`[HotReloadManager] ❌ JSON reload failed:`, error);
            throw error;
        }
    }
    
    /**
     * Register reload callback
     */
    onReload(callback) {
        this.reloadCallbacks.push(callback);
        return () => this.offReload(callback);
    }
    
    /**
     * Unregister reload callback
     */
    offReload(callback) {
        const index = this.reloadCallbacks.indexOf(callback);
        if (index !== -1) {
            this.reloadCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Notify reload
     */
    notifyReload(filePath, type) {
        this.reloadCallbacks.forEach(callback => {
            try {
                callback({ filePath, type, timestamp: Date.now() });
            } catch (error) {
                console.error('[HotReloadManager] Callback error:', error);
            }
        });
    }
    
    /**
     * Enable/disable hot reload
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`[HotReloadManager] ${enabled ? 'Enabled' : 'Disabled'}`);
    }
    
    /**
     * Get watched directories
     */
    getWatchedDirectories() {
        return Array.from(this.watchers.keys());
    }
    
    /**
     * Dispose all watchers
     */
    dispose() {
        for (const [directory, watcher] of this.watchers) {
            watcher.close();
        }
        this.watchers.clear();
        console.log('[HotReloadManager] Disposed');
    }
}

module.exports = HotReloadManager;
