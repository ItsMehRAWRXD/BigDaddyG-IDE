/**
 * Native Node.js HTTP Client for Ollama
 * 
 * Pure JavaScript - no compilation needed!
 * Faster than fetch, works immediately
 */

const http = require('http');

class NativeOllamaNode {
    constructor() {
        this.isAvailable = true; // Always available - it's pure Node.js!
    }
    
    /**
     * Send request to Ollama using native Node.js http
     */
    async generate(model, prompt) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            // Escape JSON
            const escapedPrompt = prompt.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            
            const postData = JSON.stringify({
                message: escapedPrompt,
                model: model,
                parameters: {}
            });
            
            const options = {
                hostname: 'localhost',
                port: 11441,
                path: '/api/chat',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 300000 // 5 minutes
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const endTime = Date.now();
                    const duration = (endTime - startTime) / 1000;
                    
                    if (res.statusCode === 200) {
                        try {
                            const json = JSON.parse(data);
                            resolve({
                                content: json.response || json.content || data,
                                time: duration,
                                mode: 'native-node',
                                statusCode: res.statusCode
                            });
                        } catch (e) {
                            // Return raw if not JSON
                            resolve({
                                content: data,
                                time: duration,
                                mode: 'native-node',
                                statusCode: res.statusCode
                            });
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.write(postData);
            req.end();
        });
    }
    
    getStats() {
        return {
            available: this.isAvailable,
            mode: 'native-node',
            description: 'Pure Node.js HTTP - no compilation needed!'
        };
    }
}

module.exports = new NativeOllamaNode();

