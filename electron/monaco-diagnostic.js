/**
 * Monaco Editor Diagnostic Tool
 * Helps debug why Monaco isn't initializing
 */

window.diagnoseMonaco = function() {
    console.clear();
    console.log('%c═══════════════════════════════════════', 'color: cyan; font-weight: bold');
    console.log('%c   🔍 MONACO EDITOR DIAGNOSTIC', 'color: cyan; font-weight: bold; font-size: 16px');
    console.log('%c═══════════════════════════════════════', 'color: cyan; font-weight: bold');
    console.log('');
    
    // Check Monaco library
    console.log('%c1. Monaco Library:', 'font-weight: bold; color: yellow');
    console.log('   Loaded:', !!window.monaco);
    console.log('   Version:', window.monaco?.version || 'N/A');
    console.log('   Editor API:', !!window.monaco?.editor);
    console.log('');
    
    // Check container
    console.log('%c2. Monaco Container:', 'font-weight: bold; color: yellow');
    const container = document.getElementById('monaco-container');
    console.log('   Element exists:', !!container);
    
    if (container) {
        const rect = container.getBoundingClientRect();
        console.log('   Visible:', container.style.display !== 'none');
        console.log('   Display:', window.getComputedStyle(container).display);
        console.log('   Width:', rect.width + 'px');
        console.log('   Height:', rect.height + 'px');
        console.log('   Parent:', container.parentElement?.id || 'N/A');
        console.log('   Classes:', container.className || 'none');
    } else {
        console.log('%c   ❌ Container not found in DOM!', 'color: red; font-weight: bold');
        console.log('   💡 Need to add: <div id="monaco-container"></div>');
    }
    console.log('');
    
    // Check editor instance
    console.log('%c3. Editor Instance:', 'font-weight: bold; color: yellow');
    console.log('   window.editor:', !!window.editor);
    console.log('   window.monacoEditor:', !!window.monacoEditor);
    
    if (window.editor) {
        console.log('   getValue:', typeof window.editor.getValue);
        console.log('   setValue:', typeof window.editor.setValue);
        console.log('   getModel:', typeof window.editor.getModel);
    }
    console.log('');
    
    // Check initialization functions
    console.log('%c4. Initialization:', 'font-weight: bold; color: yellow');
    console.log('   initMonacoEditor:', typeof window.initMonacoEditor);
    console.log('   onMonacoLoad:', typeof window.onMonacoLoad);
    console.log('');
    
    // Check for errors
    console.log('%c5. Recent Errors:', 'font-weight: bold; color: yellow');
    if (window.errorTracker && window.errorTracker.errors) {
        const monacoErrors = window.errorTracker.errors.filter(e => 
            e.message.toLowerCase().includes('monaco') ||
            e.stack?.includes('monaco') ||
            e.stack?.includes('editor')
        );
        
        if (monacoErrors.length > 0) {
            console.log(`   Found ${monacoErrors.length} Monaco-related error(s):`);
            monacoErrors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err.message}`);
            });
        } else {
            console.log('   No Monaco-specific errors');
        }
    }
    console.log('');
    
    // Recommendations
    console.log('%c6. Recommendations:', 'font-weight: bold; color: cyan');
    
    if (!window.monaco) {
        console.log('   🔴 Monaco library not loaded');
        console.log('      → Check if monaco-editor is in node_modules');
        console.log('      → Check script loading order in index.html');
    }
    
    if (!container) {
        console.log('   🔴 Monaco container missing from DOM');
        console.log('      → Add: <div id="monaco-container" style="width:100%;height:100%"></div>');
        console.log('      → Place it in a visible parent with dimensions');
    }
    
    if (container && container.getBoundingClientRect().height === 0) {
        console.log('   🔴 Monaco container has no height');
        console.log('      → Make sure parent has height');
        console.log('      → Try: container.style.height = "600px"');
    }
    
    if (!window.editor && window.monaco && container) {
        console.log('   🟡 Everything ready but editor not created');
        console.log('      → Try manually: tryCreateEditor()');
    }
    
    if (window.editor) {
        console.log('   ✅ Editor is initialized and ready!');
    }
    
    console.log('');
    console.log('%c═══════════════════════════════════════', 'color: cyan; font-weight: bold');
};

// Quick fix function
window.tryCreateEditor = function() {
    if (!window.monaco) {
        console.error('❌ Monaco not loaded');
        return;
    }
    
    let container = document.getElementById('monaco-container');
    
    if (!container) {
        console.log('📦 Creating monaco-container...');
        container = document.createElement('div');
        container.id = 'monaco-container';
        container.style.cssText = 'width: 100%; height: 600px; border: 1px solid #444;';
        
        // Try to find a good parent
        const editorArea = document.getElementById('editor-area') || 
                          document.getElementById('editor-container') ||
                          document.getElementById('main-container') ||
                          document.body;
        
        editorArea.appendChild(container);
        console.log('✅ Container created in:', editorArea.id || 'body');
    }
    
    if (window.editor) {
        console.log('⚠️  Editor already exists');
        return window.editor;
    }
    
    try {
        console.log('🎨 Creating Monaco editor...');
        
        window.editor = window.monaco.editor.create(container, {
            value: '// Welcome to BigDaddyG IDE!\n// Monaco editor is now initialized\n\nconsole.log("Hello World!");',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on'
        });
        
        console.log('✅ Monaco editor created successfully!');
        console.log('📝 Try typing in the editor');
        
        return window.editor;
        
    } catch (error) {
        console.error('❌ Failed to create editor:', error);
        console.error('Stack:', error.stack);
        return null;
    }
};

console.log('%c✅ Monaco diagnostic tools loaded!', 'color: #00ff00; font-weight: bold');
console.log('%c   Run: diagnoseMonaco()    - Full diagnostic', 'color: #888');
console.log('%c   Run: tryCreateEditor()   - Attempt to create editor', 'color: #888');
