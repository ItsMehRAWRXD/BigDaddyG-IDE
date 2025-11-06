/**
 * Lazy Module Loader - Load heavy modules on-demand
 * 
 * Improves initial load time by deferring non-critical modules
 */

(function() {
'use strict';

class LazyLoader {
    constructor() {
        this.loadedModules = new Set();
        this.pendingModules = new Map();
        this.loadQueue = [];
        
        console.log('[LazyLoader] 📦 Initializing lazy module loader...');
    }
    
    /**
     * Register a module to be loaded lazily
     */
    register(moduleName, scriptPath, options = {}) {
        this.pendingModules.set(moduleName, {
            scriptPath,
            priority: options.priority || 'low', // low, medium, high
            dependencies: options.dependencies || [],
            condition: options.condition || (() => true),
            loaded: false
        });
    }
    
    /**
     * Load a module immediately
     */
    async load(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            console.log(`[LazyLoader] ✅ ${moduleName} already loaded`);
            return true;
        }
        
        const module = this.pendingModules.get(moduleName);
        if (!module) {
            console.warn(`[LazyLoader] ⚠️ Module ${moduleName} not registered`);
            return false;
        }
        
        // Check condition
        if (!module.condition()) {
            console.log(`[LazyLoader] ⏭️ Skipping ${moduleName} - condition not met`);
            return false;
        }
        
        // Load dependencies first
        for (const dep of module.dependencies) {
            await this.load(dep);
        }
        
        console.log(`[LazyLoader] 📥 Loading ${moduleName}...`);
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = module.scriptPath;
            script.async = true;
            
            script.onload = () => {
                this.loadedModules.add(moduleName);
                module.loaded = true;
                console.log(`[LazyLoader] ✅ ${moduleName} loaded`);
                resolve(true);
            };
            
            script.onerror = (error) => {
                console.error(`[LazyLoader] ❌ Failed to load ${moduleName}:`, error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Load all modules of a priority level
     */
    async loadByPriority(priority) {
        const modules = Array.from(this.pendingModules.entries())
            .filter(([name, mod]) => mod.priority === priority && !mod.loaded)
            .map(([name]) => name);
        
        console.log(`[LazyLoader] 📦 Loading ${modules.length} ${priority} priority modules...`);
        
        await Promise.all(modules.map(name => this.load(name)));
    }
    
    /**
     * Load modules in stages
     */
    async loadStaged() {
        console.log('[LazyLoader] 🚀 Starting staged loading...');
        
        // Stage 1: High priority (critical for UI)
        await this.loadByPriority('high');
        
        // Stage 2: Medium priority (important features)
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.loadByPriority('medium');
        
        // Stage 3: Low priority (nice-to-have features)
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.loadByPriority('low');
        
        console.log('[LazyLoader] ✅ All modules loaded');
    }
    
    /**
     * Get loading statistics
     */
    getStats() {
        const total = this.pendingModules.size;
        const loaded = this.loadedModules.size;
        const pending = total - loaded;
        
        return {
            total,
            loaded,
            pending,
            percentage: Math.round((loaded / total) * 100)
        };
    }
}

// ============================================================================
// GLOBAL EXPOSURE
// ============================================================================

window.lazyLoader = new LazyLoader();

// Register heavy modules that can be loaded on-demand
window.lazyLoader.register('image-generator', 'image-generator.js', { priority: 'low' });
window.lazyLoader.register('cinematic-viz', 'cinematic-visualization.js', { priority: 'low' });
window.lazyLoader.register('multi-agent-swarm', 'multi-agent-swarm.js', { priority: 'medium' });
window.lazyLoader.register('ai-code-review', 'ai-code-review-security.js', { priority: 'low' });
window.lazyLoader.register('predictive-debugger', 'predictive-debugger.js', { priority: 'low' });
window.lazyLoader.register('visual-code-flow', 'visual-code-flow.js', { priority: 'low' });
window.lazyLoader.register('plugin-marketplace', 'plugin-marketplace.js', { 
    priority: 'low',
    dependencies: ['plugin-system']
});

// Expose stats
window.getLazyLoaderStats = () => {
    const stats = window.lazyLoader.getStats();
    console.log('[LazyLoader] 📊 Loading Progress:');
    console.log(`  Total Modules: ${stats.total}`);
    console.log(`  Loaded: ${stats.loaded}`);
    console.log(`  Pending: ${stats.pending}`);
    console.log(`  Progress: ${stats.percentage}%`);
    return stats;
};

console.log('[LazyLoader] 📦 Lazy loader module loaded');
console.log('[LazyLoader] 💡 Use getLazyLoaderStats() to check loading progress');

})();

