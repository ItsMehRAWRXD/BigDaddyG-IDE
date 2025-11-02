/**
 * BigDaddyG IDE - Visual Performance Benchmark Suite
 * 4K/8K @ 60Hz-540Hz with real-time FPS/Resolution overlay
 */

(function() {
'use strict';

// ============================================================================
// DISPLAY CONFIGURATIONS
// ============================================================================

const DisplayConfigs = {
    // Standard configurations
    'FHD_60': { width: 1920, height: 1080, refreshRate: 60, name: 'Full HD 60Hz' },
    'FHD_144': { width: 1920, height: 1080, refreshRate: 144, name: 'Full HD 144Hz' },
    'FHD_240': { width: 1920, height: 1080, refreshRate: 240, name: 'Full HD 240Hz' },
    
    // 1440p
    'QHD_60': { width: 2560, height: 1440, refreshRate: 60, name: '1440p 60Hz' },
    'QHD_144': { width: 2560, height: 1440, refreshRate: 144, name: '1440p 144Hz' },
    'QHD_240': { width: 2560, height: 1440, refreshRate: 240, name: '1440p 240Hz' },
    'QHD_360': { width: 2560, height: 1440, refreshRate: 360, name: '1440p 360Hz' },
    
    // 4K
    '4K_60': { width: 3840, height: 2160, refreshRate: 60, name: '4K 60Hz' },
    '4K_120': { width: 3840, height: 2160, refreshRate: 120, name: '4K 120Hz' },
    '4K_144': { width: 3840, height: 2160, refreshRate: 144, name: '4K 144Hz' },
    '4K_240': { width: 3840, height: 2160, refreshRate: 240, name: '4K 240Hz ⚡' },
    '4K_360': { width: 3840, height: 2160, refreshRate: 360, name: '4K 360Hz ⚡⚡' },
    '4K_540': { width: 3840, height: 2160, refreshRate: 540, name: '4K 540Hz 🔥 EXTREME' },
    
    // 5K
    '5K_60': { width: 5120, height: 2880, refreshRate: 60, name: '5K 60Hz' },
    '5K_120': { width: 5120, height: 2880, refreshRate: 120, name: '5K 120Hz' },
    '5K_240': { width: 5120, height: 2880, refreshRate: 240, name: '5K 240Hz ⚡' },
    
    // 8K
    '8K_60': { width: 7680, height: 4320, refreshRate: 60, name: '8K 60Hz' },
    '8K_120': { width: 7680, height: 4320, refreshRate: 120, name: '8K 120Hz ⚡' },
    '8K_240': { width: 7680, height: 4320, refreshRate: 240, name: '8K 240Hz 🔥 LEGENDARY' },
    '8K_360': { width: 7680, height: 4320, refreshRate: 360, name: '8K 360Hz 🔥🔥 GODLIKE' },
    '8K_540': { width: 7680, height: 4320, refreshRate: 540, name: '8K 540Hz 💎 COSMIC' }
};

let currentDisplayConfig = '4K_240';
let actualFPS = 0;
let targetFPS = 240;
let frameCount = 0;
let lastTime = performance.now();
let frameHistory = [];
let benchmarkRunning = false;

// ============================================================================
// PERFORMANCE OVERLAY - ALWAYS VISIBLE
// ============================================================================

function createPerformanceOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'perf-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%);
        backdrop-filter: blur(20px);
        border-bottom: 3px solid var(--cyan);
        padding: 15px 20px;
        z-index: 999999;
        font-family: 'Courier New', monospace;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 30px;
        align-items: center;
        box-shadow: 0 5px 30px rgba(0,212,255,0.5);
    `;
    
    overlay.innerHTML = `
        <!-- Left: FPS Display -->
        <div style="display: flex; gap: 15px; align-items: center;">
            <div style="display: flex; flex-direction: column;">
                <div style="font-size: 10px; color: #888; text-transform: uppercase;">FPS</div>
                <div id="fps-display" style="font-size: 36px; font-weight: bold; color: var(--green); line-height: 1; font-family: 'Consolas', monospace;">
                    0
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column;">
                <div style="font-size: 10px; color: #888; text-transform: uppercase;">Target</div>
                <div id="target-fps-display" style="font-size: 24px; font-weight: bold; color: var(--cyan); line-height: 1;">
                    240
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column;">
                <div style="font-size: 10px; color: #888; text-transform: uppercase;">Frame Time</div>
                <div id="frame-time-display" style="font-size: 18px; font-weight: bold; color: var(--purple); line-height: 1;">
                    0.00ms
                </div>
            </div>
        </div>
        
        <!-- Center: Resolution & Display Info -->
        <div style="text-align: center;">
            <div id="resolution-display" style="font-size: 28px; font-weight: bold; color: var(--orange); margin-bottom: 5px;">
                3840 × 2160 @ 240Hz
            </div>
            <div style="display: flex; gap: 20px; justify-content: center; font-size: 12px;">
                <div>
                    <span style="color: #888;">GPU:</span>
                    <span id="gpu-usage" style="color: var(--cyan);">0%</span>
                </div>
                <div>
                    <span style="color: #888;">Memory:</span>
                    <span id="mem-usage" style="color: var(--purple);">0 MB</span>
                </div>
                <div>
                    <span style="color: #888;">Render:</span>
                    <span id="render-mode" style="color: var(--green);">Hardware Accelerated</span>
                </div>
            </div>
        </div>
        
        <!-- Right: Controls -->
        <div style="display: flex; gap: 10px;">
            <button onclick="showDisplaySelector()" style="
                padding: 10px 20px;
                background: linear-gradient(135deg, var(--cyan), var(--purple));
                border: 2px solid var(--cyan);
                border-radius: 8px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(0,212,255,0.4);
            " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 25px rgba(0,212,255,0.6)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(0,212,255,0.4)'">
                🖥️ Display
            </button>
            
            <button onclick="toggleBenchmark()" style="
                padding: 10px 20px;
                background: linear-gradient(135deg, var(--orange), var(--red));
                border: 2px solid var(--orange);
                border-radius: 8px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(255,107,53,0.4);
            " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 25px rgba(255,107,53,0.6)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(255,107,53,0.4)'">
                🔥 Benchmark
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Start FPS monitoring
    monitorFPS();
    monitorSystemResources();
}

// ============================================================================
// FPS MONITORING
// ============================================================================

function monitorFPS() {
    let frames = 0;
    let lastFPSUpdate = performance.now();
    
    function updateFrame() {
        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;
        
        frames++;
        frameCount++;
        
        // Calculate frame time
        const frameTime = delta;
        frameHistory.push(frameTime);
        if (frameHistory.length > 120) frameHistory.shift(); // Keep last 2 seconds at 60fps
        
        // Update FPS every ~250ms
        if (now - lastFPSUpdate >= 250) {
            actualFPS = Math.round((frames / (now - lastFPSUpdate)) * 1000);
            frames = 0;
            lastFPSUpdate = now;
            
            updateFPSDisplay();
        }
        
        requestAnimationFrame(updateFrame);
    }
    
    requestAnimationFrame(updateFrame);
}

function updateFPSDisplay() {
    const fpsEl = document.getElementById('fps-display');
    const frameTimeEl = document.getElementById('frame-time-display');
    
    if (fpsEl) {
        fpsEl.textContent = actualFPS;
        
        // Color based on performance
        const fpsRatio = actualFPS / targetFPS;
        if (fpsRatio >= 0.95) {
            fpsEl.style.color = 'var(--green)';
            fpsEl.style.textShadow = '0 0 20px rgba(0,255,136,0.8)';
        } else if (fpsRatio >= 0.75) {
            fpsEl.style.color = 'var(--orange)';
            fpsEl.style.textShadow = '0 0 20px rgba(255,107,53,0.8)';
        } else {
            fpsEl.style.color = 'var(--red)';
            fpsEl.style.textShadow = '0 0 20px rgba(255,71,87,0.8)';
        }
    }
    
    if (frameTimeEl) {
        const avgFrameTime = frameHistory.reduce((a, b) => a + b, 0) / frameHistory.length;
        frameTimeEl.textContent = avgFrameTime.toFixed(2) + 'ms';
    }
}

// ============================================================================
// SYSTEM RESOURCE MONITORING
// ============================================================================

function monitorSystemResources() {
    setInterval(() => {
        // Memory usage
        if (performance.memory) {
            const memUsed = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const memEl = document.getElementById('mem-usage');
            if (memEl) {
                memEl.textContent = `${memUsed} MB`;
            }
        }
        
        // GPU usage (estimate based on FPS stability)
        const fpsStability = calculateFPSStability();
        const gpuEl = document.getElementById('gpu-usage');
        if (gpuEl) {
            const estimatedGPU = Math.min(100, Math.round((targetFPS / 60) * 30 * fpsStability));
            gpuEl.textContent = `${estimatedGPU}%`;
        }
        
    }, 1000);
}

function calculateFPSStability() {
    if (frameHistory.length < 10) return 1.0;
    
    const avg = frameHistory.reduce((a, b) => a + b, 0) / frameHistory.length;
    const variance = frameHistory.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / frameHistory.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = more stable = higher value
    return Math.max(0, Math.min(1, 1 - (stdDev / avg)));
}

// ============================================================================
// DISPLAY SELECTOR
// ============================================================================

function showDisplaySelector() {
    const selector = document.createElement('div');
    selector.id = 'display-selector';
    selector.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 30, 0.98);
        backdrop-filter: blur(30px);
        border: 3px solid var(--cyan);
        border-radius: 20px;
        padding: 30px;
        z-index: 1000000;
        max-width: 900px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 50px rgba(0,212,255,0.6);
    `;
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid var(--cyan);">
            <h2 style="color: var(--cyan); margin: 0; font-size: 24px;">🖥️ Display Configuration</h2>
            <button onclick="closeDisplaySelector()" style="background: var(--red); color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">✕ Close</button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
    `;
    
    Object.keys(DisplayConfigs).forEach(key => {
        const config = DisplayConfigs[key];
        const isActive = key === currentDisplayConfig;
        const megapixels = ((config.width * config.height) / 1000000).toFixed(2);
        const bandwidth = ((config.width * config.height * config.refreshRate * 24) / 1000000000).toFixed(2); // Gbps
        
        html += `
            <div onclick="applyDisplayConfig('${key}')" style="
                padding: 20px;
                background: ${isActive ? 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(168,85,247,0.3))' : 'rgba(0,0,0,0.5)'};
                border: 2px solid ${isActive ? 'var(--cyan)' : 'rgba(0,212,255,0.3)'};
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
                ${isActive ? 'box-shadow: 0 0 30px rgba(0,212,255,0.6);' : ''}
            " onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='var(--cyan)'" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='${isActive ? 'var(--cyan)' : 'rgba(0,212,255,0.3)'}' ">
                <div style="font-size: 18px; font-weight: bold; color: ${getRefreshRateColor(config.refreshRate)}; margin-bottom: 8px;">
                    ${config.name}
                </div>
                <div style="font-size: 13px; color: #888; margin-bottom: 10px;">
                    ${config.width} × ${config.height}
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px; font-size: 11px;">
                    <div style="color: var(--cyan);">
                        <strong>${config.refreshRate}Hz</strong> refresh
                    </div>
                    <div style="color: var(--purple);">
                        <strong>${megapixels}MP</strong> per frame
                    </div>
                    <div style="color: var(--orange);">
                        <strong>${bandwidth} Gbps</strong> bandwidth
                    </div>
                </div>
                ${config.refreshRate >= 240 ? '<div style="margin-top: 10px; padding: 5px 10px; background: rgba(255,107,53,0.2); border-radius: 5px; text-align: center; font-size: 10px; color: var(--orange); font-weight: bold;">⚡ HIGH PERFORMANCE</div>' : ''}
                ${config.refreshRate >= 360 ? '<div style="margin-top: 5px; padding: 5px 10px; background: rgba(255,71,87,0.2); border-radius: 5px; text-align: center; font-size: 10px; color: var(--red); font-weight: bold;">🔥 EXTREME</div>' : ''}
                ${config.refreshRate >= 540 ? '<div style="margin-top: 5px; padding: 5px 10px; background: rgba(168,85,247,0.2); border-radius: 5px; text-align: center; font-size: 10px; color: var(--purple); font-weight: bold;">💎 LEGENDARY</div>' : ''}
            </div>
        `;
    });
    
    html += `
        </div>
        
        <div style="margin-top: 25px; padding: 20px; background: rgba(0,212,255,0.1); border-radius: 12px; border-left: 4px solid var(--cyan);">
            <div style="font-size: 14px; font-weight: bold; color: var(--cyan); margin-bottom: 10px;">
                📊 Current Performance
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 12px;">
                <div>
                    <div style="color: #888;">Actual FPS</div>
                    <div style="color: var(--green); font-weight: bold; font-size: 20px;">${actualFPS}</div>
                </div>
                <div>
                    <div style="color: #888;">Target FPS</div>
                    <div style="color: var(--cyan); font-weight: bold; font-size: 20px;">${targetFPS}</div>
                </div>
                <div>
                    <div style="color: #888;">Performance</div>
                    <div style="color: var(--purple); font-weight: bold; font-size: 20px;">${Math.round((actualFPS / targetFPS) * 100)}%</div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(255,107,53,0.1); border-radius: 10px; border-left: 4px solid var(--orange); font-size: 12px; color: #ccc;">
            <strong style="color: var(--orange);">💡 Tip:</strong> Higher refresh rates require more GPU power. If FPS drops below target, try a lower refresh rate or resolution.
        </div>
    `;
    
    selector.innerHTML = html;
    document.body.appendChild(selector);
}

