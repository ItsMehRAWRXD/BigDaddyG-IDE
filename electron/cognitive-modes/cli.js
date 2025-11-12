#!/usr/bin/env node

/**
 * BigDaddyG IDE - Cognitive Modes CLI
 * 
 * Command-line interface for cognitive mode control
 * Works with Node.js, PowerShell, and Command Prompt
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

const CognitiveModeManager = require('./mode-manager.js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
};

class CognitiveModeCLI {
    constructor() {
        this.manager = new CognitiveModeManager();
        this.configPath = this.findConfigPath();
        
        if (this.configPath) {
            this.manager.initialize(this.configPath);
        }
    }

    /**
     * Find configuration file
     */
    findConfigPath() {
        const possiblePaths = [
            './cognitive-modes-config.json',
            '../cognitive-modes-config.json',
            path.join(__dirname, 'cognitive-modes-config.json'),
            path.join(__dirname, '../cognitive-modes-config.json'),
            path.join(process.cwd(), 'cognitive-modes-config.json')
        ];

        for (const configPath of possiblePaths) {
            if (fs.existsSync(configPath)) {
                return configPath;
            }
        }

        // Create default config
        const defaultPath = path.join(process.cwd(), 'cognitive-modes-config.json');
        return defaultPath;
    }

    /**
     * Print colored text
     */
    print(text, color = 'white') {
        if (process.stdout.isTTY) {
            console.log(colors[color] + text + colors.reset);
        } else {
            console.log(text);
        }
    }

    /**
     * Print header
     */
    printHeader() {
        this.print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
        this.print('  🧠 COGNITIVE MODES CLI', 'bright');
        this.print('  BigDaddyG IDE - AI Reasoning Control', 'dim');
        this.print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
    }

    /**
     * Print usage help
     */
    printHelp() {
        this.printHeader();
        
        console.log('USAGE:');
        console.log('  node cli.js [command] [options]\n');
        
        console.log('COMMANDS:');
        console.log('  list              List all modes and their status');
        console.log('  toggle <mode>     Toggle a specific mode on/off');
        console.log('  enable <mode>     Enable a specific mode');
        console.log('  disable <mode>    Disable a specific mode');
        console.log('  preset <name>     Load a preset configuration');
        console.log('  weight <mode> <n> Set mode priority (0.0-2.0)');
        console.log('  stats             Show usage statistics');
        console.log('  export            Export configuration');
        console.log('  import <file>     Import configuration from file');
        console.log('  interactive       Start interactive mode');
        console.log('  help              Show this help message\n');
        
        console.log('MODES:');
        console.log('  thinking          Deep reasoning and analysis');
        console.log('  search            Information retrieval');
        console.log('  planning          Task breakdown');
        console.log('  reflect           Self-assessment');
        console.log('  learn             Knowledge acquisition\n');
        
        console.log('PRESETS:');
        console.log('  default           All modes enabled');
        console.log('  coding            Development focus');
        console.log('  research          Investigation focus');
        console.log('  planning          Organization focus');
        console.log('  learning          Education focus');
        console.log('  fast              Quick responses (all off)\n');
        
        console.log('EXAMPLES:');
        console.log('  node cli.js list');
        console.log('  node cli.js toggle thinking');
        console.log('  node cli.js preset coding');
        console.log('  node cli.js weight search 1.5');
        console.log('  node cli.js interactive\n');
    }

    /**
     * List all modes
     */
    listModes() {
        this.printHeader();
        
        const modes = this.manager.getAllModes();
        
        console.log('CURRENT MODE STATUS:\n');
        
        for (const [key, mode] of Object.entries(modes)) {
            const status = mode.enabled ? 
                `${colors.green}🟢 ON ${colors.reset}` : 
                `${colors.red}🔴 OFF${colors.reset}`;
            
            const weight = `${colors.yellow}⚖️ ${mode.weight.toFixed(1)}${colors.reset}`;
            
            console.log(`  ${mode.icon} ${mode.name.padEnd(12)} ${status}  ${weight}`);
            console.log(`     ${colors.dim}${mode.description}${colors.reset}\n`);
        }
    }

    /**
     * Toggle mode
     */
    toggleMode(mode) {
        const result = this.manager.toggle(mode);
        
        if (result !== undefined) {
            const modeConfig = this.manager.getMode(mode);
            const status = result ? 
                `${colors.green}ENABLED${colors.reset}` : 
                `${colors.red}DISABLED${colors.reset}`;
            
            console.log(`\n${modeConfig.icon} ${modeConfig.name}: ${status}\n`);
        } else {
            this.print(`\n❌ Unknown mode: ${mode}\n`, 'red');
        }
    }

    /**
     * Enable mode
     */
    enableMode(mode) {
        const result = this.manager.enable(mode);
        
        if (result) {
            const modeConfig = this.manager.getMode(mode);
            this.print(`\n${modeConfig.icon} ${modeConfig.name}: ${colors.green}ENABLED${colors.reset}\n`, 'green');
        } else {
            this.print(`\n❌ Unknown mode: ${mode}\n`, 'red');
        }
    }

    /**
     * Disable mode
     */
    disableMode(mode) {
        const result = this.manager.disable(mode);
        
        if (result) {
            const modeConfig = this.manager.getMode(mode);
            this.print(`\n${modeConfig.icon} ${modeConfig.name}: ${colors.red}DISABLED${colors.reset}\n`, 'red');
        } else {
            this.print(`\n❌ Unknown mode: ${mode}\n`, 'red');
        }
    }

    /**
     * Load preset
     */
    loadPreset(preset) {
        const result = this.manager.loadPreset(preset);
        
        if (result) {
            this.print(`\n⚡ Preset loaded: ${preset}\n`, 'green');
            this.listModes();
        } else {
            this.print(`\n❌ Unknown preset: ${preset}\n`, 'red');
        }
    }

    /**
     * Set weight
     */
    setWeight(mode, weight) {
        const weightNum = parseFloat(weight);
        
        if (isNaN(weightNum)) {
            this.print(`\n❌ Invalid weight: ${weight}\n`, 'red');
            return;
        }
        
        const result = this.manager.setWeight(mode, weightNum);
        
        if (result) {
            const modeConfig = this.manager.getMode(mode);
            this.print(`\n⚖️ ${modeConfig.name} priority: ${weightNum.toFixed(1)}\n`, 'green');
        } else {
            this.print(`\n❌ Unknown mode: ${mode}\n`, 'red');
        }
    }

    /**
     * Show statistics
     */
    showStats() {
        this.printHeader();
        
        const stats = this.manager.getStatistics();
        
        console.log('STATISTICS:\n');
        console.log(`  Total Modes:      ${stats.totalModes}`);
        console.log(`  ${colors.green}Enabled:${colors.reset}          ${stats.enabled}`);
        console.log(`  ${colors.red}Disabled:${colors.reset}         ${stats.disabled}`);
        console.log(`  Average Priority: ${stats.averageWeight.toFixed(2)}`);
        console.log(`  Total Toggles:    ${stats.totalToggles}`);
        
        if (stats.mostToggled) {
            console.log(`  Most Toggled:     ${stats.mostToggled.mode} (${stats.mostToggled.count} times)`);
        }
        
        console.log('');
    }

    /**
     * Export configuration
     */
    exportConfig() {
        const config = this.manager.exportConfig();
        const output = JSON.stringify(config, null, 2);
        
        console.log('\nEXPORTED CONFIGURATION:\n');
        console.log(output);
        console.log('');
    }

    /**
     * Import configuration
     */
    importConfig(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            const config = JSON.parse(data);
            
            const result = this.manager.importConfig(config);
            
            if (result) {
                this.print(`\n✅ Configuration imported from: ${filePath}\n`, 'green');
                this.listModes();
            } else {
                this.print(`\n❌ Invalid configuration file\n`, 'red');
            }
        } catch (error) {
            this.print(`\n❌ Error importing: ${error.message}\n`, 'red');
        }
    }

    /**
     * Interactive mode
     */
    async startInteractive() {
        this.printHeader();
        this.print('Interactive Mode (type "help" for commands, "exit" to quit)\n', 'dim');
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: colors.cyan + '🧠 > ' + colors.reset
        });

        rl.prompt();

        rl.on('line', (line) => {
            const args = line.trim().split(/\s+/);
            const command = args[0].toLowerCase();

            switch (command) {
                case 'list':
                    this.listModes();
                    break;
                case 'toggle':
                    if (args[1]) this.toggleMode(args[1]);
                    else console.log('Usage: toggle <mode>');
                    break;
                case 'enable':
                    if (args[1]) this.enableMode(args[1]);
                    else console.log('Usage: enable <mode>');
                    break;
                case 'disable':
                    if (args[1]) this.disableMode(args[1]);
                    else console.log('Usage: disable <mode>');
                    break;
                case 'preset':
                    if (args[1]) this.loadPreset(args[1]);
                    else console.log('Usage: preset <name>');
                    break;
                case 'weight':
                    if (args[1] && args[2]) this.setWeight(args[1], args[2]);
                    else console.log('Usage: weight <mode> <value>');
                    break;
                case 'stats':
                    this.showStats();
                    break;
                case 'export':
                    this.exportConfig();
                    break;
                case 'help':
                    this.printHelp();
                    break;
                case 'exit':
                case 'quit':
                    console.log('\nGoodbye! 👋\n');
                    rl.close();
                    return;
                case '':
                    break;
                default:
                    console.log(`Unknown command: ${command} (type "help" for commands)`);
            }

            rl.prompt();
        });

        rl.on('close', () => {
            process.exit(0);
        });
    }

    /**
     * Run CLI
     */
    async run(args) {
        const command = args[0];

        if (!command || command === 'help') {
            this.printHelp();
            return;
        }

        switch (command) {
            case 'list':
                this.listModes();
                break;
            case 'toggle':
                if (args[1]) this.toggleMode(args[1]);
                else console.log('Error: Missing mode argument');
                break;
            case 'enable':
                if (args[1]) this.enableMode(args[1]);
                else console.log('Error: Missing mode argument');
                break;
            case 'disable':
                if (args[1]) this.disableMode(args[1]);
                else console.log('Error: Missing mode argument');
                break;
            case 'preset':
                if (args[1]) this.loadPreset(args[1]);
                else console.log('Error: Missing preset argument');
                break;
            case 'weight':
                if (args[1] && args[2]) this.setWeight(args[1], args[2]);
                else console.log('Error: Missing arguments (mode and weight)');
                break;
            case 'stats':
                this.showStats();
                break;
            case 'export':
                this.exportConfig();
                break;
            case 'import':
                if (args[1]) this.importConfig(args[1]);
                else console.log('Error: Missing file path');
                break;
            case 'interactive':
                await this.startInteractive();
                break;
            default:
                console.log(`Unknown command: ${command}`);
                console.log('Run "node cli.js help" for usage information');
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new CognitiveModeCLI();
    const args = process.argv.slice(2);
    cli.run(args).catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = CognitiveModeCLI;
