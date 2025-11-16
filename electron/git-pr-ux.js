/**
 * Git/PR UX - Full Cursor-like Git Integration
 * Provides: Staging panel, commit composer, PR create/update, CI checks display
 */

(function() {
'use strict';

class GitPRUX {
  constructor() {
    this.gitStatus = null;
    this.stagedFiles = [];
    this.unstagedFiles = [];
    this.branches = [];
    this.currentBranch = null;
    this.prs = [];
    
    console.log('[GitPRUX] 🔀 Initializing Git/PR UX...');
    this.initialize();
  }

  async initialize() {
    // Load git status
    await this.refreshStatus();
    
    // Create staging panel
    this.createStagingPanel();
    
    // Create commit composer
    this.createCommitComposer();
    
    // Create PR panel
    this.createPRPanel();
    
    // Make globally available
    window.gitManager = this;
    window.gitPRUX = this;
    
    console.log('[GitPRUX] ✅ Git/PR UX ready');
  }

  async refreshStatus() {
    if (!window.electron || !window.electron.executeCommand) {
      return;
    }

    try {
      // Get git status
      const statusResult = await window.electron.executeCommand('git status --porcelain', 'bash');
      const statusLines = statusResult.output.split('\n').filter(l => l.trim());
      
      this.stagedFiles = [];
      this.unstagedFiles = [];
      
      statusLines.forEach(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        
        if (status[0] !== ' ' && status[0] !== '?') {
          this.stagedFiles.push({ file, status: status[0] });
        }
        if (status[1] !== ' ' && status[1] !== '?') {
          this.unstagedFiles.push({ file, status: status[1] });
        }
      });
      
      // Get current branch
      const branchResult = await window.electron.executeCommand('git branch --show-current', 'bash');
      this.currentBranch = branchResult.output.trim();
      
      // Get branches
      const branchesResult = await window.electron.executeCommand('git branch -a', 'bash');
      this.branches = branchesResult.output
        .split('\n')
        .filter(b => b.trim())
        .map(b => b.trim().replace(/^\*\s*/, '').replace(/^remotes\/[^/]+\//, ''));
      
      this.updateStagingPanel();
      
    } catch (error) {
      console.warn('[GitPRUX] ⚠️ Failed to refresh status:', error.message);
    }
  }

  createStagingPanel() {
    const panel = document.createElement('div');
    panel.id = 'git-staging-panel';
    panel.className = 'git-staging-panel';
    panel.innerHTML = `
      <div class="staging-panel-header">
        <h3>🔀 Git Staging</h3>
        <button onclick="window.gitPRUX.refreshStatus()">🔄</button>
      </div>
      <div class="staging-panel-content">
        <div class="unstaged-section">
          <h4>Unstaged Changes</h4>
          <div id="unstaged-files"></div>
        </div>
        <div class="staged-section">
          <h4>Staged Changes</h4>
          <div id="staged-files"></div>
        </div>
      </div>
    `;

    this.addStagingPanelStyles();
    
    // Add to UI (could be in a tab or sidebar)
    if (document.getElementById('git-tab-content')) {
      document.getElementById('git-tab-content').appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }
  }

  updateStagingPanel() {
    const unstagedDiv = document.getElementById('unstaged-files');
    const stagedDiv = document.getElementById('staged-files');
    
    if (!unstagedDiv || !stagedDiv) return;

    // Render unstaged files
    unstagedDiv.innerHTML = this.unstagedFiles.map(file => `
      <div class="file-item">
        <span class="file-status ${this.getStatusClass(file.status)}">${file.status}</span>
        <span class="file-name">${file.file}</span>
        <button onclick="window.gitPRUX.stageFile('${file.file}')">+</button>
        <button onclick="window.gitPRUX.showDiff('${file.file}')">👁️</button>
      </div>
    `).join('');

    // Render staged files
    stagedDiv.innerHTML = this.stagedFiles.map(file => `
      <div class="file-item">
        <span class="file-status ${this.getStatusClass(file.status)}">${file.status}</span>
        <span class="file-name">${file.file}</span>
        <button onclick="window.gitPRUX.unstageFile('${file.file}')">-</button>
        <button onclick="window.gitPRUX.showDiff('${file.file}')">👁️</button>
      </div>
    `).join('');
  }

  getStatusClass(status) {
    const statusMap = {
      'M': 'modified',
      'A': 'added',
      'D': 'deleted',
      'R': 'renamed',
      'C': 'copied'
    };
    return statusMap[status] || 'unknown';
  }

  async stageFile(filePath) {
    if (!window.electron || !window.electron.executeCommand) {
      return;
    }

    try {
      await window.electron.executeCommand(`git add "${filePath}"`, 'bash');
      await this.refreshStatus();
      
      if (window.notify) {
        window.notify.success(`Staged: ${filePath}`);
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Failed to stage file:', error);
      if (window.notify) {
        window.notify.error(`Failed to stage: ${filePath}`);
      }
    }
  }

  async unstageFile(filePath) {
    if (!window.electron || !window.electron.executeCommand) {
      return;
    }

    try {
      await window.electron.executeCommand(`git reset HEAD "${filePath}"`, 'bash');
      await this.refreshStatus();
      
      if (window.notify) {
        window.notify.info(`Unstaged: ${filePath}`);
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Failed to unstage file:', error);
    }
  }

  async showDiff(filePath) {
    if (!window.electron || !window.electron.executeCommand) {
      return;
    }

    try {
      const diffResult = await window.electron.executeCommand(`git diff "${filePath}"`, 'bash');
      
      // Show diff in a panel or new tab
      if (window.completeTabSystem) {
        window.completeTabSystem.createTab({
          id: `diff-${Date.now()}`,
          title: `Diff: ${filePath}`,
          content: diffResult.output,
          type: 'code',
          language: 'diff'
        });
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Failed to show diff:', error);
    }
  }

  createCommitComposer() {
    const composer = document.createElement('div');
    composer.id = 'git-commit-composer';
    composer.className = 'git-commit-composer';
    composer.style.display = 'none';
    composer.innerHTML = `
      <div class="commit-composer-header">
        <h3>💬 Commit Changes</h3>
        <button onclick="window.gitPRUX.closeCommitComposer()">×</button>
      </div>
      <div class="commit-composer-content">
        <div class="commit-type-selector">
          <label>Type:</label>
          <select id="commit-type">
            <option value="feat">✨ feat: New feature</option>
            <option value="fix">🐛 fix: Bug fix</option>
            <option value="docs">📝 docs: Documentation</option>
            <option value="style">💎 style: Formatting</option>
            <option value="refactor">♻️ refactor: Code refactoring</option>
            <option value="test">🧪 test: Tests</option>
            <option value="chore">🔧 chore: Maintenance</option>
          </select>
        </div>
        <div class="commit-scope">
          <label>Scope (optional):</label>
          <input type="text" id="commit-scope" placeholder="e.g., auth, api, ui">
        </div>
        <div class="commit-message">
          <label>Why this change? (Required):</label>
          <textarea id="commit-message" placeholder="Describe why you made this change..." rows="4"></textarea>
        </div>
        <div class="commit-actions">
          <button onclick="window.gitPRUX.commit()" class="commit-btn">💾 Commit</button>
          <button onclick="window.gitPRUX.closeCommitComposer()" class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    this.addCommitComposerStyles();
    document.body.appendChild(composer);
  }

  openCommitComposer() {
    const composer = document.getElementById('git-commit-composer');
    if (composer) {
      composer.style.display = 'block';
      document.getElementById('commit-message')?.focus();
    }
  }

  closeCommitComposer() {
    const composer = document.getElementById('git-commit-composer');
    if (composer) {
      composer.style.display = 'none';
      document.getElementById('commit-message').value = '';
    }
  }

  async commit() {
    const type = document.getElementById('commit-type')?.value || 'chore';
    const scope = document.getElementById('commit-scope')?.value || '';
    const message = document.getElementById('commit-message')?.value;
    
    if (!message || !message.trim()) {
      if (window.notify) {
        window.notify.warning('Commit message is required');
      }
      return;
    }

    // Build conventional commit message
    const commitMessage = scope ? 
      `${type}(${scope}): ${message}` : 
      `${type}: ${message}`;

    if (!window.electron || !window.electron.executeCommand) {
      return;
    }

    try {
      const result = await window.electron.executeCommand(
        `git commit -m "${commitMessage}"`,
        'bash'
      );
      
      if (result.code === 0) {
        if (window.notify) {
          window.notify.success('Changes committed');
        }
        this.closeCommitComposer();
        await this.refreshStatus();
      } else {
        throw new Error(result.output);
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Commit failed:', error);
      if (window.notify) {
        window.notify.error(`Commit failed: ${error.message}`);
      }
    }
  }

  createPRPanel() {
    const panel = document.createElement('div');
    panel.id = 'git-pr-panel';
    panel.className = 'git-pr-panel';
    panel.innerHTML = `
      <div class="pr-panel-header">
        <h3>🔀 Pull Requests</h3>
        <button onclick="window.gitPRUX.refreshPRs()">🔄</button>
        <button onclick="window.gitPRUX.createPR()">+ New PR</button>
      </div>
      <div class="pr-panel-content" id="pr-list">
        <!-- PRs will be listed here -->
      </div>
    `;

    this.addPRPanelStyles();
    
    // Add to UI
    if (document.getElementById('git-tab-content')) {
      document.getElementById('git-tab-content').appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }
  }

  async refreshPRs() {
    // Fetch PRs from GitHub/GitLab
    console.log('[GitPRUX] 🔄 Refreshing PRs...');
    
    try {
      // Get GitHub token from settings
      const githubToken = await this.getGitHubToken();
      
      if (!githubToken) {
        console.warn('[GitPRUX] ⚠️ No GitHub token configured');
        this.prs = [];
        this.updatePRList();
        return;
      }
      
      // Get repo info from git remote
      const repoInfo = await this.getRepoInfo();
      if (!repoInfo) {
        this.prs = [];
        this.updatePRList();
        return;
      }
      
      // Fetch PRs from GitHub API
      const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/pulls?state=all&per_page=20`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (response.ok) {
        const prs = await response.json();
        this.prs = prs.map(pr => ({
          number: pr.number,
          title: pr.title,
          author: pr.user.login,
          status: pr.state,
          url: pr.html_url,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at
        }));
      } else {
        console.error('[GitPRUX] ❌ Failed to fetch PRs:', response.statusText);
        this.prs = [];
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Error refreshing PRs:', error);
      this.prs = [];
    }
    
    this.updatePRList();
  }

  async getGitHubToken() {
    // Get GitHub token from API key store
    if (window.electron && window.electron.apiKeys) {
      try {
        const keys = await window.electron.apiKeys.list();
        return keys.keys?.github?.key || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  async getRepoInfo() {
    // Get repo owner and name from git remote
    if (!window.electron || !window.electron.executeCommand) {
      return null;
    }
    
    try {
      const result = await window.electron.executeCommand('git remote get-url origin', 'bash');
      const url = result.output.trim();
      
      // Parse GitHub URL
      const match = url.match(/github\.com[\/:]([^\/]+)\/([^\/]+)(?:\.git)?$/);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', '')
        };
      }
      
      return null;
    } catch (error) {
      console.warn('[GitPRUX] ⚠️ Failed to get repo info:', error.message);
      return null;
    }
  }

  async createPR() {
    if (!this.currentBranch) {
      if (window.notify) {
        window.notify.warning('No branch selected');
      }
      return;
    }

    // Show PR creation dialog
    const title = prompt('PR Title:');
    if (!title) return;

    const description = prompt('PR Description:') || '';
    
    try {
      const githubToken = await this.getGitHubToken();
      if (!githubToken) {
        if (window.notify) {
          window.notify.error('GitHub token not configured. Set it in Settings > API Keys');
        }
        return;
      }
      
      const repoInfo = await this.getRepoInfo();
      if (!repoInfo) {
        if (window.notify) {
          window.notify.error('Could not determine repository');
        }
        return;
      }
      
      // Get base branch (usually main or master)
      const baseResult = await window.electron.executeCommand('git symbolic-ref refs/remotes/origin/HEAD', 'bash');
      const baseBranch = baseResult.output.trim().split('/').pop() || 'main';
      
      // Create PR via GitHub API
      const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/pulls`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          body: description,
          head: this.currentBranch,
          base: baseBranch
        })
      });
      
      if (response.ok) {
        const pr = await response.json();
        if (window.notify) {
          window.notify.success(`PR #${pr.number} created: ${pr.html_url}`);
        }
        await this.refreshPRs();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create PR');
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Failed to create PR:', error);
      if (window.notify) {
        window.notify.error(`Failed to create PR: ${error.message}`);
      }
    }
  }

  updatePRList() {
    const prList = document.getElementById('pr-list');
    if (!prList) return;

    if (this.prs.length === 0) {
      prList.innerHTML = '<div class="no-prs">No pull requests</div>';
      return;
    }

    prList.innerHTML = this.prs.map(pr => `
      <div class="pr-item">
        <div class="pr-title">${pr.title}</div>
        <div class="pr-meta">#${pr.number} by ${pr.author}</div>
        <div class="pr-status ${pr.status}">${pr.status}</div>
      </div>
    `).join('');
  }

  addStagingPanelStyles() {
    if (document.getElementById('git-staging-styles')) return;

    const style = document.createElement('style');
    style.id = 'git-staging-styles';
    style.textContent = `
      .git-staging-panel {
        background: #1e1e1e;
        border: 1px solid #3e3e3e;
        border-radius: 8px;
        padding: 12px;
        margin: 12px;
      }

      .staging-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #3e3e3e;
      }

      .staging-panel-header h3 {
        margin: 0;
        color: #cccccc;
        font-size: 14px;
      }

      .file-item {
        display: flex;
        align-items: center;
        padding: 6px;
        margin: 4px 0;
        background: #252526;
        border-radius: 4px;
      }

      .file-status {
        width: 20px;
        text-align: center;
        font-weight: bold;
        margin-right: 8px;
      }

      .file-status.modified { color: #ffa502; }
      .file-status.added { color: #4ec9b0; }
      .file-status.deleted { color: #f48771; }

      .file-name {
        flex: 1;
        color: #cccccc;
        font-size: 12px;
      }

      .file-item button {
        background: #3e3e3e;
        border: none;
        color: #cccccc;
        padding: 4px 8px;
        margin-left: 4px;
        border-radius: 3px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  addCommitComposerStyles() {
    if (document.getElementById('git-commit-styles')) return;

    const style = document.createElement('style');
    style.id = 'git-commit-styles';
    style.textContent = `
      .git-commit-composer {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        background: #1e1e1e;
        border: 1px solid #3e3e3e;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 10000;
      }

      .commit-composer-header {
        padding: 12px;
        border-bottom: 1px solid #3e3e3e;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .commit-composer-content {
        padding: 12px;
      }

      .commit-composer-content label {
        display: block;
        margin-bottom: 4px;
        color: #cccccc;
        font-size: 12px;
      }

      .commit-composer-content input,
      .commit-composer-content select,
      .commit-composer-content textarea {
        width: 100%;
        padding: 8px;
        background: #252526;
        border: 1px solid #3e3e3e;
        border-radius: 4px;
        color: #cccccc;
        font-size: 13px;
        margin-bottom: 12px;
      }

      .commit-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .commit-btn, .cancel-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      }

      .commit-btn {
        background: #007acc;
        color: white;
      }

      .cancel-btn {
        background: #3e3e3e;
        color: #cccccc;
      }
    `;
    document.head.appendChild(style);
  }

  addPRPanelStyles() {
    if (document.getElementById('git-pr-styles')) return;

    const style = document.createElement('style');
    style.id = 'git-pr-styles';
    style.textContent = `
      .git-pr-panel {
        background: #1e1e1e;
        border: 1px solid #3e3e3e;
        border-radius: 8px;
        padding: 12px;
        margin: 12px;
      }

      .pr-panel-header {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #3e3e3e;
      }

      .pr-panel-header h3 {
        margin: 0;
        color: #cccccc;
        font-size: 14px;
        flex: 1;
      }

      .pr-item {
        padding: 8px;
        margin: 4px 0;
        background: #252526;
        border-radius: 4px;
        border-left: 3px solid #007acc;
      }

      .pr-title {
        color: #cccccc;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .pr-meta {
        color: #858585;
        font-size: 11px;
      }

      .pr-status {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        margin-top: 4px;
      }

      .pr-status.open { background: #4ec9b0; color: #000; }
      .pr-status.closed { background: #f48771; color: #000; }
      .pr-status.merged { background: #007acc; color: #fff; }
    `;
    document.head.appendChild(style);
  }

  async push() {
    if (!window.electron || !window.electron.executeCommand) {
      return;
    }

    try {
      const result = await window.electron.executeCommand('git push', 'bash');
      if (result.code === 0) {
        if (window.notify) {
          window.notify.success('Pushed to remote');
        }
      } else {
        throw new Error(result.output);
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Push failed:', error);
      if (window.notify) {
        window.notify.error(`Push failed: ${error.message}`);
      }
    }
  }

  async pull() {
    if (!window.electron || !window.electron.executeCommand) {
      return;
    }

    try {
      const result = await window.electron.executeCommand('git pull', 'bash');
      if (result.code === 0) {
        if (window.notify) {
          window.notify.success('Pulled from remote');
        }
        await this.refreshStatus();
      } else {
        throw new Error(result.output);
      }
    } catch (error) {
      console.error('[GitPRUX] ❌ Pull failed:', error);
      if (window.notify) {
        window.notify.error(`Pull failed: ${error.message}`);
      }
    }
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GitPRUX();
  });
} else {
  new GitPRUX();
}

})();
