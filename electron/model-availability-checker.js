/**
 * Model Availability Checker
 * Pre-checks model availability before API calls
 */

class ModelAvailabilityChecker {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async checkModel(modelName, forceRefresh = false) {
    // Check cache first
    if (!forceRefresh && this.cache.has(modelName)) {
      const cached = this.cache.get(modelName);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.available;
      }
    }

    // Check availability
    const available = await this._checkAvailability(modelName);
    
    // Cache result
    this.cache.set(modelName, {
      available,
      timestamp: Date.now()
    });

    return available;
  }

  async _checkAvailability(modelName) {
    try {
      // Method 1: Check via discovery
      if (window.electron?.models?.discover) {
        const discovery = await window.electron.models.discover();
        const ollamaModels = discovery.catalog?.ollama?.models || [];
        const found = ollamaModels.find(m => {
          const name = typeof m === 'string' ? m : m.name;
          return name === modelName || name === modelName.split(':')[0];
        });
        if (found) return true;
      }

      // Method 2: Direct API check
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];
        return models.some(m => {
          const name = typeof m === 'string' ? m : m.name;
          return name === modelName || name === modelName.split(':')[0];
        });
      }

      return false;
    } catch (error) {
      console.warn(`[ModelChecker] Error checking ${modelName}:`, error.message);
      return false;
    }
  }

  async checkMultipleModels(modelNames) {
    const results = {};
    await Promise.all(
      modelNames.map(async (name) => {
        results[name] = await this.checkModel(name);
      })
    );
    return results;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Initialize and expose
if (typeof window !== 'undefined') {
  window.modelAvailabilityChecker = new ModelAvailabilityChecker();
}

module.exports = ModelAvailabilityChecker;
