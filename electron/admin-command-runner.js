/**
 * BigDaddyG IDE - Admin Command Runner
 * Run commands with elevated privileges (Administrator/sudo)
 * 
 * Features:
 * - Toggle "Run as Administrator" for individual commands
 * - Persistent admin mode for terminal sessions
 * - UAC/sudo prompt handling
 * - Visual indicator for admin status
 * - Command history with privilege levels
 * - Security warnings for dangerous operations
 */

class AdminCommandRunner {
  constructor() {
    this.adminMode = false;
    this.commandHistory = [];
    this.dangerousCommands = [
      'rm -rf', 'del /f /s /q', 'format', 'mkfs',
      'dd if=', 'fdisk', 'parted', 'diskpart',
      'reg delete', 'regedit', 'shutdown', 'reboot'
    ];
    
    this.init();
  }
  
  init() {
    console.log('[AdminRunner] Initializing admin command runner...');
    
    // Check if already running as admin
    this.checkAdminStatus();
    
    // Set up UI
    this.injectUI();
    this.setupEventListeners();
    
    console.log('[AdminRunner] Admin command runner ready');
  }
  
  async checkAdminStatus() {
    try {
      this.isElevated = await window.electronAPI.isElevated();
      this.updateAdminIndicator();
      
      if (this.isElevated) {
        console.log('[AdminRunner] ⚠️ Already running with elevated privileges');
      }
    } catch (error) {
      console.error('[AdminRunner] Error checking admin status:', error);
      this.isElevated = false;
    }
  }
  
  injectUI() {
    // Find terminal container
    const terminalContainer = document.querySelector('.terminal-container') || 
                             document.querySelector('#terminal') ||
                             document.querySelector('.bottom-panel');
    
    if (!terminalContainer) {
      console.warn('[AdminRunner] Terminal container not found');
      return;
    }
    
    // Add admin controls
    const adminControls = document.createElement('div');
    adminControls.id = 'admin-controls';
    adminControls.innerHTML = `
      <div class="admin-toolbar">
        <div class="admin-indicator" id="admin-indicator">
          <span class="admin-icon" id="admin-icon">👤</span>
          <span class="admin-text" id="admin-text">User Mode</span>
        </div>
        
        <div class="admin-toggle">
          <label class="admin-toggle-label">
            <input type="checkbox" id="admin-mode-toggle" ${this.adminMode ? 'checked' : ''} />
            <span class="admin-toggle-text">Run as Administrator</span>
          </label>
          
          <button class="admin-request-btn" id="admin-request-btn" title="Restart IDE with admin privileges">
            🔓 Request Admin
          </button>
        </div>
        
        <div class="admin-warning" id="admin-warning" style="display: none;">
          ⚠️ Admin mode enabled - Be careful with commands!
        </div>
      </div>
    `;
    
    // Insert at the top of terminal container
    terminalContainer.insertBefore(adminControls, terminalContainer.firstChild);
    
    // Add styles
    this.injectStyles();
  }
  
  setupEventListeners() {
    // Admin mode toggle
    document.getElementById('admin-mode-toggle')?.addEventListener('change', (e) => {
      this.setAdminMode(e.target.checked);
    });
    
    // Request admin button
    document.getElementById('admin-request-btn')?.addEventListener('click', () => {
      this.requestElevation();
    });
    
    // Intercept command execution
    this.interceptCommandExecution();
  }
  
