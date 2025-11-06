/**
 * Performance Dashboard
 * 
 * Real-time monitoring of IDE performance metrics
 * Helps identify bottlenecks and memory leaks
 */

(function() {
'use strict';

class PerformanceDashboard {
    constructor() {
        this.isVisible = false;
        this.metrics = {
            fps: 0,
            memory: 0,
            timers: 0,
            domNodes: 0,
            requests: 0,
            tabCount: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('[PerfDashboard] 📊 Initializing performance dashboard...');
        this.createPanel();
        this.startMonitoring();
    }
    
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'performance-dashboard';
        panel.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            width: 320px;
            background: rgba(10, 10, 30, 0.98);
            border: 1px solid var(--cyan);
            border-radius: 12px;
            padding: 20px;
            z-index: 9999;
            display: none;
            font-size: 12px;
            color: #fff;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--cyan); padding-bottom: 10px;">
                <h3 style="margin: 0; color: var(--cyan); font-size: 14px;">📊 Performance Monitor</h3>
                <button onclick="window.perfDashboard.toggle()" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 16px;">×</button>
            </div>
            
            <div id="perf-metrics" style="display: flex; flex-direction: column; gap: 10px;"></div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(0, 212, 255, 0.2);">
                <button onclick="window.perfDashboard.optimize()" style="width: 100%; padding: 8px; background: var(--green); color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    ⚡ Auto-Optimize
                </button>
                <div style="margin-top: 8px; font-size: 10px; color: #666; text-align: center;">
                    Click to automatically optimize performance
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.panel = panel;
    }
    
    startMonitoring() {
        // Update every 2 seconds
        this.monitorInterval = setInterval(() => {
            if (this.isVisible) {
                this.updateMetrics();
                this.renderMetrics();
            }
        }, 2000);
    }
    
    updateMetrics() {
        // FPS
        this.metrics.fps = window.currentFPS || 0;
        
        // Memory
        if (performance.memory) {
            this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            this.metrics.memoryLimit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            this.metrics.memoryPercent = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
        }
        
        // Timers
        if (window.timerManager) {
            const stats = window.timerManager.getStats();
            this.metrics.timers = stats.activeTimers + stats.activeIntervals;
            this.metrics.timerLeakRate = stats.timersCreated > 0 
                ? Math.round((1 - stats.timersCleared / stats.timersCreated) * 100)
                : 0;
        }
        
        // DOM nodes
        this.metrics.domNodes = document.getElementsByTagName('*').length;
        
        // Requests
        if (window.requestPool) {
            const stats = window.requestPool.getStats();
            this.metrics.requests = stats.pending;
        }
        
        // Tabs
        this.metrics.tabCount = Object.keys(window.openTabs || {}).length;
        
        // Storage
        if (window.storage && window.storage.getUsage) {
            window.storage.getUsage().then(usage => {
                this.metrics.storageUsed = usage.usedMB;
                this.metrics.storageQuota = usage.quotaMB;
                this.metrics.storagePercent = usage.percentage;
            }).catch(() => {});
        }
    }
    
    renderMetrics() {
        const container = document.getElementById('perf-metrics');
        if (!container) return;
        
        const getColor = (value, thresholds) => {
            if (value >= thresholds.red) return 'var(--red)';
            if (value >= thresholds.yellow) return 'var(--orange)';
            return 'var(--green)';
        };
        
        container.innerHTML = `
            <div class="metric-row">
                <span>FPS:</span>
                <span style="color: ${getColor(60 - this.metrics.fps, { red: 45, yellow: 30 })}">${this.metrics.fps} fps</span>
            </div>
            
            <div class="metric-row">
                <span>Memory:</span>
                <span style="color: ${getColor(this.metrics.memoryPercent, { red: 80, yellow: 60 })}">
                    ${this.metrics.memory}MB / ${this.metrics.memoryLimit}MB (${this.metrics.memoryPercent}%)
                </span>
            </div>
            
            <div class="metric-row">
                <span>Active Timers:</span>
                <span style="color: ${getColor(this.metrics.timers, { red: 50, yellow: 20 })}">${this.metrics.timers}</span>
                ${this.metrics.timerLeakRate > 20 ? `<span style="color: var(--red); margin-left: 5px;">⚠️ ${this.metrics.timerLeakRate}% leak!</span>` : ''}
            </div>
            
            <div class="metric-row">
                <span>DOM Nodes:</span>
                <span style="color: ${getColor(this.metrics.domNodes, { red: 5000, yellow: 3000 })}">${this.metrics.domNodes.toLocaleString()}</span>
            </div>
            
            <div class="metric-row">
                <span>Pending Requests:</span>
                <span style="color: ${getColor(this.metrics.requests, { red: 10, yellow: 5 })}">${this.metrics.requests}</span>
            </div>
            
            <div class="metric-row">
                <span>Open Tabs:</span>
                <span>${this.metrics.tabCount} / 100</span>
            </div>
            
            ${this.metrics.storageUsed !== undefined ? `
                <div class="metric-row">
                    <span>Storage:</span>
                    <span style="color: ${getColor(this.metrics.storagePercent, { red: 90, yellow: 70 })}">
                        ${this.metrics.storageUsed}MB / ${this.metrics.storageQuota}MB
                    </span>
                </div>
            ` : ''}
        `;
        
        // Add CSS for metric rows
        if (!document.getElementById('perf-dashboard-styles')) {
            const style = document.createElement('style');
            style.id = 'perf-dashboard-styles';
            style.textContent = `
                .metric-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .metric-row:last-child {
                    border-bottom: none;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        this.panel.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.updateMetrics();
            this.renderMetrics();
        }
        
        console.log(`[PerfDashboard] ${this.isVisible ? '👁️ Shown' : '🙈 Hidden'}`);
    }
    
    optimize() {
        console.log('[PerfDashboard] ⚡ Running auto-optimization...');
        
        let optimizations = [];
        
        // 1. Clear timer leaks
        if (this.metrics.timerLeakRate > 20) {
            if (window.cleanupAllTimers) {
                window.cleanupAllTimers();
                optimizations.push('Cleaned up leaked timers');
            }
        }
        
        // 2. Clear request pool
        if (this.metrics.requests > 5) {
            if (window.requestPool) {
                window.requestPool.clear();
                optimizations.push('Cleared pending requests');
            }
        }
        
        // 3. Dispose unused Monaco models
        if (window.openTabs) {
            let disposed = 0;
            Object.values(window.openTabs).forEach(tab => {
                if (tab.id !== window.activeTab && tab.model && !tab.model.isDisposed()) {
                    tab.model.dispose();
                    delete tab.model;
                    disposed++;
                }
            });
            if (disposed > 0) {
                optimizations.push(`Disposed ${disposed} unused Monaco models`);
            }
        }
        
        // 4. Clear old IndexedDB data
        if (window.storage && this.metrics.storagePercent > 80) {
            window.storage.clearOldChat(7); // Keep last 7 days only
            optimizations.push('Cleared old chat history');
        }
        
        // 5. Trigger garbage collection (if available)
        if (window.gc) {
            window.gc();
            optimizations.push('Triggered garbage collection');
        }
        
        // Show results
        const message = optimizations.length > 0
            ? `✅ Applied ${optimizations.length} optimizations:\n\n${optimizations.map(o => `• ${o}`).join('\n')}`
            : '✅ No optimizations needed - IDE is running efficiently!';
        
        alert(message);
        
        // Update metrics immediately
        setTimeout(() => {
            this.updateMetrics();
            this.renderMetrics();
        }, 1000);
        
        console.log('[PerfDashboard] ✅ Auto-optimization complete');
    }
    
    cleanup() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            console.log('[PerfDashboard] 🧹 Monitoring stopped');
        }
    }
}

// ============================================================================
// GLOBAL EXPOSURE
// ============================================================================

window.perfDashboard = new PerformanceDashboard();

// Add hotkey (Ctrl+Shift+D for Dashboard)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.perfDashboard.toggle();
    }
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    window.perfDashboard.cleanup();
});

console.log('[PerfDashboard] 📦 Performance dashboard loaded');
console.log('[PerfDashboard] 💡 Press Ctrl+Shift+D to toggle dashboard');

})();

