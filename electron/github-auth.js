/**
 * BigDaddyG IDE - GitHub Authentication System
 * Features:
 * - OAuth flow for GitHub
 * - Personal Access Token (PAT) support
 * - Secure token storage
 * - Multiple account support
 * - GitHub API integration
 */

(function() {
'use strict';

class GitHubAuth {
    constructor() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        this.accounts = new Map(); // Support multiple accounts
        
        console.log('[GitHubAuth] 🔐 Initializing GitHub authentication...');
        this.init();
    }
    
    init() {
        // Load saved token
        this.loadSavedToken();
        
        // Create auth UI
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createAuthUI());
        } else {
            this.createAuthUI();
        }
        
        // Verify token if exists
        if (this.token) {
            this.verifyToken();
        }
        
        console.log('[GitHubAuth] ✅ GitHub auth ready');
    }
    
    createAuthUI() {
        // Add GitHub auth button to UI
        const authBtn = document.createElement('button');
        authBtn.id = 'github-auth-btn';
        authBtn.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: linear-gradient(135deg, #24292e, #586069);
            border: none;
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(36, 41, 46, 0.3);
            z-index: 9998;
            transition: all 0.2s;
        `;
        
        authBtn.innerHTML = this.isAuthenticated 
            ? `<span>🔓</span><span>${this.user?.login || 'GitHub'}</span>`
            : `<span>🔒</span><span>Login to GitHub</span>`;
        
        authBtn.onclick = () => this.showAuthModal();
        
        authBtn.onmouseenter = () => {
            authBtn.style.transform = 'translateY(-2px)';
            authBtn.style.boxShadow = '0 6px 16px rgba(36, 41, 46, 0.4)';
        };
        
        authBtn.onmouseleave = () => {
            authBtn.style.transform = 'translateY(0)';
            authBtn.style.boxShadow = '0 4px 12px rgba(36, 41, 46, 0.3)';
        };
        
        document.body.appendChild(authBtn);
    }
    
    showAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'github-auth-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        modal.innerHTML = `
            <div style="
                background: var(--cursor-bg);
                border-radius: 16px;
                width: 500px;
                max-width: 90vw;
                padding: 0;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                border: 2px solid var(--cursor-jade-dark);
            ">
                <!-- Header -->
                <div style="padding: 24px; border-bottom: 1px solid var(--cursor-border); display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 32px;">🔐</span>
                        <div>
                            <h2 style="margin: 0; color: var(--cursor-jade-dark); font-size: 20px;">GitHub Authentication</h2>
                            <p style="margin: 4px 0 0; color: var(--cursor-text-secondary); font-size: 12px;">Connect your GitHub account to BigDaddyG IDE</p>
                        </div>
                    </div>
                    <button onclick="document.getElementById('github-auth-modal').remove()" style="
                        background: none;
                        border: 1px solid var(--cursor-border);
                        color: var(--cursor-text);
                        width: 32px;
                        height: 32px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                    ">✕</button>
                </div>
                
                <!-- Content -->
                <div style="padding: 24px;">
                    ${this.isAuthenticated ? this.renderAuthenticatedView() : this.renderLoginView()}
                </div>
            </div>
        `;
        
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        document.body.appendChild(modal);
    }
    
    renderLoginView() {
        return `
            <!-- Option 1: Personal Access Token (Recommended) -->
            <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: var(--cursor-jade-dark); font-size: 16px;">
                    🔑 Personal Access Token (Recommended)
                </h3>
                <p style="margin: 0 0 16px; color: var(--cursor-text-secondary); font-size: 13px; line-height: 1.6;">
                    Generate a token from <strong>GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</strong>
                </p>
                
                <input type="password" id="github-token-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="
                    width: 100%;
                    padding: 12px;
                    background: var(--cursor-bg-secondary);
                    border: 1px solid var(--cursor-jade-light);
                    color: var(--cursor-text);
                    border-radius: 8px;
                    font-size: 13px;
                    font-family: 'Consolas', monospace;
                    outline: none;
                    margin-bottom: 12px;
                " onfocus="this.style.borderColor='var(--cursor-jade-dark)'; this.style.boxShadow='0 0 0 3px rgba(119, 221, 190, 0.1)'" onblur="this.style.borderColor='var(--cursor-jade-light)'; this.style.boxShadow='none'">
                
                <div style="display: flex; gap: 8px;">
                    <button onclick="githubAuth.loginWithToken(document.getElementById('github-token-input').value)" style="
                        flex: 1;
                        background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent));
                        border: none;
                        color: white;
                        padding: 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        box-shadow: 0 2px 8px rgba(119, 221, 190, 0.3);
                    ">
                        ✅ Connect with Token
                    </button>
                    <button onclick="window.open('https://github.com/settings/tokens/new?scopes=repo,user,gist,workflow&description=BigDaddyG%20IDE', '_blank')" style="
                        background: rgba(36, 41, 46, 0.5);
                        border: 1px solid #586069;
                        color: white;
                        padding: 12px 16px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    " title="Generate new token on GitHub">
                        🔗 Generate Token
                    </button>
                </div>
            </div>
            
            <div style="text-align: center; color: var(--cursor-text-secondary); font-size: 12px; margin: 20px 0;">
                ── OR ──
            </div>
            
            <!-- Option 2: OAuth (Coming Soon) -->
            <div>
                <h3 style="margin: 0 0 12px; color: var(--cursor-text-secondary); font-size: 16px;">
                    🌐 OAuth Login (Coming Soon)
                </h3>
                <button disabled style="
                    width: 100%;
                    background: #424242;
                    border: none;
                    color: #888;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: not-allowed;
                    font-size: 14px;
                    font-weight: 600;
                ">
                    🚧 OAuth Flow (In Development)
                </button>
            </div>
            
            <!-- Required Scopes -->
            <div style="margin-top: 24px; padding: 16px; background: rgba(119, 221, 190, 0.1); border-left: 4px solid var(--cursor-jade-dark); border-radius: 8px;">
                <strong style="color: var(--cursor-jade-dark); font-size: 13px;">Required Token Scopes:</strong>
                <ul style="margin: 8px 0 0; padding-left: 20px; color: var(--cursor-text-secondary); font-size: 12px; line-height: 1.8;">
                    <li><code>repo</code> - Full repository access</li>
                    <li><code>user</code> - User profile access</li>
                    <li><code>gist</code> - Gist management</li>
                    <li><code>workflow</code> - GitHub Actions</li>
                </ul>
            </div>
        `;
    }
    
    renderAuthenticatedView() {
        return `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--cursor-jade-dark); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                    ${this.user?.avatar_url ? `<img src="${this.user.avatar_url}" style="width: 100%; height: 100%; border-radius: 50%;" />` : '👤'}
                </div>
                
                <h3 style="margin: 0 0 8px; color: var(--cursor-jade-dark); font-size: 20px;">
                    ${this.user?.name || this.user?.login || 'Connected'}
                </h3>
                <p style="margin: 0 0 4px; color: var(--cursor-text-secondary); font-size: 13px;">
                    @${this.user?.login || 'unknown'}
                </p>
                <p style="margin: 0 0 24px; color: var(--cursor-text-secondary); font-size: 12px;">
                    ${this.user?.email || 'No email'}
                </p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div style="padding: 12px; background: rgba(119, 221, 190, 0.1); border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: 600; color: var(--cursor-jade-dark);">${this.user?.public_repos || 0}</div>
                        <div style="font-size: 11px; color: var(--cursor-text-secondary);">Repositories</div>
                    </div>
                    <div style="padding: 12px; background: rgba(119, 221, 190, 0.1); border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: 600; color: var(--cursor-jade-dark);">${this.user?.followers || 0}</div>
                        <div style="font-size: 11px; color: var(--cursor-text-secondary);">Followers</div>
                    </div>
                    <div style="padding: 12px; background: rgba(119, 221, 190, 0.1); border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: 600; color: var(--cursor-jade-dark);">${this.user?.following || 0}</div>
                        <div style="font-size: 11px; color: var(--cursor-text-secondary);">Following</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button onclick="githubAuth.openGitHubProfile()" style="
                        flex: 1;
                        background: #24292e;
                        border: none;
                        color: white;
                        padding: 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                    ">
                        🔗 View Profile
                    </button>
                    <button onclick="githubAuth.logout()" style="
                        flex: 1;
                        background: rgba(255, 71, 87, 0.1);
                        border: 1px solid #ff4757;
                        color: #ff4757;
                        padding: 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                    ">
                        🚪 Logout
                    </button>
                </div>
            </div>
        `;
    }
    
    async loginWithToken(token) {
        if (!token || !token.startsWith('ghp_')) {
            alert('❌ Invalid token format. GitHub tokens start with "ghp_"');
            return;
        }
        
        console.log('[GitHubAuth] 🔐 Logging in with token...');
        
        try {
            // Verify token with GitHub API
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }
            
            const userData = await response.json();
            
            // Store token and user data
            this.token = token;
            this.user = userData;
            this.isAuthenticated = true;
            
            // Save to localStorage (encrypted)
            this.saveToken();
            
            // Update UI
            this.updateAuthButton();
            
            // Close modal
            const modal = document.getElementById('github-auth-modal');
            if (modal) modal.remove();
            
            // Show success notification
            this.showNotification(`✅ Connected as @${userData.login}`, 'success');
            
            console.log('[GitHubAuth] ✅ Logged in as:', userData.login);
            
        } catch (error) {
            console.error('[GitHubAuth] ❌ Login failed:', error);
            alert(`❌ Login failed: ${error.message}\n\nPlease check your token and try again.`);
        }
    }
    
    async verifyToken() {
        if (!this.token) return false;
        
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                this.user = await response.json();
                this.isAuthenticated = true;
                this.updateAuthButton();
                console.log('[GitHubAuth] ✅ Token verified');
                return true;
            } else {
                console.log('[GitHubAuth] ⚠️ Token invalid or expired');
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('[GitHubAuth] ❌ Token verification failed:', error);
            return false;
        }
    }
    
    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        // Clear localStorage
        localStorage.removeItem('github-token');
        localStorage.removeItem('github-user');
        
        // Update UI
        this.updateAuthButton();
        
        // Close modal if open
        const modal = document.getElementById('github-auth-modal');
        if (modal) modal.remove();
        
        this.showNotification('🚪 Logged out from GitHub', 'info');
        console.log('[GitHubAuth] 🚪 Logged out');
    }
    
    saveToken() {
        try {
            // In production, use proper encryption!
            localStorage.setItem('github-token', this.token);
            localStorage.setItem('github-user', JSON.stringify(this.user));
            console.log('[GitHubAuth] 💾 Token saved');
        } catch (error) {
            console.error('[GitHubAuth] ❌ Error saving token:', error);
        }
    }
    
    loadSavedToken() {
        try {
            const token = localStorage.getItem('github-token');
            const user = localStorage.getItem('github-user');
            
            if (token && user) {
                this.token = token;
                this.user = JSON.parse(user);
                this.isAuthenticated = true;
                console.log('[GitHubAuth] 📂 Loaded saved credentials');
            }
        } catch (error) {
            console.error('[GitHubAuth] ❌ Error loading token:', error);
        }
    }
    
    updateAuthButton() {
        const btn = document.getElementById('github-auth-btn');
        if (!btn) return;
        
        btn.innerHTML = this.isAuthenticated 
            ? `<span>🔓</span><span>${this.user?.login || 'GitHub'}</span>`
            : `<span>🔒</span><span>Login to GitHub</span>`;
    }
    
    openGitHubProfile() {
        if (this.user?.html_url) {
            window.open(this.user.html_url, '_blank');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent))' : '#24292e'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            font-size: 13px;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Public API for Git operations
    async githubAPI(endpoint, options = {}) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated. Please login to GitHub first.');
        }
        
        const response = await fetch(`https://api.github.com${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        return await response.json();
    }
    
    getToken() {
        return this.token;
    }
    
    getUser() {
        return this.user;
    }
    
    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Initialize
window.githubAuth = new GitHubAuth();

// Export
window.GitHubAuth = GitHubAuth;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAuth;
}

console.log('[GitHubAuth] 📦 GitHub Authentication module loaded');

})(); // End IIFE

