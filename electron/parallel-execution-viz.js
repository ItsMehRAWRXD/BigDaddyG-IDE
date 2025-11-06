/**
 * Parallel Execution Visualizer
 * 
 * Shows visual representation of:
 * - Multiple AI sessions running in parallel
 * - Model load balancing
 * - Real-time response times
 * - Session performance metrics
 */

(function() {
'use strict';

class ParallelExecutionViz {
    constructor() {
        this.activeExecutions = new Map();
        this.executionHistory = [];
        this.maxHistory = 100;
        
        console.log('[ParallelExec] 🎯 Initializing parallel execution visualizer...');
        this.init();
    }
    
    init() {
        this.createVisualizerPanel();
        this.startMonitoring();
        
        console.log('[ParallelExec] ✅ Parallel execution visualizer ready!');
    }
    
    createVisualizerPanel() {
        // Create floating panel that shows parallel executions
        const panel = document.createElement('div');
        panel.id = 'parallel-exec-viz';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: calc(50% + 20px);
            width: 350px;
            background: var(--cursor-bg);
            border: 2px solid var(--cursor-jade-dark);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(119, 221, 190, 0.3);
            z-index: 997;
            display: none;
            overflow: hidden;
        `;
        
        panel.innerHTML = `
            <div style="padding: 12px 16px; background: linear-gradient(135deg, var(--cursor-bg-secondary), var(--cursor-bg-tertiary)); border-bottom: 1px solid var(--cursor-border); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">⚡</span>
                    <span style="font-weight: 600; color: var(--cursor-jade-dark);">Parallel Execution</span>
                </div>
                <button onclick="document.getElementById('parallel-exec-viz').style.display='none'" style="
                    background: none;
                    border: none;
                    color: var(--cursor-text-secondary);
                    cursor: pointer;
                    font-size: 14px;
                ">✕</button>
            </div>
            
            <div style="padding: 16px;">
                <!-- System Stats -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
                    <div style="padding: 10px; background: rgba(119, 221, 190, 0.1); border-radius: 6px; text-align: center;">
                        <div style="font-size: 20px; font-weight: 600; color: var(--cursor-jade-dark);" id="parallel-active-count">0</div>
                        <div style="font-size: 10px; color: var(--cursor-text-secondary);">Active Now</div>
                    </div>
                    <div style="padding: 10px; background: rgba(0, 150, 255, 0.1); border-radius: 6px; text-align: center;">
                        <div style="font-size: 20px; font-weight: 600; color: #0096ff;" id="parallel-total-count">0</div>
                        <div style="font-size: 10px; color: var(--cursor-text-secondary);">Total Sessions</div>
                    </div>
                </div>
                
                <!-- Active Executions -->
                <div style="margin-bottom: 12px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 11px; color: var(--cursor-text-secondary); text-transform: uppercase;">Active Executions</h4>
                    <div id="active-executions-list" style="max-height: 200px; overflow-y: auto;">
                        <!-- Dynamic content -->
                    </div>
                </div>
                
                <!-- Performance Graph -->
                <div>
                    <h4 style="margin: 0 0 8px 0; font-size: 11px; color: var(--cursor-text-secondary); text-transform: uppercase;">Response Times (Last 10)</h4>
                    <div id="response-time-graph" style="height: 60px; display: flex; align-items: flex-end; gap: 4px;">
                        <!-- Bars will be added dynamically -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add toggle button to header
        const header = document.querySelector('[id="orchestra-chat-stage"] > div:first-child');
        if (header) {
            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = '⚡';
            toggleBtn.title = 'Show parallel execution stats';
            toggleBtn.style.cssText = `
                background: rgba(119, 221, 190, 0.1);
                border: 1px solid var(--cursor-jade-light);
                color: var(--cursor-jade-dark);
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            `;
            toggleBtn.onclick = () => {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            };
            header.appendChild(toggleBtn);
        }
    }
    
    startMonitoring() {
        // Monitor orchestra sessions
        this.monitorInterval = setInterval(() => {
            this.updateVisualization();
        }, 1000); // Update every second
    }
    
    cleanup() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            console.log('[ParallelExec] 🧹 Cleared monitor interval');
        }
    }
    
    updateVisualization() {
        // Update active count
        const sessions = window.orchestraLayout?.sessions;
        if (!sessions) return;
        
        const activeCount = this.activeExecutions.size;
        const totalCount = sessions.size;
        
        const activeEl = document.getElementById('parallel-active-count');
        const totalEl = document.getElementById('parallel-total-count');
        
        if (activeEl) activeEl.textContent = activeCount;
        if (totalEl) totalEl.textContent = totalCount;
        
        // Update session count in status bar
        const sessionCountEl = document.getElementById('session-count');
        if (sessionCountEl) {
            sessionCountEl.textContent = `${totalCount}/100`;
        }
    }
    
    addExecution(sessionId, model, query) {
        const execution = {
            sessionId,
            model,
            query,
            startTime: Date.now(),
            status: 'running'
        };
        
        this.activeExecutions.set(sessionId, execution);
        this.renderActiveExecutions();
    }
    
    completeExecution(sessionId, responseTime) {
        const execution = this.activeExecutions.get(sessionId);
        if (!execution) return;
        
        execution.status = 'complete';
        execution.responseTime = responseTime;
        execution.endTime = Date.now();
        
        // Move to history
        this.executionHistory.unshift(execution);
        if (this.executionHistory.length > this.maxHistory) {
            this.executionHistory.pop();
        }
        
        this.activeExecutions.delete(sessionId);
        this.renderActiveExecutions();
        this.updateResponseTimeGraph();
    }
    
    renderActiveExecutions() {
        const container = document.getElementById('active-executions-list');
        if (!container) return;
        
        if (this.activeExecutions.size === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--cursor-text-secondary); font-size: 11px;">
                    No active executions
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.activeExecutions.forEach((exec, sessionId) => {
            const elapsed = ((Date.now() - exec.startTime) / 1000).toFixed(1);
            
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px;
                margin-bottom: 6px;
                background: rgba(119, 221, 190, 0.1);
                border-left: 3px solid var(--cursor-jade-dark);
                border-radius: 4px;
                font-size: 11px;
            `;
            
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: var(--cursor-text);">
                        ${exec.model || 'BigDaddyG'}
                    </span>
                    <span style="color: var(--cursor-accent); font-family: monospace;">
                        ${elapsed}s
                    </span>
                </div>
                <div style="color: var(--cursor-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${exec.query}
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    updateResponseTimeGraph() {
        const graph = document.getElementById('response-time-graph');
        if (!graph) return;
        
        graph.innerHTML = '';
        
        const last10 = this.executionHistory.slice(0, 10).reverse();
        const maxTime = Math.max(...last10.map(e => e.responseTime || 0), 1);
        
        last10.forEach(exec => {
            const bar = document.createElement('div');
            const heightPercent = ((exec.responseTime || 0) / maxTime) * 100;
            
            bar.style.cssText = `
                flex: 1;
                height: ${heightPercent}%;
                background: linear-gradient(to top, var(--cursor-jade-dark), var(--cursor-jade-light));
                border-radius: 2px 2px 0 0;
                position: relative;
                cursor: pointer;
                transition: all 0.2s;
            `;
            
            bar.title = `${exec.model}: ${exec.responseTime}ms`;
            
            bar.onmouseover = () => {
                bar.style.transform = 'scaleY(1.1)';
                bar.style.filter = 'brightness(1.2)';
            };
            bar.onmouseout = () => {
                bar.style.transform = 'scaleY(1)';
                bar.style.filter = 'brightness(1)';
            };
            
            graph.appendChild(bar);
        });
    }
}

// Initialize Parallel Execution Visualizer
window.parallelExecutionViz = new ParallelExecutionViz();

})();

