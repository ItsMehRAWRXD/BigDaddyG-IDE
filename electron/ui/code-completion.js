/**
 * CodeCompletion - AI-powered completions beyond Monaco
 */

class CodeCompletion {
  constructor(editor, aiManager) {
    this.editor = editor;
    this.aiManager = aiManager;
    this.cache = new Map();
    this.init();
  }

  init() {
    this.editor.onDidChangeModelContent(() => {
      this.triggerCompletion();
    });

    // Register custom completion provider
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => this.getCompletions(model, position)
    });
  }

  async triggerCompletion() {
    const position = this.editor.getPosition();
    const model = this.editor.getModel();
    const lineContent = model.getLineContent(position.lineNumber);
    
    if (lineContent.trim().length < 3) return;

    const cacheKey = `${lineContent}_${position.column}`;
    if (this.cache.has(cacheKey)) return;

    const context = this.getContext(model, position);
    const suggestions = await this.getAISuggestions(context);
    
    this.cache.set(cacheKey, suggestions);
    setTimeout(() => this.cache.delete(cacheKey), 30000);
  }

  getContext(model, position) {
    const startLine = Math.max(1, position.lineNumber - 10);
    const endLine = Math.min(model.getLineCount(), position.lineNumber + 5);
    return model.getValueInRange({
      startLineNumber: startLine,
      startColumn: 1,
      endLineNumber: endLine,
      endColumn: model.getLineMaxColumn(endLine)
    });
  }

  async getAISuggestions(context) {
    if (!this.aiManager) return [];
    
    try {
      const response = await this.aiManager.complete(context);
      return this.parseCompletions(response);
    } catch (error) {
      console.error('[CodeCompletion] AI error:', error);
      return [];
    }
  }

  parseCompletions(response) {
    const suggestions = response.split('\n').slice(0, 5);
    return suggestions.map((text, i) => ({
      label: text.trim(),
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: text.trim(),
      range: null,
      sortText: `0${i}`
    }));
  }

  async getCompletions(model, position) {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    const context = this.getContext(model, position);
    const aiSuggestions = await this.getAISuggestions(context);
    
    return {
      suggestions: aiSuggestions.map(s => ({ ...s, range }))
    };
  }
}

window.CodeCompletion = CodeCompletion;