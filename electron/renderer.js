/**
 * BigDaddyG IDE - Renderer Process
 * Monaco Editor integration + AI Copilot features
 */

// ============================================================================
// MONACO EDITOR SETUP
// ============================================================================

let editor;
let openTabs = {};
let activeTab = 'welcome';
let tabCounter = 0; // For generating unique tab IDs
const MAX_TABS = 100; // Configurable limit (can be changed in settings)

const WELCOME_STORAGE_KEY = 'bigdaddyg-welcome-dismissed';
const FULLSCREEN_CLASS = 'ide-fullscreen';

// Expose openTabs globally for tab-system.js to check file tabs
window.openTabs = openTabs;

// Expose file operations globally for AI agentic features
window.agenticFileOps = {
    createNewTab: null, // Will be set after function is defined
    createFile: null, // Will be set when background-agent-manager loads
    openFile: null,   // Will be set when file-explorer loads
    saveFile: null,    // Will be set below
    closeTab: null,    // Will be set after function is defined
    switchTab: null,    // Will be set after function is defined
    
    // Safe wrapper to call functions (prevents race condition crashes)
    async safeCall(method, ...args) {
        let attempts = 0;
        const maxAttempts = 20; // 10 seconds max wait (20 * 500ms)
        
        while (!this[method] && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!this[method]) {
            console.error(`[BigDaddyG] ❌ Function ${method} not available after ${maxAttempts * 500}ms`);
            throw new Error(`AgenticFileOps.${method} not available`);
        }
        
        return this[method](...args);
    }
};

// Set the functions after they're defined
setTimeout(() => {
    if (typeof createNewTab !== 'undefined') {
        window.agenticFileOps.createNewTab = createNewTab;
        console.log('[BigDaddyG] ✅ createNewTab exposed to agentic API');
    }
    if (typeof closeTab !== 'undefined') {
        window.agenticFileOps.closeTab = closeTab;
        console.log('[BigDaddyG] ✅ closeTab exposed to agentic API');
    }
    if (typeof switchTab !== 'undefined') {
        window.agenticFileOps.switchTab = switchTab;
        console.log('[BigDaddyG] ✅ switchTab exposed to agentic API');
    }
    if (typeof renderTabs !== 'undefined') {
        window.renderTabs = renderTabs;
        console.log('[BigDaddyG] ✅ renderTabs exposed globally');
    }
    if (typeof switchTab !== 'undefined') {
        window.switchTab = switchTab;
        console.log('[BigDaddyG] ✅ switchTab exposed globally');
    }
}, 100);

function initWelcomeMessage() {
    const welcomeEl = document.getElementById('welcome-message');
    if (!welcomeEl) {
        return;
    }
    
    const dismissed = localStorage.getItem(WELCOME_STORAGE_KEY) === 'true';
    if (dismissed) {
        welcomeEl.remove();
    }
}

function dismissWelcomeMessage() {
    const welcomeEl = document.getElementById('welcome-message');
    if (welcomeEl) {
        welcomeEl.remove();
    }
    localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
}

window.dismissWelcomeMessage = dismissWelcomeMessage;

function handleFullscreenChange() {
    const isFullscreen = Boolean(document.fullscreenElement);
    document.body.classList.toggle(FULLSCREEN_CLASS, isFullscreen);
}

window.addEventListener('fullscreenchange', handleFullscreenChange);

// Load Monaco CSS first, then initialize
function loadMonacoCSS() {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './node_modules/monaco-editor/min/vs/style.css';
        
        link.onload = () => {
            console.log('[BigDaddyG] ✅ Monaco CSS loaded');
            resolve();
        };
        
        link.onerror = () => {
            alert('Monaco CSS missing – editor will not work. Check console for details.');
            console.error('[BigDaddyG] ❌ Monaco CSS 404 – bootstrap aborted');
            reject(new Error('Monaco CSS failed to load'));
        };
        
        document.head.appendChild(link);
    });
}

// Monaco Editor initialization - Called when Monaco loads from index.html
window.onMonacoLoad = function() {
    console.log('[BigDaddyG] 🎨 Monaco loaded, loading CSS first...');
    clearTimeout(window.monacoTimeout); // Cancel timeout if Monaco loads
    
    loadMonacoCSS().then(() => {
        console.log('[BigDaddyG] 🎨 CSS loaded, initializing editor...');
        initMonacoEditor();
    }).catch(error => {
        console.error('[BigDaddyG] ❌ Failed to load Monaco CSS:', error);
        showMonacoError('Monaco CSS failed to load');
    });
};

