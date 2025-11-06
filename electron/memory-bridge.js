/**
 * OpenMemory Bridge for BigDaddyG IDE
 * 
 * Bridges JavaScript IDE to PowerShell OpenMemory modules via IPC
 * Provides persistent, context-aware memory for all agentic operations
 */

(function() {
'use strict';

class MemoryBridge {
    constructor() {
        this.isInitialized = false;
        this.memoryStats = {
            totalMemories: 0,
            totalEmbeddings: 0,
            storageSize: 0,
            lastUpdated: null
        };
        
        // Check if we're in Electron renderer with preload bridge
        if (!window.electron) {
            console.warn('[MemoryBridge] ⚠️ Not running in Electron - memory features limited');
            return;
        }
        
        console.log('[MemoryBridge] 🧠 Initializing OpenMemory Bridge...');
        this.initialize();
    }
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    async initialize() {
        try {
            // Request memory stats via IPC
            if (window.electron && window.electron.invoke) {
                const stats = await window.electron.invoke('memory:getStats');
                if (stats) {
                    this.memoryStats = stats;
                    this.isInitialized = true;
                    console.log('[MemoryBridge] ✅ Memory system connected');
                    console.log(`[MemoryBridge] 📊 ${stats.totalMemories} memories loaded`);
                    return;
                }
            }
            
            // Fallback: In-memory only mode
            console.warn('[MemoryBridge] ⚠️ Running in memory-only mode (no persistence)');
            this.setupInMemoryMode();
            
            // Load initial memory stats from in-memory
            await this.updateStats();
            
            this.isInitialized = true;
            console.log('[MemoryBridge] ✅ OpenMemory Bridge initialized');
            console.log('[MemoryBridge] 📊 Stats:', this.memoryStats);
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Initialization failed:', error);
        }
    }
    
    // ========================================================================
    // POWERSHELL EXECUTION WRAPPER
    // ========================================================================
    
    async executePowerShell(scriptPath, args = []) {
        return new Promise((resolve, reject) => {
            const argsString = args.map(arg => {
                // Escape PowerShell special characters
                const escaped = arg.replace(/'/g, "''");
                return `'${escaped}'`;
            }).join(' ');
            
            const command = `powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptPath}" ${argsString}`;
            
            console.log('[MemoryBridge] 🔧 Executing:', command);
            
            exec(command, { 
                encoding: 'utf8',
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large responses
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error('[MemoryBridge] ❌ PowerShell error:', error);
                    console.error('[MemoryBridge] stderr:', stderr);
                    reject(error);
                    return;
                }
                
                if (stderr) {
                    console.warn('[MemoryBridge] ⚠️ PowerShell warning:', stderr);
                }
                
                // Parse JSON output
                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (parseError) {
                    // If not JSON, return raw output
                    resolve({ success: true, output: stdout.trim() });
                }
            });
        });
    }
    
    // ========================================================================
    // STORAGE OPERATIONS
    // ========================================================================
    
    async storeMemory(content, metadata = {}) {
        if (!this.isInitialized) {
            console.error('[MemoryBridge] ❌ Not initialized');
            return null;
        }
        
        try {
            // Create a temporary PowerShell script to store memory
            const scriptContent = `
                Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
                
                $memory = @{
                    Content = '${content.replace(/'/g, "''").replace(/\n/g, '`n')}'
                    Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
                    Type = '${metadata.type || 'conversation'}'
                    Source = '${metadata.source || 'IDE'}'
                    Context = '${JSON.stringify(metadata.context || {}).replace(/'/g, "''")}'
                }
                
                Add-Memory -Memory $memory -StorePath "${this.storePath}"
                
                $memory | ConvertTo-Json -Compress
            `;
            
            const tempScript = path.join(this.storePath, `temp_store_${Date.now()}.ps1`);
            fs.writeFileSync(tempScript, scriptContent, 'utf8');
            
            const result = await this.executePowerShell(tempScript);
            
            // Clean up temp script
            fs.unlinkSync(tempScript);
            
            await this.updateStats();
            console.log('[MemoryBridge] 💾 Memory stored successfully');
            
            return result;
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to store memory:', error);
            return null;
        }
    }
    
    async queryMemory(query, limit = 10) {
        if (!this.isInitialized) {
            console.error('[MemoryBridge] ❌ Not initialized');
            return [];
        }
        
        try {
            const scriptContent = `
                Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
                
                $results = Search-Memory -Query '${query.replace(/'/g, "''")}' -StorePath "${this.storePath}" -Limit ${limit}
                
                $results | ConvertTo-Json -Compress
            `;
            
            const tempScript = path.join(this.storePath, `temp_query_${Date.now()}.ps1`);
            fs.writeFileSync(tempScript, scriptContent, 'utf8');
            
            const result = await this.executePowerShell(tempScript);
            
            // Clean up temp script
            fs.unlinkSync(tempScript);
            
            console.log('[MemoryBridge] 🔍 Query completed, found', result.length || 0, 'results');
            
            return Array.isArray(result) ? result : [result];
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to query memory:', error);
            return [];
        }
    }
    
    async getRecentMemories(limit = 20) {
        if (!this.isInitialized) {
            return [];
        }
        
        try {
            const scriptContent = `
                Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
                
                $memories = Get-RecentMemories -StorePath "${this.storePath}" -Limit ${limit}
                
                $memories | ConvertTo-Json -Compress
            `;
            
            const tempScript = path.join(this.storePath, `temp_recent_${Date.now()}.ps1`);
            fs.writeFileSync(tempScript, scriptContent, 'utf8');
            
            const result = await this.executePowerShell(tempScript);
            
            // Clean up temp script
            fs.unlinkSync(tempScript);
            
            return Array.isArray(result) ? result : [result];
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to get recent memories:', error);
            return [];
        }
    }
    
    // ========================================================================
    // EMBEDDING OPERATIONS
    // ========================================================================
    
    async createEmbedding(text, model = 'local') {
        if (!this.isInitialized) {
            return null;
        }
        
        try {
            const scriptContent = `
                Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
                
                $embedding = New-Embedding -Text '${text.replace(/'/g, "''")}' -Model '${model}'
                
                $embedding | ConvertTo-Json -Compress
            `;
            
            const tempScript = path.join(this.storePath, `temp_embed_${Date.now()}.ps1`);
            fs.writeFileSync(tempScript, scriptContent, 'utf8');
            
            const result = await this.executePowerShell(tempScript);
            
            // Clean up temp script
            fs.unlinkSync(tempScript);
            
            console.log('[MemoryBridge] 🔢 Embedding created');
            
            return result;
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to create embedding:', error);
            return null;
        }
    }
    
    async similaritySearch(embedding, threshold = 0.7, limit = 10) {
        if (!this.isInitialized) {
            return [];
        }
        
        try {
            const scriptContent = `
                Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
                
                $results = Find-SimilarMemories -Embedding ${JSON.stringify(embedding)} -Threshold ${threshold} -Limit ${limit} -StorePath "${this.storePath}"
                
                $results | ConvertTo-Json -Compress
            `;
            
            const tempScript = path.join(this.storePath, `temp_similar_${Date.now()}.ps1`);
            fs.writeFileSync(tempScript, scriptContent, 'utf8');
            
            const result = await this.executePowerShell(tempScript);
            
            // Clean up temp script
            fs.unlinkSync(tempScript);
            
            return Array.isArray(result) ? result : [result];
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to find similar memories:', error);
            return [];
        }
    }
    
    // ========================================================================
    // DECAY OPERATIONS
    // ========================================================================
    
    async applyDecay() {
        if (!this.isInitialized) {
            return false;
        }
        
        try {
            const scriptContent = `
                Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
                
                $result = Invoke-MemoryDecay -StorePath "${this.storePath}"
                
                @{ Success = $true; DecayedCount = $result.DecayedCount } | ConvertTo-Json -Compress
            `;
            
            const tempScript = path.join(this.storePath, `temp_decay_${Date.now()}.ps1`);
            fs.writeFileSync(tempScript, scriptContent, 'utf8');
            
            const result = await this.executePowerShell(tempScript);
            
            // Clean up temp script
            fs.unlinkSync(tempScript);
            
            await this.updateStats();
            console.log('[MemoryBridge] 🗑️ Decay applied, decayed', result.DecayedCount || 0, 'memories');
            
            return true;
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to apply decay:', error);
            return false;
        }
    }
    
    // ========================================================================
    // STATISTICS & MAINTENANCE
    // ========================================================================
    
    async updateStats() {
        try {
            // Count files in Store directory
            if (fs.existsSync(this.storePath)) {
                const files = fs.readdirSync(this.storePath);
                const memoryFiles = files.filter(f => f.endsWith('.json') || f.endsWith('.mem'));
                
                // Calculate total storage size
                let totalSize = 0;
                memoryFiles.forEach(file => {
                    const filePath = path.join(this.storePath, file);
                    const stats = fs.statSync(filePath);
                    totalSize += stats.size;
                });
                
                this.memoryStats = {
                    totalMemories: memoryFiles.length,
                    totalEmbeddings: memoryFiles.length, // Approximate
                    storageSize: this.formatBytes(totalSize),
                    storageSizeBytes: totalSize,
                    lastUpdated: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to update stats:', error);
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    
    async clearAllMemories() {
        if (!this.isInitialized) {
            return false;
        }
        
        try {
            // Archive old memories before clearing
            const archivePath = path.join(this.storePath, `archive_${Date.now()}`);
            fs.mkdirSync(archivePath, { recursive: true });
            
            const files = fs.readdirSync(this.storePath);
            files.forEach(file => {
                if (file.endsWith('.json') || file.endsWith('.mem')) {
                    const source = path.join(this.storePath, file);
                    const dest = path.join(archivePath, file);
                    fs.renameSync(source, dest);
                }
            });
            
            await this.updateStats();
            console.log('[MemoryBridge] 🗑️ All memories archived to:', archivePath);
            
            return true;
            
        } catch (error) {
            console.error('[MemoryBridge] ❌ Failed to clear memories:', error);
            return false;
        }
    }
    
    getStats() {
        return this.memoryStats;
    }
}

// ========================================================================
// GLOBAL EXPOSURE
// ========================================================================

// Create singleton instance
window.memoryBridge = new MemoryBridge();

// Expose to global scope for easy access
window.memory = {
    store: (content, metadata) => window.memoryBridge.storeMemory(content, metadata),
    query: (query, limit) => window.memoryBridge.queryMemory(query, limit),
    recent: (limit) => window.memoryBridge.getRecentMemories(limit),
    embed: (text, model) => window.memoryBridge.createEmbedding(text, model),
    similar: (embedding, threshold, limit) => window.memoryBridge.similaritySearch(embedding, threshold, limit),
    decay: () => window.memoryBridge.applyDecay(),
    stats: () => window.memoryBridge.getStats(),
    clear: () => window.memoryBridge.clearAllMemories()
};

console.log('[MemoryBridge] 🌐 Global memory API exposed: window.memory');

})();
