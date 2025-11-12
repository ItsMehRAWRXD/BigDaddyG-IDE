/**
 * BigDaddyG IDE - Theme Manager
 * Manages IDE themes and appearance
 */

// Browser-safe: Check if we're in Node.js or Browser
const isNodeEnv = typeof process !== 'undefined' && process.versions && process.versions.node;
const themeFs = isNodeEnv ? require('fs') : null;
const themePath = isNodeEnv ? require('path') : null;

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        
        this.themes = {
            dark: {
                name: 'Dark',
                colors: {
                    background: '#1e1e1e',
                    foreground: '#d4d4d4',
                    accent: '#007acc',
                    sidebar: '#252526',
                    editor: '#1e1e1e',
                    panel: '#1e1e1e',
                    border: '#3c3c3c',
                    selection: '#264f78',
                    lineHighlight: '#2a2a2a',
                    comment: '#6a9955',
                    string: '#ce9178',
                    keyword: '#569cd6',
                    function: '#dcdcaa',
                    variable: '#9cdcfe',
                    error: '#f48771',
                    warning: '#cca700'
                }
            },
            light: {
                name: 'Light',
                colors: {
                    background: '#ffffff',
                    foreground: '#000000',
                    accent: '#0066cc',
                    sidebar: '#f3f3f3',
                    editor: '#ffffff',
                    panel: '#ffffff',
                    border: '#e7e7e7',
                    selection: '#add6ff',
                    lineHighlight: '#f5f5f5',
                    comment: '#008000',
                    string: '#a31515',
                    keyword: '#0000ff',
                    function: '#795e26',
                    variable: '#001080',
                    error: '#ff0000',
                    warning: '#ff8800'
                }
            },
            'high-contrast': {
                name: 'High Contrast',
                colors: {
                    background: '#000000',
                    foreground: '#ffffff',
                    accent: '#00ffff',
                    sidebar: '#000000',
                    editor: '#000000',
                    panel: '#000000',
                    border: '#6fc3df',
                    selection: '#00ffff',
                    lineHighlight: '#1a1a1a',
                    comment: '#7ca668',
                    string: '#ce9178',
                    keyword: '#569cd6',
                    function: '#dcdcaa',
                    variable: '#9cdcfe',
                    error: '#ff0000',
                    warning: '#ffff00'
                }
            },
            monokai: {
                name: 'Monokai',
                colors: {
                    background: '#272822',
                    foreground: '#f8f8f2',
                    accent: '#66d9ef',
                    sidebar: '#1e1f1c',
                    editor: '#272822',
                    panel: '#272822',
                    border: '#3e3d32',
                    selection: '#49483e',
                    lineHighlight: '#3e3d32',
                    comment: '#75715e',
                    string: '#e6db74',
                    keyword: '#f92672',
                    function: '#a6e22e',
                    variable: '#f8f8f2',
                    error: '#f92672',
                    warning: '#fd971f'
                }
            }
        };
        
        console.log('[ThemeManager] Initialized');
    }
    
    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }
    
    /**
     * Set theme
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyTheme();
            console.log(`[ThemeManager] Theme set to: ${themeName}`);
            return true;
        }
        return false;
    }
    
    /**
     * Apply theme to UI
     */
    applyTheme() {
        const theme = this.getCurrentTheme();
        
        // Generate CSS variables
        const cssVars = Object.entries(theme.colors)
            .map(([key, value]) => `--theme-${key}: ${value};`)
            .join('\n    ');
        
        const css = `
:root {
    ${cssVars}
}

body {
    background-color: var(--theme-background);
    color: var(--theme-foreground);
}

.sidebar {
    background-color: var(--theme-sidebar);
}

.editor {
    background-color: var(--theme-editor);
}

.panel {
    background-color: var(--theme-panel);
}

.border {
    border-color: var(--theme-border);
}

.selection {
    background-color: var(--theme-selection);
}

.line-highlight {
    background-color: var(--theme-lineHighlight);
}
        `;
        
        return css;
    }
    
    /**
     * Get all available themes
     */
    getThemes() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name
        }));
    }
    
    /**
     * Get theme CSS for injection
     */
    getThemeCSS() {
        return this.applyTheme();
    }
}

// Browser-safe module export
try {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
  }
} catch (e) {
  // Browser environment - module not available
}

// Always expose to window for renderer process
if (typeof window !== 'undefined') {
  window.ThemeManager = ThemeManager;
}
