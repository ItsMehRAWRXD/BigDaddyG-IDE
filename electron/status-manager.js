/**
 * BigDaddyG IDE - Centralized Status Manager
 * Single source of truth for Orchestra, Ollama, and service health
 */

(function() {
'use strict';

class StatusManager {
    constructor() {
        this.status = {
            orchestra: {
                running: null,
                data: null,
                lastCheck: null
            },
            ollama: {
                running: null,
                models: [],
                lastCheck: null
            },
            memory: {
                available: false,
                lastCheck: null
            }
        };
        
        this.listeners = new Map();
        this.pollingInterval = null;
        this.pollingRate = 3000; // 3 seconds
        
        console.log('[StatusManager] 🔄 Initializing status manager...');
        this.init();
    }
    
    init() {
        // Start polling
        this.startPolling();
        
        // Expose to window
        window.statusManager = this;
        
        console.log('[StatusManager] ✅ Status manager ready');
    }
    
    startPolling() {
        if (this.pollingInterval) {
            return;
        }
        
        // Initial check delayed to let services start
        setTimeout(() => this.checkAllStatus(), 2000);
        
        // Regular polling
        this.pollingInterval = setInterval(() => {
            this.checkAllStatus();
        }, this.pollingRate);
        
        console.log('[StatusManager] 🔄 Polling started');
    }
    
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('[StatusManager] ⏸️ Polling stopped');
        }
    }
    
    async checkAllStatus() {
        await Promise.all([
            this.checkOrchestraStatus(),
            this.checkOllamaStatus(),
            this.checkMemoryStatus()
        ]);
    }
    
    async checkOrchestraStatus() {
        // 1) IPC bridge (fastest)
        if (window.orchestraApi?.getModels) {
            try {
                const models = await window.orchestraApi.getModels();
                this.updateStatus('orchestra', true, { models });
                return;
            } catch (error) {
                console.warn('[StatusManager] IPC orchestra check failed:', error.message);
            }
        }
        
        // 2) Embedded HTTP bridge health
        try {
            const response = await fetch('http://127.0.0.1:11435/health', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                this.updateStatus('orchestra', true, data);
                return;
            }
        } catch (error) {
            console.warn('[StatusManager] Bridge health check failed:', error.message);
        }
        
        // 3) Legacy orchestra server
        try {
            const response = await fetch('http://localhost:11441/health', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                this.updateStatus('orchestra', true, data);
            } else {
                this.updateStatus('orchestra', false, null);
            }
        } catch (error) {
            this.updateStatus('orchestra', false, null);
        }
    }
    
    async checkOllamaStatus() {
        // 1) IPC / bridge model list
        if (window.orchestraApi?.getModels) {
            try {
                const models = await window.orchestraApi.getModels();
                this.updateStatus('ollama', true, { models });
                return;
            } catch (error) {
                console.warn('[StatusManager] IPC model list failed:', error.message);
            }
        }
        
        // 2) Embedded bridge
        try {
            const response = await fetch('http://127.0.0.1:11435/api/models', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                this.updateStatus('ollama', true, data);
                return;
            }
        } catch (error) {
            console.warn('[StatusManager] Bridge model list failed:', error.message);
        }
        
        // 3) Direct Ollama daemon
        try {
            const response = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
            if (response.ok) {
                const data = await response.json();
                this.updateStatus('ollama', true, data);
            } else {
                this.updateStatus('ollama', false, null);
            }
        } catch (error) {
            this.updateStatus('ollama', false, null);
        }
    }
    
    async checkMemoryStatus() {
        const available = !!(window.memory && typeof window.memory.getStats === 'function');
        this.updateStatus('memory', available, null);
    }
    
    updateStatus(service, running, data) {
        const oldStatus = this.status[service].running;
        
        this.status[service] = {
            running: running,
            data: data,
            lastCheck: new Date()
        };
        
        // Notify listeners only if status changed
        if (oldStatus !== running) {
            this.notifyListeners(service, running, data);
        }
    }
    
    subscribe(service, callback) {
        if (!this.listeners.has(service)) {
            this.listeners.set(service, []);
        }
        
        this.listeners.get(service).push(callback);
        
        // Immediately call with current status
        const status = this.status[service];
        if (status.lastCheck) {
            callback(status.running, status.data);
        }
        
        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(service);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    
    notifyListeners(service, running, data) {
        const listeners = this.listeners.get(service);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(running, data);
                } catch (error) {
                    console.error(`[StatusManager] Error in listener for ${service}:`, error);
                }
            });
        }
    }
    
    getStatus(service) {
        return this.status[service];
    }
    
    isServiceRunning(service) {
        return this.status[service]?.running === true;
    }
    
    cleanup() {
        this.stopPolling();
        this.listeners.clear();
        console.log('[StatusManager] 🧹 Cleaned up');
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new StatusManager();
    });
} else {
    new StatusManager();
}

})();
