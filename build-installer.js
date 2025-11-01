/**
 * BigDaddyG IDE - Installer Builder
 * Creates standalone installers for Windows, macOS, and Linux
 * 
 * Outputs:
 * - Windows: BigDaddyG-Setup-2.0.0.exe
 * - macOS:   BigDaddyG-2.0.0.dmg
 * - Linux:   BigDaddyG-2.0.0.AppImage
 */

const builder = require('electron-builder');
const fs = require('fs').promises;
const path = require('path');

// Build configuration
const config = {
    appId: 'com.bigdaddyg.ide',
    productName: 'BigDaddyG IDE',
    
    // Application metadata
    copyright: 'Copyright © 2025 BigDaddyG IDE',
    
    // Directories
    directories: {
        output: 'dist',
        buildResources: 'build-resources'
    },
    
    // Files to include
    files: [
        'electron/**/*',
        'server/**/*',
        'hooks/**/*',
        'orchestration/**/*',
        'package.json',
        'node_modules/**/*',
        '!node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
        '!node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
        '!node_modules/*.d.ts',
        '!node_modules/.bin',
        '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
        '!.editorconfig',
        '!**/._*',
        '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
        '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
        '!**/{appveyor.yml,.travis.yml,circle.yml}',
        '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
    ],
    
    // Extra resources (optional - only if they exist)
    // extraResources: [],
    
    // Windows configuration
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64']
            },
            {
                target: 'portable',
                arch: ['x64']
            }
        ],
        publisherName: 'BigDaddyG IDE',
        verifyUpdateCodeSignature: false,
        
        // File associations
        fileAssociations: [
            {
                ext: ['js', 'ts', 'jsx', 'tsx', 'py', 'cpp', 'c', 'h', 'go', 'rs'],
                name: 'Source Code',
                role: 'Editor'
            }
        ]
    },
    
    // NSIS installer configuration (Windows)
    nsis: {
        oneClick: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: 'BigDaddyG IDE',
        
        // Installer UI
        runAfterFinish: true,
        
        // Advanced options
        perMachine: false, // Install per-user by default
        
        // Uninstaller
        uninstallDisplayName: 'BigDaddyG IDE - Regenerative Citadel Edition',
        deleteAppDataOnUninstall: false // Keep user settings
    },
    
    // Portable configuration (Windows USB)
    portable: {
        artifactName: 'BigDaddyG-Portable-${version}.exe',
        requestExecutionLevel: 'user',
        unicode: true,
        
        // Portable-specific settings
        unpackDirName: 'BigDaddyG-Portable',
        
        // Splash screen
        splashImage: 'build-resources/splash.bmp'
    },
    
    // macOS configuration
    mac: {
        target: [
            {
                target: 'dmg',
                arch: ['x64', 'arm64']
            },
            {
                target: 'zip',
                arch: ['x64', 'arm64']
            }
        ],
        icon: 'build-resources/icon.icns',
        category: 'public.app-category.developer-tools',
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: 'build-resources/entitlements.mac.plist',
        entitlementsInherit: 'build-resources/entitlements.mac.plist',
        
        // Notarization
        notarize: false // Set to true if you have Apple Developer account
    },
    
    // DMG configuration (macOS)
    dmg: {
        contents: [
            {
                x: 130,
                y: 220
            },
            {
                x: 410,
                y: 220,
                type: 'link',
                path: '/Applications'
            }
        ],
        title: 'BigDaddyG IDE',
        icon: 'build-resources/icon.icns',
        background: 'build-resources/dmg-background.png',
        window: {
            width: 540,
            height: 380
        }
    },
    
    // Linux configuration
    linux: {
        target: [
            {
                target: 'AppImage',
                arch: ['x64', 'arm64']
            },
            {
                target: 'deb',
                arch: ['x64', 'arm64']
            },
            {
                target: 'rpm',
                arch: ['x64']
            },
            {
                target: 'tar.gz',
                arch: ['x64', 'arm64']
            }
        ],
        icon: 'build-resources/icons/',
        category: 'Development',
        description: 'The world\'s first 100% agentic IDE',
        maintainer: 'BigDaddyG IDE Team',
        vendor: 'BigDaddyG IDE',
        synopsis: 'Autonomous development environment with voice coding and self-healing',
        
        // Desktop integration
        desktop: {
            Name: 'BigDaddyG IDE',
            Comment: 'Autonomous AI-powered development environment',
            GenericName: 'Text Editor',
            Exec: 'bigdaddyg-ide %F',
            Terminal: false,
            Type: 'Application',
            Icon: 'bigdaddyg-ide',
            Categories: 'Development;IDE;TextEditor;',
            MimeType: 'text/plain;text/x-python;text/x-c;text/x-c++;application/javascript;'
        }
    },
    
    // AppImage configuration (Linux portable)
    appImage: {
        artifactName: 'BigDaddyG-${version}.AppImage',
        synopsis: 'Autonomous development environment',
        description: 'Voice-enabled, self-healing IDE with 100% agenticality',
        category: 'Development'
    },
    
    // Debian package
    deb: {
        depends: ['gconf2', 'gconf-service', 'libnotify4', 'libappindicator1', 'libxtst6', 'libnss3'],
        priority: 'optional',
        afterInstall: 'build-resources/linux/after-install.sh',
        afterRemove: 'build-resources/linux/after-remove.sh'
    },
    
    // Publish configuration (for updates)
    publish: {
        provider: 'github',
        owner: 'ItsMehRAWRXD',
        repo: 'BigDaddyG-IDE',
        releaseType: 'release'
    },
    
    // Compression
    compression: 'maximum',
    
    // Asar archive
    asar: true,
    asarUnpack: [
        '**/node_modules/sharp/**/*',
        '**/models/**/*'
    ]
};

