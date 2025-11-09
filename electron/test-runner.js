#!/usr/bin/env node

/**
 * BigDaddyG IDE Test Runner for CI/CD
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.isCI = process.env.CI === 'true';
        this.results = null;
    }

    async runElectronTests() {
        return new Promise((resolve, reject) => {
            const electron = spawn('npm', ['run', 'electron'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, HEADLESS: 'true' }
            });

            let output = '';
            electron.stdout.on('data', (data) => {
                output += data.toString();
            });

            electron.stderr.on('data', (data) => {
                console.error(data.toString());
            });

            // Wait for app to start, then run tests
            setTimeout(async () => {
                try {
                    // Inject test runner
                    const testScript = `
                        const tester = new IDETester();
                        tester.runCITests().then(results => {
                            require('fs').writeFileSync('test-results.json', JSON.stringify(results, null, 2));
                            process.exit(results.successRate >= 80 ? 0 : 1);
                        });
                    `;
                    
                    // Execute tests via IPC or file injection
                    electron.stdin.write(testScript);
                    
                } catch (error) {
                    reject(error);
                }
            }, 5000);

            electron.on('close', (code) => {
                if (fs.existsSync('test-results.json')) {
                    this.results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
                }
                resolve(code);
            });
        });
    }

    async checkOllama() {
        try {
            const response = await fetch('http://localhost:11434/api/tags');
            return response.ok;
        } catch {
            return false;
        }
    }

    async setupBigDaddyG() {
        if (!await this.checkOllama()) {
            console.log('❌ Ollama not available');
            return false;
        }

        try {
            const response = await fetch('http://localhost:11434/api/pull', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'bigdaddyg' })
            });
            
            console.log('✅ BigDaddyG model setup complete');
            return response.ok;
        } catch (error) {
            console.log('⚠️ BigDaddyG model not available, using fallback');
            return false;
        }
    }

    generateReport() {
        if (!this.results) return;

        console.log('\n🧪 CI/CD Test Report');
        console.log('='.repeat(40));
        console.log(`Success: ${this.results.success}`);
        console.log(`Summary: ${this.results.summary}`);
        console.log(`Duration: ${this.results.duration}s`);
        
        if (this.results.failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.failedTests.forEach(test => console.log(`  - ${test}`));
        }
    }

    async run() {
        console.log('🚀 Starting BigDaddyG IDE CI/CD Tests...');
        
        // Setup Ollama
        await this.setupBigDaddyG();
        
        // Run tests
        const exitCode = await this.runElectronTests();
        
        // Generate report
        this.generateReport();
        
        process.exit(exitCode);
    }
}

if (require.main === module) {
    new TestRunner().run();
}

module.exports = TestRunner;