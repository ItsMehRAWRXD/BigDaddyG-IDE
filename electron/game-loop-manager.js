/**
 * BigDaddyG IDE - Game Loop Manager
 * Manages game loop for previews and simulations
 */

class GameLoopManager {
    constructor() {
        this.isRunning = false;
        this.fps = 60;
        this.targetFrameTime = 1000 / this.fps;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.updateCallbacks = [];
        this.renderCallbacks = [];
        this.animationFrameId = null;
        
        console.log('[GameLoopManager] Initialized');
    }
    
    /**
     * Start game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.loop();
        
        console.log('[GameLoopManager] Game loop started');
    }
    
    /**
     * Stop game loop
     */
    stop() {
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        console.log('[GameLoopManager] Game loop stopped');
    }
    
    /**
     * Main game loop
     */
    loop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        // Update phase
        this.update(this.deltaTime);
        
        // Render phase
        this.render();
        
        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
    
    /**
     * Update phase
     */
    update(deltaTime) {
        for (const callback of this.updateCallbacks) {
            try {
                callback(deltaTime, this.frameCount);
            } catch (error) {
                console.error('[GameLoopManager] Update error:', error);
            }
        }
    }
    
    /**
     * Render phase
     */
    render() {
        for (const callback of this.renderCallbacks) {
            try {
                callback(this.deltaTime, this.frameCount);
            } catch (error) {
                console.error('[GameLoopManager] Render error:', error);
            }
        }
    }
    
    /**
     * Register update callback
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
        return () => this.offUpdate(callback);
    }
    
    /**
     * Unregister update callback
     */
    offUpdate(callback) {
        const index = this.updateCallbacks.indexOf(callback);
        if (index !== -1) {
            this.updateCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Register render callback
     */
    onRender(callback) {
        this.renderCallbacks.push(callback);
        return () => this.offRender(callback);
    }
    
    /**
     * Unregister render callback
     */
    offRender(callback) {
        const index = this.renderCallbacks.indexOf(callback);
        if (index !== -1) {
            this.renderCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Set target FPS
     */
    setFPS(fps) {
        this.fps = fps;
        this.targetFrameTime = 1000 / fps;
    }
    
    /**
     * Get current FPS
     */
    getCurrentFPS() {
        return this.deltaTime > 0 ? Math.round(1 / this.deltaTime) : 0;
    }
    
    /**
     * Get stats
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            fps: this.getCurrentFPS(),
            targetFPS: this.fps,
            deltaTime: this.deltaTime,
            frameCount: this.frameCount,
            updateCallbacks: this.updateCallbacks.length,
            renderCallbacks: this.renderCallbacks.length
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.GameLoopManager = GameLoopManager;
}

module.exports = GameLoopManager;
