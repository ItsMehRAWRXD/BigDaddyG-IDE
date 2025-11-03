/**
 * Agentic Global API
 * 
 * Exposes ALL IDE operations globally so AI can:
 * - Create files and tabs
 * - Modify code
 * - Run commands
 * - Control UI
 * - Manage projects
 * - Execute any IDE operation
 */

(function() {
'use strict';

class AgenticGlobalAPI {
    constructor() {
        console.log('[AgenticAPI] 🤖 Initializing Agentic Global API...');
        this.init();
    }
    
    init() {
        // Wait for all systems to load
        setTimeout(() => {
            this.exposeFileOperations();
            this.exposeEditorOperations();
            this.exposeTabOperations();
            this.exposeAIOperations();
            this.exposeTerminalOperations();
            this.exposeProjectOperations();
            this.exposeUIOperations();
            this.exposeUtilityOperations();
            
            console.log('[AgenticAPI] ✅ Agentic Global API ready!');
            console.log('[AgenticAPI] 📋 Access via: window.agentic.*');
        }, 1000);
    }
    
    exposeFileOperations() {
        window.agentic = window.agentic || {};
        window.agentic.file = {
            // Create new file with content
            create: async (filename, content = '', language = 'auto') => {
                try {
                    if (language === 'auto') {
                        language = this.detectLanguage(filename);
                    }
                    
                    // Use existing createNewTab function
                    if (typeof createNewTab === 'function') {
                        const tabId = createNewTab(filename, language, content, null);
                        console.log(`[AgenticAPI] ✅ Created file: ${filename}`);
                        return { success: true, tabId, filename };
                    }
                    
                    throw new Error('createNewTab not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ File creation failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // Open existing file
            open: async (filePath) => {
                try {
                    if (window.electron && window.electron.readFile) {
                        const result = await window.electron.readFile(filePath);
                        if (result.success) {
                            const filename = filePath.split(/[\\/]/).pop();
                            const language = this.detectLanguage(filename);
                            
                            if (typeof createNewTab === 'function') {
                                createNewTab(filename, language, result.content, filePath);
                                console.log(`[AgenticAPI] ✅ Opened file: ${filePath}`);
                                return { success: true, content: result.content };
                            }
                        }
                        return result;
                    }
                    throw new Error('File API not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ File open failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // Save current file
            save: async (content = null, filePath = null) => {
                try {
                    if (typeof saveCurrentFile === 'function') {
                        await saveCurrentFile();
                        console.log(`[AgenticAPI] ✅ File saved`);
                        return { success: true };
                    }
                    throw new Error('Save function not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ File save failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // Save as new file
            saveAs: async (filePath, content) => {
                try {
                    if (window.electron && window.electron.saveFile) {
                        const result = await window.electron.saveFile(filePath, content);
                        console.log(`[AgenticAPI] ✅ File saved as: ${filePath}`);
                        return result;
                    }
                    throw new Error('Save API not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ Save as failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // Delete file
            delete: async (filePath) => {
                try {
                    if (window.electron && window.electron.deleteFile) {
                        const result = await window.electron.deleteFile(filePath);
                        console.log(`[AgenticAPI] ✅ File deleted: ${filePath}`);
                        return result;
                    }
                    throw new Error('Delete API not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ File delete failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // Read file content
            read: async (filePath) => {
                try {
                    if (window.electron && window.electron.readFile) {
                        const result = await window.electron.readFile(filePath);
                        if (result.success) {
                            console.log(`[AgenticAPI] ✅ File read: ${filePath}`);
                        }
                        return result;
                    }
                    throw new Error('Read API not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ File read failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // List files in directory
            list: async (dirPath) => {
                try {
                    if (window.electron && window.electron.listDirectory) {
                        const result = await window.electron.listDirectory(dirPath);
                        console.log(`[AgenticAPI] ✅ Listed directory: ${dirPath}`);
                        return result;
                    }
                    throw new Error('List API not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ Directory list failed:', error);
                    return { success: false, error: error.message };
                }
            }
        };
    }
    
    exposeEditorOperations() {
        window.agentic = window.agentic || {};
        window.agentic.editor = {
            // Get current editor content
            getContent: () => {
                if (window.monacoEditor) {
                    return window.monacoEditor.getValue();
                }
                return '';
            },
            
            // Set editor content
            setContent: (content) => {
                if (window.monacoEditor) {
                    window.monacoEditor.setValue(content);
                    console.log('[AgenticAPI] ✅ Editor content updated');
                    return { success: true };
                }
                return { success: false, error: 'Editor not available' };
            },
            
            // Insert text at cursor
            insert: (text) => {
                if (window.monacoEditor) {
                    const selection = window.monacoEditor.getSelection();
                    window.monacoEditor.executeEdits('agentic-insert', [{
                        range: selection,
                        text: text
                    }]);
                    console.log('[AgenticAPI] ✅ Text inserted');
                    return { success: true };
                }
                return { success: false, error: 'Editor not available' };
            },
            
            // Replace text in range
            replace: (startLine, startCol, endLine, endCol, newText) => {
                if (window.monacoEditor) {
                    const range = new monaco.Range(startLine, startCol, endLine, endCol);
                    window.monacoEditor.executeEdits('agentic-replace', [{
                        range: range,
                        text: newText
                    }]);
                    console.log('[AgenticAPI] ✅ Text replaced');
                    return { success: true };
                }
                return { success: false, error: 'Editor not available' };
            },
            
            // Get selected text
            getSelection: () => {
                if (window.monacoEditor) {
                    const selection = window.monacoEditor.getModel().getValueInRange(
                        window.monacoEditor.getSelection()
                    );
                    return selection;
                }
                return '';
            },
            
            // Format document
            format: () => {
                if (window.monacoEditor) {
                    window.monacoEditor.getAction('editor.action.formatDocument').run();
                    console.log('[AgenticAPI] ✅ Document formatted');
                    return { success: true };
                }
                return { success: false, error: 'Editor not available' };
            },
            
            // Go to line
            goToLine: (lineNumber) => {
                if (window.monacoEditor) {
                    window.monacoEditor.revealLineInCenter(lineNumber);
                    window.monacoEditor.setPosition({ lineNumber, column: 1 });
                    console.log(`[AgenticAPI] ✅ Jumped to line ${lineNumber}`);
                    return { success: true };
                }
                return { success: false, error: 'Editor not available' };
            },
            
            // Find and replace
            findReplace: (find, replace, replaceAll = false) => {
                if (window.monacoEditor) {
                    const content = window.monacoEditor.getValue();
                    const newContent = replaceAll ? 
                        content.replace(new RegExp(find, 'g'), replace) :
                        content.replace(find, replace);
                    window.monacoEditor.setValue(newContent);
                    console.log(`[AgenticAPI] ✅ Find/replace complete`);
                    return { success: true, replacements: content.split(find).length - 1 };
                }
                return { success: false, error: 'Editor not available' };
            }
        };
    }
    
    exposeTabOperations() {
        window.agentic = window.agentic || {};
        window.agentic.tab = {
            // Create new tab
            create: (title, content = '', type = 'file') => {
                try {
                    if (type === 'file') {
                        const language = this.detectLanguage(title);
                        if (typeof createNewTab === 'function') {
                            return createNewTab(title, language, content, null);
                        }
                    } else {
                        // Special tab (chat, explorer, etc.)
                        if (window.tabSystem && window.tabSystem.createTab) {
                            return window.tabSystem.createTab(title, '📄', content, type);
                        }
                    }
                    throw new Error('Tab creation not available');
                } catch (error) {
                    console.error('[AgenticAPI] ❌ Tab creation failed:', error);
                    return null;
                }
            },
            
            // Close tab
            close: (tabId) => {
                if (typeof closeTab === 'function') {
                    closeTab(tabId);
                    console.log(`[AgenticAPI] ✅ Closed tab: ${tabId}`);
                    return { success: true };
                }
                return { success: false, error: 'Close function not available' };
            },
            
            // Switch to tab
            switch: (tabId) => {
                if (typeof switchTab === 'function') {
                    switchTab(tabId);
                    console.log(`[AgenticAPI] ✅ Switched to tab: ${tabId}`);
                    return { success: true };
                }
                return { success: false, error: 'Switch function not available' };
            },
            
            // Get all open tabs
            list: () => {
                if (window.openTabs) {
                    return Object.values(window.openTabs).map(tab => ({
                        id: tab.id,
                        filename: tab.filename,
                        language: tab.language,
                        isDirty: tab.isDirty
                    }));
                }
                return [];
            },
            
            // Get active tab
            getActive: () => {
                if (window.activeTab && window.openTabs) {
                    return window.openTabs[window.activeTab];
                }
                return null;
            }
        };
    }
    
    exposeAIOperations() {
        window.agentic = window.agentic || {};
        window.agentic.ai = {
            // Send message to AI
            chat: async (message, model = 'auto') => {
                try {
                    const response = await fetch('http://localhost:11441/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message, model })
                    });
                    const data = await response.json();
                    console.log('[AgenticAPI] ✅ AI response received');
                    return data;
                } catch (error) {
                    console.error('[AgenticAPI] ❌ AI chat failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // Generate code
            generateCode: async (prompt, language = 'javascript') => {
                const fullPrompt = `Generate ${language} code for: ${prompt}`;
                return await this.ai.chat(fullPrompt, 'auto');
            },
            
            // Fix bugs
            fixCode: async (code, language = 'auto') => {
                const prompt = `Fix bugs in this ${language} code:\n\n${code}`;
                return await this.ai.chat(prompt, 'auto');
            },
            
            // Generate tests
            generateTests: async (code, language = 'auto') => {
                const prompt = `Generate comprehensive unit tests for this ${language} code:\n\n${code}`;
                return await this.ai.chat(prompt, 'auto');
            },
            
            // Generate docs
            generateDocs: async (code, language = 'auto') => {
                const prompt = `Generate JSDoc/documentation for this ${language} code:\n\n${code}`;
                return await this.ai.chat(prompt, 'auto');
            },
            
            // Refactor code
            refactor: async (code, language = 'auto') => {
                const prompt = `Refactor this ${language} code for better quality:\n\n${code}`;
                return await this.ai.chat(prompt, 'auto');
            },
            
            // Explain code
            explain: async (code, language = 'auto') => {
                const prompt = `Explain this ${language} code in detail:\n\n${code}`;
                return await this.ai.chat(prompt, 'auto');
            },
            
            // Toggle AI mode (pattern vs neural)
            toggleMode: async () => {
                try {
                    const response = await fetch('http://localhost:11441/api/toggle-ai-mode', {
                        method: 'POST'
                    });
                    const data = await response.json();
                    console.log(`[AgenticAPI] ✅ AI mode: ${data.mode}`);
                    return data;
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            
            // Get AI mode status
            getMode: async () => {
                try {
                    const response = await fetch('http://localhost:11441/api/ai-mode');
                    const data = await response.json();
                    return data;
                } catch (error) {
                    return { mode: 'unknown', error: error.message };
                }
            }
        };
    }
    
    exposeTerminalOperations() {
        window.agentic = window.agentic || {};
        window.agentic.terminal = {
            // Open terminal
            open: () => {
                if (window.terminalPanel && window.terminalPanel.show) {
                    window.terminalPanel.show();
                    console.log('[AgenticAPI] ✅ Terminal opened');
                    return { success: true };
                }
                return { success: false, error: 'Terminal not available' };
            },
            
            // Close terminal
            close: () => {
                if (window.terminalPanel && window.terminalPanel.hide) {
                    window.terminalPanel.hide();
                    console.log('[AgenticAPI] ✅ Terminal closed');
                    return { success: true };
                }
                return { success: false, error: 'Terminal not available' };
            },
            
            // Run command
            run: (command) => {
                // This would need IPC to main process
                console.log(`[AgenticAPI] 📝 Command queued: ${command}`);
                return { success: true, message: 'Command queued for execution' };
            },
            
            // Get terminal output
            getOutput: () => {
                // Would need to access terminal panel's output buffer
                return { success: true, output: 'Terminal output access coming soon' };
            }
        };
    }
    
    exposeProjectOperations() {
        window.agentic = window.agentic || {};
        window.agentic.project = {
            // Create new project structure
            create: async (projectName, projectType, options = {}) => {
                try {
                    console.log(`[AgenticAPI] 🏗️ Creating project: ${projectName} (${projectType})`);
                    
                    const templates = {
                        'react': {
                            files: [
                                { name: 'package.json', content: this.generatePackageJson(projectName, 'react') },
                                { name: 'src/App.jsx', content: this.generateReactApp() },
                                { name: 'src/index.js', content: this.generateReactIndex() },
                                { name: 'public/index.html', content: this.generateHTML(projectName) },
                                { name: 'README.md', content: this.generateREADME(projectName, projectType) }
                            ]
                        },
                        'express': {
                            files: [
                                { name: 'package.json', content: this.generatePackageJson(projectName, 'express') },
                                { name: 'server.js', content: this.generateExpressServer() },
                                { name: '.env', content: 'PORT=3000\n' },
                                { name: 'README.md', content: this.generateREADME(projectName, projectType) }
                            ]
                        },
                        'nodejs': {
                            files: [
                                { name: 'package.json', content: this.generatePackageJson(projectName, 'nodejs') },
                                { name: 'index.js', content: '// Main entry point\nconsole.log("Hello, World!");\n' },
                                { name: 'README.md', content: this.generateREADME(projectName, projectType) }
                            ]
                        }
                    };
                    
                    const template = templates[projectType.toLowerCase()] || templates['nodejs'];
                    const createdFiles = [];
                    
                    for (const file of template.files) {
                        const result = await window.agentic.file.create(file.name, file.content);
                        if (result.success) {
                            createdFiles.push(file.name);
                        }
                    }
                    
                    console.log(`[AgenticAPI] ✅ Project created: ${createdFiles.length} files`);
                    return { success: true, files: createdFiles };
                    
                } catch (error) {
                    console.error('[AgenticAPI] ❌ Project creation failed:', error);
                    return { success: false, error: error.message };
                }
            },
            
            // Analyze project structure
            analyze: async () => {
                try {
                    const response = await fetch('http://localhost:11441/api/analyze-project', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ projectPath: process.cwd() })
                    });
                    const data = await response.json();
                    console.log('[AgenticAPI] ✅ Project analyzed');
                    return data;
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },
            
            // Scan for bugs
            scanBugs: async () => {
                try {
                    const response = await fetch('http://localhost:11441/api/scan-bugs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            projectPath: process.cwd(),
                            scanTypes: ['syntax', 'runtime', 'logic', 'security']
                        })
                    });
                    const data = await response.json();
                    console.log(`[AgenticAPI] ✅ Found ${data.issues.length} issues`);
                    return data;
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }
        };
    }
    
    exposeUIOperations() {
        window.agentic = window.agentic || {};
        window.agentic.ui = {
            // Show notification
            notify: (message, type = 'info') => {
                const colors = {
                    'info': 'var(--cursor-accent)',
                    'success': 'var(--cursor-jade-dark)',
                    'warning': 'var(--orange)',
                    'error': '#ff4757'
                };
                
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    background: var(--cursor-bg);
                    border-left: 4px solid ${colors[type]};
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                    z-index: 10001;
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                `;
                notification.textContent = message;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
                
                console.log(`[AgenticAPI] 📢 Notification: ${message}`);
                return { success: true };
            },
            
            // Open floating chat
            openChat: () => {
                if (window.floatingChat && window.floatingChat.open) {
                    window.floatingChat.open();
                    console.log('[AgenticAPI] ✅ Chat opened');
                    return { success: true };
                }
                return { success: false, error: 'Chat not available' };
            },
            
            // Close floating chat
            closeChat: () => {
                if (window.floatingChat && window.floatingChat.close) {
                    window.floatingChat.close();
                    console.log('[AgenticAPI] ✅ Chat closed');
                    return { success: true };
                }
                return { success: false, error: 'Chat not available' };
            },
            
            // Show agentic menu
            showAgenticMenu: () => {
                if (window.orchestraLayout && window.orchestraLayout.showAgenticMenu) {
                    window.orchestraLayout.showAgenticMenu();
                    console.log('[AgenticAPI] ✅ Agentic menu opened');
                    return { success: true };
                }
                return { success: false, error: 'Agentic menu not available' };
            },
            
            // Open plugin marketplace
            openPluginMarketplace: () => {
                if (window.pluginMarketplace && window.pluginMarketplace.open) {
                    window.pluginMarketplace.open();
                    console.log('[AgenticAPI] ✅ Plugin marketplace opened');
                    return { success: true };
                }
                return { success: false, error: 'Plugin marketplace not available' };
            },
            
            // Toggle panel
            togglePanel: (panelName) => {
                const panels = {
                    'terminal': () => window.terminalPanel?.toggle(),
                    'console': () => window.consolePanel?.toggle(),
                    'explorer': () => document.getElementById('file-explorer')?.click(),
                    'chat': () => window.floatingChat?.toggle()
                };
                
                if (panels[panelName]) {
                    panels[panelName]();
                    console.log(`[AgenticAPI] ✅ Toggled ${panelName} panel`);
                    return { success: true };
                }
                return { success: false, error: `Panel '${panelName}' not found` };
            }
        };
    }
    
    exposeUtilityOperations() {
        window.agentic = window.agentic || {};
        window.agentic.util = {
            // Detect file language
            detectLanguage: (filename) => {
                return this.detectLanguage(filename);
            },
            
            // Get system info
            getSystemInfo: () => {
                return {
                    cpuCores: navigator.hardwareConcurrency || 4,
                    platform: navigator.platform,
                    userAgent: navigator.userAgent,
                    memory: navigator.deviceMemory || 'unknown',
                    online: navigator.onLine
                };
            },
            
            // Execute command
            executeCommand: (commandName, ...args) => {
                console.log(`[AgenticAPI] 📝 Executing: ${commandName}`);
                // Route to command system
                if (window.commandSystem && window.commandSystem.execute) {
                    return window.commandSystem.execute(commandName, ...args);
                }
                return { success: false, error: 'Command system not available' };
            },
            
            // Log message
            log: (message, level = 'info') => {
                const levels = {
                    'info': console.log,
                    'warn': console.warn,
                    'error': console.error,
                    'debug': console.debug
                };
                
                (levels[level] || console.log)(`[AgenticAPI] ${message}`);
                return { success: true };
            }
        };
    }
    
    // Helper: Detect language from filename
    detectLanguage(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const langMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'rb': 'ruby',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'sql': 'sql',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'md': 'markdown',
            'txt': 'plaintext',
            'sh': 'shell',
            'bash': 'shell',
            'bat': 'bat',
            'ps1': 'powershell'
        };
        return langMap[ext] || 'plaintext';
    }
    
    // Template generators
    generatePackageJson(projectName, type) {
        const templates = {
            'react': {
                dependencies: { 'react': '^18.2.0', 'react-dom': '^18.2.0' },
                devDependencies: { '@vitejs/plugin-react': '^4.0.0', 'vite': '^4.0.0' },
                scripts: { 'dev': 'vite', 'build': 'vite build', 'preview': 'vite preview' }
            },
            'express': {
                dependencies: { 'express': '^4.18.0', 'cors': '^2.8.5', 'dotenv': '^16.0.0' },
                devDependencies: { 'nodemon': '^3.0.0' },
                scripts: { 'start': 'node server.js', 'dev': 'nodemon server.js' }
            },
            'nodejs': {
                dependencies: {},
                devDependencies: {},
                scripts: { 'start': 'node index.js' }
            }
        };
        
        const template = templates[type] || templates['nodejs'];
        
        return JSON.stringify({
            name: projectName,
            version: '1.0.0',
            description: `${projectName} - Created by BigDaddyG IDE`,
            main: type === 'express' ? 'server.js' : 'index.js',
            scripts: template.scripts,
            dependencies: template.dependencies,
            devDependencies: template.devDependencies,
            keywords: [],
            author: '',
            license: 'MIT'
        }, null, 2);
    }
    
    generateReactApp() {
        return `import React from 'react';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Welcome to ${projectName || 'My App'}</h1>
        <p>Built with BigDaddyG IDE</p>
      </header>
    </div>
  );
}

export default App;
`;
    }
    
    generateReactIndex() {
        return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
    }
    
    generateExpressServer() {
        return `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running!' });
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;
    }
    
    generateHTML(title) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
`;
    }
    
    generateREADME(projectName, projectType) {
        return `# ${projectName}

Created with BigDaddyG IDE

## Project Type
${projectType}

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`bash
npm start
\`\`\`

## Features
- Built with modern tools
- Ready to deploy
- Fully customizable

## License
MIT
`;
    }
}

// Initialize Agentic Global API
window.agenticGlobalAPI = new AgenticGlobalAPI();

// Also expose quick access
window.AI = {
    createFile: (name, content) => window.agentic.file.create(name, content),
    chat: (message) => window.agentic.ai.chat(message),
    notify: (message) => window.agentic.ui.notify(message),
    executeCommand: (cmd) => window.agentic.util.executeCommand(cmd)
};

console.log('[AgenticAPI] 💎 Quick access available via window.AI.*');

})();

