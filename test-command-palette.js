/**
 * Simple validation script to verify command palette changes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Command Palette Integration...\n');

// Test 1: Verify command-palette.js exists and has the required changes
console.log('✓ Test 1: Checking command-palette.js modifications...');
const commandPalettePath = path.join(__dirname, 'electron', 'command-palette.js');
const commandPaletteContent = fs.readFileSync(commandPalettePath, 'utf-8');

const requiredElements = [
    { name: 'Marketplace: Browse Plugins command', pattern: /Marketplace: Browse Plugins/ },
    { name: 'Marketplace: Model Catalog command', pattern: /Marketplace: Model Catalog/ },
    { name: 'Marketplace: API Keys command', pattern: /Marketplace: API Keys/ },
    { name: 'Marketplace: Installed Plugins command', pattern: /Marketplace: Installed Plugins/ },
    { name: 'openMarketplace method', pattern: /openMarketplace\(\)/ },
    { name: 'openModelCatalog method', pattern: /openModelCatalog\(\)/ },
    { name: 'openApiKeyManager method', pattern: /openApiKeyManager\(\)/ },
    { name: 'showInstalledPlugins method', pattern: /showInstalledPlugins\(\)/ },
    { name: 'extensions category', pattern: /extensions.*Extensions & Marketplace/ },
    { name: 'extensions icon', pattern: /extensions.*🛒/ },
    { name: 'shortcut support', pattern: /shortcut:/ },
];

let allPassed = true;
requiredElements.forEach(({ name, pattern }) => {
    if (pattern.test(commandPaletteContent)) {
        console.log(`  ✅ ${name} found`);
    } else {
        console.log(`  ❌ ${name} NOT FOUND`);
        allPassed = false;
    }
});

// Test 2: Verify plugin-marketplace.js has the required functions
console.log('\n✓ Test 2: Checking plugin-marketplace.js functions...');
const marketplacePath = path.join(__dirname, 'electron', 'plugin-marketplace.js');
const marketplaceContent = fs.readFileSync(marketplacePath, 'utf-8');

const requiredFunctions = [
    { name: 'window.openMarketplace', pattern: /window\.openMarketplace\s*=\s*function/ },
    { name: 'window.openModelCatalog', pattern: /window\.openModelCatalog\s*=\s*function/ },
    { name: 'pluginMarketplace.open()', pattern: /window\.pluginMarketplace\.open\(\)/ },
    { name: 'pluginMarketplace.showOllamaManager()', pattern: /window\.pluginMarketplace\.showOllamaManager\(\)/ },
];

requiredFunctions.forEach(({ name, pattern }) => {
    if (pattern.test(marketplaceContent)) {
        console.log(`  ✅ ${name} found`);
    } else {
        console.log(`  ❌ ${name} NOT FOUND`);
        allPassed = false;
    }
});

// Test 3: Verify Monaco editor is installed
console.log('\n✓ Test 3: Checking Monaco editor installation...');
const monacoPath = path.join(__dirname, 'node_modules', 'monaco-editor');
if (fs.existsSync(monacoPath)) {
    const monacoPackage = JSON.parse(fs.readFileSync(path.join(monacoPath, 'package.json'), 'utf-8'));
    console.log(`  ✅ Monaco editor v${monacoPackage.version} installed`);
} else {
    console.log(`  ❌ Monaco editor NOT installed`);
    allPassed = false;
}

// Test 4: Verify index.html loads both files
console.log('\n✓ Test 4: Checking index.html loads required scripts...');
const indexPath = path.join(__dirname, 'electron', 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

const requiredScripts = [
    { name: 'command-palette.js', pattern: /<script\s+src="command-palette\.js"><\/script>/ },
    { name: 'plugin-marketplace.js', pattern: /<script\s+src="plugin-marketplace\.js"><\/script>/ },
];

requiredScripts.forEach(({ name, pattern }) => {
    if (pattern.test(indexContent)) {
        console.log(`  ✅ ${name} loaded in index.html`);
    } else {
        console.log(`  ❌ ${name} NOT loaded in index.html`);
        allPassed = false;
    }
});

// Final result
console.log('\n' + '='.repeat(50));
if (allPassed) {
    console.log('✅ All tests PASSED! Command palette integration is complete.');
    console.log('\nNext steps:');
    console.log('  1. Run `npm start` to test the application');
    console.log('  2. Press Ctrl+Shift+P to open command palette');
    console.log('  3. Search for "Marketplace" to see the new commands');
    console.log('  4. Try opening the marketplace with Ctrl+Shift+M');
    process.exit(0);
} else {
    console.log('❌ Some tests FAILED. Please review the output above.');
    process.exit(1);
}