  interceptCommandExecution() {
    // Find existing command execution functions and wrap them
    const originalExecute = window.executeCommand;
    
    window.executeCommand = async (command, options = {}) => {
      // Check if admin mode is enabled
      const useAdmin = this.adminMode || options.admin;
      
      // Warn about dangerous commands
      if (this.isDangerousCommand(command)) {
        const confirmed = await this.showDangerousCommandWarning(command);
        if (!confirmed) {
          return { error: 'Command cancelled by user', cancelled: true };
        }
      }
      
      // Log command with privilege level
      this.addToHistory(command, useAdmin);
      
      // Execute with appropriate privileges
      if (useAdmin) {
        return this.executeAsAdmin(command, options);
      } else {
        return originalExecute ? originalExecute(command, options) : this.executeNormal(command, options);
      }
    };
    
    // Also intercept PowerShell/terminal input
    const terminalInput = document.querySelector('#terminal-input') || 
                         document.querySelector('.terminal-input');
    
    if (terminalInput) {
      terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const command = terminalInput.value.trim();
          if (command) {
            e.preventDefault();
            window.executeCommand(command);
            terminalInput.value = '';
          }
        }
      });
    }
  }
  
  async executeAsAdmin(command, options = {}) {
    try {
      console.log(`[AdminRunner] Executing as admin: ${command}`);
      
      const result = await window.electronAPI.executeElevated(command, {
        shell: options.shell || 'powershell',
        cwd: options.cwd,
        timeout: options.timeout || 30000
      });
      
      return result;
    } catch (error) {
      console.error('[AdminRunner] Admin execution error:', error);
      return { error: error.message, exitCode: 1 };
    }
  }
  
  async executeNormal(command, options = {}) {
    try {
      console.log(`[AdminRunner] Executing as user: ${command}`);
      
      const result = await window.electronAPI.execute(command, {
        shell: options.shell || 'powershell',
        cwd: options.cwd,
        timeout: options.timeout || 30000
      });
      
      return result;
    } catch (error) {
      console.error('[AdminRunner] Execution error:', error);
      return { error: error.message, exitCode: 1 };
    }
  }
  
  setAdminMode(enabled) {
    this.adminMode = enabled;
    
    // Update UI
    document.getElementById('admin-mode-toggle').checked = enabled;
    document.getElementById('admin-warning').style.display = enabled ? 'block' : 'none';
    
    // Update terminal prompt
    this.updateTerminalPrompt();
    
    console.log(`[AdminRunner] Admin mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  async requestElevation() {
    try {
      const confirmed = confirm(
        'This will restart BigDaddyG IDE with administrator privileges.\n\n' +
        'You will see a UAC prompt. Continue?'
      );
      
      if (!confirmed) return;
      
      // Request restart with elevation
      await window.electronAPI.restartAsAdmin();
      
    } catch (error) {
      console.error('[AdminRunner] Elevation request error:', error);
      alert(`Failed to request elevation:\n${error.message}`);
    }
  }
  
  updateAdminIndicator() {
    const icon = document.getElementById('admin-icon');
    const text = document.getElementById('admin-text');
    const indicator = document.getElementById('admin-indicator');
    
    if (this.isElevated) {
      icon.textContent = '👑';
      text.textContent = 'Administrator';
      indicator.classList.add('admin-elevated');
    } else {
      icon.textContent = '👤';
      text.textContent = 'User Mode';
      indicator.classList.remove('admin-elevated');
    }
  }
  
  updateTerminalPrompt() {
    // Update terminal prompt to show admin status
    const promptPrefix = this.adminMode ? '⚡ ADMIN' : '>';
    
    // This would be implemented based on the terminal's specific API
    if (window.terminal && window.terminal.setPrompt) {
      window.terminal.setPrompt(`${promptPrefix} `);
    }
  }
  
  isDangerousCommand(command) {
    return this.dangerousCommands.some(dangerous => 
      command.toLowerCase().includes(dangerous.toLowerCase())
    );
  }
  
  async showDangerousCommandWarning(command) {
    return confirm(
      '⚠️ DANGEROUS COMMAND DETECTED ⚠️\n\n' +
      `Command: ${command}\n\n` +
      'This command could cause data loss or system damage.\n\n' +
      'Are you sure you want to execute it?'
    );
  }
  
  addToHistory(command, wasAdmin) {
    this.commandHistory.push({
      command,
      wasAdmin,
      timestamp: Date.now(),
      elevated: this.isElevated
    });
    
    // Keep only last 1000 commands
    if (this.commandHistory.length > 1000) {
      this.commandHistory.shift();
    }
  }
  
  getHistory() {
    return this.commandHistory;
  }
  
  clearHistory() {
    this.commandHistory = [];
  }
  
  injectStyles() {
    if (document.getElementById('admin-runner-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'admin-runner-styles';
    style.textContent = `
      #admin-controls {
        border-bottom: 2px solid rgba(255, 165, 0, 0.3);
        background: rgba(0, 0, 0, 0.5);
      }
      
      .admin-toolbar {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 10px;
        flex-wrap: wrap;
      }
      
      .admin-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        font-size: 13px;
        font-weight: bold;
      }
      
      .admin-indicator.admin-elevated {
        background: rgba(255, 215, 0, 0.2);
        border-color: rgba(255, 215, 0, 0.5);
        color: #ffd700;
        animation: admin-glow 2s ease-in-out infinite;
      }
      
      @keyframes admin-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
        50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
      }
      
      .admin-icon {
        font-size: 16px;
      }
      
      .admin-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .admin-toggle-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
      }
      
      .admin-toggle-label input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
      
      .admin-toggle-text {
        font-size: 13px;
        font-weight: 500;
      }
      
      .admin-request-btn {
        padding: 6px 12px;
        background: rgba(255, 165, 0, 0.2);
        color: var(--orange);
        border: 1px solid var(--orange);
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .admin-request-btn:hover {
        background: rgba(255, 165, 0, 0.3);
        box-shadow: 0 0 10px rgba(255, 165, 0, 0.4);
      }
      
      .admin-warning {
        flex: 1;
        padding: 6px 12px;
        background: rgba(255, 165, 0, 0.1);
        border: 1px solid rgba(255, 165, 0, 0.3);
        border-radius: 6px;
        color: var(--orange);
        font-size: 12px;
        font-weight: bold;
        animation: warning-pulse 2s ease-in-out infinite;
      }
      
      @keyframes warning-pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.adminRunner = new AdminCommandRunner();
  });
} else {
  window.adminRunner = new AdminCommandRunner();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminCommandRunner;
}

