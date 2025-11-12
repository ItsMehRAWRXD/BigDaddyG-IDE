/**
 * BigDaddyG IntelliJ System - Refactoring Engine
 * 
 * Advanced refactoring capabilities like IntelliJ IDEA
 * - Rename
 * - Extract Method/Function
 * - Extract Variable
 * - Inline
 * - Move
 * - Change Signature
 * - Safe Delete
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

class RefactoringEngine {
    constructor(codeAnalysis) {
        this.codeAnalysis = codeAnalysis;
        this.refactorings = new Map();
        this.history = [];
        
        console.log('[RefactoringEngine] Initializing...');
        this.initializeRefactorings();
    }

    /**
     * Initialize available refactorings
     */
    initializeRefactorings() {
        this.refactorings.set('rename', this.rename.bind(this));
        this.refactorings.set('extractMethod', this.extractMethod.bind(this));
        this.refactorings.set('extractVariable', this.extractVariable.bind(this));
        this.refactorings.set('inline', this.inline.bind(this));
        this.refactorings.set('move', this.move.bind(this));
        this.refactorings.set('changeSignature', this.changeSignature.bind(this));
        this.refactorings.set('safeDelete', this.safeDelete.bind(this));
        this.refactorings.set('convertToArrow', this.convertToArrow.bind(this));
        this.refactorings.set('splitDeclaration', this.splitDeclaration.bind(this));
        this.refactorings.set('introduceParameter', this.introduceParameter.bind(this));

        console.log(`[RefactoringEngine] Loaded ${this.refactorings.size} refactorings`);
    }

    /**
     * Rename symbol across project
     */
    async rename(oldName, newName, scope = 'project') {
        console.log(`[RefactoringEngine] Renaming ${oldName} -> ${newName} (scope: ${scope})`);

        const changes = [];

        // Find all occurrences
        const occurrences = await this.findOccurrences(oldName, scope);

        for (const occurrence of occurrences) {
            changes.push({
                file: occurrence.file,
                line: occurrence.line,
                column: occurrence.column,
                oldText: oldName,
                newText: newName,
                type: 'rename'
            });
        }

        const result = {
            refactoring: 'rename',
            oldName,
            newName,
            changes,
            affectedFiles: [...new Set(changes.map(c => c.file))],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Extract method/function
     */
    async extractMethod(code, selection, methodName, language) {
        console.log(`[RefactoringEngine] Extracting method: ${methodName}`);

        const { start, end } = selection;
        const selectedCode = code.substring(start, end);

        // Analyze selected code
        const variables = this.findVariables(selectedCode);
        const usedBefore = variables.filter(v => this.isUsedBefore(v, code, start));
        const usedAfter = variables.filter(v => this.isUsedAfter(v, code, end));

        // Determine parameters and return values
        const parameters = usedBefore;
        const returnValues = usedAfter;

        // Generate method signature
        const signature = this.generateMethodSignature(methodName, parameters, returnValues, language);

        // Generate method body
        const methodBody = this.generateMethodBody(selectedCode, returnValues, language);

        // Generate method call
        const methodCall = this.generateMethodCall(methodName, parameters, returnValues, language);

        const result = {
            refactoring: 'extractMethod',
            methodName,
            signature,
            body: methodBody,
            call: methodCall,
            parameters,
            returnValues,
            changes: [
                {
                    type: 'insert',
                    position: this.findInsertPosition(code, start),
                    text: signature + methodBody
                },
                {
                    type: 'replace',
                    start,
                    end,
                    text: methodCall
                }
            ],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Extract variable
     */
    async extractVariable(code, selection, variableName, language) {
        console.log(`[RefactoringEngine] Extracting variable: ${variableName}`);

        const { start, end } = selection;
        const expression = code.substring(start, end);

        // Find all occurrences of the expression
        const occurrences = this.findExpressionOccurrences(expression, code);

        // Generate variable declaration
        const declaration = this.generateVariableDeclaration(variableName, expression, language);

        const result = {
            refactoring: 'extractVariable',
            variableName,
            expression,
            declaration,
            occurrences: occurrences.length,
            changes: [
                {
                    type: 'insert',
                    position: this.findDeclarationPosition(code, start),
                    text: declaration
                },
                ...occurrences.map(pos => ({
                    type: 'replace',
                    start: pos.start,
                    end: pos.end,
                    text: variableName
                }))
            ],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Inline variable or method
     */
    async inline(identifier, code, language) {
        console.log(`[RefactoringEngine] Inlining: ${identifier}`);

        // Find definition
        const definition = this.findDefinition(identifier, code);
        
        if (!definition) {
            throw new Error(`Cannot find definition for ${identifier}`);
        }

        // Find all usages
        const usages = this.findUsages(identifier, code);

        const result = {
            refactoring: 'inline',
            identifier,
            definition: definition.value,
            usages: usages.length,
            changes: [
                {
                    type: 'delete',
                    start: definition.start,
                    end: definition.end
                },
                ...usages.map(usage => ({
                    type: 'replace',
                    start: usage.start,
                    end: usage.end,
                    text: definition.value
                }))
            ],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Move symbol to different file
     */
    async move(symbol, fromFile, toFile) {
        console.log(`[RefactoringEngine] Moving ${symbol} from ${fromFile} to ${toFile}`);

        const result = {
            refactoring: 'move',
            symbol,
            fromFile,
            toFile,
            changes: [
                {
                    file: fromFile,
                    type: 'delete',
                    symbol
                },
                {
                    file: toFile,
                    type: 'insert',
                    symbol
                }
            ],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Change method signature
     */
    async changeSignature(methodName, newParameters, code, language) {
        console.log(`[RefactoringEngine] Changing signature: ${methodName}`);

        // Find method definition
        const definition = this.findMethodDefinition(methodName, code);
        
        // Find all calls
        const calls = this.findMethodCalls(methodName, code);

        // Generate new signature
        const newSignature = this.generateNewSignature(methodName, newParameters, language);

        const result = {
            refactoring: 'changeSignature',
            methodName,
            oldParameters: definition.parameters,
            newParameters,
            newSignature,
            affectedCalls: calls.length,
            changes: [
                {
                    type: 'replace',
                    start: definition.start,
                    end: definition.end,
                    text: newSignature
                },
                ...calls.map(call => ({
                    type: 'update',
                    location: call,
                    message: 'Update method call'
                }))
            ],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Safe delete with usage check
     */
    async safeDelete(symbol, code, scope = 'project') {
        console.log(`[RefactoringEngine] Safe delete: ${symbol}`);

        // Find all usages
        const usages = await this.findOccurrences(symbol, scope);

        if (usages.length > 1) { // More than just the definition
            return {
                refactoring: 'safeDelete',
                symbol,
                canDelete: false,
                usages: usages.length - 1,
                message: `Cannot delete ${symbol}: Found ${usages.length - 1} usage(s)`,
                locations: usages.slice(1) // Exclude definition
            };
        }

        const result = {
            refactoring: 'safeDelete',
            symbol,
            canDelete: true,
            changes: [{
                type: 'delete',
                symbol
            }],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Convert function to arrow function
     */
    async convertToArrow(code, selection) {
        console.log('[RefactoringEngine] Converting to arrow function');

        const { start, end } = selection;
        const functionCode = code.substring(start, end);

        // Parse function
        const match = functionCode.match(/function\s*(\w*)\s*\(([^)]*)\)\s*{([\s\S]*)}/);
        
        if (!match) {
            throw new Error('Not a valid function');
        }

        const [, name, params, body] = match;

        // Generate arrow function
        const arrowFunction = `${name ? `const ${name} = ` : ''}(${params}) => {${body}}`;

        const result = {
            refactoring: 'convertToArrow',
            changes: [{
                type: 'replace',
                start,
                end,
                text: arrowFunction
            }],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Split variable declaration
     */
    async splitDeclaration(code, selection) {
        console.log('[RefactoringEngine] Splitting declaration');

        const { start, end } = selection;
        const declaration = code.substring(start, end);

        // Parse: const x = 1, y = 2, z = 3;
        const match = declaration.match(/(const|let|var)\s+(.+);/);
        
        if (!match) {
            throw new Error('Not a valid declaration');
        }

        const [, keyword, vars] = match;
        const variables = vars.split(',').map(v => v.trim());

        // Split into separate declarations
        const splitDeclarations = variables.map(v => `${keyword} ${v};`).join('\n');

        const result = {
            refactoring: 'splitDeclaration',
            originalCount: variables.length,
            changes: [{
                type: 'replace',
                start,
                end,
                text: splitDeclarations
            }],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Introduce parameter
     */
    async introduceParameter(methodName, expression, paramName, code, language) {
        console.log(`[RefactoringEngine] Introducing parameter: ${paramName}`);

        const methodDef = this.findMethodDefinition(methodName, code);
        const calls = this.findMethodCalls(methodName, code);

        // Add parameter to signature
        const newParams = [...methodDef.parameters, paramName];
        const newSignature = this.generateNewSignature(methodName, newParams, language);

        const result = {
            refactoring: 'introduceParameter',
            methodName,
            paramName,
            expression,
            changes: [
                {
                    type: 'replace',
                    start: methodDef.start,
                    end: methodDef.end,
                    text: newSignature
                },
                ...calls.map(call => ({
                    type: 'update',
                    location: call,
                    addArgument: expression
                }))
            ],
            timestamp: Date.now()
        };

        this.history.push(result);
        return result;
    }

    /**
     * Find all occurrences of a symbol
     */
    async findOccurrences(symbol, scope) {
        // In production, search across project files
        // For now, return mock data
        return [
            { file: 'main.js', line: 10, column: 5 },
            { file: 'utils.js', line: 25, column: 12 }
        ];
    }

    /**
     * Helper methods
     */
    findVariables(code) {
        const regex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        const variables = new Set();
        let match;

        while ((match = regex.exec(code)) !== null) {
            variables.add(match[1]);
        }

        return Array.from(variables);
    }

    isUsedBefore(variable, code, position) {
        const beforeCode = code.substring(0, position);
        return new RegExp(`\\b${variable}\\b`).test(beforeCode);
    }

    isUsedAfter(variable, code, position) {
        const afterCode = code.substring(position);
        return new RegExp(`\\b${variable}\\b`).test(afterCode);
    }

    generateMethodSignature(name, params, returnVals, language) {
        switch (language) {
            case 'javascript':
            case 'typescript':
                return `function ${name}(${params.join(', ')}) {\n`;
            case 'python':
                return `def ${name}(${params.join(', ')}):\n`;
            case 'java':
            case 'csharp':
                const returnType = returnVals.length > 0 ? 'Object' : 'void';
                return `${returnType} ${name}(${params.map(p => `var ${p}`).join(', ')}) {\n`;
            default:
                return `function ${name}(${params.join(', ')}) {\n`;
        }
    }

    generateMethodBody(code, returnVals, language) {
        if (returnVals.length > 0) {
            return `${code}\n    return ${returnVals.join(', ')};\n}\n`;
        }
        return `${code}\n}\n`;
    }

    generateMethodCall(name, params, returnVals, language) {
        const call = `${name}(${params.join(', ')})`;
        if (returnVals.length > 0) {
            return `const ${returnVals.join(', ')} = ${call};`;
        }
        return `${call};`;
    }

    generateVariableDeclaration(name, value, language) {
        switch (language) {
            case 'javascript':
            case 'typescript':
                return `const ${name} = ${value};\n`;
            case 'python':
                return `${name} = ${value}\n`;
            case 'java':
            case 'csharp':
                return `var ${name} = ${value};\n`;
            default:
                return `const ${name} = ${value};\n`;
        }
    }

    findInsertPosition(code, start) {
        // Find appropriate position to insert method (before current function)
        const lines = code.substring(0, start).split('\n');
        return lines.length;
    }

    findDeclarationPosition(code, start) {
        // Find appropriate position to insert variable (beginning of block)
        const beforeCode = code.substring(0, start);
        const lastBrace = beforeCode.lastIndexOf('{');
        return lastBrace + 1;
    }

    findExpressionOccurrences(expression, code) {
        const occurrences = [];
        let index = 0;

        while ((index = code.indexOf(expression, index)) !== -1) {
            occurrences.push({
                start: index,
                end: index + expression.length
            });
            index += expression.length;
        }

        return occurrences;
    }

    findDefinition(identifier, code) {
        // Find variable or function definition
        const regex = new RegExp(`(?:const|let|var|function)\\s+${identifier}\\s*[=({]([^;{}]+)[;{}]`);
        const match = regex.exec(code);

        if (match) {
            return {
                start: match.index,
                end: match.index + match[0].length,
                value: match[1].trim()
            };
        }

        return null;
    }

    findUsages(identifier, code) {
        const usages = [];
        const regex = new RegExp(`\\b${identifier}\\b`, 'g');
        let match;

        while ((match = regex.exec(code)) !== null) {
            usages.push({
                start: match.index,
                end: match.index + identifier.length
            });
        }

        return usages;
    }

    findMethodDefinition(methodName, code) {
        const regex = new RegExp(`function\\s+${methodName}\\s*\\(([^)]*)\\)`);
        const match = regex.exec(code);

        if (match) {
            return {
                start: match.index,
                end: match.index + match[0].length,
                parameters: match[1].split(',').map(p => p.trim()).filter(p => p)
            };
        }

        return { parameters: [] };
    }

    findMethodCalls(methodName, code) {
        const calls = [];
        const regex = new RegExp(`\\b${methodName}\\s*\\(`, 'g');
        let match;

        while ((match = regex.exec(code)) !== null) {
            calls.push({
                start: match.index,
                end: match.index + match[0].length
            });
        }

        return calls;
    }

    generateNewSignature(methodName, parameters, language) {
        return this.generateMethodSignature(methodName, parameters, [], language);
    }

    /**
     * Get refactoring history
     */
    getHistory() {
        return this.history;
    }

    /**
     * Undo last refactoring
     */
    undo() {
        if (this.history.length > 0) {
            const last = this.history.pop();
            console.log(`[RefactoringEngine] Undoing: ${last.refactoring}`);
            return last;
        }
        return null;
    }

    /**
     * Get available refactorings for context
     */
    getAvailableRefactorings(context) {
        // Return refactorings available for current context
        return Array.from(this.refactorings.keys());
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RefactoringEngine;
}
