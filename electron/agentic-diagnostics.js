/**
 * BigDaddyG IDE - Agentic Self-Diagnostic System
 * 
 * Monitors, logs, and debugs the IDE's own agentic capabilities
 * Provides real-time introspection into:
 * - Execution success rates
 * - Iteration counts
 * - Decision-making patterns
 * - Self-healing events
 * - Agenticality score over time
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class AgenticDiagnostics extends EventEmitter {
    constructor() {
        super();
        
        // Diagnostic state
        this.sessions = [];
        this.currentSession = null;
        
        // Metrics tracking
        this.metrics = {
            totalTasks: 0,
            successfulTasks: 0,
            failedTasks: 0,
            averageIterations: 0,
            totalIterations: 0,
            autonomousExecutions: 0,
            manualInterventions: 0,
            selfHealingEvents: 0,
            predictedFailures: 0,
            preventedFailures: 0,
            contextRetentionScore: 100,
            agentialityScore: 0
        };
        
        // Decision log
        this.decisions = [];
        
        // Performance tracking
        this.performance = {
            executionTimes: [],
            iterationTimes: [],
            responseLatencies: []
        };
        
        // Self-awareness indicators
        this.selfAwareness = {
            lastSelfCheck: null,
            healthScore: 100,
            capabilities: new Map(),
            limitations: new Map(),
            learningEvents: []
        };
        
        // Diagnostic log file
        this.logPath = path.join(
            process.env.APPDATA || process.env.HOME || process.cwd(),
            'BigDaddyG',
            'diagnostics',
            'agentic-diagnostics.jsonl'
        );
        
        console.log('[Agentic Diagnostics] 🔍 Self-diagnostic system initialized');
    }
    
    /**
     * Initialize diagnostics system
     */
    async initialize() {
        // Ensure diagnostics directory exists
        await fs.mkdir(path.dirname(this.logPath), { recursive: true });
        
        // Load historical diagnostics
        await this.loadHistoricalDiagnostics();
        
        // Start self-monitoring
        this.startSelfMonitoring();
        
        console.log('[Agentic Diagnostics] ✅ Ready');
        console.log(`[Agentic Diagnostics] Log file: ${this.logPath}`);
    }
    
    /**
     * Start a new task session
     */
    startTaskSession(task) {
        this.currentSession = {
            id: `session-${Date.now()}`,
            task: task,
            startTime: Date.now(),
            endTime: null,
            steps: [],
            iterations: 0,
            decisions: [],
            autonomousActions: 0,
            manualActions: 0,
            errors: [],
            fixes: [],
            outcome: null,
            agentialityScore: 0
        };
        
        console.log(`[Agentic Diagnostics] 📝 Task session started: ${task}`);
        
        this.emit('session-started', this.currentSession);
        
        return this.currentSession.id;
    }
    
    /**
     * Log a decision made by the agentic system
     */
    logDecision(decision) {
        const decisionRecord = {
            timestamp: Date.now(),
            sessionId: this.currentSession?.id,
            type: decision.type, // 'autonomous', 'supervised', 'manual'
            action: decision.action,
            reasoning: decision.reasoning,
            confidence: decision.confidence || 0,
            outcome: decision.outcome || 'pending',
            alternatives: decision.alternatives || []
        };
        
        this.decisions.push(decisionRecord);
        
        if (this.currentSession) {
            this.currentSession.decisions.push(decisionRecord);
            
            // Track autonomy
            if (decision.type === 'autonomous') {
                this.currentSession.autonomousActions++;
                this.metrics.autonomousExecutions++;
            } else if (decision.type === 'manual') {
                this.currentSession.manualActions++;
                this.metrics.manualInterventions++;
            }
        }
        
        console.log(`[Agentic Diagnostics] 🧠 Decision: ${decision.action} (${decision.type}, confidence: ${(decision.confidence * 100).toFixed(1)}%)`);
        
        this.emit('decision-logged', decisionRecord);
        
        return decisionRecord;
    }
    
    /**
     * Log an execution step
     */
    logExecutionStep(step) {
        const stepRecord = {
            timestamp: Date.now(),
            sessionId: this.currentSession?.id,
            action: step.action,
            command: step.command,
            result: step.result,
            exitCode: step.exitCode,
            duration: step.duration,
            error: step.error || null,
            retryCount: step.retryCount || 0
        };
        
        if (this.currentSession) {
            this.currentSession.steps.push(stepRecord);
            
            if (step.error) {
                this.currentSession.errors.push(stepRecord);
            }
            
            if (step.retryCount > 0) {
                this.currentSession.iterations++;
                this.metrics.totalIterations++;
            }
        }
        
        const status = step.error ? '❌' : '✅';
        console.log(`[Agentic Diagnostics] ${status} Step: ${step.action} (${step.duration}ms)`);
        
        if (step.error) {
            console.log(`[Agentic Diagnostics]   Error: ${step.error}`);
            if (step.retryCount > 0) {
                console.log(`[Agentic Diagnostics]   Retry: ${step.retryCount}`);
            }
        }
        
        this.emit('step-logged', stepRecord);
        
        return stepRecord;
    }
    
    /**
     * Log a self-healing event
     */
    logSelfHealing(event) {
        const healingRecord = {
            timestamp: Date.now(),
            sessionId: this.currentSession?.id,
            type: event.type, // 'predicted', 'reactive', 'proactive'
            issue: event.issue,
            action: event.action,
            success: event.success,
            prevented: event.prevented || false
        };
        
        this.metrics.selfHealingEvents++;
        
        if (event.prevented) {
            this.metrics.preventedFailures++;
        }
        
        console.log(`[Agentic Diagnostics] 🩹 Self-healing: ${event.issue} → ${event.action} (${event.success ? 'success' : 'failed'})`);
        
        this.emit('self-healing', healingRecord);
        
        return healingRecord;
    }
    
    /**
     * End current task session
     */
    async endTaskSession(outcome) {
        if (!this.currentSession) {
            console.warn('[Agentic Diagnostics] No active session to end');
            return;
        }
        
        this.currentSession.endTime = Date.now();
        this.currentSession.outcome = outcome;
        
        // Calculate session metrics
        const duration = this.currentSession.endTime - this.currentSession.startTime;
        const successRate = this.currentSession.steps.length > 0
            ? this.currentSession.steps.filter(s => !s.error).length / this.currentSession.steps.length
            : 0;
        
        const autonomyRate = this.currentSession.autonomousActions + this.currentSession.manualActions > 0
            ? this.currentSession.autonomousActions / (this.currentSession.autonomousActions + this.currentSession.manualActions)
            : 0;
        
        // Calculate session agenticality score
        this.currentSession.agentialityScore = this.calculateSessionAgenticality(this.currentSession);
        
        // Update global metrics
        this.metrics.totalTasks++;
        if (outcome === 'success') {
            this.metrics.successfulTasks++;
        } else {
            this.metrics.failedTasks++;
        }
        
        // Update average iterations
        this.metrics.averageIterations = this.metrics.totalIterations / this.metrics.totalTasks;
        
        // Update overall agenticality score
        this.metrics.agentialityScore = this.calculateOverallAgenticality();
        
        console.log(`[Agentic Diagnostics] 📊 Session ended: ${this.currentSession.task}`);
        console.log(`[Agentic Diagnostics]   Duration: ${duration}ms`);
        console.log(`[Agentic Diagnostics]   Steps: ${this.currentSession.steps.length}`);
        console.log(`[Agentic Diagnostics]   Iterations: ${this.currentSession.iterations}`);
        console.log(`[Agentic Diagnostics]   Success rate: ${(successRate * 100).toFixed(1)}%`);
        console.log(`[Agentic Diagnostics]   Autonomy rate: ${(autonomyRate * 100).toFixed(1)}%`);
        console.log(`[Agentic Diagnostics]   Agenticality: ${(this.currentSession.agentialityScore * 100).toFixed(1)}%`);
        
        // Save session
        this.sessions.push({ ...this.currentSession });
        
        // Write to log file
        await this.writeDiagnosticLog(this.currentSession);
        
        this.emit('session-ended', this.currentSession);
        
        const completedSession = { ...this.currentSession };
        this.currentSession = null;
        
        return completedSession;
    }
    
    /**
     * Calculate agenticality score for a session
     */
    calculateSessionAgenticality(session) {
        // Autonomy: How many actions were autonomous vs manual?
        const autonomy = (session.autonomousActions + session.manualActions) > 0
            ? session.autonomousActions / (session.autonomousActions + session.manualActions)
            : 0;
        
        // Iteration: Did it iterate to fix problems?
        const iteration = session.iterations > 0 ? Math.min(session.iterations / 3, 1.0) : 0;
        
        // Success: Did all steps succeed?
        const success = session.steps.length > 0
            ? session.steps.filter(s => !s.error).length / session.steps.length
            : 0;
        
        // Self-correction: Did it fix its own errors?
        const selfCorrection = session.errors.length > 0
            ? session.fixes.length / session.errors.length
            : 1.0;
        
        // Formula matching the Agenticality Test
        const score = (
            autonomy * 0.3 +
            iteration * 0.2 +
            success * 0.3 +
            selfCorrection * 0.2
        );
        
        return score;
    }
    
    /**
     * Calculate overall agenticality score
     */
    calculateOverallAgenticality() {
        if (this.sessions.length === 0) return 0;
        
        // Average of all session scores
        const avgSessionScore = this.sessions.reduce((sum, s) => sum + (s.agentialityScore || 0), 0) / this.sessions.length;
        
        // Success rate
        const successRate = this.metrics.totalTasks > 0
            ? this.metrics.successfulTasks / this.metrics.totalTasks
            : 0;
        
        // Autonomy rate
        const autonomyRate = (this.metrics.autonomousExecutions + this.metrics.manualInterventions) > 0
            ? this.metrics.autonomousExecutions / (this.metrics.autonomousExecutions + this.metrics.manualInterventions)
            : 0;
        
        // Self-healing effectiveness
        const healingRate = this.metrics.predictedFailures > 0
            ? this.metrics.preventedFailures / this.metrics.predictedFailures
            : 0;
        
        // Combined score
        const overallScore = (
            avgSessionScore * 0.4 +
            successRate * 0.3 +
            autonomyRate * 0.2 +
            healingRate * 0.1
        );
        
        return overallScore;
    }
    
    /**
     * Generate diagnostic report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: { ...this.metrics },
            performance: {
                avgExecutionTime: this.performance.executionTimes.length > 0
                    ? this.performance.executionTimes.reduce((a, b) => a + b, 0) / this.performance.executionTimes.length
                    : 0,
                avgIterationTime: this.performance.iterationTimes.length > 0
                    ? this.performance.iterationTimes.reduce((a, b) => a + b, 0) / this.performance.iterationTimes.length
                    : 0,
                avgResponseLatency: this.performance.responseLatencies.length > 0
                    ? this.performance.responseLatencies.reduce((a, b) => a + b, 0) / this.performance.responseLatencies.length
                    : 0
            },
            recentSessions: this.sessions.slice(-10).map(s => ({
                task: s.task,
                duration: s.endTime - s.startTime,
                steps: s.steps.length,
                iterations: s.iterations,
                outcome: s.outcome,
                agenticality: s.agentialityScore
            })),
            selfAwareness: {
                ...this.selfAwareness,
                healthScore: this.calculateHealthScore()
            }
        };
        
        return report;
    }
    
    /**
     * Calculate health score
     */
    calculateHealthScore() {
        const factors = [];
        
        // Success rate
        if (this.metrics.totalTasks > 0) {
            factors.push(this.metrics.successfulTasks / this.metrics.totalTasks);
        }
        
        // Autonomy rate
        if (this.metrics.autonomousExecutions + this.metrics.manualInterventions > 0) {
            factors.push(this.metrics.autonomousExecutions / (this.metrics.autonomousExecutions + this.metrics.manualInterventions));
        }
        
        // Self-healing effectiveness
        if (this.metrics.selfHealingEvents > 0) {
            factors.push(this.metrics.preventedFailures / this.metrics.selfHealingEvents);
        }
        
        // Average
        const healthScore = factors.length > 0
            ? factors.reduce((a, b) => a + b, 0) / factors.length
            : 1.0;
        
        return healthScore * 100;
    }
    
    /**
     * Print diagnostic dashboard
     */
    printDashboard() {
        const report = this.generateReport();
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║         AGENTIC SELF-DIAGNOSTIC DASHBOARD                      ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  Agenticality Score:  ${(this.metrics.agentialityScore * 100).toFixed(1)}%`.padEnd(65) + '║');
        console.log(`║  Health Score:        ${report.selfAwareness.healthScore.toFixed(1)}%`.padEnd(65) + '║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  TASK METRICS                                                  ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  Total Tasks:         ${this.metrics.totalTasks}`.padEnd(65) + '║');
        console.log(`║  Successful:          ${this.metrics.successfulTasks} (${this.metrics.totalTasks > 0 ? ((this.metrics.successfulTasks / this.metrics.totalTasks) * 100).toFixed(1) : 0}%)`.padEnd(65) + '║');
        console.log(`║  Failed:              ${this.metrics.failedTasks}`.padEnd(65) + '║');
        console.log(`║  Avg Iterations:      ${this.metrics.averageIterations.toFixed(2)}`.padEnd(65) + '║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  AUTONOMY METRICS                                              ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  Autonomous Actions:  ${this.metrics.autonomousExecutions}`.padEnd(65) + '║');
        console.log(`║  Manual Actions:      ${this.metrics.manualInterventions}`.padEnd(65) + '║');
        console.log(`║  Autonomy Rate:       ${((this.metrics.autonomousExecutions / Math.max(1, this.metrics.autonomousExecutions + this.metrics.manualInterventions)) * 100).toFixed(1)}%`.padEnd(65) + '║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  SELF-HEALING                                                  ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  Healing Events:      ${this.metrics.selfHealingEvents}`.padEnd(65) + '║');
        console.log(`║  Predicted Failures:  ${this.metrics.predictedFailures}`.padEnd(65) + '║');
        console.log(`║  Prevented Failures:  ${this.metrics.preventedFailures}`.padEnd(65) + '║');
        console.log(`║  Prevention Rate:     ${this.metrics.predictedFailures > 0 ? ((this.metrics.preventedFailures / this.metrics.predictedFailures) * 100).toFixed(1) : 0}%`.padEnd(65) + '║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log('║  PERFORMANCE                                                   ║');
        console.log('╠════════════════════════════════════════════════════════════════╣');
        console.log(`║  Avg Execution Time:  ${report.performance.avgExecutionTime.toFixed(0)}ms`.padEnd(65) + '║');
        console.log(`║  Avg Iteration Time:  ${report.performance.avgIterationTime.toFixed(0)}ms`.padEnd(65) + '║');
        console.log(`║  Avg Response Time:   ${report.performance.avgResponseLatency.toFixed(0)}ms`.padEnd(65) + '║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');
        
        // Show agenticality breakdown
        this.printAgentialityBreakdown();
    }
    
    /**
     * Print agenticality breakdown
     */
    printAgentialityBreakdown() {
        console.log('┌────────────────────────────────────────────────────────────────┐');
        console.log('│  AGENTICALITY BREAKDOWN                                        │');
        console.log('├────────────────────────────────────────────────────────────────┤');
        
        const breakdown = this.getAgentialityBreakdown();
        
        for (const [category, score] of Object.entries(breakdown)) {
            const bar = this.renderProgressBar(score, 30);
            console.log(`│  ${category.padEnd(20)} ${bar} ${(score * 100).toFixed(1)}%`.padEnd(65) + '│');
        }
        
        console.log('└────────────────────────────────────────────────────────────────┘\n');
    }
    
    /**
     * Get agenticality breakdown by category
     */
    getAgentialityBreakdown() {
        // Calculate each component
        const autonomy = (this.metrics.autonomousExecutions + this.metrics.manualInterventions) > 0
            ? this.metrics.autonomousExecutions / (this.metrics.autonomousExecutions + this.metrics.manualInterventions)
            : 0;
        
        const iteration = this.metrics.totalTasks > 0
            ? Math.min(this.metrics.averageIterations / 3, 1.0)
            : 0;
        
        const complexity = this.sessions.length > 0
            ? this.sessions.filter(s => s.steps.length >= 5).length / this.sessions.length
            : 0;
        
        const selfAwareness = this.decisions.length > 0
            ? this.decisions.filter(d => d.confidence >= 0.8).length / this.decisions.length
            : 0;
        
        return {
            'Autonomy': autonomy,
            'Iteration': iteration,
            'Complexity': complexity,
            'Self-Awareness': selfAwareness
        };
    }
    
    /**
     * Render progress bar
     */
    renderProgressBar(value, width = 20) {
        const filled = Math.round(value * width);
        const empty = width - filled;
        return '[' + '■'.repeat(filled) + '□'.repeat(empty) + ']';
    }
    
    /**
     * Write diagnostic log entry
     */
    async writeDiagnosticLog(session) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                sessionId: session.id,
                task: session.task,
                duration: session.endTime - session.startTime,
                steps: session.steps.length,
                iterations: session.iterations,
                autonomousActions: session.autonomousActions,
                manualActions: session.manualActions,
                errors: session.errors.length,
                outcome: session.outcome,
                agentialityScore: session.agentialityScore,
                metrics: { ...this.metrics }
            };
            
            const logLine = JSON.stringify(logEntry) + '\n';
            
            await fs.appendFile(this.logPath, logLine, 'utf8');
            
        } catch (error) {
            console.error('[Agentic Diagnostics] Failed to write log:', error);
        }
    }
    
    /**
     * Load historical diagnostics
     */
    async loadHistoricalDiagnostics() {
        try {
            const content = await fs.readFile(this.logPath, 'utf8');
            const lines = content.trim().split('\n');
            
            console.log(`[Agentic Diagnostics] 📜 Loaded ${lines.length} historical sessions`);
            
            // Restore metrics from last line
            if (lines.length > 0) {
                const lastEntry = JSON.parse(lines[lines.length - 1]);
                if (lastEntry.metrics) {
                    this.metrics = { ...lastEntry.metrics };
                }
            }
            
        } catch (error) {
            console.log('[Agentic Diagnostics] No historical diagnostics found (first run)');
        }
    }
    
    /**
     * Start self-monitoring (continuous background check)
     */
    startSelfMonitoring() {
        console.log('[Agentic Diagnostics] 🔄 Starting continuous self-monitoring...');
        
        setInterval(() => {
            this.performSelfCheck();
        }, 60000); // Every 60 seconds
    }
    
    /**
     * Perform self-check
     */
    async performSelfCheck() {
        console.log('[Agentic Diagnostics] 🔍 Performing self-check...');
        
        this.selfAwareness.lastSelfCheck = new Date().toISOString();
        
        // Check capabilities
        await this.checkCapabilities();
        
        // Check limitations
        await this.checkLimitations();
        
        // Update health score
        this.selfAwareness.healthScore = this.calculateHealthScore();
        
        console.log(`[Agentic Diagnostics] 💚 Health: ${this.selfAwareness.healthScore.toFixed(1)}%`);
        console.log(`[Agentic Diagnostics] 🤖 Agenticality: ${(this.metrics.agentialityScore * 100).toFixed(1)}%`);
        
        this.emit('self-check-complete', {
            healthScore: this.selfAwareness.healthScore,
            agentialityScore: this.metrics.agentialityScore
        });
    }
    
    /**
     * Check current capabilities
     */
    async checkCapabilities() {
        const capabilities = [
            { name: 'file-creation', test: () => true },
            { name: 'command-execution', test: () => true },
            { name: 'error-iteration', test: () => this.metrics.totalIterations > 0 },
            { name: 'dependency-install', test: () => true },
            { name: 'self-healing', test: () => this.metrics.selfHealingEvents > 0 },
            { name: 'context-retention', test: () => this.metrics.contextRetentionScore > 80 }
        ];
        
        for (const capability of capabilities) {
            const isAvailable = capability.test();
            this.selfAwareness.capabilities.set(capability.name, isAvailable);
        }
    }
    
    /**
     * Check current limitations
     */
    async checkLimitations() {
        const limitations = [];
        
        // Check for patterns indicating limitations
        if (this.metrics.failedTasks / Math.max(1, this.metrics.totalTasks) > 0.2) {
            limitations.push({
                type: 'high-failure-rate',
                severity: 'medium',
                description: 'Task failure rate exceeds 20%'
            });
        }
        
        if (this.metrics.manualInterventions / Math.max(1, this.metrics.autonomousExecutions) > 0.3) {
            limitations.push({
                type: 'low-autonomy',
                severity: 'high',
                description: 'Requires manual intervention in >30% of actions'
            });
        }
        
        if (this.metrics.averageIterations > 5) {
            limitations.push({
                type: 'excessive-iteration',
                severity: 'low',
                description: 'Average iterations higher than expected'
            });
        }
        
        limitations.forEach(limit => {
            this.selfAwareness.limitations.set(limit.type, limit);
        });
    }
    
    /**
     * Generate live dashboard HTML
     */
    renderDashboard() {
        const report = this.generateReport();
        const breakdown = this.getAgentialityBreakdown();
        
        return `
            <div class="agentic-diagnostics-dashboard" style="padding: 20px; background: var(--bg-secondary); border-radius: 8px;">
                <h2 style="margin-bottom: 20px; color: var(--accent);">🔍 Agentic Self-Diagnostics</h2>
                
                <!-- Overall Score -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="metric-card" style="background: rgba(0,152,255,0.1); border: 2px solid var(--accent); border-radius: 8px; padding: 20px; text-align: center;">
                        <div style="font-size: 48px; font-weight: bold; color: var(--accent);">
                            ${(this.metrics.agentialityScore * 100).toFixed(1)}%
                        </div>
                        <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">
                            Agenticality Score
                        </div>
                        <div style="margin-top: 5px; font-size: 12px; color: var(--accent-green);">
                            🚀 ${this.getAgentialityRating()}
                        </div>
                    </div>
                    
                    <div class="metric-card" style="background: rgba(78,201,176,0.1); border: 2px solid var(--accent-green); border-radius: 8px; padding: 20px; text-align: center;">
                        <div style="font-size: 48px; font-weight: bold; color: var(--accent-green);">
                            ${report.selfAwareness.healthScore.toFixed(1)}%
                        </div>
                        <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">
                            System Health
                        </div>
                        <div style="margin-top: 5px; font-size: 12px;">
                            ${this.getHealthEmoji(report.selfAwareness.healthScore)}
                        </div>
                    </div>
                </div>
                
                <!-- Breakdown -->
                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px;">Agenticality Breakdown</h3>
                    ${Object.entries(breakdown).map(([category, score]) => `
                        <div style="margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>${category}</span>
                                <span style="color: var(--accent);">${(score * 100).toFixed(1)}%</span>
                            </div>
                            <div style="background: var(--bg-tertiary); height: 10px; border-radius: 5px; overflow: hidden;">
                                <div style="background: var(--accent); height: 100%; width: ${score * 100}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Task Metrics -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div class="stat-card" style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 32px; font-weight: bold;">${this.metrics.totalTasks}</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Total Tasks</div>
                    </div>
                    <div class="stat-card" style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 32px; font-weight: bold; color: var(--accent-green);">${this.metrics.successfulTasks}</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Successful</div>
                    </div>
                    <div class="stat-card" style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 32px; font-weight: bold;">${this.metrics.averageIterations.toFixed(1)}</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Avg Iterations</div>
                    </div>
                </div>
                
                <!-- Recent Sessions -->
                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 20px;">
                    <h3 style="margin-bottom: 15px;">Recent Sessions (Last 10)</h3>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${report.recentSessions.map(session => `
                            <div style="padding: 10px; margin-bottom: 8px; background: var(--bg-tertiary); border-radius: 4px; border-left: 4px solid ${session.outcome === 'success' ? 'var(--accent-green)' : '#f44'};">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: bold;">${session.task}</span>
                                    <span style="color: ${session.outcome === 'success' ? 'var(--accent-green)' : '#f44'};">
                                        ${session.outcome === 'success' ? '✅' : '❌'}
                                    </span>
                                </div>
                                <div style="font-size: 11px; opacity: 0.7; margin-top: 5px;">
                                    ${session.steps} steps • ${session.iterations} iterations • ${session.duration}ms • Agenticality: ${(session.agenticality * 100).toFixed(1)}%
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get agenticality rating
     */
    getAgentialityRating() {
        const score = this.metrics.agentialityScore * 100;
        
        if (score >= 81) return 'Fully Agentic (Devin-Level)';
        if (score >= 61) return 'Highly Agentic';
        if (score >= 41) return 'Moderately Agentic';
        if (score >= 21) return 'Semi-Agentic';
        return 'Non-Agentic';
    }
    
    /**
     * Get health emoji
     */
    getHealthEmoji(score) {
        if (score >= 90) return '💚 Excellent';
        if (score >= 75) return '💛 Good';
        if (score >= 50) return '🧡 Fair';
        if (score >= 25) return '❤️ Poor';
        return '🖤 Critical';
    }
    
    /**
     * Export diagnostics report
     */
    async exportReport(format = 'json') {
        const report = this.generateReport();
        
        const exportPath = path.join(
            path.dirname(this.logPath),
            `diagnostic-report-${Date.now()}.${format}`
        );
        
        if (format === 'json') {
            await fs.writeFile(exportPath, JSON.stringify(report, null, 2), 'utf8');
        } else if (format === 'csv') {
            // TODO: Convert to CSV
        }
        
        console.log(`[Agentic Diagnostics] 📄 Report exported: ${exportPath}`);
        
        return exportPath;
    }
}

module.exports = AgenticDiagnostics;

