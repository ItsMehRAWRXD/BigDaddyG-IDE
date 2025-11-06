/**
 * MemoryService - Node-side bridge to PowerShell OpenMemory module
 * Runs inside the Electron main process where Node APIs are available
 */

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

class MemoryService {
  constructor() {
    this.openMemoryPath = path.join(__dirname, '..', 'OpenMemory');
    this.storePath = path.join(this.openMemoryPath, 'Store');
    this.moduleBasePath = path.join(this.openMemoryPath, 'Modules');
    this.isInitialized = false;
    this.memoryStats = {
      totalMemories: 0,
      totalEmbeddings: 0,
      storageSize: '0 Bytes',
      storageSizeBytes: 0,
      lastUpdated: null
    };

    this.initialize();
  }

  initialize() {
    try {
      if (!fs.existsSync(this.openMemoryPath)) {
        console.warn('[MemoryService] ⚠️ OpenMemory module not found at:', this.openMemoryPath);
        return;
      }

      fs.mkdirSync(this.storePath, { recursive: true });
      this.isInitialized = true;
      this.updateStats();

      console.log('[MemoryService] ✅ OpenMemory service ready');
      console.log(`[MemoryService] 📊 ${this.memoryStats.totalMemories} memories loaded`);
    } catch (error) {
      console.error('[MemoryService] ❌ Initialization failed:', error);
    }
  }

