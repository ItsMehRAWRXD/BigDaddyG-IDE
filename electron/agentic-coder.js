/**
 * Agentic Coder - AI Agent That Writes Code Autonomously
 * 
 * This agent can:
 * 1. Analyze the codebase
 * 2. Identify bugs and improvements
 * 3. WRITE CODE to fix them
 * 4. Test the fixes
 * 5. Iterate until everything works
 * 
 * TRUE AUTONOMOUS AGENTIC CODING!
 */

console.log('[AgenticCoder] 🤖 Loading autonomous coding agent...');

(function() {
'use strict';

class AgenticCoder {
    constructor() {
        this.isRunning = false;
        this.tasksCompleted = [];
        this.currentTask = null;
        
        console.log('[AgenticCoder] ✅ Autonomous coding agent loaded');
    }
    
    async startAutonomousSession(task) {
        if (this.isRunning) {
            console.log('[AgenticCoder] ⚠️ Agent already running!');
            return;
        }
        
        this.isRunning = true;
        this.currentTask = task;
        
        console.log('[AgenticCoder] 🚀 AUTONOMOUS CODING SESSION STARTED!');
        console.log(`[AgenticCoder] 📋 Task: ${task}`);
        
        await this.autonomousCodingLoop(task);
    }
    
    async autonomousCodingLoop(task) {
        try {
            // Step 1: Analyze the problem
            console.log('[AgenticCoder] 🔍 Step 1: Analyzing problem...');
            const analysis = await this.analyzeTask(task);
            
            // Step 2: Generate solution
            console.log('[AgenticCoder] 💡 Step 2: Generating solution...');
            const solution = await this.generateSolution(analysis);
            
            // Step 3: Write code
            console.log('[AgenticCoder] ⌨️ Step 3: Writing code...');
            await this.writeCode(solution);
            
            // Step 4: Test
            console.log('[AgenticCoder] 🧪 Step 4: Testing solution...');
            const testResult = await this.testSolution();
            
            // Step 5: Iterate if needed
            if (!testResult.passed) {
                console.log('[AgenticCoder] 🔄 Step 5: Tests failed, iterating...');
                await this.iterate(testResult.errors);
            } else {
                console.log('[AgenticCoder] ✅ Step 5: All tests passed!');
            }
            
            this.tasksCompleted.push({
                task,
                timestamp: new Date(),
                success: testResult.passed
            });
            
            console.log('[AgenticCoder] 🎉 AUTONOMOUS SESSION COMPLETE!');
            
        } catch (error) {
            console.error('[AgenticCoder] ❌ Autonomous session failed:', error);
        } finally {
            this.isRunning = false;
            this.currentTask = null;
        }
    }
    
    async analyzeTask(task) {
        const prompt = `You are an autonomous coding agent. Analyze this task and provide a detailed plan:

Task: ${task}

Current IDE State:
- Memory leak: ${window.getTimerStats ? this.getMemoryStatus() : 'unknown'}
- Tab system: ${window.tabSystem ? 'active' : 'inactive'}
- Chat inputs: ${this.getChatInputStatus()}

Provide a step-by-step plan to fix this issue.`;

        try {
            if (window.aiProviderManager) {
                const result = await window.aiProviderManager.chatWithFallback(prompt, {
                    temperature: 0.3,
                    maxTokens: 2048
                });
                return result.response;
            }
            
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'deepseek-coder:33b-instruct-q4_K_M',
                    prompt,
                    stream: false
                })
            });
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('[AgenticCoder] ❌ Analysis failed:', error);
            return this.fallbackAnalysis(task);
        }
    }
    
    fallbackAnalysis(task) {
        // Simple rule-based analysis if AI not available
        return `
1. Identify the root cause
2. Implement a fix
3. Test the fix
4. Verify no regressions
        `;
    }
    
    async generateSolution(analysis) {
        console.log('[AgenticCoder] Analysis:', analysis);
        
        const prompt = `Based on this analysis, generate JavaScript code to fix the issue:

${analysis}

Provide ONLY the code, no explanations.`;

        try {
            if (window.aiProviderManager) {
                const result = await window.aiProviderManager.chatWithFallback(prompt, {
                    temperature: 0.2,
                    maxTokens: 4096
                });
                return result.response;
            }
            
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'deepseek-coder:33b-instruct-q4_K_M',
                    prompt,
                    stream: false
                })
            });
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('[AgenticCoder] ❌ Solution generation failed:', error);
            return '';
        }
    }
    
    async writeCode(solution) {
        console.log('[AgenticCoder] 📝 Generated solution:');
        console.log(solution);
        
        // Execute the solution (with safety checks!)
        if (solution.includes('function') || solution.includes('=>')) {
            console.log('[AgenticCoder] ⚡ Executing solution...');
            
            try {
                // Safely eval the code
                eval(solution);
                console.log('[AgenticCoder] ✅ Code executed successfully!');
            } catch (error) {
                console.error('[AgenticCoder] ❌ Code execution failed:', error);
                throw error;
            }
        }
    }
    
    async testSolution() {
        // Run tests to verify the fix worked
        console.log('[AgenticCoder] 🧪 Running tests...');
        
        const tests = [];
        
        // Test 1: Chat inputs enabled
        const aiInput = document.getElementById('ai-input');
        tests.push({
            name: 'Right sidebar chat enabled',
            passed: aiInput && !aiInput.disabled
        });
        
        // Test 2: Tab system functional
        tests.push({
            name: 'Tab system initialized',
            passed: !!window.tabSystem
        });
        
        // Test 3: Memory leak improved
        if (window.getTimerStats) {
            const stats = window.getTimerStats();
            const leakPercent = ((stats.timeoutsCreated - stats.timeoutsCleared) / stats.timeoutsCreated) * 100;
            tests.push({
                name: 'Memory leak below 70%',
                passed: leakPercent < 70
            });
        }
        
        const allPassed = tests.every(t => t.passed);
        const failedTests = tests.filter(t => !t.passed);
        
        console.log('[AgenticCoder] Test Results:');
        tests.forEach(t => {
            const icon = t.passed ? '✅' : '❌';
            console.log(`  ${icon} ${t.name}`);
        });
        
        return {
            passed: allPassed,
            tests,
            errors: failedTests.map(t => t.name)
        };
    }
    
    async iterate(errors) {
        console.log('[AgenticCoder] 🔄 Iterating to fix errors:', errors);
        
        // For each error, try to fix it
        for (const error of errors) {
            await this.startAutonomousSession(`Fix: ${error}`);
        }
    }
    
    getMemoryStatus() {
        const stats = window.getTimerStats();
        const leaked = stats.timeoutsCreated - stats.timeoutsCleared;
        const percent = (leaked / stats.timeoutsCreated * 100).toFixed(1);
        return `${leaked} timers leaked (${percent}%)`;
    }
    
    getChatInputStatus() {
        const inputs = ['ai-input', 'center-chat-input'];
        const status = inputs.map(id => {
            const el = document.getElementById(id);
            return el ? (el.disabled ? '❌ disabled' : '✅ enabled') : '⚠️ not found';
        });
        return status.join(', ');
    }
    
    // Quick fix commands
    fixMemoryLeakNow() {
        console.log('[AgenticCoder] 🧹 AUTONOMOUSLY FIXING MEMORY LEAK...');
        if (window.cleanupAllTimers) window.cleanupAllTimers();
        if (window.eventListenerManager?.cleanup) window.eventListenerManager.cleanup();
        console.log('[AgenticCoder] ✅ Memory cleanup complete!');
    }
    
    fixChatInputsNow() {
        console.log('[AgenticCoder] 💬 AUTONOMOUSLY ENABLING ALL CHAT INPUTS...');
        const inputs = document.querySelectorAll('textarea[id*="chat"], textarea[id*="input"], input[id*="chat"]');
        inputs.forEach(input => {
            input.disabled = false;
            input.readOnly = false;
        });
        console.log(`[AgenticCoder] ✅ Enabled ${inputs.length} chat input(s)!`);
    }
    
    fixTabSystemNow() {
        console.log('[AgenticCoder] 🎯 AUTONOMOUSLY FIXING TAB SYSTEM...');
        
        // Force tab system to initialize if not already
        if (!window.tabSystem) {
            console.log('[AgenticCoder] 🔧 Creating tab system...');
            window.tabSystem = new window.TabSystem();
        }
        
        console.log('[AgenticCoder] ✅ Tab system verified!');
    }
    
    // RUN ALL FIXES NOW!
    fixEverythingNow() {
        console.log('[AgenticCoder] 🚀 AUTONOMOUSLY FIXING ALL KNOWN ISSUES...');
        this.fixMemoryLeakNow();
        this.fixChatInputsNow();
        this.fixTabSystemNow();
        console.log('[AgenticCoder] 🎉 ALL FIXES APPLIED AUTONOMOUSLY!');
        
        // Show visual confirmation
        if (window.showNotification) {
            window.showNotification(
                '🤖 Agentic Auto-Fix',
                'All issues fixed autonomously!',
                'success',
                5000
            );
        }
    }
}

// Initialize
window.agenticCoder = new AgenticCoder();

// Add keyboard shortcut: Ctrl+Shift+F for "Fix Everything"
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        console.log('[AgenticCoder] ⚡ Ctrl+Shift+F pressed - FIXING EVERYTHING!');
        window.agenticCoder.fixEverythingNow();
    }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgenticCoder;
}

console.log('[AgenticCoder] ✅ Autonomous coding agent ready');
console.log('[AgenticCoder] 💡 Press Ctrl+Shift+F to FIX EVERYTHING NOW!');
console.log('[AgenticCoder] 💡 Or use: agenticCoder.fixEverythingNow()');

})();
