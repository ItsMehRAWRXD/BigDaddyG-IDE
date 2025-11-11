#!/usr/bin/env node

/**
 * Editor Switcher CLI
 * Control which editor is active from command line
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function print(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

class EditorSwitcherCLI {
    constructor() {
        this.configPath = path.join(__dirname, '../electron/editor-preference.json');
    }

    /**
     * Get current editor preference
     */
    getCurrent() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                return data.editor || 'monaco';
            }
        } catch (err) {
            // Ignore
        }
        return 'monaco';
    }

    /**
     * Set editor preference
     */
    setCurrent(editor) {
        try {
            const data = {
                editor: editor,
                timestamp: Date.now()
            };
            fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
            return true;
        } catch (err) {
            console.error('Failed to save preference:', err.message);
            return false;
        }
    }

    /**
     * Show status
     */
    status() {
        print('\n=== EDITOR STATUS ===', 'bright');
        print('');
        
        const current = this.getCurrent();
        
        if (current === 'monaco') {
            print('✅ Monaco Editor', 'green');
            print('   Industry-standard VS Code editor', 'cyan');
        } else {
            print('✅ BigDaddy Editor', 'green');
            print('   Custom AI-powered editor', 'cyan');
        }
        
        print('');
    }

    /**
     * Switch to Monaco
     */
    switchToMonaco() {
        print('\n🔄 Switching to Monaco Editor...', 'blue');
        
        if (this.setCurrent('monaco')) {
            print('✅ Success! Monaco Editor will be active on next launch.', 'green');
            print('   Restart the IDE to apply changes.', 'cyan');
        } else {
            print('❌ Failed to switch editor', 'red');
        }
        
        print('');
    }

    /**
     * Switch to BigDaddy
     */
    switchToBigDaddy() {
        print('\n🔄 Switching to BigDaddy Editor...', 'blue');
        
        if (this.setCurrent('bigdaddy')) {
            print('✅ Success! BigDaddy Editor will be active on next launch.', 'green');
            print('   Restart the IDE to apply changes.', 'cyan');
        } else {
            print('❌ Failed to switch editor', 'red');
        }
        
        print('');
    }

    /**
     * Toggle editor
     */
    toggle() {
        const current = this.getCurrent();
        const next = current === 'monaco' ? 'bigdaddy' : 'monaco';
        
        print(`\n🔄 Toggling: ${current} → ${next}`, 'blue');
        
        if (this.setCurrent(next)) {
            print(`✅ Success! ${next === 'monaco' ? 'Monaco' : 'BigDaddy'} Editor will be active on next launch.`, 'green');
            print('   Restart the IDE to apply changes.', 'cyan');
        } else {
            print('❌ Failed to toggle editor', 'red');
        }
        
        print('');
    }

    /**
     * Show help
     */
    help() {
        print('\n=== EDITOR SWITCHER CLI ===', 'bright');
        print('');
        print('Usage:', 'cyan');
        print('  node editor-switcher-cli.js [command]');
        print('');
        print('Commands:', 'cyan');
        print('  status          Show current editor');
        print('  monaco          Switch to Monaco Editor');
        print('  bigdaddy        Switch to BigDaddy Editor');
        print('  toggle          Toggle between editors');
        print('  help            Show this help');
        print('');
        print('Examples:', 'cyan');
        print('  node editor-switcher-cli.js status');
        print('  node editor-switcher-cli.js monaco');
        print('  node editor-switcher-cli.js bigdaddy');
        print('  node editor-switcher-cli.js toggle');
        print('');
        print('Note: Changes take effect on next IDE launch', 'yellow');
        print('');
    }

    /**
     * Run CLI
     */
    run(args) {
        const command = args[2] || 'status';

        switch (command.toLowerCase()) {
            case 'status':
                this.status();
                break;

            case 'monaco':
                this.switchToMonaco();
                break;

            case 'bigdaddy':
            case 'bigdaddy-editor':
                this.switchToBigDaddy();
                break;

            case 'toggle':
                this.toggle();
                break;

            case 'help':
            case '--help':
            case '-h':
                this.help();
                break;

            default:
                print(`❌ Unknown command: ${command}`, 'red');
                print('Run "node editor-switcher-cli.js help" for usage', 'yellow');
                process.exit(1);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const cli = new EditorSwitcherCLI();
    cli.run(process.argv);
}

module.exports = EditorSwitcherCLI;
