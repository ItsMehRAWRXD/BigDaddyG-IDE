/**
 * Advanced Debugging System
 * AI-powered debugging with intelligent breakpoints, real-time analysis, and predictive error detection
 */

class AdvancedDebuggingSystem {
    constructor() {
        this.breakpoints = new Map();
        this.watchExpressions = new Map();
        this.callStack = [];
        this.variables = new Map();
        this.debugSessions = new Map();
        this.aiAnalysis = new Map();
        this.performanceMetrics = new Map();
        this.errorPredictions = [];
        this.isDebugging = false;
        this.currentSession = null;
        
        this.initializeUI();
        this.setupEventListeners();
        console.log('[AdvancedDebugger] 🚀 Advanced Debugging System initialized');
    }

    // ========================================================================
    // INTELLIGENT BREAKPOINT SYSTEM
    // ========================================================================

    async setSmartBreakpoint(file, line, condition = null) {
        const id = `${file}:${line}`;
        
        // AI-enhanced breakpoint analysis
        const context = await this.analyzeBreakpointContext(file, line);
        
        const breakpoint = {
            id,
            file,
            line,
            condition,
            hitCount: 0,
            enabled: true,
            context,
            aiSuggestions: context.suggestions,
            created: Date.now()
        };

        this.breakpoints.set(id, breakpoint);
        this.updateBreakpointUI();
        
        console.log(`[AdvancedDebugger] 🎯 Smart breakpoint set at ${file}:${line}`);
        return breakpoint;
    }

    async analyzeBreakpointContext(file, line) {
        try {
            const code = await this.getFileContent(file);
            const lines = code.split('\n');
            const targetLine = lines[line - 1];
            const context = lines.slice(Math.max(0, line - 5), line + 5).join('\n');

            const analysis = await this.getAIAnalysis(`
Analyze this breakpoint location for debugging effectiveness:

Target line ${line}: ${targetLine}

Context:
${context}

Provide insights on:
1. Variable state at this point
2. Potential issues to watch for
3. Suggested watch expressions
4. Performance impact

Respond in JSON format:
{
  "effectiveness": "high|medium|low",
  "variables": ["var1", "var2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "watchExpressions": ["expr1", "expr2"],
  "potentialIssues": ["issue1", "issue2"]
}
            `);

            return analysis || {
                effectiveness: 'medium',
                variables: [],
                suggestions: ['Monitor variable state', 'Check for null values'],
                watchExpressions: [],
                potentialIssues: []
            };
        } catch (error) {
            return { effectiveness: 'medium', variables: [], suggestions: [], watchExpressions: [], potentialIssues: [] };
        }
    }

    // ========================================================================
    // AI-POWERED DEBUG ANALYSIS
    // ========================================================================

    async startAIDebugging(file) {
        console.log(`[AdvancedDebugger] 🤖 Starting AI debugging analysis for ${file}`);
        
        const code = await this.getFileContent(file);
        const analysis = await this.performDeepAnalysis(code, file);
        
        this.aiAnalysis.set(file, analysis);
        this.displayAIInsights(analysis);
        
        return analysis;
    }

    async performDeepAnalysis(code, file) {
        const analysis = await this.getAIAnalysis(`
Perform comprehensive debugging analysis on this code:

${code}

Analyze for:
1. **Runtime Errors**: Potential crashes, null references, type errors
2. **Logic Bugs**: Incorrect conditions, off-by-one errors, race conditions
3. **Performance Issues**: Inefficient loops, memory leaks, blocking operations
4. **Security Vulnerabilities**: Injection attacks, unsafe operations
5. **Code Quality**: Anti-patterns, maintainability issues

Provide detailed debugging strategy with specific line numbers.

Respond in JSON format:
{
  "runtimeErrors": [{"line": 10, "type": "null-reference", "description": "...", "fix": "..."}],
  "logicBugs": [{"line": 15, "type": "off-by-one", "description": "...", "fix": "..."}],
  "performance": [{"line": 20, "type": "inefficient-loop", "description": "...", "fix": "..."}],
  "security": [{"line": 25, "type": "sql-injection", "description": "...", "fix": "..."}],
  "quality": [{"line": 30, "type": "code-smell", "description": "...", "fix": "..."}],
  "recommendedBreakpoints": [{"line": 35, "reason": "Critical execution path"}],
  "watchExpressions": ["variable1", "object.property"],
  "debuggingStrategy": "Step-by-step debugging approach..."
}
        `);

        return analysis || {
            runtimeErrors: [],
            logicBugs: [],
            performance: [],
            security: [],
            quality: [],
            recommendedBreakpoints: [],
            watchExpressions: [],
            debuggingStrategy: 'Standard debugging approach'
        };
    }

