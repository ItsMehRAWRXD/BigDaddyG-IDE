/**
 * Agent Loop - Plan/Act/Observe/Retry Orchestrator
 * Full agentic system with tool registry and safety guards
 */

(function() {
'use strict';

class AgentLoop {
  constructor() {
    this.tools = new Map();
    this.jobQueue = [];
    this.activeJobs = new Map();
    this.jobHistory = [];
    this.maxConcurrentJobs = 3;
    this.safetyPolicies = {
      maxExecutionTime: 300000, // 5 minutes
      maxFileOperations: 100,
      maxNetworkRequests: 50,
      allowedPaths: [],
      blockedPaths: ['node_modules', '.git', 'dist', 'build']
    };
    
    console.log('[AgentLoop] 🤖 Initializing agent loop system...');
    this.initialize();
  }

  initialize() {
    // Register all tools
    this.registerAllTools();
    
    // Start job processor
    this.startJobProcessor();
    
    // Create progress panel
    this.createProgressPanel();
    
    // Make globally available
    window.agentLoop = this;
    
    console.log('[AgentLoop] ✅ Agent loop system ready');
  }

  registerAllTools() {
    // File System Tools
    this.registerTool('fs.read', this.toolReadFile.bind(this));
    this.registerTool('fs.write', this.toolWriteFile.bind(this));
    this.registerTool('fs.list', this.toolListDirectory.bind(this));
    this.registerTool('fs.create', this.toolCreateFile.bind(this));
    this.registerTool('fs.delete', this.toolDeleteFile.bind(this));
    this.registerTool('fs.move', this.toolMoveFile.bind(this));
    this.registerTool('fs.copy', this.toolCopyFile.bind(this));

    // Git Tools
    this.registerTool('git.status', this.toolGitStatus.bind(this));
    this.registerTool('git.commit', this.toolGitCommit.bind(this));
    this.registerTool('git.push', this.toolGitPush.bind(this));
    this.registerTool('git.pull', this.toolGitPull.bind(this));
    this.registerTool('git.branch', this.toolGitBranch.bind(this));
    this.registerTool('git.diff', this.toolGitDiff.bind(this));

    // Test Tools
    this.registerTool('test.run', this.toolRunTests.bind(this));
    this.registerTool('test.watch', this.toolWatchTests.bind(this));
    this.registerTool('test.analyze', this.toolAnalyzeTests.bind(this));

    // Execution Tools
    this.registerTool('exec.command', this.toolExecuteCommand.bind(this));
    this.registerTool('exec.script', this.toolExecuteScript.bind(this));

    // HTTP Tools
    this.registerTool('http.get', this.toolHttpGet.bind(this));
    this.registerTool('http.post', this.toolHttpPost.bind(this));

    // Browser Tools
    this.registerTool('browser.navigate', this.toolBrowserNavigate.bind(this));
    this.registerTool('browser.screenshot', this.toolBrowserScreenshot.bind(this));

    // Memory Tools
    this.registerTool('memory.store', this.toolMemoryStore.bind(this));
    this.registerTool('memory.query', this.toolMemoryQuery.bind(this));

    console.log(`[AgentLoop] ✅ Registered ${this.tools.size} tools`);
  }

  registerTool(name, handler) {
    this.tools.set(name, {
      name,
      handler,
      usage: 0,
      errors: 0,
      lastUsed: null
    });
  }

  async executePlan(plan) {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      id: jobId,
      plan,
      status: 'queued',
      steps: [],
      currentStep: 0,
      results: [],
      errors: [],
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString()
    };

    this.jobQueue.push(job);
    this.jobHistory.push(job);

    // Process job
    this.processJobQueue();

    return jobId;
  }

  async processJobQueue() {
    // Don't exceed max concurrent jobs
    if (this.activeJobs.size >= this.maxConcurrentJobs) {
      return;
    }

    // Get next job
    const job = this.jobQueue.shift();
    if (!job) {
      return;
    }

    // Start job
    this.activeJobs.set(job.id, job);
    job.status = 'running';
    job.startTime = Date.now();

    this.updateProgressPanel();

    try {
      // Execute plan steps
      for (let i = 0; i < job.plan.steps.length; i++) {
        job.currentStep = i;
        const step = job.plan.steps[i];
        
        console.log(`[AgentLoop] 🔄 Executing step ${i + 1}/${job.plan.steps.length}: ${step.action}`);

        const result = await this.executeStep(step, job);
        job.steps.push({ ...step, result, completed: true });
        job.results.push(result);

        // Check for cancellation
        if (job.status === 'cancelled') {
          break;
        }

        // Retry logic if step failed
        if (!result.success && step.retryOnFailure) {
          console.log(`[AgentLoop] 🔄 Retrying step ${i + 1}...`);
          const retryResult = await this.executeStep(step, job);
          if (retryResult.success) {
            job.steps[job.steps.length - 1].result = retryResult;
            job.results[job.results.length - 1] = retryResult;
          }
        }
      }

      job.status = 'completed';
      job.endTime = Date.now();

    } catch (error) {
      job.status = 'failed';
      job.errors.push(error.message);
      job.endTime = Date.now();
      console.error(`[AgentLoop] ❌ Job ${job.id} failed:`, error);
    } finally {
      this.activeJobs.delete(job.id);
      this.updateProgressPanel();
      
      // Process next job
      this.processJobQueue();
    }
  }

  async executeStep(step, job) {
    const tool = this.tools.get(step.tool);
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${step.tool}`
      };
    }

    // Safety checks
    const safetyCheck = this.checkSafety(step);
    if (!safetyCheck.allowed) {
      return {
        success: false,
        error: `Safety check failed: ${safetyCheck.reason}`
      };
    }

    try {
      // Execute tool
      const startTime = Date.now();
      const result = await tool.handler(step.params || {}, job);
      const duration = Date.now() - startTime;

      // Update tool stats
      tool.usage++;
      tool.lastUsed = new Date().toISOString();

      return {
        success: true,
        result,
        duration,
        tool: step.tool
      };

    } catch (error) {
      // Update tool error stats
      tool.errors++;

      return {
        success: false,
        error: error.message,
        tool: step.tool
      };
    }
  }

  checkSafety(step) {
    // Check execution time limit
    if (step.estimatedTime && step.estimatedTime > this.safetyPolicies.maxExecutionTime) {
      return {
        allowed: false,
        reason: 'Estimated execution time exceeds limit'
      };
    }

    // Check file operations
    if (step.tool.startsWith('fs.')) {
      const path = step.params?.path || step.params?.file || '';
      if (this.isBlockedPath(path)) {
        return {
          allowed: false,
          reason: `Path is blocked: ${path}`
        };
      }
    }

    // Check network requests
    if (step.tool.startsWith('http.')) {
      // Add rate limiting checks
    }

    return { allowed: true };
  }

  isBlockedPath(path) {
    return this.safetyPolicies.blockedPaths.some(blocked => 
      path.includes(blocked)
    );
  }

  // Tool Implementations
  async toolReadFile(params, job) {
    if (!window.electron || !window.electron.readFile) {
      throw new Error('File system not available');
    }

    const content = await window.electron.readFile(params.path);
    return { content, path: params.path };
  }

  async toolWriteFile(params, job) {
    if (!window.electron || !window.electron.writeFile) {
      throw new Error('File system not available');
    }

    await window.electron.writeFile(params.path, params.content);
    return { success: true, path: params.path };
  }

  async toolListDirectory(params, job) {
    if (!window.electron || !window.electron.readDir) {
      throw new Error('File system not available');
    }

    const files = await window.electron.readDir(params.path);
    return { files, path: params.path };
  }

  async toolCreateFile(params, job) {
    return await this.toolWriteFile(params, job);
  }

  async toolDeleteFile(params, job) {
    if (!window.electron || !window.electron.deleteItem) {
      throw new Error('File system not available');
    }

    await window.electron.deleteItem(params.path, false);
    return { success: true, path: params.path };
  }

  async toolMoveFile(params, job) {
    if (!window.electron || !window.electron.moveItem) {
      throw new Error('File system not available');
    }

    await window.electron.moveItem(params.source, params.destination);
    return { success: true, source: params.source, destination: params.destination };
  }

  async toolCopyFile(params, job) {
    if (!window.electron || !window.electron.copyItem) {
      throw new Error('File system not available');
    }

    await window.electron.copyItem(params.source, params.destination);
    return { success: true, source: params.source, destination: params.destination };
  }

  async toolGitStatus(params, job) {
    // Implement git status
    return { status: 'clean', changes: [] };
  }

  async toolGitCommit(params, job) {
    // Implement git commit
    return { success: true, commitHash: 'abc123' };
  }

  async toolGitPush(params, job) {
    // Implement git push
    return { success: true };
  }

  async toolGitPull(params, job) {
    // Implement git pull
    return { success: true };
  }

  async toolGitBranch(params, job) {
    // Implement git branch operations
    return { branches: [] };
  }

  async toolGitDiff(params, job) {
    // Implement git diff
    return { diff: '' };
  }

  async toolRunTests(params, job) {
    if (window.testRunner) {
      const results = await window.testRunner.runAll();
      return { results };
    }
    return { success: false, error: 'Test runner not available' };
  }

  async toolWatchTests(params, job) {
    if (window.testRunner) {
      await window.testRunner.watch();
      return { success: true };
    }
    return { success: false, error: 'Test runner not available' };
  }

  async toolAnalyzeTests(params, job) {
    // Analyze test failures and suggest fixes
    return { analysis: {}, suggestions: [] };
  }

  async toolExecuteCommand(params, job) {
    if (!window.electron || !window.electron.executeCommand) {
      throw new Error('Command execution not available');
    }

    const result = await window.electron.executeCommand(
      params.command,
      params.shell,
      params.cwd
    );

    return { output: result.output, code: result.code };
  }

  async toolExecuteScript(params, job) {
    // Execute script file
    return await this.toolExecuteCommand({
      command: params.script,
      shell: params.shell,
      cwd: params.cwd
    }, job);
  }

  async toolHttpGet(params, job) {
    try {
      const response = await fetch(params.url, {
        method: 'GET',
        headers: params.headers || {}
      });
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      throw new Error(`HTTP GET failed: ${error.message}`);
    }
  }

  async toolHttpPost(params, job) {
    try {
      const response = await fetch(params.url, {
        method: 'POST',
        headers: params.headers || { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.body)
      });
      const data = await response.json();
      return { status: response.status, data };
    } catch (error) {
      throw new Error(`HTTP POST failed: ${error.message}`);
    }
  }

  async toolBrowserNavigate(params, job) {
    if (window.electron && window.electron.browser) {
      await window.electron.browser.navigate(params.url);
      return { success: true, url: params.url };
    }
    return { success: false, error: 'Browser not available' };
  }

  async toolBrowserScreenshot(params, job) {
    if (window.electron && window.electron.browser) {
      const screenshot = await window.electron.browser.screenshot(params.options);
      return { screenshot };
    }
    return { success: false, error: 'Browser not available' };
  }

  async toolMemoryStore(params, job) {
    if (window.electron && window.electron.memory) {
      await window.electron.memory.store(params.content, params.metadata);
      return { success: true };
    }
    return { success: false, error: 'Memory system not available' };
  }

  async toolMemoryQuery(params, job) {
    if (window.electron && window.electron.memory) {
      const results = await window.electron.memory.query(params.query, params.limit);
      return { results };
    }
    return { success: false, error: 'Memory system not available' };
  }

  createProgressPanel() {
    const panel = document.createElement('div');
    panel.id = 'agent-progress-panel';
    panel.className = 'agent-progress-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
      <div class="progress-panel-header">
        <h3>🤖 Agent Jobs</h3>
        <button onclick="window.agentLoop.toggleProgressPanel()">×</button>
      </div>
      <div class="progress-panel-content" id="agent-progress-content">
        <!-- Jobs will be listed here -->
      </div>
    `;

    this.addProgressPanelStyles();
    document.body.appendChild(panel);
  }

  addProgressPanelStyles() {
    if (document.getElementById('agent-progress-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'agent-progress-styles';
    style.textContent = `
      .agent-progress-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 500px;
        background: #1e1e1e;
        border: 1px solid #3e3e3e;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .progress-panel-header {
        padding: 12px;
        border-bottom: 1px solid #3e3e3e;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .progress-panel-header h3 {
        margin: 0;
        color: #cccccc;
        font-size: 14px;
      }

      .progress-panel-header button {
        background: none;
        border: none;
        color: #cccccc;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        width: 24px;
        height: 24px;
      }

      .progress-panel-content {
        padding: 12px;
        max-height: 400px;
        overflow-y: auto;
      }

      .progress-job-item {
        padding: 8px;
        margin-bottom: 8px;
        background: #252526;
        border-radius: 4px;
        border-left: 3px solid #007acc;
      }

      .progress-job-item.completed {
        border-left-color: #4ec9b0;
      }

      .progress-job-item.failed {
        border-left-color: #f48771;
      }

      .progress-job-item-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }

      .progress-job-item-title {
        font-weight: 500;
        color: #cccccc;
        font-size: 12px;
      }

      .progress-job-item-status {
        font-size: 11px;
        color: #858585;
      }

      .progress-job-item-progress {
        height: 4px;
        background: #2d2d2d;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 4px;
      }

      .progress-job-item-progress-bar {
        height: 100%;
        background: #007acc;
        transition: width 0.3s;
      }
    `;
    document.head.appendChild(style);
  }

  updateProgressPanel() {
    const content = document.getElementById('agent-progress-content');
    if (!content) return;

    const allJobs = [...this.activeJobs.values(), ...this.jobQueue];
    if (allJobs.length === 0) {
      const panel = document.getElementById('agent-progress-panel');
      if (panel) {
        panel.style.display = 'none';
      }
      return;
    }

    // Show panel
    const panel = document.getElementById('agent-progress-panel');
    if (panel) {
      panel.style.display = 'block';
    }

    let html = '';
    allJobs.forEach(job => {
      const progress = job.plan?.steps ? 
        (job.currentStep / job.plan.steps.length * 100) : 0;
      const statusClass = job.status === 'completed' ? 'completed' : 
                         job.status === 'failed' ? 'failed' : '';
      
      html += `
        <div class="progress-job-item ${statusClass}">
          <div class="progress-job-item-header">
            <div class="progress-job-item-title">${job.plan?.name || job.id}</div>
            <div class="progress-job-item-status">${job.status}</div>
          </div>
          <div class="progress-job-item-progress">
            <div class="progress-job-item-progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>
      `;
    });

    content.innerHTML = html;
  }

  toggleProgressPanel() {
    const panel = document.getElementById('agent-progress-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  cancelJob(jobId) {
    const job = this.activeJobs.get(jobId) || this.jobQueue.find(j => j.id === jobId);
    if (job) {
      job.status = 'cancelled';
      this.activeJobs.delete(jobId);
      this.jobQueue = this.jobQueue.filter(j => j.id !== jobId);
      this.updateProgressPanel();
    }
  }

  pauseJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'paused';
      this.updateProgressPanel();
    }
  }

  resumeJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'running';
      this.processJobQueue();
    }
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AgentLoop();
  });
} else {
  new AgentLoop();
}

})();
