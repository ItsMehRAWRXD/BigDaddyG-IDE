/**
 * BigDaddyG IDE - Swarm Visualizer
 * Real-time visualization of 200+ parallel mini-agents
 */

class SwarmVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.engine = null;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    
    this.init();
  }
  
  init() {
    this.injectStyles();
    this.render();
    this.setupCanvas();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="swarm-visualizer">
        <!-- Header -->
        <div class="swarm-header">
          <h2>🐝 Swarm Intelligence - 200 Mini-Agents</h2>
          <div class="swarm-stats" id="swarm-stats">
            <div class="stat">
              <span class="stat-label">Agents</span>
              <span class="stat-value" id="stat-agents">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Active</span>
              <span class="stat-value" id="stat-active">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Tasks Done</span>
              <span class="stat-value" id="stat-completed">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Parallelism</span>
              <span class="stat-value" id="stat-parallelism">16x</span>
            </div>
          </div>
        </div>
        
        <!-- Canvas Visualization -->
        <canvas id="swarm-canvas" class="swarm-canvas"></canvas>
        
        <!-- Controls -->
        <div class="swarm-controls">
          <button class="swarm-btn" id="init-swarm">
            🚀 Initialize 200 Agents
          </button>
          <button class="swarm-btn" id="run-task">
            ▶️ Execute Task
          </button>
          <button class="swarm-btn" id="stop-swarm">
            ⏹️ Stop
          </button>
          <button class="swarm-btn" id="shutdown-swarm">
            🔴 Shutdown
          </button>
        </div>
        
        <!-- Agent Distribution -->
        <div class="swarm-distribution">
          <h3>Agent Distribution</h3>
          <div class="distribution-grid" id="distribution-grid"></div>
        </div>
        
        <!-- Live Log -->
        <div class="swarm-log">
          <h3>Activity Log</h3>
          <div class="log-content" id="swarm-log-content">
            <div class="log-entry">Ready to initialize swarm...</div>
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  setupCanvas() {
    this.canvas = document.getElementById('swarm-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    
    // Start animation
    this.startAnimation();
  }
  
  attachEventListeners() {
    document.getElementById('init-swarm')?.addEventListener('click', () => {
      this.initializeSwarm();
    });
    
    document.getElementById('run-task')?.addEventListener('click', () => {
      this.executeTask();
    });
    
    document.getElementById('stop-swarm')?.addEventListener('click', () => {
      this.stopSwarm();
    });
    
    document.getElementById('shutdown-swarm')?.addEventListener('click', () => {
      this.shutdownSwarm();
    });
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
      }
    });
  }
  
  async initializeSwarm() {
    this.log('Initializing Swarm Engine...');
    
    this.engine = new SwarmEngine();
    
    // Set up callbacks
    this.engine.onCallback((event) => {
      this.handleSwarmEvent(event);
    });
    
    await this.engine.initSwarm(200);
    
    this.updateStats();
    this.updateDistribution();
  }
  
  async executeTask() {
    if (!this.engine) {
      alert('Please initialize swarm first!');
      return;
    }
    
    this.log('Executing parallel task...');
    
    const sampleCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

const result = fibonacci(10);
console.log(result);
    `.trim();
    
    const task = {
      code: sampleCode,
      description: 'Analyze and optimize code'
    };
    
    const result = await this.engine.executeSwarm(task, {
      parallelism: 16,
      minAgents: 50
    });
    
    this.log(`Task completed! ${result.successfulAgents}/${result.totalAgents} agents succeeded`);
    this.updateStats();
  }
  
  stopSwarm() {
    this.log('Swarm operations paused');
  }
  
  shutdownSwarm() {
    if (this.engine) {
      this.engine.shutdown();
      this.engine = null;
      this.log('Swarm shut down');
      this.updateStats();
    }
  }
  
  handleSwarmEvent(event) {
    const { event: type, data } = event;
    
    switch (type) {
      case 'swarm-ready':
        this.log(`✅ ${data.agentCount} agents initialized in ${data.elapsed}ms`);
        break;
      
      case 'batch-start':
        this.log(`🔄 Batch ${data.batch}/${data.totalBatches} - ${data.agents} agents`);
        break;
      
      case 'batch-complete':
        this.log(`✅ Progress: ${data.completed}/${data.total} tasks`);
        this.updateStats();
        break;
      
      case 'swarm-complete':
        this.log(`🎉 Swarm task completed in ${data.elapsed}ms using ${data.agentsUsed} agents (${data.parallelism}x parallelism)`);
        break;
    }
  }
  
  updateStats() {
    if (!this.engine) {
      document.getElementById('stat-agents').textContent = '0';
      document.getElementById('stat-active').textContent = '0';
      document.getElementById('stat-completed').textContent = '0';
      return;
    }
    
    const stats = this.engine.getSwarmStats();
    
    document.getElementById('stat-agents').textContent = stats.totalAgents;
    document.getElementById('stat-active').textContent = stats.activeAgents;
    document.getElementById('stat-completed').textContent = stats.completedTasks;
    document.getElementById('stat-parallelism').textContent = `${stats.cpuCores}x`;
  }
  
  updateDistribution() {
    if (!this.engine) return;
    
    const distribution = this.engine.getAgentDistribution();
    const grid = document.getElementById('distribution-grid');
    
    if (!grid) return;
    
    grid.innerHTML = Object.entries(distribution).map(([type, count]) => `
      <div class="distribution-item">
        <div class="dist-type">${type}</div>
        <div class="dist-count">${count}</div>
        <div class="dist-bar">
          <div class="dist-bar-fill" style="width: ${(count / 200) * 100}%"></div>
        </div>
      </div>
    `).join('');
  }
  
  startAnimation() {
    const animate = () => {
      this.drawSwarm();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }
  
  drawSwarm() {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);
    
    if (!this.engine || !this.engine.swarm.length) {
      // Show "waiting" state
      ctx.fillStyle = '#00ffff';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Initialize swarm to see visualization', width / 2, height / 2);
      return;
    }
    
    // Draw agents as particles
    const agents = this.engine.swarm;
    const gridSize = Math.ceil(Math.sqrt(agents.length));
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    agents.forEach((agent, i) => {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      
      // Agent color based on status
      const colors = {
        idle: '#00ff00',
        working: '#00ffff',
        done: '#ffff00',
        error: '#ff0000'
      };
      
      ctx.fillStyle = colors[agent.status] || '#888888';
      
      // Draw agent
      if (agent.status === 'working') {
        // Animated pulse for working agents
        const pulse = Math.sin(Date.now() / 200 + i) * 2 + 3;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
      
      // Draw connections for active agents
      if (agent.status === 'working' && i % 5 === 0) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(width / 2, height / 2);
        ctx.stroke();
      }
    });
    
    // Draw stats overlay
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Agents: ${agents.length}`, 10, 20);
    
    const active = agents.filter(a => a.status === 'working').length;
    ctx.fillText(`Active: ${active}`, 10, 40);
    
    const completed = this.engine.completedTasks;
    ctx.fillText(`Completed: ${completed}`, 10, 60);
  }
  
  log(message) {
    const logContent = document.getElementById('swarm-log-content');
    if (!logContent) return;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">${new Date().toLocaleTimeString()}</span>
      <span class="log-message">${message}</span>
    `;
    
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    
    // Keep only last 50 entries
    while (logContent.children.length > 50) {
      logContent.removeChild(logContent.firstChild);
    }
  }
  
  injectStyles() {
    if (document.getElementById('swarm-visualizer-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'swarm-visualizer-styles';
    style.textContent = `
      .swarm-visualizer {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: #000;
        color: var(--green);
      }
      
      .swarm-header {
        padding: 20px;
        background: rgba(0, 255, 255, 0.1);
        border-bottom: 2px solid var(--cyan);
      }
      
      .swarm-header h2 {
        margin: 0 0 15px 0;
        color: var(--cyan);
      }
      
      .swarm-stats {
        display: flex;
        gap: 30px;
      }
      
      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }
      
      .stat-label {
        font-size: 11px;
        text-transform: uppercase;
        opacity: 0.7;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--green);
      }
      
      .swarm-canvas {
        flex: 1;
        background: #000;
      }
      
      .swarm-controls {
        display: flex;
        gap: 10px;
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.7);
        border-top: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .swarm-btn {
        flex: 1;
        padding: 12px;
        background: rgba(0, 255, 0, 0.1);
        border: 2px solid var(--green);
        border-radius: 6px;
        color: var(--green);
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .swarm-btn:hover {
        background: rgba(0, 255, 0, 0.2);
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
      }
      
      .swarm-distribution {
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.7);
        border-top: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .swarm-distribution h3 {
        margin: 0 0 10px 0;
        color: var(--cyan);
        font-size: 14px;
      }
      
      .distribution-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
      }
      
      .distribution-item {
        padding: 8px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 4px;
      }
      
      .dist-type {
        font-weight: bold;
        font-size: 12px;
        color: var(--cyan);
        margin-bottom: 4px;
      }
      
      .dist-count {
        font-size: 18px;
        color: var(--green);
        margin-bottom: 6px;
      }
      
      .dist-bar {
        height: 6px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
        overflow: hidden;
      }
      
      .dist-bar-fill {
        height: 100%;
        background: var(--green);
        transition: width 0.3s;
      }
      
      .swarm-log {
        height: 150px;
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.7);
        border-top: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .swarm-log h3 {
        margin: 0 0 10px 0;
        color: var(--cyan);
        font-size: 14px;
      }
      
      .log-content {
        height: calc(100% - 30px);
        overflow-y: auto;
        font-size: 12px;
      }
      
      .log-entry {
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .log-time {
        opacity: 0.5;
        margin-right: 10px;
      }
      
      .log-message {
        color: var(--green);
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SwarmVisualizer;
}