    // ========================================================================
    // REAL-TIME DEBUGGING SESSION
    // ========================================================================

    async startDebugSession(config) {
        const sessionId = `session_${Date.now()}`;
        
        const session = {
            id: sessionId,
            config,
            startTime: Date.now(),
            status: 'running',
            callStack: [],
            variables: new Map(),
            performance: {
                memoryUsage: [],
                executionTime: [],
                cpuUsage: []
            }
        };

        this.debugSessions.set(sessionId, session);
        this.currentSession = session;
        this.isDebugging = true;

        // Start real-time monitoring
        this.startPerformanceMonitoring(session);
        this.updateDebugUI();

        console.log(`[AdvancedDebugger] 🎬 Debug session started: ${sessionId}`);
        return session;
    }

    startPerformanceMonitoring(session) {
        const monitor = setInterval(() => {
            if (!this.isDebugging) {
                clearInterval(monitor);
                return;
            }

            const metrics = {
                timestamp: Date.now(),
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null,
                timing: performance.now()
            };

            session.performance.memoryUsage.push(metrics);
            this.updatePerformanceUI(metrics);
        }, 1000);

        session.monitor = monitor;
    }

    // ========================================================================
    // INTELLIGENT VARIABLE INSPECTION
    // ========================================================================

    async inspectVariable(variableName, context) {
        try {
            const value = await this.evaluateExpression(variableName, context);
            const analysis = await this.analyzeVariable(variableName, value);
            
            const inspection = {
                name: variableName,
                value,
                type: typeof value,
                analysis,
                timestamp: Date.now()
            };

            this.variables.set(variableName, inspection);
            this.updateVariablesUI();
            
            return inspection;
        } catch (error) {
            console.error(`[AdvancedDebugger] Failed to inspect ${variableName}:`, error);
            return null;
        }
    }

    async analyzeVariable(name, value) {
        const analysis = await this.getAIAnalysis(`
Analyze this variable for debugging insights:

Variable: ${name}
Value: ${JSON.stringify(value, null, 2)}
Type: ${typeof value}

Provide debugging insights:
1. Potential issues with this value
2. Expected vs actual state
3. Suggestions for investigation
4. Related variables to check

Respond in JSON format:
{
  "issues": ["issue1", "issue2"],
  "expectedState": "description",
  "suggestions": ["suggestion1", "suggestion2"],
  "relatedVariables": ["var1", "var2"]
}
        `);

        return analysis || {
            issues: [],
            expectedState: 'Unknown',
            suggestions: ['Monitor for changes'],
            relatedVariables: []
        };
    }

    // ========================================================================
    // PREDICTIVE ERROR DETECTION
    // ========================================================================

    async predictErrors(code) {
        const predictions = await this.getAIAnalysis(`
Predict potential runtime errors in this code before execution:

${code}

Focus on:
1. Null/undefined access patterns
2. Type mismatches
3. Async/await issues
4. Resource leaks
5. Infinite loops
6. Memory issues

Respond in JSON format:
{
  "predictions": [
    {
      "line": 10,
      "probability": 0.8,
      "type": "null-reference",
      "description": "Variable may be null",
      "prevention": "Add null check",
      "severity": "high"
    }
  ]
}
        `);

        this.errorPredictions = predictions?.predictions || [];
        this.displayErrorPredictions();
        
        return this.errorPredictions;
    }