// Show Monaco error with helpful message
function showMonacoError(message) {
    const container = document.getElementById('monaco-container');
    if (container) {
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #1e1e1e; color: #fff; padding: 40px; text-align: center; flex-direction: column;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="color: #ff6b6b; margin-bottom: 20px;">Monaco Editor Bootstrap Failed</h2>
                <p style="margin-bottom: 20px; max-width: 600px; line-height: 1.6;">
                    ${message}
                </p>
                <button onclick="location.reload()" style="padding: 12px 30px; background: #00d4ff; color: #000; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
                    🔄 Retry Loading
                </button>
            </div>
        `;
    }
}

// Also try immediate init if Monaco is already loaded
if (typeof monaco !== 'undefined') {
    console.log('[BigDaddyG] 🎨 Monaco already available, initializing...');
    window.onMonacoLoad();
} else {
    // Set timeout fallback in case Monaco fails to load
    console.log('[BigDaddyG] ⏳ Waiting for Monaco to load (15s timeout)...');
    window.monacoTimeout = setTimeout(() => {
        if (typeof monaco === 'undefined') {
            console.error('[BigDaddyG] ❌ Monaco failed to load after 15s!');
            showMonacoError('Monaco Editor failed to load. Check console for details.');
        }
    }, 15000); // 15 second timeout
}

function initMonacoEditor() {
    console.log('[BigDaddyG] 🎨 Initializing Monaco Editor...');
    
    // ========================================================================
    // CRITICAL: Wait for Monaco CSS to load first
    // ========================================================================
    if (!window.__monacoReady) {
        console.log('[BigDaddyG] ⏳ Waiting for Monaco CSS to load...');
        setTimeout(initMonacoEditor, 100);
        return;
    }
    
    // Ensure editor container exists and is visible
    const container = document.getElementById('monaco-container');
    if (!container || !container.offsetParent) {
        console.warn('[BigDaddyG] ⚠️ monaco-container not in rendered DOM; retry in 100ms');
        setTimeout(initMonacoEditor, 100);
        return;
    }
    
    console.log('[BigDaddyG] ✅ CSS loaded, container ready - creating editor instance');
    
    const appearanceSettings = window.__appSettings?.appearance || {};
    const editorFontSize = appearanceSettings.fontSize || 14;
    const editorLineHeight = Math.round(editorFontSize * (appearanceSettings.lineHeight || 1.6));
    const editorFontFamily = appearanceSettings.monospaceFont || appearanceSettings.fontFamily || 'Consolas, "Courier New", monospace';
    
    // Define custom theme with jade/cyan selection
    monaco.editor.defineTheme('bigdaddyg-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            'editor.selectionBackground': '#00d4ff40', // Jade/Cyan with transparency
            'editor.selectionHighlightBackground': '#00d4ff20',
            'editor.inactiveSelectionBackground': '#00d4ff15',
            'editor.lineHighlightBackground': '#00d4ff08',
            'editorCursor.foreground': '#00d4ff',
            'editor.findMatchBackground': '#00d4ff30',
            'editor.findMatchHighlightBackground': '#00d4ff20',
            'editor.wordHighlightBackground': '#00d4ff15',
            'editor.wordHighlightStrongBackground': '#00d4ff25'
        }
    });
    
    // Create Monaco Editor instance with performance optimizations
    editor = monaco.editor.create(container, {
        value: getWelcomeMessage(),
        language: 'markdown',
        theme: 'bigdaddyg-dark', // Use custom theme
        
        // Editor options
        fontSize: editorFontSize,
        lineHeight: editorLineHeight,
        fontFamily: editorFontFamily,
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false, // OPTIMIZED: Reduce render area
        minimap: {
            enabled: true,
            maxColumn: 120, // Limit minimap width for performance
            renderCharacters: false // Faster minimap rendering
        },
        automaticLayout: true,
        
        // CRITICAL: Enable scrolling
        scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            useShadows: false, // Disable shadows for performance
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14
        },
        
        // Advanced features
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordWrap: 'on',
        wrappingIndent: 'indent',
        
        // Copilot-like features
        quickSuggestions: true,
        quickSuggestionsDelay: 150, // Slightly slower for performance
        parameterHints: {
            enabled: true,
            cycle: false // Reduce complexity
        },
        
        // Bracket matching
        matchBrackets: 'always',
        bracketPairColorization: {
            enabled: true
        },
        
        // PERFORMANCE OPTIMIZATIONS
        folding: true, // Enable code folding
        foldingStrategy: 'indentation', // Faster than 'auto'
        showFoldingControls: 'mouseover', // Only show when needed
        occurrencesHighlight: false, // Disable for large files
        renderValidationDecorations: 'on', // But keep validation
        renderLineHighlight: 'line', // Simple line highlight
        renderWhitespace: 'selection', // Only show in selection
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: true,
        
        // Large file optimizations
        largeFileOptimizations: true,
        maxTokenizationLineLength: 20000,
        
        // Disable expensive features
        codeLens: false,
        colorDecorators: false,
        links: false, // Disable link detection for speed
        
        // Memory management
        domReadOnly: false,
        readOnly: false,
        renderValidationDecorations: 'editable'
    });
    
    // Expose editor globally for tests and external access
    window.editor = editor;
    window.monacoEditor = editor; // Also expose as monacoEditor
    
    // Store initial tab
    openTabs['welcome'] = {
        id: 'welcome',
        filename: 'Welcome.md',
        language: 'markdown',
        content: editor.getValue(),
        icon: '📄'
    };
    
    // Set up context menu for AI copilot
    setupContextMenu();
    
    // Initialize ultra-fast autocomplete
    if (typeof AutocompleteEngine !== 'undefined') {
        window.autocompleteEngine = new AutocompleteEngine(editor, 'http://localhost:11441');
        console.log('[BigDaddyG] ⚡ Autocomplete engine initialized');
    }
    
    // Initialize voice coding
    if (typeof VoiceCodingEngine !== 'undefined') {
        window.voiceCoding = new VoiceCodingEngine(editor);
        window.voiceCodingEngine = window.voiceCoding; // Expose as both names
        console.log('[BigDaddyG] 🎤 Voice coding engine initialized');
        console.log('[BigDaddyG] 💡 Say "Hey BigDaddy" to start or press Ctrl+Shift+V');
    } else {
        console.warn('[BigDaddyG] ⚠️ Voice coding not available yet - module still loading');
    }
    
    // Listen for content changes
    editor.onDidChangeModelContent(() => {
        if (openTabs[activeTab]) {
            openTabs[activeTab].content = editor.getValue();
        }
    });
    
    console.log('[BigDaddyG] ✅ Monaco Editor ready');
}

// ============================================================================
// WELCOME MESSAGE
// ============================================================================

function getWelcomeMessage() {
    return `# 🌌 Welcome to BigDaddyG IDE Professional Edition

## Your AI-Powered Development Environment

**Features:**
- ✅ **Monaco Editor** - Same engine as VS Code
- ✅ **Syntax Highlighting** - 100+ languages
- ✅ **AI Copilot** - Right-click for AI suggestions
- ✅ **Multi-Tab Editing** - Work on multiple files
- ✅ **File System Integration** - Save and load real files
- ✅ **1M Context Window** - AI remembers everything
- ✅ **Trained on ASM/Security** - Specialized expertise

## Quick Start

### 1. Create a new file
Press \`Ctrl+N\` or use File → New File

### 2. Write some code
Try writing a function (JavaScript, Python, C++, etc.)

### 3. Get AI help
Select your code → Right-click → Choose AI action:
- 📖 **Explain** - Understand what the code does
- 🔧 **Fix** - Find and fix bugs
- ⚡ **Optimize** - Improve performance
- 🔄 **Refactor** - Better structure
- 🧪 **Generate Tests** - Create unit tests
- 📝 **Add Docs** - Write documentation

### 4. Accept suggestions
When AI generates code:
- ✅ **Apply** - Replace your selection
- ➕ **Insert** - Add below selection
- ❌ **Reject** - Dismiss suggestion

## 🎹 Essential Keyboard Shortcuts

### 📁 File Operations
| Shortcut | Action |
|----------|--------|
| \`Ctrl+N\` | New File |
| \`Ctrl+O\` | Open File |
| \`Ctrl+S\` | Save File |
| \`Ctrl+Shift+S\` | Save As... |
| \`Ctrl+K Ctrl+S\` | **Save All Files** |

### 📑 Tab Management
| Shortcut | Action |
|----------|--------|
| \`Ctrl+Tab\` | Next Tab |
| \`Ctrl+Shift+Tab\` | Previous Tab |
| \`Ctrl+W\` | Close Tab |
| \`Ctrl+1-9\` | Jump to Tab 1-9 |
| \`Alt+Left/Right\` | Navigate Tabs |

### 🤖 AI & Commands
| Shortcut | Action |
|----------|--------|
| \`Ctrl+L\` | Open AI Chat |
| \`Ctrl+Enter\` | Send Message |
| \`Ctrl+Shift+P\` | **Command Palette** |
| \`Ctrl+Shift+M\` | Memory Dashboard |

### 💻 Terminal
| Shortcut | Action |
|----------|--------|
| \`Ctrl+\`\` | Toggle Terminal |
| \`Ctrl+J\` | Open/Close Terminal |

### ✍️ Code Editing
| Shortcut | Action |
|----------|--------|
| \`Ctrl+F\` | Find |
| \`Ctrl+H\` | Find & Replace |
| \`Ctrl+/\` | Toggle Comment |

> 💡 **Pro Tip:** Press \`Ctrl+Shift+P\` to search files and run commands!

## Example: Write Assembly Code

\`\`\`asm
; x86 assembly - Add two numbers
section .text
global _start

_start:
    mov eax, 5      ; Load 5 into EAX
    mov ebx, 3      ; Load 3 into EBX
    add eax, ebx    ; EAX = EAX + EBX
    
    ; Exit
    mov eax, 1      ; sys_exit
    xor ebx, ebx    ; return 0
    int 0x80
\`\`\`

**Select the code above and right-click → Explain** to see BigDaddyG in action!

## Chat with BigDaddyG

Use the AI panel on the right to:
- Ask programming questions
- Get code suggestions
- Debug issues
- Learn new concepts

**Try asking:**
- "Write a binary search in C++"
- "Explain how AES encryption works"
- "Create a polymorphic shellcode"
- "Optimize this bubble sort algorithm"

---

**🚀 Start coding and let BigDaddyG help you build amazing things!**
`;
}

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function createNewTab(filename, language, content = '', filePath = null) {
    // Check if we've reached the tab limit
    const currentTabCount = Object.keys(openTabs).length;
    if (currentTabCount >= MAX_TABS) {
        const proceed = confirm(
            `⚠️ You have ${currentTabCount} tabs open (limit: ${MAX_TABS}).\n\n` +
            `Opening more tabs may slow down the IDE.\n\n` +
            `Continue anyway? (You can close unused tabs with the × button)`
        );
        if (!proceed) {
            console.log('[BigDaddyG] ⚠️ Tab creation cancelled - limit reached');
            return null;
        }
    }
    
    const id = `file_${++tabCounter}_${Date.now()}`;
    const icon = getFileIcon(filename);
    
    openTabs[id] = {
        id: id,
        filename: filename,
        language: language,
        content: content,
        icon: icon,
        filePath: filePath,  // Track the actual file path on disk
        created: Date.now(),
        modified: Date.now(),
        isDirty: false  // Track if file has unsaved changes
    };
    
    renderTabs();
    switchTab(id);
    
    console.log(`[BigDaddyG] 📄 Created tab ${currentTabCount + 1}/${MAX_TABS}: ${filename}`);
    return id;
}

function switchTab(tabId) {
    if (!openTabs[tabId]) {
        console.warn(`[BigDaddyG] ⚠️ Tab ${tabId} not found`);
        return;
    }
    
    // Ensure editor exists
    if (!editor) {
        console.error('[BigDaddyG] ❌ Editor not initialized!');
        return;
    }
    
    // Save current tab content
    if (openTabs[activeTab] && editor) {
        try {
            openTabs[activeTab].content = editor.getValue();
        } catch (error) {
            console.warn('[BigDaddyG] ⚠️ Could not save current tab content:', error);
        }
    }
    
    // Switch to new tab
    activeTab = tabId;
    const tab = openTabs[tabId];
    
    try {
        // Dispose old model to prevent memory leak
        const oldModel = editor.getModel();
        if (oldModel && oldModel !== tab.model) {
            oldModel.dispose();
        }
        
        // Create or reuse model
        if (!tab.model || tab.model.isDisposed()) {
            tab.model = monaco.editor.createModel(tab.content, tab.language);
            
            // Track changes for dirty state
            tab.model.onDidChangeContent(() => {
                if (openTabs[activeTab]) {
                    openTabs[activeTab].isDirty = true;
                    // Debounce render for performance
                    clearTimeout(window.tabRenderTimeout);
                    window.tabRenderTimeout = setTimeout(() => {
                        renderTabs();
                    }, 300);
                }
            });
        } else {
            // Update existing model content if changed
            if (tab.model.getValue() !== tab.content) {
                tab.model.setValue(tab.content);
            }
        }
        
        editor.setModel(tab.model);
        
        // Update UI
        renderTabs();
        
        console.log(`[BigDaddyG] 📝 Switched to: ${tab.filename}`);
    } catch (error) {
        console.error('[BigDaddyG] ❌ Error switching tab:', error);
    }
}

function closeTab(event, tabId) {
    if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
    }
    
    const tab = openTabs[tabId];
    
    // Check if tab has unsaved changes
    if (tab && tab.isDirty) {
        const proceed = confirm(`"${tab.filename}" has unsaved changes. Close anyway?`);
        if (!proceed) {
            console.log(`[BigDaddyG] ℹ️ Tab close cancelled by user`);
            return;
        }
    }
    
    console.log(`[BigDaddyG] 🗑️ Closing tab: ${tab?.filename || tabId}`);
    
    // Dispose Monaco model to prevent memory leak
    if (tab && tab.model && !tab.model.isDisposed()) {
        tab.model.dispose();
        console.log(`[BigDaddyG] 🧹 Disposed model for: ${tab.filename}`);
    }
    
    delete openTabs[tabId];
    
    // If this was the last tab, create a new Welcome tab
    if (Object.keys(openTabs).length === 0) {
        console.log('[BigDaddyG] 📄 Last tab closed, creating new Welcome tab...');
        createNewTab('Welcome.md', 'markdown', getWelcomeMessage(), null);
        return;
    }
    
    // Switch to another tab if this was active
    if (activeTab === tabId) {
        const remainingTabs = Object.keys(openTabs);
        switchTab(remainingTabs[remainingTabs.length - 1]); // Switch to most recent
    }
    
    renderTabs();
}

