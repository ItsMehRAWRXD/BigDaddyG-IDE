/**
 * Repo-Aware Context Provider
 * Provides: Symbol index, LSP integration, recent changes, blame, test impact mapping
 */

(function() {
'use strict';

class RepoContextProvider {
  constructor() {
    this.symbolIndex = new Map();
    this.recentChanges = [];
    this.blameCache = new Map();
    this.testImpactMap = new Map();
    this.lspClients = new Map();
    this.contextCache = new Map();
    
    console.log('[RepoContext] 🔍 Initializing repo context provider...');
    this.initialize();
  }

  async initialize() {
    // Build symbol index
    await this.buildSymbolIndex();
    
    // Track recent changes
    this.startChangeTracking();
    
    // Initialize LSP clients
    this.initializeLSPClients();
    
    // Build test impact map
    await this.buildTestImpactMap();
    
    // Make globally available
    window.repoContext = this;
    
    console.log('[RepoContext] ✅ Repo context provider ready');
  }

  async buildSymbolIndex() {
    console.log('[RepoContext] 📚 Building symbol index...');
    
    // Scan workspace for symbols
    if (window.electron && window.electron.scanWorkspace) {
      try {
        const scanResult = await window.electron.scanWorkspace({
          includeSymbols: true,
          languages: ['javascript', 'typescript', 'python', 'java', 'go']
        });
        
        // Index symbols
        if (scanResult.symbols) {
          scanResult.symbols.forEach(symbol => {
            const key = `${symbol.file}:${symbol.name}`;
            this.symbolIndex.set(key, symbol);
          });
        }
        
        console.log(`[RepoContext] ✅ Indexed ${this.symbolIndex.size} symbols`);
      } catch (error) {
        console.warn('[RepoContext] ⚠️ Symbol indexing failed:', error.message);
      }
    }
  }

  startChangeTracking() {
    // Track file changes
    if (window.electron && window.electron.onFileChanged) {
      window.electron.onFileChanged((event) => {
        this.recentChanges.unshift({
          file: event.path,
          type: event.type,
          timestamp: new Date().toISOString()
        });
        
        // Keep last 100 changes
        if (this.recentChanges.length > 100) {
          this.recentChanges.pop();
        }
        
        // Invalidate cache for changed file
        this.contextCache.delete(event.path);
      });
    }
  }

  initializeLSPClients() {
    // Initialize LSP clients for different languages
    const languages = ['javascript', 'typescript', 'python', 'java', 'go'];
    
    languages.forEach(lang => {
      // LSP client would be initialized here
      // For now, we'll use a placeholder
      this.lspClients.set(lang, {
        getDefinitions: async (file, position) => [],
        getReferences: async (file, position) => [],
        getHover: async (file, position) => null,
        getSymbols: async (file) => []
      });
    });
  }

  async buildTestImpactMap() {
    console.log('[RepoContext] 🧪 Building test impact map...');
    
    // Map source files to test files
    if (window.electron && window.electron.scanWorkspace) {
      try {
        const scanResult = await window.electron.scanWorkspace({
          includeTests: true
        });
        
        // Build impact map
        if (scanResult.files) {
          scanResult.files.forEach(file => {
            if (file.path.includes('test') || file.path.includes('spec')) {
              // Find related source files
              const sourceFiles = this.findRelatedSourceFiles(file.path);
              sourceFiles.forEach(source => {
                if (!this.testImpactMap.has(source)) {
                  this.testImpactMap.set(source, []);
                }
                this.testImpactMap.get(source).push(file.path);
              });
            }
          });
        }
        
        console.log(`[RepoContext] ✅ Mapped ${this.testImpactMap.size} source files to tests`);
      } catch (error) {
        console.warn('[RepoContext] ⚠️ Test impact mapping failed:', error.message);
      }
    }
  }

  findRelatedSourceFiles(testPath) {
    // Determine source files from test file
    const baseName = testPath.replace(/\.(test|spec)\.[^.]+$/, '');
    const extensions = ['.js', '.ts', '.py', '.java', '.go'];
    
    return extensions.map(ext => baseName + ext).filter(path => {
      // Check if file exists (would need file system check)
      return true; // Simplified
    });
  }

  async getContextForSelection(filePath, selection, taskType) {
    const cacheKey = `${filePath}:${selection.startLine}:${selection.endLine}:${taskType}`;
    
    // Check cache
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey);
    }

    const context = {
      file: filePath,
      selection: selection,
      symbols: await this.getRelevantSymbols(filePath, selection),
      recentChanges: this.getRecentChangesForFile(filePath),
      blame: await this.getBlameForSelection(filePath, selection),
      testImpact: this.getTestImpact(filePath),
      relatedFiles: await this.getRelatedFiles(filePath),
      lspInfo: await this.getLSPInfo(filePath, selection)
    };

    // Cache context
    this.contextCache.set(cacheKey, context);
    
    return context;
  }

  async getRelevantSymbols(filePath, selection) {
    const symbols = [];
    
    // Get symbols in file
    const fileSymbols = Array.from(this.symbolIndex.values())
      .filter(s => s.file === filePath);
    
    // Filter by selection range
    const relevantSymbols = fileSymbols.filter(s => {
      return s.line >= selection.startLine && s.line <= selection.endLine;
    });
    
    // Get referenced symbols
    const referencedSymbols = await this.getReferencedSymbols(filePath, selection);
    
    return [...relevantSymbols, ...referencedSymbols];
  }

  async getReferencedSymbols(filePath, selection) {
    // Get symbols referenced in selection
    if (window.electron && window.electron.readFile) {
      try {
        const content = await window.electron.readFile(filePath);
        const lines = content.split('\n');
        const selectedLines = lines.slice(selection.startLine - 1, selection.endLine);
        const selectedText = selectedLines.join('\n');
        
        // Extract symbol references (simplified)
        const symbolRefs = [];
        const symbolPattern = /(\w+)\s*\(/g;
        let match;
        
        while ((match = symbolPattern.exec(selectedText)) !== null) {
          const symbolName = match[1];
          const symbol = Array.from(this.symbolIndex.values())
            .find(s => s.name === symbolName);
          if (symbol) {
            symbolRefs.push(symbol);
          }
        }
        
        return symbolRefs;
      } catch (error) {
        console.warn('[RepoContext] ⚠️ Failed to get referenced symbols:', error.message);
      }
    }
    
    return [];
  }

  getRecentChangesForFile(filePath) {
    return this.recentChanges
      .filter(change => change.file === filePath)
      .slice(0, 10);
  }

  async getBlameForSelection(filePath, selection) {
    const cacheKey = `${filePath}:${selection.startLine}:${selection.endLine}`;
    
    if (this.blameCache.has(cacheKey)) {
      return this.blameCache.get(cacheKey);
    }

    // Get git blame (would need git integration)
    const blame = {
      author: 'Unknown',
      date: new Date().toISOString(),
      commit: 'unknown'
    };

    this.blameCache.set(cacheKey, blame);
    return blame;
  }

  getTestImpact(filePath) {
    return this.testImpactMap.get(filePath) || [];
  }

  async getRelatedFiles(filePath) {
    // Find related files (imports, exports, etc.)
    if (window.electron && window.electron.readFile) {
      try {
        const content = await window.electron.readFile(filePath);
        
        // Extract imports/exports
        const imports = this.extractImports(content);
        const relatedFiles = imports.map(imp => this.resolveImport(imp, filePath));
        
        return relatedFiles.filter(f => f);
      } catch (error) {
        console.warn('[RepoContext] ⚠️ Failed to get related files:', error.message);
      }
    }
    
    return [];
  }

  extractImports(content) {
    const imports = [];
    
    // JavaScript/TypeScript imports
    const jsImports = content.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g);
    for (const match of jsImports) {
      imports.push(match[1]);
    }
    
    // Python imports
    const pyImports = content.matchAll(/from\s+(.+?)\s+import|import\s+(.+?)(?:\s+as|$)/g);
    for (const match of pyImports) {
      imports.push(match[1] || match[2]);
    }
    
    return imports;
  }

  resolveImport(importPath, fromFile) {
    // Resolve import to file path
    // Simplified - would need proper module resolution
    return importPath;
  }

  async getLSPInfo(filePath, selection) {
    const language = this.detectLanguage(filePath);
    const lspClient = this.lspClients.get(language);
    
    if (!lspClient) {
      return null;
    }

    const position = {
      line: selection.startLine - 1,
      character: selection.startColumn - 1
    };

    return {
      definitions: await lspClient.getDefinitions(filePath, position),
      references: await lspClient.getReferences(filePath, position),
      hover: await lspClient.getHover(filePath, position),
      symbols: await lspClient.getSymbols(filePath)
    };
  }

  detectLanguage(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go'
    };
    return langMap[ext] || 'javascript';
  }

  buildPrompt(context, taskType, userPrompt) {
    // Build context-aware prompt
    let prompt = `Task: ${taskType}\n\n`;
    
    // Add file context
    prompt += `File: ${context.file}\n`;
    
    // Add symbol information
    if (context.symbols.length > 0) {
      prompt += `\nRelevant Symbols:\n`;
      context.symbols.slice(0, 5).forEach(symbol => {
        prompt += `- ${symbol.name} (${symbol.kind}) at line ${symbol.line}\n`;
      });
    }
    
    // Add recent changes
    if (context.recentChanges.length > 0) {
      prompt += `\nRecent Changes:\n`;
      context.recentChanges.slice(0, 3).forEach(change => {
        prompt += `- ${change.type} at ${change.timestamp}\n`;
      });
    }
    
    // Add test impact
    if (context.testImpact.length > 0) {
      prompt += `\nRelated Tests:\n`;
      context.testImpact.slice(0, 3).forEach(test => {
        prompt += `- ${test}\n`;
      });
    }
    
    // Add related files
    if (context.relatedFiles.length > 0) {
      prompt += `\nRelated Files:\n`;
      context.relatedFiles.slice(0, 3).forEach(file => {
        prompt += `- ${file}\n`;
      });
    }
    
    // Add user prompt
    prompt += `\nUser Request: ${userPrompt}\n`;
    
    return prompt;
  }

  clearCache() {
    this.contextCache.clear();
    this.blameCache.clear();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RepoContextProvider();
  });
} else {
  new RepoContextProvider();
}

})();
