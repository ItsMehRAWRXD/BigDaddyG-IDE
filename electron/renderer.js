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

// Monaco Editor initialization - Called when Monaco loads from index.html
window.onMonacoLoad = function() {
    console.log('[BigDaddyG] 🎨 Monaco loaded, initializing editor...');
    initMonacoEditor();
};

// Also try immediate init if Monaco is already loaded
if (typeof monaco !== 'undefined') {
    console.log('[BigDaddyG] 🎨 Monaco already available, initializing...');
    initMonacoEditor();
}

function initMonacoEditor() {
    console.log('[BigDaddyG] 🎨 Initializing Monaco Editor...');
    
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
    
    // Create Monaco Editor instance
    editor = monaco.editor.create(document.getElementById('monaco-container'), {
        value: getWelcomeMessage(),
        language: 'markdown',
        theme: 'bigdaddyg-dark', // Use custom theme
        
        // Editor options
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        lineNumbers: 'on',
        roundedSelection: true,
        scrollBeyondLastLine: false,
        minimap: {
            enabled: true
        },
        automaticLayout: true,
        
        // Advanced features
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordWrap: 'on',
        wrappingIndent: 'indent',
        
        // Copilot-like features
        quickSuggestions: true,
        quickSuggestionsDelay: 100,
        parameterHints: {
            enabled: true
        },
        
        // Bracket matching
        matchBrackets: 'always',
        bracketPairColorization: {
            enabled: true
        }
    });
    
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

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+N\` | New File |
| \`Ctrl+O\` | Open File |
| \`Ctrl+S\` | Save File |
| \`Ctrl+K\` | Ask BigDaddyG |
| \`Ctrl+E\` | Explain Code |
| \`Ctrl+Shift+F\` | Fix Code |
| \`Ctrl+B\` | Toggle Sidebar |
| \`Ctrl+\`\` | Toggle Terminal |

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
    if (!openTabs[tabId]) return;
    
    // Save current tab content
    if (openTabs[activeTab]) {
        openTabs[activeTab].content = editor.getValue();
    }
    
    // Switch to new tab
    activeTab = tabId;
    const tab = openTabs[tabId];
    
    // Update editor
    const model = monaco.editor.createModel(tab.content, tab.language);
    editor.setModel(model);
    
    // Update UI
    renderTabs();
    
    console.log(`[BigDaddyG] 📝 Switched to: ${tab.filename}`);
}

function closeTab(event, tabId) {
    event.stopPropagation();
    
    if (Object.keys(openTabs).length === 1) {
        console.log('[BigDaddyG] ⚠️ Cannot close last tab');
        return;
    }
    
    const tab = openTabs[tabId];
    console.log(`[BigDaddyG] 🗑️ Closing tab: ${tab?.filename || tabId}`);
    
    delete openTabs[tabId];
    
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
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    switchTab(tabs[nextIndex]);
}

function previousTab() {
    const tabs = Object.keys(openTabs);
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
        tabEl.title = `${tab.filename}\nCreated: ${new Date(tab.created).toLocaleString()}`;
        
        tabEl.innerHTML = `
            <span>${tab.icon}</span>
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

document.addEventListener('keydown', (e) => {
    // Ctrl+Tab / Ctrl+Shift+Tab for tab navigation
    if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
            previousTab();
        } else {
            nextTab();
        }
    }
    
    // Ctrl+W to close current tab
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        const tabs = Object.keys(openTabs);
        if (tabs.length > 1) {
            closeTab({ stopPropagation: () => {} }, activeTab);
        }
    }
    
    // Ctrl+Shift+W to close all tabs
    if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        closeAllTabs();
    }
    
    // Ctrl+1 through Ctrl+9 for direct tab access
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const tabs = Object.keys(openTabs);
        if (tabs[index]) {
            switchTab(tabs[index]);
        }
    }
    
    // Alt+Left/Right for tab navigation (browser-style)
    if (e.altKey) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousTab();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextTab();
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
    const container = document.getElementById('ai-chat-messages');
    if (!container) {
        console.error('[BigDaddyG] ❌ AI chat messages container not found');
        alert('Error: Chat container not found! Cannot display messages.');
        return;
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
    const container = document.getElementById('ai-chat-messages');
    if (!container) {
        console.error('[BigDaddyG] ❌ AI chat messages container not found');
        alert('Error: Chat container not found! Cannot display AI response.');
        return '';
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
        const result = await window.electron.openFileDialog();
        
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
        const result = await window.electron.writeFile(tab.filePath, tab.content);
        
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
    document.addEventListener('DOMContentLoaded', initDragAndDrop);
} else {
    initDragAndDrop();
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

console.log('[BigDaddyG] ✅ Renderer initialized');