// Navigation helpers
function nextTab() {
    const tabs = Object.keys(openTabs);
    if (tabs.length === 0) return;
    
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    switchTab(tabs[nextIndex]);
}

function previousTab() {
    const tabs = Object.keys(openTabs);
    if (tabs.length === 0) return;
    
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    switchTab(tabs[prevIndex]);
}

function closeAllTabs() {
    if (!confirm(`Close all ${Object.keys(openTabs).length} tabs?`)) return;
    
    const welcomeTab = Object.keys(openTabs)[0];
    Object.keys(openTabs).forEach(id => {
        if (id !== welcomeTab) delete openTabs[id];
    });
    
    switchTab(welcomeTab);
    renderTabs();
    console.log('[BigDaddyG] 🗑️ Closed all tabs except welcome');
}

function closeOtherTabs() {
    if (!confirm(`Close all tabs except "${openTabs[activeTab]?.filename}"?`)) return;
    
    const keepTab = activeTab;
    Object.keys(openTabs).forEach(id => {
        if (id !== keepTab) delete openTabs[id];
    });
    
    renderTabs();
    console.log(`[BigDaddyG] 🗑️ Closed other tabs, kept: ${openTabs[keepTab].filename}`);
}

function renderTabs() {
    const tabBar = document.getElementById('tab-bar');
    
    // Safety check - if tab-bar doesn't exist, skip rendering
    if (!tabBar) {
        console.warn('[BigDaddyG] ⚠️ Tab bar not found - skipping tab render');
        return;
    }
    
    tabBar.innerHTML = '';
    
    // Get sorted tabs (by creation time)
    const sortedTabs = Object.values(openTabs).sort((a, b) => 
        (a.created || 0) - (b.created || 0)
    );
    
    sortedTabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = 'editor-tab' + (tab.id === activeTab ? ' active' : '');
        tabEl.setAttribute('data-file', tab.id);
        tabEl.onclick = () => switchTab(tab.id);
        
        // Show full filename on hover
        const dirtyStatus = tab.isDirty ? ' (unsaved)' : '';
        tabEl.title = `${tab.filename}${dirtyStatus}\nCreated: ${new Date(tab.created).toLocaleString()}`;
        
        // Add dirty indicator (unsaved changes)
        const dirtyIndicator = tab.isDirty ? '<span style="color: var(--orange); margin-right: 4px;">●</span>' : '';
        
        tabEl.innerHTML = `
            <span>${tab.icon}</span>
            ${dirtyIndicator}
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis;">${tab.filename}</span>
            <span class="close-btn" onclick="closeTab(event, '${tab.id}')">×</span>
        `;
        
        tabBar.appendChild(tabEl);
    });
    
    // Update tab counter badge
    updateTabCountBadge();
    
    // Scroll active tab into view
    setTimeout(() => {
        const activeTabEl = tabBar.querySelector('.editor-tab.active');
        if (activeTabEl) {
            activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, 50);
}

function updateTabCountBadge() {
    // Remove old badge if exists
    let badge = document.querySelector('.tab-count-badge');
    if (badge) badge.remove();
    
    const tabCount = Object.keys(openTabs).length;
    
    // Only show badge if we have multiple tabs
    if (tabCount > 1) {
        badge = document.createElement('div');
        badge.className = 'tab-count-badge';
        badge.textContent = `${tabCount} / ${MAX_TABS} tabs`;
        
        // Color code based on usage
        if (tabCount >= MAX_TABS * 0.9) {
            badge.style.background = 'rgba(255, 71, 87, 0.2)';
            badge.style.borderColor = 'var(--red)';
            badge.style.color = 'var(--red)';
        } else if (tabCount >= MAX_TABS * 0.7) {
            badge.style.background = 'rgba(255, 107, 53, 0.2)';
            badge.style.borderColor = 'var(--orange)';
            badge.style.color = 'var(--orange)';
        }
        
        document.body.appendChild(badge);
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        js: '📜', ts: '📘', jsx: '⚛️', tsx: '⚛️',
        py: '🐍', java: '☕', cpp: '⚙️', c: '🔧',
        rs: '🦀', go: '🐹', rb: '💎', php: '🐘',
        html: '🌐', css: '🎨', json: '📋', xml: '📄',
        md: '📝', txt: '📄', asm: '⚡', s: '⚡',
        sql: '🗄️', sh: '💻', bat: '💻', ps1: '💻'
    };
    return icons[ext] || '📄';
}

// ============================================================================
// AI COPILOT - CONTEXT MENU
// ============================================================================

function setupContextMenu() {
    editor.addAction({
        id: 'ai-explain',
        label: '📖 Explain Code',
        contextMenuGroupId: 'bigdaddyg',
        contextMenuOrder: 1,
        run: function(ed) {
            const selection = ed.getSelection();
            const text = ed.getModel().getValueInRange(selection);
            if (text) {
                aiAction('explain', text);
            }
        }
    });
    
    editor.addAction({
        id: 'ai-fix',
        label: '🔧 Fix Code',
        contextMenuGroupId: 'bigdaddyg',
        contextMenuOrder: 2,
        run: function(ed) {
            const selection = ed.getSelection();
            const text = ed.getModel().getValueInRange(selection);
            if (text) {
                aiAction('fix', text);
            }
        }
    });
    
    editor.addAction({
        id: 'ai-optimize',
        label: '⚡ Optimize Code',
        contextMenuGroupId: 'bigdaddyg',
        contextMenuOrder: 3,
        run: function(ed) {
            const selection = ed.getSelection();
            const text = ed.getModel().getValueInRange(selection);
            if (text) {
                aiAction('optimize', text);
            }
        }
    });
    
    editor.addAction({
        id: 'ai-refactor',
        label: '🔄 Refactor Code',
        contextMenuGroupId: 'bigdaddyg',
        contextMenuOrder: 4,
        run: function(ed) {
            const selection = ed.getSelection();
            const text = ed.getModel().getValueInRange(selection);
            if (text) {
                aiAction('refactor', text);
            }
        }
    });
    
    editor.addAction({
        id: 'ai-tests',
        label: '🧪 Generate Tests',
        contextMenuGroupId: 'bigdaddyg',
        contextMenuOrder: 5,
        run: function(ed) {
            const selection = ed.getSelection();
            const text = ed.getModel().getValueInRange(selection);
            if (text) {
                aiAction('tests', text);
            }
        }
    });
    
    editor.addAction({
        id: 'ai-docs',
        label: '📝 Add Documentation',
        contextMenuGroupId: 'bigdaddyg',
        contextMenuOrder: 6,
        run: function(ed) {
            const selection = ed.getSelection();
            const text = ed.getModel().getValueInRange(selection);
            if (text) {
                aiAction('docs', text);
            }
        }
    });
    
    console.log('[BigDaddyG] ✅ Context menu configured');
}

async function aiAction(action, code) {
    console.log(`[BigDaddyG] 🤖 AI Action: ${action}`);
    
    let prompt = '';
    switch(action) {
        case 'explain':
            prompt = `Explain this code in detail:\n\n${code}`;
            break;
        case 'fix':
            prompt = `Find and fix any bugs in this code:\n\n${code}`;
            break;
        case 'optimize':
            prompt = `Optimize this code for performance:\n\n${code}`;
            break;
        case 'refactor':
            prompt = `Refactor this code following best practices:\n\n${code}`;
            break;
        case 'tests':
            prompt = `Generate unit tests for this code:\n\n${code}`;
            break;
        case 'docs':
            prompt = `Add comprehensive documentation to this code:\n\n${code}`;
            break;
    }
    
    try {
        // Query BigDaddyG
        const response = await fetch('http://localhost:11441/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: prompt,
                model: 'BigDaddyG:Code'
            })
        });
        
        const data = await response.json();
        
        // Extract code blocks
        const codeBlocks = extractCodeBlocks(data.response);
        
        if (codeBlocks.length > 0 && action !== 'explain') {
            // Show inline suggestion
            showInlineSuggestion(codeBlocks[0].code, action);
        } else {
            // Show explanation in chat
            addAIMessage(`BigDaddyG (${action}): ` + data.response);
        }
        
    } catch (error) {
        console.error('[BigDaddyG] ❌ AI error:', error);
        addAIMessage(`Error: ${error.message}`, true);
    }
}