// ============================================================================
// BUILD FUNCTIONS
// ============================================================================

async function buildAll() {
    console.log('🔨 Building BigDaddyG IDE installers for all platforms...\n');
    
    try {
        // Build for Windows, macOS, and Linux
        await builder.build({
            targets: builder.Platform.WINDOWS.createTarget(),
            config: config
        });
        
        await builder.build({
            targets: builder.Platform.MAC.createTarget(),
            config: config
        });
        
        await builder.build({
            targets: builder.Platform.LINUX.createTarget(),
            config: config
        });
        
        console.log('\n✅ All installers built successfully!\n');
        console.log('📦 Output directory: ./dist/\n');
        
        // List built files
        await listBuiltFiles();
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

async function buildWindows() {
    console.log('🪟 Building Windows installer...\n');
    
    try {
        await builder.build({
            targets: builder.Platform.WINDOWS.createTarget(['nsis', 'portable']),
            config: config
        });
        
        console.log('\n✅ Windows installer built successfully!\n');
        await listBuiltFiles();
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

async function buildMacOS() {
    console.log('🍎 Building macOS installer...\n');
    
    try {
        await builder.build({
            targets: builder.Platform.MAC.createTarget(['dmg']),
            config: config
        });
        
        console.log('\n✅ macOS installer built successfully!\n');
        await listBuiltFiles();
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

async function buildLinux() {
    console.log('🐧 Building Linux installer...\n');
    
    try {
        await builder.build({
            targets: builder.Platform.LINUX.createTarget(['AppImage', 'deb']),
            config: config
        });
        
        console.log('\n✅ Linux installer built successfully!\n');
        await listBuiltFiles();
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

async function listBuiltFiles() {
    const distDir = 'dist';
    
    try {
        const files = await fs.readdir(distDir);
        
        console.log('📦 Built Installers:\n');
        
        for (const file of files) {
            const filePath = path.join(distDir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                console.log(`  ✅ ${file} (${sizeMB} MB)`);
            }
        }
        
        console.log('');
        
    } catch (error) {
        console.error('Could not list dist files:', error.message);
    }
}

// ============================================================================
// RUN BUILD
// ============================================================================

const args = process.argv.slice(2);
const target = args[0] || 'all';

switch (target) {
    case 'windows':
    case 'win':
        buildWindows();
        break;
    case 'macos':
    case 'mac':
        buildMacOS();
        break;
    case 'linux':
        buildLinux();
        break;
    case 'all':
    default:
        buildAll();
        break;
}