    // ========================================================================
    // UI COMPONENTS
    // ========================================================================

    initializeUI() {
        this.createDebugPanel();
        this.createBreakpointPanel();
        this.createVariablesPanel();
        this.createPerformancePanel();
        this.createAIInsightsPanel();
    }

    createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'advanced-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 400px;
            height: 600px;
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(20px);
            border: 2px solid var(--cyan);
            border-radius: 12px;
            z-index: 9999;
            display: none;
            overflow: hidden;
        `;

        panel.innerHTML = `
            <div style="padding: 15px; background: rgba(0, 0, 0, 0.5); border-bottom: 2px solid var(--cyan); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: var(--cyan); font-size: 16px;">🔧 Advanced Debugger</h3>
                <button onclick="this.parentElement.parentElement.style.display='none'" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;">×</button>
            </div>
            
            <div style="height: 100%; overflow-y: auto;">
                <div id="debug-tabs" style="display: flex; background: rgba(0, 0, 0, 0.3);">
                    <button class="debug-tab active" onclick="window.advancedDebugger.switchTab('breakpoints')">Breakpoints</button>
                    <button class="debug-tab" onclick="window.advancedDebugger.switchTab('variables')">Variables</button>
                    <button class="debug-tab" onclick="window.advancedDebugger.switchTab('placeholders')">TODOs</button>
                    <button class="debug-tab" onclick="window.advancedDebugger.switchTab('performance')">Performance</button>
                    <button class="debug-tab" onclick="window.advancedDebugger.switchTab('ai-insights')">AI Insights</button>
                </div>
                
                <div id="debug-content" style="padding: 15px;">
                    <div id="breakpoints-tab" class="debug-tab-content">
                        <div id="breakpoints-list"></div>
                        <button onclick="window.advancedDebugger.addSmartBreakpoint()" style="width: 100%; padding: 8px; background: var(--cyan); color: black; border: none; border-radius: 4px; margin-top: 10px;">Add Smart Breakpoint</button>
                    </div>
                    
                    <div id="variables-tab" class="debug-tab-content" style="display: none;">
                        <div id="variables-list"></div>
                    </div>
                    
                    <div id="placeholders-tab" class="debug-tab-content" style="display: none;">
                        <div id="placeholders-content">
                            <button onclick="window.advancedDebugger.scanForPlaceholders()" style="width: 100%; padding: 10px; background: var(--orange); color: black; border: none; border-radius: 4px; margin-bottom: 15px;">Scan for TODOs & Placeholders</button>
                            <div id="placeholders-results"></div>
                        </div>
                    </div>
                    
                    <div id="performance-tab" class="debug-tab-content" style="display: none;">
                        <div id="performance-metrics"></div>
                    </div>
                    
