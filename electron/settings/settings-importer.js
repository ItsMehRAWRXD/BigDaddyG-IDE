/**
 * BigDaddyG IDE - VS Code Settings Importer
 * Import all your VS Code/Cursor settings, extensions, keybindings, and layouts
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class SettingsImporter extends EventEmitter {
    constructor(marketplace, extensionHost) {
        super();
        
        this.marketplace = marketplace;
        this.extensionHost = extensionHost;
        
        // VS Code/Cursor config locations
        this.vscodeLocations = {
            win32: {
                vscode: path.join(process.env.APPDATA, 'Code', 'User'),
                cursor: path.join(process.env.APPDATA, 'Cursor', 'User'),
                cursorSettings: path.join(process.env.APPDATA, 'Cursor'),
                extensions: [
                    path.join(process.env.USERPROFILE, '.vscode', 'extensions'),
                    path.join(process.env.USERPROFILE, '.cursor', 'extensions')
                ]
            },
            darwin: {
                vscode: path.join(process.env.HOME, 'Library', 'Application Support', 'Code', 'User'),
                cursor: path.join(process.env.HOME, 'Library', 'Application Support', 'Cursor', 'User'),
                cursorSettings: path.join(process.env.HOME, 'Library', 'Application Support', 'Cursor'),
                extensions: [
                    path.join(process.env.HOME, '.vscode', 'extensions'),
                    path.join(process.env.HOME, '.cursor', 'extensions')
                ]
            },
            linux: {
                vscode: path.join(process.env.HOME, '.config', 'Code', 'User'),
                cursor: path.join(process.env.HOME, '.config', 'Cursor', 'User'),
                cursorSettings: path.join(process.env.HOME, '.config', 'Cursor'),
                extensions: [
                    path.join(process.env.HOME, '.vscode', 'extensions'),
                    path.join(process.env.HOME, '.cursor', 'extensions')
                ]
            }
        };
        
        // BigDaddyG settings location
        this.bigdaddygPath = path.join(
            process.env.APPDATA || process.env.HOME,
            'BigDaddyG'
        );
        
        console.log('[Settings Importer] 🔄 Initialized');
    }
    
    /**
     * Auto-detect and import from VS Code/Cursor
     */
    async autoImport() {
        console.log('[Settings Importer] 🔍 Auto-detecting VS Code/Cursor installations...');
        
        const platform = process.platform;
        const locations = this.vscodeLocations[platform];
        
        if (!locations) {
            throw new Error(`Unsupported platform: ${platform}`);
        }
        
        const results = {
            settings: null,
            keybindings: null,
            extensions: [],
            snippets: {},
            themes: [],
            memories: {},
            rules: null
        };
        
        // Try Cursor first (most recent)
        console.log('[Settings Importer] Checking Cursor...');
        if (await this.directoryExists(locations.cursor)) {
            console.log('[Settings Importer] ✅ Found Cursor installation');
            results.settings = await this.importSettings(locations.cursor);
            results.keybindings = await this.importKeybindings(locations.cursor);
            results.snippets = await this.importSnippets(locations.cursor);
            results.memories = await this.importCursorMemories(locations.cursorSettings);
            results.rules = await this.importCursorRules(locations.cursorSettings);
        }
        
        // Try VS Code (fallback)
        if (!results.settings && await this.directoryExists(locations.vscode)) {
            console.log('[Settings Importer] ✅ Found VS Code installation');
            results.settings = await this.importSettings(locations.vscode);
            results.keybindings = await this.importKeybindings(locations.vscode);
            results.snippets = await this.importSnippets(locations.vscode);
        }
        
        // Import extensions
        for (const extDir of locations.extensions) {
            if (await this.directoryExists(extDir)) {
                const exts = await this.importExtensions(extDir);
                results.extensions.push(...exts);
            }
        }
        
        // Remove duplicates
        results.extensions = [...new Set(results.extensions)];
        
        console.log('[Settings Importer] 📊 Import Summary:');
        console.log(`  Settings:     ${results.settings ? '✅' : '❌'}`);
        console.log(`  Keybindings:  ${results.keybindings ? '✅' : '❌'}`);
        console.log(`  Extensions:   ${results.extensions.length}`);
        console.log(`  Snippets:     ${Object.keys(results.snippets).length}`);
        console.log(`  Memories:     ${Object.keys(results.memories).length}`);
        console.log(`  Rules:        ${results.rules ? '✅' : '❌'}`);
        
        return results;
    }
    
    /**
     * Import settings.json
     */
    async importSettings(userDir) {
        const settingsPath = path.join(userDir, 'settings.json');
        
        try {
            const content = await fs.readFile(settingsPath, 'utf8');
            
            // Parse JSON (with comments support)
            const settings = this.parseJsonWithComments(content);
            
            console.log('[Settings Importer] ✅ Imported settings.json');
            
            return settings;
            
        } catch (error) {
            console.log('[Settings Importer] ⚠️ No settings.json found');
            return null;
        }
    }
    
    /**
     * Import keybindings.json
     */
    async importKeybindings(userDir) {
        const keybindingsPath = path.join(userDir, 'keybindings.json');
        
        try {
            const content = await fs.readFile(keybindingsPath, 'utf8');
            const keybindings = this.parseJsonWithComments(content);
            
            console.log('[Settings Importer] ✅ Imported keybindings.json');
            
            return keybindings;
            
        } catch (error) {
            console.log('[Settings Importer] ⚠️ No keybindings.json found');
            return null;
        }
    }
    
    /**
     * Import snippets
     */
    async importSnippets(userDir) {
        const snippetsDir = path.join(userDir, 'snippets');
        const snippets = {};
        
        try {
            const files = await fs.readdir(snippetsDir);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const snippetPath = path.join(snippetsDir, file);
                    const content = await fs.readFile(snippetPath, 'utf8');
                    const snippetData = this.parseJsonWithComments(content);
                    
                    const language = file.replace('.json', '');
                    snippets[language] = snippetData;
                }
            }
            
            console.log(`[Settings Importer] ✅ Imported ${Object.keys(snippets).length} snippet files`);
            
        } catch (error) {
            console.log('[Settings Importer] ⚠️ No snippets found');
        }
        
        return snippets;
    }
    
    /**
     * Import installed extensions
     */
    async importExtensions(extensionsDir) {
        const extensions = [];
        
        try {
            const entries = await fs.readdir(extensionsDir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    // Extension format: publisher.name-version
                    const match = entry.name.match(/^([^.]+)\.([^-]+)-(.+)$/);
                    
                    if (match) {
                        const [, publisher, name, version] = match;
                        const extensionId = `${publisher}.${name}`;
                        
                        extensions.push({
                            id: extensionId,
                            publisher,
                            name,
                            version,
                            directory: entry.name
                        });
                    }
                }
            }
            
            console.log(`[Settings Importer] ✅ Found ${extensions.length} installed extensions`);
            
        } catch (error) {
            console.log('[Settings Importer] ⚠️ Could not read extensions directory');
        }
        
        return extensions;
    }
    
    /**
     * Import Cursor memories (experimental feature)
     */
    async importCursorMemories(cursorDir) {
        const memoriesPath = path.join(cursorDir, 'memories');
        const memories = {};
        
        try {
            if (await this.directoryExists(memoriesPath)) {
                // Cursor stores memories in unknown format
                // Try to parse any JSON files
                const files = await fs.readdir(memoriesPath);
                
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const memPath = path.join(memoriesPath, file);
                        const content = await fs.readFile(memPath, 'utf8');
                        
                        try {
                            const data = JSON.parse(content);
                            Object.assign(memories, data);
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
                
                console.log(`[Settings Importer] ✅ Imported ${Object.keys(memories).length} Cursor memories`);
            }
        } catch (error) {
            console.log('[Settings Importer] ⚠️ No Cursor memories found');
        }
        
        return memories;
    }
    
    /**
     * Import .cursorrules
     */
    async importCursorRules(cursorDir) {
        // Check project root for .cursorrules
        const cursorrules = path.join(process.cwd(), '.cursorrules');
        
        try {
            const content = await fs.readFile(cursorrules, 'utf8');
            
            console.log('[Settings Importer] ✅ Imported .cursorrules');
            
            // Convert to BigDaddyG rule format
            return {
                name: 'Imported from .cursorrules',
                type: 'system',
                content: content.trim(),
                priority: 10,
                enabled: true,
                imported: true,
                importedFrom: 'cursor'
            };
            
        } catch (error) {
            console.log('[Settings Importer] ⚠️ No .cursorrules found');
            return null;
        }
    }
    
    /**
     * Apply imported settings to BigDaddyG
     */
    async applyImportedSettings(importResults) {
        console.log('[Settings Importer] 🔧 Applying imported settings...');
        
        const bigdaddygSettings = {
            version: '2.0',
            importedFrom: [],
            timestamp: new Date().toISOString()
        };
        
        // Apply settings
        if (importResults.settings) {
            bigdaddygSettings.editor = importResults.settings;
            bigdaddygSettings.importedFrom.push('settings.json');
            
            await this.saveSettings('settings.json', importResults.settings);
            console.log('[Settings Importer] ✅ Applied settings');
        }
        
        // Apply keybindings
        if (importResults.keybindings) {
            bigdaddygSettings.keybindings = importResults.keybindings;
            bigdaddygSettings.importedFrom.push('keybindings.json');
            
            await this.saveSettings('keybindings.json', importResults.keybindings);
            console.log('[Settings Importer] ✅ Applied keybindings');
        }
        
        // Apply snippets
        if (Object.keys(importResults.snippets).length > 0) {
            bigdaddygSettings.snippets = importResults.snippets;
            bigdaddygSettings.importedFrom.push('snippets');
            
            await this.saveSettings('snippets.json', importResults.snippets);
            console.log('[Settings Importer] ✅ Applied snippets');
        }
        
        // Apply memories
        if (Object.keys(importResults.memories).length > 0) {
            bigdaddygSettings.importedFrom.push('memories');
            
            await this.saveSettings('memories.json', importResults.memories);
            console.log('[Settings Importer] ✅ Applied memories');
        }
        
        // Apply rules
        if (importResults.rules) {
            bigdaddygSettings.importedFrom.push('.cursorrules');
            
            const rulesArray = Array.isArray(importResults.rules) 
                ? importResults.rules 
                : [importResults.rules];
            
            await this.saveSettings('rules.json', rulesArray);
            console.log('[Settings Importer] ✅ Applied rules');
        }
        
        // Queue extensions for installation
        if (importResults.extensions.length > 0) {
            bigdaddygSettings.queuedExtensions = importResults.extensions;
            console.log(`[Settings Importer] 📦 Queued ${importResults.extensions.length} extensions for installation`);
        }
        
        // Save master import record
        await this.saveSettings('import-record.json', bigdaddygSettings);
        
        console.log('[Settings Importer] ✅ All settings applied successfully');
        
        this.emit('import-complete', bigdaddygSettings);
        
        return bigdaddygSettings;
    }
    
    /**
     * Install imported extensions
     */
    async installImportedExtensions(extensions, onProgress = null) {
        console.log(`[Settings Importer] 📦 Installing ${extensions.length} extensions...`);
        
        const results = {
            successful: [],
            failed: [],
            skipped: []
        };
        
        for (let i = 0; i < extensions.length; i++) {
            const ext = extensions[i];
            
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: extensions.length,
                    extension: ext.id
                });
            }
            
            console.log(`[Settings Importer] [${i + 1}/${extensions.length}] Installing ${ext.id}...`);
            
            try {
                // Check if already installed
                const installed = await this.marketplace.listInstalledExtensions();
                if (installed.some(e => e.id === ext.id)) {
                    console.log(`[Settings Importer] ⏭️ Already installed: ${ext.id}`);
                    results.skipped.push(ext.id);
                    continue;
                }
                
                // Download and install
                const vsixPath = await this.marketplace.downloadExtension(ext.publisher, ext.name, ext.version);
                await this.marketplace.installExtension(vsixPath, this.extensionHost);
                
                results.successful.push(ext.id);
                console.log(`[Settings Importer] ✅ Installed: ${ext.id}`);
                
            } catch (error) {
                console.error(`[Settings Importer] ❌ Failed to install ${ext.id}:`, error.message);
                results.failed.push({ id: ext.id, error: error.message });
            }
        }
        
        console.log('[Settings Importer] 📊 Installation Summary:');
        console.log(`  Successful: ${results.successful.length}`);
        console.log(`  Failed:     ${results.failed.length}`);
        console.log(`  Skipped:    ${results.skipped.length}`);
        
        this.emit('extensions-installed', results);
        
        return results;
    }
    
    /**
     * Export current BigDaddyG settings
     */
    async exportSettings() {
        console.log('[Settings Importer] 📤 Exporting BigDaddyG settings...');
        
        const exportData = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            platform: process.platform,
            settings: {},
            keybindings: [],
            snippets: {},
            memories: {},
            rules: [],
            extensions: [],
            agentConfigs: [],
            modelTuning: {}
        };
        
        // Export settings
        try {
            const settings = await this.loadSettings('settings.json');
            exportData.settings = settings;
        } catch (error) {
            console.log('[Settings Importer] No settings to export');
        }
        
        // Export keybindings
        try {
            const keybindings = await this.loadSettings('keybindings.json');
            exportData.keybindings = keybindings;
        } catch (error) {
            console.log('[Settings Importer] No keybindings to export');
        }
        
        // Export snippets
        try {
            const snippets = await this.loadSettings('snippets.json');
            exportData.snippets = snippets;
        } catch (error) {
            console.log('[Settings Importer] No snippets to export');
        }
        
        // Export memories
        try {
            const memories = await this.loadSettings('memories.json');
            exportData.memories = memories;
        } catch (error) {
            console.log('[Settings Importer] No memories to export');
        }
        
        // Export rules
        try {
            const rules = await this.loadSettings('rules.json');
            exportData.rules = rules;
        } catch (error) {
            console.log('[Settings Importer] No rules to export');
        }
        
        // Export installed extensions list
        try {
            const installed = await this.marketplace.listInstalledExtensions();
            exportData.extensions = installed.map(ext => ({
                id: ext.id,
                publisher: ext.publisher,
                name: ext.name,
                version: ext.version
            }));
        } catch (error) {
            console.log('[Settings Importer] Could not list extensions');
        }
        
        // Save export file
        const exportPath = path.join(
            this.bigdaddygPath,
            `bigdaddyg-export-${Date.now()}.json`
        );
        
        await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2), 'utf8');
        
        console.log(`[Settings Importer] ✅ Settings exported to: ${exportPath}`);
        
        this.emit('export-complete', exportPath);
        
        return exportPath;
    }
    
    /**
     * Import from BigDaddyG export file
     */
    async importFromExport(exportPath) {
        console.log(`[Settings Importer] 📥 Importing from: ${exportPath}`);
        
        const content = await fs.readFile(exportPath, 'utf8');
        const exportData = JSON.parse(content);
        
        // Validate version
        if (exportData.version !== '2.0') {
            console.warn('[Settings Importer] ⚠️ Export version mismatch - may have compatibility issues');
        }
        
        // Import all settings
        await this.applyImportedSettings({
            settings: exportData.settings,
            keybindings: exportData.keybindings,
            snippets: exportData.snippets,
            memories: exportData.memories,
            rules: exportData.rules,
            extensions: exportData.extensions
        });
        
        console.log('[Settings Importer] ✅ Import complete');
        
        return exportData;
    }
    
    /**
     * Parse JSON with comments (JSONC)
     */
    parseJsonWithComments(content) {
        // Remove single-line comments
        let cleaned = content.replace(/\/\/.*$/gm, '');
        
        // Remove multi-line comments
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove trailing commas
        cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
        
        return JSON.parse(cleaned);
    }
    
    /**
     * Save settings file
     */
    async saveSettings(filename, data) {
        const settingsPath = path.join(this.bigdaddygPath, filename);
        
        await fs.mkdir(path.dirname(settingsPath), { recursive: true });
        await fs.writeFile(settingsPath, JSON.stringify(data, null, 2), 'utf8');
    }
    
    /**
     * Load settings file
     */
    async loadSettings(filename) {
        const settingsPath = path.join(this.bigdaddygPath, filename);
        const content = await fs.readFile(settingsPath, 'utf8');
        return JSON.parse(content);
    }
    
    /**
     * Check if directory exists
     */
    async directoryExists(dir) {
        try {
            const stat = await fs.stat(dir);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }
    
    /**
     * Render import/export UI
     */
    renderImportExportUI() {
        return `
            <div class="import-export-panel" style="padding: 20px; background: var(--bg-secondary); border-radius: 8px;">
                <h2 style="margin-bottom: 20px;">📦 Import/Export Settings</h2>
                
                <!-- Auto Import from VS Code/Cursor -->
                <div class="import-section" style="background: rgba(0,152,255,0.1); border: 2px solid var(--accent); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px;">🔄 Auto-Import from VS Code/Cursor</h3>
                    <p style="margin-bottom: 15px; opacity: 0.8;">
                        Automatically detect and import all your settings, extensions, keybindings, snippets, memories, and rules.
                    </p>
                    
                    <button class="import-btn" 
                            onclick="settingsImporter.runAutoImport()"
                            style="background: var(--accent); border: none; color: white; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px;">
                        🚀 Auto-Import Everything
                    </button>
                    
                    <div style="margin-top: 15px; font-size: 12px; opacity: 0.6;">
                        ✅ Settings.json<br>
                        ✅ Keybindings.json<br>
                        ✅ Snippets<br>
                        ✅ Extensions list<br>
                        ✅ .cursorrules<br>
                        ✅ Cursor memories (if available)
                    </div>
                </div>
                
                <!-- Manual Import -->
                <div class="manual-import" style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px;">📂 Manual Import</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <button class="quality-btn" onclick="settingsImporter.importFile('settings')">
                            Import Settings.json
                        </button>
                        <button class="quality-btn" onclick="settingsImporter.importFile('keybindings')">
                            Import Keybindings.json
                        </button>
                        <button class="quality-btn" onclick="settingsImporter.importFile('snippets')">
                            Import Snippets
                        </button>
                        <button class="quality-btn" onclick="settingsImporter.importFile('extensions')">
                            Import Extensions List
                        </button>
                        <button class="quality-btn" onclick="settingsImporter.importFile('cursorrules')">
                            Import .cursorrules
                        </button>
                        <button class="quality-btn" onclick="settingsImporter.importFile('export')">
                            Import BigDaddyG Export
                        </button>
                    </div>
                </div>
                
                <!-- Export -->
                <div class="export-section" style="background: rgba(78,201,176,0.1); border: 2px solid var(--accent-green); border-radius: 8px; padding: 20px;">
                    <h3 style="margin-bottom: 15px;">📤 Export BigDaddyG Settings</h3>
                    <p style="margin-bottom: 15px; opacity: 0.8;">
                        Export all your BigDaddyG configuration to share across machines or backup.
                    </p>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="export-btn" 
                                onclick="settingsImporter.exportAll()"
                                style="background: var(--accent-green); border: none; color: white; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            💾 Export Everything
                        </button>
                        
                        <button class="quality-btn" onclick="settingsImporter.exportToUSB()">
                            💾 Export to USB
                        </button>
                        
                        <button class="quality-btn" onclick="settingsImporter.exportToCloud()">
                            ☁️ Export to Cloud
                        </button>
                    </div>
                    
                    <div style="margin-top: 15px; font-size: 12px; opacity: 0.6;">
                        Exports to: ~/.bigdaddyg/bigdaddyg-export-[timestamp].json
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render import progress UI
     */
    renderProgressUI(progress) {
        return `
            <div class="import-progress" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-secondary); border: 2px solid var(--accent); border-radius: 12px; padding: 30px; min-width: 500px; z-index: 10000; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <h3 style="margin-bottom: 20px; text-align: center;">🔄 Importing Settings...</h3>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${progress.current} / ${progress.total}</span>
                        <span>${Math.round((progress.current / progress.total) * 100)}%</span>
                    </div>
                    <div style="background: var(--bg-tertiary); height: 12px; border-radius: 6px; overflow: hidden;">
                        <div style="background: var(--accent); height: 100%; width: ${(progress.current / progress.total) * 100}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <div style="text-align: center; font-size: 13px; opacity: 0.8;">
                    ${progress.currentItem}
                </div>
                
                ${progress.completed ? `
                    <button class="quality-btn" onclick="this.parentElement.remove()" style="margin-top: 20px; width: 100%;">
                        Close
                    </button>
                ` : ''}
            </div>
        `;
    }
}

module.exports = SettingsImporter;

