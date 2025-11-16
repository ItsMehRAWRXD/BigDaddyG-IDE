/**
 * Agentic Self-Healing System
 * Automatically detects and fixes errors during agentic execution
 */

class AgenticSelfHealing {
  constructor() {
    this.healingHistory = [];
    this.maxHealingAttempts = 5;
    this.healingStrategies = new Map();
    this.registerDefaultStrategies();
  }

  registerDefaultStrategies() {
    // Strategy: Compilation errors
    this.healingStrategies.set('compilation-error', {
      name: 'Fix Compilation Errors',
      detect: (error) => /error:|warning:|undefined reference|syntax error/i.test(error),
      heal: async (error, context) => {
        return await this.fixCompilationError(error, context);
      }
    });

    // Strategy: Missing imports
    this.healingStrategies.set('missing-import', {
      name: 'Add Missing Imports',
      detect: (error) => /cannot find|is not defined|module not found/i.test(error),
      heal: async (error, context) => {
        return await this.addMissingImports(error, context);
      }
    });

    // Strategy: Type errors
    this.healingStrategies.set('type-error', {
      name: 'Fix Type Errors',
      detect: (error) => /type error|type mismatch|expected.*got/i.test(error),
      heal: async (error, context) => {
        return await this.fixTypeError(error, context);
      }
    });

    // Strategy: Runtime errors
    this.healingStrategies.set('runtime-error', {
      name: 'Fix Runtime Errors',
      detect: (error) => /runtime error|exception|crash|segmentation fault/i.test(error),
      heal: async (error, context) => {
        return await this.fixRuntimeError(error, context);
      }
    });

    // Strategy: Test failures
    this.healingStrategies.set('test-failure', {
      name: 'Fix Test Failures',
      detect: (error) => /test failed|assertion failed|expected.*but got/i.test(error),
      heal: async (error, context) => {
        return await this.fixTestFailure(error, context);
      }
    });
  }

  async attemptHealing(error, context) {
    console.log('[Self-Healing] 🔧 Attempting to heal error...');
    
    const healingAttempt = {
      timestamp: new Date().toISOString(),
      error: error.message || String(error),
      context,
      strategies: [],
      success: false
    };

    // Try each healing strategy
    for (const [id, strategy] of this.healingStrategies) {
      if (strategy.detect(error.message || String(error))) {
        console.log(`[Self-Healing] 🎯 Trying strategy: ${strategy.name}`);
        
        try {
          const result = await strategy.heal(error, context);
          healingAttempt.strategies.push({
            strategy: id,
            name: strategy.name,
            result,
            success: result.success !== false
          });

          if (result.success !== false) {
            healingAttempt.success = true;
            healingAttempt.fixedError = result;
            break;
          }
        } catch (healError) {
          console.warn(`[Self-Healing] Strategy ${id} failed:`, healError);
          healingAttempt.strategies.push({
            strategy: id,
            name: strategy.name,
            error: healError.message,
            success: false
          });
        }
      }
    }

    this.healingHistory.push(healingAttempt);
    return healingAttempt;
  }