function extractCodeBlocks(text) {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        blocks.push({
            language: match[1] || 'text',
            code: match[2].trim()
        });
    }
    
    return blocks;
}

// ============================================================================
// INLINE SUGGESTIONS (Cursor-style)
// ============================================================================

function showInlineSuggestion(suggestedCode, action) {
    // Create suggestion overlay
    const overlay = document.createElement('div');
    overlay.id = 'inline-suggestion-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 30, 0.98);
        backdrop-filter: blur(20px);
        border: 2px solid var(--green);
        border-radius: 15px;
        padding: 25px;
        max-width: 70%;
        max-height: 70vh;
        overflow: auto;
        z-index: 10000;
        box-shadow: 0 10px 50px rgba(0, 255, 0, 0.5);
    `;
    
    overlay.innerHTML = `
        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid var(--green);">
            <h3 style="color: var(--green); margin: 0;">🤖 BigDaddyG Suggestion: ${action.toUpperCase()}</h3>
        </div>
        
        <div style="margin-bottom: 20px;">
            <div style="color: var(--cyan); font-size: 13px; margin-bottom: 10px; font-weight: bold;">📝 Suggested Code:</div>
            <pre style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; overflow-x: auto; max-height: 400px; font-size: 13px; line-height: 1.5; color: #fff;"><code>${escapeHtml(suggestedCode)}</code></pre>
        </div>
        
        <div style="display: flex; gap: 10px;">
            <button onclick="applySuggestion()" style="flex: 1; background: var(--green); color: var(--void); border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px;">✅ Apply (Replace Selection)</button>
            <button onclick="insertSuggestion()" style="flex: 1; background: var(--cyan); color: var(--void); border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px;">➕ Insert (Add Below)</button>
            <button onclick="rejectSuggestion()" style="background: var(--orange); color: var(--void); border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 13px;">❌ Reject</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    window.currentSuggestion = suggestedCode;
    
    console.log('[BigDaddyG] 💡 Inline suggestion shown');
}

function applySuggestion() {
    if (!window.currentSuggestion) return;
    
    const selection = editor.getSelection();
    const id = { major: 1, minor: 1 };
    const op = {
        identifier: id,
        range: selection,
        text: window.currentSuggestion,
        forceMoveMarkers: true
    };
    
    editor.executeEdits('bigdaddyg-apply', [op]);
    rejectSuggestion();
    
    console.log('[BigDaddyG] ✅ Suggestion applied');
}

function insertSuggestion() {
    if (!window.currentSuggestion) return;
    
    const selection = editor.getSelection();
    const position = { lineNumber: selection.endLineNumber + 1, column: 1 };
    
    editor.executeEdits('bigdaddyg-insert', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: '\n' + window.currentSuggestion
    }]);
    
    rejectSuggestion();
    
    console.log('[BigDaddyG] ✅ Suggestion inserted');
}

function rejectSuggestion() {
    const overlay = document.getElementById('inline-suggestion-overlay');
    if (overlay) overlay.remove();
    window.currentSuggestion = null;
    
    console.log('[BigDaddyG] ❌ Suggestion rejected');
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, match => {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escapeMap[match];
    });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

// NOTE: Most shortcuts now handled by hotkey-manager.js
// These are kept as fallbacks if hotkey-manager isn't loaded yet
document.addEventListener('keydown', (e) => {
    // Defer to hotkey-manager if it exists
    if (window.hotkeyManager) {
        return; // Let hotkey-manager handle it
    }
    
    // Fallback handlers (only if hotkey-manager not loaded)
    if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
            if (typeof previousTab === 'function') previousTab();
        } else {
            if (typeof nextTab === 'function') nextTab();
        }
    }
    
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        const tabs = Object.keys(openTabs || {});
        if (tabs.length > 1 && typeof closeTab === 'function' && window.activeTab) {
            closeTab({ stopPropagation: () => {} }, window.activeTab);
        }
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        if (typeof closeAllTabs === 'function') closeAllTabs();
    }
    
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const tabs = Object.keys(openTabs || {});
        if (tabs[index] && typeof switchTab === 'function') {
            switchTab(tabs[index]);
        }
    }
    
    if (e.altKey) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (typeof previousTab === 'function') previousTab();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (typeof nextTab === 'function') nextTab();
        }
    }
});

