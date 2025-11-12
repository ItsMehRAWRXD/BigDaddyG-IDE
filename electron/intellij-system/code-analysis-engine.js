/**
 * BigDaddyG IntelliJ System - Code Analysis Engine
 * 
 * Advanced code analysis similar to IntelliJ IDEA
 * - AST parsing
 * - Semantic analysis
 * - Type inference
 * - Dead code detection
 * - Complexity analysis
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

class CodeAnalysisEngine {
    constructor() {
        this.parsers = new Map();
        this.analyzers = new Map();
        this.cache = new Map();
        
        console.log('[CodeAnalysisEngine] Initializing...');
        this.initializeParsers();
        this.initializeAnalyzers();
    }

    /**
     * Initialize language parsers
     */
    initializeParsers() {
        // JavaScript/TypeScript parser
        this.parsers.set('javascript', {
            parse: (code) => this.parseJavaScript(code),
            supports: ['js', 'jsx', 'ts', 'tsx']
        });

        // Python parser
        this.parsers.set('python', {
            parse: (code) => this.parsePython(code),
            supports: ['py']
        });

        // Java parser
        this.parsers.set('java', {
            parse: (code) => this.parseJava(code),
            supports: ['java']
        });

        // C# parser
        this.parsers.set('csharp', {
            parse: (code) => this.parseCSharp(code),
            supports: ['cs']
        });

        // C/C++ parser
        this.parsers.set('cpp', {
            parse: (code) => this.parseCpp(code),
            supports: ['c', 'cpp', 'h', 'hpp']
        });

        console.log(`[CodeAnalysisEngine] Loaded ${this.parsers.size} parsers`);
    }

    /**
     * Initialize code analyzers
     */
    initializeAnalyzers() {
        this.analyzers.set('complexity', this.analyzeComplexity.bind(this));
        this.analyzers.set('deadcode', this.analyzeDeadCode.bind(this));
        this.analyzers.set('dependencies', this.analyzeDependencies.bind(this));
        this.analyzers.set('types', this.analyzeTypes.bind(this));
        this.analyzers.set('security', this.analyzeSecurity.bind(this));
        this.analyzers.set('performance', this.analyzePerformance.bind(this));

        console.log(`[CodeAnalysisEngine] Loaded ${this.analyzers.size} analyzers`);
    }

    /**
     * Analyze code file
     */
    async analyze(filepath, code, language) {
        const cacheKey = `${filepath}:${this.hash(code)}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            console.log(`[CodeAnalysisEngine] Cache hit for ${filepath}`);
            return this.cache.get(cacheKey);
        }

        console.log(`[CodeAnalysisEngine] Analyzing ${filepath}...`);

        const parser = this.getParser(language);
        if (!parser) {
            return { error: `No parser for language: ${language}` };
        }

        try {
            // Parse code to AST
            const ast = parser.parse(code);

            // Run all analyzers
            const results = {
                filepath,
                language,
                timestamp: Date.now(),
                ast,
                analyses: {}
            };

            for (const [name, analyzer] of this.analyzers) {
                try {
                    results.analyses[name] = await analyzer(ast, code, language);
                } catch (e) {
                    results.analyses[name] = { error: e.message };
                }
            }

            // Cache results
            this.cache.set(cacheKey, results);

            console.log(`[CodeAnalysisEngine] Analysis complete for ${filepath}`);
            return results;

        } catch (e) {
            console.error(`[CodeAnalysisEngine] Error analyzing ${filepath}:`, e);
            return { error: e.message, filepath };
        }
    }

    /**
     * Parse JavaScript/TypeScript
     */
    parseJavaScript(code) {
        // Simple AST structure (in production, use @babel/parser or typescript)
        const ast = {
            type: 'Program',
            body: [],
            functions: this.extractFunctions(code),
            classes: this.extractClasses(code),
            imports: this.extractImports(code),
            exports: this.extractExports(code),
            variables: this.extractVariables(code)
        };

        return ast;
    }

    /**
     * Parse Python
     */
    parsePython(code) {
        const ast = {
            type: 'Module',
            body: [],
            functions: this.extractPythonFunctions(code),
            classes: this.extractPythonClasses(code),
            imports: this.extractPythonImports(code)
        };

        return ast;
    }

    /**
     * Parse Java
     */
    parseJava(code) {
        const ast = {
            type: 'CompilationUnit',
            package: this.extractJavaPackage(code),
            imports: this.extractJavaImports(code),
            classes: this.extractJavaClasses(code),
            methods: this.extractJavaMethods(code)
        };

        return ast;
    }

    /**
     * Parse C#
     */
    parseCSharp(code) {
        const ast = {
            type: 'CompilationUnit',
            namespace: this.extractCSharpNamespace(code),
            usings: this.extractCSharpUsings(code),
            classes: this.extractCSharpClasses(code),
            methods: this.extractCSharpMethods(code)
        };

        return ast;
    }

    /**
     * Parse C/C++
     */
    parseCpp(code) {
        const ast = {
            type: 'TranslationUnit',
            includes: this.extractIncludes(code),
            functions: this.extractCppFunctions(code),
            classes: this.extractCppClasses(code),
            namespaces: this.extractNamespaces(code)
        };

        return ast;
    }

    /**
     * Analyze code complexity
     */
    analyzeComplexity(ast, code) {
        const metrics = {
            cyclomaticComplexity: 0,
            cognitiveComplexity: 0,
            linesOfCode: code.split('\n').length,
            functions: ast.functions?.length || 0,
            classes: ast.classes?.length || 0,
            maxNesting: 0
        };

        // Calculate cyclomatic complexity
        const controlFlowKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', '&&', '||', '?'];
        for (const keyword of controlFlowKeywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = code.match(regex);
            metrics.cyclomaticComplexity += matches ? matches.length : 0;
        }

        // Calculate max nesting level
        metrics.maxNesting = this.calculateMaxNesting(code);

        // Cognitive complexity (simplified)
        metrics.cognitiveComplexity = metrics.cyclomaticComplexity * 1.5;

        return {
            metrics,
            issues: this.findComplexityIssues(metrics)
        };
    }

    /**
     * Analyze dead code
     */
    analyzeDeadCode(ast, code) {
        const unused = {
            functions: [],
            variables: [],
            imports: []
        };

        // Find unused functions
        if (ast.functions) {
            for (const func of ast.functions) {
                if (!this.isUsed(func.name, code)) {
                    unused.functions.push(func.name);
                }
            }
        }

        // Find unused variables
        if (ast.variables) {
            for (const variable of ast.variables) {
                if (!this.isUsed(variable, code)) {
                    unused.variables.push(variable);
                }
            }
        }

        return {
            unused,
            issues: this.formatDeadCodeIssues(unused)
        };
    }

    /**
     * Analyze dependencies
     */
    analyzeDependencies(ast, code) {
        const dependencies = {
            imports: ast.imports || [],
            external: [],
            internal: [],
            circular: []
        };

        // Categorize dependencies
        for (const imp of dependencies.imports) {
            if (imp.startsWith('.') || imp.startsWith('/')) {
                dependencies.internal.push(imp);
            } else {
                dependencies.external.push(imp);
            }
        }

        return {
            dependencies,
            count: dependencies.imports.length,
            issues: []
        };
    }

    /**
     * Analyze types
     */
    analyzeTypes(ast, code, language) {
        const types = {
            inferred: [],
            explicit: [],
            errors: []
        };

        // Type inference (simplified)
        if (language === 'javascript' || language === 'typescript') {
            const assignments = code.match(/const|let|var\s+\w+\s*=\s*[^;]+/g) || [];
            for (const assignment of assignments) {
                const type = this.inferType(assignment);
                types.inferred.push(type);
            }
        }

        return {
            types,
            coverage: types.explicit.length / (types.inferred.length + types.explicit.length) || 0
        };
    }

    /**
     * Analyze security issues
     */
    analyzeSecurity(ast, code) {
        const issues = [];

        // Check for common security issues
        const patterns = [
            { pattern: /eval\(/, severity: 'high', message: 'Use of eval() is dangerous' },
            { pattern: /innerHTML\s*=/, severity: 'medium', message: 'Direct innerHTML assignment can lead to XSS' },
            { pattern: /document\.write/, severity: 'medium', message: 'document.write can be unsafe' },
            { pattern: /\bexec\(/, severity: 'high', message: 'Command execution can be dangerous' },
            { pattern: /password\s*=\s*["'][^"']+["']/, severity: 'high', message: 'Hardcoded password detected' },
            { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/, severity: 'high', message: 'Hardcoded API key detected' }
        ];

        for (const { pattern, severity, message } of patterns) {
            const matches = code.match(pattern);
            if (matches) {
                issues.push({ severity, message, count: matches.length });
            }
        }

        return { issues, count: issues.length };
    }

    /**
     * Analyze performance issues
     */
    analyzePerformance(ast, code) {
        const issues = [];

        // Check for performance anti-patterns
        const patterns = [
            { pattern: /for.*for.*for/s, message: 'Nested loops detected (O(n³))' },
            { pattern: /\.forEach\(.*\.forEach\(/s, message: 'Nested forEach detected' },
            { pattern: /\+\s*=\s*["']/g, message: 'String concatenation in loop' },
            { pattern: /new\s+\w+\s*\(/g, message: 'Object creation (consider pooling)' }
        ];

        for (const { pattern, message } of patterns) {
            const matches = code.match(pattern);
            if (matches) {
                issues.push({ message, count: matches.length });
            }
        }

        return { issues, count: issues.length };
    }

    /**
     * Helper: Extract functions from code
     */
    extractFunctions(code) {
        const functions = [];
        const regex = /function\s+(\w+)\s*\([^)]*\)|(\w+)\s*=\s*\([^)]*\)\s*=>/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            functions.push({
                name: match[1] || match[2],
                line: code.substring(0, match.index).split('\n').length
            });
        }

        return functions;
    }

    /**
     * Helper: Extract classes from code
     */
    extractClasses(code) {
        const classes = [];
        const regex = /class\s+(\w+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            classes.push({
                name: match[1],
                line: code.substring(0, match.index).split('\n').length
            });
        }

        return classes;
    }

    /**
     * Helper: Extract imports
     */
    extractImports(code) {
        const imports = [];
        const regex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            imports.push(match[1]);
        }

        return imports;
    }

    /**
     * Helper: Extract exports
     */
    extractExports(code) {
        const exports = [];
        const regex = /export\s+(?:default\s+)?(?:const|let|var|function|class)\s+(\w+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            exports.push(match[1]);
        }

        return exports;
    }

    /**
     * Helper: Extract variables
     */
    extractVariables(code) {
        const variables = [];
        const regex = /(?:const|let|var)\s+(\w+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            variables.push(match[1]);
        }

        return variables;
    }

    /**
     * Helper: Extract Python functions
     */
    extractPythonFunctions(code) {
        const functions = [];
        const regex = /def\s+(\w+)\s*\(/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            functions.push({ name: match[1] });
        }

        return functions;
    }

    /**
     * Helper: Extract Python classes
     */
    extractPythonClasses(code) {
        const classes = [];
        const regex = /class\s+(\w+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            classes.push({ name: match[1] });
        }

        return classes;
    }

    /**
     * Helper: Extract Python imports
     */
    extractPythonImports(code) {
        const imports = [];
        const regex = /(?:from\s+(\S+)\s+)?import\s+(\S+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            imports.push(match[1] || match[2]);
        }

        return imports;
    }

    /**
     * Helper: Extract Java package
     */
    extractJavaPackage(code) {
        const match = code.match(/package\s+([\w.]+);/);
        return match ? match[1] : null;
    }

    /**
     * Helper: Extract Java imports
     */
    extractJavaImports(code) {
        const imports = [];
        const regex = /import\s+([\w.]+);/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            imports.push(match[1]);
        }

        return imports;
    }

    /**
     * Helper: Extract Java classes
     */
    extractJavaClasses(code) {
        const classes = [];
        const regex = /(?:public\s+)?class\s+(\w+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            classes.push({ name: match[1] });
        }

        return classes;
    }

    /**
     * Helper: Extract Java methods
     */
    extractJavaMethods(code) {
        const methods = [];
        const regex = /(?:public|private|protected)?\s+\w+\s+(\w+)\s*\(/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            methods.push({ name: match[1] });
        }

        return methods;
    }

    /**
     * Helper: Extract C# namespace
     */
    extractCSharpNamespace(code) {
        const match = code.match(/namespace\s+([\w.]+)/);
        return match ? match[1] : null;
    }

    /**
     * Helper: Extract C# usings
     */
    extractCSharpUsings(code) {
        const usings = [];
        const regex = /using\s+([\w.]+);/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            usings.push(match[1]);
        }

        return usings;
    }

    /**
     * Helper: Extract C# classes
     */
    extractCSharpClasses(code) {
        return this.extractJavaClasses(code); // Similar syntax
    }

    /**
     * Helper: Extract C# methods
     */
    extractCSharpMethods(code) {
        return this.extractJavaMethods(code); // Similar syntax
    }

    /**
     * Helper: Extract C++ includes
     */
    extractIncludes(code) {
        const includes = [];
        const regex = /#include\s+[<"]([^>"]+)[>"]/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            includes.push(match[1]);
        }

        return includes;
    }

    /**
     * Helper: Extract C++ functions
     */
    extractCppFunctions(code) {
        return this.extractFunctions(code); // Similar pattern
    }

    /**
     * Helper: Extract C++ classes
     */
    extractCppClasses(code) {
        return this.extractClasses(code); // Similar pattern
    }

    /**
     * Helper: Extract C++ namespaces
     */
    extractNamespaces(code) {
        const namespaces = [];
        const regex = /namespace\s+(\w+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            namespaces.push(match[1]);
        }

        return namespaces;
    }

    /**
     * Helper: Calculate max nesting level
     */
    calculateMaxNesting(code) {
        let max = 0;
        let current = 0;

        for (const char of code) {
            if (char === '{') {
                current++;
                max = Math.max(max, current);
            } else if (char === '}') {
                current--;
            }
        }

        return max;
    }

    /**
     * Helper: Check if identifier is used
     */
    isUsed(identifier, code) {
        // Remove the definition itself
        const withoutDef = code.replace(new RegExp(`(?:function|const|let|var|class)\\s+${identifier}\\b`), '');
        // Check if it appears elsewhere
        return new RegExp(`\\b${identifier}\\b`).test(withoutDef);
    }

    /**
     * Helper: Find complexity issues
     */
    findComplexityIssues(metrics) {
        const issues = [];

        if (metrics.cyclomaticComplexity > 10) {
            issues.push({
                severity: 'warning',
                message: `High cyclomatic complexity: ${metrics.cyclomaticComplexity} (threshold: 10)`
            });
        }

        if (metrics.maxNesting > 4) {
            issues.push({
                severity: 'warning',
                message: `Deep nesting: ${metrics.maxNesting} levels (threshold: 4)`
            });
        }

        if (metrics.linesOfCode > 300) {
            issues.push({
                severity: 'info',
                message: `Large file: ${metrics.linesOfCode} lines (consider splitting)`
            });
        }

        return issues;
    }

    /**
     * Helper: Format dead code issues
     */
    formatDeadCodeIssues(unused) {
        const issues = [];

        if (unused.functions.length > 0) {
            issues.push({
                severity: 'warning',
                message: `Unused functions: ${unused.functions.join(', ')}`
            });
        }

        if (unused.variables.length > 0) {
            issues.push({
                severity: 'info',
                message: `Unused variables: ${unused.variables.join(', ')}`
            });
        }

        return issues;
    }

    /**
     * Helper: Infer type from code
     */
    inferType(code) {
        if (/=\s*\d+/.test(code)) return { type: 'number' };
        if (/=\s*["']/.test(code)) return { type: 'string' };
        if (/=\s*true|false/.test(code)) return { type: 'boolean' };
        if (/=\s*\[/.test(code)) return { type: 'array' };
        if (/=\s*{/.test(code)) return { type: 'object' };
        if (/=\s*function/.test(code)) return { type: 'function' };
        return { type: 'unknown' };
    }

    /**
     * Get parser for language
     */
    getParser(language) {
        for (const [name, parser] of this.parsers) {
            if (parser.supports.includes(language)) {
                return parser;
            }
        }
        return null;
    }

    /**
     * Hash code for caching
     */
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('[CodeAnalysisEngine] Cache cleared');
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeAnalysisEngine;
}
