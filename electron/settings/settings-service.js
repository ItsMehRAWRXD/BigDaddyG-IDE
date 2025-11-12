const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const DEFAULT_SETTINGS = {
  appearance: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace",
    fontSize: 15,
    lineHeight: 1.6,
    uiScale: 1,
    monospaceFont: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace",
    theme: 'bigdaddyg-default',
    transparency: {
      enabled: false,
      window: 0.95,
      sidePanels: 0.92,
      bottomPanel: 0.96,
      chatPanels: 0.9,
      exclude: ['monaco-editor', 'modal-dialogs']
    },
    colors: {
      accent: 'rgba(0, 212, 255, 1)',
      accentSoft: 'rgba(0, 212, 255, 0.18)',
      success: 'rgba(0, 255, 136, 1)',
      warning: 'rgba(255, 173, 0, 1)',
      danger: 'rgba(255, 90, 82, 1)',
      backgroundPrimary: 'rgba(12, 12, 16, 0.98)',
      backgroundSecondary: 'rgba(24, 24, 32, 0.94)',
      backgroundFloating: 'rgba(18, 18, 28, 0.88)',
      border: 'rgba(255, 255, 255, 0.08)',
      textPrimary: 'rgba(250, 249, 246, 0.95)',
      textSecondary: 'rgba(186, 186, 202, 0.82)',
      editorBackground: 'rgba(14, 14, 18, 0.98)',
      editorForeground: 'rgba(237, 241, 245, 0.97)'
    },
    editor: {
      minimap: {
        enabled: true,
        maxColumn: 120,
        renderCharacters: false
      },
      wordWrap: 'on',
      lineNumbers: 'on',
      theme: 'bigdaddyg-dark',
      fontSize: 15,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace",
      lineHeight: 24,
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: true,
      roundedSelection: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      quickSuggestions: true,
      quickSuggestionsDelay: 150,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      parameterHints: {
        enabled: true,
        cycle: false
      },
      matchBrackets: 'always',
      bracketPairColorization: {
        enabled: true
      },
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'mouseover',
      occurrencesHighlight: false,
      renderValidationDecorations: 'on',
      renderLineHighlight: 'line',
      renderWhitespace: 'selection',
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
      largeFileOptimizations: true,
      maxTokenizationLineLength: 20000,
      codeLens: false,
      colorDecorators: false,
      links: false,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        verticalScrollbarSize: 14,
        horizontalScrollbarSize: 14
      }
    }
  },
  layout: {
    allowOverlap: false,
    snapToEdges: true,
    panelSpacing: 12,
    defaultArrangement: 'balanced',
    sections: {
      explorer: { dock: 'left', width: 320 },
      chat: { dock: 'right', width: 360 },
      terminal: { dock: 'bottom', height: 260 },
      browser: { dock: 'right', width: 480, floating: false }
    }
  },
  services: {
    orchestra: {
      autoStart: true,
      autoRestart: true,
      autoStartDelayMs: 1500
    }
  },
  hotkeys: {
    'ide.newFile': { combo: 'Ctrl+N', description: 'New File', category: 'File' },
    'ide.openFile': { combo: 'Ctrl+O', description: 'Open File', category: 'File' },
    'ide.saveFile': { combo: 'Ctrl+S', description: 'Save File', category: 'File' },
    'ide.saveFileAs': { combo: 'Ctrl+Shift+S', description: 'Save As', category: 'File' },
    'ide.saveAll': { combo: 'Ctrl+K Ctrl+S', description: 'Save All Files', category: 'File' },

    'tabs.next': { combo: 'Ctrl+Tab', description: 'Next Tab', category: 'Tabs' },
    'tabs.previous': { combo: 'Ctrl+Shift+Tab', description: 'Previous Tab', category: 'Tabs' },
    'tabs.close': { combo: 'Ctrl+W', description: 'Close Tab', category: 'Tabs' },
    'tabs.closeAll': { combo: 'Ctrl+Shift+W', description: 'Close All Tabs', category: 'Tabs' },
    'tabs.switch.1': { combo: 'Ctrl+1', description: 'Switch to Tab 1', category: 'Tabs' },
    'tabs.switch.2': { combo: 'Ctrl+2', description: 'Switch to Tab 2', category: 'Tabs' },
    'tabs.switch.3': { combo: 'Ctrl+3', description: 'Switch to Tab 3', category: 'Tabs' },
    'tabs.switch.4': { combo: 'Ctrl+4', description: 'Switch to Tab 4', category: 'Tabs' },
    'tabs.switch.5': { combo: 'Ctrl+5', description: 'Switch to Tab 5', category: 'Tabs' },
    'tabs.switch.6': { combo: 'Ctrl+6', description: 'Switch to Tab 6', category: 'Tabs' },
    'tabs.switch.7': { combo: 'Ctrl+7', description: 'Switch to Tab 7', category: 'Tabs' },
    'tabs.switch.8': { combo: 'Ctrl+8', description: 'Switch to Tab 8', category: 'Tabs' },
    'tabs.switch.9': { combo: 'Ctrl+9', description: 'Switch to Tab 9', category: 'Tabs' },
    'tabs.previousAlt': { combo: 'Alt+ArrowLeft', description: 'Previous Tab (Alt)', category: 'Tabs' },
    'tabs.nextAlt': { combo: 'Alt+ArrowRight', description: 'Next Tab (Alt)', category: 'Tabs' },

    'center.chat': { combo: 'Ctrl+Shift+C', description: 'Open Chat Tab', category: 'Center Tabs' },
    'center.explorer': { combo: 'Ctrl+Shift+E', description: 'Open Explorer Tab', category: 'Center Tabs' },
    'center.github': { combo: 'Ctrl+Shift+G', description: 'Open GitHub Tab', category: 'Center Tabs' },
    'center.agents': { combo: 'Ctrl+Shift+A', description: 'Open Agents Tab', category: 'Center Tabs' },
    'center.team': { combo: 'Ctrl+Shift+T', description: 'Open Team Tab', category: 'Center Tabs' },
    'center.settings': { combo: 'Ctrl+,', description: 'Open Settings Tab', category: 'Center Tabs' },

    'chat.toggleFloating': { combo: 'Ctrl+L', description: 'Toggle Floating Chat', category: 'Chat' },
    'chat.sendMessage': { combo: 'Ctrl+Enter', description: 'Send AI Message', category: 'Chat' },
    'chat.stop': { combo: 'Ctrl+Shift+X', description: 'Stop AI Execution', category: 'Chat' },

    'terminal.toggle': { combo: 'Ctrl+J', description: 'Toggle Terminal', category: 'Terminal' },

    'voice.start': { combo: 'Ctrl+Shift+V', description: 'Start Voice Coding', category: 'Voice' },
    'palette.open': { combo: 'Ctrl+Shift+P', description: 'Enhanced Command Palette', category: 'Productivity' },

    'modals.close': { combo: 'Escape', description: 'Close Modals', category: 'General' },

    'editor.find': { combo: 'Ctrl+F', description: 'Find', category: 'Editor' },
    'editor.replace': { combo: 'Ctrl+H', description: 'Find & Replace', category: 'Editor' },
    'editor.toggleComment': { combo: 'Ctrl+/', description: 'Toggle Comment', category: 'Editor' }
  }
};

