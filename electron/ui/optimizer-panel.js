/**
 * BigDaddyG IDE - Optimizer Control Panel
 * UI for real-time system optimization - NO MOCKS
 */

class OptimizerPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.optimizer = null;
    this.isScanning = false;
    
    this.init();
  }
  
  async init() {
    // Initialize real optimizer
    const SystemOptimizer = require('../system-optimizer');
    this.optimizer = new SystemOptimizer();
    
    this.injectStyles();
    this.render();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="optimizer-panel">
        <!-- Header -->
        <div class="opt-header">
          <h2>⚙️ System Optimizer</h2>
          <button class="opt-scan-btn" id="opt-scan">
            🔍 Scan System
          </button>
        </div>
        
        <!-- System Info -->
        <div class="opt-section" id="opt-system-info" style="display: none;">
          <h3>💻 Detected Hardware</h3>
          <div class="opt-grid" id="system-info-grid"></div>
        </div>
        
        <!-- Performance Score -->
        <div class="opt-section" id="opt-score-section" style="display: none;">
          <h3>📊 Performance Score</h3>
          <div class="opt-score-container">
            <div class="opt-score-circle" id="opt-score-circle">
              <div class="opt-score-value" id="opt-score-value">--</div>
              <div class="opt-score-label">/ 100</div>
            </div>
            <div class="opt-score-details" id="opt-score-details"></div>
          </div>
        </div>
        
        <!-- Settings Comparison -->
        <div class="opt-section" id="opt-comparison" style="display: none;">
          <h3>⚖️ Current vs Optimal</h3>
          <div class="opt-comparison-table" id="comparison-table"></div>
        </div>
        
        <!-- Tweak Settings -->
        <div class="opt-section" id="opt-tweaks" style="display: none;">
          <h3>🔧 Tweak Settings</h3>
          <div class="opt-tweaks-grid" id="tweaks-grid"></div>
        </div>
        
        <!-- Action Buttons -->
        <div class="opt-actions" id="opt-actions" style="display: none;">
          <button class="opt-btn opt-apply" id="opt-apply-optimal">
            ✅ Apply Optimal Settings
          </button>
          <button class="opt-btn opt-reset" id="opt-reset-optimal">
            🔄 Reset to Optimal
          </button>
          <button class="opt-btn opt-default" id="opt-reset-default">
            ↩️ Reset to Defaults
          </button>
          <button class="opt-btn opt-export" id="opt-export">
            📤 Export Report
          </button>
        </div>
        
        <!-- Status Log -->
        <div class="opt-log" id="opt-log">
          <div class="log-entry">Ready to scan system...</div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    document.getElementById('opt-scan')?.addEventListener('click', () => {
      this.scanSystem();
    });
    
    document.getElementById('opt-apply-optimal')?.addEventListener('click', () => {
      this.applyOptimal();
    });
    
    document.getElementById('opt-reset-optimal')?.addEventListener('click', () => {
      this.resetToOptimal();
    });
    
    document.getElementById('opt-reset-default')?.addEventListener('click', () => {
      this.resetToDefaults();
    });
    
    document.getElementById('opt-export')?.addEventListener('click', () => {
      this.exportReport();
    });
  }
  
  async scanSystem() {
    if (this.isScanning) return;
    
    this.isScanning = true;
    this.log('🔍 Scanning system hardware...');
    
    const scanBtn = document.getElementById('opt-scan');
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.textContent = '⏳ Scanning...';
    }
    
    try {
      const systemInfo = await this.optimizer.scanSystem();
      
      this.log(`✅ Scan complete in ${systemInfo.scanTime}ms`);
      this.log(`CPU: ${systemInfo.cpu.model}`);
      this.log(`Cores: ${systemInfo.cpu.physicalCores} cores / ${systemInfo.cpu.threads} threads`);
      this.log(`RAM: ${systemInfo.memory.totalGB}GB ${systemInfo.memory.type}`);
      this.log(`GPU: ${systemInfo.gpu.model}`);
      
      // Show results
      this.displaySystemInfo(systemInfo);
      this.displayPerformanceScore();
      this.displayComparison();
      this.displayTweakSettings();
      
      document.getElementById('opt-actions').style.display = 'flex';
      
    } catch (error) {
      this.log(`❌ Scan error: ${error.message}`);
    } finally {
      this.isScanning = false;
      if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.textContent = '🔍 Scan System';
      }
    }
  }
  
  displaySystemInfo(info) {
    const grid = document.getElementById('system-info-grid');
    if (!grid) return;
    
    grid.innerHTML = `
      <div class="info-card">
        <div class="info-icon">🖥️</div>
        <div class="info-content">
          <div class="info-label">CPU</div>
          <div class="info-value">${info.cpu.model}</div>
          <div class="info-detail">${info.cpu.physicalCores}C/${info.cpu.threads}T @ ${info.cpu.speed}MHz</div>
          ${info.cpu.cache.L3 ? `<div class="info-detail">L3 Cache: ${Math.round(info.cpu.cache.L3 / 1024)}MB</div>` : ''}
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-icon">💾</div>
        <div class="info-content">
          <div class="info-label">RAM</div>
          <div class="info-value">${info.memory.totalGB}GB ${info.memory.type}</div>
          <div class="info-detail">${info.memory.speed ? `${info.memory.speed}MHz` : ''}</div>
          <div class="info-detail">Usage: ${info.memory.usagePercent}%</div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-icon">🎮</div>
        <div class="info-content">
          <div class="info-label">GPU</div>
          <div class="info-value">${info.gpu.vendor}</div>
          <div class="info-detail">${info.gpu.model}</div>
          ${info.gpu.vram ? `<div class="info-detail">VRAM: ${Math.round(info.gpu.vram / (1024**3))}GB</div>` : ''}
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-icon">💿</div>
        <div class="info-content">
          <div class="info-label">Storage</div>
          <div class="info-value">${info.storage.drives.length} Drives</div>
          <div class="info-detail">Total: ${Math.round(info.storage.totalSpace / (1024**3))}GB</div>
          <div class="info-detail">Free: ${Math.round(info.storage.freeSpace / (1024**3))}GB</div>
        </div>
      </div>
    `;
    
    document.getElementById('opt-system-info').style.display = 'block';
  }
  
  displayPerformanceScore() {
    const score = this.optimizer.getPerformanceScore();
    
    const scoreValue = document.getElementById('opt-score-value');
    const scoreCircle = document.getElementById('opt-score-circle');
    const scoreDetails = document.getElementById('opt-score-details');
    
    if (scoreValue) scoreValue.textContent = score;
    
    // Color based on score
    if (scoreCircle) {
      if (score >= 90) {
        scoreCircle.style.borderColor = 'var(--green)';
      } else if (score >= 70) {
        scoreCircle.style.borderColor = 'var(--orange)';
      } else {
        scoreCircle.style.borderColor = 'var(--red)';
      }
    }
    
    // Show details
    if (scoreDetails) {
      const comparison = this.optimizer.compareSettings();
      const diffCount = comparison ? Object.keys(comparison).length : 0;
      
      scoreDetails.innerHTML = `
        <div class="score-detail">
          ${score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌'} 
          ${diffCount === 0 ? 'Optimally configured!' : `${diffCount} settings can be optimized`}
        </div>
      `;
    }
    
    document.getElementById('opt-score-section').style.display = 'block';
  }
  
  displayComparison() {
    const comparison = this.optimizer.compareSettings();
    const table = document.getElementById('comparison-table');
    
    if (!table) return;
    
    if (!comparison || Object.keys(comparison).length === 0) {
      table.innerHTML = '<div class="opt-perfect">✅ All settings are optimal!</div>';
    } else {
      table.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Setting</th>
              <th>Current</th>
              <th>Optimal</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(comparison).map(([key, diff]) => `
              <tr>
                <td class="setting-name">${this.formatSettingName(key)}</td>
                <td class="current-value">${this.formatValue(diff.current)}</td>
                <td class="optimal-value">${this.formatValue(diff.optimal)}</td>
                <td class="impact">${this.getImpact(key, diff)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    document.getElementById('opt-comparison').style.display = 'block';
  }
  
  displayTweakSettings() {
    const settings = this.optimizer.getCurrentSettings();
    const grid = document.getElementById('tweaks-grid');
    
    if (!grid || !settings) return;
    
    const tweakableSettings = [
      { key: 'workerThreads', label: 'Worker Threads', min: 1, max: 32, step: 1 },
      { key: 'maxWorkers', label: 'Max Workers', min: 1, max: 32, step: 1 },
      { key: 'swarmSize', label: 'Swarm Size', min: 10, max: 500, step: 10 },
      { key: 'parallelBatchSize', label: 'Parallel Batch Size', min: 1, max: 64, step: 1 },
      { key: 'nodeMaxOldSpace', label: 'Node Memory (MB)', min: 1024, max: 16384, step: 512 },
      { key: 'frameRateLimit', label: 'FPS Limit', min: 30, max: 240, step: 30 }
    ];
    
    grid.innerHTML = tweakableSettings.map(setting => `
      <div class="tweak-item">
        <label class="tweak-label">${setting.label}</label>
        <div class="tweak-control">
          <input 
            type="range" 
            id="tweak-${setting.key}"
            min="${setting.min}" 
            max="${setting.max}" 
            step="${setting.step}"
            value="${settings[setting.key] || setting.min}"
            class="tweak-slider"
          />
          <input 
            type="number" 
            id="tweak-${setting.key}-value"
            min="${setting.min}" 
            max="${setting.max}" 
            step="${setting.step}"
            value="${settings[setting.key] || setting.min}"
            class="tweak-number"
          />
        </div>
      </div>
    `).join('');
    
    // Add event listeners for tweaks
    tweakableSettings.forEach(setting => {
      const slider = document.getElementById(`tweak-${setting.key}`);
      const number = document.getElementById(`tweak-${setting.key}-value`);
      
      if (slider && number) {
        slider.addEventListener('input', (e) => {
          number.value = e.target.value;
          this.optimizer.tweakSetting(setting.key, parseInt(e.target.value));
          this.log(`✏️ ${setting.label} = ${e.target.value}`);
          this.displayPerformanceScore();
        });
        
        number.addEventListener('input', (e) => {
          slider.value = e.target.value;
          this.optimizer.tweakSetting(setting.key, parseInt(e.target.value));
          this.log(`✏️ ${setting.label} = ${e.target.value}`);
          this.displayPerformanceScore();
        });
      }
    });
    
    document.getElementById('opt-tweaks').style.display = 'block';
  }
  
  applyOptimal() {
    this.log('⚙️ Applying optimal settings...');
    const success = this.optimizer.applySettings();
    
    if (success) {
      this.log('✅ Optimal settings applied!');
      this.displayPerformanceScore();
      this.displayComparison();
    } else {
      this.log('❌ Failed to apply settings');
    }
  }
  
  resetToOptimal() {
    this.log('🔄 Resetting to optimal settings...');
    const success = this.optimizer.resetToOptimal();
    
    if (success) {
      this.log('✅ Reset to optimal complete!');
      this.displayTweakSettings();
      this.displayPerformanceScore();
      this.displayComparison();
    } else {
      this.log('❌ Failed to reset');
    }
  }
  
  resetToDefaults() {
    if (!confirm('Reset all settings to defaults?')) return;
    
    this.log('↩️ Resetting to default settings...');
    const success = this.optimizer.resetToDefaults();
    
    if (success) {
      this.log('✅ Reset to defaults complete!');
      this.displayTweakSettings();
      this.displayPerformanceScore();
      this.displayComparison();
    } else {
      this.log('❌ Failed to reset');
    }
  }
  
  exportReport() {
    const report = this.optimizer.generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bigdaddyg-optimization-report-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.log('📤 Report exported');
  }
  
  formatSettingName(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
  
  formatValue(value) {
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
  }
  
  getImpact(key, diff) {
    const impactMap = {
      workerThreads: '🚀 High',
      maxWorkers: '🚀 High',
      swarmSize: '⚡ Medium',
      parallelBatchSize: '⚡ Medium',
      nodeMaxOldSpace: '💾 High',
      frameRateLimit: '🎮 Medium'
    };
    
    return impactMap[key] || '📊 Low';
  }
  
  log(message) {
    const logDiv = document.getElementById('opt-log');
    if (!logDiv) return;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">${new Date().toLocaleTimeString()}</span>
      <span class="log-message">${message}</span>
    `;
    
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
    
    // Keep only last 50 entries
    while (logDiv.children.length > 50) {
      logDiv.removeChild(logDiv.firstChild);
    }
  }
  
  injectStyles() {
    if (document.getElementById('optimizer-panel-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'optimizer-panel-styles';
    style.textContent = `
      .optimizer-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        color: var(--green);
        overflow-y: auto;
      }
      
      .opt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: rgba(0, 255, 255, 0.1);
        border-bottom: 2px solid var(--cyan);
      }
      
      .opt-header h2 {
        margin: 0;
        color: var(--cyan);
      }
      
      .opt-scan-btn {
        padding: 12px 24px;
        background: var(--green);
        color: var(--void);
        border: none;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .opt-scan-btn:hover:not(:disabled) {
        background: var(--cyan);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      }
      
      .opt-scan-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .opt-section {
        padding: 20px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .opt-section h3 {
        margin: 0 0 15px 0;
        color: var(--cyan);
      }
      
      .opt-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }
      
      .info-card {
        display: flex;
        gap: 12px;
        padding: 15px;
        background: rgba(0, 255, 0, 0.05);
        border: 1px solid rgba(0, 255, 0, 0.3);
        border-radius: 8px;
      }
      
      .info-icon {
        font-size: 32px;
      }
      
      .info-label {
        font-size: 11px;
        text-transform: uppercase;
        opacity: 0.7;
        margin-bottom: 4px;
      }
      
      .info-value {
        font-size: 16px;
        font-weight: bold;
        color: var(--green);
        margin-bottom: 6px;
      }
      
      .info-detail {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 2px;
      }
      
      .opt-score-container {
        display: flex;
        gap: 30px;
        align-items: center;
      }
      
      .opt-score-circle {
        width: 150px;
        height: 150px;
        border: 8px solid var(--green);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: border-color 0.3s;
      }
      
      .opt-score-value {
        font-size: 48px;
        font-weight: bold;
        color: var(--green);
      }
      
      .opt-score-label {
        font-size: 14px;
        opacity: 0.7;
      }
      
      .opt-score-details {
        flex: 1;
      }
      
      .score-detail {
        font-size: 18px;
        color: var(--cyan);
      }
      
      .opt-comparison-table table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .opt-comparison-table th,
      .opt-comparison-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      }
      
      .opt-comparison-table th {
        background: rgba(0, 255, 255, 0.1);
        color: var(--cyan);
        font-weight: bold;
      }
      
      .setting-name {
        color: var(--cyan);
      }
      
      .current-value {
        color: var(--orange);
      }
      
      .optimal-value {
        color: var(--green);
        font-weight: bold;
      }
      
      .opt-perfect {
        text-align: center;
        padding: 40px;
        font-size: 24px;
        color: var(--green);
      }
      
      .opt-tweaks-grid {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .tweak-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(0, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .tweak-label {
        font-weight: bold;
        color: var(--cyan);
      }
      
      .tweak-control {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .tweak-slider {
        width: 200px;
      }
      
      .tweak-number {
        width: 80px;
        padding: 6px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid var(--cyan);
        border-radius: 4px;
        color: var(--green);
        text-align: center;
      }
      
      .opt-actions {
        display: flex;
        gap: 12px;
        padding: 20px;
        flex-wrap: wrap;
      }
      
      .opt-btn {
        flex: 1;
        min-width: 200px;
        padding: 15px 20px;
        border: 2px solid;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .opt-apply {
        background: rgba(0, 255, 0, 0.1);
        border-color: var(--green);
        color: var(--green);
      }
      
      .opt-apply:hover {
        background: rgba(0, 255, 0, 0.2);
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.4);
      }
      
      .opt-reset {
        background: rgba(0, 255, 255, 0.1);
        border-color: var(--cyan);
        color: var(--cyan);
      }
      
      .opt-reset:hover {
        background: rgba(0, 255, 255, 0.2);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
      }
      
      .opt-default {
        background: rgba(255, 165, 0, 0.1);
        border-color: var(--orange);
        color: var(--orange);
      }
      
      .opt-default:hover {
        background: rgba(255, 165, 0, 0.2);
        box-shadow: 0 0 20px rgba(255, 165, 0, 0.4);
      }
      
      .opt-export {
        background: rgba(255, 0, 255, 0.1);
        border-color: #ff00ff;
        color: #ff00ff;
      }
      
      .opt-export:hover {
        background: rgba(255, 0, 255, 0.2);
        box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
      }
      
      .opt-log {
        padding: 15px 20px;
        background: rgba(0, 0, 0, 0.7);
        border-top: 2px solid var(--cyan);
        max-height: 200px;
        overflow-y: auto;
      }
      
      .log-entry {
        padding: 6px 0;
        font-size: 13px;
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
  module.exports = OptimizerPanel;
}

