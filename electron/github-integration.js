/**
 * BigDaddyG IDE - GitHub Integration Module
 * 
 * Provides seamless GitHub integration without requiring a backend server
 * Uses GitHub OAuth Device Flow for authentication
 * 
 * Features:
 * - OAuth authentication (no server needed!)
 * - Repository browsing
 * - File viewing/editing
 * - Direct commits
 * - Branch creation
 * - Pull request creation
 */

class GitHubIntegration {
    constructor() {
        // GitHub OAuth App credentials
        // NOTE: These are CLIENT_ID (public, safe to expose)
        this.clientId = 'Ov23liYour_GitHub_App_Client_ID'; // Replace with your GitHub OAuth App Client ID
        
        // State management
        this.token = localStorage.getItem('github_token');
        this.username = localStorage.getItem('github_username');
        this.currentRepo = null;
        this.currentBranch = 'main';
        
        // Initialize UI
        this.initializeUI();
    }
    
    // ============================================================================
    // AUTHENTICATION
    // ============================================================================
    
    async authenticate() {
        try {
            console.log('🔐 Starting GitHub authentication...');
            
            // Step 1: Request device code
            const deviceCodeResponse = await fetch('https://github.com/login/device/code', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: this.clientId,
                    scope: 'repo user'
                })
            });
            
            if (!deviceCodeResponse.ok) {
                throw new Error('Failed to get device code');
            }
            
            const deviceData = await deviceCodeResponse.json();
            const { device_code, user_code, verification_uri, interval } = deviceData;
            
            // Step 2: Show user code and open verification page
            this.showAuthDialog(user_code, verification_uri);
            
            // Step 3: Poll for access token
            const token = await this.pollForToken(device_code, interval || 5);
            
            // Step 4: Save token and get user info
            this.token = token;
            localStorage.setItem('github_token', token);
            
            await this.fetchUserInfo();
            
            this.hideAuthDialog();
            this.updateUI();
            
            console.log('✅ GitHub authentication successful!');
            this.showNotification('GitHub Connected!', 'success');
            
        } catch (error) {
            console.error('❌ Authentication failed:', error);
            this.showNotification('Authentication failed: ' + error.message, 'error');
        }
    }
    
    async pollForToken(device_code, interval) {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
            attempts++;
            
            try {
                const response = await fetch('https://github.com/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: this.clientId,
                        device_code: device_code,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                    })
                });
                
                const data = await response.json();
                
                if (data.access_token) {
                    return data.access_token;
                }
                
                if (data.error === 'authorization_pending') {
                    // Still waiting for user to authorize
                    continue;
                }
                
                if (data.error === 'slow_down') {
                    // Rate limited, increase interval
                    interval += 5;
                    continue;
                }
                
                if (data.error === 'expired_token') {
                    throw new Error('Verification code expired. Please try again.');
                }
                
                if (data.error) {
                    throw new Error(data.error_description || data.error);
                }
                
            } catch (error) {
                throw error;
            }
        }
        
        throw new Error('Authentication timeout. Please try again.');
    }
    
    async fetchUserInfo() {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        
        const user = await response.json();
        this.username = user.login;
        localStorage.setItem('github_username', user.login);
        
        return user;
    }
    
    disconnect() {
        this.token = null;
        this.username = null;
        this.currentRepo = null;
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_username');
        
        this.updateUI();
        this.showNotification('Disconnected from GitHub', 'info');
    }
    
    // ============================================================================
    // REPOSITORY OPERATIONS
    // ============================================================================
    
    async listRepositories() {
        if (!this.token) {
            throw new Error('Not authenticated');
        }
        
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        return await response.json();
    }
    
    async getRepository(owner, repo) {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch repository');
        }
        
        return await response.json();
    }
    
    async getRepositoryTree(owner, repo, branch = 'main') {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch repository tree');
        }
        
        const data = await response.json();
        return data.tree;
    }
    
    // ============================================================================
    // FILE OPERATIONS
    // ============================================================================
    
    async getFileContent(owner, repo, path, branch = 'main') {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch file content');
        }
        
        const data = await response.json();
        
        // Decode base64 content
        const content = atob(data.content.replace(/\n/g, ''));
        
        return {
            content: content,
            sha: data.sha,
            path: data.path,
            name: data.name
        };
    }
    
    async commitFile(owner, repo, path, content, message, branch = 'main') {
        // First, try to get the current file SHA
        let sha = null;
        try {
            const fileData = await this.getFileContent(owner, repo, path, branch);
            sha = fileData.sha;
        } catch (e) {
            // File doesn't exist, that's okay for new files
            console.log('Creating new file:', path);
        }
        
        // Create or update file
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    content: btoa(unescape(encodeURIComponent(content))), // Proper UTF-8 encoding
                    branch: branch,
                    ...(sha && { sha }) // Include SHA if updating existing file
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to commit file');
        }
        
        return await response.json();
    }
    
    // ============================================================================
    // BRANCH OPERATIONS
    // ============================================================================
    
    async listBranches(owner, repo) {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/branches`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch branches');
        }
        
        return await response.json();
    }
    
    async createBranch(owner, repo, branchName, fromBranch = 'main') {
        // Get SHA of base branch
        const refResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!refResponse.ok) {
            throw new Error('Failed to get base branch reference');
        }
        
        const refData = await refResponse.json();
        const sha = refData.object.sha;
        
        // Create new branch
        const createResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/git/refs`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: `refs/heads/${branchName}`,
                    sha: sha
                })
            }
        );
        
        if (!createResponse.ok) {
            const error = await createResponse.json();
            throw new Error(error.message || 'Failed to create branch');
        }
        
        return await createResponse.json();
    }
    
    // ============================================================================
    // PULL REQUEST OPERATIONS
    // ============================================================================
    
    async createPullRequest(owner, repo, title, head, base = 'main', body = '') {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    head: head,
                    base: base,
                    body: body
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create pull request');
        }
        
        const pr = await response.json();
        return pr;
    }
    
    async listPullRequests(owner, repo, state = 'open') {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch pull requests');
        }
        
        return await response.json();
    }
    
    // ============================================================================
    // UI MANAGEMENT
    // ============================================================================
    
    initializeUI() {
        // Create GitHub panel in sidebar
        const sidebar = document.querySelector('.right-sidebar') || document.querySelector('.sidebar');
        
        if (!sidebar) {
            console.warn('Sidebar not found, creating GitHub panel separately');
            return;
        }
        
        const githubPanel = document.createElement('div');
        githubPanel.id = 'github-panel';
        githubPanel.className = 'panel github-panel';
        githubPanel.innerHTML = `
            <div class="panel-header">
                <h3>🐙 GitHub Integration</h3>
            </div>
            
            <div class="panel-content">
                <!-- Auth Section -->
                <div id="github-auth-section" style="display: none;">
                    <p>Connect your GitHub account to access repositories</p>
                    <button id="github-auth-btn" class="btn btn-primary">
                        🔐 Connect GitHub
                    </button>
                </div>
                
                <!-- Connected Section -->
                <div id="github-connected-section" style="display: none;">
                    <div class="github-user-info">
                        <p>✅ Connected as: <strong id="github-username-display"></strong></p>
                        <button id="github-disconnect-btn" class="btn btn-secondary btn-sm">
                            Disconnect
                        </button>
                    </div>
                    
                    <div class="github-repo-section">
                        <h4>📁 Repositories</h4>
                        <button id="github-load-repos-btn" class="btn btn-secondary">
                            Load Repositories
                        </button>
                        <select id="github-repo-selector" class="form-select" style="display: none;">
                            <option value="">Select a repository...</option>
                        </select>
                    </div>
                    
                    <div id="github-repo-details" style="display: none;">
                        <h4>📂 Files</h4>
                        <div id="github-file-tree" class="file-tree"></div>
                        
                        <h4>🌿 Branch</h4>
                        <select id="github-branch-selector" class="form-select">
                            <option value="main">main</option>
                        </select>
                        
                        <h4>🚀 Actions</h4>
                        <div class="github-actions">
                            <button id="github-create-branch-btn" class="btn btn-secondary btn-sm">
                                Create Branch
                            </button>
                            <button id="github-commit-btn" class="btn btn-primary btn-sm">
                                Commit Changes
                            </button>
                            <button id="github-create-pr-btn" class="btn btn-success btn-sm">
                                Create PR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        sidebar.appendChild(githubPanel);
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Update UI based on authentication state
        this.updateUI();
    }
    
    attachEventListeners() {
        // Auth button
        const authBtn = document.getElementById('github-auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => this.authenticate());
        }
        
        // Disconnect button
        const disconnectBtn = document.getElementById('github-disconnect-btn');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnect());
        }
        
        // Load repos button
        const loadReposBtn = document.getElementById('github-load-repos-btn');
        if (loadReposBtn) {
            loadReposBtn.addEventListener('click', () => this.loadRepositories());
        }
        
        // Repo selector
        const repoSelector = document.getElementById('github-repo-selector');
        if (repoSelector) {
            repoSelector.addEventListener('change', (e) => this.selectRepository(e.target.value));
        }
        
        // Branch selector
        const branchSelector = document.getElementById('github-branch-selector');
        if (branchSelector) {
            branchSelector.addEventListener('change', (e) => this.switchBranch(e.target.value));
        }
        
        // Action buttons
        const createBranchBtn = document.getElementById('github-create-branch-btn');
        if (createBranchBtn) {
            createBranchBtn.addEventListener('click', () => this.showCreateBranchDialog());
        }
        
        const commitBtn = document.getElementById('github-commit-btn');
        if (commitBtn) {
            commitBtn.addEventListener('click', () => this.showCommitDialog());
        }
        
        const createPRBtn = document.getElementById('github-create-pr-btn');
        if (createPRBtn) {
            createPRBtn.addEventListener('click', () => this.showCreatePRDialog());
        }
    }
    
    updateUI() {
        const authSection = document.getElementById('github-auth-section');
        const connectedSection = document.getElementById('github-connected-section');
        const usernameDisplay = document.getElementById('github-username-display');
        
        if (this.token && this.username) {
            // Show connected state
            if (authSection) authSection.style.display = 'none';
            if (connectedSection) connectedSection.style.display = 'block';
            if (usernameDisplay) usernameDisplay.textContent = this.username;
        } else {
            // Show auth state
            if (authSection) authSection.style.display = 'block';
            if (connectedSection) connectedSection.style.display = 'none';
        }
    }
    
    async loadRepositories() {
        try {
            const loadReposBtn = document.getElementById('github-load-repos-btn');
            if (loadReposBtn) {
                loadReposBtn.textContent = 'Loading...';
                loadReposBtn.disabled = true;
            }
            
            const repos = await this.listRepositories();
            
            const repoSelector = document.getElementById('github-repo-selector');
            if (repoSelector) {
                repoSelector.innerHTML = '<option value="">Select a repository...</option>';
                repos.forEach(repo => {
                    const option = document.createElement('option');
                    option.value = repo.full_name;
                    option.textContent = repo.full_name;
                    repoSelector.appendChild(option);
                });
                repoSelector.style.display = 'block';
            }
            
            if (loadReposBtn) {
                loadReposBtn.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Failed to load repositories:', error);
            this.showNotification('Failed to load repositories: ' + error.message, 'error');
            
            const loadReposBtn = document.getElementById('github-load-repos-btn');
            if (loadReposBtn) {
                loadReposBtn.textContent = 'Load Repositories';
                loadReposBtn.disabled = false;
            }
        }
    }
    
    async selectRepository(fullName) {
        if (!fullName) return;
        
        try {
            const [owner, repo] = fullName.split('/');
            this.currentRepo = { owner, repo, fullName };
            
            // Load branches
            const branches = await this.listBranches(owner, repo);
            const branchSelector = document.getElementById('github-branch-selector');
            if (branchSelector) {
                branchSelector.innerHTML = '';
                branches.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.name;
                    option.textContent = branch.name;
                    branchSelector.appendChild(option);
                });
                
                // Set current branch
                this.currentBranch = branches[0]?.name || 'main';
            }
            
            // Load file tree
            await this.loadFileTree();
            
            // Show repo details
            const repoDetails = document.getElementById('github-repo-details');
            if (repoDetails) {
                repoDetails.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Failed to select repository:', error);
            this.showNotification('Failed to load repository: ' + error.message, 'error');
        }
    }
    
    async loadFileTree() {
        if (!this.currentRepo) return;
        
        try {
            const { owner, repo } = this.currentRepo;
            const tree = await this.getRepositoryTree(owner, repo, this.currentBranch);
            
            const fileTreeDiv = document.getElementById('github-file-tree');
            if (fileTreeDiv) {
                fileTreeDiv.innerHTML = this.renderFileTree(tree);
            }
            
        } catch (error) {
            console.error('Failed to load file tree:', error);
            this.showNotification('Failed to load files: ' + error.message, 'error');
        }
    }
    
    renderFileTree(tree) {
        // Group by directories
        const filesByDir = {};
        tree.forEach(item => {
            if (item.type === 'blob') { // Files only
                const parts = item.path.split('/');
                const dir = parts.slice(0, -1).join('/') || '/';
                if (!filesByDir[dir]) filesByDir[dir] = [];
                filesByDir[dir].push(item);
            }
        });
        
        // Render
        let html = '<ul class="file-list">';
        Object.keys(filesByDir).sort().forEach(dir => {
            if (dir !== '/') {
                html += `<li class="directory">📁 ${dir}</li>`;
            }
            filesByDir[dir].forEach(file => {
                const fileName = file.path.split('/').pop();
                html += `
                    <li class="file" onclick="githubIntegration.openFile('${file.path}')">
                        📄 ${fileName}
                    </li>
                `;
            });
        });
        html += '</ul>';
        
        return html;
    }
    
    async openFile(path) {
        if (!this.currentRepo) return;
        
        try {
            const { owner, repo } = this.currentRepo;
            const fileData = await this.getFileContent(owner, repo, path, this.currentBranch);
            
            // Load file into editor
            if (window.editor) {
                window.editor.setValue(fileData.content);
                
                // Update editor metadata
                window.currentFile = {
                    path: fileData.path,
                    name: fileData.name,
                    sha: fileData.sha,
                    source: 'github',
                    repo: this.currentRepo
                };
                
                this.showNotification(`Opened: ${fileData.name}`, 'success');
            }
            
        } catch (error) {
            console.error('Failed to open file:', error);
            this.showNotification('Failed to open file: ' + error.message, 'error');
        }
    }
    
    async switchBranch(branchName) {
        this.currentBranch = branchName;
        await this.loadFileTree();
        this.showNotification(`Switched to branch: ${branchName}`, 'info');
    }
    
    // ============================================================================
    // DIALOGS
    // ============================================================================
    
    showAuthDialog(userCode, verificationUri) {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal github-auth-modal">
                <h3>🔐 GitHub Authentication</h3>
                <p>To connect your GitHub account:</p>
                <ol>
                    <li>Go to: <a href="${verificationUri}" target="_blank">${verificationUri}</a></li>
                    <li>Enter this code: <strong class="user-code">${userCode}</strong></li>
                    <li>Authorize the application</li>
                </ol>
                <div class="code-display">
                    <input type="text" value="${userCode}" readonly id="user-code-input">
                    <button onclick="document.getElementById('user-code-input').select(); document.execCommand('copy');">
                        📋 Copy Code
                    </button>
                </div>
                <p class="waiting">⏳ Waiting for authorization...</p>
                <button onclick="window.open('${verificationUri}', '_blank')" class="btn btn-primary">
                    Open GitHub
                </button>
            </div>
        `;
        dialog.id = 'github-auth-dialog';
        document.body.appendChild(dialog);
    }
    
    hideAuthDialog() {
        const dialog = document.getElementById('github-auth-dialog');
        if (dialog) {
            dialog.remove();
        }
    }
    
    showCreateBranchDialog() {
        const branchName = prompt('Enter new branch name:');
        if (!branchName) return;
        
        this.createBranchFromCurrent(branchName);
    }
    
    async createBranchFromCurrent(branchName) {
        if (!this.currentRepo) return;
        
        try {
            const { owner, repo } = this.currentRepo;
            await this.createBranch(owner, repo, branchName, this.currentBranch);
            
            // Refresh branches
            const branches = await this.listBranches(owner, repo);
            const branchSelector = document.getElementById('github-branch-selector');
            if (branchSelector) {
                branchSelector.innerHTML = '';
                branches.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.name;
                    option.textContent = branch.name;
                    if (branch.name === branchName) option.selected = true;
                    branchSelector.appendChild(option);
                });
            }
            
            this.currentBranch = branchName;
            this.showNotification(`Branch created: ${branchName}`, 'success');
            
        } catch (error) {
            console.error('Failed to create branch:', error);
            this.showNotification('Failed to create branch: ' + error.message, 'error');
        }
    }
    
    showCommitDialog() {
        const message = prompt('Commit message:');
        if (!message) return;
        
        this.commitCurrentFile(message);
    }
    
    async commitCurrentFile(message) {
        if (!this.currentRepo || !window.currentFile) {
            this.showNotification('No file open from GitHub', 'error');
            return;
        }
        
        try {
            const { owner, repo } = this.currentRepo;
            const path = window.currentFile.path;
            const content = window.editor ? window.editor.getValue() : '';
            
            await this.commitFile(owner, repo, path, content, message, this.currentBranch);
            
            this.showNotification(`Committed: ${message}`, 'success');
            
        } catch (error) {
            console.error('Failed to commit:', error);
            this.showNotification('Failed to commit: ' + error.message, 'error');
        }
    }
    
    showCreatePRDialog() {
        const title = prompt('Pull Request title:');
        if (!title) return;
        
        const body = prompt('Pull Request description (optional):');
        
        this.createPRFromCurrentBranch(title, body || '');
    }
    
    async createPRFromCurrentBranch(title, body) {
        if (!this.currentRepo) return;
        
        try {
            const { owner, repo } = this.currentRepo;
            const pr = await this.createPullRequest(owner, repo, title, this.currentBranch, 'main', body);
            
            this.showNotification(`Pull Request created: #${pr.number}`, 'success');
            
            // Open PR in new tab
            if (pr.html_url) {
                window.open(pr.html_url, '_blank');
            }
            
        } catch (error) {
            console.error('Failed to create PR:', error);
            this.showNotification('Failed to create PR: ' + error.message, 'error');
        }
    }
    
    // ============================================================================
    // UTILITIES
    // ============================================================================
    
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }
        
        // Fallback to simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Initialize GitHub integration when DOM is ready
let githubIntegration;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        githubIntegration = new GitHubIntegration();
        window.githubIntegration = githubIntegration;
    });
} else {
    githubIntegration = new GitHubIntegration();
    window.githubIntegration = githubIntegration;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubIntegration;
}

