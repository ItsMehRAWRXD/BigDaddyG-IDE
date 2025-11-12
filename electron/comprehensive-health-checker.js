/**
 * Comprehensive Health Checker
 * Monitors all IDE systems and provides detailed health reports
 */

console.log('[HealthChecker] 🏥 Loading comprehensive health checker...');

class ComprehensiveHealthChecker {
    constructor() {
        this.systems = {
            monaco: { name: 'Monaco Editor', status: 'unknown', lastCheck: null },
            fileSystem: { name: 'File System', status: 'unknown', lastCheck: null },
            chat: { name: 'AI Chat', status: 'unknown', lastCheck: null },
            agentic: { name: 'Agentic Systems', status: 'unknown', lastCheck: null },
            memory: { name: 'Memory Management', status: 'unknown', lastCheck: null },
            performance: { name: 'Performance', status: 'unknown', lastCheck: null },
            ollama: { name: 'Ollama Integration', status: 'unknown', lastCheck: null },
            git: { name: 'Git Integration', status: 'unknown', lastCheck: null }
        };
        
        this.checkHistory = [];
        this.autoCheckInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('[HealthChecker] 🔧 Initializing health checker...');
        
        // Run first check after 3 seconds
        setTimeout(() => this.runFullCheck(), 3000);
        
        // Auto-check every 5 minutes
        this.startAutoChecks();
        
        console.log('[HealthChecker] ✅ Health checker ready');
    }
    
