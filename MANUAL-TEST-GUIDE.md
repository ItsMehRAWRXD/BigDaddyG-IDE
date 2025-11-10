# Manual Test Guide: Marketplace & Model Catalog Command Palette Integration

## Overview
This guide explains how to manually test the newly added command palette entries for Marketplace and Model Catalog features.

## Prerequisites
- BigDaddyG IDE installed and running
- All npm dependencies installed (`npm install`)

## Test Procedure

### Test 1: Open Command Palette
1. Launch BigDaddyG IDE (`npm start`)
2. Press **Ctrl+Shift+P** to open the command palette
3. **Expected Result**: Command palette opens with search input

### Test 2: Verify Marketplace Commands Appear
1. In the command palette, type "marketplace"
2. **Expected Results**: You should see 4 commands under "Extensions & Marketplace" category:
   - 🛒 Marketplace: Browse Plugins (Ctrl+Shift+M)
   - 🛒 Marketplace: Model Catalog
   - 🛒 Marketplace: API Keys
   - 🛒 Marketplace: Installed Plugins

### Test 3: Test "Browse Plugins" Command
1. In command palette, select "Marketplace: Browse Plugins" or type it and press Enter
2. **Expected Result**: 
   - Plugin marketplace panel opens
   - Panel shows available plugins in a grid layout
   - Can search and filter plugins

### Test 4: Test "Model Catalog" Command
1. Press **Ctrl+Shift+P** again
2. Type "model catalog" and press Enter
3. **Expected Result**:
   - Marketplace opens
   - Ollama Models panel is displayed
   - Shows installed Ollama models (if any)
   - Provides option to pull new models

### Test 5: Test "API Keys" Command
1. Press **Ctrl+Shift+P** again
2. Type "api keys" and press Enter
3. **Expected Result**:
   - Marketplace opens
   - API Key Manager overlay is shown
   - Can add/remove API keys for various providers

### Test 6: Test "Installed Plugins" Command
1. Press **Ctrl+Shift+P** again
2. Type "installed plugins" and press Enter
3. **Expected Result**:
   - Marketplace opens
   - Shows only installed plugins
   - Each plugin has "Uninstall" button

### Test 7: Verify Keyboard Shortcut
1. Close all panels
2. Press **Ctrl+Shift+M** directly (without command palette)
3. **Expected Result**: Marketplace panel opens immediately

### Test 8: Verify Monaco Editor Loading
1. Open or create a file (Ctrl+N)
2. Start typing code
3. **Expected Result**:
   - Monaco editor loads properly
   - Syntax highlighting works
   - Code completion works
   - No console errors about Monaco not loading

## Edge Cases to Test

### Edge Case 1: Commands Before Initialization
1. Immediately after app starts, try opening marketplace from command palette
2. **Expected Result**: 
   - Either marketplace opens successfully
   - OR user sees "Plugin Marketplace is loading. Please try again in a moment."

### Edge Case 2: Search Functionality
1. Open command palette
2. Type partial matches like "market", "model", "api"
3. **Expected Result**: Relevant marketplace commands appear in filtered results

### Edge Case 3: Category Display
1. Open command palette with no search text
2. Scroll through all categories
3. **Expected Result**: "Extensions & Marketplace" category appears with 🛒 icon

## Success Criteria
✅ All 4 marketplace commands appear in command palette  
✅ Each command opens the correct UI when executed  
✅ Keyboard shortcut Ctrl+Shift+M works  
✅ Monaco editor loads without errors  
✅ No JavaScript console errors  
✅ Commands handle pre-initialization state gracefully  

## Troubleshooting

### Issue: Commands don't appear
- **Solution**: Ensure plugin-marketplace.js is loaded before command-palette.js in index.html

### Issue: "Function not available" error
- **Solution**: Wait a few seconds after app start for all modules to initialize

### Issue: Monaco editor not loading
- **Solution**: Check that node_modules/monaco-editor exists and run `npm install` if missing

### Issue: Command palette doesn't open
- **Solution**: Check browser console for errors and verify hotkey-manager.js is loaded

## Automated Validation
Run the automated test script:
```bash
node test-command-palette.js
```

This validates:
- All commands are registered
- All handler methods exist
- Monaco editor is installed
- Scripts are loaded in index.html

## Reporting Issues
If any test fails, please report with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console errors (if any)
5. Screenshot (if UI-related)