function cloneDeep(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneDeep(item));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = cloneDeep(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function mergeDeep(target, source) {
  const output = Array.isArray(target) ? target.slice() : { ...target };
  if (!source || typeof source !== 'object') {
    return output;
  }

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      output[key] = value.map((item) => (typeof item === 'object' && item !== null ? cloneDeep(item) : item));
    } else if (value && typeof value === 'object') {
      const base = output[key] && typeof output[key] === 'object' ? output[key] : {};
      output[key] = mergeDeep(base, value);
    } else if (value !== undefined) {
      output[key] = value;
    }
  }

  return output;
}

function setPath(target, pathString, value) {
  const segments = pathString.split('.');
  let current = target;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (!current[segment] || typeof current[segment] !== 'object') {
      current[segment] = {};
    }
    current = current[segment];
  }
  current[segments[segments.length - 1]] = value;
}

function getPath(target, pathString) {
  const segments = pathString.split('.');
  let current = target;
  for (const segment of segments) {
    if (current == null) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

class SettingsService extends EventEmitter {
  constructor(defaults) {
    super();
    this.defaults = cloneDeep(defaults);
    this.settings = cloneDeep(defaults);
    this.settingsPath = null;
    this.initialized = false;
    this.app = null;
  }

  initialize(appInstance) {
    if (this.initialized) {
      return;
    }

    this.app = appInstance;
    try {
      this.settingsPath = path.join(this.app.getPath('userData'), 'bigdaddyg-settings.json');
    } catch (error) {
      console.error('[SettingsService] ❌ Failed to resolve settings path:', error);
      this.settingsPath = path.join(process.cwd(), 'bigdaddyg-settings.json');
    }

    this.load();
    this.initialized = true;
    console.log('[SettingsService] ✅ Initialized at', this.settingsPath);
  }

  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('SettingsService not initialized');
    }
  }

  load() {
    try {
      if (this.settingsPath && fs.existsSync(this.settingsPath)) {
        const raw = fs.readFileSync(this.settingsPath, 'utf8');
        const parsed = JSON.parse(raw || '{}');
        this.settings = mergeDeep(cloneDeep(this.defaults), parsed);
      } else {
        this.settings = cloneDeep(this.defaults);
        this.save();
      }
    } catch (error) {
      console.error('[SettingsService] ❌ Failed to load settings:', error);
      this.settings = cloneDeep(this.defaults);
    }
  }

  save() {
    try {
      if (!this.settingsPath) return;
      fs.mkdirSync(path.dirname(this.settingsPath), { recursive: true });
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf8');
    } catch (error) {
      console.error('[SettingsService] ❌ Failed to save settings:', error);
    }
  }

  getAll() {
    return cloneDeep(this.settings);
  }

  getDefaults() {
    return cloneDeep(this.defaults);
  }

  get(pathString) {
    return cloneDeep(getPath(this.settings, pathString));
  }

  set(pathString, value, options = { save: true, silent: false }) {
    this.ensureInitialized();
    const previous = this.get(pathString);
    setPath(this.settings, pathString, value);
    if (options.save !== false) {
      this.save();
    }
    if (!options.silent) {
      this.emit('updated', {
        type: 'set',
        path: pathString,
        value: cloneDeep(value),
        previous
      });
    }
    return this.getAll();
  }

  update(partialSettings, options = { save: true, silent: false }) {
    this.ensureInitialized();
    this.settings = mergeDeep(this.settings, partialSettings);
    if (options.save !== false) {
      this.save();
    }
    if (!options.silent) {
      this.emit('updated', {
        type: 'update',
        changes: cloneDeep(partialSettings)
      });
    }
    return this.getAll();
  }

  reset(section = null, options = { save: true, silent: false }) {
    this.ensureInitialized();
    if (section) {
      const defaultsSection = getPath(this.defaults, section);
      if (defaultsSection === undefined) {
        throw new Error(`Unknown settings section: ${section}`);
      }
      setPath(this.settings, section, cloneDeep(defaultsSection));
    } else {
      this.settings = cloneDeep(this.defaults);
    }

    if (options.save !== false) {
      this.save();
    }

    if (!options.silent) {
      this.emit('updated', {
        type: 'reset',
        section
      });
    }

    return this.getAll();
  }

  getHotkeys() {
    return cloneDeep(this.settings.hotkeys);
  }

  setHotkey(action, combo, options = { save: true, silent: false }) {
    if (!this.settings.hotkeys[action]) {
      throw new Error(`Unknown hotkey action: ${action}`);
    }
    const entry = { ...this.settings.hotkeys[action], combo };
    this.settings.hotkeys[action] = entry;
    if (options.save !== false) {
      this.save();
    }
    if (!options.silent) {
      this.emit('updated', {
        type: 'hotkey',
        action,
        combo
      });
    }
    return entry;
  }
}

module.exports = new SettingsService(DEFAULT_SETTINGS);
