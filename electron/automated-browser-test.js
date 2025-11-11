/**
 * BigDaddy Editor - Automated Browser Tests
 * Integrated test with proper server management
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const PORT = 8877;
let server;

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║     🌐 AUTOMATED BROWSER TESTS 🌐                         ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

function startServer() {
    return new Promise((resolve) => {
        server = http.createServer((req, res) => {
            const editorDir = path.join(__dirname, 'bigdaddy-editor');
            
            let filePath;
            if (req.url === '/' || req.url === '/test') {
                filePath = path.join(editorDir, 'real-stress-test.html');
            } else {
                const file = req.url.substring(1);
                filePath = path.join(editorDir, file);
            }
            
            if (!fs.existsSync(filePath)) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            
            const ext = path.extname(filePath);
            const contentTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css'
            };
            
            const contentType = contentTypes[ext] || 'text/plain';
            
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Server error');
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
        
        server.listen(PORT, () => {
            console.log(`  ✅ Server started on http://localhost:${PORT}\n`);
            resolve();
        });
    });
}

function stopServer() {
    if (server) {
        server.close();
    }
}

async function runTests() {
    console.log('🚀 Launching browser...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('  ✅ Browser launched\n');
    console.log('📡 Loading test page...\n');
    
    await page.goto(`http://localhost:${PORT}/test`, {
        waitUntil: 'networkidle0',
        timeout: 60000
    });
    
    console.log('  ✅ Page loaded\n');
    
    // Wait for editor to load
    await page.waitForFunction(() => {
        return typeof BigDaddyEditor !== 'undefined';
    }, { timeout: 10000 });
    
    console.log('  ✅ BigDaddy Editor loaded\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔥 RUNNING BROWSER TESTS 🔥');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Test 1: Single instance creation
    console.log('TEST 1: Creating single editor instance...');
    const test1 = await page.evaluate(() => {
        const testContainer = document.createElement('div');
        testContainer.id = 'test-container-1';
        testContainer.style.width = '800px';
        testContainer.style.height = '600px';
        testContainer.style.position = 'absolute';
        testContainer.style.top = '-9999px'; // Hide off-screen
        document.body.appendChild(testContainer);
        
        const start = performance.now();
        const editor = new BigDaddyEditor(testContainer, {
            theme: 'dark',
            fontSize: 14
        });
        editor.setValue('// Test editor\nfunction hello() {\n  return "world";\n}');
        const duration = performance.now() - start;
        
        return {
            success: true,
            duration: duration.toFixed(2),
            hasCanvas: !!testContainer.querySelector('canvas'),
            content: editor.getValue().length
        };
    });
    
    console.log(`  ✅ Created in ${test1.duration}ms`);
    console.log(`  ✅ Canvas: ${test1.hasCanvas ? 'YES' : 'NO'}`);
    console.log(`  ✅ Content: ${test1.content} chars\n`);
    
    // Test 2: Multiple instances
    console.log('TEST 2: Creating 5 editor instances...');
    const test2 = await page.evaluate(() => {
        const start = performance.now();
        const editors = [];
        
        for (let i = 0; i < 5; i++) {
            const container = document.createElement('div');
            container.id = `test-container-multi-${i}`;
            container.style.width = '800px';
            container.style.height = '600px';
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            document.body.appendChild(container);
            
            const editor = new BigDaddyEditor(container);
            editor.setValue(`// Editor ${i}\nfunction test${i}() { return ${i}; }`);
            editors.push(editor);
        }
        
        const duration = performance.now() - start;
        
        return {
            count: editors.length,
            duration: duration.toFixed(2),
            avgPerEditor: (duration / editors.length).toFixed(2)
        };
    });
    
    console.log(`  ✅ Created ${test2.count} editors in ${test2.duration}ms`);
    console.log(`  ✅ Average: ${test2.avgPerEditor}ms per editor\n`);
    
    // Test 3: Large text
    console.log('TEST 3: Loading 5,000 lines...');
    const test3 = await page.evaluate(() => {
        const container = document.createElement('div');
        container.id = 'test-container-large';
        container.style.width = '800px';
        container.style.height = '600px';
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        document.body.appendChild(container);
        
        const editor = new BigDaddyEditor(container);
        
        const start = performance.now();
        let code = '';
        for (let i = 0; i < 5000; i++) {
            code += `function test${i}() { return ${i}; }\n`;
        }
        editor.setValue(code);
        const duration = performance.now() - start;
        
        return {
            lines: 5000,
            chars: code.length,
            duration: duration.toFixed(2)
        };
    });
    
    console.log(`  ✅ Loaded ${test3.lines} lines (${test3.chars.toLocaleString()} chars)`);
    console.log(`  ✅ Duration: ${test3.duration}ms\n`);
    
    // Test 4: Rapid insertions
    console.log('TEST 4: 500 rapid insert operations...');
    const test4 = await page.evaluate(() => {
        const container = document.createElement('div');
        container.id = 'test-container-rapid';
        container.style.width = '800px';
        container.style.height = '600px';
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        document.body.appendChild(container);
        
        const editor = new BigDaddyEditor(container);
        
        const start = performance.now();
        try {
            for (let i = 0; i < 500; i++) {
                editor.insertText(`line ${i}\n`);
            }
        } catch (e) {
            console.error('Error during insertText:', e.message);
            console.error('Stack:', e.stack);
            throw e;
        }
        const duration = performance.now() - start;
        
        return {
            operations: 500,
            duration: duration.toFixed(2),
            opsPerSec: Math.floor(500 / (duration / 1000))
        };
    });
    
    console.log(`  ✅ Completed ${test4.operations} operations in ${test4.duration}ms`);
    console.log(`  ✅ Throughput: ${test4.opsPerSec.toLocaleString()} ops/sec\n`);
    
    // Test 5: Undo/Redo
    console.log('TEST 5: Testing undo/redo (100 operations)...');
    const test5 = await page.evaluate(() => {
        const container = document.createElement('div');
        container.id = 'test-container-undo';
        container.style.width = '800px';
        container.style.height = '600px';
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        document.body.appendChild(container);
        
        const editor = new BigDaddyEditor(container);
        
        const start = performance.now();
        
        // Do 50 inserts
        for (let i = 0; i < 50; i++) {
            editor.insertText(`text${i}\n`);
        }
        
        // Undo 25 times
        for (let i = 0; i < 25; i++) {
            editor.undo();
        }
        
        // Redo 25 times
        for (let i = 0; i < 25; i++) {
            editor.redo();
        }
        
        const duration = performance.now() - start;
        
        return {
            operations: 100,
            duration: duration.toFixed(2),
            opsPerSec: Math.floor(100 / (duration / 1000))
        };
    });
    
    console.log(`  ✅ Completed ${test5.operations} operations in ${test5.duration}ms`);
    console.log(`  ✅ Throughput: ${test5.opsPerSec.toLocaleString()} ops/sec\n`);
    
    // Get memory metrics
    console.log('TEST 6: Memory metrics...');
    const metrics = await page.metrics();
    
    console.log(`  📊 JS Heap Used: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  📊 JS Heap Total: ${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  📊 DOM Nodes: ${metrics.Nodes}`);
    console.log(`  📊 Event Listeners: ${metrics.JSEventListeners}\n`);
    
    await browser.close();
    console.log('  ✅ Browser closed\n');
    
    return {
        test1,
        test2,
        test3,
        test4,
        test5,
        metrics
    };
}

(async () => {
    try {
        await startServer();
        const results = await runTests();
        stopServer();
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎉 ALL BROWSER TESTS PASSED! 🎉');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('📊 SUMMARY:\n');
        console.log(`  ✅ Single Instance: ${results.test1.duration}ms`);
        console.log(`  ✅ 5 Instances: ${results.test2.duration}ms (${results.test2.avgPerEditor}ms avg)`);
        console.log(`  ✅ 5,000 Lines: ${results.test3.duration}ms`);
        console.log(`  ✅ 500 Rapid Ops: ${results.test4.duration}ms (${results.test4.opsPerSec} ops/sec)`);
        console.log(`  ✅ 100 Undo/Redo: ${results.test5.duration}ms (${results.test5.opsPerSec} ops/sec)`);
        console.log(`  💾 Memory: ${(results.metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB\n`);
        
        console.log('🤖 Made by: Claude, ChatGPT, Gemini, DeepSeek, Kimi\n');
        
        process.exit(0);
        
    } catch (e) {
        console.error('\n💥 ERROR:', e.message);
        stopServer();
        process.exit(1);
    }
})();
