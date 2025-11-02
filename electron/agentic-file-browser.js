/**
 * BigDaddyG IDE - Agentic File Browser
 * AI-powered file browser that can:
 * - Scan and understand project structure
 * - Edit code autonomously
 * - Run/compile files
 * - Deep research with internet access
 * - Self-improve over time
 */

(function() {
'use strict';

class AgenticFileBrowser {
    constructor() {
        this.currentPath = null;
        this.projectStructure = null;
        this.fileCache = new Map();
        this.agentMode = false;
        this.runningTasks = new Map();
        this.learningData = {
            patterns: [],
            improvements: [],
            suggestions: []
        };
        
        console.log('[AgenticBrowser] 🤖 Initializing agentic file browser...');
    }
    
    async init() {
        // Load agentic browser UI
        this.createUI();
        
        // Start autonomous scanning
        await this.startAutonomousMode();
        
        console.log('[AgenticBrowser] ✅ Agentic file browser ready!');
    }
    
    createUI() {
        // Add agentic controls to file explorer
        const explorerTab = document.querySelector('[data-tab="explorer"]');
        
        if (explorerTab) {
            const agenticControls = document.createElement('div');
            agenticControls.style.cssText = `
                padding: 12px;
                background: linear-gradient(135deg, rgba(119, 221, 190, 0.1), rgba(119, 221, 190, 0.05));
                border-bottom: 1px solid var(--cursor-border);
                border-radius: 8px;
                margin-bottom: 12px;
            `;
            
            agenticControls.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 16px;">🤖</span>
                    <span style="font-weight: 600; font-size: 13px; color: var(--cursor-jade-dark);">Agentic Mode</span>
                    <label style="margin-left: auto; display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="agent-mode-toggle" onchange="agenticBrowser.toggleAgentMode(this.checked)" style="margin-right: 6px;">
                        <span style="font-size: 11px; color: var(--cursor-text-secondary);">Enable</span>
                    </label>
                </div>
                
                <div id="agent-status" style="font-size: 10px; color: var(--cursor-text-secondary); margin-bottom: 8px;">
                    ⚪ Standby - Enable agent mode to start
                </div>
                
                <div style="display: flex; gap: 6px;">
                    <button onclick="agenticBrowser.scanProject()" style="flex: 1; background: rgba(119, 221, 190, 0.15); border: 1px solid var(--cursor-jade-light); color: var(--cursor-jade-dark); padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                        🔍 Scan
                    </button>
                    <button onclick="agenticBrowser.analyzeCode()" style="flex: 1; background: rgba(119, 221, 190, 0.15); border: 1px solid var(--cursor-jade-light); color: var(--cursor-jade-dark); padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                        🧠 Analyze
                    </button>
                    <button onclick="agenticBrowser.autoFix()" style="flex: 1; background: rgba(119, 221, 190, 0.15); border: 1px solid var(--cursor-jade-light); color: var(--cursor-jade-dark); padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                        🔧 Fix
                    </button>
                    <button onclick="agenticBrowser.runAll()" style="flex: 1; background: rgba(119, 221, 190, 0.15); border: 1px solid var(--cursor-jade-light); color: var(--cursor-jade-dark); padding: 6px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 600;">
                        ▶️ Run
                    </button>
                </div>
            `;
            
            const explorerContent = document.querySelector('#explorer-tab-content');
            if (explorerContent) {
                explorerContent.insertBefore(agenticControls, explorerContent.firstChild);
            }
        }
    }
    
    async toggleAgentMode(enabled) {
        this.agentMode = enabled;
        
        const status = document.getElementById('agent-status');
        
        if (enabled) {
            status.innerHTML = '🟢 Agent Active - Monitoring project...';
            status.style.color = 'var(--cursor-jade-dark)';
            
            await this.startAutonomousMode();
            
            this.showNotification('🤖 Agentic mode enabled! AI is now monitoring your project.', 'success');
        } else {
            status.innerHTML = '⚪ Standby - Agent mode disabled';
            status.style.color = 'var(--cursor-text-secondary)';
            
            this.stopAutonomousMode();
            
            this.showNotification('Agentic mode disabled', 'info');
        }
    }
    
    async startAutonomousMode() {
        if (!this.agentMode) return;
        
        console.log('[AgenticBrowser] 🤖 Starting autonomous mode...');
        
        // Initial scan
        await this.scanProject();
        
        // Monitor file changes
        this.startFileWatcher();
        
        // Background analysis loop
        this.startAnalysisLoop();
        
        // Self-improvement loop
        this.startSelfImprovementLoop();
    }
    
    stopAutonomousMode() {
        console.log('[AgenticBrowser] 🛑 Stopping autonomous mode...');
        
        // Stop all loops
        if (this.fileWatcherInterval) {
            clearInterval(this.fileWatcherInterval);
        }
        
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
        
        if (this.improvementInterval) {
            clearInterval(this.improvementInterval);
        }
    }
    
    async scanProject() {
        console.log('[AgenticBrowser] 🔍 Scanning project...');
        
        this.updateStatus('🔍 Scanning project files...');
        
        try {
            // Get project root
            const projectRoot = await this.getProjectRoot();
            
            if (!projectRoot) {
                this.showNotification('⚠️ No project opened', 'warning');
                return;
            }
            
            // Read all files recursively
            if (window.electron && window.electron.readDirRecursive) {
                const files = await window.electron.readDirRecursive(projectRoot);
                
                // Analyze project structure
                this.projectStructure = await this.analyzeProjectStructure(files);
                
                console.log('[AgenticBrowser] ✅ Scan complete:', files.length, 'files found');
                
                this.updateStatus(`✅ Scan complete: ${files.length} files analyzed`);
                
                this.showNotification(`Scanned ${files.length} files`, 'success');
                
                // If in agent mode, auto-analyze
                if (this.agentMode) {
                    setTimeout(() => this.analyzeCode(), 2000);
                }
            }
            
        } catch (error) {
            console.error('[AgenticBrowser] ❌ Scan error:', error);
            this.showNotification('Scan failed: ' + error.message, 'error');
        }
    }
    
    async analyzeProjectStructure(files) {
        console.log('[AgenticBrowser] 🧠 Analyzing project structure...');
        
        const structure = {
            totalFiles: files.length,
            languages: new Map(),
            frameworks: new Set(),
            entryPoints: [],
            dependencies: [],
            tests: [],
            buildFiles: [],
            config: []
        };
        
        files.forEach(file => {
            const fileName = file.split('/').pop();
            const ext = fileName.split('.').pop().toLowerCase();
            
            // Count languages
            const langMap = {
                'js': 'JavaScript', 'ts': 'TypeScript', 'py': 'Python',
                'java': 'Java', 'c': 'C', 'cpp': 'C++', 'cs': 'C#',
                'go': 'Go', 'rs': 'Rust', 'rb': 'Ruby', 'php': 'PHP'
            };
            
            if (langMap[ext]) {
                structure.languages.set(langMap[ext], (structure.languages.get(langMap[ext]) || 0) + 1);
            }
            
            // Detect frameworks
            if (fileName === 'package.json') {
                structure.frameworks.add('Node.js');
            } else if (fileName === 'requirements.txt' || fileName === 'setup.py') {
                structure.frameworks.add('Python');
            } else if (fileName === 'Cargo.toml') {
                structure.frameworks.add('Rust');
            } else if (fileName === 'go.mod') {
                structure.frameworks.add('Go');
            }
            
            // Find entry points
            if (fileName === 'main.js' || fileName === 'index.js' || 
                fileName === 'main.py' || fileName === 'main.go' ||
                fileName === 'Main.java') {
                structure.entryPoints.push(file);
            }
            
            // Find tests
            if (fileName.includes('test') || fileName.includes('spec')) {
                structure.tests.push(file);
            }
            
            // Find build files
            if (fileName === 'Makefile' || fileName === 'build.sh' ||
                fileName === 'webpack.config.js' || fileName === 'vite.config.js') {
                structure.buildFiles.push(file);
            }
            
            // Find config files
            if (fileName.endsWith('.json') || fileName.endsWith('.yaml') ||
                fileName.endsWith('.toml') || fileName.endsWith('.ini')) {
                structure.config.push(file);
            }
        });
        
        return structure;
    }
    
    async analyzeCode() {
        if (!this.projectStructure) {
            await this.scanProject();
            return;
        }
        
        console.log('[AgenticBrowser] 🧠 Analyzing code with AI...');
        
        this.updateStatus('🧠 AI is analyzing your code...');
        
        try {
            // Get AI analysis
            const analysis = await this.getAIAnalysis();
            
            console.log('[AgenticBrowser] ✅ Analysis complete');
            
            this.updateStatus('✅ Analysis complete - Check AI chat for insights');
            
            // Display analysis
            this.displayAnalysis(analysis);
            
        } catch (error) {
            console.error('[AgenticBrowser] ❌ Analysis error:', error);
            this.showNotification('Analysis failed: ' + error.message, 'error');
        }
    }
    
    async getAIAnalysis() {
        // Build analysis prompt
        const prompt = this.buildAnalysisPrompt();
        
        // Send to AI (Orchestra or Multi AI if available)
        let response;
        
        if (window.unifiedExtensions && window.unifiedExtensions.multiAIServer.status === 'running') {
            // Use Multi AI for deeper analysis
            console.log('[AgenticBrowser] Using Multi AI for analysis...');
            response = await window.unifiedExtensions.queryMultiAI(prompt);
        } else {
            // Use local Orchestra AI
            console.log('[AgenticBrowser] Using Orchestra AI for analysis...');
            response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    model: 'BigDaddyG:Latest',
                    parameters: {
                        temperature: 0.3, // Lower temperature for code analysis
                        max_tokens: 8192
                    },
                    deep_research: true,
                    include_thinking: true
                })
            });
            
            if (!response.ok) {
                throw new Error(`AI returned ${response.status}`);
            }
            
            const data = await response.json();
            response = data.response || data.message;
        }
        
        return response;
    }
    
    buildAnalysisPrompt() {
        const struct = this.projectStructure;
        
        const languages = Array.from(struct.languages.entries())
            .map(([lang, count]) => `${lang}: ${count} files`)
            .join(', ');
        
        const frameworks = Array.from(struct.frameworks).join(', ');
        
        return `
I am an agentic file browser analyzing a codebase. Please provide a comprehensive analysis:

**Project Structure:**
- Total Files: ${struct.totalFiles}
- Languages: ${languages || 'None detected'}
- Frameworks: ${frameworks || 'None detected'}
- Entry Points: ${struct.entryPoints.length}
- Tests: ${struct.tests.length}
- Build Files: ${struct.buildFiles.length}

**Analysis Requested:**
1. Project architecture and design patterns
2. Potential bugs or code smells
3. Security vulnerabilities
4. Performance optimization opportunities
5. Missing features or improvements
6. Recommended next steps

**Deep Research:**
- Search online for best practices for detected languages/frameworks
- Find similar projects and compare architecture
- Identify modern alternatives or upgrades

Please provide actionable insights and specific recommendations.
        `.trim();
    }
    
    displayAnalysis(analysis) {
        // Display analysis in AI chat
        if (window.floatingChat) {
            window.floatingChat.open();
            
            // Add analysis message
            const container = document.getElementById('floating-chat-messages');
            if (container) {
                const analysisMsg = document.createElement('div');
                analysisMsg.style.cssText = `
                    margin-bottom: 16px;
                    padding: 14px;
                    background: rgba(119, 221, 190, 0.1);
                    border-left: 4px solid var(--cursor-jade-dark);
                    border-radius: 8px;
                `;
                
                analysisMsg.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 16px;">🤖</span>
                        <span style="font-weight: 600; color: var(--cursor-jade-dark);">Agentic Browser Analysis</span>
                        <span style="font-size: 10px; color: var(--cursor-text-secondary);">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div style="color: var(--cursor-text); white-space: pre-wrap; font-size: 13px; line-height: 1.6; user-select: text;">
                        ${typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
                    </div>
                `;
                
                container.appendChild(analysisMsg);
                container.scrollTop = container.scrollHeight;
            }
        }
    }
    
    async autoFix() {
        console.log('[AgenticBrowser] 🔧 Auto-fixing issues...');
        
        this.updateStatus('🔧 AI is fixing issues...');
        
        this.showNotification('🔧 Auto-fix started...', 'info');
        
        try {
            // Get AI to fix issues
            const fixes = await this.getAIFixes();
            
            // Apply fixes
            await this.applyFixes(fixes);
            
            this.updateStatus('✅ Auto-fix complete');
            
            this.showNotification('✅ Issues fixed!', 'success');
            
        } catch (error) {
            console.error('[AgenticBrowser] ❌ Auto-fix error:', error);
            this.showNotification('Auto-fix failed: ' + error.message, 'error');
        }
    }
    
    async getAIFixes() {
        // Get current file
        const currentFile = window.editor?.getValue();
        
        if (!currentFile) {
            throw new Error('No file open');
        }
        
        const prompt = `
Fix any bugs, improve code quality, and optimize performance in this code:

\`\`\`
${currentFile}
\`\`\`

Return ONLY the fixed code, no explanations.
        `.trim();
        
        const response = await fetch('http://localhost:11441/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: prompt,
                model: 'BigDaddyG:Latest',
                parameters: { temperature: 0.2 }
            })
        });
        
        if (!response.ok) {
            throw new Error(`AI returned ${response.status}`);
        }
        
        const data = await response.json();
        return data.response || data.message;
    }
    
    async applyFixes(fixedCode) {
        // Extract code from markdown if present
        let code = fixedCode;
        
        const codeBlockMatch = code.match(/```[\w]*\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
            code = codeBlockMatch[1];
        }
        
        // Apply to editor
        if (window.editor) {
            window.editor.setValue(code);
            console.log('[AgenticBrowser] ✅ Fixes applied');
        }
    }
    
    async runAll() {
        console.log('[AgenticBrowser] ▶️ Running all entry points...');
        
        if (!this.projectStructure) {
            await this.scanProject();
        }
        
        const entryPoints = this.projectStructure.entryPoints;
        
        if (entryPoints.length === 0) {
            this.showNotification('No entry points found', 'warning');
            return;
        }
        
        this.updateStatus(`▶️ Running ${entryPoints.length} entry point(s)...`);
        
        for (const entry of entryPoints) {
            await this.runFile(entry);
        }
        
        this.updateStatus('✅ All entry points executed');
    }
    
    async runFile(filePath) {
        console.log('[AgenticBrowser] ▶️ Running:', filePath);
        
        const ext = filePath.split('.').pop().toLowerCase();
        
        // Map extensions to runtimes
        const runtimeMap = {
            'js': 'node',
            'py': 'python',
            'java': 'java',
            'go': 'go run',
            'rs': 'cargo run',
            'rb': 'ruby',
            'php': 'php'
        };
        
        const runtime = runtimeMap[ext];
        
        if (!runtime) {
            console.warn('[AgenticBrowser] No runtime for:', ext);
            return;
        }
        
        if (window.electron && window.electron.exec) {
            try {
                const result = await window.electron.exec(`${runtime} ${filePath}`);
                
                console.log('[AgenticBrowser] ✅ Output:', result.stdout);
                
                if (result.stderr) {
                    console.error('[AgenticBrowser] ❌ Error:', result.stderr);
                }
                
                // Display output
                this.displayOutput(filePath, result.stdout, result.stderr);
                
            } catch (error) {
                console.error('[AgenticBrowser] ❌ Execution error:', error);
            }
        }
    }
    
    displayOutput(file, stdout, stderr) {
        // Display in terminal panel or create output panel
        console.log(`[AgenticBrowser] Output from ${file}:`);
        console.log('STDOUT:', stdout);
        if (stderr) console.error('STDERR:', stderr);
        
        // Could display in UI terminal panel here
    }
    
    startFileWatcher() {
        // Watch for file changes
        this.fileWatcherInterval = setInterval(() => {
            if (!this.agentMode) return;
            
            // Check for file changes
            // In real implementation, use fs.watch or similar
            
        }, 5000); // Check every 5 seconds
    }
    
    startAnalysisLoop() {
        // Periodic analysis
        this.analysisInterval = setInterval(async () => {
            if (!this.agentMode) return;
            
            console.log('[AgenticBrowser] 🔄 Periodic analysis...');
            
            // Re-scan and analyze
            await this.scanProject();
            
        }, 60000); // Every minute
    }
    
    startSelfImprovementLoop() {
        // AI learns from usage and improves
        this.improvementInterval = setInterval(async () => {
            if (!this.agentMode) return;
            
            console.log('[AgenticBrowser] 🧠 Self-improvement check...');
            
            // Analyze patterns
            await this.analyzeBehaviorPatterns();
            
            // Suggest improvements
            await this.suggestImprovements();
            
        }, 300000); // Every 5 minutes
    }
    
    async analyzeBehaviorPatterns() {
        // Learn from user behavior
        // Track what files are edited most, what errors occur, etc.
        
        console.log('[AgenticBrowser] Learning from usage patterns...');
        
        // Store learning data
        this.learningData.patterns.push({
            timestamp: Date.now(),
            projectStructure: this.projectStructure,
            userActions: this.getUserActions()
        });
    }
    
    getUserActions() {
        // Track user actions (files opened, edits made, etc.)
        return {
            filesOpened: 0, // Track in real implementation
            edits: 0,
            runs: 0
        };
    }
    
    async suggestImprovements() {
        // AI suggests improvements to itself
        console.log('[AgenticBrowser] 💡 Generating improvement suggestions...');
        
        const prompt = `
Based on project analysis, suggest improvements to the agentic file browser itself.
What new features would be most useful?
How can it better understand and assist with this project?
        `.trim();
        
        try {
            const response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    model: 'BigDaddyG:Latest'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const suggestions = data.response || data.message;
                
                this.learningData.improvements.push({
                    timestamp: Date.now(),
                    suggestions
                });
                
                console.log('[AgenticBrowser] 💡 New improvement ideas:', suggestions);
            }
        } catch (error) {
            console.error('[AgenticBrowser] Improvement generation failed:', error);
        }
    }
    
    async getProjectRoot() {
        // Get current working directory or opened folder
        if (window.electron && window.electron.getCwd) {
            return await window.electron.getCwd();
        }
        return null;
    }
    
    updateStatus(message) {
        const status = document.getElementById('agent-status');
        if (status) {
            status.textContent = message;
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#77ddbe' : '#4a90e2'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 20000;
            font-size: 13px;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize
window.agenticBrowser = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.agenticBrowser = new AgenticFileBrowser();
        // Init when project is opened
        setTimeout(() => window.agenticBrowser.init(), 2000);
    });
} else {
    window.agenticBrowser = new AgenticFileBrowser();
    setTimeout(() => window.agenticBrowser.init(), 2000);
}

// Export
window.AgenticFileBrowser = AgenticFileBrowser;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgenticFileBrowser;
}

console.log('[AgenticBrowser] 📦 Agentic file browser module loaded');

})(); // End IIFE

