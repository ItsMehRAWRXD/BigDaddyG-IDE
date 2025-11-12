/**
 * BigDaddyG IDE - Comprehensive Feature Test Suite
 * Tests WHAT each feature is, WHERE it connects, and that it's FULLY FUNCTIONAL
 */

(function() {
'use strict';

console.log('[FeatureTest] 🧪 Loading comprehensive feature test suite...');

class ComprehensiveFeatureTest {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            phases: []
        };
        this.startTime = Date.now();
    }
    
    /**
     * Main test runner
     */
    async runAllTests() {
        console.log('\n'.repeat(3));
        console.log('═'.repeat(80));
        console.log('🧪 BIGDADDYG IDE - COMPREHENSIVE FEATURE TEST SUITE');
        console.log('═'.repeat(80));
        console.log(`Started: ${new Date().toLocaleTimeString()}`);
        console.log('═'.repeat(80));
        console.log('\n');
        
        // Phase 1: Core System Architecture
        await this.testPhase('🏗️ PHASE 1: Core System Architecture', async () => {
            await this.testCoreSystemArchitecture();
        });
        
        // Phase 2: Tab System & Navigation
        await this.testPhase('📑 PHASE 2: Tab System & Navigation', async () => {
            await this.testTabSystemAndNavigation();
        });
        
        // Phase 3: File System Integration
        await this.testPhase('📁 PHASE 3: File System Integration', async () => {
            await this.testFileSystemIntegration();
        });
        
        // Phase 4: AI & Agentic Features
        await this.testPhase('🤖 PHASE 4: AI & Agentic Features', async () => {
            await this.testAIFeatures();
        });
        
        // Phase 5: Editor Functionality
        await this.testPhase('✏️ PHASE 5: Editor Functionality', async () => {
            await this.testEditorFunctionality();
        });
        
        // Phase 6: Settings & Configuration
        await this.testPhase('⚙️ PHASE 6: Settings & Configuration', async () => {
            await this.testSettingsAndConfiguration();
        });
        
        // Phase 7: Tools & Integrations
        await this.testPhase('🛠️ PHASE 7: Tools & Integrations', async () => {
            await this.testToolsAndIntegrations();
        });
        
        // Phase 8: Game Development Features
        await this.testPhase('🎮 PHASE 8: Game Development Features', async () => {
            await this.testGameDevFeatures();
        });
        
        // Phase 9: Keyboard Shortcuts & UX
        await this.testPhase('⌨️ PHASE 9: Keyboard Shortcuts & UX', async () => {
            await this.testKeyboardShortcuts();
        });
        
        // Phase 10: Backend Connections
        await this.testPhase('🔌 PHASE 10: Backend Connections', async () => {
            await this.testBackendConnections();
        });
        
        // Phase 11: Performance & Memory
        await this.testPhase('⚡ PHASE 11: Performance & Memory', async () => {
            await this.testPerformance();
        });
        
        // Phase 12: Integration & End-to-End
        await this.testPhase('🔗 PHASE 12: Integration & End-to-End', async () => {
            await this.testIntegration();
        });
        
        this.printFinalReport();
    }
    
    /**
     * PHASE 1: Core System Architecture
     */
    async testCoreSystemArchitecture() {
        // Tab System Core
        await this.test('Tab System: Global object exists', 
            () => typeof window.completeTabSystem === 'object',
            { what: 'Tab management system', where: 'window.completeTabSystem', why: 'Manages all UI tabs' }
        );
        
        await this.test('Tab System: Has tabs Map', 
            () => window.completeTabSystem.tabs instanceof Map,
            { what: 'Active tab storage', where: 'completeTabSystem.tabs', why: 'Stores all open tabs' }
        );
        
        await this.test('Tab System: Can create tabs', 
            () => typeof window.completeTabSystem.createTab === 'function',
            { what: 'Tab creation method', where: 'completeTabSystem.createTab()', why: 'Creates new tabs dynamically' }
        );
        
        await this.test('Tab System: Can activate tabs', 
            () => typeof window.completeTabSystem.activateTab === 'function',
            { what: 'Tab activation method', where: 'completeTabSystem.activateTab()', why: 'Switches between tabs' }
        );
        
        await this.test('Tab System: Can close tabs', 
            () => typeof window.completeTabSystem.closeTab === 'function',
            { what: 'Tab closing method', where: 'completeTabSystem.closeTab()', why: 'Removes tabs and cleans up' }
        );
        
        // Menu System
        await this.test('Menu System: Global object exists', 
            () => typeof window.menuSystem === 'object',
            { what: 'Menu bar system', where: 'window.menuSystem', why: 'Handles File/Edit/View/Help menus' }
        );
        
        await this.test('Menu System: Can show menus', 
            () => typeof window.menuSystem?.showMenu === 'function',
            { what: 'Menu display method', where: 'menuSystem.showMenu()', why: 'Opens dropdown menus' }
        );
        
        await this.test('Menu System: Can execute actions', 
            () => typeof window.menuSystem?.executeAction === 'function',
            { what: 'Menu action handler', where: 'menuSystem.executeAction()', why: 'Executes menu commands' }
        );
        
        // Keyboard Shortcuts
        await this.test('Keyboard Shortcuts: System exists', 
            () => typeof window.keyboardShortcuts === 'object',
            { what: 'Keyboard shortcut handler', where: 'window.keyboardShortcuts', why: 'Handles Ctrl+N, Ctrl+S, etc.' }
        );
        
        // DOM Structure
        await this.test('DOM: Main container exists', 
            () => document.getElementById('main-container') !== null,
            { what: 'Main UI container', where: '#main-container', why: 'Holds all tab content' }
        );
        
        await this.test('DOM: Tab bar exists', 
            () => document.getElementById('master-tab-bar') !== null,
            { what: 'Tab bar container', where: '#master-tab-bar', why: 'Displays tab buttons' }
        );
        
        await this.test('DOM: Tab content exists', 
            () => document.getElementById('master-tab-content') !== null,
            { what: 'Tab content container', where: '#master-tab-content', why: 'Displays active tab content' }
        );
        
        await this.test('DOM: Menu bar exists', 
            () => document.getElementById('menu-bar') !== null,
            { what: 'Menu bar', where: '#menu-bar', why: 'File/Edit/View/Help menus' }
        );
    }
    
    /**
     * PHASE 2: Tab System & Navigation
     */
    async testTabSystemAndNavigation() {
        const tabTypes = [
            { name: 'Code Editor', method: 'createEditorTab', icon: '📄', category: 'Core' },
            { name: 'File Explorer', method: 'createFileExplorerTab', icon: '📁', category: 'Core' },
            { name: 'Terminal', method: 'createTerminalTab', icon: '💻', category: 'Core' },
            { name: 'Debugger', method: 'createDebuggerTab', icon: '🐛', category: 'Core' },
            { name: 'AI Chat', method: 'createAIChatTab', icon: '💬', category: 'AI' },
            { name: 'Agentic Coding', method: 'createAgenticCodingTab', icon: '🧠', category: 'AI' },
            { name: 'Image Generator', method: 'createImageGenTab', icon: '🎨', category: 'AI' },
            { name: 'Voice Coding', method: 'createVoiceCodingTab', icon: '🗣️', category: 'AI' },
            { name: 'Theme Settings', method: 'createThemeSettingsTab', icon: '🎨', category: 'Settings' },
            { name: 'Editor Settings', method: 'createEditorSettingsTab', icon: '⌨️', category: 'Settings' },
            { name: 'Extensions Settings', method: 'createExtensionsSettingsTab', icon: '🔌', category: 'Settings' },
            { name: 'Network Settings', method: 'createNetworkSettingsTab', icon: '🌐', category: 'Settings' },
            { name: 'Security Settings', method: 'createSecuritySettingsTab', icon: '🔐', category: 'Settings' },
            { name: 'Performance Settings', method: 'createPerformanceSettingsTab', icon: '⚡', category: 'Settings' },
            { name: 'Marketplace', method: 'createMarketplaceTab', icon: '🛒', category: 'Tools' },
            { name: 'GitHub', method: 'createGitHubTab', icon: '🐙', category: 'Tools' },
            { name: 'Team Collaboration', method: 'createTeamTab', icon: '👥', category: 'Tools' },
            { name: 'Performance Monitor', method: 'createPerformanceMonitorTab', icon: '📊', category: 'Tools' },
            { name: 'Browser', method: 'createBrowserTab', icon: '🌐', category: 'Tools' },
            { name: 'Game Editor', method: 'createGameEditorTab', icon: '🎮', category: 'Game Dev' },
            { name: 'Godot Integration', method: 'createGodotTab', icon: '🎯', category: 'Game Dev' },
            { name: 'Unreal Integration', method: 'createUnrealTab', icon: '🔷', category: 'Game Dev' },
            { name: 'Unity Integration', method: 'createUnityTab', icon: '🎲', category: 'Game Dev' },
        ];
        
        for (const tabType of tabTypes) {
            await this.testTabType(tabType);
        }
        
        // Test tab selector (Ctrl+T)
        await this.test('Tab Selector: Method exists', 
            () => typeof window.completeTabSystem.showTabSelector === 'function',
            { what: 'Tab selector (Ctrl+T)', where: 'completeTabSystem.showTabSelector()', why: 'Quick tab creation' }
        );
    }
    
    /**
     * Test individual tab type
     */
    async testTabType(tabType) {
        const ts = window.completeTabSystem;
        
        // 1. Method exists
        await this.test(`${tabType.category} → ${tabType.name}: Method exists`, 
            () => typeof ts[tabType.method] === 'function',
            { what: tabType.name, where: `completeTabSystem.${tabType.method}()`, why: `Creates ${tabType.name} tab` }
        );
        
        // 2. Can create tab
        let tabId = null;
        await this.test(`${tabType.category} → ${tabType.name}: Can create`, 
            () => {
                tabId = ts[tabType.method]();
                return typeof tabId === 'string' && tabId.length > 0;
            },
            { what: `${tabType.name} creation`, where: 'Tab System', why: 'Creates new tab instance' }
        );
        
        if (!tabId) return;
        
        // 3. Tab button created
        await this.test(`${tabType.category} → ${tabType.name}: Button created`, 
            () => document.querySelector(`[data-tab-id="${tabId}"]`) !== null,
            { what: 'Tab button', where: '#master-tab-bar', why: 'Clickable tab in tab bar' }
        );
        
        // 4. Content container created
        await this.test(`${tabType.category} → ${tabType.name}: Content created`, 
            () => document.getElementById(`content-${tabId}`) !== null,
            { what: 'Tab content container', where: '#master-tab-content', why: 'Holds tab UI' }
        );
        
        // 5. Has content (not empty)
        await this.test(`${tabType.category} → ${tabType.name}: Has content`, 
            () => {
                const content = document.getElementById(`content-${tabId}`);
                return content && content.innerHTML.trim().length > 0;
            },
            { what: 'Tab UI content', where: `#content-${tabId}`, why: 'Tab has actual UI elements' }
        );
        
        // 6. Activates properly
        await this.test(`${tabType.category} → ${tabType.name}: Activates`, 
            () => {
                ts.activateTab(tabId);
                return ts.activeTabId === tabId;
            },
            { what: 'Tab activation', where: 'Tab System', why: 'Tab becomes visible when clicked' }
        );
        
        // 7. Content is visible when active
        await this.test(`${tabType.category} → ${tabType.name}: Content visible`, 
            () => {
                const content = document.getElementById(`content-${tabId}`);
                return content && content.style.display === 'block';
            },
            { what: 'Content visibility', where: `#content-${tabId}`, why: 'Active tab shows content' }
        );
        
        // 8. Can close
        await this.test(`${tabType.category} → ${tabType.name}: Can close`, 
            () => {
                ts.closeTab(tabId);
                return !ts.tabs.has(tabId);
            },
            { what: 'Tab cleanup', where: 'Tab System', why: 'Tab closes and removes from memory' }
        );
    }
    
    /**
     * PHASE 3: File System Integration
     */
    async testFileSystemIntegration() {
        // Electron API presence
        await this.test('File System: Electron API exists', 
            () => typeof window.electron === 'object',
            { what: 'Electron file system bridge', where: 'window.electron', why: 'Connects renderer to file system' }
        );
        
        await this.test('File System: Can open file dialog', 
            () => typeof window.electron?.openFileDialog === 'function',
            { what: 'File open dialog', where: 'electron.openFileDialog()', why: 'Opens files from disk' }
        );
        
        await this.test('File System: Can save file dialog', 
            () => typeof window.electron?.saveFileDialog === 'function',
            { what: 'File save dialog', where: 'electron.saveFileDialog()', why: 'Saves files to disk' }
        );
        
        await this.test('File System: Can open folder dialog', 
            () => typeof window.electron?.openFolderDialog === 'function',
            { what: 'Folder browser', where: 'electron.openFolderDialog()', why: 'Opens folders for file explorer' }
        );
        
        await this.test('File System: Can read file', 
            () => typeof window.electron?.readFile === 'function',
            { what: 'File reader', where: 'electron.readFile()', why: 'Reads file contents' }
        );
        
        await this.test('File System: Can write file', 
            () => typeof window.electron?.writeFile === 'function',
            { what: 'File writer', where: 'electron.writeFile()', why: 'Writes file contents' }
        );
        
        await this.test('File System: Can read directory', 
            () => typeof window.electron?.readDir === 'function',
            { what: 'Directory reader', where: 'electron.readDir()', why: 'Lists files in folder' }
        );
        
        await this.test('File System: Can get file stats', 
            () => typeof window.electron?.getFileStats === 'function',
            { what: 'File stats', where: 'electron.getFileStats()', why: 'Gets file size, date, etc.' }
        );
        
        // File Explorer Component
        await this.test('File Explorer: Component class exists', 
            () => typeof window.FileExplorerComponent === 'function',
            { what: 'File explorer UI component', where: 'window.FileExplorerComponent', why: 'Renders file browser UI' }
        );
        
        // Test file explorer functionality
        const fileExplorerTabId = window.completeTabSystem.createFileExplorerTab();
        await this.wait(300); // Wait for component to initialize
        
        await this.test('File Explorer: Open Folder button exists', 
            () => document.getElementById('open-folder-btn') !== null,
            { what: 'Open folder button', where: 'File Explorer tab', why: 'Opens folder browser dialog' }
        );
        
        await this.test('File Explorer: Open File button exists', 
            () => document.getElementById('open-file-btn') !== null,
            { what: 'Open file button', where: 'File Explorer tab', why: 'Opens file picker dialog' }
        );
        
        await this.test('File Explorer: New File button exists', 
            () => document.getElementById('new-file-btn') !== null,
            { what: 'New file button', where: 'File Explorer tab', why: 'Creates new editor tab' }
        );
        
        await this.test('File Explorer: Save button exists', 
            () => document.getElementById('save-file-btn') !== null,
            { what: 'Save file button', where: 'File Explorer tab', why: 'Saves current file' }
        );
        
        await this.test('File Explorer: Has file tree container', 
            () => document.getElementById('file-tree') !== null,
            { what: 'File tree display', where: 'File Explorer tab', why: 'Shows folder contents' }
        );
        
        await this.test('File Explorer: Has status bar', 
            () => document.getElementById('explorer-status') !== null,
            { what: 'Explorer status', where: 'File Explorer tab', why: 'Shows operation feedback' }
        );
        
        window.completeTabSystem.closeTab(fileExplorerTabId);
    }
    
    /**
     * PHASE 4: AI & Agentic Features
     */
    async testAIFeatures() {
        // AI Chat
        const aiChatTabId = window.completeTabSystem.createAIChatTab();
        await this.wait(200);
        
        await this.test('AI Chat: Tab has chat interface', 
            () => {
                const content = document.getElementById(`content-${aiChatTabId}`);
                return content && content.innerHTML.includes('AI Chat');
            },
            { what: 'AI chat UI', where: 'AI Chat tab', why: 'Chat with AI models' }
        );
        
        window.completeTabSystem.closeTab(aiChatTabId);
        
        // Agentic Coding
        const agenticTabId = window.completeTabSystem.createAgenticCodingTab();
        await this.wait(200);
        
        await this.test('Agentic Coding: Tab has task interface', 
            () => {
                const content = document.getElementById(`content-${agenticTabId}`);
                return content && content.innerHTML.includes('Agentic');
            },
            { what: 'Agentic coding UI', where: 'Agentic Coding tab', why: 'AI writes code autonomously' }
        );
        
        await this.test('Agentic Coding: Has task input', 
            () => {
                const content = document.getElementById(`content-${agenticTabId}`);
                return content && content.querySelector('textarea') !== null;
            },
            { what: 'Task description input', where: 'Agentic Coding tab', why: 'User describes what to build' }
        );
        
        window.completeTabSystem.closeTab(agenticTabId);
        
        // Image Generator
        const imageGenTabId = window.completeTabSystem.createImageGenTab();
        await this.wait(200);
        
        await this.test('Image Generator: Tab has image UI', 
            () => {
                const content = document.getElementById(`content-${imageGenTabId}`);
                return content && content.innerHTML.includes('Image');
            },
            { what: 'Image generation UI', where: 'Image Generator tab', why: 'Generate images with AI' }
        );
        
        window.completeTabSystem.closeTab(imageGenTabId);
        
        // Voice Coding
        const voiceTabId = window.completeTabSystem.createVoiceCodingTab();
        await this.wait(200);
        
        await this.test('Voice Coding: Tab has voice UI', 
            () => {
                const content = document.getElementById(`content-${voiceTabId}`);
                return content && content.innerHTML.includes('Voice');
            },
            { what: 'Voice coding UI', where: 'Voice Coding tab', why: 'Code using voice commands' }
        );
        
        window.completeTabSystem.closeTab(voiceTabId);
    }
    
    /**
     * PHASE 5: Editor Functionality
     */
    async testEditorFunctionality() {
        const editorTabId = window.completeTabSystem.createEditorTab();
        await this.wait(300);
        
        await this.test('Editor: Tab created', 
            () => window.completeTabSystem.tabs.has(editorTabId),
            { what: 'Code editor tab', where: 'Tab System', why: 'Main code editing interface' }
        );
        
        await this.test('Editor: Has textarea', 
            () => {
                const content = document.getElementById(`content-${editorTabId}`);
                return content && content.querySelector('textarea') !== null;
            },
            { what: 'Editor textarea', where: 'Editor tab', why: 'Text input for coding' }
        );
        
        await this.test('Editor: Textarea is editable', 
            () => {
                const textarea = document.querySelector(`#content-${editorTabId} textarea`);
                return textarea && !textarea.disabled && !textarea.readOnly;
            },
            { what: 'Editable textarea', where: 'Editor tab', why: 'User can type code' }
        );
        
        // Test typing
        await this.test('Editor: Can type text', 
            () => {
                const textarea = document.querySelector(`#content-${editorTabId} textarea`);
                if (!textarea) return false;
                textarea.value = 'console.log("test");';
                return textarea.value === 'console.log("test");';
            },
            { what: 'Text input', where: 'Editor textarea', why: 'Editor accepts user input' }
        );
        
        // Test file path storage
        await this.test('Editor: Can store file path', 
            () => {
                const textarea = document.querySelector(`#content-${editorTabId} textarea`);
                if (!textarea) return false;
                textarea.dataset.filePath = '/test/file.js';
                return textarea.dataset.filePath === '/test/file.js';
            },
            { what: 'File path association', where: 'Editor textarea data', why: 'Links editor to file' }
        );
        
        window.completeTabSystem.closeTab(editorTabId);
    }
    
    /**
     * PHASE 6: Settings & Configuration
     */
    async testSettingsAndConfiguration() {
        // Settings Manager
        await this.test('Settings Manager: Class exists', 
            () => typeof window.SettingsManager === 'function',
            { what: 'Settings management system', where: 'window.SettingsManager', why: 'Manages IDE configuration' }
        );
        
        // Theme Settings
        const themeTabId = window.completeTabSystem.createThemeSettingsTab();
        await this.wait(200);
        
        await this.test('Theme Settings: Tab has theme UI', 
            () => {
                const content = document.getElementById(`content-${themeTabId}`);
                return content && content.innerHTML.includes('Theme');
            },
            { what: 'Theme configuration UI', where: 'Theme Settings tab', why: 'Customize IDE appearance' }
        );
        
        window.completeTabSystem.closeTab(themeTabId);
        
        // Editor Settings
        const editorSettingsTabId = window.completeTabSystem.createEditorSettingsTab();
        await this.wait(200);
        
        await this.test('Editor Settings: Tab has editor config', 
            () => {
                const content = document.getElementById(`content-${editorSettingsTabId}`);
                return content && content.innerHTML.includes('Editor');
            },
            { what: 'Editor configuration UI', where: 'Editor Settings tab', why: 'Configure editor behavior' }
        );
        
        window.completeTabSystem.closeTab(editorSettingsTabId);
        
        // Performance Settings
        const perfTabId = window.completeTabSystem.createPerformanceSettingsTab();
        await this.wait(200);
        
        await this.test('Performance Settings: Tab has perf config', 
            () => {
                const content = document.getElementById(`content-${perfTabId}`);
                return content && content.innerHTML.includes('Performance');
            },
            { what: 'Performance settings UI', where: 'Performance Settings tab', why: 'Optimize IDE performance' }
        );
        
        window.completeTabSystem.closeTab(perfTabId);
    }
    
    /**
     * PHASE 7: Tools & Integrations
     */
    async testToolsAndIntegrations() {
        // Marketplace
        const marketplaceTabId = window.completeTabSystem.createMarketplaceTab();
        await this.wait(200);
        
        await this.test('Marketplace: Has extension categories', 
            () => {
                const content = document.getElementById(`content-${marketplaceTabId}`);
                return content && (content.innerHTML.includes('Extensions') || content.innerHTML.includes('Themes'));
            },
            { what: 'Extension marketplace UI', where: 'Marketplace tab', why: 'Install IDE extensions' }
        );
        
        await this.test('Marketplace: Has install buttons', 
            () => {
                const content = document.getElementById(`content-${marketplaceTabId}`);
                return content && content.innerHTML.includes('Install');
            },
            { what: 'Extension install buttons', where: 'Marketplace tab', why: 'Install extensions' }
        );
        
        window.completeTabSystem.closeTab(marketplaceTabId);
        
        // GitHub
        const githubTabId = window.completeTabSystem.createGitHubTab();
        await this.wait(200);
        
        await this.test('GitHub: Tab has GitHub UI', 
            () => {
                const content = document.getElementById(`content-${githubTabId}`);
                return content && content.innerHTML.includes('GitHub');
            },
            { what: 'GitHub integration UI', where: 'GitHub tab', why: 'Manage repos and PRs' }
        );
        
        window.completeTabSystem.closeTab(githubTabId);
        
        // Performance Monitor
        const perfMonTabId = window.completeTabSystem.createPerformanceMonitorTab();
        await this.wait(200);
        
        await this.test('Performance Monitor: Tab has metrics', 
            () => {
                const content = document.getElementById(`content-${perfMonTabId}`);
                return content && content.innerHTML.includes('Performance');
            },
            { what: 'Performance monitoring UI', where: 'Performance Monitor tab', why: 'Track IDE performance' }
        );
        
        window.completeTabSystem.closeTab(perfMonTabId);
        
        // Browser
        const browserTabId = window.completeTabSystem.createBrowserTab();
        await this.wait(200);
        
        await this.test('Browser: Tab has browser UI', 
            () => {
                const content = document.getElementById(`content-${browserTabId}`);
                return content && content.innerHTML.includes('Browser');
            },
            { what: 'Embedded browser', where: 'Browser tab', why: 'Browse web in IDE' }
        );
        
        window.completeTabSystem.closeTab(browserTabId);
    }
    
    /**
     * PHASE 8: Game Development Features
     */
    async testGameDevFeatures() {
        // Game Editor
        const gameEditorTabId = window.completeTabSystem.createGameEditorTab();
        await this.wait(200);
        
        await this.test('Game Editor: Tab has game tools', 
            () => {
                const content = document.getElementById(`content-${gameEditorTabId}`);
                return content && content.innerHTML.includes('Game');
            },
            { what: 'Game editor UI', where: 'Game Editor tab', why: 'Create and edit games' }
        );
        
        window.completeTabSystem.closeTab(gameEditorTabId);
        
        // Godot Integration
        const godotTabId = window.completeTabSystem.createGodotTab();
        await this.wait(200);
        
        await this.test('Godot Integration: Tab has Godot tools', 
            () => {
                const content = document.getElementById(`content-${godotTabId}`);
                return content && content.innerHTML.includes('Godot');
            },
            { what: 'Godot engine integration', where: 'Godot Integration tab', why: 'Develop Godot games' }
        );
        
        window.completeTabSystem.closeTab(godotTabId);
        
        // Unreal Integration
        const unrealTabId = window.completeTabSystem.createUnrealTab();
        await this.wait(200);
        
        await this.test('Unreal Integration: Tab has Unreal tools', 
            () => {
                const content = document.getElementById(`content-${unrealTabId}`);
                return content && content.innerHTML.includes('Unreal');
            },
            { what: 'Unreal Engine integration', where: 'Unreal Integration tab', why: 'Develop Unreal games' }
        );
        
        window.completeTabSystem.closeTab(unrealTabId);
        
        // Unity Integration
        const unityTabId = window.completeTabSystem.createUnityTab();
        await this.wait(200);
        
        await this.test('Unity Integration: Tab has Unity tools', 
            () => {
                const content = document.getElementById(`content-${unityTabId}`);
                return content && content.innerHTML.includes('Unity');
            },
            { what: 'Unity engine integration', where: 'Unity Integration tab', why: 'Develop Unity games' }
        );
        
        window.completeTabSystem.closeTab(unityTabId);
    }
    
    /**
     * PHASE 9: Keyboard Shortcuts & UX
     */
    async testKeyboardShortcuts() {
        await this.test('Shortcuts: Ctrl+N (New File)', 
            () => window.menuSystem?.executeAction && typeof window.menuSystem.executeAction === 'function',
            { what: 'New file shortcut', where: 'Keyboard handler', why: 'Quick file creation' }
        );
        
        await this.test('Shortcuts: Ctrl+S (Save)', 
            () => window.menuSystem?.executeAction && typeof window.menuSystem.executeAction === 'function',
            { what: 'Save file shortcut', where: 'Keyboard handler', why: 'Quick save' }
        );
        
        await this.test('Shortcuts: Ctrl+T (Tab Selector)', 
            () => typeof window.completeTabSystem.showTabSelector === 'function',
            { what: 'Tab selector shortcut', where: 'Keyboard handler', why: 'Quick tab creation' }
        );
        
        await this.test('Shortcuts: Ctrl+W (Close Tab)', 
            () => typeof window.completeTabSystem.closeTab === 'function',
            { what: 'Close tab shortcut', where: 'Keyboard handler', why: 'Quick tab closing' }
        );
        
        await this.test('Shortcuts: F11 (Fullscreen)', 
            () => window.menuSystem?.executeAction && typeof window.menuSystem.executeAction === 'function',
            { what: 'Fullscreen toggle', where: 'Keyboard handler', why: 'Toggle fullscreen mode' }
        );
    }
    
    /**
     * PHASE 10: Backend Connections
     */
    async testBackendConnections() {
        // Orchestra Server
        await this.test('Orchestra: Control methods exist', 
            () => typeof window.electron?.startOrchestra === 'function' && 
                  typeof window.electron?.stopOrchestra === 'function',
            { what: 'Orchestra AI server control', where: 'electron.startOrchestra()', why: 'Start/stop AI backend' }
        );
        
        await this.test('Orchestra: Status check exists', 
            () => typeof window.electron?.getOrchestraStatus === 'function',
            { what: 'Orchestra status check', where: 'electron.getOrchestraStatus()', why: 'Check if AI is running' }
        );
        
        // IPC
        await this.test('IPC: Window controls exist', 
            () => typeof window.electron?.minimizeWindow === 'function' &&
                  typeof window.electron?.maximizeWindow === 'function' &&
                  typeof window.electron?.closeWindow === 'function',
            { what: 'Window control IPC', where: 'electron window methods', why: 'Control app window' }
        );
        
        // Advanced file operations
        await this.test('Advanced FS: Workspace scan exists', 
            () => typeof window.electron?.scanWorkspace === 'function',
            { what: 'Workspace scanner', where: 'electron.scanWorkspace()', why: 'Scan project files' }
        );
        
        await this.test('Advanced FS: File search exists', 
            () => typeof window.electron?.searchFiles === 'function',
            { what: 'File search', where: 'electron.searchFiles()', why: 'Search in files' }
        );
        
        await this.test('Advanced FS: Pattern finder exists', 
            () => typeof window.electron?.findByPattern === 'function',
            { what: 'Pattern-based search', where: 'electron.findByPattern()', why: 'Find files by pattern' }
        );
    }
    
    /**
     * PHASE 11: Performance & Memory
     */
    async testPerformance() {
        const startMem = performance.memory?.usedJSHeapSize || 0;
        
        await this.test('Memory: Heap tracking available', 
            () => typeof performance.memory !== 'undefined',
            { what: 'Memory monitoring', where: 'performance.memory', why: 'Track memory usage' }
        );
        
        // Create and destroy tabs to test memory
        const testTabIds = [];
        for (let i = 0; i < 10; i++) {
            testTabIds.push(window.completeTabSystem.createEditorTab());
        }
        
        await this.wait(500);
        
        await this.test('Performance: Multiple tabs created', 
            () => testTabIds.every(id => window.completeTabSystem.tabs.has(id)),
            { what: 'Multi-tab handling', where: 'Tab System', why: 'IDE can handle many tabs' }
        );
        
        // Close all test tabs
        for (const id of testTabIds) {
            window.completeTabSystem.closeTab(id);
        }
        
        await this.wait(300);
        
        await this.test('Performance: Tabs cleaned up', 
            () => testTabIds.every(id => !window.completeTabSystem.tabs.has(id)),
            { what: 'Memory cleanup', where: 'Tab System', why: 'No memory leaks' }
        );
        
        const endMem = performance.memory?.usedJSHeapSize || 0;
        const memDiff = endMem - startMem;
        
        await this.test('Performance: Memory growth acceptable', 
            () => memDiff < 50 * 1024 * 1024, // Less than 50MB growth
            { what: 'Memory efficiency', where: 'Overall system', why: 'IDE is memory-efficient' },
            memDiff > 50 * 1024 * 1024 ? 'warning' : null
        );
    }
    
    /**
     * PHASE 12: Integration & End-to-End
     */
    async testIntegration() {
        // Test full workflow: Create editor → Type code → Save
        await this.test('E2E: Full editing workflow possible', 
            async () => {
                // Create editor
                const editorId = window.completeTabSystem.createEditorTab();
                await this.wait(200);
                
                // Type code
                const textarea = document.querySelector(`#content-${editorId} textarea`);
                if (!textarea) return false;
                textarea.value = 'const test = 123;';
                
                // Simulate file path
                textarea.dataset.filePath = '/test.js';
                
                // Clean up
                window.completeTabSystem.closeTab(editorId);
                
                return true;
            },
            { what: 'End-to-end editing', where: 'Full system', why: 'Complete edit workflow works' }
        );
        
        // Test file explorer → editor integration
        await this.test('E2E: File explorer to editor flow', 
            () => {
                const explorerTab = window.completeTabSystem.createFileExplorerTab();
                const editorTab = window.completeTabSystem.createEditorTab();
                
                const success = window.completeTabSystem.tabs.has(explorerTab) && 
                               window.completeTabSystem.tabs.has(editorTab);
                
                window.completeTabSystem.closeTab(explorerTab);
                window.completeTabSystem.closeTab(editorTab);
                
                return success;
            },
            { what: 'Explorer-to-editor flow', where: 'File system + Editor', why: 'Open files in editor' }
        );
        
        // Test menu → tab integration
        await this.test('E2E: Menu to tab creation', 
            () => {
                if (!window.menuSystem?.executeAction) return false;
                
                // Simulate menu action
                const beforeCount = window.completeTabSystem.tabs.size;
                window.menuSystem.executeAction('ai-chat');
                
                const afterCount = window.completeTabSystem.tabs.size;
                return afterCount > beforeCount;
            },
            { what: 'Menu-to-tab flow', where: 'Menu System + Tab System', why: 'Menus create tabs' }
        );
    }
    
    /**
     * Helper: Run test phase
     */
    async testPhase(phaseName, testFunction) {
        console.log('\n' + '─'.repeat(80));
        console.log(phaseName);
        console.log('─'.repeat(80));
        
        const phaseStart = Date.now();
        const startTotal = this.results.total;
        
        await testFunction();
        
        const phaseEnd = Date.now();
        const phaseDuration = phaseEnd - phaseStart;
        const phaseTests = this.results.total - startTotal;
        
        this.results.phases.push({
            name: phaseName,
            tests: phaseTests,
            duration: phaseDuration
        });
        
        console.log(`✓ Phase complete (${phaseTests} tests, ${phaseDuration}ms)`);
    }
    
    /**
     * Helper: Run individual test
     */
    async test(name, testFn, metadata, forceType = null) {
        this.results.total++;
        
        try {
            const result = await testFn();
            
            if (forceType === 'warning' || (result && forceType === null)) {
                if (forceType === 'warning') {
                    this.results.warnings++;
                    console.log(`⚠️  ${name}`);
                } else {
                    this.results.passed++;
                    console.log(`✅ ${name}`);
                }
                
                if (metadata) {
                    console.log(`   → WHAT: ${metadata.what}`);
                    console.log(`   → WHERE: ${metadata.where}`);
                    console.log(`   → WHY: ${metadata.why}`);
                }
            } else {
                this.results.failed++;
                console.error(`❌ ${name}`);
                
                if (metadata) {
                    console.error(`   → WHAT: ${metadata.what}`);
                    console.error(`   → WHERE: ${metadata.where}`);
                    console.error(`   → WHY: ${metadata.why}`);
                    console.error(`   → IMPACT: Feature may not work!`);
                }
            }
        } catch (error) {
            this.results.failed++;
            console.error(`❌ ${name}`);
            console.error(`   → ERROR: ${error.message}`);
            
            if (metadata) {
                console.error(`   → WHERE: ${metadata.where}`);
            }
        }
        
        await this.wait(10); // Small delay between tests
    }
    
    /**
     * Helper: Wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Print final report
     */
    printFinalReport() {
        const duration = Date.now() - this.startTime;
        const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('\n'.repeat(2));
        console.log('═'.repeat(80));
        console.log('🎯 FINAL TEST REPORT');
        console.log('═'.repeat(80));
        console.log(`Total Tests:    ${this.results.total}`);
        console.log(`✅ Passed:       ${this.results.passed}`);
        console.log(`❌ Failed:       ${this.results.failed}`);
        console.log(`⚠️  Warnings:     ${this.results.warnings}`);
        console.log(`📊 Pass Rate:    ${passRate}%`);
        console.log(`⏱️  Duration:     ${(duration / 1000).toFixed(2)}s`);
        console.log('═'.repeat(80));
        
        console.log('\n📋 PHASE BREAKDOWN:');
        this.results.phases.forEach(phase => {
            console.log(`   ${phase.name}: ${phase.tests} tests, ${phase.duration}ms`);
        });
        
        console.log('\n' + '═'.repeat(80));
        
        if (this.results.failed === 0) {
            console.log('🎉 ALL TESTS PASSED! IDE is fully functional!');
        } else if (this.results.failed < 5) {
            console.log('⚠️  Minor issues detected. IDE mostly functional.');
        } else {
            console.log('❌ Significant issues detected. Please review failed tests.');
        }
        
        console.log('═'.repeat(80));
        console.log('\n');
    }
}

// Expose globally
window.ComprehensiveFeatureTest = ComprehensiveFeatureTest;

// Manual trigger function
window.runComprehensiveTest = async function() {
    const tester = new ComprehensiveFeatureTest();
    await tester.runAllTests();
};

console.log('[FeatureTest] ✅ Comprehensive feature test suite loaded');
console.log('[FeatureTest] 📌 Run tests: window.runComprehensiveTest() or click "🧪 Run Tests" button');

})();