  async fixCompilationError(error, context) {
    const errorMessage = error.message || String(error);
    const file = context.file || context.currentFile;
    
    if (!file) {
      return { success: false, reason: 'No file context' };
    }

    try {
      // Read the file
      const content = await window.electron.readFile(file);
      
      // Extract error details
      const lineMatch = errorMessage.match(/line (\d+)/i);
      const errorType = errorMessage.match(/(syntax error|undefined|missing)/i)?.[0];
      
      // Generate fix prompt
      const fixPrompt = `
File: ${file}

Error:
${errorMessage}

Current code around error:
\`\`\`
${this.getCodeAroundLine(content, lineMatch ? parseInt(lineMatch[1]) : 0)}
\`\`\`

Fix this compilation error. Provide only the corrected code.
`;

      // Get AI fix
      const response = await this.callAI(fixPrompt);
      const fixedCode = this.extractCode(response);
      
      // Apply fix
      const updatedContent = this.applyFix(content, fixedCode, lineMatch ? parseInt(lineMatch[1]) : 0);
      
      // Write fixed file
      await window.electron.writeFile(file, updatedContent);
      
      return {
        success: true,
        file,
        fix: fixedCode,
        message: 'Compilation error fixed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async addMissingImports(error, context) {
    const errorMessage = error.message || String(error);
    const file = context.file || context.currentFile;
    
    // Extract missing symbol
    const symbolMatch = errorMessage.match(/(?:cannot find|cannot resolve|is not defined).*?['"]([\w]+)['"]/i);
    const missingSymbol = symbolMatch ? symbolMatch[1] : null;
    
    if (!missingSymbol || !file) {
      return { success: false, reason: 'Could not identify missing import' };
    }

    try {
      const content = await window.electron.readFile(file);
      
      // Determine import statement based on language
      const fileExt = file.split('.').pop();
      let importStatement = '';
      
      if (fileExt === 'js' || fileExt === 'ts') {
        importStatement = `import { ${missingSymbol} } from '${this.guessModuleName(missingSymbol)}';`;
      } else if (fileExt === 'py') {
        importStatement = `from ${this.guessModuleName(missingSymbol)} import ${missingSymbol}`;
      } else if (fileExt === 'java') {
        importStatement = `import ${this.guessModuleName(missingSymbol)}.${missingSymbol};`;
      }
      
      // Add import at top of file
      const updatedContent = importStatement + '\n' + content;
      await window.electron.writeFile(file, updatedContent);
      
      return {
        success: true,
        file,
        importAdded: importStatement,
        message: `Added import for ${missingSymbol}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async fixTypeError(error, context) {
    // Similar to compilation error but focused on types
    return await this.fixCompilationError(error, context);
  }

  async fixRuntimeError(error, context) {
    const errorMessage = error.message || String(error);
    
    // Analyze runtime error
    if (/null pointer|undefined/i.test(errorMessage)) {
      return await this.fixNullPointer(error, context);
    } else if (/index out of bounds|array index/i.test(errorMessage)) {
      return await this.fixIndexError(error, context);
    } else if (/division by zero/i.test(errorMessage)) {
      return await this.fixDivisionByZero(error, context);
    }
    
    return { success: false, reason: 'Unknown runtime error type' };
  }

  async fixTestFailure(error, context) {
    const errorMessage = error.message || String(error);
    
    // Extract test details
    const expectedMatch = errorMessage.match(/expected[:\s]+([^\n]+)/i);
    const actualMatch = errorMessage.match(/got[:\s]+([^\n]+)/i);
    
    if (expectedMatch && actualMatch) {
      const expected = expectedMatch[1].trim();
      const actual = actualMatch[1].trim();
      
      // Generate fix
      const fixPrompt = `
Test failure:
Expected: ${expected}
Actual: ${actual}

Fix the code to make the test pass.
`;

      const response = await this.callAI(fixPrompt);
      return {
        success: true,
        fix: response,
        message: 'Test failure fix generated'
      };
    }
    
    return { success: false, reason: 'Could not parse test failure' };
  }

  async fixNullPointer(error, context) {
    const file = context.file || context.currentFile;
    if (!file) return { success: false };
    
    try {
      const content = await window.electron.readFile(file);
      
      const fixPrompt = `
File: ${file}

Error: Null pointer exception

Code:
\`\`\`
${content}
\`\`\`

Add null checks to prevent null pointer exceptions.
`;

      const response = await this.callAI(fixPrompt);
      const fixedCode = this.extractCode(response);
      
      await window.electron.writeFile(file, fixedCode);
      
      return {
        success: true,
        file,
        message: 'Added null checks'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async fixIndexError(error, context) {
    // Similar pattern - add bounds checking
    return await this.fixNullPointer(error, context);
  }

  async fixDivisionByZero(error, context) {
    const file = context.file || context.currentFile;
    if (!file) return { success: false };
    
    try {
      const content = await window.electron.readFile(file);
      
      const fixPrompt = `
File: ${file}

Error: Division by zero

Code:
\`\`\`
${content}
\`\`\`

Add checks to prevent division by zero.
`;

      const response = await this.callAI(fixPrompt);
      const fixedCode = this.extractCode(response);
      
      await window.electron.writeFile(file, fixedCode);
      
      return {
        success: true,
        file,
        message: 'Added division by zero checks'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getCodeAroundLine(content, lineNumber, contextLines = 10) {
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - contextLines);
    const end = Math.min(lines.length, lineNumber + contextLines);
    return lines.slice(start, end).join('\n');
  }

  applyFix(content, fixedCode, lineNumber) {
    // Simple fix application - replace around the error line
    const lines = content.split('\n');
    const contextLines = 5;
    const start = Math.max(0, lineNumber - contextLines);
    const end = Math.min(lines.length, lineNumber + contextLines);
    
    // Replace the problematic section
    const before = lines.slice(0, start).join('\n');
    const after = lines.slice(end).join('\n');
    
    return before + '\n' + fixedCode + '\n' + after;
  }

  extractCode(text) {
    // Extract code blocks from AI response
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    return match ? match[1].trim() : text.trim();
  }

  guessModuleName(symbol) {
    // Simple heuristic for guessing module names
    const commonModules = {
      'React': 'react',
      'Component': 'react',
      'useState': 'react',
      'useEffect': 'react',
      'express': 'express',
      'fs': 'fs',
      'path': 'path',
      'http': 'http',
      'os': 'os'
    };
    
    return commonModules[symbol] || symbol.toLowerCase();
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

  getHealingStats() {
    const total = this.healingHistory.length;
    const successful = this.healingHistory.filter(h => h.success).length;
    
    return {
      totalAttempts: total,
      successful: successful,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) : 0,
      strategies: Array.from(this.healingStrategies.keys())
    };
  }
}

// Initialize and expose
if (typeof window !== 'undefined') {
  window.agenticSelfHealing = new AgenticSelfHealing();
}

module.exports = AgenticSelfHealing;
