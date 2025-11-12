/**
 * Simple Git-Based Auto-Updater
 * Uses git pull to automatically update before launch
 */

const { execSync } = require('child_process');
const path = require('path');

class SimpleAutoUpdater {
    constructor() {
        this.repoPath = path.join(__dirname, '..');
        this.targetBranch = 'cursor/fix-monaco-editor-to-main-branch-32ca'; // FORCE CORRECT BRANCH
        this.currentBranch = this.getCurrentBranch();
        
        console.log(`[AutoUpdater] 📍 Current branch: ${this.currentBranch}`);
        console.log(`[AutoUpdater] 🎯 Target branch: ${this.targetBranch}`);
        
        // Auto-switch if on wrong branch
        if (this.currentBranch !== this.targetBranch) {
            console.log(`[AutoUpdater] ⚠️ Wrong branch detected! Switching to ${this.targetBranch}...`);
            this.switchBranch();
        }
        
        this.branch = this.targetBranch;
    }
    
    switchBranch() {
        try {
            // Stash any local changes
            try {
                execSync('git stash', {
                    cwd: this.repoPath,
                    encoding: 'utf8',
                    stdio: 'pipe'
                });
                console.log(`[AutoUpdater] 💾 Stashed local changes`);
            } catch (e) {
                // No changes to stash
            }
            
            // Fetch latest
            execSync('git fetch origin', {
                cwd: this.repoPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            // Checkout correct branch
            execSync(`git checkout ${this.targetBranch}`, {
                cwd: this.repoPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            console.log(`[AutoUpdater] ✅ Switched to branch: ${this.targetBranch}`);
        } catch (error) {
            console.error(`[AutoUpdater] ❌ Failed to switch branch:`, error.message);
        }
    }
    
    getCurrentBranch() {
        try {
            const branch = execSync('git rev-parse --abbrev-ref HEAD', {
                cwd: this.repoPath,
                encoding: 'utf8'
            }).trim();
            return branch;
        } catch (error) {
            console.error('[AutoUpdater] ❌ Could not detect branch:', error.message);
            return 'main';
        }
    }
    
    async checkAndUpdate() {
        console.log('[AutoUpdater] 🔍 Checking for updates...');
        
        try {
            // Step 1: Fetch latest from origin
            console.log('[AutoUpdater] 📡 Fetching from GitHub...');
            execSync('git fetch origin', {
                cwd: this.repoPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            // Step 2: Check if there are updates
            const localSHA = execSync('git rev-parse HEAD', {
                cwd: this.repoPath,
                encoding: 'utf8'
            }).trim();
            
            const remoteSHA = execSync(`git rev-parse origin/${this.branch}`, {
                cwd: this.repoPath,
                encoding: 'utf8'
            }).trim();
            
            if (localSHA === remoteSHA) {
                console.log('[AutoUpdater] ✅ Already up to date');
                return { updated: false, message: 'Already up to date' };
            }
            
            console.log('[AutoUpdater] 🆕 Updates available!');
            console.log(`[AutoUpdater]    Local:  ${localSHA.substring(0, 7)}`);
            console.log(`[AutoUpdater]    Remote: ${remoteSHA.substring(0, 7)}`);
            
            // Step 3: Stash any local changes
            try {
                execSync('git stash', {
                    cwd: this.repoPath,
                    encoding: 'utf8',
                    stdio: 'pipe'
                });
                console.log('[AutoUpdater] 💾 Local changes stashed');
            } catch (stashError) {
                // No changes to stash, that's fine
            }
            
            // Step 4: Pull latest code
            console.log('[AutoUpdater] 📥 Pulling latest code...');
            const pullOutput = execSync(`git pull origin ${this.branch}`, {
                cwd: this.repoPath,
                encoding: 'utf8'
            });
            
            console.log('[AutoUpdater] ✅ Code updated!');
            console.log(pullOutput);
            
            // Step 5: Check if package.json changed (need npm install)
            const changedFiles = execSync('git diff --name-only HEAD@{1} HEAD', {
                cwd: this.repoPath,
                encoding: 'utf8'
            }).trim().split('\n');
            
            if (changedFiles.includes('package.json')) {
                console.log('[AutoUpdater] 📦 package.json changed, running npm install...');
                execSync('npm install', {
                    cwd: this.repoPath,
                    encoding: 'utf8',
                    stdio: 'inherit'
                });
                console.log('[AutoUpdater] ✅ Dependencies updated');
            }
            
            return {
                updated: true,
                message: 'Successfully updated',
                changedFiles: changedFiles.length,
                needsRestart: true
            };
            
        } catch (error) {
            console.error('[AutoUpdater] ❌ Update failed:', error.message);
            return {
                updated: false,
                error: error.message,
                message: 'Update failed, continuing with current version'
            };
        }
    }
}

module.exports = SimpleAutoUpdater;
