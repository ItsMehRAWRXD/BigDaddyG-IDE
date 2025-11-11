const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8877;
let server;

function startServer() {
    return new Promise((resolve) => {
        server = http.createServer((req, res) => {
            const editorDir = path.join(__dirname, 'bigdaddy-editor');
            let filePath = req.url === '/' || req.url === '/test' 
                ? path.join(editorDir, 'real-stress-test.html')
                : path.join(editorDir, req.url.substring(1));
            
            if (!fs.existsSync(filePath)) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            
            const ext = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css'
            }[ext] || 'text/plain';
            
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
            console.log(`Server started on http://localhost:${PORT}`);
            resolve();
        });
    });
}

(async () => {
    try {
        await startServer();
        
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Capture ALL console messages
        page.on('console', msg => console.log('CONSOLE:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message, error.stack));
        
        await page.goto(`http://localhost:${PORT}/test`, { waitUntil: 'networkidle0' });
        
        // Wait for editor
        await page.waitForFunction(() => typeof BigDaddyEditor !== 'undefined', { timeout: 10000 });
        
        console.log('\n=== DEBUG TEST: Single insertText ===\n');
        
        const result = await page.evaluate(() => {
            try {
                const container = document.createElement('div');
                container.style.width = '800px';
                container.style.height = '600px';
                container.style.position = 'absolute';
                container.style.top = '-9999px';
                document.body.appendChild(container);
                
                console.log('Creating editor...');
                const editor = new BigDaddyEditor(container);
                console.log('Editor created successfully');
                
                console.log('Initial value:', editor.getValue());
                console.log('Cursor:', JSON.stringify(editor.cursor));
                
                console.log('Attempting insertText...');
                editor.insertText('line 0\\n');
                console.log('First insert successful');
                console.log('Value:', editor.getValue());
                console.log('Cursor:', JSON.stringify(editor.cursor));
                
                console.log('Second insert...');
                editor.insertText('line 1\\n');
                console.log('Second insert successful');
                
                return {success: true, value: editor.getValue()};
            } catch (e) {
                console.error('CAUGHT ERROR:', e.message);
                console.error('Stack:', e.stack);
                return {success: false, error: e.message, stack: e.stack};
            }
        });
        
        console.log('\nRESULT:', JSON.stringify(result, null, 2));
        
        await browser.close();
        server.close();
        process.exit(result.success ? 0 : 1);
        
    } catch (e) {
        console.error('ERROR:', e.message);
        if (server) server.close();
        process.exit(1);
    }
})();
