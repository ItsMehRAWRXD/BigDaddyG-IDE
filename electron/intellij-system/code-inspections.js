/**
 * BigDaddyG IntelliJ System - Code Inspections
 * 
 * Advanced code inspections like IntelliJ IDEA
 * - Error detection
 * - Warning detection
 * - Code smells
 * - Best practices
 * - Quick fixes
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

class CodeInspections {
    constructor() {
        this.inspections = new Map();
        this.severityLevels = ['error', 'warning', 'info', 'hint'];
        
        console.log('[CodeInspections] Initializing...');
        this.initializeInspections();
    }

    /**
     * Initialize all inspections
     */
    initializeInspections() {
        // JavaScript/TypeScript inspections
        this.addInspection('unused-variable', {
            language: ['javascript', 'typescript'],
            severity: 'warning',
            check: (code) => this.checkUnusedVariables(code),
            quickFix: (issue) => this.fixUnusedVariable(issue)
        });

        this.addInspection('missing-semicolon', {
            language: ['javascript', 'typescript'],
            severity: 'info',
            check: (code) => this.checkMissingSemicolons(code),
            quickFix: (issue) => this.fixMissingSemicolon(issue)
        });

        this.addInspection('console-log', {
            language: ['javascript', 'typescript'],
            severity: 'info',
            check: (code) => this.checkConsoleLogs(code),
            quickFix: (issue) => this.removeConsoleLog(issue)
        });

        // General inspections
        this.addInspection('long-method', {
            language: 'all',
            severity: 'warning',
            check: (code) => this.checkLongMethods(code)
        });

        this.addInspection('magic-numbers', {
            language: 'all',
            severity: 'info',
            check: (code) => this.checkMagicNumbers(code),
            quickFix: (issue) => this.extractConstant(issue)
        });

        this.addInspection('duplicated-code', {
            language: 'all',
            severity: 'warning',
            check: (code) => this.checkDuplicatedCode(code)
        });

        console.log(`[CodeInspections] Loaded ${this.inspections.size} inspections`);
    }

    /**
     * Add inspection
     */
    addInspection(id, config) {
        this.inspections.set(id, config);
    }

    /**
     * Run all inspections
     */
    async inspect(code, language) {
        console.log(`[CodeInspections] Running inspections for ${language}...`);

        const issues = [];

        for (const [id, inspection] of this.inspections) {
            // Check if inspection applies to this language
            if (inspection.language !== 'all' && 
                !inspection.language.includes(language)) {
                continue;
            }

            try {
                const results = await inspection.check(code);
                
                for (const result of results) {
                    issues.push({
                        id,
                        severity: inspection.severity,
                        message: result.message,
                        line: result.line,
                        column: result.column,
                        quickFix: inspection.quickFix ? true : false
                    });
                }
            } catch (e) {
                console.error(`[CodeInspections] Error in ${id}:`, e);
            }
        }

        return {
            issues,
            count: issues.length,
            bySevert: this.groupBySeverity(issues),
            timestamp: Date.now()
        };
    }

    /**
     * Check unused variables
     */
    checkUnusedVariables(code) {
        const issues = [];
        const regex = /(?:const|let|var)\s+(\w+)/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            const variable = match[1];
            const line = code.substring(0, match.index).split('\n').length;
            
            // Check if variable is used elsewhere
            const withoutDef = code.substring(match.index + match[0].length);
            if (!new RegExp(`\\b${variable}\\b`).test(withoutDef)) {
                issues.push({
                    message: `Unused variable: ${variable}`,
                    line,
                    column: match.index
                });
            }
        }

        return issues;
    }

    /**
     * Check missing semicolons
     */
    checkMissingSemicolons(code) {
        const issues = [];
        const lines = code.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if line should end with semicolon
            if (line && 
                !line.endsWith(';') && 
                !line.endsWith('{') && 
                !line.endsWith('}') &&
                !line.startsWith('//') &&
                !line.startsWith('/*')) {
                
                issues.push({
                    message: 'Missing semicolon',
                    line: i + 1,
                    column: line.length
                });
            }
        }

        return issues;
    }

    /**
     * Check console.log statements
     */
    checkConsoleLogs(code) {
        const issues = [];
        const regex = /console\.log\(/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            const line = code.substring(0, match.index).split('\n').length;
            
            issues.push({
                message: 'Remove console.log before production',
                line,
                column: match.index
            });
        }

        return issues;
    }

    /**
     * Check long methods
     */
    checkLongMethods(code) {
        const issues = [];
        const functions = code.match(/function\s+\w+[^{]*\{[^}]+\}/gs) || [];

        for (const func of functions) {
            const lines = func.split('\n').length;
            
            if (lines > 50) {
                const match = code.indexOf(func);
                const line = code.substring(0, match).split('\n').length;
                
                issues.push({
                    message: `Long method: ${lines} lines (threshold: 50)`,
                    line,
                    column: 0
                });
            }
        }

        return issues;
    }

    /**
     * Check magic numbers
     */
    checkMagicNumbers(code) {
        const issues = [];
        const regex = /\b(\d{2,})\b/g;
        let match;

        while ((match = regex.exec(code)) !== null) {
            const number = match[1];
            const line = code.substring(0, match.index).split('\n').length;
            
            // Ignore common numbers
            if (number !== '10' && number !== '100' && number !== '1000') {
                issues.push({
                    message: `Magic number: ${number} (consider extracting to constant)`,
                    line,
                    column: match.index
                });
            }
        }

        return issues;
    }

    /**
     * Check duplicated code
     */
    checkDuplicatedCode(code) {
        const issues = [];
        const lines = code.split('\n');
        const blocks = new Map();

        // Find duplicated blocks (simplified)
        for (let i = 0; i < lines.length - 5; i++) {
            const block = lines.slice(i, i + 5).join('\n');
            
            if (blocks.has(block)) {
                issues.push({
                    message: `Duplicated code block (lines ${i + 1}-${i + 5})`,
                    line: i + 1,
                    column: 0
                });
            } else {
                blocks.set(block, i);
            }
        }

        return issues;
    }

    /**
     * Quick fix: Remove unused variable
     */
    fixUnusedVariable(issue) {
        return {
            type: 'delete',
            line: issue.line,
            message: `Remove unused variable`
        };
    }

    /**
     * Quick fix: Add semicolon
     */
    fixMissingSemicolon(issue) {
        return {
            type: 'insert',
            line: issue.line,
            column: issue.column,
            text: ';',
            message: 'Add semicolon'
        };
    }

    /**
     * Quick fix: Remove console.log
     */
    removeConsoleLog(issue) {
        return {
            type: 'delete',
            line: issue.line,
            message: 'Remove console.log'
        };
    }

    /**
     * Quick fix: Extract constant
     */
    extractConstant(issue) {
        return {
            type: 'refactor',
            action: 'extractVariable',
            line: issue.line,
            message: 'Extract to constant'
        };
    }

    /**
     * Group issues by severity
     */
    groupBySeverity(issues) {
        const grouped = {
            error: [],
            warning: [],
            info: [],
            hint: []
        };

        for (const issue of issues) {
            grouped[issue.severity].push(issue);
        }

        return grouped;
    }

    /**
     * Get inspection by ID
     */
    getInspection(id) {
        return this.inspections.get(id);
    }

    /**
     * Enable/disable inspection
     */
    toggleInspection(id, enabled) {
        const inspection = this.inspections.get(id);
        if (inspection) {
            inspection.enabled = enabled;
            console.log(`[CodeInspections] ${id}: ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * Get all inspection IDs
     */
    getAllInspections() {
        return Array.from(this.inspections.keys());
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            totalInspections: this.inspections.size,
            enabledInspections: Array.from(this.inspections.values()).filter(i => i.enabled !== false).length
        };
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeInspections;
}
