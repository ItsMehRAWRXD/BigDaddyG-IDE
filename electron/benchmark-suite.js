/**
 * BigDaddyG IDE Performance Benchmark Suite
 */

class BenchmarkSuite {
    constructor() {
        this.benchmarks = new Map();
        this.results = [];
    }

    async benchmark(name, fn, iterations = 1) {
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const duration = performance.now() - start;
            results.push(duration);
        }
        
        const avg = results.reduce((a, b) => a + b, 0) / results.length;
        const min = Math.min(...results);
        const max = Math.max(...results);
        
        const result = { name, avg, min, max, iterations };
        this.benchmarks.set(name, result);
        this.results.push(result);
        
        return result;
    }

    async runOllamaBenchmarks() {
        console.log('🧪 Running Ollama Performance Benchmarks...');
        
        // Test connection speed
        await this.benchmark('Ollama Connection', async () => {
            await fetch('http://localhost:11434/api/tags');
        }, 5);
        
        // Test model loading
        await this.benchmark('Model Loading', async () => {
            await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'bigdaddyg',
                    prompt: 'Hello',
                    stream: false
                })
            });
        }, 3);
        
        // Test code generation
        await this.benchmark('Code Generation', async () => {
            await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'bigdaddyg',
                    prompt: 'Write a JavaScript function that sorts an array',
                    stream: false
                })
            });
        }, 3);
    }

    async runEditorBenchmarks() {
        console.log('📝 Running Editor Performance Benchmarks...');
        
        if (typeof monaco === 'undefined') return;
        
        // Large file handling
        await this.benchmark('Large File Load', async () => {
            const content = 'console.log("test");\n'.repeat(10000);
            const model = monaco.editor.createModel(content, 'javascript');
            model.dispose();
        }, 5);
        
        // Syntax highlighting
        await this.benchmark('Syntax Highlighting', async () => {
            const code = `
                class Example {
                    constructor() {
                        this.data = [];
                    }
                    
                    async process() {
                        return this.data.map(x => x * 2);
                    }
                }
            `;
            monaco.editor.tokenize(code, 'javascript');
        }, 10);
        
        // Auto-completion
        await this.benchmark('Auto Completion', async () => {
            const model = monaco.editor.createModel('console.', 'javascript');
            const position = { lineNumber: 1, column: 9 };
            await monaco.languages.getCompletionProvider('javascript')
                .provideCompletionItems(model, position);
            model.dispose();
        }, 5);
    }

    async runUiBenchmarks() {
        console.log('🎨 Running UI Performance Benchmarks...');
        
        // DOM manipulation
        await this.benchmark('DOM Updates', async () => {
            const container = document.createElement('div');
            for (let i = 0; i < 1000; i++) {
                const el = document.createElement('span');
                el.textContent = `Item ${i}`;
                container.appendChild(el);
            }
        }, 5);
        
        // Tab switching
        if (window.tabSystem) {
            await this.benchmark('Tab Switching', async () => {
                for (let i = 0; i < 10; i++) {
                    window.tabSystem.createNewTab(`test-${i}.js`, 'javascript');
                }
            }, 3);
        }
        
        // Chat rendering
        await this.benchmark('Chat Message Rendering', async () => {
            const chatContainer = document.getElementById('ai-chat-messages');
            if (chatContainer) {
                for (let i = 0; i < 50; i++) {
                    const msg = document.createElement('div');
                    msg.innerHTML = `<strong>User:</strong> Test message ${i}`;
                    chatContainer.appendChild(msg);
                }
                chatContainer.innerHTML = '';
            }
        }, 3);
    }

    generateReport() {
        console.log('\n⚡ Performance Benchmark Report');
        console.log('='.repeat(50));
        
        this.results.forEach(result => {
            console.log(`${result.name}:`);
            console.log(`  Average: ${result.avg.toFixed(2)}ms`);
            console.log(`  Min: ${result.min.toFixed(2)}ms`);
            console.log(`  Max: ${result.max.toFixed(2)}ms`);
            console.log(`  Iterations: ${result.iterations}`);
            console.log('');
        });
        
        // Performance grades
        const grades = this.results.map(r => {
            if (r.avg < 10) return 'A';
            if (r.avg < 50) return 'B';
            if (r.avg < 100) return 'C';
            if (r.avg < 500) return 'D';
            return 'F';
        });
        
        const avgGrade = this.calculateAverageGrade(grades);
        console.log(`Overall Performance Grade: ${avgGrade}`);
        
        return {
            benchmarks: Object.fromEntries(this.benchmarks),
            overallGrade: avgGrade,
            timestamp: new Date().toISOString()
        };
    }

    calculateAverageGrade(grades) {
        const gradeValues = { A: 4, B: 3, C: 2, D: 1, F: 0 };
        const avg = grades.reduce((sum, grade) => sum + gradeValues[grade], 0) / grades.length;
        
        if (avg >= 3.5) return 'A';
        if (avg >= 2.5) return 'B';
        if (avg >= 1.5) return 'C';
        if (avg >= 0.5) return 'D';
        return 'F';
    }

    async runAll() {
        try {
            await this.runUiBenchmarks();
            await this.runEditorBenchmarks();
            await this.runOllamaBenchmarks();
            return this.generateReport();
        } catch (error) {
            console.error('Benchmark failed:', error);
            return null;
        }
    }
}

// Global access
if (typeof window !== 'undefined') {
    window.BenchmarkSuite = BenchmarkSuite;
    
    window.runBenchmarks = async function() {
        const suite = new BenchmarkSuite();
        return await suite.runAll();
    };
    
    console.log('⚡ Benchmark Suite loaded! Use runBenchmarks() to start.');
}

module.exports = BenchmarkSuite;