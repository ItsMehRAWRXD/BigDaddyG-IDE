/**
 * BigDaddyG IDE - Layout Manager
 * Save and restore window layouts, panel positions, editor states
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class LayoutManager extends EventEmitter {
    constructor() {
        super();
        
        // Layout storage
        this.layouts = new Map();
        this.currentLayout = null;
        
        // Layout file path
        this.layoutsPath = path.join(
            process.env.APPDATA || process.env.HOME || process.cwd(),
            'BigDaddyG',
            'layouts.json'
        );
        
        // Default layouts
        this.defaultLayouts = {
            'full-focus': {
                name: 'Full Focus',
                description: 'Maximize editor, minimal distractions',
                config: {
                    sidebar: { visible: false },
                    agentPanel: { visible: false, floating: false },
                    terminal: { visible: false },
                    statusBar: { visible: true },
                    activityBar: { visible: false },
                    minimap: { visible: false }
                }
            },
            'ai-assisted': {
                name: 'AI Assisted',
                description: 'Editor + Agent panel side-by-side',
                config: {
                    sidebar: { visible: true, width: 250 },
                    agentPanel: { visible: true, floating: false, width: 400 },
                    terminal: { visible: true, height: 200 },
                    statusBar: { visible: true },
                    activityBar: { visible: true },
                    minimap: { visible: true }
                }
            },
            'debug-mode': {
                name: 'Debug Mode',
                description: 'Editor + Terminal + Debug panel',
                config: {
                    sidebar: { visible: true, width: 300 },
                    agentPanel: { visible: false, floating: true },
                    terminal: { visible: true, height: 300 },
                    debugPanel: { visible: true, width: 400 },
                    statusBar: { visible: true },
                    activityBar: { visible: true },
                    minimap: { visible: false }
                }
            },
            'pair-programming': {
                name: 'Pair Programming',
                description: 'Floating agent for collaboration',
                config: {
                    sidebar: { visible: true, width: 250 },
                    agentPanel: { visible: true, floating: true, position: { x: 100, y: 100 }, size: { width: 450, height: 600 } },
                    terminal: { visible: true, height: 250 },
                    statusBar: { visible: true },
                    activityBar: { visible: true },
                    minimap: { visible: true }
                }
            },
            'presentation': {
                name: 'Presentation Mode',
                description: 'Large fonts, clean UI',
                config: {
                    sidebar: { visible: false },
                    agentPanel: { visible: false },
                    terminal: { visible: false },
                    statusBar: { visible: false },
                    activityBar: { visible: false },
                    minimap: { visible: false },
                    fontSize: 18,
                    lineHeight: 1.8,
                    zoom: 1.5
                }
            }
        };
        
        console.log('[Layout Manager] 🎨 Initialized');
    }
    
    /**
     * Initialize layout manager
     */
    async initialize() {
        // Load saved layouts
        await this.loadLayouts();
        
        // Add default layouts if none exist
        if (this.layouts.size === 0) {
            for (const [id, layout] of Object.entries(this.defaultLayouts)) {
                this.layouts.set(id, layout);
            }
            await this.saveLayouts();
        }
        
        console.log(`[Layout Manager] ✅ Ready (${this.layouts.size} layouts available)`);
    }
    
    /**
     * Save current layout
     */
    async saveCurrentLayout(name, description = '') {
        console.log(`[Layout Manager] 💾 Saving layout: ${name}`);
        
        // Capture current state
        const layout = {
            name,
            description,
            createdAt: new Date().toISOString(),
            config: this.captureCurrentLayout()
        };
        
        const layoutId = name.toLowerCase().replace(/\s+/g, '-');
        this.layouts.set(layoutId, layout);
        
        await this.saveLayouts();
        
        console.log(`[Layout Manager] ✅ Layout saved: ${layoutId}`);
        
        this.emit('layout-saved', { id: layoutId, layout });
        
        return layoutId;
    }
    
    /**
     * Load a layout
     */
    async loadLayout(layoutId) {
        console.log(`[Layout Manager] 📂 Loading layout: ${layoutId}`);
        
        const layout = this.layouts.get(layoutId);
        
        if (!layout) {
            throw new Error(`Layout not found: ${layoutId}`);
        }
        
        // Apply layout configuration
        await this.applyLayout(layout.config);
        
        this.currentLayout = layoutId;
        
        console.log(`[Layout Manager] ✅ Layout loaded: ${layout.name}`);
        
        this.emit('layout-loaded', { id: layoutId, layout });
        
        return layout;
    }
    
    /**
     * Capture current layout state
     */
    captureCurrentLayout() {
        // This would capture actual DOM state
        // For now, return a template
        
        return {
            sidebar: {
                visible: true,
                width: 250,
                activeView: 'explorer'
            },
            agentPanel: {
                visible: true,
                floating: false,
                width: 400,
                position: null,
                size: null
            },
            terminal: {
                visible: true,
                height: 200
            },
            statusBar: {
                visible: true
            },
            activityBar: {
                visible: true
            },
            minimap: {
                visible: true
            },
            editorLayout: {
                orientation: 'horizontal',
                groups: 1
            },
            openFiles: [],
            fontSize: 14,
            lineHeight: 1.6,
            zoom: 1.0
        };
    }
    
    /**
     * Apply layout configuration
     */
    async applyLayout(config) {
        console.log('[Layout Manager] 🎨 Applying layout configuration...');
        
        // Emit events to update UI
        this.emit('apply-layout', config);
        
        // Each UI component listens to this event and updates itself
        // Example:
        // - Sidebar shows/hides and resizes
        // - Agent panel repositions
        // - Terminal adjusts height
        // - Editor font size changes
    }
    
    /**
     * Delete layout
     */
    async deleteLayout(layoutId) {
        if (this.defaultLayouts[layoutId]) {
            throw new Error('Cannot delete default layouts');
        }
        
        this.layouts.delete(layoutId);
        await this.saveLayouts();
        
        console.log(`[Layout Manager] 🗑️ Layout deleted: ${layoutId}`);
        
        this.emit('layout-deleted', { id: layoutId });
    }
    
    /**
     * Load layouts from file
     */
    async loadLayouts() {
        try {
            const content = await fs.readFile(this.layoutsPath, 'utf8');
            const data = JSON.parse(content);
            
            this.layouts = new Map(Object.entries(data));
            
            console.log(`[Layout Manager] Loaded ${this.layouts.size} layouts`);
            
        } catch (error) {
            console.log('[Layout Manager] No saved layouts found');
        }
    }
    
    /**
     * Save layouts to file
     */
    async saveLayouts() {
        try {
            const data = Object.fromEntries(this.layouts);
            
            await fs.mkdir(path.dirname(this.layoutsPath), { recursive: true });
            await fs.writeFile(this.layoutsPath, JSON.stringify(data, null, 2), 'utf8');
            
        } catch (error) {
            console.error('[Layout Manager] Failed to save layouts:', error);
        }
    }
    
    /**
     * Render layout selector UI
     */
    renderLayoutSelector() {
        return `
            <div class="layout-selector" style="padding: 15px; background: var(--bg-secondary); border-radius: 8px;">
                <h3 style="margin-bottom: 15px;">🎨 Layouts</h3>
                
                <div class="layout-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                    ${Array.from(this.layouts.entries()).map(([id, layout]) => `
                        <div class="layout-card ${this.currentLayout === id ? 'active' : ''}" 
                             onclick="layoutManager.loadLayout('${id}')"
                             style="background: var(--bg-tertiary); border: 2px solid ${this.currentLayout === id ? 'var(--accent)' : 'var(--border)'}; border-radius: 6px; padding: 15px; cursor: pointer; transition: all 0.2s;">
                            <div style="font-weight: bold; margin-bottom: 5px;">${layout.name}</div>
                            <div style="font-size: 11px; opacity: 0.7;">${layout.description || ''}</div>
                            ${this.defaultLayouts[id] ? '' : `
                                <button style="margin-top: 10px; background: none; border: none; color: #f44; cursor: pointer; font-size: 11px;" 
                                        onclick="event.stopPropagation(); layoutManager.deleteLayout('${id}')">
                                    🗑️ Delete
                                </button>
                            `}
                        </div>
                    `).join('')}
                </div>
                
                <button class="quality-btn" 
                        onclick="layoutManager.saveCurrentLayoutUI()"
                        style="margin-top: 15px; width: 100%;">
                    💾 Save Current Layout
                </button>
            </div>
        `;
    }
}

module.exports = LayoutManager;