console.log('[BigDaddyG] ⌨️ Tab keyboard shortcuts enabled:');
console.log('  • Ctrl+Tab / Ctrl+Shift+Tab - Next/Previous tab');
console.log('  • Ctrl+W - Close tab');
console.log('  • Ctrl+Shift+W - Close all tabs');
console.log('  • Ctrl+1-9 - Jump to tab 1-9');
console.log('  • Alt+Left/Right - Navigate tabs');

// ============================================================================
// AI CHAT
// ============================================================================

async function sendToAI() {
    const input = document.getElementById('ai-input');
    let message = input.value.trim();
    
    if (!message && attachedFiles.length === 0) return;
    
    input.value = '';
    
    // Use new AI response handler if available
    if (window.aiResponseHandler) {
        const attachments = [...attachedFiles];
        attachedFiles = [];
        updateAttachmentsDisplay();
        await window.aiResponseHandler.processMessage(message, attachments);
        return;
    }
    
    // Process agentic commands (@search, @read, @list)
    let agenticContext = '';
    
    // @search command - Search for files
    const searchMatch = message.match(/@search\s+(.+)/);
    if (searchMatch) {
        const query = searchMatch[1];
        console.log(`[BigDaddyG] 🔍 Searching for: ${query}`);
        const result = await window.electron.searchFiles(query, { maxResults: 1001 });
        if (result.success) {
            agenticContext += `\n\n🔍 **Search Results for "${query}"** (${result.count} files):\n\n`;
            result.results.slice(0, 50).forEach(r => {
                agenticContext += `📄 ${r.name} - ${r.path} (${r.matchType})\n`;
            });
            if (result.count > 50) {
                agenticContext += `\n... and ${result.count - 50} more files\n`;
            }
        }
    }
    
    // @list command - List directory contents
    const listMatch = message.match(/@list\s+(.+)/);
    if (listMatch) {
        const dirPath = listMatch[1].trim();
        console.log(`[BigDaddyG] 📂 Listing directory: ${dirPath}`);
        const result = await window.electron.readDirRecursive(dirPath, 5);
        if (result.success) {
            agenticContext += `\n\n📂 **Directory Listing for "${dirPath}"** (${result.count} items):\n\n`;
            result.files.slice(0, 100).forEach(f => {
                const indent = '  '.repeat(f.depth);
                const icon = f.isDirectory ? '📁' : '📄';
                agenticContext += `${indent}${icon} ${f.name}\n`;
            });
            if (result.count > 100) {
                agenticContext += `\n... and ${result.count - 100} more items\n`;
            }
        }
    }
    
    // @read command - Read specific file(s)
    const readMatch = message.match(/@read\s+(.+)/);
    if (readMatch) {
        const filePath = readMatch[1].trim();
        console.log(`[BigDaddyG] 📖 Reading file: ${filePath}`);
        const result = await window.electron.readFile(filePath);
        if (result.success) {
            agenticContext += `\n\n📖 **File Content: ${filePath}**\n\n\`\`\`\n${result.content}\n\`\`\`\n\n`;
        } else {
            agenticContext += `\n\n❌ **Could not read ${filePath}**: ${result.error}\n`;
        }
    }
    
    // Build context from attached files
    let fileContext = '';
    let imageContext = [];
    
    if (attachedFiles.length > 0) {
        console.log(`[BigDaddyG] 📎 Including ${attachedFiles.length} attached files in context...`);
        
        fileContext += `\n\n📎 **Attached Files (${attachedFiles.length}):**\n\n`;
        
        for (const fileData of attachedFiles) {
            if (fileData.isImage && fileData.preview) {
                // Images sent separately for AI to analyze
                imageContext.push({
                    name: fileData.name,
                    data: fileData.preview,
                    size: fileData.size
                });
                fileContext += `🖼️ **${fileData.name}** (Image, ${formatFileSize(fileData.size)})\n`;
            } else if (fileData.content) {
                // Text files included in context
                fileContext += `📄 **${fileData.name}** (${formatFileSize(fileData.size)}):\n\`\`\`\n${fileData.content}\n\`\`\`\n\n`;
            } else {
                // Binary or large files - just metadata
                fileContext += `📦 **${fileData.name}** (${formatFileSize(fileData.size)}) - Binary file\n`;
            }
        }
    }
    
    const fullMessage = message + agenticContext + fileContext;
    
    // Add user message with attachment count
    const displayMessage = attachedFiles.length > 0 
        ? `${message}\n\n<span class="attachment-counter">📎 ${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached</span>`
        : message;
    addUserMessage(displayMessage);
    
    // Add thinking indicator
    const thinkingId = addAIMessage('Thinking...', false, true);
    
    try {
        const requestBody = {
            message: fullMessage,
            model: 'BigDaddyG:Latest',
            attachments: attachedFiles.length,
            images: imageContext
        };
        
        console.log('[BigDaddyG] 📤 Sending to AI:', { 
            messageLength: fullMessage.length, 
            attachments: attachedFiles.length 
        });
        
        const response = await fetch('http://localhost:11441/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        console.log('[BigDaddyG] 📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[BigDaddyG] 📥 Response data:', data);
        
        // Remove thinking indicator
        const thinkingEl = document.getElementById(thinkingId);
        if (thinkingEl) thinkingEl.remove();
        
        // Add AI response - check multiple possible response formats
        const aiResponse = data.response || data.message || data.text || 'No response from AI';
        addAIMessage(aiResponse);
        
        // Clear attachments after sending
        attachedFiles = [];
        updateAttachmentsDisplay();
        console.log('[BigDaddyG] ✅ Message sent with file context');
        
    } catch (error) {
        console.error('[BigDaddyG] ❌ Chat error:', error);
        const thinkingEl = document.getElementById(thinkingId);
        if (thinkingEl) thinkingEl.remove();
        
        // More helpful error message
        let errorMsg = `❌ **Connection Error**\n\n`;
        errorMsg += `Could not connect to Orchestra server at http://localhost:11441/api/chat\n\n`;
        errorMsg += `**Possible causes:**\n`;
        errorMsg += `• Orchestra server not running (check console for logs)\n`;
        errorMsg += `• Port 11441 already in use\n`;
        errorMsg += `• Endpoint /api/chat not found (404)\n\n`;
        errorMsg += `**Error:** ${error.message}\n\n`;
        errorMsg += `💡 **Try:** Check the Orchestra tab in Console panel for server status`;
        
        addAIMessage(errorMsg, true);
    }
}

function addUserMessage(message, attachments = null) {
    let container = document.getElementById('ai-chat-messages');
    if (!container) {
        console.warn('[BigDaddyG] ⚠️ AI chat container missing, creating fallback...');
        
        // Try to find right sidebar first
        const rightSidebar = document.getElementById('right-sidebar');
        if (rightSidebar) {
            container = document.createElement('div');
            container.id = 'ai-chat-messages';
            container.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                background: rgba(10, 10, 30, 0.5);
            `;
            rightSidebar.appendChild(container);
        } else {
            // Last resort: create floating container
            container = document.createElement('div');
            container.id = 'ai-chat-messages';
            container.style.cssText = `
                position: fixed;
                bottom: 60px;
                right: 10px;
                width: 400px;
                height: 500px;
                background: rgba(10, 10, 30, 0.95);
                border: 2px solid #00d4ff;
                border-radius: 10px;
                padding: 15px;
                overflow-y: auto;
                z-index: 10000;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            `;
            document.body.appendChild(container);
            console.log('[BigDaddyG] ✅ Created floating chat container');
        }
    }
    
    console.log('[BigDaddyG] 📝 Adding user message to chat');
    
    // Save to chat history
    if (window.chatHistory) {
        const messageData = window.chatHistory.addMessage('user', message, attachments);
        
        // Create element from chat history (includes read/unread buttons)
        const msgEl = window.chatHistory.createMessageElement(messageData);
        container.appendChild(msgEl);
    } else {
        // Fallback if chat history not loaded yet
    const msgEl = document.createElement('div');
    msgEl.className = 'ai-message user-message';
        msgEl.style.cssText = `
            margin-bottom: 15px;
            padding: 15px;
            background: rgba(255, 152, 0, 0.1);
            border-left: 4px solid var(--orange);
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.6;
        `;
        msgEl.innerHTML = `<strong style="color: var(--orange); font-size: 13px;">You:</strong><br><br><div style="white-space: pre-wrap;">${escapeHtml(message)}</div>`;
    container.appendChild(msgEl);
    }
    
    container.scrollTop = container.scrollHeight;
    console.log('[BigDaddyG] ✅ User message added to chat UI');
}

function addAIMessage(message, isError = false, isThinking = false) {
    let container = document.getElementById('ai-chat-messages');
    if (!container) {
        console.warn('[BigDaddyG] ⚠️ AI chat container missing, creating fallback...');
        
        // Try to find right sidebar first
        const rightSidebar = document.getElementById('right-sidebar');
        if (rightSidebar) {
            container = document.createElement('div');
            container.id = 'ai-chat-messages';
            container.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                background: rgba(10, 10, 30, 0.5);
            `;
            rightSidebar.appendChild(container);
        } else {
            // Last resort: create floating container
            container = document.createElement('div');
            container.id = 'ai-chat-messages';
            container.style.cssText = `
                position: fixed;
                bottom: 60px;
                right: 10px;
                width: 400px;
                height: 500px;
                background: rgba(10, 10, 30, 0.95);
                border: 2px solid #00d4ff;
                border-radius: 10px;
                padding: 15px;
                overflow-y: auto;
                z-index: 10000;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            `;
            document.body.appendChild(container);
            console.log('[BigDaddyG] ✅ Created floating chat container');
        }
    }
    
    console.log('[BigDaddyG] 🤖 Adding AI message to chat');
    
    const id = `ai-msg-${Date.now()}`;
    
    // Don't save thinking indicators to history
    if (!isThinking && window.chatHistory) {
        const messageData = window.chatHistory.addMessage('assistant', message, null, isError);
        
        // Create element from chat history (includes read/unread buttons)
        const msgEl = window.chatHistory.createMessageElement(messageData);
        msgEl.id = id;
        container.appendChild(msgEl);
    } else {
        // Fallback or thinking indicator
        const msgEl = document.createElement('div');
    msgEl.id = id;
    msgEl.className = 'ai-message';
    
    if (isError) {
            msgEl.style.cssText = `
                margin-bottom: 15px;
                padding: 15px;
                background: rgba(255, 82, 82, 0.1);
                border-left: 4px solid var(--red);
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
            `;
            msgEl.innerHTML = `<strong style="color: var(--red); font-size: 13px;">❌ Error:</strong><br><br><div style="white-space: pre-wrap;">${message}</div>`;
    } else if (isThinking) {
            msgEl.style.cssText = `
                margin-bottom: 15px;
                padding: 15px;
                background: rgba(0, 212, 255, 0.1);
                border-left: 4px solid var(--cyan);
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
                animation: pulse 1.5s ease-in-out infinite;
            `;
            msgEl.innerHTML = `<strong style="color: var(--cyan); font-size: 13px;">🤔 BigDaddyG:</strong><br><br><em style="opacity: 0.7;">${message}</em>`;
    } else {
            msgEl.style.cssText = `
                margin-bottom: 15px;
                padding: 15px;
                background: rgba(0, 212, 255, 0.1);
                border-left: 4px solid var(--cyan);
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
            `;
            msgEl.innerHTML = `<strong style="color: var(--cyan); font-size: 13px;">💎 BigDaddyG:</strong><br><br><div style="white-space: pre-wrap;">${escapeHtml(message)}</div>`;
    }
    
    container.appendChild(msgEl);
    }
    
    container.scrollTop = container.scrollHeight;
    console.log('[BigDaddyG] ✅ AI message added to chat UI');
    
    return id;
}

// ============================================================================
// MENU EVENTS
// ============================================================================

if (window.electron) {
    window.electron.onMenuEvent((event) => {
        console.log(`[BigDaddyG] 📋 Menu event: ${event}`);
        
        switch(event) {
            case 'new-file':
                // Create a new untitled file
                const newFilename = `Untitled-${tabCounter + 1}.txt`;
                const lang = detectLanguage(newFilename);
                createNewTab(newFilename, lang, '');
                console.log('[BigDaddyG] ✅ Created new file via Ctrl+N');
                break;
            
            case 'open-file':
                openFileDialog();
                break;
            
            case 'save-file':
                saveCurrentFile();
                break;
            
            case 'save-as':
                saveFileAs();
                break;
            
            case 'toggle-sidebar':
                document.getElementById('sidebar').classList.toggle('collapsed');
                break;
            
            case 'toggle-terminal':
                document.getElementById('bottom-panel').classList.toggle('collapsed');
                break;
            
            case 'ask-ai':
                document.getElementById('ai-input').focus();
                break;
            
            case 'ai-explain':
            case 'ai-fix':
            case 'ai-optimize':
                const selection = editor.getSelection();
                const text = editor.getModel().getValueInRange(selection);
                if (text) {
                    aiAction(event.replace('ai-', ''), text);
                }
                break;
        }
    });
}

function detectLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
        js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
        py: 'python', java: 'java', cpp: 'cpp', c: 'c',
        rs: 'rust', go: 'go', rb: 'ruby', php: 'php',
        html: 'html', css: 'css', json: 'json', xml: 'xml',
        md: 'markdown', txt: 'plaintext', asm: 'asm', s: 'asm',
        sql: 'sql', sh: 'shell', bat: 'bat', ps1: 'powershell'
    };
    return langMap[ext] || 'plaintext';
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

