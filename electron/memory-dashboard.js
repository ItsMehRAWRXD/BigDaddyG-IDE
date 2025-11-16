/**
 * Memory Dashboard Panel
 * 
 * Visual interface for OpenMemory system showing:
 * - Memory lifecycle and statistics
 * - Embedding visualization
 * - Decay monitoring
 * - Storage management
 */

(function() {
'use strict';

    class MemoryDashboard {
    constructor() {
        this.panel = null;
        this.updateInterval = null;
        this.isVisible = false;
        
        console.log('[MemoryDashboard] 🎨 Memory Dashboard initialized');
    }
    
    // ========================================================================
    // PANEL CREATION
    // ========================================================================
    
        open() {
        if (this.panel) {
            this.panel.style.display = 'flex';
            this.isVisible = true;
                this.startAutoUpdate();
                if (!this.isMemoryServiceAvailable()) {
                    this.renderUnavailableState();
                } else {
                    this.refreshStats();
                }
            return;
        }
        
        this.createPanel();
        this.isVisible = true;
        this.startAutoUpdate();
    }
    
    close() {
        if (this.panel) {
            this.panel.style.display = 'none';
            this.isVisible = false;
            this.stopAutoUpdate();
        }
    }
    
    toggle() {
        if (this.isVisible) {
            this.close();
        } else {
            this.open();
        }
    }
    
        createPanel() {
        const panel = document.createElement('div');
        panel.id = 'memory-dashboard-panel';
        panel.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            height: 90vh;
            max-width: 1400px;
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(20px);
            border: 2px solid var(--cyan);
            border-radius: 15px;
            z-index: 10002;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 80px rgba(0, 212, 255, 0.6);
        `;
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="padding: 20px; background: rgba(0, 0, 0, 0.5); border-bottom: 2px solid var(--cyan); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0 0 5px 0; color: var(--cyan); font-size: 22px;">🧠 Memory Dashboard</h2>
                        <p style="margin: 0; color: #888; font-size: 13px;">OpenMemory Integration - Persistent Agentic Context</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.memoryDashboard.refreshStats()" style="background: var(--green); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">🔄 Refresh</button>
                        <button class="memory-action memory-action-decay" data-default-title="Apply decay to memories" onclick="window.memoryDashboard.applyDecay()" style="background: var(--orange); color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 13px;">🗑️ Apply Decay</button>
                        <button onclick="window.memoryDashboard.close()" style="background: rgba(255, 71, 87, 0.2); border: 1px solid var(--red); color: var(--red); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px;">✕ Close</button>
                </div>
            </div>
            
            <!-- Main Content -->
            <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 250px 1fr; gap: 20px; padding: 20px; overflow: auto;">
                
                <!-- Statistics Card -->
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 20px;">
                    <h3 style="color: var(--cyan); font-size: 16px; margin-bottom: 20px;">📊 Memory Statistics</h3>
                    <div id="memory-stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div class="stat-box">
                            <div class="stat-value" id="stat-total-memories">0</div>
                            <div class="stat-label">Total Memories</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value" id="stat-total-embeddings">0</div>
                            <div class="stat-label">Embeddings</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value" id="stat-storage-size">0 MB</div>
                            <div class="stat-label">Storage Used</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value" id="stat-last-updated">Never</div>
                            <div class="stat-label">Last Updated</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(0, 212, 255, 0.1); border-left: 3px solid var(--cyan); border-radius: 6px;">
                        <div style="font-size: 12px; color: var(--cyan); font-weight: bold; margin-bottom: 8px;">Context Status</div>
                        <div id="context-status" style="font-size: 13px; color: #ccc;">Checking...</div>
                    </div>
                </div>
                
                <!-- Ollama Models Card -->
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 12px; padding: 20px;">
                    <h3 style="color: var(--green); font-size: 16px; margin-bottom: 20px;">🦙 Ollama Models</h3>
                    <div id="ollama-models-list" style="max-height: 180px; overflow-y: auto;">
                        <div style="text-align: center; padding: 40px; color: #888; font-size: 13px;">
                            Loading models...
                        </div>
                    </div>
                    
                    <button onclick="window.ollamaManager.autoConnect()" style="width: 100%; margin-top: 15px; padding: 10px; background: rgba(0, 255, 136, 0.2); border: 1px solid var(--green); color: var(--green); border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">
                        🔌 Reconnect Ollama
                    </button>
                </div>
                
                <!-- Recent Memories -->
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 20px; overflow: hidden; display: flex; flex-direction: column;">
                    <h3 style="color: var(--purple); font-size: 16px; margin-bottom: 15px;">💭 Recent Memories</h3>
                    <div id="recent-memories-list" style="flex: 1; overflow-y: auto;">
                        <div style="text-align: center; padding: 40px; color: #888; font-size: 13px;">
                            Loading memories...
                        </div>
                    </div>
                </div>
                
                <!-- Memory Lifecycle & Decay -->
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 107, 53, 0.3); border-radius: 12px; padding: 20px; overflow: hidden; display: flex; flex-direction: column;">
                    <h3 style="color: var(--orange); font-size: 16px; margin-bottom: 15px;">⏳ Memory Lifecycle</h3>
                    
                    <div style="flex: 1; overflow-y: auto;">
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Memory Decay Model</div>
                            <div style="padding: 15px; background: rgba(255, 107, 53, 0.1); border-radius: 6px; border-left: 3px solid var(--orange);">
                                <div style="font-size: 13px; color: #ccc; margin-bottom: 10px;">
                                    Memories decay over time based on:
                                </div>
                                <ul style="margin: 0; padding-left: 20px; color: #aaa; font-size: 12px;">
                                    <li>Access frequency (more = stronger)</li>
                                    <li>Time since last access</li>
                                    <li>Relevance to current context</li>
                                    <li>Embedding similarity scores</li>
                                </ul>
                            </div>
                        </div>
                        
                            <div>
                                <div style="font-size: 12px; color: #888; margin-bottom: 8px;">Actions</div>
                                <button class="memory-action memory-action-decay" data-default-title="Apply decay to memories" onclick="window.memoryDashboard.applyDecay()" style="width: 100%; padding: 12px; background: rgba(255, 107, 53, 0.2); border: 1px solid var(--orange); color: var(--orange); border-radius: 6px; cursor: pointer; font-size: 13px; margin-bottom: 8px;">
                                    🗑️ Apply Decay Now
                                </button>
                                <button class="memory-action memory-action-clear" data-default-title="Clear all stored memories" onclick="window.memoryDashboard.clearMemories()" style="width: 100%; padding: 12px; background: rgba(255, 71, 87, 0.2); border: 1px solid var(--red); color: var(--red); border-radius: 6px; cursor: pointer; font-size: 13px;">
                                    ⚠️ Clear All Memories
                                </button>
                        </div>
                    </div>
                </div>
                
            </div>
        `;
        
        // Add stat box styles
        const style = document.createElement('style');
        style.textContent = `
            .stat-box {
                padding: 15px;
                background: rgba(0, 212, 255, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(0, 212, 255, 0.2);
                text-align: center;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: var(--cyan);
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 11px;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(panel);
        this.panel = panel;
        
            // Initial data load or offline state
            if (this.isMemoryServiceAvailable()) {
                this.refreshStats();
                this.setMemoryControlsEnabled(true);
            } else {
                this.renderUnavailableState();
                this.setMemoryControlsEnabled(false);
                this.showServiceNotification('Memory service offline', 'Start OpenMemory or enable the memory bridge to use the dashboard.');
            }
        
        console.log('[MemoryDashboard] ✅ Panel created');
    }
    
    // ========================================================================
    // DATA UPDATES
    // ========================================================================
    
        async refreshStats() {
            if (!this.isMemoryServiceAvailable()) {
                this.renderUnavailableState();
                this.setMemoryControlsEnabled(false);
                return;
            }
            
        try {
            // Update memory stats
            if (window.memoryBridge) {
                await window.memoryBridge.updateStats();
                const stats = window.memoryBridge.getStats();
                
                document.getElementById('stat-total-memories').textContent = stats.totalMemories || 0;
                document.getElementById('stat-total-embeddings').textContent = stats.totalEmbeddings || 0;
                document.getElementById('stat-storage-size').textContent = stats.storageSize || '0 Bytes';
                
                const lastUpdated = stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Never';
                document.getElementById('stat-last-updated').textContent = lastUpdated;
            }
            
            // Update context status
            if (window.contextManager) {
                const contextStatus = window.contextManager.getStatus();
                document.getElementById('context-status').innerHTML = `
                    <strong>${contextStatus.usage}</strong> of context used<br>
                    <span style="font-size: 11px; opacity: 0.8;">${contextStatus.current.toLocaleString()} / ${contextStatus.max.toLocaleString()} tokens</span>
                `;
            }
            
            // Update Ollama models
                await this.updateOllamaModels();
            
            // Update recent memories
            await this.updateRecentMemories();
                this.setMemoryControlsEnabled(true);
            
            console.log('[MemoryDashboard] ✅ Stats refreshed');
            
        } catch (error) {
            console.error('[MemoryDashboard] ❌ Failed to refresh stats:', error);
        }
    }
    
        async updateOllamaModels() {
        try {
                if (!window.ollamaManager || typeof window.ollamaManager.getModels !== 'function') {
                    this.renderOllamaUnavailable();
                    return;
                }
                
            const models = await window.ollamaManager.getModels();
            const container = document.getElementById('ollama-models-list');
            
            if (!models || models.total === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #888; font-size: 13px;">
                        <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
                        <div>No Ollama models detected</div>
                        <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">Install Ollama for offline AI</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = models.ollama.map(model => `
                <div style="padding: 10px; margin-bottom: 8px; background: rgba(0, 255, 136, 0.1); border-left: 3px solid var(--green); border-radius: 6px;">
                    <div style="font-size: 13px; font-weight: bold; color: var(--green);">
                        🦙 ${model.name || model}
                    </div>
                    <div style="font-size: 10px; color: #888; margin-top: 4px;">
                        ${model.size || 'Unknown size'} • ${model.modified_at ? new Date(model.modified_at).toLocaleDateString() : 'No date'}
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('[MemoryDashboard] ❌ Failed to update models:', error);
                this.renderOllamaUnavailable();
        }
    }
    
        async updateRecentMemories() {
        try {
                const container = document.getElementById('recent-memories-list');
                
                if (!window.memory) {
                    if (container) {
                        container.innerHTML = `
                            <div style="text-align: center; padding: 40px; color: #888; font-size: 13px;">
                                <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
                                <div>Memory engine inactive</div>
                                <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">Start OpenMemory to view stored memories.</div>
                            </div>
                        `;
                    }
                    return;
                }
            
            const memories = await window.memory.recent(10);
                
            
            if (!memories || memories.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #888; font-size: 13px;">
                        <div style="font-size: 32px; margin-bottom: 10px;">💭</div>
                        <div>No memories stored yet</div>
                        <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">Start chatting to build memory</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = memories.map(memory => {
                const timestamp = memory.Timestamp ? new Date(memory.Timestamp).toLocaleString() : 'Unknown';
                const preview = (memory.Content || '').substring(0, 100) + (memory.Content.length > 100 ? '...' : '');
                const type = memory.Type || 'general';
                
                return `
                    <div style="padding: 12px; margin-bottom: 10px; background: rgba(168, 85, 247, 0.1); border-left: 3px solid var(--purple); border-radius: 6px; cursor: pointer;" onclick="alert('Memory: ${memory.Content.replace(/'/g, "\\'")}')">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 10px; color: var(--purple); font-weight: bold; text-transform: uppercase;">${type}</span>
                            <span style="font-size: 9px; color: #666;">${timestamp}</span>
                        </div>
                        <div style="font-size: 12px; color: #ccc; line-height: 1.4;">
                            ${preview}
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('[MemoryDashboard] ❌ Failed to update memories:', error);
        }
    }
    
    // ========================================================================
    // ACTIONS
    // ========================================================================
    
        async applyDecay() {
            if (!this.isMemoryServiceAvailable()) {
                this.showServiceNotification('Memory service offline', 'Start OpenMemory before applying decay.');
                this.setMemoryControlsEnabled(false);
                return;
            }
            
        if (!confirm('Apply decay to all memories? This will reduce the strength of old, unused memories.')) {
            return;
        }
        
        try {
            if (window.memory) {
                await window.memory.decay();
                await this.refreshStats();
                alert('✅ Decay applied successfully!');
            }
        } catch (error) {
            console.error('[MemoryDashboard] ❌ Failed to apply decay:', error);
            alert('❌ Failed to apply decay. Check console for details.');
        }
    }
    
        async clearMemories() {
            if (!this.isMemoryServiceAvailable()) {
                this.showServiceNotification('Memory service offline', 'Start OpenMemory before clearing memories.');
                this.setMemoryControlsEnabled(false);
                return;
            }
            
        if (!confirm('⚠️ Clear ALL memories? This will archive all existing memories. This action cannot be undone.')) {
            return;
        }
        
        try {
            if (window.memory) {
                await window.memory.clear();
                await this.refreshStats();
                alert('✅ All memories cleared and archived!');
            }
        } catch (error) {
            console.error('[MemoryDashboard] ❌ Failed to clear memories:', error);
            alert('❌ Failed to clear memories. Check console for details.');
        }
        }
        
        isMemoryServiceAvailable() {
            return Boolean(window.memory || window.memoryBridge);
        }
        
        setMemoryControlsEnabled(enabled) {
            if (!this.panel) return;
            const buttons = this.panel.querySelectorAll('.memory-action');
            buttons.forEach((btn) => {
                btn.disabled = !enabled;
                btn.style.opacity = enabled ? '1' : '0.5';
                btn.style.pointerEvents = enabled ? 'auto' : 'none';
                if (!enabled) {
                    btn.title = 'Memory service offline';
                } else if (btn.dataset.defaultTitle) {
                    btn.title = btn.dataset.defaultTitle;
                }
            });
        }
        
        renderUnavailableState() {
            const statsGrid = document.getElementById('memory-stats-grid');
            if (statsGrid) {
                statsGrid.innerHTML = `
                    <div class="stat-box" style="grid-column: span 2;">
                        <div class="stat-value" style="color: var(--orange);">Offline</div>
                        <div class="stat-label" style="color: #ff6b6b;">Memory service not detected</div>
                    </div>
                    <div style="grid-column: span 2; padding: 12px; background: rgba(255,107,53,0.1); border-radius: 8px; border-left: 3px solid var(--orange); font-size: 12px; color: #ccc;">
                        Launch OpenMemory from the Tools menu or enable the memory bridge in settings to activate this dashboard.
                    </div>
                `;
            }
            
            const contextStatus = document.getElementById('context-status');
            if (contextStatus) {
                contextStatus.innerHTML = `<span style="color: #ff6b6b;">Context status unavailable (memory offline)</span>`;
            }
            
            this.renderOllamaUnavailable();
            
            const memoriesList = document.getElementById('recent-memories-list');
            if (memoriesList) {
                memoriesList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #888; font-size: 13px;">
                        <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                        <div>Memory service offline</div>
                        <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">Start OpenMemory to view stored memories.</div>
                    </div>
                `;
            }
        }
        
        renderOllamaUnavailable() {
            const container = document.getElementById('ollama-models-list');
            if (!container) return;
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888; font-size: 13px;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🦙</div>
                    <div>Model list unavailable</div>
                    <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">Reconnect Ollama or the native model bridge.</div>
                </div>
            `;
        }
        
        showServiceNotification(message, detail = '') {
            const fullMessage = detail ? `${message}\n${detail}` : message;
            if (window.showNotification) {
                window.showNotification('Memory Service', fullMessage, 'error', 4000);
            } else {
                alert(`Memory Service:\n${fullMessage}`);
            }
        }
    }
    
    // ========================================================================
    // AUTO-UPDATE
    // ========================================================================
    
    startAutoUpdate() {
        if (this.updateInterval) {
            return;
        }
        
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.refreshStats();
            }
        }, 5000); // Update every 5 seconds
        
        console.log('[MemoryDashboard] ⏱️ Auto-update started');
    }
    
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('[MemoryDashboard] ⏱️ Auto-update stopped');
        }
    }
}

// ========================================================================
// GLOBAL EXPOSURE
// ========================================================================

window.memoryDashboard = new MemoryDashboard();

// Add hotkey (Ctrl+Shift+M)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        window.memoryDashboard.toggle();
    }
});

// Cleanup on window unload
window.addEventListener('beforeunload', () => {
    window.memoryDashboard.stopAutoUpdate();
});

console.log('[MemoryDashboard] 🎨 Memory Dashboard ready (Ctrl+Shift+M)');

})();
