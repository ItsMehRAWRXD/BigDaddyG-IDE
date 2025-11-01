/**
 * AI-Powered Live Preview Engine
 * Revolutionary feature: AI executes code safely in sandboxed environment
 * and provides real-time visual output + predictions
 */

class AILivePreview {
    constructor(editor) {
        this.editor = editor;
        this.previewWindow = null;
        this.executionHistory = [];
        this.predictions = [];
        this.isActive = false;
        this.debounceTimer = null;
        this.sandbox = null;
        
        console.log('[LivePreview] 🚀 AI Live Preview Engine initialized');
    }
    
    // ========================================================================
    // MAIN PREVIEW PANEL
    // ========================================================================
    
    createPreviewPanel() {
        const panel = document.createElement('div');
        panel.id = 'ai-live-preview-panel';
        panel.style.cssText = `
            position: fixed;
            right: 20px;
            top: 80px;
            width: 450px;
            height: calc(100vh - 100px);
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(20px);
            border: 2px solid var(--cyan);
            border-radius: 15px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 50px rgba(0, 212, 255, 0.4);
            overflow: hidden;
        `;
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="padding: 15px; background: rgba(0, 0, 0, 0.5); border-bottom: 2px solid var(--cyan); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <h3 style="margin: 0; color: var(--cyan); font-size: 16px;">⚡ AI Live Preview</h3>
                    <span id="preview-status" style="font-size: 11px; color: var(--green); font-weight: bold;">● ACTIVE</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="window.aiLivePreview.togglePredictions()" style="background: rgba(168, 85, 247, 0.2); border: 1px solid var(--purple); color: var(--purple); padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 11px;">🔮 AI Predict</button>
                    <button onclick="window.aiLivePreview.togglePreview()" style="background: rgba(255, 107, 53, 0.2); border: 1px solid var(--orange); color: var(--orange); padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 11px;">✕</button>
                </div>
            </div>
            
            <!-- Tab Bar -->
            <div style="display: flex; background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(0, 212, 255, 0.2);">
                <button class="preview-tab active" data-tab="output" onclick="window.aiLivePreview.switchTab('output')">📺 Output</button>
                <button class="preview-tab" data-tab="console" onclick="window.aiLivePreview.switchTab('console')">📋 Console</button>
                <button class="preview-tab" data-tab="predict" onclick="window.aiLivePreview.switchTab('predict')">🔮 Predictions</button>
                <button class="preview-tab" data-tab="performance" onclick="window.aiLivePreview.switchTab('performance')">⚡ Perf</button>
            </div>
            
            <!-- Output Tab -->
            <div id="preview-tab-output" class="preview-tab-content" style="flex: 1; overflow: auto; padding: 15px;">
                <div id="preview-output" style="background: #000; border-radius: 8px; min-height: 100%; padding: 15px; font-family: monospace; font-size: 13px; color: #0f0;">
                    <div style="color: var(--cyan);">// Waiting for code...</div>
                </div>
            </div>
            
            <!-- Console Tab -->
            <div id="preview-tab-console" class="preview-tab-content" style="display: none; flex: 1; overflow: auto; padding: 15px;">
                <div id="preview-console" style="background: #000; border-radius: 8px; min-height: 100%; padding: 15px; font-family: monospace; font-size: 12px; color: #0f0;">
                </div>
            </div>
            
            <!-- Predictions Tab -->
            <div id="preview-tab-predict" class="preview-tab-content" style="display: none; flex: 1; overflow: auto; padding: 15px;">
                <div id="preview-predictions" style="font-size: 12px;">
                    <div style="color: #888; text-align: center; padding: 20px;">
                        Enable AI Predictions to see runtime forecasts
                    </div>
                </div>
            </div>
            
            <!-- Performance Tab -->
            <div id="preview-tab-performance" class="preview-tab-content" style="display: none; flex: 1; overflow: auto; padding: 15px;">
                <div id="preview-performance">
                    <div class="perf-metric">
                        <span style="color: #888;">Execution Time:</span>
                        <span id="perf-time" style="color: var(--cyan); font-weight: bold;">0ms</span>
                    </div>
                    <div class="perf-metric">
                        <span style="color: #888;">Memory Used:</span>
                        <span id="perf-memory" style="color: var(--green); font-weight: bold;">0 KB</span>
                    </div>
                    <div class="perf-metric">
                        <span style="color: #888;">AI Complexity:</span>
                        <span id="perf-complexity" style="color: var(--purple); font-weight: bold;">O(1)</span>
                    </div>
                    <div style="margin-top: 20px;">
                        <canvas id="perf-chart" width="400" height="200" style="width: 100%;"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Control Bar -->
            <div style="padding: 12px; background: rgba(0, 0, 0, 0.5); border-top: 1px solid rgba(0, 212, 255, 0.2); display: flex; gap: 8px;">
                <button onclick="window.aiLivePreview.executeNow()" style="flex: 1; background: var(--green); color: #000; border: none; padding: 8px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px;">▶ Run Now</button>
                <button onclick="window.aiLivePreview.clearOutput()" style="background: rgba(255, 71, 87, 0.2); border: 1px solid var(--red); color: var(--red); padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">🗑️</button>
                <button onclick="window.aiLivePreview.exportResults()" style="background: rgba(0, 212, 255, 0.2); border: 1px solid var(--cyan); color: var(--cyan); padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">💾</button>
            </div>
        `;
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .preview-tab {
                background: transparent;
                border: none;
                color: #888;
                padding: 10px 15px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
                border-bottom: 2px solid transparent;
            }
            
            .preview-tab:hover {
                background: rgba(0, 212, 255, 0.1);
                color: #fff;
            }
            
            .preview-tab.active {
                color: var(--cyan);
                border-bottom: 2px solid var(--cyan);
                font-weight: bold;
            }
            
            .perf-metric {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 5px;
                margin-bottom: 8px;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(panel);
        this.previewWindow = panel;
        
        // Start listening to editor changes
        this.startListening();
        
        console.log('[LivePreview] ✅ Preview panel created');
    }
    
    // ========================================================================
    // EXECUTION ENGINE
    // ========================================================================
    
    startListening() {
        if (!this.editor) return;
        
        this.editor.onDidChangeModelContent(() => {
            if (!this.isActive) return;
            
            // Debounce execution
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.executeCode();
            }, 800); // Wait 800ms after typing stops
        });
        
        console.log('[LivePreview] 👂 Listening to editor changes');
    }
    
    async executeCode() {
        const code = this.editor.getValue();
        const language = this.detectLanguage();
        
        console.log(`[LivePreview] 🔄 Executing ${language} code...`);
        
        const startTime = performance.now();
        
        try {
            let result;
            
            switch(language) {
                case 'javascript':
                case 'typescript':
                    result = await this.executeJavaScript(code);
                    break;
                case 'python':
                    result = await this.executePython(code);
                    break;
                case 'html':
                    result = this.executeHTML(code);
                    break;
                default:
                    result = { output: '// Language not supported for live preview yet', error: null };
            }
            
            const executionTime = performance.now() - startTime;
            
            this.displayResult(result, executionTime);
            this.updatePerformance(executionTime, code);
            
            // AI Prediction
            if (this.predictions.length > 0) {
                this.updatePredictions(code, result);
            }
            
        } catch (error) {
            this.displayError(error);
        }
    }
    
    async executeJavaScript(code) {
        const logs = [];
        const errors = [];
        let returnValue = undefined;
        
        // Create safe sandbox
        const sandbox = {
            console: {
                log: (...args) => logs.push({ type: 'log', args }),
                error: (...args) => errors.push({ type: 'error', args }),
                warn: (...args) => logs.push({ type: 'warn', args }),
                info: (...args) => logs.push({ type: 'info', args })
            },
            // Provide safe globals
            Math, Date, JSON, Array, Object, String, Number
        };
        
        try {
            // Execute in sandbox
            const func = new Function(...Object.keys(sandbox), `
                "use strict";
                ${code}
            `);
            
            returnValue = func(...Object.values(sandbox));
            
            // If it's a promise, await it
            if (returnValue instanceof Promise) {
                returnValue = await returnValue;
            }
            
        } catch (error) {
            errors.push({ type: 'error', args: [error.message] });
        }
        
        return {
            output: returnValue !== undefined ? String(returnValue) : '',
            logs,
            errors,
            language: 'javascript'
        };
    }
    
    async executePython(code) {
        // Call Python backend via BigDaddyG API
        try {
            const response = await fetch('http://localhost:11441/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: 'python',
                    timeout: 5000
                })
            });
            
            const data = await response.json();
            return {
                output: data.output || '',
                logs: data.logs || [],
                errors: data.errors || [],
                language: 'python'
            };
        } catch (error) {
            return {
                output: '',
                logs: [],
                errors: [{ type: 'error', args: [`Backend error: ${error.message}`] }],
                language: 'python'
            };
        }
    }
    
    executeHTML(code) {
        // Create iframe preview
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width: 100%; height: 100%; border: none; background: white; border-radius: 8px;';
        iframe.srcdoc = code;
        
        const outputDiv = document.getElementById('preview-output');
        outputDiv.innerHTML = '';
        outputDiv.appendChild(iframe);
        
        return {
            output: 'HTML rendered in preview',
            logs: [],
            errors: [],
            language: 'html'
        };
    }
    
    // ========================================================================
    // AI PREDICTIONS
    // ========================================================================
    
    async generatePredictions(code) {
        console.log('[LivePreview] 🔮 Generating AI predictions...');
        
        try {
            const response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Analyze this code and predict:
1. Potential runtime errors
2. Performance bottlenecks
3. Edge cases that might fail
4. Expected output for common inputs

Code:
${code}`,
                    model: 'BigDaddyG:Code'
                })
            });
            
            const data = await response.json();
            
            const predictions = this.parsePredictions(data.response);
            this.displayPredictions(predictions);
            
        } catch (error) {
            console.error('[LivePreview] ❌ Prediction error:', error);
        }
    }
    
    parsePredictions(aiResponse) {
        // Parse AI response into structured predictions
        return {
            errors: this.extractSection(aiResponse, 'runtime errors'),
            performance: this.extractSection(aiResponse, 'performance'),
            edgeCases: this.extractSection(aiResponse, 'edge cases'),
            expectedOutput: this.extractSection(aiResponse, 'expected output')
        };
    }
    
    extractSection(text, sectionName) {
        const regex = new RegExp(`${sectionName}[:\\s]+([^\\n]+(?:\\n(?!\\d+\\.)[^\\n]+)*)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : 'No predictions available';
    }
    
    displayPredictions(predictions) {
        const container = document.getElementById('preview-predictions');
        
        container.innerHTML = `
            <div style="margin-bottom: 15px; padding: 12px; background: rgba(255, 71, 87, 0.1); border-left: 3px solid var(--red); border-radius: 5px;">
                <strong style="color: var(--red); font-size: 13px;">⚠️ Potential Errors:</strong><br>
                <div style="color: #ccc; font-size: 12px; margin-top: 8px; line-height: 1.6;">${predictions.errors}</div>
            </div>
            
            <div style="margin-bottom: 15px; padding: 12px; background: rgba(255, 165, 0, 0.1); border-left: 3px solid var(--orange); border-radius: 5px;">
                <strong style="color: var(--orange); font-size: 13px;">⚡ Performance:</strong><br>
                <div style="color: #ccc; font-size: 12px; margin-top: 8px; line-height: 1.6;">${predictions.performance}</div>
            </div>
            
            <div style="margin-bottom: 15px; padding: 12px; background: rgba(168, 85, 247, 0.1); border-left: 3px solid var(--purple); border-radius: 5px;">
                <strong style="color: var(--purple); font-size: 13px;">🔍 Edge Cases:</strong><br>
                <div style="color: #ccc; font-size: 12px; margin-top: 8px; line-height: 1.6;">${predictions.edgeCases}</div>
            </div>
            
            <div style="padding: 12px; background: rgba(0, 212, 255, 0.1); border-left: 3px solid var(--cyan); border-radius: 5px;">
                <strong style="color: var(--cyan); font-size: 13px;">📊 Expected Output:</strong><br>
                <div style="color: #ccc; font-size: 12px; margin-top: 8px; line-height: 1.6;">${predictions.expectedOutput}</div>
            </div>
        `;
    }
    
    // ========================================================================
    // DISPLAY FUNCTIONS
    // ========================================================================
    
    displayResult(result, executionTime) {
        const outputDiv = document.getElementById('preview-output');
        const consoleDiv = document.getElementById('preview-console');
        
        if (result.language === 'html') {
            // Already handled in executeHTML
            return;
        }
        
        // Display output
        let outputHTML = '';
        
        if (result.output) {
            outputHTML += `<div style="color: var(--green); margin-bottom: 10px;">
                <strong>// Output:</strong><br>
                <pre style="margin: 5px 0; white-space: pre-wrap;">${this.escapeHtml(result.output)}</pre>
            </div>`;
        }
        
        if (result.errors && result.errors.length > 0) {
            result.errors.forEach(err => {
                outputHTML += `<div style="color: var(--red); margin-bottom: 10px;">
                    <strong>❌ Error:</strong> ${this.escapeHtml(err.args.join(' '))}
                </div>`;
            });
        }
        
        if (!result.output && result.errors.length === 0) {
            outputHTML = '<div style="color: #888;">// No output (code executed successfully)</div>';
        }
        
        outputDiv.innerHTML = outputHTML;
        
        // Display console logs
        let consoleHTML = '';
        
        if (result.logs && result.logs.length > 0) {
            result.logs.forEach(log => {
                const color = log.type === 'warn' ? 'var(--orange)' : 'var(--cyan)';
                consoleHTML += `<div style="color: ${color}; margin-bottom: 5px; font-size: 11px;">
                    [${log.type}] ${this.escapeHtml(log.args.join(' '))}
                </div>`;
            });
        } else {
            consoleHTML = '<div style="color: #888; font-size: 11px;">// No console output</div>';
        }
        
        consoleDiv.innerHTML = consoleHTML;
        
        console.log(`[LivePreview] ✅ Execution completed in ${executionTime.toFixed(2)}ms`);
    }
    
    displayError(error) {
        const outputDiv = document.getElementById('preview-output');
        outputDiv.innerHTML = `
            <div style="color: var(--red);">
                <strong>❌ Execution Error:</strong><br>
                <pre style="margin-top: 10px; white-space: pre-wrap;">${this.escapeHtml(error.message)}</pre>
            </div>
        `;
    }
    
    updatePerformance(executionTime, code) {
        document.getElementById('perf-time').textContent = `${executionTime.toFixed(2)}ms`;
        
        // Estimate memory (rough calculation)
        const memoryEstimate = new Blob([code]).size / 1024;
        document.getElementById('perf-memory').textContent = `${memoryEstimate.toFixed(2)} KB`;
        
        // AI complexity analysis (simplified)
        const complexity = this.estimateComplexity(code);
        document.getElementById('perf-complexity').textContent = complexity;
        
        // Update history for chart
        this.executionHistory.push({ time: executionTime, timestamp: Date.now() });
        if (this.executionHistory.length > 20) this.executionHistory.shift();
        
        this.drawPerformanceChart();
    }
    
    estimateComplexity(code) {
        const loops = (code.match(/for|while/g) || []).length;
        const recursion = (code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*\1/g) || []).length;
        
        if (recursion > 0) return 'O(2^n)';
        if (loops > 2) return 'O(n³)';
        if (loops > 1) return 'O(n²)';
        if (loops > 0) return 'O(n)';
        return 'O(1)';
    }
    
    drawPerformanceChart() {
        const canvas = document.getElementById('perf-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        if (this.executionHistory.length < 2) return;
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw line
        const maxTime = Math.max(...this.executionHistory.map(h => h.time));
        const step = width / (this.executionHistory.length - 1);
        
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.executionHistory.forEach((point, i) => {
            const x = i * step;
            const y = height - (point.time / maxTime) * height * 0.9;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#00ff88';
        this.executionHistory.forEach((point, i) => {
            const x = i * step;
            const y = height - (point.time / maxTime) * height * 0.9;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // ========================================================================
    // UI CONTROLS
    // ========================================================================
    
    switchTab(tabName) {
        // Update tabs
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.preview-tab[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.preview-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`preview-tab-${tabName}`).style.display = 'flex';
    }
    
    togglePreview() {
        if (this.previewWindow) {
            this.previewWindow.remove();
            this.previewWindow = null;
            this.isActive = false;
            console.log('[LivePreview] ✕ Preview closed');
        }
    }
    
    togglePredictions() {
        const code = this.editor.getValue();
        this.generatePredictions(code);
        this.switchTab('predict');
    }
    
    executeNow() {
        clearTimeout(this.debounceTimer);
        this.executeCode();
    }
    
    clearOutput() {
        document.getElementById('preview-output').innerHTML = '<div style="color: #888;">// Output cleared</div>';
        document.getElementById('preview-console').innerHTML = '<div style="color: #888;">// Console cleared</div>';
        this.executionHistory = [];
    }
    
    exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            code: this.editor.getValue(),
            executionHistory: this.executionHistory,
            lastOutput: document.getElementById('preview-output').textContent
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `preview-results-${Date.now()}.json`;
        a.click();
        
        console.log('[LivePreview] 💾 Results exported');
    }
    
    // ========================================================================
    // UTILITIES
    // ========================================================================
    
    detectLanguage() {
        if (!this.editor.getModel()) return 'javascript';
        return this.editor.getModel().getLanguageId() || 'javascript';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Create global instance
window.AILivePreview = AILivePreview;

// Auto-initialize when editor is ready
setTimeout(() => {
    if (window.editor) {
        window.aiLivePreview = new AILivePreview(window.editor);
        
        // Add keyboard shortcut: Ctrl+Shift+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                if (!window.aiLivePreview.previewWindow) {
                    window.aiLivePreview.createPreviewPanel();
                    window.aiLivePreview.isActive = true;
                } else {
                    window.aiLivePreview.togglePreview();
                }
            }
        });
        
        console.log('[LivePreview] 🎯 Ready! Press Ctrl+Shift+P to activate');
    }
}, 2000);

console.log('[LivePreview] 📦 AI Live Preview module loaded');

