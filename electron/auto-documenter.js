/**
 * BigDaddyG IDE - Auto Documenter
 * Automatic code documentation generation
 */

class AutoDocumenter {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
        
        console.log('[AutoDocumenter] Initialized');
    }
    
    /**
     * Initialize documentation templates
     */
    initializeTemplates() {
        this.templates.set('function', this.functionTemplate);
        this.templates.set('class', this.classTemplate);
        this.templates.set('method', this.methodTemplate);
        this.templates.set('variable', this.variableTemplate);
    }
    
    /**
     * Generate documentation for code
     */
    generateDocumentation(code, type, context = {}) {
        const template = this.templates.get(type);
        if (!template) {
            return this.generateGenericDocumentation(code, context);
        }
        
        return template.call(this, code, context);
    }
    
    /**
     * Function documentation template
     */
    functionTemplate(code, context) {
        const { name, params, returns } = this.analyzeFunctionSignature(code);
        
        let doc = `/**\n`;
        doc += ` * ${this.generateDescription(name, 'function')}\n`;
        doc += ` *\n`;
        
        if (params && params.length > 0) {
            params.forEach(param => {
                doc += ` * @param {${param.type || 'any'}} ${param.name} - ${param.description || 'Parameter description'}\n`;
            });
        }
        
        if (returns) {
            doc += ` * @returns {${returns.type || 'any'}} ${returns.description || 'Return value'}\n`;
        }
        
        doc += ` */\n`;
        
        return doc;
    }
    
    /**
     * Class documentation template
     */
    classTemplate(code, context) {
        const { name, extends: extendsClass } = this.analyzeClassSignature(code);
        
        let doc = `/**\n`;
        doc += ` * ${this.generateDescription(name, 'class')}\n`;
        
        if (extendsClass) {
            doc += ` * @extends {${extendsClass}}\n`;
        }
        
        doc += ` */\n`;
        
        return doc;
    }
    
    /**
     * Method documentation template
     */
    methodTemplate(code, context) {
        return this.functionTemplate(code, context);
    }
    
    /**
     * Variable documentation template
     */
    variableTemplate(code, context) {
        const { name, type } = this.analyzeVariableSignature(code);
        
        let doc = `/**\n`;
        doc += ` * ${this.generateDescription(name, 'variable')}\n`;
        doc += ` * @type {${type || 'any'}}\n`;
        doc += ` */\n`;
        
        return doc;
    }
    
    /**
     * Analyze function signature
     */
    analyzeFunctionSignature(code) {
        const functionMatch = code.match(/function\s+(\w+)\s*\(([^)]*)\)/);
        const arrowMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/);
        
        let name, paramsStr;
        
        if (functionMatch) {
            name = functionMatch[1];
            paramsStr = functionMatch[2];
        } else if (arrowMatch) {
            name = arrowMatch[1];
            paramsStr = arrowMatch[2];
        } else {
            return { name: 'unknown', params: [], returns: null };
        }
        
        const params = paramsStr
            .split(',')
            .map(p => p.trim())
            .filter(p => p)
            .map(p => ({
                name: p.split('=')[0].trim(),
                type: 'any',
                description: ''
            }));
        
        const hasReturn = code.includes('return');
        const returns = hasReturn ? { type: 'any', description: '' } : null;
        
        return { name, params, returns };
    }
    
    /**
     * Analyze class signature
     */
    analyzeClassSignature(code) {
        const classMatch = code.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?/);
        
        if (classMatch) {
            return {
                name: classMatch[1],
                extends: classMatch[2] || null
            };
        }
        
        return { name: 'unknown', extends: null };
    }
    
    /**
     * Analyze variable signature
     */
    analyzeVariableSignature(code) {
        const varMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*(.+)/);
        
        if (varMatch) {
            const name = varMatch[1];
            const value = varMatch[2].trim();
            
            let type = 'any';
            if (value.startsWith('"') || value.startsWith("'")) {
                type = 'string';
            } else if (value.match(/^\d+$/)) {
                type = 'number';
            } else if (value === 'true' || value === 'false') {
                type = 'boolean';
            } else if (value.startsWith('[')) {
                type = 'array';
            } else if (value.startsWith('{')) {
                type = 'object';
            }
            
            return { name, type };
        }
        
        return { name: 'unknown', type: 'any' };
    }
    
    /**
     * Generate description from name
     */
    generateDescription(name, type) {
        // Convert camelCase to words
        const words = name.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
        
        switch (type) {
            case 'function':
            case 'method':
                return `${words.charAt(0).toUpperCase() + words.slice(1)} function`;
            case 'class':
                return `${name} class`;
            case 'variable':
                return `${words.charAt(0).toUpperCase() + words.slice(1)} variable`;
            default:
                return `${name}`;
        }
    }
    
    /**
     * Generate generic documentation
     */
    generateGenericDocumentation(code, context) {
        return `/**\n * TODO: Add documentation\n */\n`;
    }
    
    /**
     * Document entire file
     */
    documentFile(code, language) {
        console.log(`[AutoDocumenter] Documenting ${language} file...`);
        
        let documented = code;
        
        // Find all functions
        const functionRegex = /(?:^|\n)((?:export\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/gm;
        let match;
        const inserts = [];
        
        while ((match = functionRegex.exec(code)) !== null) {
            const index = match.index + (match[0].startsWith('\n') ? 1 : 0);
            const functionCode = match[1];
            
            // Check if already documented
            const beforeCode = code.substring(Math.max(0, index - 100), index);
            if (!beforeCode.includes('/**')) {
                const doc = this.functionTemplate(functionCode, {});
                inserts.push({ index, doc });
            }
        }
        
        // Insert documentation (in reverse order to maintain indices)
        inserts.reverse().forEach(({ index, doc }) => {
            documented = documented.substring(0, index) + doc + documented.substring(index);
        });
        
        return documented;
    }
}

module.exports = AutoDocumenter;
