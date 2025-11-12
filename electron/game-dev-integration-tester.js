#!/usr/bin/env node
/**
 * BigDaddyG IDE - Game Development Integration Tester
 * Tests ALL game engine integrations:
 * - Godot 4.2+
 * - Unreal Engine 5.3+
 * - Unity 2022 LTS
 * - Sunshine Engine (proprietary)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                               ║');
console.log('║         🎮 BIGDADDYG IDE - GAME DEV INTEGRATION TESTER 🎮                   ║');
console.log('║                    Complete Engine Validation                                ║');
console.log('║                                                                               ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

class GameDevIntegrationTester {
    constructor() {
        this.electronDir = __dirname;
        this.results = {
            godot: { tested: 0, working: 0, broken: 0 },
            unity: { tested: 0, working: 0, broken: 0 },
            unreal: { tested: 0, working: 0, broken: 0 },
            sunshine: { tested: 0, working: 0, broken: 0 },
            general: { tested: 0, working: 0, broken: 0 }
        };
        
        this.issues = [];
        this.enginePaths = {
            godot: null,
            unity: null,
            unreal: null,
            sunshine: null
        };
    }
    
    async runAllTests() {
        console.log('🔍 Starting comprehensive game development testing...\n');
        
        await this.testGodotIntegration();
        await this.testUnityIntegration();
        await this.testUnrealIntegration();
        await this.testSunshineEngine();
        await this.testGeneralGameDevFeatures();
        await this.testProjectTemplates();
        await this.testBuildSystems();
        await this.testDebugging();
        
        return this.generateReport();
    }
    
    // Test Godot 4.2+ integration
    async testGodotIntegration() {
        console.log('🎮 Testing Godot 4.2+ Integration');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Godot integration file',
                check: () => {
                    const files = [
                        'godot-integration.js',
                        'game-engines/godot-support.js',
                        'integrations/godot.js'
                    ];
                    return files.some(f => fs.existsSync(path.join(this.electronDir, f)));
                }
            },
            {
                name: 'GDScript syntax support',
                check: () => {
                    const indexPath = path.join(this.electronDir, 'index.html');
                    if (!fs.existsSync(indexPath)) return false;
                    const content = fs.readFileSync(indexPath, 'utf8');
                    return /gdscript|\.gd/i.test(content);
                }
            },
            {
                name: 'Godot project detection',
                check: () => {
                    // Check for project.godot detection logic
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /project\.godot/i.test(content);
                    });
                }
            },
            {
                name: 'Godot scene editor support',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /\.tscn|\.scn|scene/i.test(content) && /godot/i.test(content);
                    });
                }
            },
            {
                name: 'Godot build integration',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /godot.*build|export.*godot/i.test(content);
                    });
                }
            }
        ];
        
        for (const test of tests) {
            const result = test.check();
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.godot.working++;
            } else {
                console.log(`   ❌ ${test.name} - NOT FOUND`);
                this.addIssue('Godot', test.name + ' missing');
                this.results.godot.broken++;
            }
            this.results.godot.tested++;
        }
        
        // Try to detect Godot installation
        await this.detectGodotInstallation();
        
        console.log('');
    }
    
    // Test Unity 2022 LTS integration
    async testUnityIntegration() {
        console.log('🎮 Testing Unity 2022 LTS Integration');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Unity integration file',
                check: () => {
                    const files = [
                        'unity-integration.js',
                        'game-engines/unity-support.js',
                        'integrations/unity.js'
                    ];
                    return files.some(f => fs.existsSync(path.join(this.electronDir, f)));
                }
            },
            {
                name: 'C# syntax support',
                check: () => {
                    const indexPath = path.join(this.electronDir, 'index.html');
                    if (!fs.existsSync(indexPath)) return false;
                    const content = fs.readFileSync(indexPath, 'utf8');
                    return /csharp|c#|\.cs/i.test(content);
                }
            },
            {
                name: 'Unity project detection',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /ProjectSettings.*unity|Assets.*folder/i.test(content);
                    });
                }
            },
            {
                name: 'Unity Inspector support',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /inspector|SerializeField/i.test(content) && /unity/i.test(content);
                    });
                }
            },
            {
                name: 'Unity build integration',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /unity.*build|BuildPipeline/i.test(content);
                    });
                }
            }
        ];
        
        for (const test of tests) {
            const result = test.check();
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.unity.working++;
            } else {
                console.log(`   ❌ ${test.name} - NOT FOUND`);
                this.addIssue('Unity', test.name + ' missing');
                this.results.unity.broken++;
            }
            this.results.unity.tested++;
        }
        
        // Try to detect Unity installation
        await this.detectUnityInstallation();
        
        console.log('');
    }
    
    // Test Unreal Engine 5.3+ integration
    async testUnrealIntegration() {
        console.log('🎮 Testing Unreal Engine 5.3+ Integration');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Unreal integration file',
                check: () => {
                    const files = [
                        'unreal-integration.js',
                        'game-engines/unreal-support.js',
                        'integrations/unreal.js'
                    ];
                    return files.some(f => fs.existsSync(path.join(this.electronDir, f)));
                }
            },
            {
                name: 'C++ syntax support',
                check: () => {
                    const indexPath = path.join(this.electronDir, 'index.html');
                    if (!fs.existsSync(indexPath)) return false;
                    const content = fs.readFileSync(indexPath, 'utf8');
                    return /cpp|c\+\+|\.cpp|\.h/i.test(content);
                }
            },
            {
                name: 'Blueprint support',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /blueprint|\.uasset/i.test(content) && /unreal/i.test(content);
                    });
                }
            },
            {
                name: 'Unreal project detection',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /\.uproject|\.uplugin/i.test(content);
                    });
                }
            },
            {
                name: 'Unreal build integration',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /UnrealBuildTool|BuildCookRun/i.test(content);
                    });
                }
            }
        ];
        
        for (const test of tests) {
            const result = test.check();
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.unreal.working++;
            } else {
                console.log(`   ❌ ${test.name} - NOT FOUND`);
                this.addIssue('Unreal', test.name + ' missing');
                this.results.unreal.broken++;
            }
            this.results.unreal.tested++;
        }
        
        // Try to detect Unreal installation
        await this.detectUnrealInstallation();
        
        console.log('');
    }
    
    // Test Sunshine Engine (proprietary)
    async testSunshineEngine() {
        console.log('☀️  Testing Sunshine Engine (Proprietary)');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Sunshine Engine integration',
                check: () => {
                    const files = [
                        'sunshine-engine.js',
                        'game-engines/sunshine-support.js',
                        'integrations/sunshine.js'
                    ];
                    return files.some(f => fs.existsSync(path.join(this.electronDir, f)));
                }
            },
            {
                name: 'Sunshine project detection',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /sunshine.*project|\.sunshine/i.test(content);
                    });
                }
            },
            {
                name: 'Sunshine build system',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /sunshine.*build|compile.*sunshine/i.test(content);
                    });
                }
            },
            {
                name: 'Sunshine documentation',
                check: () => {
                    const docFiles = [
                        path.join(__dirname, '..', '☀️-SUNSHINE-ENGINE-TECHNICAL-☀️.md'),
                        path.join(__dirname, '..', 'SUNSHINE-ENGINE.md')
                    ];
                    return docFiles.some(f => fs.existsSync(f));
                }
            },
            {
                name: 'Sunshine asset pipeline',
                check: () => {
                    const files = fs.readdirSync(this.electronDir).filter(f => f.endsWith('.js'));
                    return files.some(f => {
                        const content = fs.readFileSync(path.join(this.electronDir, f), 'utf8');
                        return /sunshine.*asset|asset.*pipeline/i.test(content) && /sunshine/i.test(content);
                    });
                }
            }
        ];
        
        for (const test of tests) {
            const result = test.check();
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.sunshine.working++;
            } else {
                console.log(`   ❌ ${test.name} - NOT FOUND`);
                this.addIssue('Sunshine', test.name + ' missing');
                this.results.sunshine.broken++;
            }
            this.results.sunshine.tested++;
        }
        
        // Check for Sunshine documentation
        const sunshineDoc = path.join(__dirname, '..', '☀️-SUNSHINE-ENGINE-TECHNICAL-☀️.md');
        if (fs.existsSync(sunshineDoc)) {
            console.log('   📚 Sunshine Engine documentation found');
        }
        
        console.log('');
    }
    
    // Test general game dev features
    async testGeneralGameDevFeatures() {
        console.log('🛠️  Testing General Game Dev Features');
        console.log('─'.repeat(80));
        
        const features = [
            {
                name: 'Asset browser',
                pattern: /asset.*browser|browse.*assets/i
            },
            {
                name: 'Texture preview',
                pattern: /texture.*preview|preview.*texture|image.*viewer/i
            },
            {
                name: '3D model viewer',
                pattern: /model.*viewer|3d.*preview|\.obj|\.fbx|\.gltf/i
            },
            {
                name: 'Shader editor',
                pattern: /shader.*editor|\.shader|\.hlsl|\.glsl/i
            },
            {
                name: 'Animation tools',
                pattern: /animation.*tool|\.anim|keyframe/i
            },
            {
                name: 'Scene hierarchy',
                pattern: /scene.*hierarchy|hierarchy.*view|scene.*tree/i
            },
            {
                name: 'Game console',
                pattern: /game.*console|debug.*console/i
            },
            {
                name: 'Performance profiler',
                pattern: /profiler|fps.*counter|performance.*tool/i
            }
        ];
        
        const allFiles = fs.readdirSync(this.electronDir)
            .filter(f => f.endsWith('.js'))
            .map(f => fs.readFileSync(path.join(this.electronDir, f), 'utf8'))
            .join('\n');
        
        const indexContent = fs.existsSync(path.join(this.electronDir, 'index.html')) ?
            fs.readFileSync(path.join(this.electronDir, 'index.html'), 'utf8') : '';
        
        const combined = allFiles + indexContent;
        
        features.forEach(feature => {
            if (feature.pattern.test(combined)) {
                console.log(`   ✅ ${feature.name}`);
                this.results.general.working++;
            } else {
                console.log(`   ⚠️  ${feature.name} - Not detected`);
                this.results.general.broken++;
            }
            this.results.general.tested++;
        });
        
        console.log('');
    }
    
    // Test project templates
    async testProjectTemplates() {
        console.log('📁 Testing Project Templates');
        console.log('─'.repeat(80));
        
        const templateDir = path.join(__dirname, '..', 'templates');
        const gameTemplates = [
            'godot-template',
            'unity-template',
            'unreal-template',
            'sunshine-template'
        ];
        
        if (fs.existsSync(templateDir)) {
            const templates = fs.readdirSync(templateDir);
            console.log(`   ✅ Templates directory exists (${templates.length} templates)`);
            
            gameTemplates.forEach(gt => {
                const found = templates.some(t => t.includes(gt.split('-')[0]));
                if (found) {
                    console.log(`   ✅ ${gt} available`);
                } else {
                    console.log(`   ⚠️  ${gt} not found`);
                }
            });
        } else {
            console.log('   ⚠️  No templates directory found');
        }
        
        console.log('');
    }
    
    // Test build systems
    async testBuildSystems() {
        console.log('🔨 Testing Build Systems');
        console.log('─'.repeat(80));
        
        const buildTests = [
            { name: 'Build configuration', pattern: /build.*config|\.build/i },
            { name: 'Platform targets', pattern: /windows.*build|linux.*build|mac.*build|android|ios/i },
            { name: 'Asset bundling', pattern: /bundle.*assets|asset.*pack/i },
            { name: 'Hot reload', pattern: /hot.*reload|live.*reload/i },
            { name: 'Build optimization', pattern: /optimize.*build|compress/i }
        ];
        
        const allFiles = fs.readdirSync(this.electronDir)
            .filter(f => f.endsWith('.js'))
            .map(f => fs.readFileSync(path.join(this.electronDir, f), 'utf8'))
            .join('\n');
        
        buildTests.forEach(test => {
            if (test.pattern.test(allFiles)) {
                console.log(`   ✅ ${test.name}`);
            } else {
                console.log(`   ⚠️  ${test.name} - Not detected`);
            }
        });
        
        console.log('');
    }
    
    // Test debugging features
    async testDebugging() {
        console.log('🐛 Testing Game Debugging Features');
        console.log('─'.repeat(80));
        
        const debugFeatures = [
            { name: 'Breakpoint support', pattern: /breakpoint|debugger/i },
            { name: 'Variable inspection', pattern: /inspect.*variable|watch.*variable/i },
            { name: 'Call stack', pattern: /call.*stack|stack.*trace/i },
            { name: 'Console logging', pattern: /console\.log|debug.*log/i },
            { name: 'Remote debugging', pattern: /remote.*debug|debug.*remote/i }
        ];
        
        const allFiles = fs.readdirSync(this.electronDir)
            .filter(f => f.endsWith('.js'))
            .map(f => fs.readFileSync(path.join(this.electronDir, f), 'utf8'))
            .join('\n');
        
        debugFeatures.forEach(feature => {
            if (feature.pattern.test(allFiles)) {
                console.log(`   ✅ ${feature.name}`);
            } else {
                console.log(`   ⚠️  ${feature.name} - Not detected`);
            }
        });
        
        console.log('');
    }
    
    // Detect engine installations
    async detectGodotInstallation() {
        try {
            const result = await this.runCommand('godot --version', 2000);
            if (result.success) {
                console.log(`   ✅ Godot detected: ${result.output.trim()}`);
                this.enginePaths.godot = 'godot';
            }
        } catch (error) {
            console.log('   ⚠️  Godot not found in PATH (IDE features still available)');
        }
    }
    
    async detectUnityInstallation() {
        try {
            const result = await this.runCommand('unity -version', 2000);
            if (result.success) {
                console.log(`   ✅ Unity detected: ${result.output.trim()}`);
                this.enginePaths.unity = 'unity';
            }
        } catch {
            console.log('   ⚠️  Unity not found in PATH');
        }
    }
    
    async detectUnrealInstallation() {
        // Unreal doesn't have a simple version command, check common paths
        const commonPaths = [
            'C:\\Program Files\\Epic Games\\UE_5.3',
            '/opt/UnrealEngine',
            '~/UnrealEngine'
        ];
        
        const found = commonPaths.some(p => fs.existsSync(p));
        if (found) {
            console.log('   ✅ Unreal Engine installation detected');
        } else {
            console.log('   ⚠️  Unreal Engine not found in common paths');
        }
    }
    
    runCommand(command, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            
            try {
                const proc = spawn(cmd, args);
                
                let output = '';
                let error = '';
                
                proc.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                proc.stderr.on('data', (data) => {
                    error += data.toString();
                });
                
                proc.on('close', (code) => {
                    if (code === 0) {
                        resolve({ success: true, output });
                    } else {
                        reject({ success: false, error });
                    }
                });
                
                proc.on('error', (err) => {
                    reject({ success: false, error: err.message });
                });
                
                setTimeout(() => {
                    proc.kill();
                    reject({ success: false, error: 'Timeout' });
                }, timeout);
            } catch (err) {
                reject({ success: false, error: err.message });
            }
        });
    }
    
    addIssue(engine, description) {
        this.issues.push({ engine, description });
    }
    
    generateReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                    GAME DEV INTEGRATION REPORT                                ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
        
        console.log('📊 INTEGRATION STATUS:\n');
        
        const engines = [
            { name: 'Godot 4.2+', data: this.results.godot, icon: '🎮' },
            { name: 'Unity 2022 LTS', data: this.results.unity, icon: '🎮' },
            { name: 'Unreal Engine 5.3+', data: this.results.unreal, icon: '🎮' },
            { name: 'Sunshine Engine', data: this.results.sunshine, icon: '☀️' },
            { name: 'General Features', data: this.results.general, icon: '🛠️' }
        ];
        
        engines.forEach(engine => {
            const total = engine.data.tested;
            const working = engine.data.working;
            const percentage = total > 0 ? ((working / total) * 100).toFixed(1) : 0;
            const status = percentage >= 80 ? '✅' : percentage >= 50 ? '⚠️' : '❌';
            
            console.log(`${status} ${engine.icon} ${engine.name}: ${working}/${total} (${percentage}%)`);
        });
        
        // Overall score
        const totalTests = Object.values(this.results).reduce((sum, r) => sum + r.tested, 0);
        const totalWorking = Object.values(this.results).reduce((sum, r) => sum + r.working, 0);
        const overallPercentage = totalTests > 0 ? ((totalWorking / totalTests) * 100).toFixed(1) : 0;
        
        console.log('\n' + '═'.repeat(80));
        console.log(`📈 OVERALL GAME DEV READINESS: ${overallPercentage}%`);
        
        let status = '';
        if (overallPercentage >= 90) {
            status = '✅ FULLY READY - All engines supported!';
        } else if (overallPercentage >= 70) {
            status = '⚠️  MOSTLY READY - Some engines need work';
        } else if (overallPercentage >= 50) {
            status = '🔧 NEEDS WORK - Significant integration needed';
        } else {
            status = '❌ NOT READY - Major development required';
        }
        
        console.log(`🎯 STATUS: ${status}`);
        console.log('═'.repeat(80));
        
        // Issues by engine
        if (this.issues.length > 0) {
            console.log('\n📋 MISSING INTEGRATIONS:\n');
            
            const byEngine = {};
            this.issues.forEach(issue => {
                if (!byEngine[issue.engine]) byEngine[issue.engine] = [];
                byEngine[issue.engine].push(issue.description);
            });
            
            Object.entries(byEngine).forEach(([engine, issues]) => {
                console.log(`   ${engine}:`);
                issues.forEach(issue => {
                    console.log(`      - ${issue}`);
                });
            });
        }
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:\n');
        
        if (this.results.godot.working < this.results.godot.tested) {
            console.log('   🎮 Godot: Create godot-integration.js with full GDScript support');
        }
        
        if (this.results.unity.working < this.results.unity.tested) {
            console.log('   🎮 Unity: Create unity-integration.js with C# and Inspector support');
        }
        
        if (this.results.unreal.working < this.results.unreal.tested) {
            console.log('   🎮 Unreal: Create unreal-integration.js with C++ and Blueprint support');
        }
        
        if (this.results.sunshine.working < this.results.sunshine.tested) {
            console.log('   ☀️  Sunshine: Create sunshine-engine.js for proprietary engine');
        }
        
        if (overallPercentage >= 80) {
            console.log('   ✅ Game dev support is strong! Polish and add advanced features.');
        } else {
            console.log('   🚨 Priority: Implement missing engine integrations immediately');
        }
        
        return {
            results: this.results,
            issues: this.issues,
            overallPercentage,
            status,
            enginePaths: this.enginePaths
        };
    }
}

// Run tests
if (require.main === module) {
    const tester = new GameDevIntegrationTester();
    
    tester.runAllTests().then(report => {
        const reportPath = path.join(__dirname, '..', 'GAME-DEV-INTEGRATION-REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Full report saved to: ${reportPath}\n`);
        
        process.exit(report.overallPercentage >= 70 ? 0 : 1);
    }).catch(error => {
        console.error('\n💥 FATAL ERROR:', error);
        process.exit(1);
    });
}

module.exports = GameDevIntegrationTester;
