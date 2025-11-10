#!/usr/bin/env node
/**
 * Quick setup verification test
 * Checks if all critical dependencies are available
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 BigDaddyG IDE - Setup Verification Test\n');
console.log('=' .repeat(60));

let allPassed = true;

// Test 1: Monaco Editor
console.log('\n📦 Test 1: Monaco Editor');
const monacoPath = path.join(__dirname, 'node_modules', 'monaco-editor');
if (fs.existsSync(monacoPath)) {
    const monacoPackage = JSON.parse(fs.readFileSync(path.join(monacoPath, 'package.json'), 'utf8'));
    console.log(`  ✅ Monaco Editor installed (v${monacoPackage.version})`);
    
    const monacoMinPath = path.join(monacoPath, 'min', 'vs');
    if (fs.existsSync(monacoMinPath)) {
        console.log('  ✅ Monaco min files available');
    } else {
        console.log('  ❌ Monaco min files missing');
        allPassed = false;
    }
    
    const monacoCss = path.join(monacoPath, 'min', 'vs', 'style.css');
    if (fs.existsSync(monacoCss)) {
        console.log('  ✅ Monaco CSS file exists');
    } else {
        console.log('  ❌ Monaco CSS file missing');
        allPassed = false;
    }
    
    const monacoLoader = path.join(monacoPath, 'min', 'vs', 'loader.js');
    if (fs.existsSync(monacoLoader)) {
        console.log('  ✅ Monaco AMD loader exists');
    } else {
        console.log('  ❌ Monaco AMD loader missing');
        allPassed = false;
    }
} else {
    console.log('  ❌ Monaco Editor not installed');
    allPassed = false;
}

// Test 2: Electron
console.log('\n📦 Test 2: Electron');
const electronPath = path.join(__dirname, 'node_modules', 'electron');
if (fs.existsSync(electronPath)) {
    const electronPackage = JSON.parse(fs.readFileSync(path.join(electronPath, 'package.json'), 'utf8'));
    console.log(`  ✅ Electron installed (v${electronPackage.version})`);
} else {
    console.log('  ❌ Electron not installed');
    allPassed = false;
}

// Test 3: Critical Files
console.log('\n📄 Test 3: Critical IDE Files');
const criticalFiles = [
    'electron/main.js',
    'electron/index.html',
    'electron/renderer.js',
    'electron/hotkey-manager.js',
    'electron/preload.js'
];

criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} missing`);
        allPassed = false;
    }
});

// Test 4: Hotkey Configuration
console.log('\n⌨️  Test 4: Hotkey Configuration');
const hotkeyManagerPath = path.join(__dirname, 'electron', 'hotkey-manager.js');
const hotkeyContent = fs.readFileSync(hotkeyManagerPath, 'utf8');

const hotkeysToCheck = [
    { name: 'Memory Dashboard', key: 'Ctrl+Shift+M', search: "'memory.dashboard'" },
    { name: 'Swarm Engine', key: 'Ctrl+Alt+S', search: "'swarm.engine'" }
];

hotkeysToCheck.forEach(hotkey => {
    if (hotkeyContent.includes(hotkey.search)) {
        console.log(`  ✅ ${hotkey.name} (${hotkey.key}) configured`);
    } else {
        console.log(`  ❌ ${hotkey.name} (${hotkey.key}) not found`);
        allPassed = false;
    }
});

// Test 5: Package.json
console.log('\n📋 Test 5: Package Configuration');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
console.log(`  ✅ Package name: ${packageJson.name}`);
console.log(`  ✅ Package version: ${packageJson.version}`);
console.log(`  ✅ Main entry: ${packageJson.main}`);

if (packageJson.scripts && packageJson.scripts.start) {
    console.log(`  ✅ Start script: ${packageJson.scripts.start}`);
} else {
    console.log('  ❌ Start script missing');
    allPassed = false;
}

// Summary
console.log('\n' + '='.repeat(60));
if (allPassed) {
    console.log('\n✅ All tests passed! Setup looks good.');
    console.log('\nNext steps:');
    console.log('  1. Run: npm start');
    console.log('  2. Test Monaco editor loads');
    console.log('  3. Test hotkeys (Ctrl+Shift+M, Ctrl+Alt+S)');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
    process.exit(1);
}
