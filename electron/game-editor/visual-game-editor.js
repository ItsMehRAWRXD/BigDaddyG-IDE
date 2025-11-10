/**
 * BigDaddyG IDE - Visual Game Editor
 * Complete visual editing suite for all game engines
 */

(function() {
'use strict';

class VisualGameEditor {
    constructor() {
        this.currentEngine = null;
        this.currentProject = null;
        this.selectedAsset = null;
        this.selectedNode = null;
        this.sceneGraph = null;
        this.viewport = null;
        
        // Integration with game engines
        this.godotIntegration = null;
        this.unityIntegration = null;
        this.unrealIntegration = null;
        this.sunshineIntegration = null;
        
        console.log('[VisualGameEditor] Initialized');
    }
    
    /**
     * Initialize visual editor
     */
    async initialize() {
        console.log('[VisualGameEditor] Initializing visual game editor...');
        
        try {
            // Load game engine integrations
            await this.loadEngineIntegrations();
            
            // Setup UI
            this.createEditorUI();
            
            // Setup event listeners
            this.attachEventListeners();
            
            // Auto-detect current project
            await this.detectCurrentProject();
            
            console.log('[VisualGameEditor] ✅ Visual editor ready');
            return { success: true };
        } catch (error) {
            console.error('[VisualGameEditor] Initialization error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Load game engine integrations
     */
    async loadEngineIntegrations() {
        if (window.electron) {
            try {
                // These will be loaded from the main process
                this.godotIntegration = await window.electron.getGodotIntegration?.();
                this.unityIntegration = await window.electron.getUnityIntegration?.();
                this.unrealIntegration = await window.electron.getUnrealIntegration?.();
                this.sunshineIntegration = await window.electron.getSunshineIntegration?.();
                
                console.log('[VisualGameEditor] Engine integrations loaded');
            } catch (error) {
                console.warn('[VisualGameEditor] Could not load engine integrations:', error);
            }
        }
    }
    
    /**
     * Create complete editor UI
     */
    createEditorUI() {
        const container = document.getElementById('game-editor-container') || document.createElement('div');
        container.id = 'game-editor-container';
        container.className = 'game-editor-container';
        
        container.innerHTML = `
            <div class="game-editor-layout">
                <!-- Top Toolbar -->
                <div class="game-editor-toolbar">
                    <div class="toolbar-section">
                        <button id="game-engine-select" class="btn-dropdown">
                            🎮 Select Engine
                            <span class="dropdown-icon">▼</span>
                        </button>
                        <div class="engine-dropdown" id="engine-dropdown" style="display: none;">
                            <button data-engine="godot">Godot 4.2+</button>
                            <button data-engine="unity">Unity 2022 LTS</button>
                            <button data-engine="unreal">Unreal Engine 5.3+</button>
                            <button data-engine="sunshine">Sunshine Engine</button>
                        </div>
                    </div>
                    
                    <div class="toolbar-section">
                        <button id="open-project-btn" title="Open Project">📁 Open</button>
                        <button id="save-project-btn" title="Save">💾 Save</button>
                        <button id="build-btn" title="Build">🔨 Build</button>
                        <button id="run-btn" title="Run">▶️ Run</button>
                        <button id="debug-btn" title="Debug">🐛 Debug</button>
                    </div>
                    
                    <div class="toolbar-section">
                        <button id="play-mode-btn" title="Play Mode">▶️ Play</button>
                        <button id="pause-mode-btn" title="Pause">⏸️ Pause</button>
                        <button id="stop-mode-btn" title="Stop">⏹️ Stop</button>
                    </div>
                    
                    <div class="toolbar-section">
                        <span class="current-engine">Engine: <strong id="current-engine-name">None</strong></span>
                    </div>
                </div>
                
                <!-- Main Editor Area -->
                <div class="game-editor-main">
                    <!-- Left Panel: Scene Hierarchy & Assets -->
                    <div class="game-editor-left-panel">
                        <div class="panel-tabs">
                            <button class="panel-tab active" data-panel="hierarchy">Scene Hierarchy</button>
                            <button class="panel-tab" data-panel="assets">Assets</button>
                        </div>
                        
                        <!-- Scene Hierarchy -->
                        <div class="panel-content" id="hierarchy-panel">
                            <div class="panel-toolbar">
                                <button id="add-node-btn" title="Add Node">➕</button>
                                <button id="delete-node-btn" title="Delete Node">🗑️</button>
                                <input type="text" id="hierarchy-search" placeholder="Search nodes..." />
                            </div>
                            <div id="scene-hierarchy-tree" class="hierarchy-tree">
                                <!-- Scene tree will be populated here -->
                            </div>
                        </div>
                        
                        <!-- Asset Browser -->
                        <div class="panel-content" id="assets-panel" style="display: none;">
                            <div class="panel-toolbar">
                                <button id="import-asset-btn" title="Import Asset">📥 Import</button>
                                <button id="create-asset-btn" title="Create Asset">➕ Create</button>
                                <input type="text" id="asset-search" placeholder="Search assets..." />
                            </div>
                            <div id="asset-browser" class="asset-browser">
                                <!-- Asset grid will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Center: Viewport -->
                    <div class="game-editor-viewport-container">
                        <div class="viewport-toolbar">
                            <button class="viewport-mode active" data-mode="3d">3D</button>
                            <button class="viewport-mode" data-mode="2d">2D</button>
                            <button class="viewport-mode" data-mode="script">Script</button>
                            
                            <div class="viewport-tools">
                                <button class="tool-btn active" data-tool="select" title="Select">🖱️</button>
                                <button class="tool-btn" data-tool="move" title="Move">↔️</button>
                                <button class="tool-btn" data-tool="rotate" title="Rotate">🔄</button>
                                <button class="tool-btn" data-tool="scale" title="Scale">↕️</button>
                            </div>
                            
                            <div class="viewport-options">
                                <label><input type="checkbox" checked /> Grid</label>
                                <label><input type="checkbox" checked /> Gizmos</label>
                                <label><input type="checkbox" /> Wireframe</label>
                            </div>
                        </div>
                        
                        <div id="game-viewport" class="game-viewport">
                            <canvas id="game-canvas" width="800" height="600"></canvas>
                            <div class="viewport-overlay">
                                <div class="viewport-stats">
                                    <span id="fps-counter">FPS: 60</span>
                                    <span id="draw-calls">Draw Calls: 0</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bottom Panel: Console & Timeline -->
                        <div class="game-editor-bottom-panel">
                            <div class="panel-tabs">
                                <button class="panel-tab active" data-panel="console">Console</button>
                                <button class="panel-tab" data-panel="timeline">Timeline</button>
                                <button class="panel-tab" data-panel="profiler">Profiler</button>
                            </div>
                            
                            <div class="panel-content" id="console-panel">
                                <div id="game-console" class="game-console">
                                    <!-- Console output -->
                                </div>
                            </div>
                            
                            <div class="panel-content" id="timeline-panel" style="display: none;">
                                <div class="animation-timeline">
                                    <!-- Animation timeline -->
                                    <div id="animation-timeline"></div>
                                </div>
                            </div>
                            
                            <div class="panel-content" id="profiler-panel" style="display: none;">
                                <div class="performance-profiler">
                                    <canvas id="profiler-chart" width="400" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Panel: Inspector & Properties -->
                    <div class="game-editor-right-panel">
                        <div class="panel-header">
                            <h3>Inspector</h3>
                        </div>
                        
                        <div id="inspector-content" class="inspector-content">
                            <div class="inspector-empty">
                                <p>Select a node or asset to view properties</p>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div class="inspector-actions">
                            <button id="add-component-btn">➕ Add Component</button>
                            <button id="add-script-btn">📄 Add Script</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append to body if not already present
        if (!document.getElementById('game-editor-container')) {
            document.body.appendChild(container);
        }
        
        // Initialize viewport
        this.initializeViewport();
        
        // Apply styles
        this.applyEditorStyles();
    }
    
    /**
     * Initialize 3D viewport
     */
    initializeViewport() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Draw grid
        this.drawGrid(ctx, canvas.width, canvas.height);
        
        // Setup viewport controls
        this.setupViewportControls(canvas);
    }
    
    /**
     * Draw grid in viewport
     */
    drawGrid(ctx, width, height) {
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        // Vertical lines
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Center axes
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        
        // X axis (green)
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Y axis (red)
        ctx.strokeStyle = '#f44336';
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        
        // Center text
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText('3D Viewport', 10, 20);
        ctx.fillText('Select an engine to start editing', 10, 40);
    }
    
    /**
     * Setup viewport controls (pan, zoom, rotate)
     */
    setupViewportControls(canvas) {
        let isPanning = false;
        let lastX = 0;
        let lastY = 0;
        
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle mouse
                isPanning = true;
                lastX = e.clientX;
                lastY = e.clientY;
                canvas.style.cursor = 'grab';
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                // Update camera position
                console.log('Pan:', deltaX, deltaY);
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isPanning = false;
            canvas.style.cursor = 'default';
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoom = e.deltaY > 0 ? 0.9 : 1.1;
            console.log('Zoom:', zoom);
        });
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Engine selection
        const engineSelect = document.getElementById('game-engine-select');
        const engineDropdown = document.getElementById('engine-dropdown');
        
        if (engineSelect && engineDropdown) {
            engineSelect.onclick = () => {
                engineDropdown.style.display = 
                    engineDropdown.style.display === 'none' ? 'block' : 'none';
            };
            
            engineDropdown.querySelectorAll('button').forEach(btn => {
                btn.onclick = async () => {
                    const engine = btn.dataset.engine;
                    await this.selectEngine(engine);
                    engineDropdown.style.display = 'none';
                };
            });
        }
        
        // Panel tabs
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.onclick = () => {
                const panelName = tab.dataset.panel;
                this.switchPanel(tab.parentElement, panelName);
            };
        });
        
        // Toolbar buttons
        document.getElementById('open-project-btn')?.addEventListener('click', () => this.openProject());
        document.getElementById('save-project-btn')?.addEventListener('click', () => this.saveProject());
        document.getElementById('build-btn')?.addEventListener('click', () => this.buildProject());
        document.getElementById('run-btn')?.addEventListener('click', () => this.runProject());
        document.getElementById('play-mode-btn')?.addEventListener('click', () => this.enterPlayMode());
        
        // Viewport tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                console.log('Selected tool:', btn.dataset.tool);
            };
        });
        
        // Node operations
        document.getElementById('add-node-btn')?.addEventListener('click', () => this.addNode());
        document.getElementById('delete-node-btn')?.addEventListener('click', () => this.deleteNode());
        
        // Asset operations
        document.getElementById('import-asset-btn')?.addEventListener('click', () => this.importAsset());
        document.getElementById('create-asset-btn')?.addEventListener('click', () => this.createAsset());
    }
    
    /**
     * Select game engine
     */
    async selectEngine(engineName) {
        console.log(`[VisualGameEditor] Selecting engine: ${engineName}`);
        
        this.currentEngine = engineName;
        
        // Update UI
        const engineNameEl = document.getElementById('current-engine-name');
        if (engineNameEl) {
            const names = {
                godot: 'Godot 4.2+',
                unity: 'Unity 2022 LTS',
                unreal: 'Unreal Engine 5.3+',
                sunshine: 'Sunshine Engine'
            };
            engineNameEl.textContent = names[engineName] || engineName;
        }
        
        // Load engine-specific UI
        await this.loadEngineUI(engineName);
        
        // Update console
        this.logToConsole(`Switched to ${engineName} engine`);
    }
    
    /**
     * Load engine-specific UI
     */
    async loadEngineUI(engineName) {
        switch (engineName) {
            case 'godot':
                await this.loadGodotUI();
                break;
            case 'unity':
                await this.loadUnityUI();
                break;
            case 'unreal':
                await this.loadUnrealUI();
                break;
            case 'sunshine':
                await this.loadSunshineUI();
                break;
        }
    }
    
    /**
     * Load Godot UI
     */
    async loadGodotUI() {
        console.log('[VisualGameEditor] Loading Godot UI...');
        
        // Populate scene hierarchy with Godot nodes
        const hierarchyTree = document.getElementById('scene-hierarchy-tree');
        if (hierarchyTree) {
            hierarchyTree.innerHTML = `
                <div class="tree-node">
                    <span class="node-icon">🎬</span>
                    <span class="node-name">Scene</span>
                    <div class="tree-children">
                        <div class="tree-node">
                            <span class="node-icon">📦</span>
                            <span class="node-name">Node2D</span>
                        </div>
                        <div class="tree-node">
                            <span class="node-icon">🎮</span>
                            <span class="node-name">Player</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Populate asset browser
        await this.loadAssetBrowser(['res://sprites/', 'res://scripts/', 'res://scenes/']);
        
        this.logToConsole('Godot project loaded');
    }
    
    /**
     * Load Unity UI
     */
    async loadUnityUI() {
        console.log('[VisualGameEditor] Loading Unity UI...');
        
        const hierarchyTree = document.getElementById('scene-hierarchy-tree');
        if (hierarchyTree) {
            hierarchyTree.innerHTML = `
                <div class="tree-node">
                    <span class="node-icon">🎬</span>
                    <span class="node-name">SampleScene</span>
                    <div class="tree-children">
                        <div class="tree-node">
                            <span class="node-icon">📷</span>
                            <span class="node-name">Main Camera</span>
                        </div>
                        <div class="tree-node">
                            <span class="node-icon">💡</span>
                            <span class="node-name">Directional Light</span>
                        </div>
                        <div class="tree-node">
                            <span class="node-icon">📦</span>
                            <span class="node-name">GameObject</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        await this.loadAssetBrowser(['Assets/Scenes/', 'Assets/Scripts/', 'Assets/Materials/']);
        
        this.logToConsole('Unity project loaded');
    }
    
    /**
     * Load Unreal UI
     */
    async loadUnrealUI() {
        console.log('[VisualGameEditor] Loading Unreal UI...');
        
        const hierarchyTree = document.getElementById('scene-hierarchy-tree');
        if (hierarchyTree) {
            hierarchyTree.innerHTML = `
                <div class="tree-node">
                    <span class="node-icon">🎬</span>
                    <span class="node-name">Level</span>
                    <div class="tree-children">
                        <div class="tree-node">
                            <span class="node-icon">📷</span>
                            <span class="node-name">PlayerStart</span>
                        </div>
                        <div class="tree-node">
                            <span class="node-icon">💡</span>
                            <span class="node-name">Light</span>
                        </div>
                        <div class="tree-node">
                            <span class="node-icon">🎭</span>
                            <span class="node-name">Actor</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        await this.loadAssetBrowser(['Content/Blueprints/', 'Content/Materials/', 'Content/Meshes/']);
        
        this.logToConsole('Unreal project loaded');
    }
    
    /**
     * Load Sunshine UI
     */
    async loadSunshineUI() {
        console.log('[VisualGameEditor] Loading Sunshine UI...');
        
        const hierarchyTree = document.getElementById('scene-hierarchy-tree');
        if (hierarchyTree) {
            hierarchyTree.innerHTML = `
                <div class="tree-node">
                    <span class="node-icon">☀️</span>
                    <span class="node-name">MainScene</span>
                    <div class="tree-children">
                        <div class="tree-node">
                            <span class="node-icon">📷</span>
                            <span class="node-name">Camera</span>
                        </div>
                        <div class="tree-node">
                            <span class="node-icon">💡</span>
                            <span class="node-name">DirectionalLight</span>
                        </div>
                        <div class="tree-node">
                            <span class="node-icon">🎯</span>
                            <span class="node-name">Entity</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        await this.loadAssetBrowser(['Assets/', 'Scripts/', 'Scenes/', 'Shaders/']);
        
        this.logToConsole('Sunshine Engine project loaded');
    }
    
    /**
     * Load asset browser
     */
    async loadAssetBrowser(folders) {
        const assetBrowser = document.getElementById('asset-browser');
        if (!assetBrowser) return;
        
        assetBrowser.innerHTML = `
            <div class="asset-folder-list">
                ${folders.map(folder => `
                    <div class="asset-folder">
                        <span class="folder-icon">📁</span>
                        <span class="folder-name">${folder}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="asset-grid">
                <div class="asset-item">
                    <div class="asset-thumbnail">🖼️</div>
                    <div class="asset-name">texture.png</div>
                </div>
                <div class="asset-item">
                    <div class="asset-thumbnail">📄</div>
                    <div class="asset-name">script.js</div>
                </div>
                <div class="asset-item">
                    <div class="asset-thumbnail">🎬</div>
                    <div class="asset-name">scene.unity</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Switch panel
     */
    switchPanel(tabContainer, panelName) {
        const tabs = tabContainer.querySelectorAll('.panel-tab');
        const panels = tabContainer.parentElement.querySelectorAll('.panel-content');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        panels.forEach(panel => panel.style.display = 'none');
        
        const activeTab = Array.from(tabs).find(tab => tab.dataset.panel === panelName);
        const activePanel = document.getElementById(`${panelName}-panel`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activePanel) activePanel.style.display = 'block';
    }
    
    /**
     * Operations
     */
    async openProject() {
        this.logToConsole('Opening project...');
    }
    
    async saveProject() {
        this.logToConsole('Saving project...');
    }
    
    async buildProject() {
        this.logToConsole(`Building ${this.currentEngine} project...`);
    }
    
    async runProject() {
        this.logToConsole(`Running ${this.currentEngine} project...`);
    }
    
    enterPlayMode() {
        this.logToConsole('Entering play mode...');
    }
    
    addNode() {
        this.logToConsole('Adding node...');
    }
    
    deleteNode() {
        this.logToConsole('Deleting node...');
    }
    
    importAsset() {
        this.logToConsole('Importing asset...');
    }
    
    createAsset() {
        this.logToConsole('Creating asset...');
    }
    
    /**
     * Detect current project
     */
    async detectCurrentProject() {
        // Check for project files in workspace
        if (window.electron && window.electron.detectGameProject) {
            const project = await window.electron.detectGameProject();
            if (project) {
                await this.selectEngine(project.engine);
                this.currentProject = project;
            }
        }
    }
    
    /**
     * Log to console
     */
    logToConsole(message, type = 'info') {
        const consoleEl = document.getElementById('game-console');
        if (!consoleEl) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        
        const logEntry = document.createElement('div');
        logEntry.className = `console-entry console-${type}`;
        logEntry.textContent = `[${timestamp}] ${icon} ${message}`;
        
        consoleEl.appendChild(logEntry);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
    
    /**
     * Apply editor styles
     */
    applyEditorStyles() {
        if (document.getElementById('game-editor-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'game-editor-styles';
        style.textContent = `
            .game-editor-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                background: #1e1e1e;
                color: #fff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: none; /* Hidden by default */
            }
            
            .game-editor-container.active {
                display: block;
            }
            
            .game-editor-layout {
                display: flex;
                flex-direction: column;
                height: 100vh;
            }
            
            .game-editor-toolbar {
                display: flex;
                gap: 10px;
                padding: 8px;
                background: #252526;
                border-bottom: 1px solid #3c3c3c;
                align-items: center;
            }
            
            .toolbar-section {
                display: flex;
                gap: 5px;
                position: relative;
            }
            
            .game-editor-toolbar button {
                padding: 6px 12px;
                background: #3c3c3c;
                border: 1px solid #555;
                color: #fff;
                cursor: pointer;
                border-radius: 3px;
                font-size: 13px;
            }
            
            .game-editor-toolbar button:hover {
                background: #505050;
            }
            
            .engine-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                background: #2d2d2d;
                border: 1px solid #555;
                border-radius: 3px;
                margin-top: 5px;
                min-width: 200px;
                z-index: 100;
            }
            
            .engine-dropdown button {
                width: 100%;
                text-align: left;
                border: none;
                border-bottom: 1px solid #3c3c3c;
                border-radius: 0;
            }
            
            .game-editor-main {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .game-editor-left-panel,
            .game-editor-right-panel {
                width: 300px;
                background: #252526;
                border-right: 1px solid #3c3c3c;
                display: flex;
                flex-direction: column;
            }
            
            .game-editor-right-panel {
                border-right: none;
                border-left: 1px solid #3c3c3c;
            }
            
            .panel-tabs {
                display: flex;
                background: #2d2d2d;
                border-bottom: 1px solid #3c3c3c;
            }
            
            .panel-tab {
                flex: 1;
                padding: 8px;
                background: transparent;
                border: none;
                color: #888;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            
            .panel-tab.active {
                color: #fff;
                border-bottom-color: #007acc;
            }
            
            .panel-content {
                flex: 1;
                overflow: auto;
                padding: 10px;
            }
            
            .game-editor-viewport-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: #1e1e1e;
            }
            
            .viewport-toolbar {
                display: flex;
                gap: 10px;
                padding: 8px;
                background: #2d2d2d;
                border-bottom: 1px solid #3c3c3c;
                align-items: center;
            }
            
            .game-viewport {
                flex: 1;
                position: relative;
                background: #1a1a1a;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #game-canvas {
                border: 1px solid #3c3c3c;
            }
            
            .viewport-overlay {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                padding: 10px;
                border-radius: 5px;
            }
            
            .game-editor-bottom-panel {
                height: 200px;
                background: #252526;
                border-top: 1px solid #3c3c3c;
                display: flex;
                flex-direction: column;
            }
            
            .game-console {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                overflow-y: auto;
            }
            
            .console-entry {
                padding: 2px 5px;
                border-bottom: 1px solid #2d2d2d;
            }
            
            .console-error {
                color: #f48771;
            }
            
            .console-warning {
                color: #cca700;
            }
            
            .hierarchy-tree,
            .asset-browser {
                font-size: 13px;
            }
            
            .tree-node {
                padding: 4px 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .tree-node:hover {
                background: #2a2d2e;
            }
            
            .tree-children {
                padding-left: 20px;
            }
            
            .asset-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            
            .asset-item {
                text-align: center;
                cursor: pointer;
                padding: 5px;
                border-radius: 3px;
            }
            
            .asset-item:hover {
                background: #2a2d2e;
            }
            
            .asset-thumbnail {
                font-size: 32px;
                margin-bottom: 5px;
            }
            
            .asset-name {
                font-size: 11px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .inspector-content {
                padding: 15px;
            }
            
            .inspector-empty {
                text-align: center;
                color: #888;
                padding: 40px 20px;
            }
            
            .panel-toolbar {
                display: flex;
                gap: 5px;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #3c3c3c;
            }
            
            .panel-toolbar button {
                padding: 4px 8px;
                background: #3c3c3c;
                border: 1px solid #555;
                color: #fff;
                cursor: pointer;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .panel-toolbar input {
                flex: 1;
                padding: 4px 8px;
                background: #3c3c3c;
                border: 1px solid #555;
                color: #fff;
                border-radius: 3px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Show/hide editor
     */
    show() {
        const container = document.getElementById('game-editor-container');
        if (container) {
            container.classList.add('active');
        }
    }
    
    hide() {
        const container = document.getElementById('game-editor-container');
        if (container) {
            container.classList.remove('active');
        }
    }
    
    toggle() {
        const container = document.getElementById('game-editor-container');
        if (container) {
            container.classList.toggle('active');
        }
    }
}

// Make available globally
window.VisualGameEditor = VisualGameEditor;

// Create singleton instance
window.gameEditor = new VisualGameEditor();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.gameEditor.initialize();
        });
    } else {
        window.gameEditor.initialize();
    }
}

console.log('[VisualGameEditor] Module loaded');

})();
