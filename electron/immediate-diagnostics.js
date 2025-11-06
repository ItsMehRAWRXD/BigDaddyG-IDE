/**
 * Immediate Diagnostics - Run RIGHT NOW
 * 
 * Doesn't wait for anything - just reports current state
 */

console.log('='.repeat(80));
console.log('%c🔍 IMMEDIATE DIAGNOSTICS - STARTING NOW', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
console.log('='.repeat(80));

// Check what's loaded RIGHT NOW
setTimeout(() => {
    console.log('\n%c📊 CURRENT STATE CHECK:', 'color: #00ff88; font-size: 14px; font-weight: bold;');
    console.log('');
    
    // Monaco
    console.log('%c1. Monaco Editor:', 'font-weight: bold;');
    console.log('   window.monaco exists:', !!window.monaco);
    console.log('   window.editor exists:', !!window.editor);
    const monacoContainer = document.getElementById('monaco-container');
    console.log('   Monaco container exists:', !!monacoContainer);
    console.log('   Monaco container visible:', monacoContainer ? monacoContainer.offsetHeight > 0 : false);
    console.log('   Monaco container display:', monacoContainer ? monacoContainer.style.display || 'default' : 'N/A');
    
    // File Explorer
    console.log('\n%c2. File Explorer:', 'font-weight: bold;');
    console.log('   window.fileExplorer:', !!window.fileExplorer);
    console.log('   window.enhancedFileExplorer:', !!window.enhancedFileExplorer);
    const sidebar = document.getElementById('sidebar');
    console.log('   Sidebar exists:', !!sidebar);
    console.log('   Sidebar visible:', sidebar ? !sidebar.classList.contains('collapsed') : false);
    
    // Chat
    console.log('\n%c3. Chat System:', 'font-weight: bold;');
    const chatInput = document.getElementById('ai-input');
    console.log('   Chat input exists:', !!chatInput);
    console.log('   Chat input visible:', chatInput ? chatInput.offsetHeight > 0 : false);
    console.log('   sendToAI function:', typeof sendToAI);
    console.log('   window.floatingChat:', !!window.floatingChat);
    
    // Panels
    console.log('\n%c4. Panel Manager:', 'font-weight: bold;');
    console.log('   window.panelManager:', !!window.panelManager);
    const rightSidebar = document.getElementById('right-sidebar');
    console.log('   Right sidebar exists:', !!rightSidebar);
    console.log('   Right sidebar collapsed:', rightSidebar ? rightSidebar.classList.contains('collapsed') : false);
    
    // Terminal
    console.log('\n%c5. Terminal:', 'font-weight: bold;');
    console.log('   toggleTerminalPanel function:', typeof toggleTerminalPanel);
    console.log('   window.terminalPanelInstance:', !!window.terminalPanelInstance);
    
    // Functions
    console.log('\n%c6. Core Functions:', 'font-weight: bold;');
    console.log('   createNewTab:', typeof createNewTab);
    console.log('   switchTab:', typeof switchTab);
    console.log('   window.openTabs:', !!window.openTabs);
    
    // DOM
    console.log('\n%c7. DOM Elements:', 'font-weight: bold;');
    console.log('   #app exists:', !!document.getElementById('app'));
    console.log('   #main-container exists:', !!document.getElementById('main-container'));
    console.log('   #editor-container exists:', !!document.getElementById('editor-container'));
    console.log('   #tab-bar exists:', !!document.getElementById('tab-bar'));
    
    console.log('\n' + '='.repeat(80));
    console.log('%c📋 DIAGNOSIS COMPLETE', 'color: #00ff88; font-size: 14px; font-weight: bold;');
    console.log('='.repeat(80));
    
    // Determine what's blocking
    if (!window.editor) {
        console.log('%c⚠️ ISSUE: Monaco editor not initialized!', 'color: #ff4757; font-size: 14px; font-weight: bold;');
        console.log('This is blocking the automated tests.');
        console.log('');
        console.log('Possible causes:');
        console.log('  1. Monaco loader failed to load');
        console.log('  2. initMonacoEditor() never called');
        console.log('  3. Monaco container is hidden');
        console.log('  4. Script load order issue');
    }
    
    if (!monacoContainer || monacoContainer.offsetHeight === 0) {
        console.log('%c⚠️ ISSUE: Monaco container not visible!', 'color: #ff4757; font-size: 14px; font-weight: bold;');
        console.log('Container exists but has no height (display: none or hidden)');
    }
    
}, 2000); // Run after 2 seconds

console.log('[ImmediateDiagnostics] 📦 Module loaded - diagnostics running in 2 seconds...');