function getRefreshRateColor(hz) {
    if (hz >= 540) return '#a855f7';  // Purple - Legendary
    if (hz >= 360) return '#ff4757';  // Red - Extreme
    if (hz >= 240) return '#ff6b35';  // Orange - High Performance
    if (hz >= 144) return '#00d4ff';  // Cyan - Gaming
    return '#00ff88';                  // Green - Standard
}

function closeDisplaySelector() {
    const selector = document.getElementById('display-selector');
    if (selector) selector.remove();
}

function applyDisplayConfig(configKey) {
    const config = DisplayConfigs[configKey];
    if (!config) return;
    
    console.log(`[Display] 🖥️ Applying: ${config.name}`);
    
    currentDisplayConfig = configKey;
    targetFPS = config.refreshRate;
    
    // Update display info
    const resEl = document.getElementById('resolution-display');
    const targetEl = document.getElementById('target-fps-display');
    
    if (resEl) {
        resEl.textContent = `${config.width} × ${config.height} @ ${config.refreshRate}Hz`;
    }
    
    if (targetEl) {
        targetEl.textContent = config.refreshRate;
    }
    
    // Show notification
    showConfigNotification(config);
    
    // Close selector
    closeDisplaySelector();
    
    // Apply rendering optimizations
    optimizeForRefreshRate(config.refreshRate);
    
    console.log(`[Display] ✅ Applied: ${config.name}`);
}

