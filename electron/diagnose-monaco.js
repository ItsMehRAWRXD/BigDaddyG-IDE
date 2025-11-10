/**
 * Monaco Editor Diagnostic Tool
 * Run this to verify Monaco bootstrap is working correctly
 */

function diagnoseMonaco() {
    console.log('\n=== Monaco Editor Diagnostic ===');
    
    const results = {
        cssLoaded: false,
        amdLoader: false,
        monacoAvailable: false,
        editorCreated: false,
        containerExists: false,
        containerVisible: false
    };
    
    // Check if Monaco CSS is loaded
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const monacoCss = cssLinks.find(link => link.href.includes('style.css'));
    results.cssLoaded = !!monacoCss;
    console.log(`✅ Monaco CSS: ${results.cssLoaded ? 'LOADED' : '❌ MISSING'}`);
    
    // Check AMD loader
    results.amdLoader = typeof require === 'function' && typeof require.config === 'function';
    console.log(`✅ AMD Loader: ${results.amdLoader ? 'AVAILABLE' : '❌ MISSING'}`);
    
    // Check Monaco availability
    results.monacoAvailable = typeof monaco !== 'undefined';
    console.log(`✅ Monaco Global: ${results.monacoAvailable ? 'AVAILABLE' : '❌ MISSING'}`);
    
    // Check editor container
    const container = document.getElementById('monaco-container');
    results.containerExists = !!container;
    results.containerVisible = container && container.offsetParent !== null;
    console.log(`✅ Editor Container: ${results.containerExists ? 'EXISTS' : '❌ MISSING'}`);
    console.log(`✅ Container Visible: ${results.containerVisible ? 'VISIBLE' : '❌ HIDDEN'}`);
    
    // Check if editor is created
    results.editorCreated = typeof window.editor !== 'undefined' && window.editor !== null;
    console.log(`✅ Editor Instance: ${results.editorCreated ? 'CREATED' : '❌ NOT CREATED'}`);
    
    // Overall status
    const allGreen = Object.values(results).every(Boolean);
    console.log(`\n🎯 Overall Status: ${allGreen ? '✅ ALL GREEN' : '❌ ISSUES FOUND'}`);
    
    if (!allGreen) {
        console.log('\n🔧 Recommended fixes:');
        if (!results.cssLoaded) console.log('  • Monaco CSS not loaded - check file path');
        if (!results.amdLoader) console.log('  • AMD loader missing - check loader.js path');
        if (!results.monacoAvailable) console.log('  • Monaco not loaded - check AMD configuration');
        if (!results.containerExists) console.log('  • Editor container missing from DOM');
        if (!results.containerVisible) console.log('  • Editor container hidden - check CSS display');
        if (!results.editorCreated) console.log('  • Editor not initialized - check initMonacoEditor()');
    }
    
    return results;
}

// Expose globally for easy testing
window.diagnoseMonaco = diagnoseMonaco;

console.log('[BigDaddyG] 🔍 Monaco diagnostic tool loaded. Run diagnoseMonaco() to check status.');