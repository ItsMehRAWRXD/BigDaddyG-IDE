/**
 * Performance Optimizer
 * Automatically optimizes IDE performance based on system resources
 */

console.log('[PerfOptimizer] ⚡ Loading performance optimizer...');

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            fps: 60,
            memoryUsage: 0,
            cpuUsage: 0,
            renderTime: 0
        };
        
        this.thresholds = {
            lowMemory: 500 * 1024 * 1024, // 500MB
            highMemory: 1000 * 1024 * 1024, // 1GB
            lowFps: 30,
            targetFps: 60
        };
        
        this.optimizations = {
            reducedAnimations: false,
            lazyLoading: false,
            throttledUpdates: false,
            reducedEffects: false
        };
        
        this.monitoringActive = false;
        this.init();
    }
    
    init() {
        console.log('[PerfOptimizer] 🔧 Initializing performance monitoring...');
        
        // Start monitoring after a delay
        setTimeout(() => this.startMonitoring(), 5000);
        
        // Add performance observer if available
        if ('PerformanceObserver' in window) {
            this.setupPerformanceObserver();
        }
        
        console.log('[PerfOptimizer] ✅ Performance optimizer ready');
    }
    
    setupPerformanceObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        this.metrics.renderTime = entry.duration;
                    }
                }
            });
            
            observer.observe({ entryTypes: ['measure', 'navigation'] });
            console.log('[PerfOptimizer] 📊 Performance observer configured');
        } catch (error) {
            console.warn('[PerfOptimizer] ⚠️ Performance observer not available:', error);
        }
    }
    
    startMonitoring() {
        if (this.monitoringActive) return;
        
        this.monitoringActive = true;
        console.log('[PerfOptimizer] 🔍 Performance monitoring started');
        
        // Monitor every 10 seconds
        this.monitorInterval = setInterval(() => {
            this.checkPerformance();
        }, 10000);
        
        // Run first check immediately
        this.checkPerformance();
    }
    
    stopMonitoring() {
        if (!this.monitoringActive) return;
        
        this.monitoringActive = false;
        clearInterval(this.monitorInterval);
        console.log('[PerfOptimizer] ⏹️ Performance monitoring stopped');
    }
    
    checkPerformance() {
        // Update metrics
        this.updateMetrics();
        
        // Check if optimizations needed
        const needsOptimization = this.needsOptimization();
        
        if (needsOptimization) {
            console.log('[PerfOptimizer] ⚠️ Performance degradation detected');
            this.applyOptimizations();
        } else if (this.canRestorePerformance()) {
            console.log('[PerfOptimizer] ✅ Performance improved, restoring features');
            this.restoreOptimizations();
        }
    }
    
    updateMetrics() {
        // FPS calculation
        if (this.lastFrameTime) {
            const delta = performance.now() - this.lastFrameTime;
            this.metrics.fps = Math.round(1000 / delta);
        }
        this.lastFrameTime = performance.now();
        
        // Memory usage
        if (performance.memory) {
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
            this.metrics.memoryLimit = performance.memory.jsHeapSizeLimit;
        }
        
        // Tab count
        if (window.openTabs) {
            this.metrics.tabCount = Object.keys(window.openTabs).length;
        }
    }
    
    needsOptimization() {
        // Check FPS
        if (this.metrics.fps < this.thresholds.lowFps) {
            console.log(`[PerfOptimizer] ⚠️ Low FPS detected: ${this.metrics.fps}`);
            return true;
        }
        
        // Check memory
        if (performance.memory && 
            this.metrics.memoryUsage > this.thresholds.highMemory) {
            const memoryMB = Math.round(this.metrics.memoryUsage / 1024 / 1024);
            console.log(`[PerfOptimizer] ⚠️ High memory usage: ${memoryMB}MB`);
            return true;
        }
        
        // Check tab count
        if (this.metrics.tabCount && this.metrics.tabCount > 50) {
            console.log(`[PerfOptimizer] ⚠️ Many tabs open: ${this.metrics.tabCount}`);
            return true;
        }
        
        return false;
    }
    
    canRestorePerformance() {
        // Only restore if optimizations are active
        const anyOptimizationActive = Object.values(this.optimizations).some(v => v);
        if (!anyOptimizationActive) return false;
        
        // Check if performance is good enough to restore
        return this.metrics.fps >= this.thresholds.targetFps &&
               (!performance.memory || this.metrics.memoryUsage < this.thresholds.lowMemory);
    }
    
    applyOptimizations() {
        console.log('[PerfOptimizer] 🔧 Applying performance optimizations...');
        
        let optimizationsApplied = 0;
        
        // Reduce animations
        if (!this.optimizations.reducedAnimations) {
            this.reduceAnimations();
            optimizationsApplied++;
        }
        
        // Enable lazy loading
        if (!this.optimizations.lazyLoading && this.metrics.tabCount > 20) {
            this.enableLazyLoading();
            optimizationsApplied++;
        }
        
        // Throttle updates
        if (!this.optimizations.throttledUpdates) {
            this.throttleUpdates();
            optimizationsApplied++;
        }
        
        // Reduce visual effects
        if (!this.optimizations.reducedEffects) {
            this.reduceVisualEffects();
            optimizationsApplied++;
        }
        
        console.log(`[PerfOptimizer] ✅ Applied ${optimizationsApplied} optimization(s)`);
        
        // Show notification
        this.showOptimizationNotification('enabled');
    }
    
    restoreOptimizations() {
        console.log('[PerfOptimizer] 🎨 Restoring full features...');
        
        if (this.optimizations.reducedAnimations) {
            this.restoreAnimations();
        }
        
        if (this.optimizations.lazyLoading) {
            this.disableLazyLoading();
        }
        
        if (this.optimizations.throttledUpdates) {
            this.unthrottleUpdates();
        }
        
        if (this.optimizations.reducedEffects) {
            this.restoreVisualEffects();
        }
        
        console.log('[PerfOptimizer] ✅ Full features restored');
        this.showOptimizationNotification('disabled');
    }
    
    reduceAnimations() {
        document.body.style.setProperty('--animation-duration', '0.1s');
        this.optimizations.reducedAnimations = true;
        console.log('[PerfOptimizer] 🎬 Animations reduced');
    }
    
    restoreAnimations() {
        document.body.style.setProperty('--animation-duration', '0.3s');
        this.optimizations.reducedAnimations = false;
        console.log('[PerfOptimizer] 🎬 Animations restored');
    }
    
    enableLazyLoading() {
        // Enable virtual scrolling for large lists
        if (window.VirtualScroller) {
            window.VirtualScroller.enable();
        }
        this.optimizations.lazyLoading = true;
        console.log('[PerfOptimizer] 📜 Lazy loading enabled');
    }
    
    disableLazyLoading() {
        if (window.VirtualScroller) {
            window.VirtualScroller.disable();
        }
        this.optimizations.lazyLoading = false;
        console.log('[PerfOptimizer] 📜 Lazy loading disabled');
    }
    
    throttleUpdates() {
        // Throttle Monaco editor updates
        if (window.editor && window.editor.updateOptions) {
            window.editor.updateOptions({
                quickSuggestions: false,
                parameterHints: { enabled: false },
                occurrencesHighlight: false
            });
        }
        this.optimizations.throttledUpdates = true;
        console.log('[PerfOptimizer] ⏱️ Updates throttled');
    }
    
    unthrottleUpdates() {
        if (window.editor && window.editor.updateOptions) {
            window.editor.updateOptions({
                quickSuggestions: true,
                parameterHints: { enabled: true },
                occurrencesHighlight: true
            });
        }
        this.optimizations.throttledUpdates = false;
        console.log('[PerfOptimizer] ⏱️ Updates unthrottled');
    }
    
    reduceVisualEffects() {
        // Reduce box shadows and blur effects
        document.documentElement.style.setProperty('--blur-amount', '0px');
        document.documentElement.style.setProperty('--shadow-intensity', '0.1');
        this.optimizations.reducedEffects = true;
        console.log('[PerfOptimizer] ✨ Visual effects reduced');
    }
    
    restoreVisualEffects() {
        document.documentElement.style.setProperty('--blur-amount', '10px');
        document.documentElement.style.setProperty('--shadow-intensity', '1');
        this.optimizations.reducedEffects = false;
        console.log('[PerfOptimizer] ✨ Visual effects restored');
    }
    
    showOptimizationNotification(action) {
        const message = action === 'enabled' 
            ? '⚡ Performance optimizations enabled'
            : '🎨 Full features restored';
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 212, 255, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 100000;
            font-size: 13px;
            font-weight: bold;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            optimizations: { ...this.optimizations }
        };
    }
    
    forceOptimize() {
        console.log('[PerfOptimizer] 🔧 Forcing optimization...');
        this.applyOptimizations();
    }
    
    forceRestore() {
        console.log('[PerfOptimizer] 🎨 Forcing feature restoration...');
        this.restoreOptimizations();
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize and expose globally
window.performanceOptimizer = new PerformanceOptimizer();

console.log('[PerfOptimizer] ⚡ Performance optimizer loaded successfully!');
console.log('[PerfOptimizer] 💡 Use window.performanceOptimizer.getMetrics() to view stats');