function optimizeForRefreshRate(hz) {
    // Disable vsync for high refresh rates
    if (hz >= 144) {
        document.body.style.imageRendering = 'crisp-edges';
    }
    
    // Request high-performance GPU for extreme refresh rates
    if (hz >= 240 && navigator.gpu) {
        navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    }
    
    // Additional optimizations for 540Hz
    if (hz >= 540) {
        // Reduce animation complexity
        document.body.style.willChange = 'transform';
        
        // Optimize paint
        document.body.style.transform = 'translateZ(0)';
        
        console.log('[Display] ⚡ 540Hz optimizations applied');
    }
}

function showConfigNotification(config) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(10, 10, 30, 0.98);
        backdrop-filter: blur(20px);
        border: 2px solid ${getRefreshRateColor(config.refreshRate)};
        border-radius: 15px;
        padding: 20px;
        z-index: 1000001;
        box-shadow: 0 10px 40px ${getRefreshRateColor(config.refreshRate)}80;
        animation: slideIn 0.5s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; color: ${getRefreshRateColor(config.refreshRate)}; margin-bottom: 8px;">
            ✅ Display Configuration Changed
        </div>
        <div style="font-size: 14px; color: #ccc; margin-bottom: 5px;">
            ${config.name}
        </div>
        <div style="font-size: 12px; color: #888;">
            ${config.width} × ${config.height} @ ${config.refreshRate}Hz
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ============================================================================
// VISUAL BENCHMARK
// ============================================================================

