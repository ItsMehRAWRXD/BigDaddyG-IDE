#!/usr/bin/env node
/**
 * BigDaddyG IDE - External CLI
 * Use from PowerShell, CMD, or Bash to control the IDE
 * Run: node bigdaddyg.js <command> [args]
 */

const net = require('net');
const readline = require('readline');

class BigDaddyGCLI {
    constructor() {
        this.port = 35792; // IPC port for IDE communication
        this.timeout = 5000;
    }
    
    async sendCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            const client = net.createConnection({ port: this.port }, () => {
                const message = JSON.stringify({ command, args });
                client.write(message);
            });
            
            let data = '';
            client.on('data', (chunk) => {
                data += chunk.toString();
            });
            
            client.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (error) {
                    resolve({ success: false, error: 'Invalid response from IDE' });
                }
            });
            
            client.on('error', (error) => {
                reject(new Error('IDE not running or IPC server not available'));
            });
            
            setTimeout(() => {
                client.destroy();
                reject(new Error('Command timeout'));
            }, this.timeout);
        });
    }
    
    async execute(args) {
        if (args.length === 0) {
            this.showHelp();
            return;
        }
        
        const command = args[0];
        const commandArgs = args.slice(1);
        
        // Handle local commands (no IDE needed)
        if (command === 'help' || command === '--help' || command === '-h') {
            this.showHelp();
            return;
        }
        
        if (command === 'version' || command === '--version' || command === '-v') {
            console.log('BigDaddyG IDE CLI v1.0.0');
            return;
        }
        
        if (command === 'interactive' || command === 'i') {
            await this.startInteractiveMode();
            return;
        }
        
        // Send command to IDE
        try {
            const response = await this.sendCommand(command, commandArgs);
            
            if (response.success) {
                console.log(`✅ ${response.message || 'Command executed successfully'}`);
                if (response.data) {
                    console.log(JSON.stringify(response.data, null, 2));
                }
            } else {
                console.error(`❌ Error: ${response.error || 'Command failed'}`);
                process.exit(1);
            }
        } catch (error) {
            console.error(`❌ ${error.message}`);
            console.error('💡 Make sure BigDaddyG IDE is running!');
            process.exit(1);
        }
    }
    
    async startInteractiveMode() {
        console.log('🚀 BigDaddyG IDE - Interactive CLI Mode');
        console.log('Type "help" for commands, "exit" to quit\n');
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'bigdaddy> '
        });
        
        rl.prompt();
        
        rl.on('line', async (line) => {
            const trimmed = line.trim();
            
            if (!trimmed) {
                rl.prompt();
                return;
            }
            
            if (trimmed === 'exit' || trimmed === 'quit') {
                console.log('👋 Goodbye!');
                rl.close();
                return;
            }
            
            const args = trimmed.split(/\s+/);
            
            if (args[0] === 'help') {
                this.showHelp();
                rl.prompt();
                return;
            }
            
            try {
                const response = await this.sendCommand(args[0], args.slice(1));
                
                if (response.success) {
                    console.log(`✅ ${response.message || 'Success'}`);
                    if (response.data) {
                        console.log(JSON.stringify(response.data, null, 2));
                    }
                } else {
                    console.error(`❌ ${response.error || 'Failed'}`);
                }
            } catch (error) {
                console.error(`❌ ${error.message}`);
            }
            
            rl.prompt();
        });
        
        rl.on('close', () => {
            process.exit(0);
        });
    }
    
    showHelp() {
        console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                    BigDaddyG IDE - External CLI                               ║
╚════════════════════════════════════════════════════════════════════════════════╝

USAGE:
  node bigdaddyg.js <command> [args]
  bigdaddyg <command> [args]         (if added to PATH)
  
MODES:
  interactive, i          Start interactive mode
  help, --help, -h        Show this help
  version, --version, -v  Show version

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABS & UI COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  tab:open <name>               Open tab (chat, explorer, github, etc.)
  tab:close <name>              Close tab
  tab:list                      List all open tabs
  tab:switch <name>             Switch to tab
  
  ui:toggle <feature>           Toggle UI feature (minimap, breadcrumbs, etc.)
  ui:show <panel>               Show panel
  ui:hide <panel>               Hide panel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ai:send <message>             Send message to AI
  ai:model:set <model>          Set AI model
  ai:model:get                  Get current model
  ai:model:list                 List all models
  ai:provider:set <provider>    Set AI provider
  ai:provider:list              List all providers
  ai:config:get <key>           Get AI config value
  ai:config:set <key> <value>   Set AI config value
  ai:key:set <provider> <key>   Set API key
  ai:temp <0-1>                 Set temperature
  ai:tokens <number>            Set max tokens
  ai:swarm:start                Start multi-agent swarm
  ai:swarm:stop                 Stop swarm
  
  voice:start                   Start voice input
  voice:stop                    Stop voice input
  voice:toggle                  Toggle voice input

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GAME DEVELOPMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  game:engine:set <engine>      Set game engine (godot, unity, unreal, sunshine)
  game:engine:get               Get current engine
  game:build                    Build game project
  game:run                      Run game project
  game:shader:open              Open shader editor
  game:animation:open           Open animation timeline
  game:asset:preview <path>     Preview asset

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEAM COLLABORATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  team:create <name>            Create team room
  team:join <id>                Join team room
  team:leave                    Leave team room
  team:list                     List participants
  team:video:toggle             Toggle video
  team:voice:toggle             Toggle voice
  team:screen:share             Share screen
  team:screen:stop              Stop sharing
  team:chat <message>           Send team message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXTENSIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ext:search <query>            Search extensions
  ext:install <name>            Install extension
  ext:uninstall <name>          Uninstall extension
  ext:list                      List installed extensions
  ext:enable <name>             Enable extension
  ext:disable <name>            Disable extension
  ext:update <name>             Update extension
  ext:update:all                Update all extensions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  file:new <path>               Create new file
  file:open <path>              Open file
  file:save [path]              Save file
  file:close [path]             Close file
  file:rename <old> <new>       Rename file
  file:delete <path>            Delete file
  file:read <path>              Read file content
  file:write <path> <content>   Write to file
  
  folder:new <path>             Create folder
  folder:delete <path>          Delete folder
  
  explorer:refresh              Refresh file explorer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEBUGGING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  debug:start                   Start debugging
  debug:stop                    Stop debugging
  debug:pause                   Pause execution
  debug:continue                Continue execution
  debug:step:over               Step over
  debug:step:into               Step into
  debug:step:out                Step out
  debug:restart                 Restart debugging
  
  breakpoint:add <file> <line>  Add breakpoint
  breakpoint:remove <file> <line> Remove breakpoint
  breakpoint:list               List all breakpoints
  breakpoint:clear              Clear all breakpoints
  breakpoint:toggle <file> <line> Toggle breakpoint
  
  watch:add <expression>        Add watch expression
  watch:remove <expression>     Remove watch expression
  watch:list                    List watch expressions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFORMANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  perf:stats                    Show performance stats
  perf:fps                      Show FPS
  perf:memory                   Show memory usage
  perf:optimize                 Run optimizer
  perf:monitor:start            Start monitoring
  perf:monitor:stop             Stop monitoring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GIT/GITHUB:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  git:status                    Show git status
  git:add <files>               Stage files
  git:commit <message>          Commit changes
  git:push                      Push to remote
  git:pull                      Pull from remote
  git:branch:create <name>      Create branch
  git:branch:switch <name>      Switch branch
  git:branch:list               List branches
  git:clone <url>               Clone repository
  git:log                       Show commit history

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AGENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  agent:create <type> <task>    Create agent
  agent:stop <id>               Stop agent
  agent:list                    List active agents
  agent:status <id>             Get agent status
  agent:result <id>             Get agent result

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SETTINGS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  setting:get <key>             Get setting value
  setting:set <key> <value>     Set setting value
  setting:list                  List all settings
  setting:reset <key>           Reset setting to default
  setting:export <file>         Export settings to file
  setting:import <file>         Import settings from file
  
  theme:set <name>              Set theme
  theme:list                    List available themes
  
  font:size:set <size>          Set font size
  font:size:get                 Get font size
  font:family:set <family>      Set font family

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UTILITIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  terminal:run <command>        Run terminal command
  search:files <query>          Search in files
  replace:files <find> <replace> Replace in files
  format:document               Format current document
  goto:line <number>            Go to line number
  
  ide:reload                    Reload IDE
  ide:quit                      Quit IDE
  ide:info                      Show IDE info

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  # Open AI Chat and send message
  bigdaddyg tab:open chat
  bigdaddyg ai:send "Create a REST API"
  
  # Start game development
  bigdaddyg tab:open game-editor
  bigdaddyg game:engine:set godot
  bigdaddyg game:build
  
  # Team collaboration
  bigdaddyg team:create "My Project"
  bigdaddyg team:video:toggle
  bigdaddyg team:screen:share
  
  # File operations
  bigdaddyg file:new src/index.js
  bigdaddyg file:write src/index.js "console.log('Hello');"
  bigdaddyg file:save src/index.js
  
  # Settings management
  bigdaddyg setting:set theme dark
  bigdaddyg setting:set fontSize 14
  bigdaddyg theme:set "Cursor Dark"
  
  # Interactive mode
  bigdaddyg interactive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For more information, visit: https://github.com/yourusername/bigdaddyg-ide
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    }
}

// Main execution
const cli = new BigDaddyGCLI();
cli.execute(process.argv.slice(2)).catch((error) => {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
});
