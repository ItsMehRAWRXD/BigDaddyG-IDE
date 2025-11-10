/**
 * BigDaddy Editor - Fast Tokenizer
 * 
 * Regex-based tokenizer that's fast and works in Web Workers.
 * Uses incremental parsing for performance.
 * 
 * @author BigDaddyG IDE Team
 * @version 1.0.0
 */

class Tokenizer {
    constructor(language = 'javascript') {
        this.language = language;
        this.grammars = this.loadGrammars();
    }

    /**
     * Load grammar definitions for all supported languages
     */
    loadGrammars() {
        return {
            javascript: {
                rules: [
                    { type: 'comment', pattern: /\/\/.*$/gm },
                    { type: 'comment', pattern: /\/\*[\s\S]*?\*\//gm },
                    { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/g },
                    { type: 'string', pattern: /'(?:[^'\\]|\\.)*'/g },
                    { type: 'string', pattern: /`(?:[^`\\]|\\.)*`/g },
                    { type: 'keyword', pattern: /\b(const|let|var|function|class|if|else|for|while|do|switch|case|break|continue|return|try|catch|finally|throw|async|await|yield|import|export|from|default|extends|implements|interface|type|enum|namespace|module|declare|public|private|protected|static|readonly|abstract|new|delete|typeof|instanceof|void|this|super)\b/g },
                    { type: 'number', pattern: /\b\d+\.?\d*\b/g },
                    { type: 'boolean', pattern: /\b(true|false|null|undefined)\b/g },
                    { type: 'function', pattern: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g },
                    { type: 'operator', pattern: /[+\-*/%=<>!&|^~?:]+/g },
                    { type: 'punctuation', pattern: /[{}[\]();,\.]/g }
                ]
            },
            python: {
                rules: [
                    { type: 'comment', pattern: /#.*$/gm },
                    { type: 'string', pattern: /"""[\s\S]*?"""/g },
                    { type: 'string', pattern: /'''[\s\S]*?'''/g },
                    { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/g },
                    { type: 'string', pattern: /'(?:[^'\\]|\\.)*'/g },
                    { type: 'keyword', pattern: /\b(def|class|if|elif|else|for|while|break|continue|return|try|except|finally|raise|import|from|as|with|pass|lambda|yield|async|await|True|False|None)\b/g },
                    { type: 'number', pattern: /\b\d+\.?\d*\b/g },
                    { type: 'function', pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g },
                    { type: 'operator', pattern: /[+\-*/%=<>!&|^~]+/g },
                    { type: 'punctuation', pattern: /[{}[\]();,\.]/g }
                ]
            },
            html: {
                rules: [
                    { type: 'comment', pattern: /<!--[\s\S]*?-->/g },
                    { type: 'tag', pattern: /<\/?[a-zA-Z0-9\-]+/g },
                    { type: 'attribute', pattern: /\b[a-zA-Z\-]+(?==)/g },
                    { type: 'string', pattern: /"[^"]*"/g },
                    { type: 'string', pattern: /'[^']*'/g },
                    { type: 'operator', pattern: /[<>/=]/g }
                ]
            },
            css: {
                rules: [
                    { type: 'comment', pattern: /\/\*[\s\S]*?\*\//g },
                    { type: 'selector', pattern: /^[^{]+(?={)/gm },
                    { type: 'property', pattern: /\b[a-z\-]+(?=:)/g },
                    { type: 'string', pattern: /"[^"]*"/g },
                    { type: 'string', pattern: /'[^']*'/g },
                    { type: 'number', pattern: /\b\d+\.?\d*(px|em|rem|%|vh|vw|pt)?\b/g },
                    { type: 'color', pattern: /#[0-9a-fA-F]{3,6}\b/g },
                    { type: 'punctuation', pattern: /[{}:;,]/g }
                ]
            },
            json: {
                rules: [
                    { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/g },
                    { type: 'number', pattern: /\b-?\d+\.?\d*([eE][+-]?\d+)?\b/g },
                    { type: 'boolean', pattern: /\b(true|false|null)\b/g },
                    { type: 'punctuation', pattern: /[{}[\]:,]/g }
                ]
            },
            glsl: {
                rules: [
                    { type: 'comment', pattern: /\/\/.*$/gm },
                    { type: 'comment', pattern: /\/\*[\s\S]*?\*\//gm },
                    { type: 'keyword', pattern: /\b(attribute|uniform|varying|const|in|out|inout|void|float|int|bool|vec2|vec3|vec4|mat2|mat3|mat4|sampler2D|samplerCube|if|else|for|while|do|break|continue|return|discard|struct)\b/g },
                    { type: 'function', pattern: /\b(main|sin|cos|tan|asin|acos|atan|pow|exp|log|sqrt|abs|sign|floor|ceil|fract|mod|min|max|clamp|mix|step|smoothstep|length|distance|dot|cross|normalize|reflect|refract|texture2D|textureCube)\b/g },
                    { type: 'number', pattern: /\b\d+\.?\d*\b/g },
                    { type: 'operator', pattern: /[+\-*/%=<>!&|^~?:]+/g },
                    { type: 'punctuation', pattern: /[{}[\]();,\.]/g }
                ]
            }
        };
    }

    /**
     * Tokenize a line of code
     */
    tokenizeLine(line) {
        const grammar = this.grammars[this.language] || this.grammars.javascript;
        const tokens = [];
        const matches = [];

        // Find all matches for all rules
        for (const rule of grammar.rules) {
            const regex = new RegExp(rule.pattern);
            let match;
            
            while ((match = regex.exec(line)) !== null) {
                matches.push({
                    type: rule.type,
                    text: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                });
            }
        }

        // Sort matches by start position
        matches.sort((a, b) => a.start - b.start);

        // Build final token list, handling overlaps
        let lastEnd = 0;
        for (const match of matches) {
            // Add text before this match
            if (match.start > lastEnd) {
                tokens.push({
                    type: 'text',
                    text: line.substring(lastEnd, match.start)
                });
            }

            // Skip overlapping matches
            if (match.start >= lastEnd) {
                tokens.push({
                    type: match.type,
                    text: match.text
                });
                lastEnd = match.end;
            }
        }

        // Add remaining text
        if (lastEnd < line.length) {
            tokens.push({
                type: 'text',
                text: line.substring(lastEnd)
            });
        }

        return tokens;
    }

    /**
     * Tokenize entire document
     */
    tokenize(code) {
        const lines = code.split('\n');
        return lines.map(line => this.tokenizeLine(line));
    }

    /**
     * Get color for token type
     */
    getTokenColor(type, theme = 'dark') {
        const colors = {
            dark: {
                keyword: '#569cd6',
                string: '#ce9178',
                comment: '#6a9955',
                number: '#b5cea8',
                boolean: '#569cd6',
                function: '#dcdcaa',
                operator: '#d4d4d4',
                punctuation: '#d4d4d4',
                tag: '#569cd6',
                attribute: '#9cdcfe',
                property: '#9cdcfe',
                selector: '#d7ba7d',
                color: '#ce9178',
                text: '#d4d4d4'
            },
            light: {
                keyword: '#0000ff',
                string: '#a31515',
                comment: '#008000',
                number: '#098658',
                boolean: '#0000ff',
                function: '#795e26',
                operator: '#000000',
                punctuation: '#000000',
                tag: '#800000',
                attribute: '#ff0000',
                property: '#ff0000',
                selector: '#800000',
                color: '#0451a5',
                text: '#000000'
            }
        };

        return colors[theme][type] || colors[theme].text;
    }
}

// Export for use in main thread and Web Workers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tokenizer;
}
