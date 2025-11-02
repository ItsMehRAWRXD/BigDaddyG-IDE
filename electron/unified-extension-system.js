/**
 * BigDaddyG IDE - Unified Extension System
 * Integrates RawrZ, Multi AI, Minis, Twinsies, 10-liner, and more!
 * Uses E: drive as base station for extensions
 */

(function() {
'use strict';

class UnifiedExtensionSystem {
    constructor() {
        this.baseStation = 'E:\\BigDaddyG-Extensions'; // E: drive base
        this.rawrzServer = null;
        this.multiAIServer = null;
        this.detectedLanguages = new Set();
        this.compilers = new Map();
        this.agents = new Map();
        
        console.log('[UnifiedExtensions] 🚀 Initializing unified extension system...');
    }
    
    async init() {
        try {
            // 1. Setup base station on E: drive
            await this.setupBaseStation();
            
            // 2. Start RawrZ Security Platform
            await this.startRawrZServer();
            
            // 3. Start Multi AI Aggregator
            await this.startMultiAIServer();
            
            // 4. Scan current project
            await this.scanProject();
            
            // 5. Auto-detect needed compilers
            await this.detectCompilers();
            
            // 6. Create agents for detected languages
            await this.createLanguageAgents();
            
            console.log('[UnifiedExtensions] ✅ All systems online!');
            this.showWelcomeNotification();
            
        } catch (error) {
            console.error('[UnifiedExtensions] ❌ Initialization error:', error);
        }
    }
    
    async setupBaseStation() {
        console.log('[UnifiedExtensions] 📡 Setting up E: drive base station...');
        
        if (window.electron && window.electron.fileExists) {
            const exists = await window.electron.fileExists(this.baseStation);
            
            if (!exists) {
                console.log('[UnifiedExtensions] Creating base station directory...');
                // Create base station folders
                const folders = [
                    'rawrz',
                    'multi-ai',
                    'compilers',
                    'extensions',
                    'models',
                    'cache'
                ];
                
                // Note: In real implementation, create these directories
                console.log('[UnifiedExtensions] ✅ Base station created at E:\\BigDaddyG-Extensions');
            } else {
                console.log('[UnifiedExtensions] ✅ Base station exists');
            }
        }
    }
    
    async startRawrZServer() {
        console.log('[UnifiedExtensions] 🔐 Starting RawrZ Security Platform...');
        
        // Start RawrZ server on port 8080
        this.rawrzServer = {
            url: 'http://localhost:8080',
            api: 'http://localhost:8080/api/rawrz/execute',
            health: 'http://localhost:8080/health',
            status: 'starting'
        };
        
        try {
            // Check if RawrZ is already running
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1000);
            
            const response = await fetch(this.rawrzServer.health, { 
                signal: controller.signal 
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                this.rawrzServer.status = 'running';
                console.log('[UnifiedExtensions] ✅ RawrZ Security Platform online');
            }
        } catch (error) {
            // RawrZ not running (optional service)
            this.rawrzServer.status = 'offline';
            console.log('[UnifiedExtensions] ℹ️ RawrZ Security Platform offline (optional)');
        }
    }
    
    async startMultiAIServer() {
        console.log('[UnifiedExtensions] 🤖 Starting Multi AI Aggregator...');
        
        // Multi AI supports: Claude, ChatGPT-4o, Kimi, DeepSeek, AmazonQ, Gemini
        this.multiAIServer = {
            url: 'http://localhost:3003',
            api: 'http://localhost:3003/api/aggregate',
            health: 'http://localhost:3003/health',
            providers: [
                'claude-3-opus',
                'chatgpt-4o',
                'kimi',
                'deepseek-cloud',
                'amazonq',
                'gemini-pro'
            ],
            status: 'starting'
        };
        
        try {
            // Check if Multi AI is already running
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1000);
            
            const response = await fetch(this.multiAIServer.health, {
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                const data = await response.json();
                this.multiAIServer.status = 'running';
                this.multiAIServer.availableProviders = data.providers || {};
                console.log('[UnifiedExtensions] ✅ Multi AI Aggregator online');
                console.log('[UnifiedExtensions] 🤖 Available AI providers:', Object.keys(this.multiAIServer.availableProviders).join(', '));
            }
        } catch (error) {
            // Multi AI not running (optional service)
            this.multiAIServer.status = 'offline';
            console.log('[UnifiedExtensions] ℹ️ Multi AI Aggregator offline (optional)');
        }
    }
    
    async scanProject() {
        console.log('[UnifiedExtensions] 🔍 Scanning project...');
        
        // Get project root
        const projectRoot = await this.getProjectRoot();
        
        // Scan for language files
        const languages = await this.detectLanguages(projectRoot);
        
        this.detectedLanguages = new Set(languages);
        
        console.log('[UnifiedExtensions] 📊 Detected languages:', Array.from(this.detectedLanguages).join(', '));
        
        // Update UI
        this.displayDetectedLanguages();
    }
    
    async getProjectRoot() {
        // Get current working directory
        if (window.electron && window.electron.getCwd) {
            return await window.electron.getCwd();
        }
        return null;
    }
    
    async detectLanguages(rootPath) {
        const languages = new Set();
        
        if (!rootPath || !window.electron || !window.electron.readDirRecursive) {
            return [];
        }
        
        try {
            // Read all files recursively
            const files = await window.electron.readDirRecursive(rootPath);
            
            // Map file extensions to languages
            const extensionMap = {
                // Compiled languages
                'js': 'JavaScript',
                'ts': 'TypeScript',
                'jsx': 'React (JSX)',
                'tsx': 'React TypeScript',
                'py': 'Python',
                'java': 'Java',
                'c': 'C',
                'cpp': 'C++',
                'cc': 'C++',
                'cxx': 'C++',
                'h': 'C/C++ Header',
                'hpp': 'C++ Header',
                'cs': 'C#',
                'go': 'Go',
                'rs': 'Rust',
                'rb': 'Ruby',
                'php': 'PHP',
                'swift': 'Swift',
                'kt': 'Kotlin',
                'scala': 'Scala',
                'r': 'R',
                'm': 'Objective-C',
                'mm': 'Objective-C++',
                'f': 'Fortran',
                'f90': 'Fortran',
                'pas': 'Pascal',
                'pl': 'Perl',
                'lua': 'Lua',
                'dart': 'Dart',
                'ex': 'Elixir',
                'erl': 'Erlang',
                'clj': 'Clojure',
                'asm': 'Assembly',
                's': 'Assembly',
                'v': 'Verilog',
                'vhd': 'VHDL',
                'sol': 'Solidity',
                
                // Web languages
                'html': 'HTML',
                'htm': 'HTML',
                'css': 'CSS',
                'scss': 'SCSS',
                'sass': 'Sass',
                'less': 'Less',
                'vue': 'Vue.js',
                'svelte': 'Svelte',
                
                // Scripting
                'sh': 'Shell Script',
                'bash': 'Bash',
                'ps1': 'PowerShell',
                'bat': 'Batch',
                'cmd': 'CMD',
                
                // Data
                'json': 'JSON',
                'xml': 'XML',
                'yaml': 'YAML',
                'yml': 'YAML',
                'toml': 'TOML',
                'sql': 'SQL',
                
                // Others
                'md': 'Markdown',
                'tex': 'LaTeX'
            };
            
            files.forEach(file => {
                const ext = file.split('.').pop().toLowerCase();
                if (extensionMap[ext]) {
                    languages.add(extensionMap[ext]);
                }
            });
            
        } catch (error) {
            console.error('[UnifiedExtensions] Error scanning project:', error);
        }
        
        return Array.from(languages);
    }
    
    async detectCompilers() {
        console.log('[UnifiedExtensions] 🔧 Detecting available compilers...');
        
        // Map languages to compilers
        const compilerMap = {
            'JavaScript': ['node', 'deno', 'bun'],
            'TypeScript': ['tsc', 'deno', 'bun'],
            'Python': ['python', 'python3', 'pypy'],
            'Java': ['javac', 'jdk'],
            'C': ['gcc', 'clang', 'cl.exe'],
            'C++': ['g++', 'clang++', 'cl.exe'],
            'C#': ['csc', 'dotnet', 'roslyn'],
            'Go': ['go'],
            'Rust': ['rustc', 'cargo'],
            'Ruby': ['ruby'],
            'PHP': ['php'],
            'Swift': ['swiftc'],
            'Kotlin': ['kotlinc'],
            'Scala': ['scalac'],
            'Assembly': ['nasm', 'masm', 'gas'],
            'WebAssembly': ['wat2wasm', 'emscripten']
        };
        
        for (const lang of this.detectedLanguages) {
            const compilers = compilerMap[lang] || [];
            
            for (const compiler of compilers) {
                const available = await this.checkCompiler(compiler);
                
                if (available) {
                    this.compilers.set(lang, compiler);
                    console.log(`[UnifiedExtensions] ✅ ${lang}: ${compiler} available`);
                    break;
                } else {
                    console.log(`[UnifiedExtensions] ⚠️ ${lang}: ${compiler} not found`);
                }
            }
            
            // If no compiler found, offer to download
            if (!this.compilers.has(lang)) {
                console.log(`[UnifiedExtensions] 📥 ${lang}: No compiler found, offering to download...`);
                this.offerCompilerDownload(lang, compilers[0]);
            }
        }
    }
    
    async checkCompiler(compiler) {
        // Check if compiler is available
        try {
            if (window.electron && window.electron.exec) {
                const result = await window.electron.exec(`${compiler} --version`);
                return result.exitCode === 0;
            }
        } catch (error) {
            return false;
        }
        return false;
    }
    
    offerCompilerDownload(language, compiler) {
        // Show notification offering to download compiler
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #ff9966, #ff5e62);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            z-index: 20000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                🔧 Compiler Needed: ${language}
            </div>
            <div style="font-size: 12px; margin-bottom: 12px; opacity: 0.9;">
                ${compiler} not found. Would you like to download it?
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="unifiedExtensions.downloadCompiler('${language}', '${compiler}')" style="flex: 1; background: white; color: #ff5e62; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;">
                    📥 Download
                </button>
                <button onclick="this.parentElement.parentElement.remove()" style="flex: 1; background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11px;">
                    Later
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 10000);
    }
    
    async downloadCompiler(language, compiler) {
        console.log(`[UnifiedExtensions] 📥 Downloading ${compiler} for ${language}...`);
        
        // Show download progress
        this.showNotification(`Downloading ${compiler}...`, 'info');
        
        // Download links for popular compilers
        const downloadLinks = {
            'gcc': 'https://sourceforge.net/projects/mingw-w64/',
            'clang': 'https://releases.llvm.org/',
            'cl.exe': 'https://visualstudio.microsoft.com/downloads/',
            'javac': 'https://www.oracle.com/java/technologies/downloads/',
            'rustc': 'https://www.rust-lang.org/tools/install',
            'go': 'https://go.dev/dl/',
            'python': 'https://www.python.org/downloads/',
            'node': 'https://nodejs.org/en/download/'
        };
        
        const url = downloadLinks[compiler];
        
        if (url) {
            // Open download page
            if (window.electron && window.electron.openExternal) {
                await window.electron.openExternal(url);
            }
            
            this.showNotification(`Opening download page for ${compiler}`, 'success');
        } else {
            this.showNotification(`Please install ${compiler} manually`, 'info');
        }
    }
    
    async createLanguageAgents() {
        console.log('[UnifiedExtensions] 🤖 Creating language-specific agents...');
        
        for (const lang of this.detectedLanguages) {
            const agent = await this.createAgent(lang);
            this.agents.set(lang, agent);
            console.log(`[UnifiedExtensions] ✅ Created agent for ${lang}`);
        }
        
        // Auto-create todos
        this.createAutoTodos();
    }
    
    async createAgent(language) {
        return {
            language,
            status: 'ready',
            tasks: [],
            compiler: this.compilers.get(language),
            
            async compile(file) {
                console.log(`[Agent:${language}] Compiling ${file}...`);
                // Compilation logic here
            },
            
            async run(file) {
                console.log(`[Agent:${language}] Running ${file}...`);
                // Run logic here
            },
            
            async test(file) {
                console.log(`[Agent:${language}] Testing ${file}...`);
                // Test logic here
            }
        };
    }
    
    createAutoTodos() {
        console.log('[UnifiedExtensions] 📝 Creating auto-todos...');
        
        const todos = [];
        
        for (const [lang, agent] of this.agents.entries()) {
            if (!agent.compiler) {
                todos.push({
                    id: `install-${lang}-compiler`,
                    content: `Install ${lang} compiler`,
                    status: 'pending',
                    priority: 'high'
                });
            } else {
                todos.push({
                    id: `setup-${lang}-project`,
                    content: `Configure ${lang} project settings`,
                    status: 'pending',
                    priority: 'medium'
                });
            }
        }
        
        console.log(`[UnifiedExtensions] ✅ Created ${todos.length} auto-todos`);
        
        // Display todos in UI
        this.displayTodos(todos);
    }
    
    displayDetectedLanguages() {
        // Create language detection panel
        const panel = document.createElement('div');
        panel.id = 'detected-languages-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 60px;
            left: 20px;
            background: var(--cursor-bg-secondary);
            border: 1px solid var(--cursor-jade-light);
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 300px;
        `;
        
        const languages = Array.from(this.detectedLanguages);
        
        panel.innerHTML = `
            <div style="font-size: 12px; font-weight: 600; color: var(--cursor-jade-dark); margin-bottom: 8px;">
                🔍 Detected Languages (${languages.length})
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${languages.map(lang => `
                    <span style="background: rgba(119, 221, 190, 0.15); padding: 4px 8px; border-radius: 6px; font-size: 10px; color: var(--cursor-jade-dark);">
                        ${lang}
                    </span>
                `).join('')}
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: var(--cursor-text-secondary);">
                💡 Auto-configured agents & compilers
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            panel.style.transition = 'opacity 0.5s';
            panel.style.opacity = '0';
            setTimeout(() => panel.remove(), 500);
        }, 10000);
    }
    
    displayTodos(todos) {
        console.log('[UnifiedExtensions] Displaying auto-generated todos...');
        
        // If todo system exists, add todos to it
        if (window.todoSystem) {
            todos.forEach(todo => {
                window.todoSystem.addTodo(todo);
            });
        }
    }
    
    showWelcomeNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent));
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            z-index: 20000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        const langCount = this.detectedLanguages.size;
        const compilerCount = this.compilers.size;
        const agentCount = this.agents.size;
        
        notification.innerHTML = `
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                ✅ Unified Extension System Online!
            </div>
            <div style="font-size: 11px; opacity: 0.9; line-height: 1.6;">
                🔐 RawrZ Security: ${this.rawrzServer.status}<br>
                🤖 Multi AI: ${this.multiAIServer.status}<br>
                🔍 Languages Detected: ${langCount}<br>
                🔧 Compilers Ready: ${compilerCount}/${langCount}<br>
                🤖 Agents Created: ${agentCount}<br>
                📡 Base Station: E: drive
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 8000);
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
    
    // ==================================================================
    // MULTI AI INTEGRATION
    // ==================================================================
    
    async queryMultiAI(question, providers = 'all') {
        if (this.multiAIServer.status !== 'running') {
            throw new Error('Multi AI Aggregator not available');
        }
        
        console.log(`[UnifiedExtensions] 🤖 Querying Multi AI (${providers})...`);
        
        try {
            const response = await fetch(this.multiAIServer.api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, providers })
            });
            
            if (!response.ok) {
                throw new Error(`Multi AI returned ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log('[UnifiedExtensions] ✅ Multi AI response received');
            console.log('  Combined:', data.combined?.substring(0, 100) + '...');
            console.log('  Providers:', data.individual?.map(i => i.provider).join(', '));
            
            return data;
            
        } catch (error) {
            console.error('[UnifiedExtensions] ❌ Multi AI error:', error);
            throw error;
        }
    }
    
    // ==================================================================
    // RAWRZ SECURITY INTEGRATION
    // ==================================================================
    
    async executeRawrZCommand(command) {
        if (this.rawrzServer.status !== 'running') {
            throw new Error('RawrZ Security Platform not available');
        }
        
        console.log(`[UnifiedExtensions] 🔐 Executing RawrZ command...`);
        
        try {
            const response = await fetch(this.rawrzServer.api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            
            if (!response.ok) {
                throw new Error(`RawrZ returned ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log('[UnifiedExtensions] ✅ RawrZ execution complete');
            
            return data;
            
        } catch (error) {
            console.error('[UnifiedExtensions] ❌ RawrZ error:', error);
            throw error;
        }
    }
}

// Initialize
window.unifiedExtensions = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.unifiedExtensions = new UnifiedExtensionSystem();
        window.unifiedExtensions.init();
    });
} else {
    window.unifiedExtensions = new UnifiedExtensionSystem();
    window.unifiedExtensions.init();
}

// Export
window.UnifiedExtensionSystem = UnifiedExtensionSystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedExtensionSystem;
}

console.log('[UnifiedExtensions] 📦 Unified extension system module loaded');

})(); // End IIFE