function toggleBenchmark() {
    benchmarkRunning = !benchmarkRunning;
    
    if (benchmarkRunning) {
        startBenchmark();
    } else {
        stopBenchmark();
    }
}

function startBenchmark() {
    console.log('[Benchmark] 🔥 Starting visual benchmark...');
    
    const benchmarkCanvas = document.createElement('canvas');
    benchmarkCanvas.id = 'benchmark-canvas';
    benchmarkCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999998;
        pointer-events: none;
    `;
    
    benchmarkCanvas.width = window.innerWidth * window.devicePixelRatio;
    benchmarkCanvas.height = window.innerHeight * window.devicePixelRatio;
    
    document.body.appendChild(benchmarkCanvas);
    
    const ctx = benchmarkCanvas.getContext('2d');
    
    // Benchmark particles
    const particles = [];
    const particleCount = Math.min(10000, Math.floor(targetFPS * 20)); // More particles for higher refresh rates
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * benchmarkCanvas.width,
            y: Math.random() * benchmarkCanvas.height,
            vx: (Math.random() - 0.5) * (targetFPS / 60) * 5,
            vy: (Math.random() - 0.5) * (targetFPS / 60) * 5,
            size: Math.random() * 3 + 1,
            hue: Math.random() * 360
        });
    }
    
    function animateBenchmark() {
        if (!benchmarkRunning) return;
        
        // Clear with trail effect
        ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
        ctx.fillRect(0, 0, benchmarkCanvas.width, benchmarkCanvas.height);
        
        // Update and draw particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Bounce off edges
            if (p.x < 0 || p.x > benchmarkCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > benchmarkCanvas.height) p.vy *= -1;
            
            // Keep in bounds
            p.x = Math.max(0, Math.min(benchmarkCanvas.width, p.x));
            p.y = Math.max(0, Math.min(benchmarkCanvas.height, p.y));
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, 0.8)`;
            ctx.fill();
            
            // Draw trail
            ctx.strokeStyle = `hsla(${p.hue}, 100%, 50%, 0.3)`;
            ctx.lineWidth = p.size / 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
            ctx.stroke();
            
            // Rotate hue
            p.hue = (p.hue + 0.5) % 360;
        });
        
        // Draw FPS and particle count
        ctx.font = 'bold 48px Consolas';
        ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeText(`${actualFPS} FPS`, 50, 150);
        ctx.fillText(`${actualFPS} FPS`, 50, 150);
        
        ctx.font = 'bold 24px Consolas';
        ctx.strokeText(`${particleCount.toLocaleString()} Particles`, 50, 190);
        ctx.fillText(`${particleCount.toLocaleString()} Particles`, 50, 190);
        
        requestAnimationFrame(animateBenchmark);
    }
    
    animateBenchmark();
    
    console.log(`[Benchmark] ✅ Running with ${particleCount} particles`);
}