async function openFileDialog() {
    try {
        console.log('[BigDaddyG] 📂 Opening file dialog...');
        window.showLoading('Opening file...', { subtitle: 'Select a file to open' });
        const result = await window.electron.openFileDialog();
        window.hideLoading();
        
        if (result.success && !result.canceled) {
            const { filename, content, filePath } = result;
            const language = detectLanguage(filename);
            
            // Check if file is already open
            const existingTab = Object.values(openTabs).find(tab => tab.filePath === filePath);
            if (existingTab) {
                console.log(`[BigDaddyG] ⚠️ File already open: ${filename}`);
                switchTab(existingTab.id);
                return;
            }
            
            createNewTab(filename, language, content, filePath);
            console.log(`[BigDaddyG] ✅ Opened file: ${filePath}`);
        } else if (result.canceled) {
            console.log('[BigDaddyG] ℹ️ File open canceled');
        } else {
            console.error('[BigDaddyG] ❌ Failed to open file:', result.error);
        }
    } catch (error) {
        console.error('[BigDaddyG] ❌ Error opening file:', error);
    }
}

async function saveCurrentFile() {
    const tab = openTabs[activeTab];
    if (!tab) {
        console.log('[BigDaddyG] ⚠️ No active tab to save');
        return;
    }
    
    try {
        // Save current editor content to tab
        tab.content = editor.getValue();
        
        // If tab doesn't have a file path, use save as
        if (!tab.filePath) {
            console.log('[BigDaddyG] ℹ️ No file path, using Save As...');
            await saveFileAs();
            return;
        }
        
        console.log(`[BigDaddyG] 💾 Saving file: ${tab.filePath}`);
        window.showLoading(`Saving ${tab.filename}...`);
        const result = await window.electron.writeFile(tab.filePath, tab.content);
        window.hideLoading();
        
        if (result.success) {
            tab.isDirty = false;
            tab.modified = Date.now();
            renderTabs();  // Update UI to remove dirty indicator
            console.log(`[BigDaddyG] ✅ Saved: ${tab.filename}`);
        } else {
            console.error('[BigDaddyG] ❌ Failed to save file:', result.error);
            alert(`Failed to save file: ${result.error}`);
        }
    } catch (error) {
        console.error('[BigDaddyG] ❌ Error saving file:', error);
        alert(`Error saving file: ${error.message}`);
    }
}

