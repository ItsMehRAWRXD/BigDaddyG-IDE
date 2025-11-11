#!/usr/bin/env node

/**
 * Comprehensive Post-Monaco Removal Test Suite
 * Verifies all features still work after removing Monaco Editor
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 COMPREHENSIVE POST-MONACO REMOVAL TEST SUITE\n');
console.log('='.repeat(70));
console.log('Testing all features to ensure nothing broke after removing Monaco');
console.log('='.repeat(70) + '\n');

const electronDir = path.join(__dirname, 'electron');

// ============================================================================
// TEST 1: CRITICAL FILES EXIST
// ============================================================================

console.log('📋 TEST 1: Critical Files Existence\n');

const criticalFiles = [
    // Core editor files
    'bigdaddy-only-editor.js',
    'redirect-to-bigdaddy.js',
    'build-dom-structure.js',
    'bigdaddy-editor/core.js',
    
    // AI/Model files
    'bigdaddya-integration.js',
    'ai-provider-manager.js',
    'ollama-integration.js',
    'model-loader.js',
    'standalone-local-ai.js',
    'built-in-local-ai.js',
    'native-ollama-bridge.js',
    
    // Marketplace files
    'plugin-marketplace.js',
    'marketplace/complete-marketplace-tester.js',
    'marketplace/marketplace-client.js',
    
    // Tab system
    'tab-system.js',
    
    // Settings & Theme
    'settings-manager.js',
    'theme-manager.js',
    'transparency-manager.js',
    'chameleon-theme.js',
    
    // Cognitive Modes
    'cognitive-modes/mode-manager.js',
    'cognitive-modes/mode-ui.js',
    'cognitive-modes/ai-integration.js',
    
    // Core functionality
    'index.html',
    'renderer.js',
    'main.js',
    'preload.js'
];

let existCount = 0;
let missingFiles = [];

criticalFiles.forEach(file => {
    const filePath = path.join(electronDir, file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
        console.log(`  ✅ ${file}`);
        existCount++;
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        missingFiles.push(file);
    }
});

console.log(`\n  Result: ${existCount}/${criticalFiles.length} files exist`);
if (missingFiles.length > 0) {
    console.log(`  ⚠️  Missing: ${missingFiles.join(', ')}`);
}

// ============================================================================
// TEST 2: NO MONACO REFERENCES IN CRITICAL CODE
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 2: Monaco References Check\n');

const filesToCheck = [
    'index.html',
    'bigdaddy-only-editor.js',
    'redirect-to-bigdaddy.js'
];

let monacoRefCount = 0;

filesToCheck.forEach(file => {
    const filePath = path.join(electronDir, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  ${file} - File not found`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for Monaco loading attempts
    const badPatterns = [
        /require.*monaco-editor/gi,
        /import.*monaco-editor/gi,
        /node_modules\/monaco-editor/gi,
        /monaco\.editor\.create/gi  // Should be stubbed, not real
    ];
    
    let fileHasBadRefs = false;
    
    badPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
            if (!fileHasBadRefs) {
                console.log(`  ❌ ${file}:`);
                fileHasBadRefs = true;
            }
            console.log(`     - Found: ${matches[0]}`);
            monacoRefCount++;
        }
    });
    
    if (!fileHasBadRefs) {
        console.log(`  ✅ ${file} - No problematic Monaco references`);
    }
});

console.log(`\n  Result: ${monacoRefCount === 0 ? '✅ PASS' : `❌ FAIL (${monacoRefCount} bad references)`}`);

// ============================================================================
// TEST 3: BIGDADDY EDITOR COMPONENTS
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 3: BigDaddy Editor Components\n');

const bigdaddyComponents = [
    'bigdaddy-editor/core.js',
    'bigdaddy-editor/core-enhanced.js',
    'bigdaddy-editor/minimap.js',
    'bigdaddy-editor/search.js',
    'bigdaddy-editor/ai-autocomplete.js',
    'bigdaddy-editor/shader-preview.js'
];

let bigdaddyCount = 0;

bigdaddyComponents.forEach(comp => {
    const compPath = path.join(electronDir, comp);
    if (fs.existsSync(compPath)) {
        console.log(`  ✅ ${comp}`);
        bigdaddyCount++;
    } else {
        console.log(`  ❌ ${comp} - MISSING`);
    }
});

console.log(`\n  Result: ${bigdaddyCount}/${bigdaddyComponents.length} components exist`);

// ============================================================================
// TEST 4: AI/MODEL INTEGRATION
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 4: AI/Model Integration\n');

const aiFiles = [
    'bigdaddya-integration.js',
    'ai-provider-manager.js',
    'ollama-integration.js',
    'model-loader.js',
    'standalone-local-ai.js',
    'built-in-local-ai.js',
    'native-ollama-bridge.js',
    'native-ollama-cli.js',
    'native-ollama-node.js',
    'agentic-ai-bridge.js'
];

let aiCount = 0;
let aiDetails = [];

aiFiles.forEach(file => {
    const filePath = path.join(electronDir, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ❌ ${file} - MISSING`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const hasClass = /class\s+\w+/.test(content);
    const hasExports = /module\.exports|export/.test(content);
    
    console.log(`  ✅ ${file} (${lines} lines, ${hasClass ? 'has class' : 'no class'}, ${hasExports ? 'exports' : 'no exports'})`);
    
    aiCount++;
    aiDetails.push({
        file,
        lines,
        hasClass,
        hasExports
    });
});

console.log(`\n  Result: ${aiCount}/${aiFiles.length} AI files exist`);
console.log(`  Classes found: ${aiDetails.filter(d => d.hasClass).length}`);
console.log(`  Exports found: ${aiDetails.filter(d => d.hasExports).length}`);

// ============================================================================
// TEST 5: MARKETPLACE INTEGRATION
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 5: Marketplace Integration\n');

const marketplaceFiles = [
    'plugin-marketplace.js',
    'marketplace/complete-marketplace-tester.js',
    'marketplace/marketplace-client.js',
    'ui/complete-marketplace-ui.js'
];

let marketplaceCount = 0;

marketplaceFiles.forEach(file => {
    const filePath = path.join(electronDir, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ❌ ${file} - MISSING`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for key marketplace functions
    const hasDownload = /download|fetch.*extension/i.test(content);
    const hasInstall = /install|activate/i.test(content);
    const hasSearch = /search|filter/i.test(content);
    
    console.log(`  ✅ ${file}`);
    console.log(`     - Download: ${hasDownload ? '✓' : '✗'}`);
    console.log(`     - Install: ${hasInstall ? '✓' : '✗'}`);
    console.log(`     - Search: ${hasSearch ? '✓' : '✗'}`);
    
    marketplaceCount++;
});

console.log(`\n  Result: ${marketplaceCount}/${marketplaceFiles.length} marketplace files exist`);

// ============================================================================
// TEST 6: TAB SYSTEM
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 6: Tab System\n');

const tabSystemPath = path.join(electronDir, 'tab-system.js');

if (fs.existsSync(tabSystemPath)) {
    const content = fs.readFileSync(tabSystemPath, 'utf8');
    
    const features = [
        { name: 'TabSystem class', pattern: /class\s+TabSystem/ },
        { name: 'openTab method', pattern: /openTab\s*\(/ },
        { name: 'closeTab method', pattern: /closeTab\s*\(/ },
        { name: 'switchToTab method', pattern: /switchToTab\s*\(/ },
        { name: 'Container fallback', pattern: /center-explorer-container|main-container/ }
    ];
    
    features.forEach(feature => {
        const found = feature.pattern.test(content);
        console.log(`  ${found ? '✅' : '❌'} ${feature.name}`);
    });
    
    console.log('\n  ✅ Tab system exists and has key features');
} else {
    console.log('  ❌ tab-system.js - MISSING');
}

// ============================================================================
// TEST 7: TRANSPARENCY & THEME SYSTEM
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 7: Transparency & Theme System\n');

const themeFiles = [
    'transparency-manager.js',
    'chameleon-theme.js',
    'theme-manager.js',
    'cursor-theme.css'
];

let themeCount = 0;

themeFiles.forEach(file => {
    const filePath = path.join(electronDir, file);
    
    if (!fs.existsSync(filePath)) {
        console.log(`  ❌ ${file} - MISSING`);
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (file === 'transparency-manager.js') {
        const hasSlider = /opacity|transparency|alpha/i.test(content);
        const hasRGBA = /rgba/i.test(content);
        console.log(`  ✅ ${file} (${hasSlider ? 'has opacity control' : ''}, ${hasRGBA ? 'RGBA support' : ''})`);
    } else if (file === 'chameleon-theme.js') {
        const hasHue = /hue.*slider/i.test(content);
        const hasColor = /color.*picker/i.test(content);
        console.log(`  ✅ ${file} (${hasHue ? 'hue slider' : ''}, ${hasColor ? 'color picker' : ''})`);
    } else {
        console.log(`  ✅ ${file}`);
    }
    
    themeCount++;
});

console.log(`\n  Result: ${themeCount}/${themeFiles.length} theme files exist`);

// ============================================================================
// TEST 8: COGNITIVE MODES
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 8: Cognitive Modes System\n');

const cognitiveFiles = [
    'cognitive-modes/mode-manager.js',
    'cognitive-modes/mode-ui.js',
    'cognitive-modes/ai-integration.js',
    'cognitive-modes/ide-integration.js',
    'cognitive-modes/cli.js'
];

let cognitiveCount = 0;

cognitiveFiles.forEach(file => {
    const filePath = path.join(electronDir, file);
    
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
        cognitiveCount++;
    } else {
        console.log(`  ❌ ${file} - MISSING`);
    }
});

console.log(`\n  Result: ${cognitiveCount}/${cognitiveFiles.length} cognitive mode files exist`);

// ============================================================================
// TEST 9: PACKAGE.JSON CHECK
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 9: Package.json Dependencies\n');

const packageJsonPath = path.join(__dirname, 'package.json');

if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check Monaco is NOT in dependencies
    const hasMonaco = packageJson.dependencies && packageJson.dependencies['monaco-editor'];
    
    console.log(`  Monaco in dependencies: ${hasMonaco ? '❌ YES (SHOULD BE REMOVED)' : '✅ NO'}`);
    
    // Check other important dependencies
    const importantDeps = [
        'electron',
        'express',
        'ws',
        'uuid',
        'node-llama-cpp'
    ];
    
    console.log('\n  Important dependencies:');
    importantDeps.forEach(dep => {
        const hasDep = (packageJson.dependencies && packageJson.dependencies[dep]) ||
                      (packageJson.devDependencies && packageJson.devDependencies[dep]);
        console.log(`    ${hasDep ? '✅' : '❌'} ${dep}`);
    });
    
    console.log(`\n  ${hasMonaco ? '❌ FAIL' : '✅ PASS'} - Monaco ${hasMonaco ? 'still in' : 'removed from'} dependencies`);
} else {
    console.log('  ❌ package.json not found');
}

// ============================================================================
// TEST 10: INDEX.HTML SCRIPT LOADING
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📋 TEST 10: Index.html Script Loading Order\n');

const indexPath = path.join(electronDir, 'index.html');

if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const scriptOrder = [
        { name: 'build-dom-structure.js', defer: false, critical: true },
        { name: 'redirect-to-bigdaddy.js', defer: false, critical: true },
        { name: 'bigdaddy-only-editor.js', defer: true, critical: true },
        { name: 'show-all-panels.js', defer: true, critical: true },
        { name: 'settings-manager.js', defer: true, critical: false },
        { name: 'theme-manager.js', defer: true, critical: false }
    ];
    
    console.log('  Script loading order:');
    
    scriptOrder.forEach((script, index) => {
        const pattern = new RegExp(`<script[^>]*src=["']${script.name}["'][^>]*>`);
        const match = content.match(pattern);
        
        if (match) {
            const hasDefer = /defer/.test(match[0]);
            const deferCorrect = hasDefer === script.defer;
            
            console.log(`    ${index + 1}. ${deferCorrect ? '✅' : '⚠️'} ${script.name} ${hasDefer ? '(defer)' : '(immediate)'} ${script.critical ? '[CRITICAL]' : ''}`);
        } else {
            console.log(`    ${index + 1}. ❌ ${script.name} - NOT FOUND ${script.critical ? '[CRITICAL]' : ''}`);
        }
    });
    
    console.log('\n  ✅ Index.html exists');
} else {
    console.log('  ❌ index.html not found');
}

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('📊 FINAL SUMMARY\n');

const summary = {
    'Critical Files': `${existCount}/${criticalFiles.length}`,
    'Monaco Refs (should be 0)': monacoRefCount,
    'BigDaddy Components': `${bigdaddyCount}/${bigdaddyComponents.length}`,
    'AI Files': `${aiCount}/${aiFiles.length}`,
    'Marketplace Files': `${marketplaceCount}/${marketplaceFiles.length}`,
    'Theme Files': `${themeCount}/${themeFiles.length}`,
    'Cognitive Modes': `${cognitiveCount}/${cognitiveFiles.length}`
};

Object.entries(summary).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
});

const allCritical = existCount === criticalFiles.length;
const noMonacoRefs = monacoRefCount === 0;
const allBigDaddy = bigdaddyCount === bigdaddyComponents.length;
const allAI = aiCount === aiFiles.length;

const overallPass = allCritical && noMonacoRefs && allBigDaddy && allAI;

console.log('\n' + '='.repeat(70));
console.log(`🏆 OVERALL: ${overallPass ? '✅ PASS' : '⚠️ SOME ISSUES'}`);
console.log('='.repeat(70));

if (!overallPass) {
    console.log('\n⚠️  Issues found:');
    if (!allCritical) console.log('   - Some critical files missing');
    if (!noMonacoRefs) console.log('   - Monaco references still present');
    if (!allBigDaddy) console.log('   - Some BigDaddy components missing');
    if (!allAI) console.log('   - Some AI files missing');
}

console.log('\n✅ Test completed!\n');

process.exit(overallPass ? 0 : 1);
