/**
 * Command Palette - Full Cursor-like Command System
 * Provides: Fuzzy search, slash commands, tool mapping
 */

(function() {
'use strict';

class CommandPalette {
  constructor() {
    this.commands = new Map();
    this.history = [];
    this.isOpen = false;
    this.currentInput = '';
    this.filteredCommands = [];
    
    console.log('[CommandPalette] 🎯 Initializing command palette...');
    this.initialize();
  }

  initialize() {
    // Register all commands
    this.registerAllCommands();
    
    // Create UI
    this.createUI();
    
    // Register keyboard shortcut (Ctrl+Shift+P or Ctrl+K)
    this.registerShortcuts();
    
    // Make globally available
    window.commandPalette = this;
    
    console.log('[CommandPalette] ✅ Command palette ready');
  }

  registerAllCommands() {
    // AI Commands
    this.registerCommand('ai.explain', 'Explain Selection', 'Explain selected code', () => {
      if (window.monacoInlineAI) {
        window.monacoInlineAI.explainSelection();
      }
    });

    this.registerCommand('ai.quick-fix', 'Quick Fix', 'Fix issues in selected code', () => {
      if (window.monacoInlineAI) {
        window.monacoInlineAI.quickFix();
      }
    });

    this.registerCommand('ai.refactor', 'Refactor', 'Refactor selected code', () => {
      if (window.monacoInlineAI) {
        window.monacoInlineAI.refactor();
      }
    });

    this.registerCommand('ai.add-docstrings', 'Add Docstrings', 'Add documentation to code', () => {
      if (window.monacoInlineAI) {
        window.monacoInlineAI.addDocstrings();
      }
    });

    this.registerCommand('ai.write-tests', 'Write Tests', 'Generate tests for code', () => {
      if (window.monacoInlineAI) {
        window.monacoInlineAI.writeTests();
      }
    });

    // File Commands
    this.registerCommand('file.new', 'New File', 'Create a new file', () => {
      if (window.completeTabSystem) {
        window.completeTabSystem.createTab({ type: 'code', title: 'Untitled' });
      }
    });

    this.registerCommand('file.open', 'Open File', 'Open a file', async () => {
      if (window.electron && window.electron.openFileDialog) {
        const result = await window.electron.openFileDialog();
        if (result && !result.canceled && result.filePaths.length > 0) {
          // Open file
          console.log('Opening:', result.filePaths[0]);
        }
      }
    });

    this.registerCommand('file.save', 'Save File', 'Save current file', () => {
      if (window.electron && window.electron.writeFile) {
        // Save logic
        console.log('Saving file...');
      }
    });

    // Git Commands
    this.registerCommand('git.commit', 'Git: Commit', 'Commit changes', () => {
      if (window.gitManager) {
        window.gitManager.commit();
      }
    });

    this.registerCommand('git.push', 'Git: Push', 'Push to remote', () => {
      if (window.gitManager) {
        window.gitManager.push();
      }
    });

    this.registerCommand('git.pull', 'Git: Pull', 'Pull from remote', () => {
      if (window.gitManager) {
        window.gitManager.pull();
      }
    });

    // Test Commands
    this.registerCommand('test.run', 'Run Tests', 'Run all tests', () => {
      if (window.testRunner) {
        window.testRunner.runAll();
      }
    });

    this.registerCommand('test.watch', 'Watch Tests', 'Watch mode for tests', () => {
      if (window.testRunner) {
        window.testRunner.watch();
      }
    });

    // Search Commands
    this.registerCommand('search.files', 'Search Files', 'Search in files', () => {
      this.showSearchDialog('files');
    });

    this.registerCommand('search.symbols', 'Search Symbols', 'Search symbols', () => {
      this.showSearchDialog('symbols');
    });

    console.log(`[CommandPalette] ✅ Registered ${this.commands.size} commands`);
  }

  registerCommand(id, label, description, handler) {
    this.commands.set(id, {
      id,
      label,
      description,
      handler,
      keywords: `${label} ${description}`.toLowerCase()
    });
  }

  createUI() {
    // Create command palette container
    const container = document.createElement('div');
    container.id = 'command-palette';
    container.className = 'command-palette';
    container.style.display = 'none';
    container.innerHTML = `
      <div class="command-palette-input-container">
        <input type="text" 
               id="command-palette-input" 
               class="command-palette-input" 
               placeholder="Type a command or search... (e.g., /fix, /refactor, /test)"
               autocomplete="off">
        <div class="command-palette-hint">Press Esc to close, Enter to execute</div>
      </div>
      <div class="command-palette-results" id="command-palette-results">
        <!-- Results will be populated here -->
      </div>
    `;

    // Add styles
    this.addStyles();

    document.body.appendChild(container);

    // Setup input handler
    const input = document.getElementById('command-palette-input');
    input.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
  }

  addStyles() {
    if (document.getElementById('command-palette-styles')) {
      return; // Styles already added
    }

    const style = document.createElement('style');
    style.id = 'command-palette-styles';
    style.textContent = `
      .command-palette {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        max-width: 90vw;
        background: #1e1e1e;
        border: 1px solid #3e3e3e;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .command-palette-input-container {
        padding: 12px;
        border-bottom: 1px solid #3e3e3e;
      }

      .command-palette-input {
        width: 100%;
        padding: 8px 12px;
        background: #252526;
        border: 1px solid #3e3e3e;
        border-radius: 4px;
        color: #cccccc;
        font-size: 14px;
        outline: none;
      }

      .command-palette-input:focus {
        border-color: #007acc;
      }

      .command-palette-hint {
        margin-top: 4px;
        font-size: 11px;
        color: #858585;
      }

      .command-palette-results {
        max-height: 400px;
        overflow-y: auto;
      }

      .command-palette-item {
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid #2d2d2d;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .command-palette-item:hover,
      .command-palette-item.selected {
        background: #2a2d2e;
      }

      .command-palette-item-label {
        font-weight: 500;
        color: #cccccc;
      }

      .command-palette-item-description {
        font-size: 12px;
        color: #858585;
      }

      .command-palette-item-shortcut {
        font-size: 11px;
        color: #858585;
        background: #2d2d2d;
        padding: 2px 6px;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  registerShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+P or Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.open();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    const container = document.getElementById('command-palette');
    const input = document.getElementById('command-palette-input');
    
    if (container && input) {
      container.style.display = 'block';
      input.value = '';
      input.focus();
      this.handleInput('');
    }
  }

  close() {
    this.isOpen = false;
    const container = document.getElementById('command-palette');
    const input = document.getElementById('command-palette-input');
    
    if (container && input) {
      container.style.display = 'none';
      input.value = '';
      this.filteredCommands = [];
    }
  }

  handleInput(value) {
    this.currentInput = value;
    
    // Check for slash commands
    if (value.startsWith('/')) {
      this.handleSlashCommand(value);
      return;
    }

    // Fuzzy search commands
    this.filteredCommands = this.fuzzySearch(value);
    this.renderResults();
  }

  handleSlashCommand(input) {
    const command = input.substring(1).trim().toLowerCase();
    const args = command.split(' ');
    const cmd = args[0];
    const params = args.slice(1).join(' ');

    // Map slash commands to actions
    const slashCommands = {
      'fix': () => {
        if (window.monacoInlineAI) {
          window.monacoInlineAI.quickFix();
          this.close();
        }
      },
      'refactor': () => {
        if (window.monacoInlineAI) {
          window.monacoInlineAI.refactor();
          this.close();
        }
      },
      'doc': () => {
        if (window.monacoInlineAI) {
          window.monacoInlineAI.addDocstrings();
          this.close();
        }
      },
      'test': () => {
        if (window.monacoInlineAI) {
          window.monacoInlineAI.writeTests();
          this.close();
        }
      },
      'explain': () => {
        if (window.monacoInlineAI) {
          window.monacoInlineAI.explainSelection();
          this.close();
        }
      },
      'review': () => {
        this.executeCommand('ai.review');
        this.close();
      },
      'run': () => {
        this.executeCommand('test.run');
        this.close();
      },
      'search': () => {
        this.executeCommand('search.files', params);
        this.close();
      },
      'commit': () => {
        this.executeCommand('git.commit', params);
        this.close();
      },
      'pr': () => {
        this.executeCommand('git.create-pr', params);
        this.close();
      }
    };

    if (slashCommands[cmd]) {
      // Show preview or execute immediately
      this.showSlashCommandPreview(cmd, params, slashCommands[cmd]);
    } else {
      // Show available slash commands
      this.showSlashCommandHelp();
    }
  }

  showSlashCommandPreview(cmd, params, handler) {
    const results = document.getElementById('command-palette-results');
    if (!results) return;

    results.innerHTML = `
      <div class="command-palette-item selected">
        <div>
          <div class="command-palette-item-label">/${cmd}</div>
          <div class="command-palette-item-description">Execute ${cmd} command${params ? ` with: ${params}` : ''}</div>
        </div>
        <div class="command-palette-item-shortcut">Enter to execute</div>
      </div>
    `;

    // Store handler for Enter key
    this.pendingSlashHandler = handler;
  }

  showSlashCommandHelp() {
    const results = document.getElementById('command-palette-results');
    if (!results) return;

    const commands = [
      { cmd: 'fix', desc: 'Quick fix selected code' },
      { cmd: 'refactor', desc: 'Refactor selected code' },
      { cmd: 'doc', desc: 'Add docstrings' },
      { cmd: 'test', desc: 'Write tests' },
      { cmd: 'explain', desc: 'Explain selection' },
      { cmd: 'review', desc: 'Code review' },
      { cmd: 'run', desc: 'Run tests' },
      { cmd: 'search', desc: 'Search files' },
      { cmd: 'commit', desc: 'Git commit' },
      { cmd: 'pr', desc: 'Create PR' }
    ];

    let html = '<div class="command-palette-section">Available Commands:</div>';
    commands.forEach(c => {
      html += `
        <div class="command-palette-item">
          <div>
            <div class="command-palette-item-label">/${c.cmd}</div>
            <div class="command-palette-item-description">${c.desc}</div>
          </div>
        </div>
      `;
    });

    results.innerHTML = html;
  }

  fuzzySearch(query) {
    if (!query) {
      return Array.from(this.commands.values()).slice(0, 10);
    }

    const lowerQuery = query.toLowerCase();
    const scored = Array.from(this.commands.values())
      .map(cmd => {
        const score = this.calculateScore(cmd.keywords, lowerQuery);
        return { cmd, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.cmd);

    return scored;
  }

  calculateScore(text, query) {
    if (text.includes(query)) {
      return 100;
    }
    
    // Simple fuzzy matching
    let score = 0;
    let textIndex = 0;
    
    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      const foundIndex = text.indexOf(char, textIndex);
      if (foundIndex !== -1) {
        score += 10 - (foundIndex - textIndex);
        textIndex = foundIndex + 1;
      } else {
        return 0;
      }
    }
    
    return score;
  }

  renderResults() {
    const results = document.getElementById('command-palette-results');
    if (!results) return;

    if (this.filteredCommands.length === 0) {
      results.innerHTML = '<div class="command-palette-item">No commands found</div>';
      return;
    }

    let html = '';
    this.filteredCommands.forEach((cmd, index) => {
      const selected = index === 0 ? 'selected' : '';
      html += `
        <div class="command-palette-item ${selected}" data-command-id="${cmd.id}">
          <div>
            <div class="command-palette-item-label">${cmd.label}</div>
            <div class="command-palette-item-description">${cmd.description}</div>
          </div>
        </div>
      `;
    });

    results.innerHTML = html;

    // Add click handlers
    results.querySelectorAll('.command-palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const commandId = item.dataset.commandId;
        if (commandId) {
          this.executeCommand(commandId);
          this.close();
        }
      });
    });
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Execute slash command if pending
      if (this.pendingSlashHandler) {
        this.pendingSlashHandler();
        this.pendingSlashHandler = null;
        return;
      }

      // Execute first filtered command
      if (this.filteredCommands.length > 0) {
        this.executeCommand(this.filteredCommands[0].id);
        this.close();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectNext();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectPrevious();
    }
  }

  selectNext() {
    // Implement selection navigation
  }

  selectPrevious() {
    // Implement selection navigation
  }

  executeCommand(commandId, ...args) {
    const command = this.commands.get(commandId);
    if (command && command.handler) {
      try {
        command.handler(...args);
        this.addToHistory(commandId);
      } catch (error) {
        console.error(`[CommandPalette] ❌ Command failed: ${commandId}`, error);
        if (window.notify) {
          window.notify.error(`Command failed: ${command.label}`);
        }
      }
    }
  }

  addToHistory(commandId) {
    this.history.unshift(commandId);
    if (this.history.length > 50) {
      this.history.pop();
    }
  }

  showSearchDialog(type) {
    // Implement search dialog
    console.log(`[CommandPalette] 🔍 Search: ${type}`);
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CommandPalette();
  });
} else {
  new CommandPalette();
}

})();