async function saveFileAs() {
    const tab = openTabs[activeTab];
    if (!tab) {
        console.log('[BigDaddyG] ⚠️ No active tab to save');
        return;
    }
    
    try {
        // Save current editor content to tab
        tab.content = editor.getValue();
        
        console.log('[BigDaddyG] 💾 Opening Save As dialog...');
        const result = await window.electron.saveFileDialog({ 
            defaultPath: tab.filename 
        });
        
        if (result.success && !result.canceled) {
            const { filePath, filename } = result;
            
            // Write the file
            const writeResult = await window.electron.writeFile(filePath, tab.content);
            
            if (writeResult.success) {
                // Update tab with new file path and name
                tab.filePath = filePath;
                tab.filename = filename;
                tab.language = detectLanguage(filename);
                tab.isDirty = false;
                tab.modified = Date.now();
                
                // Update Monaco model language
                const model = editor.getModel();
                monaco.editor.setModelLanguage(model, tab.language);
                
                renderTabs();
                console.log(`[BigDaddyG] ✅ Saved as: ${filePath}`);
            } else {
                console.error('[BigDaddyG] ❌ Failed to write file:', writeResult.error);
                alert(`Failed to save file: ${writeResult.error}`);
            }
        } else if (result.canceled) {
            console.log('[BigDaddyG] ℹ️ Save As canceled');
        } else {
            console.error('[BigDaddyG] ❌ Save As dialog error:', result.error);
        }
    } catch (error) {
        console.error('[BigDaddyG] ❌ Error in Save As:', error);
        alert(`Error saving file: ${error.message}`);
    }
}

// ============================================================================
// AUTO-SAVE & RECOVERY
// ============================================================================

// Auto-save tab state every 30 seconds
let autoSaveInterval = setInterval(() => {
    try {
        const tabState = {
            openTabs: {},
            activeTab: activeTab,
            timestamp: Date.now()
        };
        
        // Only save content for tabs with unsaved changes or no file path
        Object.entries(openTabs).forEach(([id, tab]) => {
            tabState.openTabs[id] = {
                id: tab.id,
                filename: tab.filename,
                language: tab.language,
                content: tab.isDirty || !tab.filePath ? tab.content : '', // Only save if dirty or new
                filePath: tab.filePath,
                created: tab.created,
                modified: tab.modified,
                isDirty: tab.isDirty,
                icon: tab.icon
            };
        });
        
        // Check size before saving to avoid QuotaExceededError
        const dataStr = JSON.stringify(tabState);
        const dataSize = new Blob([dataStr]).size;
        
        if (dataSize > 4 * 1024 * 1024) { // Warn if > 4MB
            console.warn('[BigDaddyG] ⚠️ Recovery data very large:', (dataSize / 1024 / 1024).toFixed(2), 'MB');
        }
        
        localStorage.setItem('bigdaddyg-tab-recovery', dataStr);
        console.log('[BigDaddyG] 💾 Auto-saved tab state');
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('[BigDaddyG] ❌ localStorage full! Clearing recovery data...');
            localStorage.removeItem('bigdaddyg-tab-recovery');
        } else {
            console.warn('[BigDaddyG] ⚠️ Auto-save failed:', error);
        }
    }
}, 30000); // Every 30 seconds

// Clean up interval on window unload to prevent memory leak
window.addEventListener('beforeunload', () => {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('[BigDaddyG] 🧹 Cleaned up auto-save interval');
    }
    
    // Dispose all Monaco models
    Object.values(openTabs).forEach(tab => {
        if (tab.model && !tab.model.isDisposed()) {
            tab.model.dispose();
        }
    });
    
    console.log('[BigDaddyG] 🧹 Cleaned up all resources');
});

// Try to recover tabs on load
async function tryRecoverTabs() {
    try {
        // Try IndexedDB first, fallback to localStorage
        let tabState = null;
        if (window.storage && window.storage.isReady()) {
            tabState = await window.storage.loadTabs();
        }
        
        if (!tabState) {
            const saved = localStorage.getItem('bigdaddyg-tab-recovery');
            if (!saved) return false;
            tabState = JSON.parse(saved);
        }
        
        if (!tabState || !tabState.openTabs) return false;
        
        const age = Date.now() - (tabState.timestamp || Date.now());
        
        // Only recover if less than 1 hour old
        if (age > 60 * 60 * 1000) {
            console.log('[BigDaddyG] ℹ️ Recovery data too old, skipping');
            localStorage.removeItem('bigdaddyg-tab-recovery');
            return false;
        }
        
        // Ask user if they want to recover
        if (Object.keys(tabState.openTabs).length > 1) {
            const recover = confirm(
                `Found ${Object.keys(tabState.openTabs).length} tabs from previous session.\n\n` +
                `Last saved: ${new Date(tabState.timestamp).toLocaleString()}\n\n` +
                `Recover these tabs?`
            );
            
            if (recover) {
                console.log('[BigDaddyG] 🔄 Recovering tabs...');
                
                // Clear current tabs except welcome
                Object.keys(openTabs).forEach(id => delete openTabs[id]);
                
                // Restore tabs
                openTabs = tabState.openTabs;
                activeTab = tabState.activeTab;
                
                renderTabs();
                switchTab(activeTab);
                
                console.log(`[BigDaddyG] ✅ Recovered ${Object.keys(openTabs).length} tabs`);
                return true;
            }
        }
        
        // Clean up
        localStorage.removeItem('bigdaddyg-tab-recovery');
        return false;
    } catch (error) {
        console.error('[BigDaddyG] ❌ Tab recovery failed:', error);
        localStorage.removeItem('bigdaddyg-tab-recovery');
        return false;
    }
}

// Call recovery after Monaco is initialized
setTimeout(() => {
    if (editor && monaco) {
        tryRecoverTabs();
    }
}, 2000);

// ============================================================================
// FILE ATTACHMENTS & DRAG & DROP
// ============================================================================

let attachedFiles = [];
const MAX_ATTACHED_FILES = 1001; // Up to 1,001 files!