    startAutoChecks() {
        this.autoCheckInterval = setInterval(() => {
            console.log('[HealthChecker] 🔍 Running scheduled health check...');
            this.runFullCheck();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    
    stopAutoChecks() {
        if (this.autoCheckInterval) {
            clearInterval(this.autoCheckInterval);
            this.autoCheckInterval = null;
        }
    }
    
    async runFullCheck() {
        console.log('[HealthChecker] 🏥 Running full system check...');
        
        const startTime = performance.now();
        const results = {};
        
        // Check all systems in parallel
        const checks = [
            this.checkMonaco(),
            this.checkFileSystem(),
            this.checkChat(),
            this.checkAgentic(),
            this.checkMemory(),
            this.checkPerformance(),
            this.checkOllama(),
            this.checkGit()
        ];
        
        const checkResults = await Promise.allSettled(checks);
        
        // Process results
        Object.keys(this.systems).forEach((key, index) => {
            const result = checkResults[index];
            if (result.status === 'fulfilled') {
                this.systems[key] = {
                    ...this.systems[key],
                    ...result.value,
                    lastCheck: new Date().toISOString()
                };
            } else {
                this.systems[key].status = 'error';
                this.systems[key].error = result.reason?.message;
            }
        });
        
        const endTime = performance.now();
        const checkTime = Math.round(endTime - startTime);
        
        // Calculate overall health
        const healthScore = this.calculateHealthScore();
        
        console.log(`[HealthChecker] ✅ Health check complete in ${checkTime}ms`);
        console.log(`[HealthChecker] 💚 Overall health: ${healthScore}%`);
        
        // Store in history
        this.checkHistory.push({
            timestamp: new Date().toISOString(),
            duration: checkTime,
            healthScore,
            systems: { ...this.systems }
        });
        
        // Keep only last 20 checks
        if (this.checkHistory.length > 20) {
            this.checkHistory.shift();
        }
        
        return {
            healthScore,
            systems: this.systems,
            duration: checkTime
        };
    }
    
    async checkMonaco() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            // Check if Monaco is loaded
            if (typeof monaco === 'undefined') {
                status.status = 'error';
                status.error = 'Monaco not loaded';
                return status;
            }
            
            status.details.loaded = true;
            status.details.version = monaco.version || 'unknown';
            
            // Check editor instance
            if (window.editor) {
                status.details.editorActive = true;
                status.details.model = !!window.editor.getModel();
                
                // Check editor functionality
                try {
                    const value = window.editor.getValue();
                    status.details.getValue = true;
                    status.details.contentLength = value.length;
                } catch (e) {
                    status.details.getValue = false;
                }
            } else {
                status.details.editorActive = false;
            }
            
            // Check CSS
            const cssLink = document.querySelector('link[href*="monaco"]');
            status.details.cssLoaded = !!cssLink;
            
            // Determine overall status
            if (status.details.loaded && status.details.editorActive && status.details.model) {
                status.status = 'healthy';
            } else if (status.details.loaded) {
                status.status = 'degraded';
            } else {
                status.status = 'error';
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    async checkFileSystem() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            // Check if file system APIs are available
            status.details.electronAPI = !!window.electron;
            
            if (window.electron) {
                // Test read operation
                try {
                    const testResult = await window.electron.readFile('package.json');
                    status.details.readWorks = testResult.success;
                } catch (e) {
                    status.details.readWorks = false;
                }
                
                // Check drives
                if (window.electron.getDrives) {
                    try {
                        const drives = await window.electron.getDrives();
                        status.details.drivesAccessible = drives.length > 0;
                        status.details.driveCount = drives.length;
                    } catch (e) {
                        status.details.drivesAccessible = false;
                    }
                }
            }
            
            // Determine status
            if (status.details.electronAPI && status.details.readWorks) {
                status.status = 'healthy';
            } else if (status.details.electronAPI) {
                status.status = 'degraded';
            } else {
                status.status = 'error';
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    async checkChat() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            // Check chat input exists
            const chatInput = document.getElementById('ai-input');
            status.details.inputExists = !!chatInput;
            
            // Check send function
            status.details.sendFunctionExists = typeof sendToAI === 'function';
            
            // Check chat messages container
            const messagesContainer = document.getElementById('ai-chat-messages');
            status.details.messagesContainerExists = !!messagesContainer;
            
            // Check if chat is functional
            if (window.chatHistory) {
                status.details.historyLoaded = true;
                status.details.messageCount = window.chatHistory.messages?.length || 0;
            }
            
            // Determine status
            if (status.details.inputExists && status.details.sendFunctionExists && 
                status.details.messagesContainerExists) {
                status.status = 'healthy';
            } else {
                status.status = 'degraded';
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    async checkAgentic() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            // Check agentic systems
            status.details.autoFixer = !!window.agenticAutoFixer;
            status.details.coder = !!window.agenticCoder;
            status.details.executor = !!window.agenticExecutor;
            
            // Check if auto-fixer is running
            if (window.agenticAutoFixer) {
                status.details.autoFixerActive = window.agenticAutoFixer.isActive;
            }
            
            // Count active systems
            const activeSystems = Object.values(status.details).filter(v => v === true).length;
            status.details.activeCount = activeSystems;
            
            // Determine status
            if (activeSystems >= 2) {
                status.status = 'healthy';
            } else if (activeSystems >= 1) {
                status.status = 'degraded';
            } else {
                status.status = 'error';
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    async checkMemory() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            if (performance.memory) {
                const used = performance.memory.usedJSHeapSize;
                const limit = performance.memory.jsHeapSizeLimit;
                const percent = Math.round((used / limit) * 100);
                
                status.details.usedMB = Math.round(used / 1024 / 1024);
                status.details.limitMB = Math.round(limit / 1024 / 1024);
                status.details.usagePercent = percent;
                
                // Determine status based on usage
                if (percent < 60) {
                    status.status = 'healthy';
                } else if (percent < 80) {
                    status.status = 'degraded';
                } else {
                    status.status = 'warning';
                }
            } else {
                status.status = 'unknown';
                status.details.apiUnavailable = true;
            }
            
            // Check timer cleanup
            if (window.getTimerStats) {
                const timerStats = window.getTimerStats();
                status.details.activeTimers = timerStats.active || 0;
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    async checkPerformance() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            // Check FPS if performance optimizer is available
            if (window.performanceOptimizer) {
                const metrics = window.performanceOptimizer.getMetrics();
                status.details.fps = metrics.fps;
                status.details.optimizationsActive = Object.values(metrics.optimizations).some(v => v);
            }
            
            // Check tab count
            if (window.openTabs) {
                status.details.tabCount = Object.keys(window.openTabs).length;
            }
            
            // Measure render performance
            const renderStart = performance.now();
            await new Promise(resolve => requestAnimationFrame(resolve));
            const renderTime = performance.now() - renderStart;
            status.details.renderTime = Math.round(renderTime);
            
            // Determine status
            const fps = status.details.fps || 60;
            if (fps >= 50 && renderTime < 50) {
                status.status = 'healthy';
            } else if (fps >= 30) {
                status.status = 'degraded';
            } else {
                status.status = 'warning';
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    async checkOllama() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            // Try to ping Ollama server
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            
            try {
                const response = await fetch('http://localhost:11441/api/tags', {
                    signal: controller.signal
                });
                clearTimeout(timeout);
                
                if (response.ok) {
                    const data = await response.json();
                    status.status = 'healthy';
                    status.details.connected = true;
                    status.details.modelCount = data.models?.length || 0;
                } else {
                    status.status = 'error';
                    status.details.httpError = response.status;
                }
            } catch (fetchError) {
                clearTimeout(timeout);
                status.status = 'error';
                status.details.connected = false;
                status.error = fetchError.message;
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    async checkGit() {
        const status = {
            status: 'unknown',
            details: {}
        };
        
        try {
            // Check if git functions are available
            status.details.apiAvailable = !!window.electron?.gitStatus;
            
            if (window.electron?.gitStatus) {
                try {
                    const gitStatus = await window.electron.gitStatus();
                    status.details.repoDetected = gitStatus.success;
                    if (gitStatus.success) {
                        status.details.branch = gitStatus.branch;
                        status.details.hasChanges = gitStatus.modified?.length > 0;
                    }
                    status.status = 'healthy';
                } catch (e) {
                    status.status = 'degraded';
                    status.details.error = e.message;
                }
            } else {
                status.status = 'unknown';
            }
            
        } catch (error) {
            status.status = 'error';
            status.error = error.message;
        }
        
        return status;
    }
    
    calculateHealthScore() {
        const statuses = Object.values(this.systems);
        const weights = {
            healthy: 100,
            degraded: 60,
            warning: 40,
            error: 0,
            unknown: 50
        };
        
        let totalScore = 0;
        let count = 0;
        
        statuses.forEach(system => {
            totalScore += weights[system.status] || 0;
            count++;
        });
        
        return Math.round(totalScore / count);
    }
    
    getReport() {
        const healthScore = this.calculateHealthScore();
        
        return {
            timestamp: new Date().toISOString(),
            healthScore,
            systems: this.systems,
            history: this.checkHistory.slice(-5) // Last 5 checks
        };
    }
    
    showDashboard() {
        const report = this.getReport();
        
        console.log('='.repeat(60));
        console.log('🏥 BIGDADDYG IDE HEALTH DASHBOARD');
        console.log('='.repeat(60));
        console.log(`Overall Health: ${report.healthScore}%`);
        console.log('');
        console.log('System Status:');
        
        Object.entries(this.systems).forEach(([key, system]) => {
            const icon = {
                healthy: '✅',
                degraded: '⚠️',
                warning: '⚠️',
                error: '❌',
                unknown: '❓'
            }[system.status];
            
            console.log(`  ${icon} ${system.name}: ${system.status.toUpperCase()}`);
            if (system.details) {
                Object.entries(system.details).forEach(([k, v]) => {
                    console.log(`     • ${k}: ${v}`);
                });
            }
        });
        
        console.log('='.repeat(60));
    }
}

// Initialize and expose globally
window.comprehensiveHealthChecker = new ComprehensiveHealthChecker();

console.log('[HealthChecker] 🏥 Comprehensive health checker loaded successfully!');
console.log('[HealthChecker] 💡 Use window.comprehensiveHealthChecker.showDashboard() to view health');
