/**
 * BigDaddyG IDE - Animation Timeline Editor
 * Complete animation editing with keyframes, curves, and preview
 */

(function() {
'use strict';

class AnimationTimelineEditor {
    constructor() {
        this.currentAnimation = null;
        this.keyframes = [];
        this.selectedKeyframe = null;
        this.timelineZoom = 1.0;
        this.currentTime = 0;
        this.isPlaying = false;
        this.duration = 5.0; // seconds
        this.fps = 60;
        
        console.log('[AnimationTimelineEditor] Initialized');
    }
    
    /**
     * Initialize timeline editor
     */
    async initialize(containerId) {
        console.log('[AnimationTimelineEditor] Initializing...');
        
        const container = document.getElementById(containerId) || document.createElement('div');
        container.id = containerId;
        
        this.createTimelineUI(container);
        this.attachEventListeners();
        this.initializeCanvas();
        
        console.log('[AnimationTimelineEditor] ✅ Ready');
        return { success: true };
    }
    
    /**
     * Create timeline UI
     */
    createTimelineUI(container) {
        container.innerHTML = `
            <div class="animation-timeline-container">
                <!-- Toolbar -->
                <div class="timeline-toolbar">
                    <div class="toolbar-section">
                        <button id="new-anim-btn" title="New Animation">📄 New</button>
                        <button id="save-anim-btn" title="Save">💾 Save</button>
                        <button id="load-anim-btn" title="Load">📁 Load</button>
                    </div>
                    
                    <div class="toolbar-section">
                        <button id="play-anim-btn" title="Play">▶️</button>
                        <button id="pause-anim-btn" title="Pause">⏸️</button>
                        <button id="stop-anim-btn" title="Stop">⏹️</button>
                        <button id="step-back-btn" title="Step Back">⏮️</button>
                        <button id="step-forward-btn" title="Step Forward">⏭️</button>
                    </div>
                    
                    <div class="toolbar-section">
                        <button id="add-keyframe-btn" title="Add Keyframe">➕ Keyframe</button>
                        <button id="delete-keyframe-btn" title="Delete Keyframe">🗑️</button>
                        <button id="auto-key-btn" title="Auto-Key" class="toggle-btn">🔴 Auto</button>
                    </div>
                    
                    <div class="toolbar-section">
                        <label>Duration:</label>
                        <input type="number" id="anim-duration" value="5.0" step="0.1" min="0.1" style="width: 60px;" />
                        <span>s</span>
                    </div>
                    
                    <div class="toolbar-section">
                        <label>FPS:</label>
                        <select id="anim-fps">
                            <option value="30">30</option>
                            <option value="60" selected>60</option>
                            <option value="120">120</option>
                        </select>
                    </div>
                    
                    <div class="toolbar-section">
                        <button id="zoom-in-btn" title="Zoom In">🔍+</button>
                        <button id="zoom-out-btn" title="Zoom Out">🔍-</button>
                        <button id="fit-view-btn" title="Fit View">↔️</button>
                    </div>
                </div>
                
                <!-- Main Timeline Area -->
                <div class="timeline-layout">
                    <!-- Left: Track List -->
                    <div class="timeline-tracks">
                        <div class="tracks-header">
                            <h3>Animated Properties</h3>
                            <button id="add-track-btn" title="Add Track">➕</button>
                        </div>
                        <div class="tracks-list" id="tracks-list">
                            <!-- Tracks will be populated here -->
                        </div>
                    </div>
                    
                    <!-- Center: Timeline Canvas -->
                    <div class="timeline-canvas-container">
                        <canvas id="timeline-canvas" class="timeline-canvas"></canvas>
                        <div class="timeline-ruler" id="timeline-ruler"></div>
                        <div class="timeline-playhead" id="timeline-playhead" style="left: 0px;"></div>
                    </div>
                    
                    <!-- Right: Keyframe Inspector -->
                    <div class="keyframe-inspector">
                        <h3>Keyframe Inspector</h3>
                        <div id="keyframe-properties">
                            <div class="inspector-empty">
                                <p>Select a keyframe to edit</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom: Curve Editor -->
                <div class="curve-editor-panel" id="curve-editor-panel">
                    <div class="curve-header">
                        <span>Curve Editor</span>
                        <button id="toggle-curve-btn">▼</button>
                    </div>
                    <div class="curve-content" id="curve-content">
                        <canvas id="curve-canvas" class="curve-canvas"></canvas>
                        <div class="curve-presets">
                            <button data-curve="linear">Linear</button>
                            <button data-curve="easeIn">Ease In</button>
                            <button data-curve="easeOut">Ease Out</button>
                            <button data-curve="easeInOut">Ease In-Out</button>
                            <button data-curve="bounce">Bounce</button>
                        </div>
                    </div>
                </div>
                
                <!-- Time Display -->
                <div class="time-display">
                    <span id="current-time-display">0.00s</span> / <span id="total-time-display">5.00s</span>
                    <span style="margin-left: 20px;">Frame: <span id="current-frame-display">0</span></span>
                </div>
            </div>
        `;
        
        this.applyTimelineStyles();
        this.createDefaultTracks();
    }
    
    /**
     * Create default animation tracks
     */
    createDefaultTracks() {
        const tracksList = document.getElementById('tracks-list');
        if (!tracksList) return;
        
        const defaultTracks = [
            { name: 'Position.X', type: 'float', color: '#ff4444' },
            { name: 'Position.Y', type: 'float', color: '#44ff44' },
            { name: 'Position.Z', type: 'float', color: '#4444ff' },
            { name: 'Rotation.X', type: 'float', color: '#ffaa44' },
            { name: 'Rotation.Y', type: 'float', color: '#aa44ff' },
            { name: 'Rotation.Z', type: 'float', color: '#44aaff' },
            { name: 'Scale.X', type: 'float', color: '#ff44aa' },
            { name: 'Scale.Y', type: 'float', color: '#aaff44' },
            { name: 'Scale.Z', type: 'float', color: '#44ffaa' }
        ];
        
        tracksList.innerHTML = defaultTracks.map((track, index) => `
            <div class="track-item" data-track-id="${index}">
                <div class="track-color" style="background: ${track.color};"></div>
                <span class="track-name">${track.name}</span>
                <div class="track-actions">
                    <button class="btn-icon" title="Mute">🔇</button>
                    <button class="btn-icon" title="Solo">S</button>
                    <button class="btn-icon" title="Lock">🔒</button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Initialize timeline canvas
     */
    initializeCanvas() {
        const canvas = document.getElementById('timeline-canvas');
        if (!canvas) return;
        
        // Set canvas size
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400;
        
        this.drawTimeline();
        this.drawRuler();
    }
    
    /**
     * Draw timeline grid
     */
    drawTimeline() {
        const canvas = document.getElementById('timeline-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#2d2d2d';
        ctx.lineWidth = 1;
        
        const secondWidth = 100 * this.timelineZoom;
        const numSeconds = Math.ceil(width / secondWidth);
        
        // Vertical lines (seconds)
        for (let i = 0; i <= numSeconds; i++) {
            const x = i * secondWidth;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            
            // Sub-divisions (frames)
            const framesPerSecond = this.fps;
            const frameWidth = secondWidth / framesPerSecond;
            
            for (let f = 1; f < framesPerSecond; f++) {
                const fx = x + f * frameWidth;
                ctx.strokeStyle = '#252525';
                ctx.beginPath();
                ctx.moveTo(fx, 0);
                ctx.lineTo(fx, height);
                ctx.stroke();
            }
            
            ctx.strokeStyle = '#2d2d2d';
        }
        
        // Horizontal lines (tracks)
        const trackHeight = height / 9; // 9 default tracks
        for (let i = 0; i <= 9; i++) {
            const y = i * trackHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw keyframes
        this.drawKeyframes(ctx, secondWidth, trackHeight);
    }
    
    /**
     * Draw keyframes on timeline
     */
    drawKeyframes(ctx, secondWidth, trackHeight) {
        this.keyframes.forEach(keyframe => {
            const x = keyframe.time * secondWidth;
            const y = keyframe.track * trackHeight + trackHeight / 2;
            
            // Draw keyframe diamond
            ctx.fillStyle = keyframe === this.selectedKeyframe ? '#ffa500' : '#4CAF50';
            ctx.beginPath();
            ctx.moveTo(x, y - 8);
            ctx.lineTo(x + 6, y);
            ctx.lineTo(x, y + 8);
            ctx.lineTo(x - 6, y);
            ctx.closePath();
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
    
    /**
     * Draw time ruler
     */
    drawRuler() {
        const ruler = document.getElementById('timeline-ruler');
        if (!ruler) return;
        
        const secondWidth = 100 * this.timelineZoom;
        const numSeconds = Math.ceil(this.duration);
        
        ruler.innerHTML = '';
        for (let i = 0; i <= numSeconds; i++) {
            const mark = document.createElement('div');
            mark.className = 'ruler-mark';
            mark.style.left = `${i * secondWidth}px`;
            mark.textContent = `${i}s`;
            ruler.appendChild(mark);
        }
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Playback controls
        document.getElementById('play-anim-btn')?.addEventListener('click', () => this.play());
        document.getElementById('pause-anim-btn')?.addEventListener('click', () => this.pause());
        document.getElementById('stop-anim-btn')?.addEventListener('click', () => this.stop());
        document.getElementById('step-back-btn')?.addEventListener('click', () => this.stepBack());
        document.getElementById('step-forward-btn')?.addEventListener('click', () => this.stepForward());
        
        // Keyframe controls
        document.getElementById('add-keyframe-btn')?.addEventListener('click', () => this.addKeyframe());
        document.getElementById('delete-keyframe-btn')?.addEventListener('click', () => this.deleteKeyframe());
        
        // Zoom controls
        document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('fit-view-btn')?.addEventListener('click', () => this.fitView());
        
        // Duration change
        document.getElementById('anim-duration')?.addEventListener('change', (e) => {
            this.duration = parseFloat(e.target.value);
            document.getElementById('total-time-display').textContent = this.duration.toFixed(2) + 's';
            this.drawTimeline();
            this.drawRuler();
        });
        
        // FPS change
        document.getElementById('anim-fps')?.addEventListener('change', (e) => {
            this.fps = parseInt(e.target.value);
            this.drawTimeline();
        });
        
        // Canvas click for keyframe selection
        const canvas = document.getElementById('timeline-canvas');
        canvas?.addEventListener('click', (e) => this.onCanvasClick(e));
        
        // Curve presets
        document.querySelectorAll('.curve-presets button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyCurve(btn.dataset.curve);
            });
        });
        
        // Toggle curve editor
        document.getElementById('toggle-curve-btn')?.addEventListener('click', () => {
            const content = document.getElementById('curve-content');
            if (content) {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    /**
     * Play animation
     */
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        const startTime = Date.now() - this.currentTime * 1000;
        
        const animate = () => {
            if (!this.isPlaying) return;
            
            this.currentTime = (Date.now() - startTime) / 1000;
            
            if (this.currentTime >= this.duration) {
                this.currentTime = 0;
                this.stop();
                return;
            }
            
            this.updateTimeDisplay();
            this.updatePlayhead();
            
            requestAnimationFrame(animate);
        };
        
        animate();
        console.log('[AnimationTimelineEditor] Playing');
    }
    
    /**
     * Pause animation
     */
    pause() {
        this.isPlaying = false;
        console.log('[AnimationTimelineEditor] Paused');
    }
    
    /**
     * Stop animation
     */
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.updateTimeDisplay();
        this.updatePlayhead();
        console.log('[AnimationTimelineEditor] Stopped');
    }
    
    /**
     * Step back one frame
     */
    stepBack() {
        this.currentTime = Math.max(0, this.currentTime - 1 / this.fps);
        this.updateTimeDisplay();
        this.updatePlayhead();
    }
    
    /**
     * Step forward one frame
     */
    stepForward() {
        this.currentTime = Math.min(this.duration, this.currentTime + 1 / this.fps);
        this.updateTimeDisplay();
        this.updatePlayhead();
    }
    
    /**
     * Add keyframe
     */
    addKeyframe() {
        const keyframe = {
            time: this.currentTime,
            track: 0, // Default to first track
            value: 0,
            curve: 'linear'
        };
        
        this.keyframes.push(keyframe);
        this.drawTimeline();
        
        console.log('[AnimationTimelineEditor] Keyframe added at', this.currentTime);
    }
    
    /**
     * Delete selected keyframe
     */
    deleteKeyframe() {
        if (!this.selectedKeyframe) return;
        
        const index = this.keyframes.indexOf(this.selectedKeyframe);
        if (index !== -1) {
            this.keyframes.splice(index, 1);
            this.selectedKeyframe = null;
            this.drawTimeline();
            console.log('[AnimationTimelineEditor] Keyframe deleted');
        }
    }
    
    /**
     * Zoom in timeline
     */
    zoomIn() {
        this.timelineZoom *= 1.2;
        this.drawTimeline();
        this.drawRuler();
    }
    
    /**
     * Zoom out timeline
     */
    zoomOut() {
        this.timelineZoom *= 0.8;
        this.drawTimeline();
        this.drawRuler();
    }
    
    /**
     * Fit view to duration
     */
    fitView() {
        const canvas = document.getElementById('timeline-canvas');
        if (!canvas) return;
        
        this.timelineZoom = canvas.width / (this.duration * 100);
        this.drawTimeline();
        this.drawRuler();
    }
    
    /**
     * Update time display
     */
    updateTimeDisplay() {
        const currentTimeDisplay = document.getElementById('current-time-display');
        const currentFrameDisplay = document.getElementById('current-frame-display');
        
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = this.currentTime.toFixed(2) + 's';
        }
        
        if (currentFrameDisplay) {
            const frame = Math.floor(this.currentTime * this.fps);
            currentFrameDisplay.textContent = frame.toString();
        }
    }
    
    /**
     * Update playhead position
     */
    updatePlayhead() {
        const playhead = document.getElementById('timeline-playhead');
        if (!playhead) return;
        
        const secondWidth = 100 * this.timelineZoom;
        const x = this.currentTime * secondWidth;
        playhead.style.left = `${x}px`;
    }
    
    /**
     * Handle canvas click
     */
    onCanvasClick(e) {
        const canvas = document.getElementById('timeline-canvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const secondWidth = 100 * this.timelineZoom;
        const clickTime = x / secondWidth;
        
        // Check if clicked on a keyframe
        const clickedKeyframe = this.keyframes.find(kf => {
            const kfX = kf.time * secondWidth;
            return Math.abs(kfX - x) < 10;
        });
        
        if (clickedKeyframe) {
            this.selectedKeyframe = clickedKeyframe;
            this.showKeyframeInspector(clickedKeyframe);
        } else {
            this.selectedKeyframe = null;
            this.hideKeyframeInspector();
        }
        
        this.drawTimeline();
    }
    
    /**
     * Show keyframe inspector
     */
    showKeyframeInspector(keyframe) {
        const inspector = document.getElementById('keyframe-properties');
        if (!inspector) return;
        
        inspector.innerHTML = `
            <div class="property-group">
                <label>Time</label>
                <input type="number" id="kf-time" value="${keyframe.time}" step="0.01" />
            </div>
            <div class="property-group">
                <label>Value</label>
                <input type="number" id="kf-value" value="${keyframe.value}" step="0.1" />
            </div>
            <div class="property-group">
                <label>Interpolation</label>
                <select id="kf-curve">
                    <option value="linear" ${keyframe.curve === 'linear' ? 'selected' : ''}>Linear</option>
                    <option value="easeIn" ${keyframe.curve === 'easeIn' ? 'selected' : ''}>Ease In</option>
                    <option value="easeOut" ${keyframe.curve === 'easeOut' ? 'selected' : ''}>Ease Out</option>
                    <option value="easeInOut" ${keyframe.curve === 'easeInOut' ? 'selected' : ''}>Ease In-Out</option>
                </select>
            </div>
        `;
    }
    
    /**
     * Hide keyframe inspector
     */
    hideKeyframeInspector() {
        const inspector = document.getElementById('keyframe-properties');
        if (!inspector) return;
        
        inspector.innerHTML = `
            <div class="inspector-empty">
                <p>Select a keyframe to edit</p>
            </div>
        `;
    }
    
    /**
     * Apply curve to selected keyframe
     */
    applyCurve(curveName) {
        if (!this.selectedKeyframe) return;
        
        this.selectedKeyframe.curve = curveName;
        console.log(`[AnimationTimelineEditor] Applied ${curveName} curve`);
    }
    
    /**
     * Apply styles
     */
    applyTimelineStyles() {
        if (document.getElementById('animation-timeline-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'animation-timeline-styles';
        style.textContent = `
            .animation-timeline-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #1e1e1e;
                color: #fff;
            }
            
            .timeline-toolbar {
                display: flex;
                gap: 10px;
                padding: 8px;
                background: #252526;
                border-bottom: 1px solid #3c3c3c;
                align-items: center;
            }
            
            .timeline-layout {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .timeline-tracks {
                width: 200px;
                background: #252526;
                border-right: 1px solid #3c3c3c;
                display: flex;
                flex-direction: column;
            }
            
            .tracks-list {
                flex: 1;
                overflow-y: auto;
            }
            
            .track-item {
                display: flex;
                align-items: center;
                padding: 8px;
                gap: 8px;
                border-bottom: 1px solid #2d2d2d;
                cursor: pointer;
            }
            
            .track-item:hover {
                background: #2a2d2e;
            }
            
            .track-color {
                width: 4px;
                height: 30px;
                border-radius: 2px;
            }
            
            .timeline-canvas-container {
                flex: 1;
                position: relative;
                overflow: auto;
                background: #1e1e1e;
            }
            
            .timeline-canvas {
                display: block;
            }
            
            .timeline-ruler {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 25px;
                background: #2d2d2d;
                border-bottom: 1px solid #3c3c3c;
            }
            
            .ruler-mark {
                position: absolute;
                font-size: 11px;
                padding: 5px;
                color: #888;
            }
            
            .timeline-playhead {
                position: absolute;
                top: 0;
                width: 2px;
                height: 100%;
                background: #ff4444;
                z-index: 10;
                pointer-events: none;
            }
            
            .keyframe-inspector {
                width: 250px;
                background: #252526;
                border-left: 1px solid #3c3c3c;
                padding: 15px;
            }
            
            .curve-editor-panel {
                height: 200px;
                background: #252526;
                border-top: 1px solid #3c3c3c;
            }
            
            .curve-canvas {
                width: 100%;
                height: 150px;
                background: #1e1e1e;
            }
            
            .curve-presets {
                display: flex;
                gap: 5px;
                padding: 10px;
            }
            
            .curve-presets button {
                flex: 1;
                padding: 5px;
                background: #3c3c3c;
                border: 1px solid #555;
                color: #fff;
                cursor: pointer;
                border-radius: 3px;
                font-size: 11px;
            }
            
            .time-display {
                padding: 8px 15px;
                background: #252526;
                border-top: 1px solid #3c3c3c;
                font-family: monospace;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Make available globally
window.AnimationTimelineEditor = AnimationTimelineEditor;

console.log('[AnimationTimelineEditor] Module loaded');

})();
