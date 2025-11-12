(function() {
'use strict';

if (!window.electron || !window.electron.settings) {
    console.warn('[SettingsApplier] ⚠️ Settings API unavailable');
    return;
}

const settingsApi = window.electron.settings;
const state = {
    current: null,
    defaults: null
};

const COLOR_MAP = {
    '--cursor-bg': { key: 'backgroundPrimary', opacityKey: 'window' },
    '--cursor-bg-secondary': { key: 'backgroundSecondary', opacityKey: 'sidePanels' },
    '--cursor-bg-hover': { key: 'accentSoft', opacityKey: 'sidePanels' },
    '--cursor-input-bg': { key: 'backgroundFloating', opacityKey: 'chatPanels' },
    '--cursor-border': { key: 'border' },
    '--cursor-text': { key: 'textPrimary' },
    '--cursor-text-secondary': { key: 'textSecondary' },
    '--cursor-text-muted': { key: 'textSecondary' },
    '--cursor-accent': { key: 'accent' },
    '--cursor-accent-hover': { key: 'accent' },
    '--cursor-jade-light': { key: 'accentSoft' },
    '--cursor-jade-medium': { key: 'accent' },
    '--cursor-jade-dark': { key: 'accent' },
    '--cursor-shadow': { key: 'accentSoft' }
};

function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (value && typeof value === 'object') {
        return Object.keys(value).reduce((acc, key) => {
            acc[key] = clone(value[key]);
            return acc;
        }, {});
    }
    return value;
}

function mergeDeep(target, source) {
    if (!source || typeof source !== 'object') {
        return target;
    }
    const output = Array.isArray(target) ? target.slice() : { ...target };
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            output[key] = mergeDeep(output[key] || {}, value);
        } else {
            output[key] = clone(value);
        }
    }
    return output;
}

function setPath(target, pathString, value) {
    if (!target) return;
    const segments = pathString.split('.');
    let current = target;
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        if (!current[segment] || typeof current[segment] !== 'object') {
            current[segment] = {};
        }
        current = current[segment];
    }
    current[segments[segments.length - 1]] = clone(value);
}

function getPath(target, pathString) {
    const segments = pathString.split('.');
    let current = target;
    for (const segment of segments) {
        if (current == null) return undefined;
        current = current[segment];
    }
    return current;
}

