/**
 * BigDaddyG IDE - Cinematic Visualization Engine
 * Visualize orchestration mesh, agent cognition, and lifecycle endpoints
 * "Conducting a cognitive symphony in pixels..."
 */

(function() {
'use strict';

class CinematicVisualization {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.agents = [];
        this.connections = [];
        this.enabled = false;
        this.mode = 'orchestration'; // orchestration, lifecycle, cognition
        
        console.log('[CinematicViz] 🎬 Initializing cinematic visualization...');
    }
    
    async init() {
        // Create canvas overlay
        this.createCanvas();
        
        // Register hotkey (Ctrl+Shift+V for Visualization)
        this.registerHotkeys();
        
        // Start animation loop
        this.startAnimationLoop();
        
        console.log('[CinematicViz] ✅ Cinematic visualization ready (Ctrl+Shift+V)');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'cinematic-viz-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9998;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    registerHotkeys() {
        if (window.hotkeyManager) {
            window.hotkeyManager.register('cinematic-viz', 'Ctrl+Shift+V', () => {
                this.toggle();
            }, 'Toggle Cinematic Visualization');
        } else {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }
        
        // Cycle modes with 'M' when visualization is active
        document.addEventListener('keydown', (e) => {
            if (this.enabled && e.key === 'm') {
                this.cycleMode();
            }
        });
    }
    
    toggle() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            this.canvas.style.opacity = '1';
            this.spawnInitialParticles();
            this.showModeIndicator();
            console.log('[CinematicViz] 🎬 Visualization enabled');
        } else {
            this.canvas.style.opacity = '0';
            this.particles = [];
            this.agents = [];
            console.log('[CinematicViz] 🎬 Visualization disabled');
        }
    }
    
    cycleMode() {
        const modes = ['orchestration', 'lifecycle', 'cognition'];
        const currentIndex = modes.indexOf(this.mode);
        this.mode = modes[(currentIndex + 1) % modes.length];
        
        this.showModeIndicator();
        console.log(`[CinematicViz] 🎬 Mode: ${this.mode}`);
    }
    
    showModeIndicator() {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(119, 221, 190, 0.9), rgba(74, 144, 226, 0.9));
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            z-index: 20000;
            font-size: 14px;
            font-weight: 600;
            backdrop-filter: blur(10px);
            animation: slideInDown 0.3s ease-out;
        `;
        
        const modeNames = {
            orchestration: '🎭 Orchestration Mesh',
            lifecycle: '🔁 Lifecycle Endpoints',
            cognition: '🧠 Cognition Trails'
        };
        
        indicator.innerHTML = `
            ${modeNames[this.mode]}
            <div style="font-size: 10px; margin-top: 4px; opacity: 0.8;">
                Press 'M' to cycle modes | Ctrl+Shift+V to hide
            </div>
        `;
        
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 3000);
    }
    
    spawnInitialParticles() {
        // Clear existing
        this.particles = [];
        this.agents = [];
        this.connections = [];
        
        // Spawn particles based on mode
        if (this.mode === 'orchestration') {
            this.spawnOrchestrationMesh();
        } else if (this.mode === 'lifecycle') {
            this.spawnLifecycleEndpoints();
        } else if (this.mode === 'cognition') {
            this.spawnCognitionTrails();
        }
    }
    
    spawnOrchestrationMesh() {
        // Create agent nodes
        const agentCount = 8;
        
        for (let i = 0; i < agentCount; i++) {
            const angle = (i / agentCount) * Math.PI * 2;
            const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
            
            this.agents.push({
                x: this.canvas.width / 2 + Math.cos(angle) * radius,
                y: this.canvas.height / 2 + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 8 + Math.random() * 4,
                glow: Math.random(),
                color: `hsl(${165 + Math.random() * 20}, 70%, 60%)`, // Jade spectrum
                label: ['Scan', 'Analyze', 'Fix', 'Run', 'Learn', 'Optimize', 'Test', 'Deploy'][i],
                pulse: 0
            });
        }
        
        // Spawn firefly particles
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 1 + Math.random() * 2,
                alpha: Math.random(),
                color: Math.random() > 0.5 ? '#77ddbe' : '#4a90e2'
            });
        }
    }
    
    spawnLifecycleEndpoints() {
        // Create lifecycle visualization: /endcloud and /rebirth
        this.agents.push({
            x: this.canvas.width * 0.3,
            y: this.canvas.height / 2,
            vx: 0,
            vy: 0,
            radius: 30,
            glow: 1,
            color: '#ff6b6b',
            label: '/endcloud',
            pulse: 0,
            type: 'endpoint'
        });
        
        this.agents.push({
            x: this.canvas.width * 0.7,
            y: this.canvas.height / 2,
            vx: 0,
            vy: 0,
            radius: 30,
            glow: 1,
            color: '#77ddbe',
            label: '/rebirth',
            pulse: 0,
            type: 'endpoint'
        });
        
        // Flowing particles between endpoints
        for (let i = 0; i < 50; i++) {
            const t = i / 50;
            this.particles.push({
                x: this.canvas.width * (0.3 + t * 0.4),
                y: this.canvas.height / 2 + Math.sin(t * Math.PI * 4) * 50,
                vx: 2,
                vy: 0,
                size: 2 + Math.random(),
                alpha: 0.5 + Math.random() * 0.5,
                color: t < 0.5 ? '#ff6b6b' : '#77ddbe',
                flow: true
            });
        }
    }
    
    spawnCognitionTrails() {
        // Create thinking trails that follow mouse
        this.cognitionTrail = {
            points: [],
            maxLength: 100,
            mouseX: this.canvas.width / 2,
            mouseY: this.canvas.height / 2
        };
        
        // Track mouse for cognition trails
        document.addEventListener('mousemove', (e) => {
            if (this.enabled && this.mode === 'cognition') {
                this.cognitionTrail.mouseX = e.clientX;
                this.cognitionTrail.mouseY = e.clientY;
                
                this.cognitionTrail.points.push({
                    x: e.clientX,
                    y: e.clientY,
                    age: 0,
                    color: `hsl(${165 + Math.random() * 30}, 70%, 60%)`
                });
                
                if (this.cognitionTrail.points.length > this.cognitionTrail.maxLength) {
                    this.cognitionTrail.points.shift();
                }
            }
        });
        
        // Spawn thinking particles at mouse
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: 2 + Math.random() * 3,
                alpha: 0.8,
                color: '#77ddbe',
                lifetime: 200
            });
        }
    }
    
    startAnimationLoop() {
        const animate = () => {
            if (this.enabled) {
                this.render();
            }
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    render() {
        // Clear canvas with fade trail
        this.ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.mode === 'orchestration') {
            this.renderOrchestrationMesh();
        } else if (this.mode === 'lifecycle') {
            this.renderLifecycle();
        } else if (this.mode === 'cognition') {
            this.renderCognitionTrails();
        }
    }
    
    renderOrchestrationMesh() {
        // Draw connections between agents
        this.ctx.strokeStyle = 'rgba(119, 221, 190, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.agents.length; i++) {
            for (let j = i + 1; j < this.agents.length; j++) {
                const a1 = this.agents[i];
                const a2 = this.agents[j];
                
                const dist = Math.hypot(a2.x - a1.x, a2.y - a1.y);
                
                if (dist < 400) {
                    const alpha = 1 - (dist / 400);
                    this.ctx.strokeStyle = `rgba(119, 221, 190, ${alpha * 0.3})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(a1.x, a1.y);
                    this.ctx.lineTo(a2.x, a2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        // Update and draw agents
        this.agents.forEach(agent => {
            // Update position
            agent.x += agent.vx;
            agent.y += agent.vy;
            
            // Bounce off edges
            if (agent.x < 50 || agent.x > this.canvas.width - 50) agent.vx *= -1;
            if (agent.y < 50 || agent.y > this.canvas.height - 50) agent.vy *= -1;
            
            // Update pulse
            agent.pulse += 0.05;
            
            // Draw glow
            const gradient = this.ctx.createRadialGradient(
                agent.x, agent.y, 0,
                agent.x, agent.y, agent.radius * 3
            );
            gradient.addColorStop(0, agent.color + 'aa');
            gradient.addColorStop(0.5, agent.color + '44');
            gradient.addColorStop(1, agent.color + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(agent.x, agent.y, agent.radius * (2 + Math.sin(agent.pulse) * 0.5), 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw core
            this.ctx.fillStyle = agent.color;
            this.ctx.beginPath();
            this.ctx.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw label
            this.ctx.fillStyle = 'white';
            this.ctx.font = '10px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(agent.label, agent.x, agent.y - agent.radius - 8);
        });
        
        // Update and draw firefly particles
        this.particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha += (Math.random() - 0.5) * 0.1;
            p.alpha = Math.max(0.1, Math.min(1, p.alpha));
            
            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            // Draw particle
            this.ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderLifecycle() {
        // Draw lifecycle endpoints
        this.agents.forEach(agent => {
            agent.pulse += 0.05;
            
            // Draw large glow
            const gradient = this.ctx.createRadialGradient(
                agent.x, agent.y, 0,
                agent.x, agent.y, agent.radius * 5
            );
            gradient.addColorStop(0, agent.color + 'aa');
            gradient.addColorStop(0.5, agent.color + '33');
            gradient.addColorStop(1, agent.color + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(agent.x, agent.y, agent.radius * (4 + Math.sin(agent.pulse) * 1), 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw core
            this.ctx.fillStyle = agent.color;
            this.ctx.beginPath();
            this.ctx.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw label
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(agent.label, agent.x, agent.y + 5);
        });
        
        // Draw flowing particles
        this.particles.forEach((p, index) => {
            if (p.flow) {
                p.x += p.vx;
                
                // Reset when reaching right edge
                if (p.x > this.canvas.width * 0.7) {
                    p.x = this.canvas.width * 0.3;
                }
                
                // Draw with trail
                this.ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw connection arc
        this.ctx.strokeStyle = 'rgba(119, 221, 190, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.3, this.canvas.height / 2);
        this.ctx.quadraticCurveTo(
            this.canvas.width / 2, 
            this.canvas.height / 2 - 100,
            this.canvas.width * 0.7, 
            this.canvas.height / 2
        );
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    renderCognitionTrails() {
        if (!this.cognitionTrail) return;
        
        // Draw trail
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        
        for (let i = 1; i < this.cognitionTrail.points.length; i++) {
            const p1 = this.cognitionTrail.points[i - 1];
            const p2 = this.cognitionTrail.points[i];
            
            p1.age++;
            
            const alpha = 1 - (p1.age / this.cognitionTrail.maxLength);
            
            this.ctx.strokeStyle = p1.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
        }
        
        // Age out old points
        this.cognitionTrail.points = this.cognitionTrail.points.filter(p => p.age < this.cognitionTrail.maxLength);
        
        // Draw cursor glow
        const gradient = this.ctx.createRadialGradient(
            this.cognitionTrail.mouseX, this.cognitionTrail.mouseY, 0,
            this.cognitionTrail.mouseX, this.cognitionTrail.mouseY, 50
        );
        gradient.addColorStop(0, '#77ddbeaa');
        gradient.addColorStop(1, '#77ddbe00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.cognitionTrail.mouseX, this.cognitionTrail.mouseY, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Update thinking particles
        this.particles.forEach(p => {
            if (p.lifetime !== undefined) {
                p.lifetime--;
                
                if (p.lifetime <= 0) {
                    // Respawn at mouse
                    p.x = this.cognitionTrail.mouseX;
                    p.y = this.cognitionTrail.mouseY;
                    p.vx = (Math.random() - 0.5) * 3;
                    p.vy = (Math.random() - 0.5) * 3;
                    p.lifetime = 100 + Math.random() * 100;
                }
            }
            
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            // Draw
            const alpha = p.lifetime / 200;
            this.ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize
window.cinematicViz = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cinematicViz = new CinematicVisualization();
        window.cinematicViz.init();
    });
} else {
    window.cinematicViz = new CinematicVisualization();
    window.cinematicViz.init();
}

// Export
window.CinematicVisualization = CinematicVisualization;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CinematicVisualization;
}

console.log('[CinematicViz] 📦 Cinematic visualization module loaded');

})(); // End IIFE

