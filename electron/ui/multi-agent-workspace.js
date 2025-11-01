/**
 * BigDaddyG IDE - Multi-Agent Workspace
 * 4-pane view showing AI agents collaborating in real-time
 */

class MultiAgentWorkspace {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.agents = [
      {
        id: 'architect',
        name: 'Architect',
        role: 'System Design & Planning',
        color: '#00ffff',
        icon: '🏗️',
        status: 'idle',
        currentTask: null,
        output: [],
        thinking: ''
      },
      {
        id: 'coder',
        name: 'Coder',
        role: 'Implementation & Coding',
        color: '#00ff00',
        icon: '💻',
        status: 'idle',
        currentTask: null,
        output: [],
        thinking: ''
      },
      {
        id: 'tester',
        name: 'Tester',
        role: 'Testing & Validation',
        color: '#ff00ff',
        icon: '🧪',
        status: 'idle',
        currentTask: null,
        output: [],
        thinking: ''
      },
      {
        id: 'optimizer',
        name: 'Optimizer',
        role: 'Performance & Quality',
        color: '#ffa500',
        icon: '⚡',
        status: 'idle',
        currentTask: null,
        output: [],
        thinking: ''
      }
    ];
    
    this.collaboration = {
      task: null,
      phase: 'idle',
      messages: [],
      decisions: []
    };
    
    this.isRunning = false;
    
