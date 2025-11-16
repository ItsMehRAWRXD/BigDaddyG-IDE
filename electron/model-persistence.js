/**
 * Model Persistence Manager
 * Saves and restores user's model preferences
 */

class ModelPersistence {
  constructor() {
    this.storageKey = 'bigdaddyg-model-preferences';
    this.preferences = this.loadPreferences();
  }

  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[ModelPersistence] Failed to load preferences:', error);
    }
    return {
      lastSelectedModel: null,
      favoriteModels: [],
      modelSettings: {},
      perProviderPreferences: {}
    };
  }

  savePreferences() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
      return true;
    } catch (error) {
      console.error('[ModelPersistence] Failed to save preferences:', error);
      return false;
    }
  }

  setLastSelectedModel(modelName, provider = 'ollama') {
    this.preferences.lastSelectedModel = modelName;
    this.preferences.perProviderPreferences = this.preferences.perProviderPreferences || {};
    this.preferences.perProviderPreferences[provider] = modelName;
    this.savePreferences();
  }

  getLastSelectedModel(provider = 'ollama') {
    if (this.preferences.perProviderPreferences?.[provider]) {
      return this.preferences.perProviderPreferences[provider];
    }
    return this.preferences.lastSelectedModel;
  }

  addFavoriteModel(modelName) {
    if (!this.preferences.favoriteModels.includes(modelName)) {
      this.preferences.favoriteModels.push(modelName);
      this.savePreferences();
    }
  }

  removeFavoriteModel(modelName) {
    const index = this.preferences.favoriteModels.indexOf(modelName);
    if (index > -1) {
      this.preferences.favoriteModels.splice(index, 1);
      this.savePreferences();
    }
  }

  getFavoriteModels() {
    return this.preferences.favoriteModels || [];
  }

  setModelSettings(modelName, settings) {
    this.preferences.modelSettings = this.preferences.modelSettings || {};
    this.preferences.modelSettings[modelName] = {
      ...this.preferences.modelSettings[modelName],
      ...settings,
      lastUsed: new Date().toISOString()
    };
    this.savePreferences();
  }

  getModelSettings(modelName) {
    return this.preferences.modelSettings?.[modelName] || {};
  }

  clearPreferences() {
    this.preferences = {
      lastSelectedModel: null,
      favoriteModels: [],
      modelSettings: {},
      perProviderPreferences: {}
    };
    localStorage.removeItem(this.storageKey);
  }
}

// Initialize and expose
if (typeof window !== 'undefined') {
  window.modelPersistence = new ModelPersistence();
}

module.exports = ModelPersistence;