function withAlpha(color, alpha) {
    if (alpha == null) return color;
    if (alpha >= 1) return color;
    if (!color) return color;

    if (/^#/.test(color)) {
        const hex = color.replace('#', '');
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

    if (/rgba?\(/i.test(color)) {
        return color.replace(/rgba?\(([^)]+)\)/, (full, values) => {
            const parts = values.split(',').map(part => part.trim());
            const [r, g, b] = parts;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        });
    }

    return color;
}

function sanitizeValue(value, type = 'string') {
    if (value == null) return null;
    if (type === 'number') {
        const num = parseFloat(value);
        return isNaN(num) ? null : Math.max(0, Math.min(1000, num));
    }
    return String(value).replace(/[<>"'&]/g, '');
}

function applyAppearance(appearance) {
    if (!appearance) return;

    const root = document.documentElement;
    const fontFamily = sanitizeValue(appearance.fontFamily) || "'Segoe UI', sans-serif";
    root.style.setProperty('--app-font-family', fontFamily);
    const fontSize = sanitizeValue(appearance.fontSize, 'number') || 14;
    root.style.setProperty('--app-font-size', `${fontSize}px`);
    const lineHeight = sanitizeValue(appearance.lineHeight, 'number') || 1.6;
    root.style.setProperty('--app-line-height', String(lineHeight));
    const uiScale = sanitizeValue(appearance.uiScale, 'number') || 1;
    root.style.setProperty('--app-ui-scale', String(uiScale));

    const colors = appearance.colors || {};
    const transparency = appearance.transparency || {};
    const transparencyEnabled = Boolean(transparency.enabled);

    Object.entries(COLOR_MAP).forEach(([cssVar, map]) => {
        let value = colors[map.key];
        if (transparencyEnabled && map.opacityKey && transparency[map.opacityKey] != null) {
            value = withAlpha(value, transparency[map.opacityKey]);
        }
        if (value) {
            root.style.setProperty(cssVar, value);
        }
    });

    // Editor-specific font
    if (appearance.monospaceFont) {
        root.style.setProperty('--app-monospace-font', appearance.monospaceFont);
    }

    // Apply editor options
    if (window.editor && typeof window.editor.updateOptions === 'function') {
        try {
            const editorSettings = appearance.editor || {};
            const editorOptions = {
                fontFamily: editorSettings.fontFamily || appearance.monospaceFont || appearance.fontFamily,
                fontSize: editorSettings.fontSize || appearance.fontSize || 15,
                lineHeight: editorSettings.lineHeight || Math.round((appearance.fontSize || 15) * (appearance.lineHeight || 1.6)),
                wordWrap: editorSettings.wordWrap || 'on',
                lineNumbers: editorSettings.lineNumbers || 'on',
                tabSize: editorSettings.tabSize || 4,
                insertSpaces: editorSettings.insertSpaces !== undefined ? editorSettings.insertSpaces : true,
                detectIndentation: editorSettings.detectIndentation !== undefined ? editorSettings.detectIndentation : true,
                roundedSelection: editorSettings.roundedSelection !== undefined ? editorSettings.roundedSelection : true,
                scrollBeyondLastLine: editorSettings.scrollBeyondLastLine !== undefined ? editorSettings.scrollBeyondLastLine : false,
                automaticLayout: editorSettings.automaticLayout !== undefined ? editorSettings.automaticLayout : true,
                quickSuggestions: editorSettings.quickSuggestions !== undefined ? editorSettings.quickSuggestions : true,
                quickSuggestionsDelay: editorSettings.quickSuggestionsDelay || 150,
                suggestOnTriggerCharacters: editorSettings.suggestOnTriggerCharacters !== undefined ? editorSettings.suggestOnTriggerCharacters : true,
                acceptSuggestionOnEnter: editorSettings.acceptSuggestionOnEnter || 'on',
                tabCompletion: editorSettings.tabCompletion || 'on',
                parameterHints: editorSettings.parameterHints || { enabled: true, cycle: false },
                matchBrackets: editorSettings.matchBrackets || 'always',
                bracketPairColorization: editorSettings.bracketPairColorization || { enabled: true },
                folding: editorSettings.folding !== undefined ? editorSettings.folding : true,
                foldingStrategy: editorSettings.foldingStrategy || 'indentation',
                showFoldingControls: editorSettings.showFoldingControls || 'mouseover',
                occurrencesHighlight: editorSettings.occurrencesHighlight !== undefined ? editorSettings.occurrencesHighlight : false,
                renderValidationDecorations: editorSettings.renderValidationDecorations || 'on',
                renderLineHighlight: editorSettings.renderLineHighlight || 'line',
                renderWhitespace: editorSettings.renderWhitespace || 'selection',
                smoothScrolling: editorSettings.smoothScrolling !== undefined ? editorSettings.smoothScrolling : true,
                cursorBlinking: editorSettings.cursorBlinking || 'smooth',
                cursorSmoothCaretAnimation: editorSettings.cursorSmoothCaretAnimation !== undefined ? editorSettings.cursorSmoothCaretAnimation : true,
                largeFileOptimizations: editorSettings.largeFileOptimizations !== undefined ? editorSettings.largeFileOptimizations : true,
                maxTokenizationLineLength: editorSettings.maxTokenizationLineLength || 20000,
                codeLens: editorSettings.codeLens !== undefined ? editorSettings.codeLens : false,
                colorDecorators: editorSettings.colorDecorators !== undefined ? editorSettings.colorDecorators : false,
                links: editorSettings.links !== undefined ? editorSettings.links : false,
                minimap: editorSettings.minimap || { enabled: true, maxColumn: 120, renderCharacters: false },
                scrollbar: editorSettings.scrollbar || {
                    vertical: 'visible',
                    horizontal: 'visible',
                    useShadows: false,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    verticalScrollbarSize: 14,
                    horizontalScrollbarSize: 14
                }
            };
            
            window.editor.updateOptions(editorOptions);
            
            // Apply theme if specified
            if (editorSettings.theme && window.monaco && window.monaco.editor) {
                try {
                    window.monaco.editor.setTheme(editorSettings.theme);
                } catch (themeError) {
                    console.warn('[SettingsApplier] ⚠️ Failed to set editor theme:', themeError);
                }
            }
        } catch (error) {
            console.warn('[SettingsApplier] ⚠️ Failed to update editor options:', error);
        }
    }

    const bgColor = sanitizeValue(colors.backgroundPrimary) || getComputedStyle(root).getPropertyValue('--cursor-bg');
    document.body.style.backgroundColor = bgColor;
}

function applyLayout(layout) {
    if (!layout) return;
    document.body.classList.toggle('layout-no-overlap', layout.allowOverlap === false);
    const root = document.documentElement;
    const spacing = layout.panelSpacing ?? 12;
    root.style.setProperty('--panel-spacing', `${spacing}px`);
    if (layout.sidebarWidth) {
        root.style.setProperty('--sidebar-width', `${layout.sidebarWidth}px`);
    }
    if (layout.chatWidth) {
        root.style.setProperty('--chat-sidebar-width', `${layout.chatWidth}px`);
    }
    
    // Apply snap-to-edges setting
    if (layout.snapToEdges !== undefined) {
        document.body.classList.toggle('layout-snap-to-edges', layout.snapToEdges);
    }
}

function applyTransparency(transparency) {
    if (!transparency) return;
    
    const root = document.documentElement;
    const enabled = Boolean(transparency.enabled);
    
    // Apply transparency CSS variables
    if (enabled) {
        root.style.setProperty('--window-opacity', String(transparency.window ?? 0.95));
        root.style.setProperty('--side-panel-opacity', String(transparency.sidePanels ?? 0.92));
        root.style.setProperty('--bottom-panel-opacity', String(transparency.bottomPanel ?? 0.96));
        root.style.setProperty('--chat-panel-opacity', String(transparency.chatPanels ?? 0.9));
        
        // Apply to window if in Electron
        if (window.electron && window.electron.setWindowOpacity) {
            try {
                window.electron.setWindowOpacity(transparency.window ?? 0.95);
            } catch (error) {
                console.warn('[SettingsApplier] ⚠️ Failed to set window opacity:', error);
            }
        }
        
        // Apply to panels
        const sidebar = document.getElementById('sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const bottomPanel = document.getElementById('bottom-panel');
        
        if (sidebar) {
            sidebar.style.opacity = String(transparency.sidePanels ?? 0.92);
        }
        if (rightSidebar) {
            rightSidebar.style.opacity = String(transparency.chatPanels ?? 0.9);
        }
        if (bottomPanel) {
            bottomPanel.style.opacity = String(transparency.bottomPanel ?? 0.96);
        }
    } else {
        // Reset to opaque
        root.style.setProperty('--window-opacity', '1');
        root.style.setProperty('--side-panel-opacity', '1');
        root.style.setProperty('--bottom-panel-opacity', '1');
        root.style.setProperty('--chat-panel-opacity', '1');
        
        const sidebar = document.getElementById('sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const bottomPanel = document.getElementById('bottom-panel');
        
        if (sidebar) sidebar.style.opacity = '1';
        if (rightSidebar) rightSidebar.style.opacity = '1';
        if (bottomPanel) bottomPanel.style.opacity = '1';
    }
}

function applySnapshot(settings) {
    if (!settings) return;
    state.current = clone(settings);
    window.__appSettings = state.current;
    applyAppearance(settings.appearance);
    applyLayout(settings.layout);
    if (settings.appearance && settings.appearance.transparency) {
        applyTransparency(settings.appearance.transparency);
    }
}

function handleUpdateEvent(event) {
    if (!event) return;
    if (!state.current) {
        // Fallback to full reload if snapshot missing
        settingsApi.getAll().then((res) => {
            if (res?.success) {
                applySnapshot(res.settings);
            }
        });
        return;
    }

    switch (event.type) {
        case 'set':
            if (event.path) {
                setPath(state.current, event.path, event.value);
            }
            break;
        case 'update':
            if (event.changes) {
                state.current = mergeDeep(state.current || {}, event.changes);
            }
            break;
        case 'reset':
            if (event.section && state.defaults) {
                const defaultsSection = getPath(state.defaults, event.section);
                if (defaultsSection !== undefined) {
                    setPath(state.current, event.section, clone(defaultsSection));
                }
            } else if (state.defaults) {
                state.current = clone(state.defaults);
            }
            break;
        case 'hotkey':
            if (event.action) {
                setPath(state.current, `hotkeys.${event.action}`, {
                    ...(getPath(state.current, `hotkeys.${event.action}`) || {}),
                    combo: event.combo
                });
            }
            break;
        default:
            break;
    }

    applyAppearance(state.current.appearance);
    applyLayout(state.current.layout);
    if (state.current.appearance && state.current.appearance.transparency) {
        applyTransparency(state.current.appearance.transparency);
    }
}

settingsApi.getDefaults().then((res) => {
    if (res?.success) {
        state.defaults = clone(res.settings);
    }
});

settingsApi.getAll().then((res) => {
    if (res?.success) {
        applySnapshot(res.settings);
    }
});

settingsApi.onBootstrap((settings) => {
    applySnapshot(settings);
});

settingsApi.onDidChange((event) => {
    handleUpdateEvent(event);
});

})();
