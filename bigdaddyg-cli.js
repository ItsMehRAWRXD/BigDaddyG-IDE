#!/usr/bin/env node

/**
 * BigDaddyG IDE - Command Line Interface
 * Agentic coding via CLI with PowerShell/CMD support
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

class BigDaddyGCLI {
    constructor() {
        this.version = '1.0.0';
        this.workingDirectory = process.cwd();
        this.history = [];
        this.aiEnabled = true;
        
        this.commands = new Map([
            ['help', this.showHelp.bind(this)],
            ['version', this.showVersion.bind(this)],
            ['init', this.initProject.bind(this)],
            ['open', this.openFile.bind(this)],
            ['create', this.createFile.bind(this)],
            ['edit', this.editFile.bind(this)],
            ['delete', this.deleteFile.bind(this)],
            ['ls', this.listFiles.bind(this)],
            ['cd', this.changeDirectory.bind(this)],
            ['pwd', this.printWorkingDirectory.bind(this)],
            ['run', this.runProject.bind(this)],
            ['build', this.buildProject.bind(this)],
            ['test', this.runTests.bind(this)],
            ['ai', this.aiCommand.bind(this)],
            ['chat', this.aiChat.bind(this)],
            ['explain', this.explainCode.bind(this)],
            ['fix', this.fixCode.bind(this)],
            ['refactor', this.refactorCode.bind(this)],
            ['generate', this.generateCode.bind(this)],
            ['search', this.searchCode.bind(this)],
            ['git', this.gitCommand.bind(this)],
            ['terminal', this.openTerminal.bind(this)],
            ['settings', this.settings.bind(this)],
            ['exit', this.exit.bind(this)]
        ]);
        
        console.log('BigDaddyG IDE CLI v' + this.version);
        console.log('Type "help" for available commands\n');
    }
    
    /**
     * Start CLI
     */
    async start() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'BigDaddyG> '
        });
        
        rl.prompt();
        
        rl.on('line', async (line) => {
            const trimmed = line.trim();
            
            if (trimmed) {
                this.history.push(trimmed);
                await this.execute(trimmed);
            }
            
            rl.prompt();
        });
        
        rl.on('close', () => {
            console.log('\nGoodbye!');
            process.exit(0);
        });
    }
    
    /**
     * Execute command
     */
    async execute(commandLine) {
        const [cmd, ...args] = commandLine.split(' ');
        const command = this.commands.get(cmd);
        
        if (command) {
            try {
                await command(args);
            } catch (error) {
                console.error(`Error: ${error.message}`);
            }
        } else {
            console.log(`Unknown command: ${cmd}. Type "help" for available commands.`);
        }
    }
    
    /**
     * Show help
     */
    async showHelp() {
        console.log(`
📚 BigDaddyG IDE CLI Commands:

File Operations:
  open <file>          - Open file in editor
  create <file>        - Create new file
  edit <file>          - Edit file
  delete <file>        - Delete file
  ls [path]            - List files
  cd <path>            - Change directory
  pwd                  - Print working directory

Project Operations:
  init [type]          - Initialize new project (godot|unity|unreal|node)
  run                  - Run current project
  build [target]       - Build project
  test                 - Run tests

AI-Powered Commands:
  ai <prompt>          - Ask AI anything
  chat                 - Start AI chat session
  explain <file>       - Explain code in file
  fix <file>           - Fix bugs in file
  refactor <file>      - Refactor code in file
  generate <desc>      - Generate code from description
  search <query>       - Search codebase

Git Commands:
  git status           - Git status
  git commit <msg>     - Commit changes
  git push             - Push to remote
  git pull             - Pull from remote

Utility:
  terminal             - Open system terminal
  settings             - Configure CLI settings
  version              - Show version
  help                 - Show this help
  exit                 - Exit CLI

Examples:
  BigDaddyG> ai "create a REST API with Express"
  BigDaddyG> generate "user authentication system"
  BigDaddyG> fix main.js
  BigDaddyG> refactor src/utils.js
        `);
    }
    
    /**
     * Show version
     */
    async showVersion() {
        console.log(`BigDaddyG IDE CLI v${this.version}`);
        console.log(`Node.js ${process.version}`);
        console.log(`Platform: ${process.platform}`);
    }
    
    /**
     * Initialize project
     */
    async initProject(args) {
        const projectType = args[0] || 'node';
        const projectName = args[1] || 'my-project';
        
        console.log(`Initializing ${projectType} project: ${projectName}...`);
        
        const projectPath = path.join(this.workingDirectory, projectName);
        
        if (fs.existsSync(projectPath)) {
            console.error(`Error: Directory ${projectName} already exists`);
            return;
        }
        
        fs.mkdirSync(projectPath, { recursive: true });
        
        switch (projectType) {
            case 'godot':
                await this.initGodotProject(projectPath);
                break;
            case 'unity':
                console.log('Unity project initialization requires Unity Editor');
                break;
            case 'unreal':
                console.log('Unreal project initialization requires Unreal Engine');
                break;
            case 'node':
            default:
                await this.initNodeProject(projectPath);
                break;
        }
        
        console.log(`✅ Project created at: ${projectPath}`);
    }
    
    /**
     * Initialize Node.js project
     */
    async initNodeProject(projectPath) {
        const packageJson = {
            name: path.basename(projectPath),
            version: '1.0.0',
            description: '',
            main: 'index.js',
            scripts: {
                start: 'node index.js',
                test: 'echo "Error: no test specified" && exit 1'
            },
            keywords: [],
            author: '',
            license: 'MIT'
        };
        
        fs.writeFileSync(
            path.join(projectPath, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        
        fs.writeFileSync(
            path.join(projectPath, 'index.js'),
            '// BigDaddyG IDE\nconsole.log("Hello, World!");\n'
        );
        
        fs.writeFileSync(
            path.join(projectPath, 'README.md'),
            `# ${path.basename(projectPath)}\n\nCreated with BigDaddyG IDE\n`
        );
    }
    
    /**
     * Initialize Godot project
     */
    async initGodotProject(projectPath) {
        const projectGodot = `
config_version=5

[application]

config/name="${path.basename(projectPath)}"
run/main_scene="res://main.tscn"
config/features=PackedStringArray("4.2")

[rendering]

renderer/rendering_method="gl_compatibility"
        `.trim();
        
        fs.writeFileSync(path.join(projectPath, 'project.godot'), projectGodot);
        
        const mainScene = `
[gd_scene format=3]

[node name="Main" type="Node2D"]
        `.trim();
        
        fs.writeFileSync(path.join(projectPath, 'main.tscn'), mainScene);
    }
    
    /**
     * Open file
     */
    async openFile(args) {
        const filePath = args[0];
        
        if (!filePath) {
            console.error('Error: No file specified');
            return;
        }
        
        const fullPath = path.resolve(this.workingDirectory, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`Error: File not found: ${filePath}`);
            return;
        }
        
        console.log(`Opening: ${fullPath}`);
        
        // On Windows, use 'start'. On Mac, use 'open'. On Linux, use 'xdg-open'
        const command = process.platform === 'win32' ? 'start' :
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
        
        spawn(command, [fullPath], { shell: true, detached: true });
    }
    
    /**
     * Create file
     */
    async createFile(args) {
        const filePath = args[0];
        
        if (!filePath) {
            console.error('Error: No file specified');
            return;
        }
        
        const fullPath = path.resolve(this.workingDirectory, filePath);
        
        if (fs.existsSync(fullPath)) {
            console.error(`Error: File already exists: ${filePath}`);
            return;
        }
        
        // Create directory if needed
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, '');
        console.log(`✅ Created: ${filePath}`);
    }
    
    /**
     * Edit file
     */
    async editFile(args) {
        const filePath = args[0];
        
        if (!filePath) {
            console.error('Error: No file specified');
            return;
        }
        
        await this.openFile(args);
    }
    
    /**
     * Delete file
     */
    async deleteFile(args) {
        const filePath = args[0];
        
        if (!filePath) {
            console.error('Error: No file specified');
            return;
        }
        
        const fullPath = path.resolve(this.workingDirectory, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`Error: File not found: ${filePath}`);
            return;
        }
        
        fs.unlinkSync(fullPath);
        console.log(`✅ Deleted: ${filePath}`);
    }
    
    /**
     * List files
     */
    async listFiles(args) {
        const dir = args[0] || '.';
        const fullPath = path.resolve(this.workingDirectory, dir);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`Error: Directory not found: ${dir}`);
            return;
        }
        
        const items = fs.readdirSync(fullPath);
        
        console.log(`\nContents of ${dir}:`);
        for (const item of items) {
            const itemPath = path.join(fullPath, item);
            const stat = fs.statSync(itemPath);
            const icon = stat.isDirectory() ? '📁' : '📄';
            console.log(`  ${icon} ${item}`);
        }
        console.log('');
    }
    
    /**
     * Change directory
     */
    async changeDirectory(args) {
        const dir = args[0] || process.env.HOME || process.env.USERPROFILE;
        const fullPath = path.resolve(this.workingDirectory, dir);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`Error: Directory not found: ${dir}`);
            return;
        }
        
        this.workingDirectory = fullPath;
        process.chdir(fullPath);
        console.log(`Changed directory to: ${fullPath}`);
    }
    
    /**
     * Print working directory
     */
    async printWorkingDirectory() {
        console.log(this.workingDirectory);
    }
    
    /**
     * Run project
     */
    async runProject(args) {
        console.log('Running project...');
        
        // Detect project type
        if (fs.existsSync(path.join(this.workingDirectory, 'package.json'))) {
            console.log('Detected Node.js project');
            spawn('npm', ['start'], { stdio: 'inherit', shell: true });
        } else if (fs.existsSync(path.join(this.workingDirectory, 'project.godot'))) {
            console.log('Detected Godot project');
            spawn('godot', ['--path', this.workingDirectory], { stdio: 'inherit', shell: true });
        } else {
            console.log('Unknown project type');
        }
    }
    
    /**
     * Build project
     */
    async buildProject(args) {
        console.log('Building project...');
        
        if (fs.existsSync(path.join(this.workingDirectory, 'package.json'))) {
            spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
        } else {
            console.log('No build script found');
        }
    }
    
    /**
     * Run tests
     */
    async runTests(args) {
        console.log('Running tests...');
        
        if (fs.existsSync(path.join(this.workingDirectory, 'package.json'))) {
            spawn('npm', ['test'], { stdio: 'inherit', shell: true });
        } else {
            console.log('No test script found');
        }
    }
    
    /**
     * AI command
     */
    async aiCommand(args) {
        const prompt = args.join(' ');
        
        if (!prompt) {
            console.error('Error: No prompt provided');
            return;
        }
        
        console.log('🤖 AI: Processing your request...');
        console.log(`Prompt: "${prompt}"`);
        console.log('\n[AI response would appear here in full implementation]');
        console.log('Hint: Use "chat" for interactive AI conversation');
    }
    
    /**
     * AI chat
     */
    async aiChat(args) {
        console.log('🤖 Starting AI chat session...');
        console.log('Type "exit" to end chat\n');
        
        // This would connect to the AI system
        console.log('AI: Hello! How can I help you code today?');
    }
    
    /**
     * Explain code
     */
    async explainCode(args) {
        const filePath = args[0];
        
        if (!filePath) {
            console.error('Error: No file specified');
            return;
        }
        
        console.log(`🤖 Explaining code in: ${filePath}...`);
        console.log('[AI explanation would appear here]');
    }
    
    /**
     * Fix code
     */
    async fixCode(args) {
        const filePath = args[0];
        
        if (!filePath) {
            console.error('Error: No file specified');
            return;
        }
        
        console.log(`🔧 Fixing bugs in: ${filePath}...`);
        console.log('[AI would analyze and fix bugs here]');
    }
    
    /**
     * Refactor code
     */
    async refactorCode(args) {
        const filePath = args[0];
        
        if (!filePath) {
            console.error('Error: No file specified');
            return;
        }
        
        console.log(`♻️  Refactoring: ${filePath}...`);
        console.log('[AI would refactor code here]');
    }
    
    /**
     * Generate code
     */
    async generateCode(args) {
        const description = args.join(' ');
        
        if (!description) {
            console.error('Error: No description provided');
            return;
        }
        
        console.log(`✨ Generating code for: "${description}"...`);
        console.log('[AI would generate code here]');
    }
    
    /**
     * Search code
     */
    async searchCode(args) {
        const query = args.join(' ');
        
        if (!query) {
            console.error('Error: No search query provided');
            return;
        }
        
        console.log(`🔍 Searching for: "${query}"...`);
        console.log('[Search results would appear here]');
    }
    
    /**
     * Git command
     */
    async gitCommand(args) {
        spawn('git', args, { stdio: 'inherit', shell: true });
    }
    
    /**
     * Open terminal
     */
    async openTerminal(args) {
        console.log('Opening system terminal...');
        
        const command = process.platform === 'win32' ? 'start cmd' :
                       process.platform === 'darwin' ? 'open -a Terminal' :
                       'x-terminal-emulator';
        
        spawn(command, [], { shell: true, detached: true });
    }
    
    /**
     * Settings
     */
    async settings(args) {
        console.log('CLI Settings:');
        console.log(`  Working Directory: ${this.workingDirectory}`);
        console.log(`  AI Enabled: ${this.aiEnabled}`);
        console.log(`  History Size: ${this.history.length}`);
    }
    
    /**
     * Exit CLI
     */
    async exit(args) {
        console.log('Goodbye!');
        process.exit(0);
    }
}

// Start CLI if run directly
if (require.main === module) {
    const cli = new BigDaddyGCLI();
    cli.start();
}

module.exports = BigDaddyGCLI;
