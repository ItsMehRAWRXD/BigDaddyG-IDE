// Performance Optimizations - Full Implementation with FPS and Memory Monitoring
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.observers = new Set();
        this.fps = 0;
        this.memory = { used: 0, total: 0, heap: 0 };
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.startFPSMonitoring();
        this.startMemoryMonitoring();
    }

    // FPS Monitoring
    startFPSMonitoring() {
        const updateFPS = () => {
            this.frameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - this.lastFrameTime;
            
            if (elapsed >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / elapsed);
                this.frameCount = 0;
                this.lastFrameTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        requestAnimationFrame(updateFPS);
    }

    // Memory Monitoring
    startMemoryMonitoring() {
        setInterval(() => {
            if (performance.memory) {
                this.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    heap: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
            }
        }, 1000);
    }

    // Get current FPS
    getFPS() {
        return this.fps;
    }

    // Get current memory usage
    getMemory() {
        return this.memory;
    }

    // DOM Query Optimization
    optimizeQueries() {
        const elements = document.querySelectorAll('[data-perf]');
        elements.forEach(el => {
            if (!this.cache.has(el.dataset.perf)) {
                this.cache.set(el.dataset.perf, el);
            }
        });
    }

    // Memory Leak Prevention
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.cache.clear();
        this.observers.clear();
    }

    // Event Listener Optimization
    addListener(element, event, handler) {
        const optimizedHandler = this.debounce(handler, 16);
        element.addEventListener(event, optimizedHandler, { passive: true });
        return () => element.removeEventListener(event, optimizedHandler);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Security Fixes
const securityFixes = {
    sanitizeInput: (input) => input.replace(/[<>'"]/g, ''),
    validateCommand: (cmd) => !/[;&|`$]/.test(cmd),
    safeEval: () => { throw new Error('eval() disabled for security'); }
};

// Browser environment only
if (typeof window !== 'undefined') {
    window.eval = securityFixes.safeEval;
    const optimizer = new PerformanceOptimizer();
    optimizer.optimizeQueries();
    window.addEventListener('beforeunload', () => optimizer.cleanup());
} else {
    console.log('✅ Performance optimizations loaded (Node.js environment)');
}

module.exports = { PerformanceOptimizer, securityFixes };