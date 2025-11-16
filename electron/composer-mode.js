/**
 * Cursor-Style Composer Mode
 * Multi-file editing with AI assistance
 */

class ComposerMode {
  constructor() {
    this.active = false;
    this.files = [];
    this.edits = [];
    this.context = {};
  }

  async start(prompt, files = []) {
    console.log('[Composer] 🎼 Starting Composer mode...');
    
    this.active = true;
    this.prompt = prompt;
    this.files = files.length > 0 ? files : await this.detectRelevantFiles(prompt);
    this.edits = [];
    this.context = {};

    // Analyze files
    await this.analyzeFiles();

    // Generate plan
    const plan = await this.generatePlan();

    // Generate edits
    await this.generateEdits(plan);

    return {
      files: this.files,
      edits: this.edits,
      plan
    };
  }

  async detectRelevantFiles(prompt) {
    // Simple heuristic: check open tabs
    const openFiles = [];
    
    if (window.openTabs) {
      for (const [tabId, tab] of Object.entries(window.openTabs)) {
        if (tab.filePath) {
          openFiles.push(tab.filePath);
        }
      }
    }

    // Also check if prompt mentions specific files
    const fileMentions = prompt.match(/@([\w\/\.\-]+)/g);
    if (fileMentions) {
      fileMentions.forEach(mention => {
        const filePath = mention.substring(1);
        if (!openFiles.includes(filePath)) {
          openFiles.push(filePath);
        }
      });
    }

    return openFiles.slice(0, 10); // Limit to 10 files
  }

  async analyzeFiles() {
    console.log('[Composer] 📊 Analyzing files...');

    for (const file of this.files) {
      try {
        const content = await window.electron.readFile(file);
        this.context[file] = {
          content,
          language: this.detectLanguage(file),
          size: content.length,
          lines: content.split('\n').length
        };
      } catch (error) {
        console.warn(`[Composer] Could not read ${file}:`, error);
        this.context[file] = {
          error: error.message
        };
      }
    }
  }

  detectLanguage(file) {
    const ext = file.split('.').pop().toLowerCase();
    const languages = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'rs': 'rust',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown'
    };
    return languages[ext] || 'text';
  }

  async generatePlan() {
    console.log('[Composer] 📋 Generating plan...');

    const contextSummary = this.files.map(file => {
      const ctx = this.context[file];
      return `${file} (${ctx.language}, ${ctx.lines} lines)`;
    }).join('\n');

    const planPrompt = `
You are editing multiple files in a project.

Files to edit:
${contextSummary}

User request: ${this.prompt}

Create a step-by-step plan for editing these files. For each file, specify:
1. What changes need to be made
2. Why (reasoning)
3. Dependencies (which files need to be edited first)

Format as JSON:
{
  "steps": [
    {
      "file": "path/to/file.js",
      "action": "add function",
      "reason": "needed for feature",
      "dependencies": []
    }
  ]
}
`;

    const response = await this.callAI(planPrompt);
    const plan = this.parsePlan(response);

    return plan;
  }

  async generateEdits(plan) {
    console.log('[Composer] ✏️ Generating edits...');

    for (const step of plan.steps) {
      const file = step.file;
      const fileContext = this.context[file];

      if (!fileContext || fileContext.error) {
        console.warn(`[Composer] Skipping ${file} (error reading)`);
        continue;
      }

      const editPrompt = `
File: ${file}
Language: ${fileContext.language}
Current content:
\`\`\`${fileContext.language}
${fileContext.content}
\`\`\`

Task: ${step.action}
Reason: ${step.reason}

Generate the complete edited file. Include all code, not just the changes.
`;

      const response = await this.callAI(editPrompt);
      const editedContent = this.extractCode(response, fileContext.language);

      this.edits.push({
        file,
        original: fileContext.content,
        edited: editedContent,
        action: step.action,
        reason: step.reason,
        diff: this.generateDiff(fileContext.content, editedContent)
      });
    }
  }

  async applyEdits() {
    console.log('[Composer] ✅ Applying edits...');

    const results = [];

    for (const edit of this.edits) {
      try {
        await window.electron.writeFile(edit.file, edit.edited);
        results.push({
          file: edit.file,
          success: true
        });
        console.log(`[Composer] ✅ Applied edit to ${edit.file}`);
      } catch (error) {
        results.push({
          file: edit.file,
          success: false,
          error: error.message
        });
        console.error(`[Composer] ❌ Failed to edit ${edit.file}:`, error);
      }
    }

    this.active = false;
    return results;
  }

  previewEdits() {
    return this.edits.map(edit => ({
      file: edit.file,
      action: edit.action,
      changes: edit.diff.split('\n').length,
      preview: edit.diff.substring(0, 500)
    }));
  }

  parsePlan(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('[Composer] Could not parse plan, using fallback');
    }

    // Fallback: create simple plan
    return {
      steps: this.files.map(file => ({
        file,
        action: 'edit based on prompt',
        reason: 'user request',
        dependencies: []
      }))
    };
  }

  extractCode(text, language) {
    // Try to extract code block
    const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``);
    const match = text.match(codeBlockRegex);
    if (match) {
      return match[1].trim();
    }

    // Try generic code block
    const genericRegex = /```[\w]*\n([\s\S]*?)```/;
    const genericMatch = text.match(genericRegex);
    if (genericMatch) {
      return genericMatch[1].trim();
    }

    // Return text as-is
    return text.trim();
  }

  generateDiff(original, edited) {
    // Simple diff - in production use a proper diff library
    const originalLines = original.split('\n');
    const editedLines = edited.split('\n');
    
    let diff = '';
    const maxLines = Math.max(originalLines.length, editedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const orig = originalLines[i] || '';
      const edit = editedLines[i] || '';
      
      if (orig !== edit) {
        diff += `- ${orig}\n`;
        diff += `+ ${edit}\n`;
      } else {
        diff += `  ${orig}\n`;
      }
    }
    
    return diff;
  }

  async callAI(prompt) {
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
}

// Initialize and expose
if (typeof window !== 'undefined') {
  window.composerMode = new ComposerMode();
}

module.exports = ComposerMode;
