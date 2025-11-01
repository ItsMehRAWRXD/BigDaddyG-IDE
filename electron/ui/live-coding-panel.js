/**
 * BigDaddyG IDE - Live Coding Panel
 * Real-time coding display with context summary, expandable view, and action buttons
 */

class LiveCodingPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.sessions = new Map();
    this.activeSession = null;
    this.isExpanded = false;
    
    this.init();
  }
  
  init() {
    this.injectStyles();
    this.render();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="live-coding-panel ${this.isExpanded ? 'expanded' : ''}">
        <!-- Header -->
        <div class="lcp-header">
          <div class="lcp-title">
            <span class="lcp-icon">🤖</span>
            <span class="lcp-title-text">AI Coding in Progress</span>
            <span class="lcp-status" id="lcp-status">Idle</span>
          </div>
          <div class="lcp-controls">
            <button class="lcp-btn" id="lcp-expand" title="Expand/Collapse">
              ${this.isExpanded ? '⬇️' : '⬆️'}
            </button>
            <button class="lcp-btn" id="lcp-clear" title="Clear">🗑️</button>
          </div>
        </div>
        
        <!-- Context Summary (Always visible) -->
        <div class="lcp-summary" id="lcp-summary">
          <div class="lcp-summary-item">
            <span class="lcp-label">Task:</span>
            <span class="lcp-value" id="lcp-task">Waiting...</span>
          </div>
          <div class="lcp-summary-item">
            <span class="lcp-label">Step:</span>
            <span class="lcp-value" id="lcp-step">0/0</span>
          </div>
          <div class="lcp-summary-item">
            <span class="lcp-label">Files:</span>
            <span class="lcp-value" id="lcp-files">0 modified</span>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="lcp-progress-bar">
          <div class="lcp-progress-fill" id="lcp-progress" style="width: 0%"></div>
        </div>
        
        <!-- Code Display (Expandable) -->
        <div class="lcp-code-display" id="lcp-code-display" style="display: ${this.isExpanded ? 'block' : 'none'}">
          <div class="lcp-code-tabs" id="lcp-code-tabs"></div>
          <div class="lcp-code-content">
            <div class="lcp-code-header">
              <span class="lcp-code-lang" id="lcp-code-lang">javascript</span>
              <button class="lcp-btn-small" id="lcp-copy-code" title="Copy">📋 Copy</button>
            </div>
            <pre class="lcp-code-block" id="lcp-code-block"><code id="lcp-code">// Code will appear here...</code></pre>
          </div>
        </div>
        
        <!-- Action Buttons (Always visible when code is ready) -->
        <div class="lcp-actions" id="lcp-actions" style="display: none">
          <button class="lcp-action-btn lcp-accept" id="lcp-accept">
            <span class="lcp-btn-icon">✅</span>
            <span class="lcp-btn-text">Accept</span>
          </button>
          <button class="lcp-action-btn lcp-show-code" id="lcp-show-code">
            <span class="lcp-btn-icon">👁️</span>
            <span class="lcp-btn-text">Show Code</span>
          </button>
          <button class="lcp-action-btn lcp-copy" id="lcp-copy">
            <span class="lcp-btn-icon">📋</span>
            <span class="lcp-btn-text">Copy</span>
          </button>
          <button class="lcp-action-btn lcp-reject" id="lcp-reject">
            <span class="lcp-btn-icon">❌</span>
            <span class="lcp-btn-text">Reject</span>
          </button>
        </div>
        
        <!-- Live Log (Expandable) -->
        <div class="lcp-log" id="lcp-log" style="display: ${this.isExpanded ? 'block' : 'none'}">
          <div class="lcp-log-header">
            <span class="lcp-log-title">Activity Log</span>
            <button class="lcp-btn-small" id="lcp-clear-log">Clear</button>
          </div>
          <div class="lcp-log-content" id="lcp-log-content">
            <div class="lcp-log-entry lcp-log-info">
              <span class="lcp-log-time">${this.formatTime(new Date())}</span>
              <span class="lcp-log-msg">Ready for coding tasks</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    // Expand/Collapse
    document.getElementById('lcp-expand')?.addEventListener('click', () => {
      this.toggleExpand();
    });
    
    // Clear
    document.getElementById('lcp-clear')?.addEventListener('click', () => {
      this.clear();
    });
    
    // Copy code
    document.getElementById('lcp-copy-code')?.addEventListener('click', () => {
      this.copyCode();
    });
    
    document.getElementById('lcp-copy')?.addEventListener('click', () => {
      this.copyCode();
    });
    
    // Accept
    document.getElementById('lcp-accept')?.addEventListener('click', () => {
      this.acceptCode();
    });
    
    // Show Code
    document.getElementById('lcp-show-code')?.addEventListener('click', () => {
      if (!this.isExpanded) {
        this.toggleExpand();
      }
      document.getElementById('lcp-code-display')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Reject
    document.getElementById('lcp-reject')?.addEventListener('click', () => {
      this.rejectCode();
    });
    
    // Clear log
    document.getElementById('lcp-clear-log')?.addEventListener('click', () => {
      this.clearLog();
    });
  }
  
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    
    const panel = this.container.querySelector('.live-coding-panel');
    const codeDisplay = document.getElementById('lcp-code-display');
    const log = document.getElementById('lcp-log');
    const expandBtn = document.getElementById('lcp-expand');
    
    if (this.isExpanded) {
      panel?.classList.add('expanded');
      if (codeDisplay) codeDisplay.style.display = 'block';
      if (log) log.style.display = 'block';
      if (expandBtn) expandBtn.innerHTML = '⬇️';
    } else {
      panel?.classList.remove('expanded');
      if (codeDisplay) codeDisplay.style.display = 'none';
      if (log) log.style.display = 'none';
      if (expandBtn) expandBtn.innerHTML = '⬆️';
    }
  }
  
  startSession(task) {
    const sessionId = `session_${Date.now()}`;
    const session = {
      id: sessionId,
      task,
      startTime: Date.now(),
      files: [],
      code: '',
      language: 'javascript',
      status: 'running'
    };
    
    this.sessions.set(sessionId, session);
    this.activeSession = session;
    
    this.updateStatus('Running', 'running');
    this.updateSummary('Task', task);
    this.log('info', `Started: ${task}`);
    
    return sessionId;
  }
  
  updateProgress(current, total) {
    const percent = total > 0 ? (current / total) * 100 : 0;
    const progressBar = document.getElementById('lcp-progress');
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    
    this.updateSummary('Step', `${current}/${total}`);
  }
  
  updateCode(code, language = 'javascript', fileName = '') {
    if (!this.activeSession) return;
    
    this.activeSession.code = code;
    this.activeSession.language = language;
    
    const codeBlock = document.getElementById('lcp-code');
    const langLabel = document.getElementById('lcp-code-lang');
    
    if (codeBlock) {
      codeBlock.textContent = code;
      this.highlightCode(codeBlock, language);
    }
    
    if (langLabel) {
      langLabel.textContent = language;
    }
    
    // Update files count
    if (fileName && !this.activeSession.files.includes(fileName)) {
      this.activeSession.files.push(fileName);
      this.updateSummary('Files', `${this.activeSession.files.length} modified`);
    }
    
    // Show action buttons
    const actions = document.getElementById('lcp-actions');
    if (actions) actions.style.display = 'flex';
    
    this.log('success', `Generated code for ${fileName || 'file'}`);
  }
  
  updateStatus(text, type = 'info') {
    const status = document.getElementById('lcp-status');
    if (status) {
      status.textContent = text;
      status.className = 'lcp-status lcp-status-' + type;
    }
  }
  
  updateSummary(label, value) {
    const summaryMap = {
      'Task': 'lcp-task',
      'Step': 'lcp-step',
      'Files': 'lcp-files'
    };
    
    const elementId = summaryMap[label];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) element.textContent = value;
    }
  }
  
  log(type, message) {
    const logContent = document.getElementById('lcp-log-content');
    if (!logContent) return;
    
    const entry = document.createElement('div');
    entry.className = `lcp-log-entry lcp-log-${type}`;
    entry.innerHTML = `
      <span class="lcp-log-time">${this.formatTime(new Date())}</span>
      <span class="lcp-log-msg">${this.escapeHtml(message)}</span>
    `;
    
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    
    // Keep only last 100 entries
    while (logContent.children.length > 100) {
      logContent.removeChild(logContent.firstChild);
    }
  }
  
  copyCode() {
    if (!this.activeSession || !this.activeSession.code) {
      this.log('warning', 'No code to copy');
      return;
    }
    
    navigator.clipboard.writeText(this.activeSession.code).then(() => {
      this.log('success', 'Code copied to clipboard');
      
      // Visual feedback
      const btn = document.getElementById('lcp-copy-code');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => { btn.innerHTML = original; }, 2000);
      }
    }).catch(err => {
      this.log('error', 'Failed to copy code');
    });
  }
  
  acceptCode() {
    if (!this.activeSession) return;
    
    this.log('success', 'Code accepted');
    this.updateStatus('Accepted', 'success');
    
    // Emit event for parent to handle
    window.dispatchEvent(new CustomEvent('code-accepted', {
      detail: {
        sessionId: this.activeSession.id,
        code: this.activeSession.code,
        language: this.activeSession.language,
        files: this.activeSession.files
      }
    }));
    
    // Hide actions
    const actions = document.getElementById('lcp-actions');
    if (actions) actions.style.display = 'none';
  }
  
  rejectCode() {
    if (!this.activeSession) return;
    
    this.log('warning', 'Code rejected');
    this.updateStatus('Rejected', 'error');
    
    // Emit event
    window.dispatchEvent(new CustomEvent('code-rejected', {
      detail: { sessionId: this.activeSession.id }
    }));
    
    // Hide actions
    const actions = document.getElementById('lcp-actions');
    if (actions) actions.style.display = 'none';
    
    // Clear code
    this.activeSession.code = '';
    const codeBlock = document.getElementById('lcp-code');
    if (codeBlock) codeBlock.textContent = '// Code rejected';
  }
  
  clear() {
    this.activeSession = null;
    this.updateStatus('Idle', 'idle');
    this.updateSummary('Task', 'Waiting...');
    this.updateSummary('Step', '0/0');
    this.updateSummary('Files', '0 modified');
    this.updateProgress(0, 0);
    
    const codeBlock = document.getElementById('lcp-code');
    if (codeBlock) codeBlock.textContent = '// Code will appear here...';
    
    const actions = document.getElementById('lcp-actions');
    if (actions) actions.style.display = 'none';
    
    this.clearLog();
  }
  
  clearLog() {
    const logContent = document.getElementById('lcp-log-content');
    if (logContent) {
      logContent.innerHTML = `
        <div class="lcp-log-entry lcp-log-info">
          <span class="lcp-log-time">${this.formatTime(new Date())}</span>
          <span class="lcp-log-msg">Log cleared</span>
        </div>
      `;
    }
  }
  
  highlightCode(element, language) {
    // Simple syntax highlighting
    // In production, use Prism.js or similar
    element.className = `language-${language}`;
  }
  
  formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  injectStyles() {
    if (document.getElementById('live-coding-panel-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'live-coding-panel-styles';
    style.textContent = `
      .live-coding-panel {
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid var(--cyan);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        max-height: 200px;
      }
      
      .live-coding-panel.expanded {
        max-height: 90vh;
      }
      
      .lcp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        background: rgba(0, 255, 255, 0.1);
        border-bottom: 1px solid var(--cyan);
      }
      
      .lcp-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: bold;
        font-size: 14px;
      }
      
      .lcp-icon {
        font-size: 20px;
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .lcp-status {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .lcp-status-idle {
        background: rgba(128, 128, 128, 0.2);
        color: #888;
      }
      
      .lcp-status-running {
        background: rgba(0, 255, 255, 0.2);
        color: var(--cyan);
        animation: blink 1s ease-in-out infinite;
      }
      
      .lcp-status-success {
        background: rgba(0, 255, 0, 0.2);
        color: var(--green);
      }
      
      .lcp-status-error {
        background: rgba(255, 0, 0, 0.2);
        color: var(--red);
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .lcp-controls {
        display: flex;
        gap: 5px;
      }
      
      .lcp-btn {
        padding: 5px 10px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid var(--cyan);
        border-radius: 4px;
        color: var(--cyan);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .lcp-btn:hover {
        background: rgba(0, 255, 255, 0.2);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      }
      
      .lcp-summary {
        display: flex;
        justify-content: space-around;
        padding: 10px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .lcp-summary-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      
      .lcp-label {
        font-size: 10px;
        text-transform: uppercase;
        opacity: 0.7;
        color: var(--cyan);
      }
      
      .lcp-value {
        font-size: 13px;
        font-weight: bold;
        color: var(--green);
      }
      
      .lcp-progress-bar {
        height: 4px;
        background: rgba(0, 0, 0, 0.5);
        overflow: hidden;
      }
      
      .lcp-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--cyan), var(--green));
        transition: width 0.3s ease;
      }
      
      .lcp-code-display {
        display: flex;
        flex-direction: column;
        max-height: 60vh;
        overflow: hidden;
      }
      
      .lcp-code-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .lcp-code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .lcp-code-lang {
        font-size: 11px;
        text-transform: uppercase;
        color: var(--orange);
        font-weight: bold;
      }
      
      .lcp-btn-small {
        padding: 3px 8px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid var(--cyan);
        border-radius: 3px;
        color: var(--cyan);
        cursor: pointer;
        font-size: 11px;
        transition: all 0.2s;
      }
      
      .lcp-btn-small:hover {
        background: rgba(0, 255, 255, 0.2);
      }
      
      .lcp-code-block {
        flex: 1;
        margin: 0;
        padding: 15px;
        background: rgba(0, 0, 0, 0.7);
        overflow: auto;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
      }
      
      .lcp-code-block code {
        color: var(--green);
      }
      
      .lcp-actions {
        display: flex;
        gap: 10px;
        padding: 12px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-top: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .lcp-action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 15px;
        border: 2px solid;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 13px;
        transition: all 0.2s;
      }
      
      .lcp-accept {
        background: rgba(0, 255, 0, 0.1);
        border-color: var(--green);
        color: var(--green);
      }
      
      .lcp-accept:hover {
        background: rgba(0, 255, 0, 0.2);
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
      }
      
      .lcp-show-code {
        background: rgba(0, 255, 255, 0.1);
        border-color: var(--cyan);
        color: var(--cyan);
      }
      
      .lcp-show-code:hover {
        background: rgba(0, 255, 255, 0.2);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
      }
      
      .lcp-copy {
        background: rgba(255, 165, 0, 0.1);
        border-color: var(--orange);
        color: var(--orange);
      }
      
      .lcp-copy:hover {
        background: rgba(255, 165, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 165, 0, 0.4);
      }
      
      .lcp-reject {
        background: rgba(255, 0, 0, 0.1);
        border-color: var(--red);
        color: var(--red);
      }
      
      .lcp-reject:hover {
        background: rgba(255, 0, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
      }
      
      .lcp-log {
        max-height: 200px;
        display: flex;
        flex-direction: column;
        border-top: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .lcp-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .lcp-log-title {
        font-size: 11px;
        text-transform: uppercase;
        font-weight: bold;
        color: var(--cyan);
      }
      
      .lcp-log-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px 15px;
        background: rgba(0, 0, 0, 0.7);
      }
      
      .lcp-log-entry {
        display: flex;
        gap: 10px;
        padding: 4px 0;
        font-size: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .lcp-log-time {
        flex-shrink: 0;
        opacity: 0.5;
        font-size: 11px;
      }
      
      .lcp-log-msg {
        flex: 1;
      }
      
      .lcp-log-info .lcp-log-msg { color: var(--cyan); }
      .lcp-log-success .lcp-log-msg { color: var(--green); }
      .lcp-log-warning .lcp-log-msg { color: var(--orange); }
      .lcp-log-error .lcp-log-msg { color: var(--red); }
    `;
    
    document.head.appendChild(style);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveCodingPanel;
}