                    <div id="ai-insights-tab" class="debug-tab-content" style="display: none;">
                        <div id="ai-insights-content"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.addDebugStyles();
    }

    addDebugStyles() {
        if (document.getElementById('advanced-debug-styles')) return;

        const style = document.createElement('style');
        style.id = 'advanced-debug-styles';
        style.textContent = `
            .debug-tab {
                flex: 1;
                padding: 10px;
                background: rgba(0, 0, 0, 0.3);
                border: none;
                color: #888;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            }
            
            .debug-tab.active {
                background: var(--cyan);
                color: black;
            }
            
            .debug-tab:hover {
                background: rgba(0, 212, 255, 0.2);
                color: var(--cyan);
            }
            
            .breakpoint-item {
                padding: 10px;
                margin: 8px 0;
                background: rgba(0, 0, 0, 0.3);
                border-left: 3px solid var(--cyan);
                border-radius: 4px;
                font-size: 12px;
            }
            
            .variable-item {
                padding: 8px;
                margin: 6px 0;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
                font-size: 11px;
            }
            
            .performance-metric {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                font-size: 11px;
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    async getFileContent(file) {
        if (window.editor && window.editor.getModel()) {
            return window.editor.getValue();
        }
        return '';
    }

    async evaluateExpression(expression, context) {
        try {
            if (!context || typeof expression !== 'string' || !expression) {
                return 'Error: Invalid expression or context';
            }
            
            // Sanitize: only allow alphanumeric, dots, and brackets for property access
            if (!/^[a-zA-Z_$][a-zA-Z0-9_$.\[\]]*$/.test(expression)) {
                return 'Error: Invalid expression format';
            }
            
            // Safe property access without eval
            const parts = expression.split('.');
            let value = context;
            
            for (const part of parts) {
                if (value === null || value === undefined) {
                    return 'Error: Cannot access property of null/undefined';
                }
                value = value[part];
            }
            
            return value !== undefined ? value : 'Error: Variable not found in context';
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }

    async getAIAnalysis(prompt) {
        try {
            const response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    model: 'BigDaddyG:Debug'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const jsonMatch = data.response?.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return null;
        } catch (error) {
            console.error('[AdvancedDebugger] AI Analysis error:', error);
            return null;
        }
    }

    // ========================================================================
    // UI UPDATE METHODS
    // ========================================================================

    updateBreakpointUI() {
        const container = document.getElementById('breakpoints-list');
        if (!container) return;

        container.textContent = '';
        Array.from(this.breakpoints.values()).forEach(bp => {
            const item = document.createElement('div');
            item.className = 'breakpoint-item';
            
            const header = document.createElement('div');
            header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
            
            const location = document.createElement('span');
            location.style.cssText = 'color: var(--cyan); font-weight: bold;';
            location.textContent = `${bp.file}:${bp.line}`;
            
            const hits = document.createElement('span');
            hits.style.cssText = 'color: #888; font-size: 10px;';
            hits.textContent = `Hits: ${bp.hitCount}`;
            
            header.appendChild(location);
            header.appendChild(hits);
            item.appendChild(header);
            
            const condition = document.createElement('div');
            condition.style.cssText = 'color: #fff; margin-top: 4px; font-size: 11px;';
            condition.textContent = bp.condition || 'Always';
            item.appendChild(condition);
            
            if (bp.aiSuggestions?.length) {
                const suggestions = document.createElement('div');
                suggestions.style.cssText = 'margin-top: 6px; padding: 6px; background: rgba(0, 255, 136, 0.05); border-radius: 3px;';
                
                const title = document.createElement('div');
                title.style.cssText = 'color: var(--green); font-size: 10px;';
                title.textContent = '💡 AI Suggestions:';
                suggestions.appendChild(title);
                
                bp.aiSuggestions.forEach(s => {
                    const sug = document.createElement('div');
                    sug.style.cssText = 'color: #ccc; font-size: 10px;';
                    sug.textContent = `• ${s}`;
                    suggestions.appendChild(sug);
                });
                
                item.appendChild(suggestions);
            }
            
            container.appendChild(item);
        });
    }

    updateVariablesUI() {
        const container = document.getElementById('variables-list');
        if (!container) return;

        container.textContent = '';
        Array.from(this.variables.values()).forEach(variable => {
            const item = document.createElement('div');
            item.className = 'variable-item';
            
            const header = document.createElement('div');
            header.style.cssText = 'display: flex; justify-content: space-between;';
            
            const name = document.createElement('span');
            name.style.cssText = 'color: var(--cyan);';
            name.textContent = variable.name;
            
            const type = document.createElement('span');
            type.style.cssText = 'color: #888; font-size: 10px;';
            type.textContent = variable.type;
            
            header.appendChild(name);
            header.appendChild(type);
            item.appendChild(header);
            
            const value = document.createElement('div');
            value.style.cssText = 'color: #fff; margin-top: 4px; font-size: 10px; word-break: break-all;';
            const valueStr = JSON.stringify(variable.value);
            value.textContent = valueStr.substring(0, 100) + (valueStr.length > 100 ? '...' : '');
            item.appendChild(value);
            
            container.appendChild(item);
        });
    }

    updatePerformanceUI(metrics) {
        const container = document.getElementById('performance-metrics');
        if (!container) return;

        container.innerHTML = `
            <div class="performance-metric">
                <span>Memory Used:</span>
                <span style="color: var(--cyan);">${metrics.memory ? (metrics.memory.used / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</span>
            </div>
            <div class="performance-metric">
                <span>Execution Time:</span>
                <span style="color: var(--green);">${metrics.timing.toFixed(2)} ms</span>
            </div>
            <div class="performance-metric">
                <span>Active Sessions:</span>
                <span style="color: var(--orange);">${this.debugSessions.size}</span>
            </div>
            <div class="performance-metric">
                <span>Breakpoints:</span>
                <span style="color: var(--red);">${this.breakpoints.size}</span>
            </div>
        `;
    }

    displayAIInsights(analysis) {
        const container = document.getElementById('ai-insights-content');
        if (!container) return;

        const totalIssues = (analysis.runtimeErrors?.length || 0) + 
                           (analysis.logicBugs?.length || 0) + 
                           (analysis.performance?.length || 0) + 
                           (analysis.security?.length || 0);

        container.textContent = '';
        
        const summary = document.createElement('div');
        summary.style.cssText = 'text-align: center; margin-bottom: 15px;';
        
        const count = document.createElement('div');
        count.style.cssText = 'font-size: 24px; color: var(--cyan);';
        count.textContent = totalIssues.toString();
        
        const label = document.createElement('div');
        label.style.cssText = 'font-size: 11px; color: #888;';
        label.textContent = 'Issues Detected';
        
        summary.appendChild(count);
        summary.appendChild(label);
        container.appendChild(summary);
        
        if (analysis.debuggingStrategy) {
            const strategy = document.createElement('div');
            strategy.style.cssText = 'margin-bottom: 15px; padding: 10px; background: rgba(0, 255, 136, 0.05); border-radius: 6px;';
            
            const title = document.createElement('div');
            title.style.cssText = 'color: var(--green); font-size: 12px; font-weight: bold; margin-bottom: 6px;';
            title.textContent = '🎯 Debugging Strategy';
            
            const content = document.createElement('div');
            content.style.cssText = 'color: #ccc; font-size: 11px;';
            content.textContent = analysis.debuggingStrategy;
            
            strategy.appendChild(title);
            strategy.appendChild(content);
            container.appendChild(strategy);
        }
        
        if (analysis.recommendedBreakpoints?.length) {
            const section = document.createElement('div');
            section.style.cssText = 'margin-bottom: 15px;';
            
            const title = document.createElement('div');
            title.style.cssText = 'color: var(--cyan); font-size: 12px; font-weight: bold; margin-bottom: 8px;';
            title.textContent = '📍 Recommended Breakpoints';
            section.appendChild(title);
            
            analysis.recommendedBreakpoints.forEach(bp => {
                const item = document.createElement('div');
                item.style.cssText = 'padding: 6px; background: rgba(0, 0, 0, 0.2); border-radius: 4px; margin-bottom: 4px; font-size: 11px;';
                
                const lineSpan = document.createElement('span');
                lineSpan.style.cssText = 'color: var(--orange);';
                lineSpan.textContent = `Line ${bp.line}: `;
                
                const reason = document.createTextNode(bp.reason);
                
                item.appendChild(lineSpan);
                item.appendChild(reason);
                section.appendChild(item);
            });
            
            container.appendChild(section);
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.debug-tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.debug-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }
        
        // Add active class to clicked button
        event.target.classList.add('active');
    }

    // ========================================================================
    // PLACEHOLDER & TODO DETECTION
    // ========================================================================

    async scanForPlaceholders() {
        console.log('[AdvancedDebugger] 🔍 Scanning for placeholders and TODOs...');
        
        if (window.placeholderDebugger) {
            await window.placeholderDebugger.scanCurrentFile();
        } else {
            // Fallback basic scan
            const code = await this.getFileContent('current');
            const placeholders = this.detectPlaceholders(code);
            this.displayPlaceholderInsights(placeholders);
        }
    }

    detectPlaceholders(code) {
        const lines = code.split('\n');
        const placeholders = [];
        
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // TODO patterns
            if (/\/\/\s*TODO|#\s*TODO|\/\*\s*TODO/i.test(line)) {
                placeholders.push({
                    type: 'TODO',
                    line: lineNum,
                    content: line.trim(),
                    severity: 'info'
                });
            }
            
            // FIXME patterns
            if (/\/\/\s*FIXME|#\s*FIXME|\/\*\s*FIXME/i.test(line)) {
                placeholders.push({
                    type: 'FIXME',
                    line: lineNum,
                    content: line.trim(),
                    severity: 'warning'
                });
            }
            
            // Not implemented
            if (/throw new Error\(['"`]Not implemented['"`]\)|console\.log\(['"`]Not implemented['"`]\)/.test(line)) {
                placeholders.push({
                    type: 'NOT_IMPLEMENTED',
                    line: lineNum,
                    content: line.trim(),
                    severity: 'error'
                });
            }
            
            // Empty functions
            if (/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
                placeholders.push({
                    type: 'EMPTY_FUNCTION',
                    line: lineNum,
                    content: line.trim(),
                    severity: 'warning'
                });
            }
        });
        
        return placeholders;
    }

    displayPlaceholderInsights(placeholders) {
        const container = document.getElementById('ai-insights-content');
        if (!container) return;

        const totalIssues = placeholders.length;
        const todos = placeholders.filter(p => p.type === 'TODO').length;
        const fixmes = placeholders.filter(p => p.type === 'FIXME').length;
        const notImplemented = placeholders.filter(p => p.type === 'NOT_IMPLEMENTED').length;

        // Clear container safely
        container.textContent = '';
        
        // Create summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.style.cssText = 'text-align: center; margin-bottom: 15px;';
        
        const issuesCount = document.createElement('div');
        issuesCount.style.cssText = 'font-size: 24px; color: var(--orange);';
        issuesCount.textContent = totalIssues.toString();
        
        const issuesLabel = document.createElement('div');
        issuesLabel.style.cssText = 'font-size: 11px; color: #888;';
        issuesLabel.textContent = 'Placeholders Found';
        
        summaryDiv.appendChild(issuesCount);
        summaryDiv.appendChild(issuesLabel);
        container.appendChild(summaryDiv);
        
        // Create placeholder summary
        const summarySection = document.createElement('div');
        summarySection.style.cssText = 'margin-bottom: 15px; padding: 10px; background: rgba(255, 165, 0, 0.05); border-radius: 6px;';
        
        const summaryTitle = document.createElement('div');
        summaryTitle.style.cssText = 'color: var(--orange); font-size: 12px; font-weight: bold; margin-bottom: 6px;';
        summaryTitle.textContent = '🔍 Placeholder Summary';
        summarySection.appendChild(summaryTitle);
        
        const todoCount = document.createElement('div');
        todoCount.style.cssText = 'color: #ccc; font-size: 11px; margin-bottom: 4px;';
        todoCount.textContent = `📝 TODOs: ${todos}`;
        summarySection.appendChild(todoCount);
        
        const fixmeCount = document.createElement('div');
        fixmeCount.style.cssText = 'color: #ccc; font-size: 11px; margin-bottom: 4px;';
        fixmeCount.textContent = `🔧 FIXMEs: ${fixmes}`;
        summarySection.appendChild(fixmeCount);
        
        const notImplCount = document.createElement('div');
        notImplCount.style.cssText = 'color: #ccc; font-size: 11px; margin-bottom: 4px;';
        notImplCount.textContent = `❌ Not Implemented: ${notImplemented}`;
        summarySection.appendChild(notImplCount);
        
        container.appendChild(summarySection);
        
        // Create issues list if any
        if (placeholders.length > 0) {
            const issuesSection = document.createElement('div');
            issuesSection.style.cssText = 'margin-bottom: 15px;';
            
            const issuesTitle = document.createElement('div');
            issuesTitle.style.cssText = 'color: var(--cyan); font-size: 12px; font-weight: bold; margin-bottom: 8px;';
            issuesTitle.textContent = '🎯 Issues Found';
            issuesSection.appendChild(issuesTitle);
            
            placeholders.slice(0, 5).forEach(p => {
                const issueDiv = document.createElement('div');
                issueDiv.style.cssText = 'padding: 6px; background: rgba(0, 0, 0, 0.2); border-radius: 4px; margin-bottom: 4px; font-size: 11px;';
                
                const lineSpan = document.createElement('span');
                lineSpan.style.cssText = 'color: var(--orange);';
                lineSpan.textContent = `Line ${p.line}: `;
                
                const contentText = document.createTextNode(`${p.type} - ${p.content.substring(0, 50)}${p.content.length > 50 ? '...' : ''}`);
                
                issueDiv.appendChild(lineSpan);
                issueDiv.appendChild(contentText);
                issuesSection.appendChild(issueDiv);
            });
            
            if (placeholders.length > 5) {
                const moreDiv = document.createElement('div');
                moreDiv.style.cssText = 'font-size: 10px; color: #888; text-align: center; margin-top: 8px;';
                moreDiv.textContent = `... and ${placeholders.length - 5} more`;
                issuesSection.appendChild(moreDiv);
            }
            
            container.appendChild(issuesSection);
        }
        
        // Create scan button
        const scanBtn = document.createElement('button');
        scanBtn.style.cssText = 'width: 100%; padding: 8px; background: var(--orange); color: black; border: none; border-radius: 4px; margin-top: 10px;';
        scanBtn.textContent = 'Enhanced Scan';
        scanBtn.onclick = () => window.advancedDebugger?.scanForPlaceholders();
        container.appendChild(scanBtn);
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    show() {
        const panel = document.getElementById('advanced-debug-panel');
        if (panel) {
            panel.style.display = 'block';
        }
    }

    hide() {
        const panel = document.getElementById('advanced-debug-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    async addSmartBreakpoint() {
        const file = prompt('File path:') || 'current';
        const line = parseInt(prompt('Line number:')) || 1;
        const condition = prompt('Condition (optional):') || null;
        
        await this.setSmartBreakpoint(file, line, condition);
    }
}

// ============================================================================
// INITIALIZATION & GLOBAL ACCESS
// ============================================================================

window.AdvancedDebuggingSystem = AdvancedDebuggingSystem;

// Initialize when DOM is ready
setTimeout(() => {
    window.advancedDebugger = new AdvancedDebuggingSystem();
    
    // Add to command palette
    if (window.commandPalette) {
        window.commandPalette.addCommand({
            id: 'debug.show',
            title: 'Debug: Show Advanced Debugger',
            action: () => window.advancedDebugger.show()
        });
        
        window.commandPalette.addCommand({
            id: 'debug.analyze',
            title: 'Debug: AI Analysis',
            action: () => window.advancedDebugger.startAIDebugging('current')
        });
        
        window.commandPalette.addCommand({
            id: 'debug.placeholders',
            title: 'Debug: Find TODOs & Placeholders',
            action: () => window.advancedDebugger.scanForPlaceholders()
        });
        
        window.commandPalette.addCommand({
            id: 'debug.complete',
            title: 'Debug: Complete Implementation Check',
            action: () => {
                window.advancedDebugger.show();
                window.advancedDebugger.switchTab('placeholders');
                window.advancedDebugger.scanForPlaceholders();
            }
        });
    }
    
    console.log('[AdvancedDebugger] 🎯 Advanced Debugging System ready');
}, 2000);

// Keyboard shortcut: Ctrl+Shift+D
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (window.advancedDebugger) {
            window.advancedDebugger.show();
        }
    }
});

console.log('[AdvancedDebugger] 📦 Advanced Debugging System module loaded');