// Performance Optimizations - Minimal Implementation
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.observers = new Set();
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