  async executePowerShell(scriptPath) {
    return new Promise((resolve, reject) => {
      const command = `powershell -ExecutionPolicy Bypass -NoProfile -File "${scriptPath}"`;

      exec(command, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('[MemoryService] ❌ PowerShell error:', error);
          console.error('[MemoryService] stderr:', stderr);
          reject(error);
          return;
        }

        if (stderr) {
          console.warn('[MemoryService] ⚠️ PowerShell warning:', stderr);
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          resolve(stdout ? stdout.trim() : '');
        }
      });
    });
  }

  writeTempScript(prefix, body) {
    const tempScript = path.join(this.storePath, `${prefix}_${Date.now()}.ps1`);
    fs.writeFileSync(tempScript, body, 'utf8');
    return tempScript;
  }

  cleanupTempScript(scriptPath) {
    try {
      if (scriptPath && fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
    } catch (error) {
      console.warn('[MemoryService] ⚠️ Unable to clean temp script:', error.message);
    }
  }

  async storeMemory(content, metadata = {}) {
    if (!this.isInitialized) {
      return { success: false, error: 'Memory service not initialized' };
    }

    let tempScript = null;

    try {
      const safeContent = (content || '').replace(/'/g, "''").replace(/\n/g, '`n');
      const safeContext = JSON.stringify(metadata.context || {}).replace(/'/g, "''");

      const script = `
        Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force

        $memory = @{
            Content = '${safeContent}'
            Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
            Type = '${metadata.type || 'conversation'}'
            Source = '${metadata.source || 'IDE'}'
            Context = '${safeContext}'
        }

        Add-Memory -Memory $memory -StorePath "${this.storePath}"

        $memory | ConvertTo-Json -Compress
      `;

      tempScript = this.writeTempScript('temp_store', script);
      const result = await this.executePowerShell(tempScript);
      this.cleanupTempScript(tempScript);
      await this.updateStats();

      return { success: true, memory: result };
    } catch (error) {
      this.cleanupTempScript(tempScript);
      console.error('[MemoryService] ❌ Failed to store memory:', error);
      return { success: false, error: error.message };
    }
  }

  async queryMemory(query, limit = 10) {
    if (!this.isInitialized) {
      return { success: false, error: 'Memory service not initialized', results: [] };
    }

    let tempScript = null;

    try {
      const safeQuery = (query || '').replace(/'/g, "''");

      const script = `
        Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
        $results = Search-Memory -Query '${safeQuery}' -StorePath "${this.storePath}" -Limit ${limit}
        $results | ConvertTo-Json -Compress
      `;

      tempScript = this.writeTempScript('temp_query', script);
      const result = await this.executePowerShell(tempScript);
      this.cleanupTempScript(tempScript);

      const resultsArray = Array.isArray(result) ? result : (result ? [result] : []);
      return { success: true, results: resultsArray };
    } catch (error) {
      this.cleanupTempScript(tempScript);
      console.error('[MemoryService] ❌ Failed to query memory:', error);
      return { success: false, error: error.message, results: [] };
    }
  }

  async getRecentMemories(limit = 20) {
    if (!this.isInitialized) {
      return { success: false, error: 'Memory service not initialized', memories: [] };
    }

    let tempScript = null;

    try {
      const script = `
        Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
        $memories = Get-RecentMemories -StorePath "${this.storePath}" -Limit ${limit}
        $memories | ConvertTo-Json -Compress
      `;

      tempScript = this.writeTempScript('temp_recent', script);
      const result = await this.executePowerShell(tempScript);
      this.cleanupTempScript(tempScript);

      const memories = Array.isArray(result) ? result : (result ? [result] : []);
      return { success: true, memories };
    } catch (error) {
      this.cleanupTempScript(tempScript);
      console.error('[MemoryService] ❌ Failed to get recent memories:', error);
      return { success: false, error: error.message, memories: [] };
    }
  }

  async createEmbedding(text, model = 'local') {
    if (!this.isInitialized) {
      return { success: false, error: 'Memory service not initialized' };
    }

    let tempScript = null;

    try {
      const safeText = (text || '').replace(/'/g, "''");

      const script = `
        Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
        $embedding = New-Embedding -Text '${safeText}' -Model '${model}'
        $embedding | ConvertTo-Json -Compress
      `;

      tempScript = this.writeTempScript('temp_embed', script);
      const result = await this.executePowerShell(tempScript);
      this.cleanupTempScript(tempScript);

      return { success: true, embedding: result };
    } catch (error) {
      this.cleanupTempScript(tempScript);
      console.error('[MemoryService] ❌ Failed to create embedding:', error);
      return { success: false, error: error.message };
    }
  }

  async similaritySearch(embedding, threshold = 0.7, limit = 10) {
    if (!this.isInitialized) {
      return { success: false, error: 'Memory service not initialized', results: [] };
    }

    let tempScript = null;

    try {
      const script = `
        Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
        $results = Find-SimilarMemories -Embedding ${JSON.stringify(embedding)} -Threshold ${threshold} -Limit ${limit} -StorePath "${this.storePath}"
        $results | ConvertTo-Json -Compress
      `;

      tempScript = this.writeTempScript('temp_similar', script);
      const result = await this.executePowerShell(tempScript);
      this.cleanupTempScript(tempScript);

      const resultsArray = Array.isArray(result) ? result : (result ? [result] : []);
      return { success: true, results: resultsArray };
    } catch (error) {
      this.cleanupTempScript(tempScript);
      console.error('[MemoryService] ❌ Failed similarity search:', error);
      return { success: false, error: error.message, results: [] };
    }
  }

  async applyDecay() {
    if (!this.isInitialized) {
      return { success: false, error: 'Memory service not initialized' };
    }

    let tempScript = null;

    try {
      const script = `
        Import-Module "${this.openMemoryPath}\\OpenMemory.psd1" -Force
        $result = Invoke-MemoryDecay -StorePath "${this.storePath}"
        @{ Success = $true; DecayedCount = $result.DecayedCount } | ConvertTo-Json -Compress
      `;

      tempScript = this.writeTempScript('temp_decay', script);
      const result = await this.executePowerShell(tempScript);
      this.cleanupTempScript(tempScript);
      await this.updateStats();

      return { success: true, details: result };
    } catch (error) {
      this.cleanupTempScript(tempScript);
      console.error('[MemoryService] ❌ Failed to apply decay:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAllMemories() {
    if (!this.isInitialized) {
      return { success: false, error: 'Memory service not initialized' };
    }

    try {
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
      return { success: true, archivePath };
    } catch (error) {
      console.error('[MemoryService] ❌ Failed to clear memories:', error);
      return { success: false, error: error.message };
    }
  }

  formatBytes(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  }

  async updateStats() {
    try {
      if (!fs.existsSync(this.storePath)) {
        this.memoryStats = {
          totalMemories: 0,
          totalEmbeddings: 0,
          storageSize: '0 Bytes',
          storageSizeBytes: 0,
          lastUpdated: new Date().toISOString()
        };
        return this.memoryStats;
      }

      const files = fs.readdirSync(this.storePath).filter(f => f.endsWith('.json') || f.endsWith('.mem'));
      let totalSize = 0;

      files.forEach(file => {
        const filePath = path.join(this.storePath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });

      this.memoryStats = {
        totalMemories: files.length,
        totalEmbeddings: files.length,
        storageSize: this.formatBytes(totalSize),
        storageSizeBytes: totalSize,
        lastUpdated: new Date().toISOString()
      };

      return this.memoryStats;
    } catch (error) {
      console.error('[MemoryService] ❌ Failed to update stats:', error);
      return this.memoryStats;
    }
  }

  getStats() {
    return {
      success: this.isInitialized,
      ...this.memoryStats
    };
  }
}

module.exports = new MemoryService();

