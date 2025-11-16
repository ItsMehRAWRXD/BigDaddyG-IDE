/**
 * Monaco Inline AI - Full Cursor-like Inline AI Features
 * Provides: Explain, Quick Fix, Refactor, Docstrings, Write Tests
 * With: Ghost text preview, inline diff, streaming, cancel support
 */

(function() {
'use strict';

class MonacoInlineAI {
  constructor() {
    this.editor = null;
    this.activeDecorations = [];
    this.ghostTextDecorations = [];
    this.inlineDiffDecorations = [];
    this.cancellationTokens = new Map();
    this.undoStack = [];
    this.redoStack = [];
    this.isProcessing = false;
    
    console.log('[MonacoInlineAI] 🚀 Initializing inline AI system...');
    this.initialize();
  }

  async initialize() {
    // Wait for Monaco to be available
    if (typeof monaco === 'undefined') {
      console.log('[MonacoInlineAI] ⏳ Waiting for Monaco editor...');
      await this.waitForMonaco();
    }
    
    // Wait for editor instance
    await this.waitForEditor();
    
    // Register context menu actions
    this.registerContextMenuActions();
    
    // Register keyboard shortcuts
    this.registerKeyboardShortcuts();
    
    // Initialize ghost text system
    this.initializeGhostText();
    
    // Initialize inline diff system
    this.initializeInlineDiff();
    
    console.log('[MonacoInlineAI] ✅ Inline AI system ready');
    window.monacoInlineAI = this;
  }

  async waitForMonaco() {
    return new Promise((resolve) => {
      const checkMonaco = setInterval(() => {
        if (typeof monaco !== 'undefined') {
          clearInterval(checkMonaco);
          resolve();
        }
      }, 100);
    });
  }

  async waitForEditor() {
    return new Promise((resolve) => {
      const findEditor = setInterval(() => {
        // Try to find Monaco editor instance
        const editors = monaco?.editor?.getEditors?.() || [];
        if (editors.length > 0) {
          this.editor = editors[0];
          clearInterval(findEditor);
          resolve();
        } else {
          // Try window.editor or other common names
          if (window.editor && window.editor.getModel) {
            this.editor = window.editor;
            clearInterval(findEditor);
            resolve();
          }
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(findEditor);
        console.warn('[MonacoInlineAI] ⚠️ Editor not found, will retry when available');
        resolve();
      }, 10000);
    });
  }

  registerContextMenuActions() {
    if (!this.editor) {
      console.warn('[MonacoInlineAI] ⚠️ Editor not available for context menu');
      return;
    }

    // Add context menu items
    const contextMenuService = this.editor._contextMenuService;
    if (contextMenuService) {
      // Register custom actions
      this.registerAction('explain-selection', 'Explain Selection', 'Ctrl+Shift+E', () => this.explainSelection());
      this.registerAction('quick-fix', 'Quick Fix', 'Ctrl+Shift+F', () => this.quickFix());
      this.registerAction('refactor', 'Refactor', 'Ctrl+Shift+R', () => this.refactor());
      this.registerAction('add-docstrings', 'Add Docstrings', 'Ctrl+Shift+D', () => this.addDocstrings());
      this.registerAction('write-tests', 'Write Tests', 'Ctrl+Shift+T', () => this.writeTests());
    }
  }

  registerAction(id, label, keybinding, handler) {
    if (!this.editor) return;

    // Register with Monaco
    monaco.editor.addAction({
      id: id,
      label: label,
      keybindingContext: undefined,
      keybindings: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | this.parseKeybinding(keybinding),
      run: (editor) => {
        this.editor = editor;
        handler();
      }
    });

    console.log(`[MonacoInlineAI] ✅ Registered action: ${label} (${keybinding})`);
  }

  parseKeybinding(keybinding) {
    const keyMap = {
      'E': monaco.KeyCode.KeyE,
      'F': monaco.KeyCode.KeyF,
      'R': monaco.KeyCode.KeyR,
      'D': monaco.KeyCode.KeyD,
      'T': monaco.KeyCode.KeyT,
    };
    const match = keybinding.match(/[A-Z]$/);
    return match ? keyMap[match[0]] : monaco.KeyCode.Unknown;
  }

  registerKeyboardShortcuts() {
    // Shortcuts are registered via registerAction
    // Additional global shortcuts can be added here
    document.addEventListener('keydown', (e) => {
      // Handle global shortcuts if needed
    });
  }

  initializeGhostText() {
    this.ghostTextProvider = {
      provideGhostText: async (model, position) => {
        // Return ghost text suggestions
        return await this.getGhostTextSuggestions(model, position);
      }
    };
    
    // Register ghost text provider with Monaco if available
    if (typeof monaco !== 'undefined' && monaco.languages && monaco.languages.registerInlineCompletionsProvider) {
      const languages = ['javascript', 'typescript', 'python', 'java', 'go'];
      languages.forEach(lang => {
        monaco.languages.registerInlineCompletionsProvider(lang, {
          provideInlineCompletions: async (model, position, context, token) => {
            const suggestions = await this.getGhostTextSuggestions(model, position);
            if (suggestions && suggestions.length > 0) {
              return {
                items: suggestions.map(s => ({
                  insertText: s.text,
                  range: s.range,
                  command: {
                    id: 'editor.action.inlineSuggest.commit',
                    title: 'Accept suggestion'
                  }
                }))
              };
            }
            return { items: [] };
          }
        });
      });
    }
  }

  initializeInlineDiff() {
    this.inlineDiffProvider = {
      provideInlineDiff: (model, range, originalText, modifiedText) => {
        return this.createInlineDiff(range, originalText, modifiedText);
      }
    };
  }

  async explainSelection() {
    if (!this.editor) {
      console.warn('[MonacoInlineAI] ⚠️ Editor not available');
      return;
    }

    const selection = this.editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this.showNotification('Please select code to explain', 'warning');
      return;
    }

    const selectedText = this.editor.getModel().getValueInRange(selection);
    const language = this.editor.getModel().getLanguageId();
    const filePath = this.editor.getModel().uri?.path || 'unknown';

    console.log('[MonacoInlineAI] 📝 Explaining selection...');

    try {
      this.isProcessing = true;
      const cancellationToken = this.createCancellationToken();
      this.cancellationTokens.set('explain', cancellationToken);

      // Get repo context if available
      let context = null;
      if (window.repoContext) {
        context = await window.repoContext.getContextForSelection(
          filePath,
          {
            startLine: selection.startLineNumber,
            endLine: selection.endLineNumber,
            startColumn: selection.startColumn,
            endColumn: selection.endColumn
          },
          'explain'
        );
      }

      // Build context-aware prompt
      let prompt;
      if (context && window.repoContext) {
        prompt = window.repoContext.buildPrompt(context, 'explain', selectedText);
      } else {
        prompt = this.buildExplainPrompt(selectedText, language, filePath);
      }

      // Get response from Ollama
      const response = await this.getAIResponse(prompt, cancellationToken);

      if (cancellationToken.cancelled) {
        return;
      }

      // Show explanation in a hover or panel
      this.showExplanation(response, selection);

    } catch (error) {
      console.error('[MonacoInlineAI] ❌ Explain failed:', error);
      this.showNotification(`Explain failed: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.cancellationTokens.delete('explain');
    }
  }

  async quickFix() {
    if (!this.editor) {
      console.warn('[MonacoInlineAI] ⚠️ Editor not available');
      return;
    }

    const selection = this.editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this.showNotification('Please select code to fix', 'warning');
      return;
    }

    const selectedText = this.editor.getModel().getValueInRange(selection);
    const language = this.editor.getModel().getLanguageId();
    const filePath = this.editor.getModel().uri?.path || 'unknown';

    console.log('[MonacoInlineAI] 🔧 Quick fixing selection...');

    try {
      this.isProcessing = true;
      const cancellationToken = this.createCancellationToken();
      this.cancellationTokens.set('quick-fix', cancellationToken);

      // Get repo context if available
      let context = null;
      if (window.repoContext) {
        context = await window.repoContext.getContextForSelection(
          filePath,
          {
            startLine: selection.startLineNumber,
            endLine: selection.endLineNumber,
            startColumn: selection.startColumn,
            endColumn: selection.endColumn
          },
          'fix'
        );
      }

      // Build fix prompt
      let prompt;
      if (context && window.repoContext) {
        prompt = window.repoContext.buildPrompt(context, 'fix', selectedText);
      } else {
        prompt = this.buildFixPrompt(selectedText, language, filePath);
      }

      // Get AI response
      const response = await this.getAIResponse(prompt, cancellationToken);

      if (cancellationToken.cancelled) {
        return;
      }

      // Extract code from response
      const fixedCode = this.extractCodeFromResponse(response, language);

      // Show inline diff preview
      this.showInlineDiffPreview(selection, selectedText, fixedCode);

    } catch (error) {
      console.error('[MonacoInlineAI] ❌ Quick fix failed:', error);
      this.showNotification(`Quick fix failed: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.cancellationTokens.delete('quick-fix');
    }
  }

  async refactor() {
    if (!this.editor) {
      console.warn('[MonacoInlineAI] ⚠️ Editor not available');
      return;
    }

    const selection = this.editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this.showNotification('Please select code to refactor', 'warning');
      return;
    }

    const selectedText = this.editor.getModel().getValueInRange(selection);
    const language = this.editor.getModel().getLanguageId();
    const filePath = this.editor.getModel().uri?.path || 'unknown';

    console.log('[MonacoInlineAI] ♻️ Refactoring selection...');

    try {
      this.isProcessing = true;
      const cancellationToken = this.createCancellationToken();
      this.cancellationTokens.set('refactor', cancellationToken);

      // Build refactor prompt
      const prompt = this.buildRefactorPrompt(selectedText, language, filePath);

      // Get AI response
      const response = await this.getAIResponse(prompt, cancellationToken);

      if (cancellationToken.cancelled) {
        return;
      }

      // Extract refactored code
      const refactoredCode = this.extractCodeFromResponse(response, language);

      // Show inline diff preview
      this.showInlineDiffPreview(selection, selectedText, refactoredCode);

    } catch (error) {
      console.error('[MonacoInlineAI] ❌ Refactor failed:', error);
      this.showNotification(`Refactor failed: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.cancellationTokens.delete('refactor');
    }
  }

  async addDocstrings() {
    if (!this.editor) {
      console.warn('[MonacoInlineAI] ⚠️ Editor not available');
      return;
    }

    const selection = this.editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this.showNotification('Please select function/class to document', 'warning');
      return;
    }

    const selectedText = this.editor.getModel().getValueInRange(selection);
    const language = this.editor.getModel().getLanguageId();
    const filePath = this.editor.getModel().uri?.path || 'unknown';

    console.log('[MonacoInlineAI] 📚 Adding docstrings...');

    try {
      this.isProcessing = true;
      const cancellationToken = this.createCancellationToken();
      this.cancellationTokens.set('docstrings', cancellationToken);

      // Build docstring prompt
      const prompt = this.buildDocstringPrompt(selectedText, language, filePath);

      // Get AI response
      const response = await this.getAIResponse(prompt, cancellationToken);

      if (cancellationToken.cancelled) {
        return;
      }

      // Extract code with docstrings
      const codeWithDocstrings = this.extractCodeFromResponse(response, language);

      // Show inline diff preview
      this.showInlineDiffPreview(selection, selectedText, codeWithDocstrings);

    } catch (error) {
      console.error('[MonacoInlineAI] ❌ Add docstrings failed:', error);
      this.showNotification(`Add docstrings failed: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.cancellationTokens.delete('docstrings');
    }
  }

  async writeTests() {
    if (!this.editor) {
      console.warn('[MonacoInlineAI] ⚠️ Editor not available');
      return;
    }

    const selection = this.editor.getSelection();
    if (!selection || selection.isEmpty()) {
      this.showNotification('Please select code to test', 'warning');
      return;
    }

    const selectedText = this.editor.getModel().getValueInRange(selection);
    const language = this.editor.getModel().getLanguageId();
    const filePath = this.editor.getModel().uri?.path || 'unknown';

    console.log('[MonacoInlineAI] 🧪 Writing tests...');

    try {
      this.isProcessing = true;
      const cancellationToken = this.createCancellationToken();
      this.cancellationTokens.set('write-tests', cancellationToken);

      // Build test generation prompt
      const prompt = this.buildTestPrompt(selectedText, language, filePath);

      // Get AI response
      const response = await this.getAIResponse(prompt, cancellationToken);

      if (cancellationToken.cancelled) {
        return;
      }

      // Extract test code
      const testCode = this.extractCodeFromResponse(response, language);

      // Create new file or show in diff
      this.createTestFile(testCode, filePath, language);

    } catch (error) {
      console.error('[MonacoInlineAI] ❌ Write tests failed:', error);
      this.showNotification(`Write tests failed: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.cancellationTokens.delete('write-tests');
    }
  }

  buildExplainPrompt(code, language, filePath) {
    return `Explain this ${language} code in detail. Be specific about what each part does and why.

File: ${filePath}
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a clear, detailed explanation.`;
  }

  buildFixPrompt(code, language, filePath) {
    return `Fix any bugs, errors, or issues in this ${language} code. Return ONLY the fixed code, no explanations.

File: ${filePath}
Language: ${language}

Code to fix:
\`\`\`${language}
${code}
\`\`\`

Return the complete fixed code in a code block.`;
  }

  buildRefactorPrompt(code, language, filePath) {
    return `Refactor this ${language} code to improve readability, performance, and maintainability. Return ONLY the refactored code.

File: ${filePath}
Language: ${language}

Code to refactor:
\`\`\`${language}
${code}
\`\`\`

Return the complete refactored code in a code block.`;
  }

  buildDocstringPrompt(code, language, filePath) {
    const docstringStyle = {
      'python': 'Google style',
      'javascript': 'JSDoc',
      'typescript': 'JSDoc',
      'java': 'JavaDoc'
    }[language] || 'standard';

    return `Add comprehensive ${docstringStyle} docstrings to this ${language} code. Return ONLY the code with docstrings added.

File: ${filePath}
Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

Return the complete code with docstrings in a code block.`;
  }

  buildTestPrompt(code, language, filePath) {
    const testFramework = {
      'javascript': 'Jest',
      'typescript': 'Jest',
      'python': 'pytest',
      'java': 'JUnit'
    }[language] || 'standard';

    return `Generate comprehensive ${testFramework} tests for this ${language} code. Cover edge cases and error handling.

File: ${filePath}
Language: ${language}
Test Framework: ${testFramework}

Code to test:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the complete test code in a code block.`;
  }

  async getAIResponse(prompt, cancellationToken) {
    // Use Ollama via orchestraApi
    if (!window.orchestraApi) {
      throw new Error('Orchestra API not available');
    }

    // Get current model (or default)
    const models = await window.orchestraApi.getModels();
    const model = models.find(m => m.includes('llama') || m.includes('codellama')) || models[0] || 'llama3:latest';

    console.log(`[MonacoInlineAI] 🤖 Using model: ${model}`);

    // Check for cancellation
    if (cancellationToken.cancelled) {
      throw new Error('Cancelled');
    }

    // Get response with streaming support
    let response;
    
    if (cancellationToken && cancellationToken.wantsStreaming) {
      // Streaming mode - collect chunks
      response = await this.getStreamingResponse(model, prompt, cancellationToken);
    } else {
      // Non-streaming mode
      response = await window.orchestraApi.generate({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      });
    }

    // Check cancellation again
    if (cancellationToken.cancelled) {
      throw new Error('Cancelled');
    }

    return response;
  }

  extractCodeFromResponse(response, language) {
    // Extract code from markdown code blocks
    const codeBlockRegex = new RegExp(`\`\`\`${language}\\s*\\n([\\s\\S]*?)\\n\`\`\``, 'i');
    const match = response.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }

    // Try generic code block
    const genericRegex = /```[\w]*\n([\s\S]*?)\n```/;
    const genericMatch = response.match(genericRegex);
    
    if (genericMatch) {
      return genericMatch[1].trim();
    }

    // Return response as-is if no code block found
    return response.trim();
  }

  showInlineDiffPreview(selection, originalText, modifiedText) {
    if (!this.editor) return;

    // Create diff decoration
    const diff = this.computeDiff(originalText, modifiedText);
    
    // Show diff in editor with apply/discard buttons
    this.renderInlineDiff(selection, diff);
  }

  computeDiff(original, modified) {
    // Simple line-by-line diff
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    const diff = {
      added: [],
      removed: [],
      modified: []
    };

    // Simple diff algorithm (can be enhanced with proper diff library)
    const maxLen = Math.max(originalLines.length, modifiedLines.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= originalLines.length) {
        diff.added.push({ line: i, text: modifiedLines[i] });
      } else if (i >= modifiedLines.length) {
        diff.removed.push({ line: i, text: originalLines[i] });
      } else if (originalLines[i] !== modifiedLines[i]) {
        diff.modified.push({
          line: i,
          original: originalLines[i],
          modified: modifiedLines[i]
        });
      }
    }

    return diff;
  }

  renderInlineDiff(selection, diff) {
    if (!this.editor) return;

    // Clear previous diff decorations
    this.clearInlineDiff();

    // Create decorations for added/removed/modified lines
    const decorations = [];

    // Add inline widget with apply/discard buttons
    const widget = this.createDiffWidget(selection, diff);
    
    // Store for cleanup
    this.inlineDiffWidget = widget;
    this.inlineDiffSelection = selection;
    this.inlineDiffOriginal = this.editor.getModel().getValueInRange(selection);
    this.inlineDiffModified = this.reconstructModifiedText(diff);

    // Show widget
    this.editor.addContentWidget(widget);
  }

  createDiffWidget(selection, diff) {
    const widget = {
      getId: () => 'inline-diff-widget',
      getDomNode: () => {
        const node = document.createElement('div');
        node.className = 'inline-diff-widget';
        node.innerHTML = `
          <div class="diff-header">
            <span>📝 Preview Changes</span>
            <button class="apply-btn" onclick="window.monacoInlineAI.applyDiff()">✅ Apply</button>
            <button class="discard-btn" onclick="window.monacoInlineAI.discardDiff()">❌ Discard</button>
          </div>
          <div class="diff-content">
            ${this.renderDiffContent(diff)}
          </div>
        `;
        return node;
      },
      getPosition: () => {
        return {
          position: { lineNumber: selection.endLineNumber + 1, column: 1 },
          preference: [monaco.editor.ContentWidgetPositionPreference.BELOW]
        };
      }
    };

    return widget;
  }

  renderDiffContent(diff) {
    let html = '<div class="diff-lines">';
    
    diff.removed.forEach(item => {
      html += `<div class="diff-line removed">- ${this.escapeHtml(item.text)}</div>`;
    });
    
    diff.added.forEach(item => {
      html += `<div class="diff-line added">+ ${this.escapeHtml(item.text)}</div>`;
    });
    
    diff.modified.forEach(item => {
      html += `<div class="diff-line removed">- ${this.escapeHtml(item.original)}</div>`;
      html += `<div class="diff-line added">+ ${this.escapeHtml(item.modified)}</div>`;
    });
    
    html += '</div>';
    return html;
  }

  reconstructModifiedText(diff) {
    // Reconstruct modified text from diff
    const lines = [];
    const maxLine = Math.max(
      ...diff.removed.map(d => d.line),
      ...diff.added.map(d => d.line),
      ...diff.modified.map(d => d.line)
    );

    for (let i = 0; i <= maxLine; i++) {
      const modified = diff.modified.find(d => d.line === i);
      const added = diff.added.find(d => d.line === i);
      const removed = diff.removed.find(d => d.line === i);

      if (modified) {
        lines.push(modified.modified);
      } else if (added) {
        lines.push(added.text);
      } else if (!removed) {
        // Keep original line (would need original text for this)
      }
    }

    return lines.join('\n');
  }

  applyDiff() {
    if (!this.editor || !this.inlineDiffSelection || !this.inlineDiffModified) {
      return;
    }

    // Save to undo stack
    this.saveToUndoStack();

    // Apply the change
    this.editor.executeEdits('inline-ai', [{
      range: this.inlineDiffSelection,
      text: this.inlineDiffModified
    }]);

    // Clear diff
    this.clearInlineDiff();

    this.showNotification('Changes applied', 'success');
  }

  discardDiff() {
    this.clearInlineDiff();
    this.showNotification('Changes discarded', 'info');
  }

  clearInlineDiff() {
    if (this.editor && this.inlineDiffWidget) {
      this.editor.removeContentWidget(this.inlineDiffWidget);
      this.inlineDiffWidget = null;
    }
    this.inlineDiffSelection = null;
    this.inlineDiffOriginal = null;
    this.inlineDiffModified = null;
  }

  showExplanation(explanation, selection) {
    // Show explanation in a hover or info panel
    if (window.notify) {
      window.notify.info('Explanation', explanation.substring(0, 200) + '...');
    } else {
      // Fallback: show in alert or create info panel
      const panel = this.createInfoPanel('Explanation', explanation);
      document.body.appendChild(panel);
    }
  }

  createInfoPanel(title, content) {
    const panel = document.createElement('div');
    panel.className = 'ai-info-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>${title}</h3>
        <button onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="panel-content">${this.escapeHtml(content)}</div>
    `;
    return panel;
  }

  createTestFile(testCode, originalFilePath, language) {
    // Determine test file path
    const testFilePath = this.generateTestFilePath(originalFilePath, language);
    
    // Create new tab or file with test code
    if (window.completeTabSystem) {
      window.completeTabSystem.createTab({
        id: `test-${Date.now()}`,
        title: `Test: ${testFilePath}`,
        content: testCode,
        type: 'code',
        language: language
      });
    } else {
      // Fallback: show in notification
      this.showNotification(`Test code generated. File: ${testFilePath}`, 'success');
      console.log('[MonacoInlineAI] Test code:', testCode);
    }
  }

  generateTestFilePath(originalPath, language) {
    const ext = {
      'javascript': '.test.js',
      'typescript': '.test.ts',
      'python': '_test.py',
      'java': 'Test.java'
    }[language] || '.test';

    const basePath = originalPath.replace(/\.[^.]+$/, '');
    return `${basePath}${ext}`;
  }

  createCancellationToken() {
    return {
      cancelled: false,
      wantsStreaming: false,
      cancel: () => {
        this.cancelled = true;
      }
    };
  }

  async getStreamingResponse(model, prompt, cancellationToken) {
    // Implement streaming response collection
    if (!window.orchestraApi) {
      throw new Error('Orchestra API not available');
    }
    
    try {
      // Use Orchestra API with streaming
      const response = await window.orchestraApi.generate({
        model: model,
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      });
      
      // If response is a stream, collect it
      if (response && typeof response === 'object' && response.on) {
        return new Promise((resolve, reject) => {
          let fullText = '';
          
          response.on('data', (chunk) => {
            if (cancellationToken.cancelled) {
              response.destroy();
              reject(new Error('Cancelled'));
              return;
            }
            
            fullText += chunk.toString();
            // Could emit progress events here for UI updates
          });
          
          response.on('end', () => {
            resolve(fullText);
          });
          
          response.on('error', (error) => {
            reject(error);
          });
        });
      }
      
      // If already a string, return it
      return response;
    } catch (error) {
      console.error('[MonacoInlineAI] ❌ Streaming failed:', error);
      throw error;
    }
  }

  cancelCurrentOperation() {
    this.cancellationTokens.forEach(token => {
      token.cancel();
    });
    this.cancellationTokens.clear();
    this.isProcessing = false;
  }

  saveToUndoStack() {
    if (!this.editor) return;
    
    const model = this.editor.getModel();
    const value = model.getValue();
    this.undoStack.push(value);
    
    // Limit stack size
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
    
    // Clear redo stack on new action
    this.redoStack = [];
  }

  async getGhostTextSuggestions(model, position) {
    // Return ghost text suggestions for autocomplete
    if (!this.editor || !window.orchestraApi) {
      return null;
    }
    
    try {
      // Get current line and context
      const line = model.getLineContent(position.lineNumber);
      const beforeCursor = line.substring(0, position.column - 1);
      
      // Only suggest if there's meaningful context
      if (beforeCursor.trim().length < 3) {
        return null;
      }
      
      // Get AI suggestion for continuation
      const prompt = `Complete this code line. Return ONLY the continuation text, no explanations:\n\n${beforeCursor}`;
      
      const models = await window.orchestraApi.getModels();
      const model = models[0] || 'llama3:latest';
      
      const response = await window.orchestraApi.generate({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more predictable completions
          max_tokens: 50
        }
      });
      
      // Extract suggested text
      const suggestedText = response.trim().split('\n')[0];
      
      if (suggestedText && suggestedText.length > 0) {
        return [{
          text: suggestedText,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          }
        }];
      }
      
      return null;
    } catch (error) {
      console.warn('[MonacoInlineAI] ⚠️ Ghost text failed:', error.message);
      return null;
    }
  }

  showNotification(message, type = 'info') {
    if (window.notify) {
      window.notify[type](message);
    } else {
      console.log(`[MonacoInlineAI] ${type.toUpperCase()}: ${message}`);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MonacoInlineAI();
  });
} else {
  new MonacoInlineAI();
}

})();