function initDragAndDrop() {
    const chatMessages = document.getElementById('ai-chat-messages');
    const inputContainer = document.getElementById('ai-input-container');
    
    // Prevent default drag behaviors on entire document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop zone when dragging over
    ['dragenter', 'dragover'].forEach(eventName => {
        chatMessages.addEventListener(eventName, () => {
            chatMessages.classList.add('drag-over');
            showDropOverlay();
        }, false);
        
        inputContainer.addEventListener(eventName, () => {
            chatMessages.classList.add('drag-over');
            showDropOverlay();
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        chatMessages.addEventListener(eventName, () => {
            chatMessages.classList.remove('drag-over');
            hideDropOverlay();
        }, false);
        
        inputContainer.addEventListener(eventName, () => {
            chatMessages.classList.remove('drag-over');
            hideDropOverlay();
        }, false);
    });
    
    // Handle dropped files
    chatMessages.addEventListener('drop', handleDrop, false);
    inputContainer.addEventListener('drop', handleDrop, false);
    
    console.log('[BigDaddyG] 📎 Drag & drop initialized - Drop files anywhere in chat!');
}

function showDropOverlay() {
    let overlay = document.getElementById('drop-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'drop-overlay';
        overlay.className = 'drop-overlay';
        overlay.innerHTML = `
            <div class="drop-overlay-icon">📎</div>
            <div style="color: var(--cyan); font-size: 24px; font-weight: bold;">Drop Files Here</div>
            <div style="color: rgba(0, 212, 255, 0.7); font-size: 14px;">Up to 1,001 files • No size limits • Images, code, projects</div>
        `;
        document.getElementById('right-sidebar').style.position = 'relative';
        document.getElementById('right-sidebar').appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideDropOverlay() {
    const overlay = document.getElementById('drop-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

async function handleDrop(e) {
    const dt = e.dataTransfer;
    const items = dt.items || [];
    
    console.log(`[BigDaddyG] 📎 Processing ${items.length} dropped items...`);
    
    // Process all dropped items (files and directories)
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
            
            if (entry) {
                if (entry.isFile) {
                    await processFileEntry(entry);
                } else if (entry.isDirectory) {
                    await processDirectoryEntry(entry);
                }
            } else {
                // Fallback for browsers without webkitGetAsEntry
                const file = item.getAsFile();
                if (file) {
                    await addFileAttachment(file);
                }
            }
        }
    }
    
    updateAttachmentsDisplay();
}

async function processFileEntry(fileEntry) {
    return new Promise((resolve) => {
        fileEntry.file(async (file) => {
            await addFileAttachment(file);
            resolve();
        });
    });
}

async function processDirectoryEntry(directoryEntry, path = '') {
    const reader = directoryEntry.createReader();
    
    return new Promise((resolve) => {
        reader.readEntries(async (entries) => {
            for (const entry of entries) {
                if (entry.isFile) {
                    await processFileEntry(entry);
                } else if (entry.isDirectory) {
                    await processDirectoryEntry(entry, path + directoryEntry.name + '/');
                }
            }
            resolve();
        });
    });
}

async function addFileAttachment(file) {
    if (attachedFiles.length >= MAX_ATTACHED_FILES) {
        console.log(`[BigDaddyG] ⚠️ Maximum ${MAX_ATTACHED_FILES} files reached`);
        alert(`Maximum ${MAX_ATTACHED_FILES} files reached. Remove some to add more.`);
        return;
    }
    
    const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        isImage: file.type.startsWith('image/'),
        content: null,
        preview: null
    };
    
    // Read file content (NO SIZE LIMIT!)
    console.log(`[BigDaddyG] 📄 Reading file: ${file.name} (${formatFileSize(file.size)})`);
    
    try {
        if (fileData.isImage) {
            // For images, create preview
            fileData.preview = await readFileAsDataURL(file);
        }
        
        // Read text content for text files
        if (file.type.startsWith('text/') || isTextFile(file.name) || file.size < 10 * 1024 * 1024) {
            // Try to read as text for files under 10MB or known text types
            try {
                fileData.content = await readFileAsText(file);
            } catch (err) {
                console.log(`[BigDaddyG] ℹ️ Could not read ${file.name} as text, will use binary`);
            }
        }
        
        attachedFiles.push(fileData);
        console.log(`[BigDaddyG] ✅ Attached: ${file.name} (${attachedFiles.length}/${MAX_ATTACHED_FILES})`);
    } catch (error) {
        console.error(`[BigDaddyG] ❌ Error reading file ${file.name}:`, error);
    }
}

function isTextFile(filename) {
    const textExtensions = [
        'txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'html', 'css', 'scss', 'sass',
        'py', 'java', 'cpp', 'c', 'h', 'hpp', 'cs', 'go', 'rs', 'php', 'rb', 'swift',
        'kt', 'sql', 'sh', 'bash', 'ps1', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
        'log', 'csv', 'asm', 's', 'vue', 'svelte', 'r', 'dart', 'lua', 'pl', 'pm'
    ];
    const ext = filename.split('.').pop().toLowerCase();
    return textExtensions.includes(ext);
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function updateAttachmentsDisplay() {
    const container = document.getElementById('file-attachments');
    
    if (attachedFiles.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = '';
    
    // Add counter
    const counter = document.createElement('div');
    counter.className = 'attachment-counter';
    counter.textContent = `📎 ${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached`;
    container.appendChild(counter);
    
    // Add file attachments
    attachedFiles.forEach((fileData, index) => {
        if (fileData.isImage && fileData.preview) {
            // Image preview
            const attachment = document.createElement('div');
            attachment.className = 'file-attachment-image';
            attachment.innerHTML = `
                <img src="${fileData.preview}" alt="${fileData.name}">
                <div class="file-attachment-name" title="${fileData.name}">${fileData.name}</div>
                <div class="file-attachment-size">${formatFileSize(fileData.size)}</div>
                <button class="file-attachment-remove" onclick="removeAttachment(${index})">×</button>
            `;
            container.appendChild(attachment);
        } else {
            // Regular file
            const attachment = document.createElement('div');
            attachment.className = 'file-attachment';
            attachment.innerHTML = `
                <span>📄</span>
                <span class="file-attachment-name" title="${fileData.name}">${fileData.name}</span>
                <span class="file-attachment-size">${formatFileSize(fileData.size)}</span>
                <button class="file-attachment-remove" onclick="removeAttachment(${index})">×</button>
            `;
            container.appendChild(attachment);
        }
    });
    
    console.log(`[BigDaddyG] 📎 Displaying ${attachedFiles.length} attachments`);
}

function removeAttachment(index) {
    const removed = attachedFiles.splice(index, 1)[0];
    console.log(`[BigDaddyG] 🗑️ Removed attachment: ${removed.name}`);
    updateAttachmentsDisplay();
}

// Make removeAttachment globally available
window.removeAttachment = removeAttachment;

// Initialize drag and drop when DOM is ready
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () => {
    initWelcomeMessage();
    initDragAndDrop();
    initializeAISystem();
});
} else {
    initDragAndDrop();
    initializeAISystem();
}

// ============================================================================
// AI SYSTEM INITIALIZATION
// ============================================================================

function initializeAISystem() {
    console.log('[AI] Initializing AI system...');
    
    // Initialize AI Provider Manager
    if (typeof AIProviderManager !== 'undefined') {
        window.aiProviderManager = new AIProviderManager();
        window.aiProviderManager.initialize().then(() => {
            console.log('[AI] ✅ Provider Manager initialized');
            console.log('[AI] Available providers:', Array.from(window.aiProviderManager.providers.keys()));
            
            // Initialize API Key Manager UI
            if (typeof APIKeyManagerUI !== 'undefined') {
                window.apiKeyManagerUI = new APIKeyManagerUI(window.aiProviderManager);
                console.log('[UI] ✅ API Key Manager UI initialized');
                
                // Add global command to open API key manager
                window.openAPIKeyManager = () => {
                    if (window.apiKeyManagerUI) {
                        window.apiKeyManagerUI.show();
                    } else {
                        console.error('[UI] API Key Manager UI not available');
                    }
                };
                
                console.log('[UI] Use window.openAPIKeyManager() to configure API keys');
            } else {
                console.warn('[UI] APIKeyManagerUI not loaded');
            }
        }).catch(err => {
            console.error('[AI] ❌ Provider Manager init failed:', err);
        });
    } else {
        console.warn('[AI] ⚠️ AIProviderManager not loaded - check script includes in index.html');
    }
    
    // Initialize BigDaddyA Integration (if available)
    if (typeof BigDaddyAIntegration !== 'undefined') {
        window.bigdaddyA = new BigDaddyAIntegration();
        window.bigdaddyA.initialize().then(() => {
            console.log('[BigDaddyA] ✅ Custom LLM runtime initialized');
        }).catch(err => {
            console.error('[BigDaddyA] Init failed:', err);
        });
    }
    
    // Initialize other AI components
    initializeLogger();
    initializeMemoryManager();
}

// Allow Ctrl+Enter to send message
document.getElementById('ai-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault(); // Prevent newline
        sendToAI();
    }
});

console.log('[BigDaddyG] ⌨️ Keyboard shortcuts ready:');
console.log('  • Ctrl+Enter - Send AI message');

// Initialize logger and memory manager
function initializeLogger() {
    if (typeof global !== 'undefined' && global.logger) {
        window.logger = global.logger;
        console.log('[Logger] ✅ Professional logging system available');
    }
}

function initializeMemoryManager() {
    if (typeof memoryManager !== 'undefined') {
        console.log('[Memory] ✅ Memory manager available');
        console.log('[Memory] Use memoryManager.addEventListener() for tracked listeners');
    }
}

console.log('[BigDaddyG] ✅ Renderer initialized');