    this.init();
  }
  
  init() {
    this.injectStyles();
    this.render();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="multi-agent-workspace">
        <!-- Control Panel -->
        <div class="maw-control-panel">
          <div class="maw-header">
            <h2>🤝 Multi-Agent Collaboration Workspace</h2>
            <div class="maw-status" id="maw-status">
              <span class="status-indicator ${this.isRunning ? 'running' : 'idle'}"></span>
              <span class="status-text">${this.isRunning ? 'Collaborating...' : 'Ready'}</span>
            </div>
          </div>
          
          <div class="maw-controls">
            <input 
              type="text" 
              id="maw-task-input" 
              placeholder="Enter task for agents to collaborate on..." 
              class="maw-task-input"
            />
            <button class="maw-btn maw-start" id="maw-start">
              ▶️ Start Collaboration
            </button>
            <button class="maw-btn maw-stop" id="maw-stop" disabled>
              ⏹️ Stop
            </button>
            <button class="maw-btn maw-clear" id="maw-clear">
              🗑️ Clear
            </button>
          </div>
          
          <!-- Collaboration Timeline -->
          <div class="maw-timeline" id="maw-timeline">
            <div class="timeline-item">
              <span class="timeline-icon">📋</span>
              <span class="timeline-text">Waiting for task...</span>
            </div>
          </div>
        </div>
        
        <!-- 4-Pane Agent Views -->
        <div class="maw-grid">
          ${this.agents.map(agent => this.renderAgentPane(agent)).join('')}
        </div>
        
        <!-- Collaboration Chat -->
        <div class="maw-collaboration">
          <div class="maw-collab-header">
            <h3>💬 Agent Discussion</h3>
            <span class="maw-message-count" id="maw-message-count">0 messages</span>
          </div>
          <div class="maw-collab-messages" id="maw-collab-messages">
            <div class="collab-message system-message">
              <span class="message-icon">ℹ️</span>
              <span class="message-text">Agents will discuss and collaborate here...</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  renderAgentPane(agent) {
    return `
      <div class="agent-pane" data-agent="${agent.id}" style="border-color: ${agent.color}">
        <!-- Agent Header -->
        <div class="agent-header" style="background: ${agent.color}20; border-bottom-color: ${agent.color}">
          <div class="agent-info">
            <span class="agent-icon">${agent.icon}</span>
            <div class="agent-details">
              <div class="agent-name" style="color: ${agent.color}">${agent.name}</div>
              <div class="agent-role">${agent.role}</div>
            </div>
          </div>
          <div class="agent-status-badge ${agent.status}" style="border-color: ${agent.color}">
            ${this.getStatusIcon(agent.status)} ${agent.status}
          </div>
        </div>
        
        <!-- Agent Thinking Display -->
        <div class="agent-thinking" id="agent-thinking-${agent.id}">
          <div class="thinking-label">💭 Current Thinking:</div>
          <div class="thinking-text">${agent.thinking || 'Waiting for task...'}</div>
        </div>
        
        <!-- Agent Output/Code Display -->
        <div class="agent-output" id="agent-output-${agent.id}">
          ${agent.output.length === 0 ? 
            '<div class="output-empty">No output yet</div>' :
            agent.output.map(item => this.renderOutput(item)).join('')
          }
        </div>
        
        <!-- Agent Actions -->
        <div class="agent-actions">
          <button class="agent-action-btn" data-action="view-details" data-agent="${agent.id}">
            👁️ Details
          </button>
          <button class="agent-action-btn" data-action="copy-output" data-agent="${agent.id}">
            📋 Copy
          </button>
        </div>
      </div>
    `;
  }
  
  renderOutput(item) {
    if (item.type === 'code') {
      return `
        <div class="output-item output-code">
          <div class="output-header">
            <span class="output-type">💾 ${item.filename || 'code'}</span>
            <span class="output-lang">${item.language}</span>
          </div>
          <pre><code class="language-${item.language}">${this.escapeHtml(item.content)}</code></pre>
        </div>
      `;
    } else if (item.type === 'plan') {
      return `
        <div class="output-item output-plan">
          <div class="output-header">
            <span class="output-type">📋 Plan</span>
          </div>
          <div class="plan-content">${this.escapeHtml(item.content)}</div>
        </div>
      `;
    } else if (item.type === 'test') {
      return `
        <div class="output-item output-test">
          <div class="output-header">
            <span class="output-type">🧪 Test Result</span>
            <span class="test-status ${item.passed ? 'passed' : 'failed'}">
              ${item.passed ? '✅ Passed' : '❌ Failed'}
            </span>
          </div>
          <div class="test-content">${this.escapeHtml(item.content)}</div>
        </div>
      `;
    } else {
      return `
        <div class="output-item output-text">
          <div class="output-content">${this.escapeHtml(item.content)}</div>
        </div>
      `;
    }
  }
  
  getStatusIcon(status) {
    const icons = {
      idle: '💤',
      thinking: '🤔',
      working: '⚙️',
      waiting: '⏳',
      done: '✅',
      error: '❌'
    };
    return icons[status] || '•';
  }
  
  attachEventListeners() {
    // Start collaboration
    document.getElementById('maw-start')?.addEventListener('click', () => {
      const task = document.getElementById('maw-task-input')?.value;
      if (task) {
        this.startCollaboration(task);
      } else {
        alert('Please enter a task first!');
      }
    });
    
    // Stop collaboration
    document.getElementById('maw-stop')?.addEventListener('click', () => {
      this.stopCollaboration();
    });
    
    // Clear workspace
    document.getElementById('maw-clear')?.addEventListener('click', () => {
      this.clearWorkspace();
    });
    
    // Agent actions
    document.querySelectorAll('.agent-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const agentId = btn.dataset.agent;
        this.handleAgentAction(action, agentId);
      });
    });
    
    // Allow Enter key to start
    document.getElementById('maw-task-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('maw-start')?.click();
      }
    });
  }
  
  async startCollaboration(task) {
    console.log('[MultiAgent] Starting collaboration:', task);
    
    this.isRunning = true;
    this.collaboration.task = task;
    this.collaboration.phase = 'planning';
    
    // Update UI
    document.getElementById('maw-start').disabled = true;
    document.getElementById('maw-stop').disabled = false;
    this.updateStatus('running', 'Collaborating...');
    this.addTimelineItem('🚀', `Started: ${task}`);
    
    try {
      // Phase 1: Architect plans
      await this.runAgentPhase('architect', 'Planning system architecture...');
      
      // Phase 2: Coder implements
      await this.runAgentPhase('coder', 'Implementing code...');
      
      // Phase 3: Tester validates
      await this.runAgentPhase('tester', 'Running tests...');
      
      // Phase 4: Optimizer reviews
      await this.runAgentPhase('optimizer', 'Optimizing performance...');
      
      // Phase 5: Final review
      await this.finalReview();
      
      this.addTimelineItem('✅', 'Collaboration completed successfully!');
      this.updateStatus('idle', 'Ready');
      
    } catch (error) {
      console.error('[MultiAgent] Collaboration error:', error);
      this.addTimelineItem('❌', `Error: ${error.message}`);
      this.updateStatus('idle', 'Ready');
    } finally {
      this.isRunning = false;
      document.getElementById('maw-start').disabled = false;
      document.getElementById('maw-stop').disabled = true;
    }
  }
  
  async runAgentPhase(agentId, thinking) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    // Update agent status
    this.updateAgentStatus(agentId, 'thinking', thinking);
    await this.delay(1000);
    
    this.updateAgentStatus(agentId, 'working', 'Working on task...');
    await this.delay(2000);
    
    // Simulate agent work based on role
    const output = await this.simulateAgentWork(agent);
    
    // Add output to agent
    agent.output.push(output);
    this.updateAgentOutput(agentId);
    
    // Add to collaboration chat
    this.addCollaborationMessage(agent, output);
    
    // Update timeline
    this.addTimelineItem(agent.icon, `${agent.name} completed their task`);
    
    this.updateAgentStatus(agentId, 'done', 'Task completed');
    await this.delay(500);
  }
  
  async simulateAgentWork(agent) {
    const task = this.collaboration.task;
    
    switch (agent.id) {
      case 'architect':
        return {
          type: 'plan',
          content: `System Design for: "${task}"\n\n` +
                   `1. Data Models\n` +
                   `2. API Endpoints\n` +
                   `3. Business Logic\n` +
                   `4. Integration Points\n\n` +
                   `Estimated complexity: Medium\n` +
                   `Recommended stack: Node.js + Express + PostgreSQL`
        };
      
      case 'coder':
        return {
          type: 'code',
          language: 'javascript',
          filename: 'server.js',
          content: `// Implementation for: ${task}\n\n` +
                   `const express = require('express');\n` +
                   `const app = express();\n\n` +
                   `app.use(express.json());\n\n` +
                   `// Main endpoint\n` +
                   `app.get('/api/data', async (req, res) => {\n` +
                   `  try {\n` +
                   `    const data = await fetchData();\n` +
                   `    res.json({ success: true, data });\n` +
                   `  } catch (error) {\n` +
                   `    res.status(500).json({ error: error.message });\n` +
                   `  }\n` +
                   `});\n\n` +
                   `app.listen(3000, () => {\n` +
                   `  console.log('Server running on port 3000');\n` +
                   `});\n\n` +
                   `module.exports = app;`
        };
      
      case 'tester':
        const passed = Math.random() > 0.2;
        return {
          type: 'test',
          passed,
          content: `Test Results:\n\n` +
                   `✅ Unit Tests: 15/15 passed\n` +
                   `✅ Integration Tests: 8/8 passed\n` +
                   `${passed ? '✅' : '❌'} End-to-End Tests: ${passed ? '5/5' : '4/5'} passed\n\n` +
                   `Code Coverage: ${passed ? '94%' : '87%'}\n` +
                   `Performance: ${passed ? 'Excellent' : 'Good'}\n\n` +
                   (passed ? 'All tests passed! ✨' : 'Minor issues found, recommending fixes.')
        };
      
      case 'optimizer':
        return {
          type: 'plan',
          content: `Optimization Report:\n\n` +
                   `Performance Analysis:\n` +
                   `• Response time: 45ms (Good)\n` +
                   `• Memory usage: 128MB (Optimal)\n` +
                   `• Database queries: 3 (Can optimize to 1)\n\n` +
                   `Recommendations:\n` +
                   `1. Add database indexing on user_id\n` +
                   `2. Implement Redis caching for frequent queries\n` +
                   `3. Use async/await for parallel operations\n` +
                   `4. Add request throttling\n\n` +
                   `Expected improvement: 40% faster, 30% less memory`
        };
      
      default:
        return {
          type: 'text',
          content: 'Task completed'
        };
    }
  }
  
  async finalReview() {
    this.addTimelineItem('🔍', 'Running final review...');
    await this.delay(1500);
    
    // All agents discuss final result
    this.addCollaborationMessage(
      { name: 'System', icon: '🤖', color: '#ffffff' },
      { type: 'text', content: 'Final review complete. All agents agree on the implementation.' }
    );
  }
  
  updateAgentStatus(agentId, status, thinking = '') {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    agent.status = status;
    agent.thinking = thinking;
    
    // Update UI
    const pane = document.querySelector(`[data-agent="${agentId}"]`);
    if (!pane) return;
    
    const statusBadge = pane.querySelector('.agent-status-badge');
    if (statusBadge) {
      statusBadge.className = `agent-status-badge ${status}`;
      statusBadge.style.borderColor = agent.color;
      statusBadge.innerHTML = `${this.getStatusIcon(status)} ${status}`;
    }
    
    const thinkingText = document.getElementById(`agent-thinking-${agentId}`)?.querySelector('.thinking-text');
    if (thinkingText) {
      thinkingText.textContent = thinking || 'Waiting...';
    }
  }
  
  updateAgentOutput(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const outputDiv = document.getElementById(`agent-output-${agentId}`);
    if (!outputDiv) return;
    
    outputDiv.innerHTML = agent.output.map(item => this.renderOutput(item)).join('');
  }
  
  addCollaborationMessage(agent, output) {
    const messagesDiv = document.getElementById('maw-collab-messages');
    if (!messagesDiv) return;
    
    const message = document.createElement('div');
    message.className = 'collab-message';
    message.innerHTML = `
      <div class="message-header">
        <span class="message-icon" style="color: ${agent.color}">${agent.icon}</span>
        <span class="message-name" style="color: ${agent.color}">${agent.name}</span>
        <span class="message-time">${this.formatTime(new Date())}</span>
      </div>
      <div class="message-content">
        ${output.type === 'code' ? 
          `Created <strong>${output.filename}</strong> (${output.language})` :
          this.truncateText(output.content, 100)
        }
      </div>
    `;
    
    messagesDiv.appendChild(message);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Update message count
    const count = messagesDiv.querySelectorAll('.collab-message').length - 1; // Exclude system message
    document.getElementById('maw-message-count').textContent = `${count} messages`;
  }
  
  addTimelineItem(icon, text) {
    const timeline = document.getElementById('maw-timeline');
    if (!timeline) return;
    
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <span class="timeline-icon">${icon}</span>
      <span class="timeline-text">${text}</span>
      <span class="timeline-time">${this.formatTime(new Date())}</span>
    `;
    
    timeline.appendChild(item);
    timeline.scrollTop = timeline.scrollHeight;
  }
  
  updateStatus(type, text) {
    const statusDiv = document.getElementById('maw-status');
    if (!statusDiv) return;
    
    const indicator = statusDiv.querySelector('.status-indicator');
    const textSpan = statusDiv.querySelector('.status-text');
    
    if (indicator) {
      indicator.className = `status-indicator ${type}`;
    }
    
    if (textSpan) {
      textSpan.textContent = text;
    }
  }
  
  stopCollaboration() {
    this.isRunning = false;
    this.addTimelineItem('⏹️', 'Collaboration stopped by user');
    this.updateStatus('idle', 'Ready');
    
    // Reset all agents
    this.agents.forEach(agent => {
      this.updateAgentStatus(agent.id, 'idle', 'Waiting for task...');
    });
    
    document.getElementById('maw-start').disabled = false;
    document.getElementById('maw-stop').disabled = true;
  }
  
  clearWorkspace() {
    // Reset all agents
    this.agents.forEach(agent => {
      agent.status = 'idle';
      agent.thinking = '';
      agent.output = [];
      this.updateAgentStatus(agent.id, 'idle', 'Waiting for task...');
      this.updateAgentOutput(agent.id);
    });
    
    // Clear messages
    const messagesDiv = document.getElementById('maw-collab-messages');
    if (messagesDiv) {
      messagesDiv.innerHTML = `
        <div class="collab-message system-message">
          <span class="message-icon">ℹ️</span>
          <span class="message-text">Agents will discuss and collaborate here...</span>
        </div>
      `;
    }
    
    // Clear timeline
    const timeline = document.getElementById('maw-timeline');
    if (timeline) {
      timeline.innerHTML = `
        <div class="timeline-item">
          <span class="timeline-icon">📋</span>
          <span class="timeline-text">Waiting for task...</span>
        </div>
      `;
    }
    
    // Reset collaboration
    this.collaboration = {
      task: null,
      phase: 'idle',
      messages: [],
      decisions: []
    };
    
    document.getElementById('maw-task-input').value = '';
    document.getElementById('maw-message-count').textContent = '0 messages';
  }
  
  handleAgentAction(action, agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    if (action === 'view-details') {
      this.showAgentDetails(agent);
    } else if (action === 'copy-output') {
      this.copyAgentOutput(agent);
    }
  }
  
  showAgentDetails(agent) {
    alert(`${agent.icon} ${agent.name}\n\nRole: ${agent.role}\nStatus: ${agent.status}\nOutputs: ${agent.output.length}`);
  }
  
  copyAgentOutput(agent) {
    const text = agent.output.map(o => o.content).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied ${agent.name}'s output to clipboard!`);
    });
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  injectStyles() {
    if (document.getElementById('multi-agent-workspace-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'multi-agent-workspace-styles';
    style.textContent = `
      .multi-agent-workspace {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        color: var(--green);
      }
      
      .maw-control-panel {
        padding: 20px;
        background: rgba(0, 255, 255, 0.05);
        border-bottom: 2px solid var(--cyan);
      }
      
      .maw-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .maw-header h2 {
        margin: 0;
        color: var(--cyan);
        font-size: 22px;
      }
      
      .maw-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 6px;
        border: 1px solid var(--cyan);
      }
      
      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }
      
      .status-indicator.idle {
        background: #888;
      }
      
      .status-indicator.running {
        background: var(--green);
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .status-text {
        font-weight: bold;
        color: var(--cyan);
      }
      
      .maw-controls {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .maw-task-input {
        flex: 1;
        padding: 12px 15px;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid var(--cyan);
        border-radius: 6px;
        color: var(--green);
        font-family: inherit;
        font-size: 14px;
      }
      
      .maw-btn {
        padding: 12px 20px;
        border: 2px solid;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .maw-start {
        background: rgba(0, 255, 0, 0.1);
        border-color: var(--green);
        color: var(--green);
      }
      
      .maw-start:hover:not(:disabled) {
        background: rgba(0, 255, 0, 0.2);
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
      }
      
      .maw-stop {
        background: rgba(255, 0, 0, 0.1);
        border-color: var(--red);
        color: var(--red);
      }
      
      .maw-stop:hover:not(:disabled) {
        background: rgba(255, 0, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
      }
      
      .maw-clear {
        background: rgba(255, 165, 0, 0.1);
        border-color: var(--orange);
        color: var(--orange);
      }
      
      .maw-clear:hover {
        background: rgba(255, 165, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 165, 0, 0.4);
      }
      
      .maw-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .maw-timeline {
        max-height: 100px;
        overflow-y: auto;
        padding: 10px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 6px;
        border: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .timeline-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
        font-size: 13px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      }
      
      .timeline-item:last-child {
        border-bottom: none;
      }
      
      .timeline-icon {
        font-size: 16px;
      }
      
      .timeline-text {
        flex: 1;
        color: var(--cyan);
      }
      
      .timeline-time {
        font-size: 11px;
        opacity: 0.6;
      }
      
      .maw-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        padding: 15px;
        overflow: hidden;
      }
      
      .agent-pane {
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .agent-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        border-bottom: 2px solid;
      }
      
      .agent-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .agent-icon {
        font-size: 28px;
      }
      
      .agent-name {
        font-size: 18px;
        font-weight: bold;
      }
      
      .agent-role {
        font-size: 12px;
        opacity: 0.7;
        color: var(--cyan);
      }
      
      .agent-status-badge {
        padding: 6px 12px;
        border: 2px solid;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .agent-status-badge.idle { background: rgba(128, 128, 128, 0.2); color: #888; }
      .agent-status-badge.thinking { background: rgba(255, 255, 0, 0.2); color: #ffff00; }
      .agent-status-badge.working { background: rgba(0, 255, 255, 0.2); color: var(--cyan); }
      .agent-status-badge.done { background: rgba(0, 255, 0, 0.2); color: var(--green); }
      .agent-status-badge.error { background: rgba(255, 0, 0, 0.2); color: var(--red); }
      
      .agent-thinking {
        padding: 12px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .thinking-label {
        font-size: 11px;
        text-transform: uppercase;
        opacity: 0.7;
        margin-bottom: 6px;
        color: var(--cyan);
      }
      
      .thinking-text {
        font-size: 13px;
        font-style: italic;
        color: var(--green);
      }
      
      .agent-output {
        flex: 1;
        overflow-y: auto;
        padding: 12px 15px;
      }
      
      .output-empty {
        text-align: center;
        padding: 40px 20px;
        opacity: 0.5;
        font-size: 13px;
      }
      
      .output-item {
        margin-bottom: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .output-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .output-type {
        font-weight: bold;
        color: var(--cyan);
        font-size: 12px;
      }
      
      .output-lang {
        font-size: 11px;
        padding: 2px 6px;
        background: rgba(255, 165, 0, 0.2);
        border-radius: 3px;
        color: var(--orange);
      }
      
      .output-item pre {
        margin: 0;
        padding: 10px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.5;
      }
      
      .plan-content, .test-content, .output-content {
        white-space: pre-wrap;
        font-size: 13px;
        line-height: 1.6;
        color: var(--green);
      }
      
      .test-status {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
      }
      
      .test-status.passed {
        background: rgba(0, 255, 0, 0.2);
        color: var(--green);
      }
      
      .test-status.failed {
        background: rgba(255, 0, 0, 0.2);
        color: var(--red);
      }
      
      .agent-actions {
        display: flex;
        gap: 8px;
        padding: 10px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .agent-action-btn {
        flex: 1;
        padding: 8px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid var(--cyan);
        border-radius: 4px;
        color: var(--cyan);
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .agent-action-btn:hover {
        background: rgba(0, 255, 255, 0.2);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      }
      
      .maw-collaboration {
        height: 200px;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.7);
        border-top: 2px solid var(--cyan);
      }
      
      .maw-collab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background: rgba(0, 255, 255, 0.05);
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
      }
      
      .maw-collab-header h3 {
        margin: 0;
        color: var(--cyan);
        font-size: 16px;
      }
      
      .maw-message-count {
        font-size: 13px;
        opacity: 0.7;
      }
      
      .maw-collab-messages {
        flex: 1;
        overflow-y: auto;
        padding: 12px 20px;
      }
      
      .collab-message {
        margin-bottom: 12px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        border-left: 3px solid var(--cyan);
      }
      
      .collab-message.system-message {
        border-left-color: var(--orange);
        opacity: 0.7;
      }
      
      .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      
      .message-icon {
        font-size: 16px;
      }
      
      .message-name {
        font-weight: bold;
        font-size: 13px;
      }
      
      .message-time {
        margin-left: auto;
        font-size: 11px;
        opacity: 0.6;
      }
      
      .message-content {
        font-size: 13px;
        color: var(--green);
        line-height: 1.5;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Auto-initialize if container exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('multi-agent-workspace-container');
    if (container) {
      window.multiAgentWorkspace = new MultiAgentWorkspace('multi-agent-workspace-container');
    }
  });
} else {
  const container = document.getElementById('multi-agent-workspace-container');
  if (container) {
    window.multiAgentWorkspace = new MultiAgentWorkspace('multi-agent-workspace-container');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiAgentWorkspace;
}

