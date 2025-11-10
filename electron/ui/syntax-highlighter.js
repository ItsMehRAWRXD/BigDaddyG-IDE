/**
 * SyntaxHighlighter - Enhanced syntax highlighting with AI analysis
 */

class SyntaxHighlighter {
  constructor(editor) {
    this.editor = editor;
    this.decorations = [];
    this.errorCache = new Map();
    this.enabled = true;
    this._changeDisposable = null;
    this._defaultTheme = (monaco && monaco.editor && typeof monaco.editor.getTheme === 'function'
      ? monaco.editor.getTheme()
      : 'vs-dark');
    this.init();
  }

  init() {
    this._changeDisposable = this.editor.onDidChangeModelContent(() => {
      if (this.enabled) {
        this.analyzeCode();
      }
    });

    // Custom theme
    monaco.editor.defineTheme('ai-enhanced', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'ai-suggestion', foreground: '00d4ff', fontStyle: 'italic' },
        { token: 'ai-error', foreground: 'ff4757', fontStyle: 'underline' },
        { token: 'ai-warning', foreground: 'ff6b35' }
      ],
      colors: {
        'editor.background': '#0a0a1e'
      }
    });

    monaco.editor.setTheme('ai-enhanced');
    this.analyzeCode();
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    if (this.enabled === enabled) {
      return;
    }

    this.enabled = enabled;

    if (!enabled) {
      this.clearDecorations();
      monaco.editor.setTheme(this._defaultTheme);
    } else {
      monaco.editor.setTheme('ai-enhanced');
      this.analyzeCode();
    }
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  highlight() {
    if (this.enabled) {
      this.analyzeCode();
    } else {
      this.clearDecorations();
    }
  }

  analyzeCode() {
    if (!this.enabled) {
      return;
    }

    const model = this.editor.getModel();
    const code = model.getValue();
    
    if (code.length < 10) return;

    this.clearDecorations();
    this.highlightErrors(model);
    this.highlightSuggestions(model);
  }

  highlightErrors(model) {
    const errors = this.findErrors(model.getValue());
    const decorations = errors.map(error => ({
      range: new monaco.Range(error.line, error.column, error.line, error.column + error.length),
      options: {
        className: 'ai-error-highlight',
        hoverMessage: { value: error.message },
        minimap: { color: '#ff4757', position: 2 }
      }
    }));

    this.decorations.push(...this.editor.deltaDecorations([], decorations));
  }

  highlightSuggestions(model) {
    const suggestions = this.findSuggestions(model.getValue());
    const decorations = suggestions.map(suggestion => ({
      range: new monaco.Range(suggestion.line, 1, suggestion.line, 1),
      options: {
        className: 'ai-suggestion-highlight',
        glyphMarginClassName: 'ai-suggestion-glyph',
        hoverMessage: { value: `💡 ${suggestion.message}` }
      }
    }));

    this.decorations.push(...this.editor.deltaDecorations([], decorations));
  }

  findErrors(code) {
    const errors = [];
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
      // Basic syntax checks
      if (line.includes('console.log') && !line.includes(';')) {
        errors.push({
          line: i + 1,
          column: line.indexOf('console.log'),
          length: 11,
          message: 'Missing semicolon'
        });
      }
      
      if (line.includes('function') && !line.includes('{')) {
        errors.push({
          line: i + 1,
          column: line.indexOf('function'),
          length: 8,
          message: 'Missing opening brace'
        });
      }
    });

    return errors;
  }

  findSuggestions(code) {
    const suggestions = [];
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
      if (line.includes('var ')) {
        suggestions.push({
          line: i + 1,
          message: 'Consider using const or let instead of var'
        });
      }
      
      if (line.includes('==') && !line.includes('===')) {
        suggestions.push({
          line: i + 1,
          message: 'Use strict equality (===) instead of loose equality (==)'
        });
      }
    });

    return suggestions;
  }

  clearDecorations() {
    this.decorations = this.editor.deltaDecorations(this.decorations, []);
  }

  destroy() {
    if (this._changeDisposable && typeof this._changeDisposable.dispose === 'function') {
      this._changeDisposable.dispose();
    }
    this.clearDecorations();
  }
}

window.SyntaxHighlighter = SyntaxHighlighter;