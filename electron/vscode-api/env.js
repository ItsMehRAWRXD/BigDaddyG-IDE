/**
 * BigDaddyG IDE - VS Code Environment API
 * Implements vscode.env namespace
 */

const os = require('os');
const { v4: uuidv4 } = require('uuid');

class EnvironmentAPI {
    constructor(vscodeAPI) {
        this.vscodeAPI = vscodeAPI;
        this._machineId = this._generateMachineId();
        this._sessionId = uuidv4();
        
        console.log('[VSCode API] Environment API initialized');
    }
    
    /**
     * Get VS Code API
     */
    getAPI() {
        return {
            // App info
            appName: 'BigDaddyG IDE',
            appRoot: process.cwd(),
            
            // User info
            language: 'en',
            
            // Machine info
            get machineId() {
                return this._machineId;
            },
            
            get sessionId() {
                return this._sessionId;
            },
            
            // OS info
            get remoteName() {
                return undefined; // Not a remote session
            },
            
            get shell() {
                return process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
            },
            
            get uiKind() {
                return 1; // UIKind.Desktop
            },
            
            // Clipboard
            get clipboard() {
                return {
                    readText: async () => {
                        // Would integrate with system clipboard
                        return '';
                    },
                    writeText: async (text) => {
                        // Would integrate with system clipboard
                        console.log('[Env] Clipboard write:', text.substring(0, 50));
                    }
                };
            },
            
            // URI handling
            openExternal: async (uri) => {
                console.log('[Env] Opening external URI:', uri.toString());
                // Would open in default browser
                return true;
            },
            
            asExternalUri: async (uri) => {
                // For port forwarding in remote scenarios
                return uri;
            },
            
            // System info
            get isNewAppInstall() {
                return false;
            },
            
            get isTelemetryEnabled() {
                return false; // Privacy-focused
            }
        };
    }
    
    /**
     * Generate stable machine ID
     */
    _generateMachineId() {
        // Create a stable ID based on hostname and platform
        const crypto = require('crypto');
        const hostname = os.hostname();
        const platform = os.platform();
        const arch = os.arch();
        
        const hash = crypto
            .createHash('sha256')
            .update(`${hostname}-${platform}-${arch}`)
            .digest('hex');
        
        return hash.substring(0, 32);
    }
}

module.exports = EnvironmentAPI;

