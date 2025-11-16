/**
 * Cursor Features Complete Integration
 * Implements all Cursor IDE features for full compatibility
 */

class CursorFeaturesComplete {
  constructor() {
    this.cursorRulesPath = null;
    this.cursorMemoriesPath = null;
    this.hooksPath = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Find .cursor directory
    const homeDir = process.env.HOME || process.env.USERPROFILE || process.cwd();
    const cursorDir = path.join(homeDir, '.cursor');
    
    // Set paths
    this.cursorRulesPath = path.join(process.cwd(), '.cursorrules');
    this.cursorMemoriesPath = path.join(cursorDir, 'memories');
    this.hooksPath = path.join(cursorDir, 'hooks', 'beforePromptSubmit.sh');

    // Load .cursorrules if exists
    await this.loadCursorRules();

    // Load Cursor memories if exists
    await this.loadCursorMemories();

    // Register hook if exists
    await this.registerCursorHook();

    this.initialized = true;
    console.log('[Cursor Features] ✅ Cursor compatibility initialized');
  }

  async loadCursorRules() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Check project root
      const projectRules = path.join(process.cwd(), '.cursorrules');
      if (await this.fileExists(projectRules)) {
        const content = await fs.readFile(projectRules, 'utf8');
        this.cursorRules = content;
        console.log('[Cursor Features] ✅ Loaded .cursorrules from project root');
        
        // Convert to BigDaddyG rule
        if (window.promptProcessor) {
          await window.promptProcessor.addRule({
            name: 'Project .cursorrules',
            type: 'system',
            content: content,
            priority: 10,
            enabled: true
          });
        }
        return true;
      }
    } catch (error) {
      console.warn('[Cursor Features] Could not load .cursorrules:', error);
    }
    return false;
  }

  async loadCursorMemories() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      if (await this.fileExists(this.cursorMemoriesPath)) {
        // Cursor memories format is proprietary, but we can try to read
        const files = await fs.readdir(this.cursorMemoriesPath);
        console.log(`[Cursor Features] Found ${files.length} Cursor memory files`);
        // Note: Actual memory format is unknown, would need reverse engineering
      }
    } catch (error) {
      // Cursor memories directory doesn't exist or can't be read
    }
  }

  async registerCursorHook() {
    try {
      const fs = require('fs').promises;
      
      if (await this.fileExists(this.hooksPath)) {
        console.log('[Cursor Features] ✅ Found Cursor beforePromptSubmit.sh hook');
        
        // Register with prompt processor
        if (window.promptProcessor) {
          window.promptProcessor.beforePromptHook = {
            type: 'bash',
            path: this.hooksPath
          };
        }
        return true;
      }
    } catch (error) {
      console.warn('[Cursor Features] Could not register Cursor hook:', error);
    }
    return false;
  }

  async fileExists(filePath) {
    try {
      const fs = require('fs').promises;
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Cursor-style Composer mode (multi-file editing)
  async composerMode(prompt, files = []) {
    console.log('[Cursor Composer] 🎼 Starting Composer mode...');
    
    const composer = {
      prompt,
      files,
      edits: [],
      status: 'planning'
    };

    // Analyze which files need changes
    const fileAnalysis = await this.analyzeFiles(files, prompt);
    
    // Generate edits for each file
    for (const file of fileAnalysis.filesToEdit) {
      const edit = await this.generateEdit(file, prompt, fileAnalysis.context);
      composer.edits.push(edit);
    }

    // Preview all edits
    const preview = this.previewEdits(composer.edits);
    
    return {
      composer,
      preview,
      fileAnalysis
    };
  }

  async analyzeFiles(files, prompt) {
    // Determine which files need editing based on prompt
    const filesToEdit = [];
    const context = {};

    for (const file of files) {
      // Read file content
      try {
        const content = await window.electron.readFile(file);
        context[file] = content;

        // Simple heuristic: if prompt mentions file or file type
        const fileExt = file.split('.').pop();
        if (prompt.toLowerCase().includes(fileExt) || 
            prompt.toLowerCase().includes(file.toLowerCase())) {
          filesToEdit.push(file);
        }
      } catch (error) {
        console.warn(`[Composer] Could not read ${file}:`, error);
      }
    }

    return { filesToEdit, context };
  }

  async generateEdit(file, prompt, context) {
    // Use AI to generate edit for this file
    const fileContent = context[file] || '';
    
    const editPrompt = `
File: ${file}
Current content:
\`\`\`
${fileContent.substring(0, 5000)}
\`\`\`

Task: ${prompt}

Generate the edited version of this file.
`;

    // Call AI to generate edit
    const response = await this.callAI(editPrompt);
    
    return {
      file,
      original: fileContent,
      edited: response,
      diff: this.generateDiff(fileContent, response)
    };
  }

  previewEdits(edits) {
    return edits.map(edit => ({
      file: edit.file,
      changes: edit.diff.length,
      preview: edit.diff.substring(0, 500)
    }));
  }

  generateDiff(original, edited) {
    // Simple diff generation
    // In production, use a proper diff library
    return `--- ${original.substring(0, 100)}\n+++ ${edited.substring(0, 100)}`;
  }

  async callAI(prompt) {
    // Use the AI provider manager
    if (window.aiProviderManager) {
      const response = await window.aiProviderManager.chat(prompt, {
        provider: 'ollama',
        model: await this.getSelectedModel()
      });
      return response.response;
    }
    throw new Error('AI provider not available');
  }

  async getSelectedModel() {
    if (window.modelState) {
      const active = window.modelState.getActiveModel();
      return active?.id || active?.name || 'llama3.2';
    }
    return 'llama3.2';
  }

  // Cursor-style inline chat
  async inlineChat(selectedCode, prompt, file) {
    console.log('[Cursor Inline Chat] 💬 Starting inline chat...');

    const context = {
      selectedCode,
      file,
      surroundingCode: await this.getSurroundingCode(file, selectedCode)
    };

    const enhancedPrompt = `
You are helping edit code in ${file}.

Selected code:
\`\`\`
${selectedCode}
\`\`\`

User request: ${prompt}

Provide the edited code only, no explanations.
`;

    const response = await this.callAI(enhancedPrompt);
    
    return {
      original: selectedCode,
      edited: response,
      file,
      suggestions: this.extractCodeBlocks(response)
    };
  }

  async getSurroundingCode(file, selectedCode) {
    try {
      const fullContent = await window.electron.readFile(file);
      const selectedIndex = fullContent.indexOf(selectedCode);
      
      if (selectedIndex === -1) return '';
      
      const before = fullContent.substring(Math.max(0, selectedIndex - 500), selectedIndex);
      const after = fullContent.substring(
        selectedIndex + selectedCode.length,
        Math.min(fullContent.length, selectedIndex + selectedCode.length + 500)
      );
      
      return { before, after };
    } catch (error) {
      return { before: '', after: '' };
    }
  }

  extractCodeBlocks(text) {
    const codeBlocks = [];
    const regex = /```[\w]*\n([\s\S]*?)```/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      codeBlocks.push(match[1].trim());
    }
    
    return codeBlocks.length > 0 ? codeBlocks : [text.trim()];
  }
}

// Initialize and expose
if (typeof window !== 'undefined') {
  const path = typeof require !== 'undefined' ? require('path') : null;
  
  window.cursorFeatures = new CursorFeaturesComplete();
  
  // Auto-initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.cursorFeatures.initialize();
    });
  } else {
    window.cursorFeatures.initialize();
  }
}

module.exports = CursorFeaturesComplete;
