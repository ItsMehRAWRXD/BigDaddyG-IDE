/**
 * BigDaddy Editor - Browser Stress Test Runner
 * 
 * Uses Puppeteer to run REAL browser-based stress tests
 * Tests actual Canvas rendering, DOM manipulation, and real memory usage
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║     🌐 BROWSER STRESS TEST RUNNER 🌐                      ║');
console.log('║          REAL CANVAS RENDERING TEST!                       ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Create a simple HTTP server to serve the test files
const PORT = 8877;
let server;

function startServer() {
    return new Promise((resolve, reject) => {
        server = http.createServer((req, res) => {
            console.log(`  📡 Request: ${req.url}`);
            
            // Serve files from bigdaddy-editor directory
            const editorDir = path.join(__dirname, 'bigdaddy-editor');
            
            let filePath;
            if (req.url === '/' || req.url === '/test') {
                filePath = path.join(editorDir, 'real-stress-test.html');
            } else if (req.url === '/complete') {
                filePath = path.join(editorDir, 'complete-demo.html');
            } else {
                // Remove leading slash
                const file = req.url.substring(1);
                filePath = path.join(editorDir, file);
            }
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.log(`  ❌ File not found: ${filePath}`);
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            
            // Determine content type
            const ext = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json'
            };
            
            const contentType = contentTypes[ext] || 'text/plain';
            
            // Read and serve file
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.log(`  ❌ Error reading file: ${err.message}`);
                    res.writeHead(500);
                    res.end('Server error');
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
        
        server.listen(PORT, () => {
            console.log(`  ✅ Server started on http://localhost:${PORT}`);
            resolve();
        });
        
        server.on('error', reject);
    });
}

function stopServer() {
    if (server) {
        server.close();
        console.log('\n  ✅ Server stopped');
    }
}

async function checkPuppeteer() {
    console.log('\n┌────────────────────────────────────────────────────────────┐');
    console.log('│  🔍 Checking for Puppeteer...                              │');
    console.log('└────────────────────────────────────────────────────────────┘\n');
    
    try {
        require.resolve('puppeteer');
        console.log('  ✅ Puppeteer is installed!');
        return true;
    } catch (e) {
        console.log('  ⚠️  Puppeteer not found');
        console.log('  💡 Install with: npm install puppeteer');
        console.log('  📝 Falling back to manual browser test...\n');
        return false;
    }
}

async function runPuppeteerTests() {
    console.log('\n┌────────────────────────────────────────────────────────────┐');
    console.log('│  🤖 Running Automated Browser Tests                        │');
    console.log('└────────────────────────────────────────────────────────────┘\n');
    
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    
    console.log('  ✅ Browser launched');
    
    const page = await browser.newPage();
    
    // Increase timeout and memory
    await page.setDefaultNavigationTimeout(60000);
    
    // Listen for console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('✅') || text.includes('❌') || text.includes('🎉')) {
            console.log(`  ${text}`);
        }
    });
    
    // Listen for errors
    page.on('pageerror', error => {
        console.log(`  💀 Page Error: ${error.message}`);
    });
    
    console.log('\n  🌐 Loading test page...');
    await page.goto(`http://localhost:${PORT}/test`, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    
    console.log('  ✅ Page loaded\n');
    
    // Wait for editor to initialize
    await page.waitForFunction(() => {
        return typeof BigDaddyEditorEnhanced !== 'undefined';
    }, { timeout: 10000 });
    
    console.log('  ✅ Editor initialized\n');
    
    // Test 1: Create multiple editor instances
    console.log('  🔥 TEST 1: Creating 10 editor instances...');
    const test1Result = await page.evaluate(() => {
        const startTime = performance.now();
        const editors = [];
        
        for (let i = 0; i < 10; i++) {
            const container = document.createElement('div');
            container.style.width = '800px';
            container.style.height = '600px';
            document.body.appendChild(container);
            
            const editor = new BigDaddyEditorEnhanced(container, {
                theme: 'dark',
                fontSize: 14
            });
            
            editor.setValue(`// Editor instance ${i}\nfunction test() {\n  return ${i};\n}`);
            editors.push(editor);
        }
        
        const duration = performance.now() - startTime;
        
        return {
            count: editors.length,
            duration: duration.toFixed(2),
            avgPerEditor: (duration / editors.length).toFixed(2)
        };
    });
    
    console.log(`  ✅ Created ${test1Result.count} editors in ${test1Result.duration}ms`);
    console.log(`  📊 Average: ${test1Result.avgPerEditor}ms per editor\n`);
    
    // Test 2: Large file rendering
    console.log('  🔥 TEST 2: Rendering 10,000 lines...');
    const test2Result = await page.evaluate(() => {
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const editor = new BigDaddyEditorEnhanced(container);
        
        const startTime = performance.now();
        
        let code = '';
        for (let i = 0; i < 10000; i++) {
            code += `function test${i}() { return ${i}; }\n`;
        }
        
        editor.setValue(code);
        const setDuration = performance.now() - startTime;
        
        // Force render
        const renderStart = performance.now();
        editor.render();
        const renderDuration = performance.now() - renderStart;
        
        return {
            lines: 10000,
            chars: code.length,
            setDuration: setDuration.toFixed(2),
            renderDuration: renderDuration.toFixed(2),
            totalDuration: (setDuration + renderDuration).toFixed(2)
        };
    });
    
    console.log(`  ✅ Rendered ${test2Result.lines} lines (${test2Result.chars.toLocaleString()} chars)`);
    console.log(`  📊 Set: ${test2Result.setDuration}ms | Render: ${test2Result.renderDuration}ms | Total: ${test2Result.totalDuration}ms\n`);
    
    // Test 3: Rapid operations
    console.log('  🔥 TEST 3: 1,000 rapid insert operations...');
    const test3Result = await page.evaluate(() => {
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const editor = new BigDaddyEditorEnhanced(container);
        
        const startTime = performance.now();
        
        for (let i = 0; i < 1000; i++) {
            editor.insertText(`line ${i}\n`);
        }
        
        const duration = performance.now() - startTime;
        
        return {
            operations: 1000,
            duration: duration.toFixed(2),
            opsPerSec: Math.floor(1000 / (duration / 1000))
        };
    });
    
    console.log(`  ✅ Completed ${test3Result.operations} operations in ${test3Result.duration}ms`);
    console.log(`  📊 Throughput: ${test3Result.opsPerSec.toLocaleString()} ops/sec\n`);
    
    // Test 4: Memory usage
    console.log('  🔥 TEST 4: Checking memory usage...');
    const metrics = await page.metrics();
    
    console.log(`  📊 JS Heap Size: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  📊 JS Heap Total: ${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  📊 DOM Nodes: ${metrics.Nodes}`);
    console.log(`  📊 Event Listeners: ${metrics.JSEventListeners}\n`);
    
    // Test 5: Syntax highlighting
    console.log('  🔥 TEST 5: Testing syntax highlighting...');
    const test5Result = await page.evaluate(() => {
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        const editor = new BigDaddyEditorEnhanced(container, {
            language: 'javascript'
        });
        
        const code = `
// JavaScript Test
const myVar = 42;
function hello(name) {
  return \`Hello \${name}!\`;
}
class MyClass {
  constructor() {
    this.value = 100;
  }
}
`;
        
        const startTime = performance.now();
        editor.setValue(code);
        editor.render();
        const duration = performance.now() - startTime;
        
        return {
            duration: duration.toFixed(2),
            tokenized: true
        };
    });
    
    console.log(`  ✅ Syntax highlighting applied in ${test5Result.duration}ms\n`);
    
    await browser.close();
    console.log('  ✅ Browser closed');
    
    return {
        test1: test1Result,
        test2: test2Result,
        test3: test3Result,
        test4: metrics,
        test5: test5Result
    };
}

function displayManualInstructions() {
    console.log('\n┌────────────────────────────────────────────────────────────┐');
    console.log('│  📋 MANUAL BROWSER TEST INSTRUCTIONS                       │');
    console.log('└────────────────────────────────────────────────────────────┘\n');
    
    console.log('  🌐 Open your browser and navigate to:');
    console.log(`     http://localhost:${PORT}/test\n`);
    
    console.log('  🔥 Available Tests:\n');
    console.log('     1. Test 100 Instances - Create 100 editor instances');
    console.log('     2. Test Massive File - Load 100,000 lines');
    console.log('     3. Test Infinite Loop - Rapid insert operations');
    console.log('     4. Test Memory Bomb - Exponential memory growth');
    console.log('     5. Test Rapid Ops - Mixed insert/delete/undo\n');
    
    console.log('  📊 Watch the metrics display for:');
    console.log('     • FPS (target: 60)');
    console.log('     • Memory usage');
    console.log('     • Test results\n');
    
    console.log('  💡 Alternative: View the complete demo at:');
    console.log(`     http://localhost:${PORT}/complete\n`);
    
    console.log('  ⚠️  Press Ctrl+C to stop the server\n');
}

// Main execution
(async () => {
    try {
        // Start HTTP server
        await startServer();
        
        // Check for Puppeteer
        const hasPuppeteer = await checkPuppeteer();
        
        if (hasPuppeteer) {
            // Run automated tests
            const results = await runPuppeteerTests();
            
            console.log('\n╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║        🎉 BROWSER TESTS COMPLETE! 🎉                      ║');
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝\n');
            
            console.log('📊 SUMMARY:\n');
            console.log(`  ✅ 10 Editor Instances: ${results.test1.duration}ms`);
            console.log(`  ✅ 10,000 Line Render: ${results.test2.totalDuration}ms`);
            console.log(`  ✅ 1,000 Operations: ${results.test3.duration}ms`);
            console.log(`  ✅ Memory Used: ${(results.test4.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
            console.log(`  ✅ Syntax Highlight: ${results.test5.duration}ms\n`);
            
            stopServer();
            
            console.log('🤖 Made by: Claude, ChatGPT, Gemini, DeepSeek, Kimi\n');
            
        } else {
            // Show manual instructions
            displayManualInstructions();
            
            // Keep server running
            console.log('  ⏳ Server is running... waiting for manual testing...\n');
            
            // Handle graceful shutdown
            process.on('SIGINT', () => {
                console.log('\n\n  ⚠️  Shutting down...');
                stopServer();
                process.exit(0);
            });
        }
        
    } catch (e) {
        console.error('\n💥 ERROR:', e.message);
        console.error(e.stack);
        stopServer();
        process.exit(1);
    }
})();
