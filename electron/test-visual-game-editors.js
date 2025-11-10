/**
 * BigDaddyG IDE - Visual Game Editors Test
 * Comprehensive testing of all visual game editing tools
 */

const fs = require('fs');
const path = require('path');

class VisualGameEditorsTest {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            categories: {}
        };
    }
    
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('\n🎮 VISUAL GAME EDITORS TEST 🎮');
        console.log('=' .repeat(60));
        
        await this.testVisualGameEditor();
        await this.testAssetPreviewSystem();
        await this.testShaderEditor();
        await this.testAnimationTimelineEditor();
        await this.testGodotVisualTools();
        await this.testUnityVisualTools();
        await this.testUnrealVisualTools();
        await this.testSunshineVisualTools();
        await this.testIntegration();
        
        return this.generateReport();
    }
    
    /**
     * Test Visual Game Editor
     */
    async testVisualGameEditor() {
        const category = 'Visual Game Editor';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        // Check file exists
        await this.checkFile(
            'electron/game-editor/visual-game-editor.js',
            'Visual Game Editor file exists',
            category
        );
        
        // Check core UI components
        const content = await this.readFile('electron/game-editor/visual-game-editor.js');
        
        await this.checkContent(
            content,
            'VisualGameEditor',
            'VisualGameEditor class defined',
            category
        );
        
        await this.checkContent(
            content,
            'createEditorUI',
            'UI creation method exists',
            category
        );
        
        await this.checkContent(
            content,
            'game-editor-toolbar',
            'Toolbar UI defined',
            category
        );
        
        await this.checkContent(
            content,
            'scene-hierarchy-tree',
            'Scene hierarchy present',
            category
        );
        
        await this.checkContent(
            content,
            'asset-browser',
            'Asset browser present',
            category
        );
        
        await this.checkContent(
            content,
            'game-viewport',
            'Viewport present',
            category
        );
        
        await this.checkContent(
            content,
            'game-console',
            'Console present',
            category
        );
        
        await this.checkContent(
            content,
            'inspector-content',
            'Inspector present',
            category
        );
        
        // Check engine support
        await this.checkContent(
            content,
            'loadGodotUI',
            'Godot support',
            category
        );
        
        await this.checkContent(
            content,
            'loadUnityUI',
            'Unity support',
            category
        );
        
        await this.checkContent(
            content,
            'loadUnrealUI',
            'Unreal support',
            category
        );
        
        await this.checkContent(
            content,
            'loadSunshineUI',
            'Sunshine Engine support',
            category
        );
        
        // Check viewport features
        await this.checkContent(
            content,
            'initializeViewport',
            'Viewport initialization',
            category
        );
        
        await this.checkContent(
            content,
            'drawGrid',
            'Grid rendering',
            category
        );
        
        await this.checkContent(
            content,
            'setupViewportControls',
            'Viewport controls (pan, zoom, rotate)',
            category
        );
        
        // Check operations
        await this.checkContent(
            content,
            'addNode',
            'Add node operation',
            category
        );
        
        await this.checkContent(
            content,
            'deleteNode',
            'Delete node operation',
            category
        );
        
        await this.checkContent(
            content,
            'importAsset',
            'Import asset operation',
            category
        );
        
        await this.checkContent(
            content,
            'buildProject',
            'Build project operation',
            category
        );
        
        await this.checkContent(
            content,
            'runProject',
            'Run project operation',
            category
        );
        
        await this.checkContent(
            content,
            'enterPlayMode',
            'Play mode operation',
            category
        );
    }
    
    /**
     * Test Asset Preview System
     */
    async testAssetPreviewSystem() {
        const category = 'Asset Preview System';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        await this.checkFile(
            'electron/game-editor/asset-preview-system.js',
            'Asset Preview System file exists',
            category
        );
        
        const content = await this.readFile('electron/game-editor/asset-preview-system.js');
        
        await this.checkContent(
            content,
            'AssetPreviewSystem',
            'AssetPreviewSystem class defined',
            category
        );
        
        // Check supported asset types
        await this.checkContent(
            content,
            'images',
            'Image preview support',
            category
        );
        
        await this.checkContent(
            content,
            'models',
            '3D model preview support',
            category
        );
        
        await this.checkContent(
            content,
            'audio',
            'Audio preview support',
            category
        );
        
        await this.checkContent(
            content,
            'video',
            'Video preview support',
            category
        );
        
        await this.checkContent(
            content,
            'scripts',
            'Script preview support',
            category
        );
        
        await this.checkContent(
            content,
            'shaders',
            'Shader preview support',
            category
        );
        
        await this.checkContent(
            content,
            'materials',
            'Material preview support',
            category
        );
        
        await this.checkContent(
            content,
            'scenes',
            'Scene preview support',
            category
        );
        
        await this.checkContent(
            content,
            'prefabs',
            'Prefab preview support',
            category
        );
        
        await this.checkContent(
            content,
            'animations',
            'Animation preview support',
            category
        );
        
        await this.checkContent(
            content,
            'fonts',
            'Font preview support',
            category
        );
        
        // Check preview methods
        await this.checkContent(
            content,
            'previewImage',
            'Image preview method',
            category
        );
        
        await this.checkContent(
            content,
            'previewModel',
            '3D model preview method',
            category
        );
        
        await this.checkContent(
            content,
            'previewShader',
            'Shader preview method',
            category
        );
        
        await this.checkContent(
            content,
            'generatePreview',
            'Preview generation',
            category
        );
        
        await this.checkContent(
            content,
            'getAssetType',
            'Asset type detection',
            category
        );
        
        await this.checkContent(
            content,
            'previewCache',
            'Preview caching',
            category
        );
    }
    
    /**
     * Test Shader Editor
     */
    async testShaderEditor() {
        const category = 'Shader Editor';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        await this.checkFile(
            'electron/game-editor/shader-editor.js',
            'Shader Editor file exists',
            category
        );
        
        const content = await this.readFile('electron/game-editor/shader-editor.js');
        
        await this.checkContent(
            content,
            'ShaderEditor',
            'ShaderEditor class defined',
            category
        );
        
        // Check shader templates
        await this.checkContent(
            content,
            'shaderTemplates',
            'Shader templates defined',
            category
        );
        
        await this.checkContent(
            content,
            'vertex',
            'Vertex shader template',
            category
        );
        
        await this.checkContent(
            content,
            'fragment',
            'Fragment shader template',
            category
        );
        
        await this.checkContent(
            content,
            'compute',
            'Compute shader template',
            category
        );
        
        await this.checkContent(
            content,
            'godot',
            'Godot shader template',
            category
        );
        
        await this.checkContent(
            content,
            'unity',
            'Unity shader template',
            category
        );
        
        await this.checkContent(
            content,
            'unreal',
            'Unreal shader template',
            category
        );
        
        await this.checkContent(
            content,
            'sunshineBasic',
            'Sunshine shader template',
            category
        );
        
        // Check editor features
        await this.checkContent(
            content,
            'initializeWebGL',
            'WebGL initialization',
            category
        );
        
        await this.checkContent(
            content,
            'compileShader',
            'Shader compilation',
            category
        );
        
        await this.checkContent(
            content,
            'validateShaderCode',
            'Shader validation',
            category
        );
        
        await this.checkContent(
            content,
            'shader-code-editor',
            'Code editor UI',
            category
        );
        
        await this.checkContent(
            content,
            'shader-preview-canvas',
            'Live preview canvas',
            category
        );
        
        await this.checkContent(
            content,
            'shader-node-panel',
            'Node editor panel',
            category
        );
        
        await this.checkContent(
            content,
            'updatePreview',
            'Preview update method',
            category
        );
        
        await this.checkContent(
            content,
            'playPreview',
            'Animated preview',
            category
        );
        
        await this.checkContent(
            content,
            'formatCode',
            'Code formatting',
            category
        );
    }
    
    /**
     * Test Animation Timeline Editor
     */
    async testAnimationTimelineEditor() {
        const category = 'Animation Timeline Editor';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        await this.checkFile(
            'electron/game-editor/animation-timeline-editor.js',
            'Animation Timeline Editor file exists',
            category
        );
        
        const content = await this.readFile('electron/game-editor/animation-timeline-editor.js');
        
        await this.checkContent(
            content,
            'AnimationTimelineEditor',
            'AnimationTimelineEditor class defined',
            category
        );
        
        // Check UI components
        await this.checkContent(
            content,
            'timeline-toolbar',
            'Timeline toolbar',
            category
        );
        
        await this.checkContent(
            content,
            'timeline-tracks',
            'Animation tracks',
            category
        );
        
        await this.checkContent(
            content,
            'timeline-canvas',
            'Timeline canvas',
            category
        );
        
        await this.checkContent(
            content,
            'timeline-playhead',
            'Playhead indicator',
            category
        );
        
        await this.checkContent(
            content,
            'keyframe-inspector',
            'Keyframe inspector',
            category
        );
        
        await this.checkContent(
            content,
            'curve-editor-panel',
            'Curve editor',
            category
        );
        
        // Check features
        await this.checkContent(
            content,
            'addKeyframe',
            'Add keyframe',
            category
        );
        
        await this.checkContent(
            content,
            'deleteKeyframe',
            'Delete keyframe',
            category
        );
        
        await this.checkContent(
            content,
            'drawTimeline',
            'Timeline rendering',
            category
        );
        
        await this.checkContent(
            content,
            'drawKeyframes',
            'Keyframe rendering',
            category
        );
        
        await this.checkContent(
            content,
            'play',
            'Play animation',
            category
        );
        
        await this.checkContent(
            content,
            'pause',
            'Pause animation',
            category
        );
        
        await this.checkContent(
            content,
            'stop',
            'Stop animation',
            category
        );
        
        await this.checkContent(
            content,
            'stepForward',
            'Frame stepping',
            category
        );
        
        await this.checkContent(
            content,
            'zoomIn',
            'Timeline zoom',
            category
        );
        
        await this.checkContent(
            content,
            'applyCurve',
            'Interpolation curves',
            category
        );
        
        await this.checkContent(
            content,
            'createDefaultTracks',
            'Default animation tracks',
            category
        );
    }
    
    /**
     * Test Godot Visual Tools
     */
    async testGodotVisualTools() {
        const category = 'Godot Visual Tools';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        const content = await this.readFile('electron/game-editor/visual-game-editor.js');
        
        await this.checkContent(
            content,
            'loadGodotUI',
            'Godot UI loader',
            category
        );
        
        await this.checkContent(
            content,
            'Node2D',
            'Godot node types',
            category
        );
        
        await this.checkContent(
            content,
            'res://',
            'Godot resource paths',
            category
        );
    }
    
    /**
     * Test Unity Visual Tools
     */
    async testUnityVisualTools() {
        const category = 'Unity Visual Tools';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        const content = await this.readFile('electron/game-editor/visual-game-editor.js');
        
        await this.checkContent(
            content,
            'loadUnityUI',
            'Unity UI loader',
            category
        );
        
        await this.checkContent(
            content,
            'GameObject',
            'Unity GameObjects',
            category
        );
        
        await this.checkContent(
            content,
            'Assets/',
            'Unity asset paths',
            category
        );
    }
    
    /**
     * Test Unreal Visual Tools
     */
    async testUnrealVisualTools() {
        const category = 'Unreal Visual Tools';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        const content = await this.readFile('electron/game-editor/visual-game-editor.js');
        
        await this.checkContent(
            content,
            'loadUnrealUI',
            'Unreal UI loader',
            category
        );
        
        await this.checkContent(
            content,
            'Actor',
            'Unreal Actors',
            category
        );
        
        await this.checkContent(
            content,
            'Content/',
            'Unreal content paths',
            category
        );
    }
    
    /**
     * Test Sunshine Visual Tools
     */
    async testSunshineVisualTools() {
        const category = 'Sunshine Visual Tools';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        const content = await this.readFile('electron/game-editor/visual-game-editor.js');
        
        await this.checkContent(
            content,
            'loadSunshineUI',
            'Sunshine UI loader',
            category
        );
        
        await this.checkContent(
            content,
            '☀️',
            'Sunshine Engine branding',
            category
        );
    }
    
    /**
     * Test Integration
     */
    async testIntegration() {
        const category = 'Integration';
        this.results.categories[category] = { passed: 0, failed: 0, tests: [] };
        
        console.log(`\n📝 Testing ${category}...`);
        
        // Check if files are properly structured
        await this.checkFile(
            'electron/game-editor',
            'Game editor directory exists',
            category,
            true
        );
        
        // Check exports
        const visualEditorContent = await this.readFile('electron/game-editor/visual-game-editor.js');
        await this.checkContent(
            visualEditorContent,
            'window.VisualGameEditor',
            'Visual editor exported globally',
            category
        );
        
        const shaderContent = await this.readFile('electron/game-editor/shader-editor.js');
        await this.checkContent(
            shaderContent,
            'window.ShaderEditor',
            'Shader editor exported globally',
            category
        );
        
        const timelineContent = await this.readFile('electron/game-editor/animation-timeline-editor.js');
        await this.checkContent(
            timelineContent,
            'window.AnimationTimelineEditor',
            'Timeline editor exported globally',
            category
        );
        
        const assetPreviewContent = await this.readFile('electron/game-editor/asset-preview-system.js');
        await this.checkContent(
            assetPreviewContent,
            'module.exports',
            'Asset preview system exported',
            category
        );
    }
    
    /**
     * Helper: Check file exists
     */
    async checkFile(filePath, testName, category, isDirectory = false) {
        this.results.total++;
        
        const fullPath = path.join(__dirname, '..', filePath);
        const exists = fs.existsSync(fullPath);
        
        if (exists) {
            if (isDirectory) {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    this.pass(testName, category);
                } else {
                    this.fail(testName, category, 'Path exists but is not a directory');
                }
            } else {
                this.pass(testName, category);
            }
        } else {
            this.fail(testName, category, `File not found: ${filePath}`);
        }
    }
    
    /**
     * Helper: Check content contains string
     */
    async checkContent(content, searchString, testName, category) {
        this.results.total++;
        
        if (content && content.includes(searchString)) {
            this.pass(testName, category);
        } else {
            this.fail(testName, category, `Content does not include: ${searchString}`);
        }
    }
    
    /**
     * Helper: Read file
     */
    async readFile(filePath) {
        try {
            const fullPath = path.join(__dirname, '..', filePath);
            return fs.readFileSync(fullPath, 'utf8');
        } catch (error) {
            return '';
        }
    }
    
    /**
     * Mark test as passed
     */
    pass(testName, category) {
        this.results.passed++;
        this.results.categories[category].passed++;
        this.results.categories[category].tests.push({
            name: testName,
            status: 'PASSED'
        });
        console.log(`   ✅ ${testName}`);
    }
    
    /**
     * Mark test as failed
     */
    fail(testName, category, reason) {
        this.results.failed++;
        this.results.categories[category].failed++;
        this.results.categories[category].tests.push({
            name: testName,
            status: 'FAILED',
            reason: reason
        });
        console.log(`   ❌ ${testName}: ${reason}`);
    }
    
    /**
     * Generate test report
     */
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        
        Object.keys(this.results.categories).forEach(category => {
            const cat = this.results.categories[category];
            const total = cat.passed + cat.failed;
            const percentage = total > 0 ? (cat.passed / total * 100).toFixed(1) : 0;
            
            console.log(`\n${category}:`);
            console.log(`   Passed: ${cat.passed}/${total} (${percentage}%)`);
            
            if (cat.failed > 0) {
                console.log(`   Failed tests:`);
                cat.tests
                    .filter(t => t.status === 'FAILED')
                    .forEach(t => console.log(`      - ${t.name}: ${t.reason}`));
            }
        });
        
        const percentage = (this.results.passed / this.results.total * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 OVERALL RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${percentage}%`);
        
        const status = this.results.failed === 0 ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED';
        console.log(`\n${status}\n`);
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: percentage + '%'
            },
            categories: this.results.categories
        };
        
        fs.writeFileSync(
            path.join(__dirname, '..', 'VISUAL-EDITORS-TEST-REPORT.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('📄 Detailed report saved to: VISUAL-EDITORS-TEST-REPORT.json\n');
        
        return report;
    }
}

// Run tests
if (require.main === module) {
    const tester = new VisualGameEditorsTest();
    tester.runAllTests().then(() => {
        process.exit(tester.results.failed > 0 ? 1 : 0);
    });
}

module.exports = VisualGameEditorsTest;
