/**
 * BigDaddyG IDE - Working Version (No Monaco, Pure JavaScript)
 * All features work, unlimited tabs, no white screen!
 */

console.log('[BigDaddyG] 🌌 Working IDE initializing...');

// State
let tabs = {
    welcome: {
        id: 'welcome',
        filename: 'Welcome.md',
        content: document.getElementById('editor').value,
        icon: '📄'
    }
};
let activeTab = 'welcome';
let tabCounter = 0;
const MAX_TABS = 100;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('[BigDaddyG] ✅ DOM loaded');
    initializeEventListeners();
    console.log('[BigDaddyG] ✅ Working IDE ready!');
});

function initializeEventListeners() {
    // Add file button
    document.getElementById('add-file-btn').onclick = createNewFile;
    
    // Quality buttons
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            console.log('[BigDaddyG] Quality set to:', e.target.dataset.quality);
        });
    });
    
    // AI send button
    document.querySelector('.btn-primary').onclick = sendMessage;
    document.querySelector('.btn-danger').onclick = clearChat;
    
    // Editor auto-save
    document.getElementById('editor').addEventListener('input', () => {
        if (tabs[activeTab]) {
            tabs[activeTab].content = document.getElementById('editor').value;
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    console.log('[BigDaddyG] ⌨️ Keyboard shortcuts enabled');
}

function createNewFile() {
    const name = prompt('Enter filename:');
    if (!name) return;
    
    const currentTabCount = Object.keys(tabs).length;
    if (currentTabCount >= MAX_TABS) {
        const proceed = confirm(
            `⚠️ You have ${currentTabCount} tabs open (limit: ${MAX_TABS}).\n\n` +
            `Opening more tabs may slow down the IDE.\n\n` +
            `Continue anyway?`
        );
        if (!proceed) return;
    }
    
    const id = `file_${++tabCounter}_${Date.now()}`;
    const icon = getFileIcon(name);
    
    tabs[id] = {
        id: id,
        filename: name,
        content: `// New file: ${name}\n\n`,
        icon: icon,
        created: Date.now()
    };
    
    renderFileTree();
    renderTabs();
    switchTab(id);
    
    console.log(`[BigDaddyG] 📄 Created tab ${currentTabCount + 1}/${MAX_TABS}: ${name}`);
}

function switchTab(tabId) {
    if (!tabs[tabId]) return;
    
    // Save current tab content
    if (tabs[activeTab]) {
        tabs[activeTab].content = document.getElementById('editor').value;
    }
    
    // Switch to new tab
    activeTab = tabId;
    const tab = tabs[tabId];
    
    // Update editor
    document.getElementById('editor').value = tab.content;
    
    // Update UI
    renderFileTree();
    renderTabs();
    
    console.log(`[BigDaddyG] 📝 Switched to: ${tab.filename}`);
}

function closeTab(event, tabId) {
    event.stopPropagation();
    
    if (Object.keys(tabs).length === 1) {
        console.log('[BigDaddyG] ⚠️ Cannot close last tab');
        return;
    }
    
    console.log(`[BigDaddyG] 🗑️ Closing tab: ${tabs[tabId]?.filename}`);
    
    delete tabs[tabId];
    
    // Switch to another tab if this was active
    if (activeTab === tabId) {
        const remainingTabs = Object.keys(tabs);
        switchTab(remainingTabs[remainingTabs.length - 1]);
    }
    
    renderFileTree();
    renderTabs();
}

function renderFileTree() {
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';
    
    Object.values(tabs).forEach(tab => {
        const div = document.createElement('div');
        div.className = 'file-item' + (tab.id === activeTab ? ' active' : '');
        div.setAttribute('data-tab', tab.id);
        div.onclick = () => switchTab(tab.id);
        div.innerHTML = `<span>${tab.icon}</span><span>${tab.filename}</span>`;
        fileTree.appendChild(div);
    });
}

function renderTabs() {
    const tabBar = document.getElementById('tab-bar');
    tabBar.innerHTML = '';
    
    const sortedTabs = Object.values(tabs).sort((a, b) => 
        (a.created || 0) - (b.created || 0)
    );
    
    sortedTabs.forEach(tab => {
        const div = document.createElement('div');
        div.className = 'editor-tab' + (tab.id === activeTab ? ' active' : '');
        div.setAttribute('data-tab', tab.id);
        div.onclick = () => switchTab(tab.id);
        div.title = `${tab.filename}\nCreated: ${new Date(tab.created || Date.now()).toLocaleString()}`;
        
        div.innerHTML = `
            <span>${tab.icon}</span>
            <span style="flex: 1; overflow: hidden; text-overflow: ellipsis;">${tab.filename}</span>
            <span class="close-btn">×</span>
        `;
        
        // Add close button handler
        const closeBtn = div.querySelector('.close-btn');
        closeBtn.onclick = (e) => closeTab(e, tab.id);
        
        tabBar.appendChild(div);
    });
    
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
    let badge = document.querySelector('.tab-count-badge');
    if (badge) badge.remove();
    
    const tabCount = Object.keys(tabs).length;
    
    if (tabCount > 1) {
        badge = document.createElement('div');
        badge.className = 'tab-count-badge';
        badge.textContent = `${tabCount} / ${MAX_TABS} tabs`;
        
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
        html: '🌐', css: '🎨', scss: '🎨',
        py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️',
        md: '📄', txt: '📝', json: '📊',
        png: '🖼️', jpg: '🖼️', gif: '🖼️',
        pdf: '📕', zip: '📦', sql: '🗄️'
    };
    return icons[ext] || '📄';
}

function sendMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    if (!message) return;
    
    addMessage('You', message, 'user-message', '#ff6b35');
    input.value = '';
    
    // Add thinking indicator
    const thinkingId = 'thinking-' + Date.now();
    addMessage('BigDaddyG', '🤔 Thinking...', 'ai-message', '#00d4ff', thinkingId);
    
    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
        document.getElementById(thinkingId)?.remove();
        addMessage('BigDaddyG', 
            `I received your message: "${message}"\n\n` +
            `This is a demo response. Connect to Orchestra server at http://localhost:11441 for real AI!`,
            'ai-message', '#00d4ff'
        );
    }, 1000);
}

