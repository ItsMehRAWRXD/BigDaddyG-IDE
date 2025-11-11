/**
 * BigDaddyG IDE - Mouse Ripple Effect (4K Optimized)
 * Beautiful ripple effect optimized for high-end systems
 * Performance-tuned for 4K @ 240Hz
 */

// ============================================================================
// RIPPLE CONFIGURATION
// ============================================================================

const RippleConfig = {
    // Visual settings
    maxRipples: 30,                // Reduced for 4K
    rippleLifetime: 1200,          // Reduced lifetime
    rippleSize: 150,               // Smaller size
    rippleSpeed: 1.0,              // Faster expansion
    opacity: 0.4,                  // Higher opacity
    
    // Colors (customizable)
    colors: [
        'rgba(0, 212, 255, OPACITY)',     // Cyan
        'rgba(0, 255, 136, OPACITY)',     // Green
        'rgba(168, 85, 247, OPACITY)',    // Purple
        'rgba(255, 107, 53, OPACITY)',    // Orange
        'rgba(255, 71, 87, OPACITY)'      // Red
    ],
    customColor: null,             // User custom color
    
    // Performance (4K optimized)
    enabled: true,
    quality: 'balanced',           // 'performance', 'balanced', 'quality'
    throttleMs: 32,                // ~30fps for 4K (was 16)
    useSimpleDrawing: true,        // Disable expensive effects on 4K
    
    // Behavior
    spawnOnMove: true,
    spawnOnClick: true,
    glow: false,                   // Disabled for 4K performance
    trailEffect: false,            // Disabled for 4K performance
    pulseEffect: false
};

// ============================================================================
// AUTO-DETECT 4K AND ADJUST
// ============================================================================

function detectDisplayAndOptimize() {
    const width = window.screen.width;
    const height = window.screen.height;
    const dpr = window.devicePixelRatio || 1;
    
    const is4K = (width >= 3840 || height >= 2160);
    const is1440p = (width >= 2560 || height >= 1440);
    
    if (is4K) {
        console.log('[Ripple] 🖥️ 4K display detected - applying performance optimizations');
        RippleConfig.maxRipples = 20;
        RippleConfig.throttleMs = 33;  // ~30fps
        RippleConfig.glow = false;
        RippleConfig.trailEffect = false;
        RippleConfig.useSimpleDrawing = true;
        RippleConfig.quality = 'performance';
    } else if (is1440p) {
        console.log('[Ripple] 🖥️ 1440p display detected - using balanced settings');
        RippleConfig.maxRipples = 30;
        RippleConfig.throttleMs = 16;  // ~60fps
        RippleConfig.glow = true;
        RippleConfig.trailEffect = false;
        RippleConfig.quality = 'balanced';
    } else {
        console.log('[Ripple] 🖥️ 1080p or lower - using quality settings');
        RippleConfig.maxRipples = 50;
        RippleConfig.throttleMs = 8;   // ~120fps
        RippleConfig.glow = true;
        RippleConfig.trailEffect = true;
        RippleConfig.quality = 'quality';
    }
    
    console.log(`[Ripple] Resolution: ${width}x${height} @ ${dpr}x DPR`);
    console.log(`[Ripple] Max ripples: ${RippleConfig.maxRipples}`);
    console.log(`[Ripple] Throttle: ${RippleConfig.throttleMs}ms (~${Math.round(1000/RippleConfig.throttleMs)}fps)`);
}

// ============================================================================
// RIPPLE SYSTEM
// ============================================================================

class RippleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.ripples = [];
        this.lastSpawnTime = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationFrame = null;
        this.colorIndex = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        this.init();
    }
    
    init() {
        // Auto-detect and optimize
        detectDisplayAndOptimize();
        
        // Create canvas overlay
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'ripple-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 999999;
        `;
        
        document.body.appendChild(this.canvas);
        
        // Use 2D context with alpha
        this.ctx = this.canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,  // Performance hint
            willReadFrequently: false
        });
        
        this.resize();
        
        // Event listeners
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', (e) => this.onMouseClick(e));
        
        // Start animation loop
        this.animate();
        
        console.log('[Ripple] 🌊 Mouse ripple effect initialized (4K optimized)');
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        
        // For 4K, limit DPR to 1.5x to save performance
        const limitedDPR = window.screen.width >= 3840 ? Math.min(dpr, 1.5) : dpr;
        
        this.canvas.width = window.innerWidth * limitedDPR;
        this.canvas.height = window.innerHeight * limitedDPR;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        console.log(`[Ripple] Canvas: ${this.canvas.width}x${this.canvas.height} (DPR: ${limitedDPR.toFixed(2)})`);
    }
    
    onMouseMove(e) {
        if (!RippleConfig.enabled || !RippleConfig.spawnOnMove) return;
        
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        const now = Date.now();
        if (now - this.lastSpawnTime < RippleConfig.throttleMs) return;
        
        this.createRipple(e.clientX, e.clientY, 'move');
        this.lastSpawnTime = now;
    }
    
    onMouseClick(e) {
        if (!RippleConfig.enabled || !RippleConfig.spawnOnClick) return;
        
        // Create larger ripple on click
        this.createRipple(e.clientX, e.clientY, 'click');
    }
    
    createRipple(x, y, type = 'move') {
        // Remove oldest ripple if at max
        if (this.ripples.length >= RippleConfig.maxRipples) {
            this.ripples.shift();
        }
        
        // Use custom color or cycle through colors
        let color;
        if (RippleConfig.customColor) {
            color = RippleConfig.customColor;
        } else {
            color = RippleConfig.colors[this.colorIndex];
            this.colorIndex = (this.colorIndex + 1) % RippleConfig.colors.length;
        }
        
        const ripple = {
            x: x,
            y: y,
            size: 0,
            maxSize: type === 'click' ? RippleConfig.rippleSize * 1.5 : RippleConfig.rippleSize,
            opacity: type === 'click' ? RippleConfig.opacity * 1.2 : RippleConfig.opacity,
            color: color,
            birthTime: Date.now(),
            type: type,
            speed: type === 'click' ? RippleConfig.rippleSpeed * 1.3 : RippleConfig.rippleSpeed
        };
        
        this.ripples.push(ripple);
    }
    
    animate(timestamp) {
        if (!RippleConfig.enabled) {
            this.animationFrame = requestAnimationFrame((t) => this.animate(t));
            return;
        }
        
        // FPS tracking
        if (this.lastFrameTime) {
            this.frameCount++;
            if (timestamp - this.lastFrameTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFrameTime = timestamp;
            }
        } else {
            this.lastFrameTime = timestamp;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw ripples
        const now = Date.now();
        
        this.ripples = this.ripples.filter(ripple => {
            const age = now - ripple.birthTime;
            
            // Remove if expired
            if (age > RippleConfig.rippleLifetime) {
                return false;
            }
            
            // Update ripple
            ripple.size += ripple.speed * (ripple.maxSize / 80);  // Faster expansion
            
            // Calculate opacity (fade out)
            const lifePercent = age / RippleConfig.rippleLifetime;
            const currentOpacity = ripple.opacity * (1 - lifePercent);
            
            // Draw ripple
            this.drawRipple(ripple, currentOpacity);
            
            return true;
        });
        
        this.animationFrame = requestAnimationFrame((t) => this.animate(t));
    }
    
    drawRipple(ripple, opacity) {
        const ctx = this.ctx;
        const dpr = window.devicePixelRatio || 1;
        const limitedDPR = window.screen.width >= 3840 ? Math.min(dpr, 1.5) : dpr;
        
        // Scale coordinates and sizes for DPR
        const x = ripple.x * limitedDPR;
        const y = ripple.y * limitedDPR;
        const size = ripple.size * limitedDPR;
        
        // Color with opacity
        const color = ripple.color.replace('OPACITY', opacity.toFixed(3));
        
        // PERFORMANCE MODE: Simple stroke only
        if (RippleConfig.useSimpleDrawing || RippleConfig.quality === 'performance') {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = (ripple.type === 'click' ? 2.5 : 1.5) * limitedDPR;
            ctx.stroke();
            return;
        }
        
        // BALANCED MODE: Stroke + subtle glow
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = (ripple.type === 'click' ? 2.5 : 1.5) * limitedDPR;
        
        // Glow effect (if enabled)
        if (RippleConfig.glow && RippleConfig.quality !== 'performance') {
            ctx.shadowBlur = 10 * limitedDPR;
            ctx.shadowColor = color;
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // QUALITY MODE: Add trail effect
        if (RippleConfig.trailEffect && ripple.size > 15 && RippleConfig.quality === 'quality') {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, ripple.color.replace('OPACITY', (opacity * 0.2).toFixed(3)));
            gradient.addColorStop(0.7, ripple.color.replace('OPACITY', (opacity * 0.05).toFixed(3)));
            gradient.addColorStop(1, ripple.color.replace('OPACITY', '0'));
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }
        
        // Pulse effect (innerring)
        if (RippleConfig.pulseEffect && ripple.size > 25) {
            ctx.beginPath();
            ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
            ctx.strokeStyle = ripple.color.replace('OPACITY', (opacity * 0.4).toFixed(3));
            ctx.lineWidth = 1 * limitedDPR;
            ctx.stroke();
        }
    }
    
    toggle() {
        RippleConfig.enabled = !RippleConfig.enabled;
        
        if (!RippleConfig.enabled) {
            this.ripples = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        console.log(`[Ripple] ${RippleConfig.enabled ? '🌊 Enabled' : '🛑 Disabled'}`);
    }
    
    setQuality(quality) {
        RippleConfig.quality = quality;
        
        switch(quality) {
            case 'performance':
                RippleConfig.maxRipples = 15;
                RippleConfig.glow = false;
                RippleConfig.trailEffect = false;
                RippleConfig.pulseEffect = false;
                RippleConfig.useSimpleDrawing = true;
                RippleConfig.throttleMs = 50; // ~20fps
                break;
            case 'balanced':
                RippleConfig.maxRipples = 25;
                RippleConfig.glow = true;
                RippleConfig.trailEffect = false;
                RippleConfig.pulseEffect = false;
                RippleConfig.useSimpleDrawing = false;
                RippleConfig.throttleMs = 33; // ~30fps
                break;
            case 'quality':
                RippleConfig.maxRipples = 40;
                RippleConfig.glow = true;
                RippleConfig.trailEffect = true;
                RippleConfig.pulseEffect = false;
                RippleConfig.useSimpleDrawing = false;
                RippleConfig.throttleMs = 16; // ~60fps
                break;
            case 'ultra':
                RippleConfig.maxRipples = 60;
                RippleConfig.glow = true;
                RippleConfig.trailEffect = true;
                RippleConfig.pulseEffect = true;
                RippleConfig.useSimpleDrawing = false;
                RippleConfig.throttleMs = 8; // ~120fps
                break;
        }
        
        console.log(`[Ripple] 🎨 Quality: ${quality} (Max ripples: ${RippleConfig.maxRipples}, Throttle: ${RippleConfig.throttleMs}ms)`);
    }
    
    setCustomColor(r, g, b) {
        RippleConfig.customColor = `rgba(${r}, ${g}, ${b}, OPACITY)`;
        console.log(`[Ripple] 🎨 Custom color: rgb(${r}, ${g}, ${b})`);
    }
    
    clearCustomColor() {
        RippleConfig.customColor = null;
        console.log('[Ripple] 🎨 Using default color cycle');
    }
    
    getFPS() {
        return this.fps;
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.canvas) {
            this.canvas.remove();
        }
        
        console.log('[Ripple] 🗑️ Ripple system destroyed');
    }
}

// ============================================================================
// RIPPLE CONTROL PANEL
// ============================================================================

function createRippleControls() {
    const controls = document.createElement('div');
    controls.id = 'ripple-controls';
    controls.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: rgba(10, 10, 30, 0.98);
        backdrop-filter: blur(30px);
        border: 2px solid var(--cyan, #00d4ff);
        border-radius: 12px;
        padding: 15px;
        z-index: 999997;
        display: none;
        min-width: 280px;
        max-width: 320px;
        box-shadow: 0 10px 40px rgba(0,212,255,0.4);
    `;
    
    controls.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--cyan, #00d4ff);">
            <div style="color: var(--cyan, #00d4ff); font-weight: bold; font-size: 14px;">🌊 Ripple Effects</div>
            <button onclick="toggleRippleControls()" style="background: #ff4757; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">✕</button>
        </div>
        
        <!-- FPS Display -->
        <div style="margin-bottom: 12px; padding: 8px; background: rgba(0,212,255,0.1); border-radius: 6px; text-align: center;">
            <div style="color: #00ff88; font-size: 20px; font-weight: bold;" id="ripple-fps-display">-- FPS</div>
            <div style="color: #888; font-size: 10px; margin-top: 2px;">Ripple Performance</div>
        </div>
        
        <!-- Quality Preset -->
        <div style="margin-bottom: 12px;">
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px;">Performance Mode:</label>
            <select id="ripple-quality" onchange="changeRippleQuality(this.value)" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--cyan, #00d4ff); border-radius: 6px; font-size: 12px;">
                <option value="performance">⚡ Performance (4K)</option>
                <option value="balanced" selected>⚖️ Balanced</option>
                <option value="quality">✨ Quality</option>
                <option value="ultra">🚀 Ultra (1080p)</option>
            </select>
            <div style="color: #666; font-size: 9px; margin-top: 3px; text-align: center;">Auto-detected for your display</div>
        </div>
        
        <!-- Enable/Disable -->
        <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="ripple-enabled" checked onchange="toggleRipple()" style="margin-right: 8px;">
                <span style="color: #ccc; font-size: 12px;">Enable Ripples</span>
            </label>
        </div>
        
        <!-- Custom Color -->
        <div style="margin-bottom: 12px;">
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px;">Custom Color:</label>
            <div style="display: flex; gap: 8px; align-items: center;">
                <input type="color" id="ripple-color-picker" value="#00d4ff" style="width: 50px; height: 35px; border: none; border-radius: 6px; cursor: pointer;">
                <button onclick="applyCustomRippleColor()" style="flex: 1; padding: 8px; background: linear-gradient(135deg, #00d4ff, #00ff88); border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; font-size: 11px;">Apply</button>
                <button onclick="clearCustomRippleColor()" style="padding: 8px; background: rgba(255,71,87,0.2); border: 1px solid #ff4757; border-radius: 6px; color: #ff4757; cursor: pointer; font-size: 11px;">Reset</button>
            </div>
        </div>
        
        <!-- Size Slider -->
        <div style="margin-bottom: 12px;">
            <label style="color: #888; font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Size:</span>
                <span id="ripple-size-value">${RippleConfig.rippleSize}</span>px
            </label>
            <input type="range" id="ripple-size" min="50" max="300" value="${RippleConfig.rippleSize}" onchange="updateRippleSize(this.value)" style="width: 100%; cursor: pointer;">
        </div>
        
        <!-- Opacity Slider -->
        <div style="margin-bottom: 12px;">
            <label style="color: #888; font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Opacity:</span>
                <span id="ripple-opacity-value">${RippleConfig.opacity.toFixed(1)}</span>
            </label>
            <input type="range" id="ripple-opacity" min="0.1" max="1" step="0.1" value="${RippleConfig.opacity}" onchange="updateRippleOpacity(this.value)" style="width: 100%; cursor: pointer;">
        </div>
        
        <!-- Advanced Toggle -->
        <details style="margin-top: 15px;">
            <summary style="color: var(--cyan, #00d4ff); font-size: 11px; cursor: pointer; margin-bottom: 10px;">⚙️ Advanced Settings</summary>
            
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="ripple-glow" onchange="toggleRippleGlow()" style="margin-right: 8px;">
                    <span style="color: #ccc; font-size: 11px;">Glow Effect</span>
                </label>
            </div>
            
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="ripple-trail" onchange="toggleRippleTrail()" style="margin-right: 8px;">
                    <span style="color: #ccc; font-size: 11px;">Trail Effect</span>
                </label>
            </div>
            
            <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="ripple-pulse" onchange="toggleRipplePulse()" style="margin-right: 8px;">
                    <span style="color: #ccc; font-size: 11px;">Pulse Effect</span>
                </label>
            </div>
        </details>
        
        <div style="margin-top: 12px; padding: 8px; background: rgba(0,212,255,0.05); border-radius: 6px; font-size: 9px; color: #666; text-align: center;">
            Optimized for 4K @ 240Hz<br>
            Move mouse or click to see ripples
        </div>
    `;
    
    document.body.appendChild(controls);
    
    // Update FPS display
    setInterval(() => {
        if (window.rippleSystem) {
            const fpsDisplay = document.getElementById('ripple-fps-display');
            if (fpsDisplay) {
                const fps = window.rippleSystem.getFPS();
                fpsDisplay.textContent = `${fps} FPS`;
                
                // Color code FPS
                if (fps >= 55) {
                    fpsDisplay.style.color = '#00ff88'; // Green
                } else if (fps >= 30) {
                    fpsDisplay.style.color = '#ffaa00'; // Orange
                } else {
                    fpsDisplay.style.color = '#ff4757'; // Red
                }
            }
        }
    }, 500);
}

function toggleRippleControls() {
    const controls = document.getElementById('ripple-controls');
    if (controls) {
        controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
    }
}

// ============================================================================
// CONTROL FUNCTIONS
// ============================================================================

function changeRippleQuality(quality) {
    if (window.rippleSystem) {
        window.rippleSystem.setQuality(quality);
        
        // Update checkboxes based on quality
        document.getElementById('ripple-glow').checked = RippleConfig.glow;
        document.getElementById('ripple-trail').checked = RippleConfig.trailEffect;
        document.getElementById('ripple-pulse').checked = RippleConfig.pulseEffect;
    }
}

function toggleRipple() {
    if (window.rippleSystem) {
        window.rippleSystem.toggle();
    }
}

function toggleRippleGlow() {
    RippleConfig.glow = document.getElementById('ripple-glow').checked;
}

function toggleRippleTrail() {
    RippleConfig.trailEffect = document.getElementById('ripple-trail').checked;
}

function toggleRipplePulse() {
    RippleConfig.pulseEffect = document.getElementById('ripple-pulse').checked;
}

function updateRippleSize(value) {
    RippleConfig.rippleSize = parseInt(value);
    document.getElementById('ripple-size-value').textContent = value;
}

function updateRippleOpacity(value) {
    RippleConfig.opacity = parseFloat(value);
    document.getElementById('ripple-opacity-value').textContent = parseFloat(value).toFixed(1);
}

function applyCustomRippleColor() {
    const colorPicker = document.getElementById('ripple-color-picker');
    const hex = colorPicker.value;
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(1,2), 16);
    const g = parseInt(hex.substr(3,2), 16);
    const b = parseInt(hex.substr(5,2), 16);
    
    if (window.rippleSystem) {
        window.rippleSystem.setCustomColor(r, g, b);
    }
}

function clearCustomRippleColor() {
    if (window.rippleSystem) {
        window.rippleSystem.clearCustomColor();
    }
}

// ============================================================================
// RIPPLE TOGGLE BUTTON
// ============================================================================

function createRippleToggleButton() {
    const button = document.createElement('button');
    button.id = 'ripple-toggle-btn';
    button.innerHTML = '🌊';
    button.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #00d4ff, #00ff88);
        border: 2px solid var(--cyan, #00d4ff);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 999996;
        box-shadow: 0 5px 20px rgba(0,212,255,0.5);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'scale(1.1) rotate(15deg)';
        button.style.boxShadow = '0 8px 30px rgba(0,212,255,0.8)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'scale(1) rotate(0deg)';
        button.style.boxShadow = '0 5px 20px rgba(0,212,255,0.5)';
    };
    
    button.onclick = toggleRippleControls;
    
    document.body.appendChild(button);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.rippleSystem = new RippleSystem();
        createRippleToggleButton();
        createRippleControls();
        
        console.log('[Ripple] ✅ Mouse ripple system initialized (4K optimized)');
        console.log('[Ripple] 💡 Click 🌊 button to configure');
    });
} else {
    window.rippleSystem = new RippleSystem();
    createRippleToggleButton();
    createRippleControls();
    
    console.log('[Ripple] ✅ Mouse ripple system initialized (4K optimized)');
    console.log('[Ripple] 💡 Click 🌊 button to configure');
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RippleSystem, RippleConfig };
}
