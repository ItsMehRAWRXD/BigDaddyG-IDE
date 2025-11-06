/**
 * Native Ollama CLI Bridge
 * 
 * Calls the pure C executable for maximum performance
 * No Node.js overhead, no Python, no dependencies!
 */

const { spawn } = require('child_process');
const path = require('path');

class NativeOllamaCLI {
    constructor() {
        this.executablePath = path.join(__dirname, 'ollama-native.exe');
        this.isAvailable = false;
        this.checkAvailability();
    }
    
    checkAvailability() {
        const fs = require('fs');
        this.isAvailable = fs.existsSync(this.executablePath);
        
        if (this.isAvailable) {
            console.log('[NativeOllama] ✅ Native executable found:', this.executablePath);
        } else {
            console.log('[NativeOllama] ⚠️ Native executable not found. Build it with:');
            console.log('[NativeOllama]    cd native/ollama-wrapper && BUILD-C.bat');
        }
    }
    
    async generate(model, prompt) {
        if (!this.isAvailable) {
            throw new Error('Native Ollama not available. Please build it first.');
        }
        
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let response = '';
            let errorOutput = '';
            
            const child = spawn(this.executablePath, [model, prompt], {
                windowsHide: true
            });
            
            child.stdout.on('data', (data) => {
                response += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            child.on('close', (code) => {
                const endTime = Date.now();
                const duration = (endTime - startTime) / 1000;
                
                if (code === 0) {
                    try {
                        // Parse JSON response from Orchestra
                        const json = JSON.parse(response);
                        resolve({
                            content: json.response || json.content || response,
                            time: duration,
                            mode: 'native-cli',
                            statusCode: 200
                        });
                    } catch (e) {
                        // If not JSON, return raw response
                        resolve({
                            content: response,
                            time: duration,
                            mode: 'native-cli',
                            statusCode: 200
                        });
                    }
                } else {
                    reject(new Error(`Native process failed (code ${code}): ${errorOutput}`));
                }
            });
            
            child.on('error', (error) => {
                reject(error);
            });
        });
    }
    
    getStats() {
        return {
            available: this.isAvailable,
            path: this.executablePath,
            mode: 'native-cli'
        };
    }
}

module.exports = new NativeOllamaCLI();

