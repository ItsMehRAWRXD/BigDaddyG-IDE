/**
 * Model Selector UI - Dropdown for Ollama, Amazon Q, Copilot
 */

class ModelSelector {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.aiManager = null;
    this.selectedModel = null;
  }

  async init(aiManager) {
    this.aiManager = aiManager;
    await this.render();
    
    // Load saved preferences
    if (window.modelPersistence) {
      const lastModel = window.modelPersistence.getLastSelectedModel();
      if (lastModel) {
        const select = document.getElementById('model-select');
        if (select) {
          select.value = `ollama:${lastModel}`;
          this.selectedModel = select.value;
        }
      }
    }
    
    // Auto-refresh every 60 seconds
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
    this.autoRefreshInterval = setInterval(() => {
      this.refresh();
    }, 60000);
  }

  async render() {
    // Get actual models from discovery
    let ollamaModels = [];
    let builtinModels = [];
    
    try {
      // Try electron models discovery first
      if (window.electron?.models?.discover) {
        const discovery = await window.electron.models.discover();
        ollamaModels = discovery.catalog?.ollama?.models || [];
        builtinModels = discovery.catalog?.bigdaddyg?.models || [];
      } else if (window.electron?.models?.list) {
        // Fallback to list
        const models = await window.electron.models.list();
        ollamaModels = Array.isArray(models) ? models : [];
      }
    } catch (error) {
      console.warn('[ModelSelector] Failed to discover models:', error);
    }
    
    // Fallback to AI manager if available
    if (ollamaModels.length === 0 && this.aiManager) {
      const models = this.aiManager.getAvailableModels();
      ollamaModels = models.ollama?.combined || models.ollama?.server || models.ollama || [];
      builtinModels = models.builtin?.bigdaddyg || [];
    }
    
    // Format model names
    const formatModelName = (m) => {
      if (typeof m === 'string') return m;
      return m.name || m.id || String(m);
    };
    
    const ollamaOptions = ollamaModels.length > 0 
      ? ollamaModels.map(m => {
          const name = formatModelName(m);
          const displayName = typeof m === 'object' && m.size 
            ? `${name} (${(m.size / 1024 / 1024 / 1024).toFixed(2)}GB)` 
            : name;
          return `<option value="ollama:${name}">${displayName}</option>`;
        }).join('')
      : '<option disabled>No Ollama models found</option>';
    
    const builtinOptions = builtinModels.length > 0
      ? builtinModels.map(m => {
          const name = formatModelName(m);
          return `<option value="builtin:${name}">${name}</option>`;
        }).join('')
      : '';
    
    this.container.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center;">
        <select id="model-select" style="flex: 1; padding:8px;border-radius:4px;background:#2d2d2d;color:#fff;border:1px solid #444; font-size: 12px;">
          <optgroup label="Ollama Models">
            ${ollamaOptions}
          </optgroup>
          ${builtinOptions ? `<optgroup label="Built-in">${builtinOptions}</optgroup>` : ''}
          <optgroup label="Extensions">
            <option value="ext:amazonq">Amazon Q</option>
            <option value="ext:copilot">GitHub Copilot</option>
          </optgroup>
        </select>
        <button onclick="window.modelSelector.refresh()" style="padding: 8px 12px; background: #444; color: #fff; border: 1px solid #555; border-radius: 4px; cursor: pointer; font-size: 11px;" title="Refresh model list">🔄</button>
      </div>
    `;

    const select = document.getElementById('model-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.selectedModel = e.target.value;
        console.log('[ModelSelector] Selected:', this.selectedModel);
        
        // Update model state manager if available
        if (window.modelState) {
          const modelName = e.target.value.includes(':') ? e.target.value.split(':')[1] : e.target.value;
          window.modelState.setActiveModel(modelName);
        }
        
        // Save preference
        if (window.modelPersistence) {
          const modelName = e.target.value.includes(':') ? e.target.value.split(':')[1] : e.target.value;
          window.modelPersistence.setLastSelectedModel(modelName);
        }
      });
      
      // Set default selection
      if (!this.selectedModel && ollamaModels.length > 0) {
        const firstModel = formatModelName(ollamaModels[0]);
        select.value = `ollama:${firstModel}`;
        this.selectedModel = select.value;
      }
    }
  }
  
  async refresh() {
    console.log('[ModelSelector] Refreshing models...');
    await this.render();
  }

  getSelected() {
    const [type, model] = (this.selectedModel || 'ollama:llama3.2').split(':');
    return { type, model };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModelSelector;
} else {
  window.ModelSelector = ModelSelector;
}
