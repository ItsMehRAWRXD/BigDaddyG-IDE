/**
 * BigDaddyG IDE - Auto-Updater System
 * Checks GitHub for updates and automatically patches files before launch
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AutoUpdater {
    constructor() {
        this.repoOwner = 'ItsMehRAWRXD';
        this.repoName = 'BigDaddyG-IDE';
        this.branch = this.detectCurrentBranch(); // Auto-detect current branch
        this.currentVersion = this.loadVersion();
        this.updateCheckUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/commits/${this.branch}`;
        this.rawContentUrl = `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/${this.branch}`;
        this.updateInProgress = false;
        this.updateWindow = null;
        
        console.log(`[AutoUpdater] 🔍 Tracking branch: ${this.branch}`);
    }
    
    /**
     * Detect current git branch
     */
    detectCurrentBranch() {
        try {
            const { execSync } = require('child_process');
            const branch = execSync('git rev-parse --abbrev-ref HEAD', {
                cwd: __dirname + '/..',
                encoding: 'utf8'
            }).trim();
            
            if (branch && branch !== 'HEAD') {
                console.log(`[AutoUpdater] 📍 Detected branch: ${branch}`);
                return branch;
            }
        } catch (error) {
            console.log('[AutoUpdater] ⚠️ Could not detect git branch, using main');
        }
        
        // Fallback to main if detection fails
        return 'main';
    }
    
    /**
     * Load current version from package.json
     */
    loadVersion() {
        try {
            const packagePath = path.join(__dirname, '..', 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return {
                version: packageJson.version || '1.0.0',
                lastCommit: this.loadLastCommit()
            };
        } catch (error) {
            console.error('[AutoUpdater] Error loading version:', error);
            return { version: '1.0.0', lastCommit: null };
        }
    }
    
    /**
     * Load last known commit SHA
     */
    loadLastCommit() {
        try {
            const versionFile = path.join(app.getPath('userData'), 'version.json');
            if (fs.existsSync(versionFile)) {
                const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
                return data.lastCommit;
            }
        } catch (error) {
            console.error('[AutoUpdater] Error loading last commit:', error);
        }
        return null;
    }
    
    /**
     * Save current commit SHA
     */
    saveLastCommit(commitSha) {
        try {
            const versionFile = path.join(app.getPath('userData'), 'version.json');
            const data = {
                version: this.currentVersion.version,
                lastCommit: commitSha,
                lastCheck: new Date().toISOString()
            };
            fs.writeFileSync(versionFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('[AutoUpdater] Error saving commit:', error);
        }
    }
    
    /**
     * Check for updates before app launch
     */
    async checkForUpdates() {
        if (this.updateInProgress) {
            console.log('[AutoUpdater] Update already in progress');
            return { hasUpdate: false };
        }
        
        console.log('[AutoUpdater] 🔍 Checking for updates on branch: ' + this.branch);
        
        // Warn if on development branch but still check for updates
        if (this.branch !== 'main' && !this.branch.startsWith('release/')) {
            console.log(`[AutoUpdater] ℹ️ Note: Tracking development branch: ${this.branch}`);
        }
        
        try {
            const latestCommit = await this.fetchLatestCommit();
            
            if (!latestCommit) {
                console.log('[AutoUpdater] ⚠️ Could not fetch latest commit');
                return { hasUpdate: false };
            }
            
            if (this.currentVersion.lastCommit === latestCommit.sha) {
                console.log('[AutoUpdater] ✅ Already up to date');
                return { hasUpdate: false };
            }
            
            console.log('[AutoUpdater] 🆕 Update available!');
            console.log(`[AutoUpdater]    Current: ${this.currentVersion.lastCommit || 'unknown'}`);
            console.log(`[AutoUpdater]    Latest:  ${latestCommit.sha}`);
            
            return {
                hasUpdate: true,
                latestCommit: latestCommit,
                currentCommit: this.currentVersion.lastCommit
            };
            
        } catch (error) {
            console.error('[AutoUpdater] ❌ Error checking for updates:', error);
            return { hasUpdate: false, error: error.message };
        }
    }
    
    /**
     * Fetch latest commit from GitHub
     */
    fetchLatestCommit() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${this.repoOwner}/${this.repoName}/commits/${this.branch}`,
                method: 'GET',
                headers: {
                    'User-Agent': 'BigDaddyG-IDE-AutoUpdater',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const commit = JSON.parse(data);
                            resolve({
                                sha: commit.sha,
                                message: commit.commit.message,
                                date: commit.commit.author.date,
                                author: commit.commit.author.name
                            });
                        } catch (error) {
                            reject(new Error('Failed to parse commit data'));
                        }
                    } else {
                        reject(new Error(`GitHub API returned ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        });
    }
    
    /**
     * Download and apply updates
     */
    async downloadAndApplyUpdates(updateInfo) {
        this.updateInProgress = true;
        
        try {
            // Show update window
            this.showUpdateWindow();
            
            // Get list of changed files
            const changedFiles = await this.getChangedFiles(
                this.currentVersion.lastCommit,
                updateInfo.latestCommit.sha
            );
            
            this.sendUpdateProgress('Downloading updates...', 10);
            
            if (changedFiles.length === 0) {
                console.log('[AutoUpdater] No files changed');
                this.saveLastCommit(updateInfo.latestCommit.sha);
                this.closeUpdateWindow();
                return { success: true, filesUpdated: 0 };
            }
            
            console.log(`[AutoUpdater] 📥 Downloading ${changedFiles.length} files...`);
            
            let updated = 0;
            const total = changedFiles.length;
            
            for (let i = 0; i < changedFiles.length; i++) {
                const file = changedFiles[i];
                const progress = Math.floor(((i + 1) / total) * 80) + 10;
                
                this.sendUpdateProgress(`Updating: ${file.filename}`, progress);
                
                try {
                    await this.downloadFile(file);
                    updated++;
                    console.log(`[AutoUpdater] ✅ Updated: ${file.filename}`);
                } catch (error) {
                    console.error(`[AutoUpdater] ❌ Failed to update ${file.filename}:`, error);
                }
            }
            
            // Save new commit SHA
            this.saveLastCommit(updateInfo.latestCommit.sha);
            
            this.sendUpdateProgress('Update complete!', 100);
            
            setTimeout(() => {
                this.closeUpdateWindow();
            }, 1000);
            
            console.log(`[AutoUpdater] 🎉 Updated ${updated}/${total} files`);
            
            return {
                success: true,
                filesUpdated: updated,
                totalFiles: total
            };
            
        } catch (error) {
            console.error('[AutoUpdater] ❌ Update failed:', error);
            this.closeUpdateWindow();
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.updateInProgress = false;
        }
    }
    
    /**
     * Get list of changed files between commits
     */
    async getChangedFiles(oldCommit, newCommit) {
        if (!oldCommit) {
            // First install - get all electron files
            return await this.getAllElectronFiles();
        }
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${this.repoOwner}/${this.repoName}/compare/${oldCommit}...${newCommit}`,
                method: 'GET',
                headers: {
                    'User-Agent': 'BigDaddyG-IDE-AutoUpdater',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            const comparison = JSON.parse(data);
                            const files = comparison.files
                                .filter(f => f.filename.startsWith('electron/') && 
                                           (f.filename.endsWith('.js') || 
                                            f.filename.endsWith('.html') || 
                                            f.filename.endsWith('.css')) &&
                                           f.status !== 'removed')
                                .map(f => ({
                                    filename: f.filename,
                                    status: f.status,
                                    sha: f.sha
                                }));
                            resolve(files);
                        } catch (error) {
                            reject(new Error('Failed to parse comparison data'));
                        }
                    } else {
                        reject(new Error(`GitHub API returned ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        });
    }
    
    /**
     * Get all electron files (for first install)
     */
    async getAllElectronFiles() {
        // Return list of core files that should always be updated
        return [
            { filename: 'electron/index.html', status: 'modified' },
            { filename: 'electron/complete-tab-system.js', status: 'modified' },
            { filename: 'electron/real-tab-functionality.js', status: 'modified' },
            { filename: 'electron/file-explorer-component.js', status: 'modified' },
            { filename: 'electron/interactive-terminal.js', status: 'modified' }
        ];
    }
    
    /**
     * Download individual file from GitHub
     */
    async downloadFile(file) {
        const url = `${this.rawContentUrl}/${file.filename}`;
        const localPath = path.join(__dirname, '..', file.filename);
        
        // Create directory if doesn't exist
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Backup existing file
        if (fs.existsSync(localPath)) {
            const backupPath = `${localPath}.backup`;
            fs.copyFileSync(localPath, backupPath);
        }
        
        return new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(localPath);
            
            https.get(url, (res) => {
                if (res.statusCode === 200) {
                    res.pipe(fileStream);
                    
                    fileStream.on('finish', () => {
                        fileStream.close();
                        resolve();
                    });
                } else {
                    reject(new Error(`Failed to download ${file.filename}: ${res.statusCode}`));
                }
            }).on('error', (error) => {
                fs.unlink(localPath, () => {});
                reject(error);
            });
        });
    }
    
    /**
     * Show update progress window
     */
    showUpdateWindow() {
        if (this.updateWindow) return;
        
        this.updateWindow = new BrowserWindow({
            width: 500,
            height: 200,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        
        this.updateWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(this.getUpdateWindowHTML())}`);
        this.updateWindow.center();
    }
    
    /**
     * Send update progress to window
     */
    sendUpdateProgress(message, progress) {
        if (this.updateWindow && !this.updateWindow.isDestroyed()) {
            this.updateWindow.webContents.send('update-progress', { message, progress });
        }
    }
    
    /**
     * Close update window
     */
    closeUpdateWindow() {
        if (this.updateWindow && !this.updateWindow.isDestroyed()) {
            this.updateWindow.close();
            this.updateWindow = null;
        }
    }
    
    /**
     * Get HTML for update window
     */
    getUpdateWindowHTML() {
        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0a0a1e 0%, #1a1a2e 100%);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 20px;
        }
        .update-container {
            background: rgba(26, 26, 46, 0.95);
            border: 2px solid #00d4ff;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            width: 100%;
            max-width: 450px;
        }
        .title {
            font-size: 24px;
            color: #00d4ff;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 14px;
            color: #888;
            margin-bottom: 15px;
            text-align: center;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff 0%, #00ff88 100%);
            width: 0%;
            transition: width 0.3s ease;
        }
        .percentage {
            font-size: 18px;
            color: #00ff88;
            text-align: center;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="update-container">
        <div class="title">🔄 Updating BigDaddyG IDE</div>
        <div class="message" id="message">Checking for updates...</div>
        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
        </div>
        <div class="percentage" id="percentage">0%</div>
    </div>
    
    <script>
        const { ipcRenderer } = require('electron');
        
        ipcRenderer.on('update-progress', (event, data) => {
            document.getElementById('message').textContent = data.message;
            document.getElementById('progress-fill').style.width = data.progress + '%';
            document.getElementById('percentage').textContent = data.progress + '%';
        });
    </script>
</body>
</html>
        `;
    }
    
    /**
     * Check for updates on app startup
     */
    async checkAndUpdate() {
        const updateInfo = await this.checkForUpdates();
        
        if (updateInfo.hasUpdate) {
            const result = await this.downloadAndApplyUpdates(updateInfo);
            return result;
        }
        
        return { hasUpdate: false };
    }
}

module.exports = AutoUpdater;