function clearChat() {
    const messages = document.getElementById('ai-chat-messages');
    if (confirm('Clear all chat messages?')) {
        messages.innerHTML = '<div class="ai-message"><strong style="color: var(--cyan);">BigDaddyG:</strong><br><br>Chat cleared. Ready for new conversation!</div>';
    }
}

function addMessage(sender, text, className, color, id) {
    const messages = document.getElementById('ai-chat-messages');
    const div = document.createElement('div');
    div.className = className;
    if (id) div.id = id;
    div.style.borderLeftColor = color;
    div.innerHTML = `<strong style="color: ${color};">${sender}:</strong><br><br>${escapeHtml(text)}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, match => {
        const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapeMap[match];
    });
}

function handleKeyboardShortcuts(e) {
    // Ctrl+Tab / Ctrl+Shift+Tab for tab navigation
    if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const tabIds = Object.keys(tabs);
        const currentIndex = tabIds.indexOf(activeTab);
        const nextIndex = e.shiftKey 
            ? (currentIndex - 1 + tabIds.length) % tabIds.length
            : (currentIndex + 1) % tabIds.length;
        switchTab(tabIds[nextIndex]);
    }
    
    // Ctrl+W to close current tab
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (Object.keys(tabs).length > 1) {
            closeTab({ stopPropagation: () => {} }, activeTab);
        }
    }
    
    // Ctrl+1 through Ctrl+9 for direct tab access
    if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const tabIds = Object.keys(tabs);
        if (tabIds[index]) {
            switchTab(tabIds[index]);
        }
    }
}

console.log('[BigDaddyG] ⌨️ Keyboard shortcuts:');
console.log('  • Ctrl+Tab / Ctrl+Shift+Tab - Next/Previous tab');
console.log('  • Ctrl+W - Close tab');
console.log('  • Ctrl+1-9 - Jump to tab 1-9');
console.log('[BigDaddyG] ✅ Working IDE loaded successfully!');

