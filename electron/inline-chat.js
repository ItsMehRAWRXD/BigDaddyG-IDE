/**
 * Cursor-Style Inline Chat
 * Chat directly in the editor for quick edits
 */

class InlineChat {
  constructor() {
    this.active = false;
    this.currentChat = null;
  }

  async start(selectedCode, file, prompt) {
    console.log('[Inline Chat] 💬 Starting inline chat...');

    this.active = true;
    this.currentChat = {
      selectedCode,
      file,
      prompt,
      suggestions: [],
      startTime: Date.now()
    };

    // Get surrounding context
    const context = await this.getContext(file, selectedCode);

    // Generate edit suggestions
    const suggestions = await this.generateSuggestions(selectedCode, prompt, context);

    this.currentChat.suggestions = suggestions;

    return {
      original: selectedCode,
      suggestions,
      file
    };
  }

  async getContext(file, selectedCode) {
    try {
      const fullContent = await window.electron.readFile(file);
      const selectedIndex = fullContent.indexOf(selectedCode);

      if (selectedIndex === -1) {
        return {
          before: '',
          after: '',
          full: fullContent
        };
      }

      const before = fullContent.substring(Math.max(0, selectedIndex - 1000), selectedIndex);
      const after = fullContent.substring(
        selectedIndex + selectedCode.length,
        Math.min(fullContent.length, selectedIndex + selectedCode.length + 1000)
      );

      return {
        before,
        after,
        full: fullContent,
        selectedIndex
      };
    } catch (error) {
      return {
        before: '',
        after: '',
        full: '',
        error: error.message
      };
    }
  }

  async generateSuggestions(selectedCode, prompt, context) {
    const language = this.detectLanguage(context.file || '');

    const editPrompt = `
You are editing code inline. The user has selected some code and wants to modify it.

Selected code:
\`\`\`${language}
${selectedCode}
\`\`\`

Context before selection:
\`\`\`${language}
${context.before.substring(context.before.length - 500)}
\`\`\`

Context after selection:
\`\`\`${language}
${context.after.substring(0, 500)}
\`\`\`

User request: ${prompt}

Provide 3 alternative edits:
1. Minimal change (smallest edit)
2. Improved version (better code quality)
3. Complete rewrite (if needed)

Format as JSON:
{
  "suggestions": [
    {
      "type": "minimal",
      "code": "...",
      "explanation": "..."
    },
    {
      "type": "improved",
      "code": "...",
      "explanation": "..."
    },
    {
      "type": "rewrite",
      "code": "...",
      "explanation": "..."
    }
  ]
}
`;

    const response = await this.callAI(editPrompt);
    return this.parseSuggestions(response);
  }

  parseSuggestions(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.suggestions || [];
      }
    } catch (error) {
      console.warn('[Inline Chat] Could not parse suggestions');
    }

    // Fallback: extract code blocks
    const codeBlocks = this.extractCodeBlocks(response);
    return codeBlocks.map((code, index) => ({
      type: ['minimal', 'improved', 'rewrite'][index] || 'suggestion',
      code,
      explanation: 'Generated edit'
    }));
  }

  extractCodeBlocks(text) {
    const blocks = [];
    const regex = /```[\w]*\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      blocks.push(match[1].trim());
    }

    return blocks.length > 0 ? blocks : [text.trim()];
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
      'go': 'go'
    };
    return languages[ext] || 'text';
  }

  async applySuggestion(suggestionIndex) {
    if (!this.currentChat || !this.currentChat.suggestions[suggestionIndex]) {
      throw new Error('Invalid suggestion index');
    }

    const suggestion = this.currentChat.suggestions[suggestionIndex];
    const file = this.currentChat.file;

    try {
      // Read full file
      const fullContent = await window.electron.readFile(file);
      
      // Replace selected code with suggestion
      const updatedContent = fullContent.replace(
        this.currentChat.selectedCode,
        suggestion.code
      );

      // Write updated file
      await window.electron.writeFile(file, updatedContent);

      // Update editor if available
      if (window.editor && window.editor.getModel) {
        const model = window.editor.getModel();
        if (model) {
          const range = this.findSelectedRange(fullContent, this.currentChat.selectedCode);
          if (range) {
            model.pushEditOperations(
              [],
              [{
                range: range,
                text: suggestion.code
              }],
              () => null
            );
          }
        }
      }

      this.active = false;
      return {
        success: true,
        file,
        applied: suggestion
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  findSelectedRange(content, selectedCode) {
    const index = content.indexOf(selectedCode);
    if (index === -1) return null;

    const lines = content.substring(0, index).split('\n');
    const startLine = lines.length;
    const startColumn = lines[lines.length - 1].length;

    const selectedLines = selectedCode.split('\n');
    const endLine = startLine + selectedLines.length - 1;
    const endColumn = selectedLines[selectedLines.length - 1].length;

    // Monaco range format
    return {
      startLineNumber: startLine,
      startColumn: startColumn + 1,
      endLineNumber: endLine,
      endColumn: endColumn + 1
    };
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
  window.inlineChat = new InlineChat();
}

module.exports = InlineChat;