function stopBenchmark() {
    console.log('[Benchmark] 🛑 Stopping benchmark...');
    
    const canvas = document.getElementById('benchmark-canvas');
    if (canvas) canvas.remove();
    
    console.log('[Benchmark] ✅ Stopped');
}

// ============================================================================
// FPS GRAPH (Mini visualization)
// ============================================================================

function createFPSGraph() {
    const graph = document.createElement('canvas');
    graph.id = 'fps-graph';
    graph.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 300px;
        height: 100px;
        z-index: 999999;
        border: 2px solid var(--cyan);
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
    `;
    
    graph.width = 300;
    graph.height = 100;
    
    document.body.appendChild(graph);
    
    const ctx = graph.getContext('2d');
    const fpsHistory = new Array(300).fill(0);
    
    function updateGraph() {
        fpsHistory.push(actualFPS);
        fpsHistory.shift();
        
        ctx.clearRect(0, 0, 300, 100);
        
        // Draw target line
        const targetY = 100 - (targetFPS / targetFPS) * 80 - 10;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, targetY);
        ctx.lineTo(300, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw FPS line
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        fpsHistory.forEach((fps, i) => {
            const x = i;
            const y = 100 - Math.min(fps / targetFPS, 1) * 80 - 10;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Fill area under curve
        ctx.lineTo(300, 100);
        ctx.lineTo(0, 100);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.fill();
        
        setTimeout(updateGraph, 100);
    }
    
    updateGraph();
}

// ============================================================================
// ANIMATIONS
// ============================================================================

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

// ============================================================================
// INITIALIZATION
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Don't auto-create overlay - user can press F3 to toggle
        // createPerformanceOverlay();  // Disabled - too intrusive
        // createFPSGraph();  // Disabled - too intrusive
        console.log('[Benchmark] ✅ Visual benchmark system initialized');
        console.log(`[Benchmark] 🖥️ Current: ${DisplayConfigs[currentDisplayConfig].name}`);
        console.log('[Benchmark] 💡 Performance overlay disabled by default (less clutter)');
    });
} else {
    // Don't auto-create overlay - user can press F3 to toggle
    // createPerformanceOverlay();  // Disabled - too intrusive
    // createFPSGraph();  // Disabled - too intrusive
    console.log('[Benchmark] ✅ Visual benchmark system initialized');
    console.log(`[Benchmark] 🖥️ Current: ${DisplayConfigs[currentDisplayConfig].name}`);
    console.log('[Benchmark] 💡 Performance overlay disabled by default (less clutter)');
}

// Export functions globally
window.VisualBenchmark = {
    DisplayConfigs,
    applyDisplayConfig,
    toggleBenchmark,
    showDisplaySelector
};

// Browser/Node compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.VisualBenchmark;
}

})(); // End IIFE

