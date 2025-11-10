/**
 * BigDaddy Editor - Search & Replace
 * 
 * Fast search and replace with regex support.
 * Incremental search with live highlighting.
 * 
 * @author BigDaddyG IDE Team
 * @version 1.0.0
 */

class Search {
    constructor(editor) {
        this.editor = editor;
        this.query = '';
        this.matches = [];
        this.currentMatchIndex = -1;
        this.caseSensitive = false;
        this.useRegex = false;
        this.wholeWord = false;
        
        console.log('[Search] Initialized');
    }

    /**
     * Find all matches
     */
    findAll(query, options = {}) {
        this.query = query;
        this.caseSensitive = options.caseSensitive || false;
        this.useRegex = options.useRegex || false;
        this.wholeWord = options.wholeWord || false;
        this.matches = [];
        this.currentMatchIndex = -1;

        if (!query) return [];

        const lines = this.editor.buffer.getLines();
        
        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            const matches = this.findInLine(line, lineNum);
            this.matches.push(...matches);
        }

        console.log(`[Search] Found ${this.matches.length} matches for "${query}"`);
        return this.matches;
    }

    /**
     * Find matches in a single line
     */
    findInLine(line, lineNum) {
        const matches = [];
        let searchText = line;
        let queryText = this.query;

        if (!this.caseSensitive) {
            searchText = line.toLowerCase();
            queryText = this.query.toLowerCase();
        }

        if (this.useRegex) {
            try {
                const flags = this.caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(queryText, flags);
                let match;

                while ((match = regex.exec(line)) !== null) {
                    matches.push({
                        line: lineNum,
                        column: match.index,
                        length: match[0].length,
                        text: match[0]
                    });
                }
            } catch (e) {
                console.error('[Search] Invalid regex:', e);
            }
        } else {
            let index = 0;
            while ((index = searchText.indexOf(queryText, index)) !== -1) {
                // Check whole word if needed
                if (this.wholeWord) {
                    const before = index > 0 ? line[index - 1] : ' ';
                    const after = index + queryText.length < line.length ? line[index + queryText.length] : ' ';
                    
                    if (!/\W/.test(before) || !/\W/.test(after)) {
                        index++;
                        continue;
                    }
                }

                matches.push({
                    line: lineNum,
                    column: index,
                    length: this.query.length,
                    text: line.substr(index, this.query.length)
                });

                index += queryText.length;
            }
        }

        return matches;
    }

    /**
     * Go to next match
     */
    next() {
        if (this.matches.length === 0) return null;

        this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
        const match = this.matches[this.currentMatchIndex];

        // Move cursor to match
        this.editor.setCursor({ line: match.line, column: match.column });
        
        console.log(`[Search] Next match: ${this.currentMatchIndex + 1}/${this.matches.length}`);
        return match;
    }

    /**
     * Go to previous match
     */
    previous() {
        if (this.matches.length === 0) return null;

        this.currentMatchIndex = this.currentMatchIndex <= 0 
            ? this.matches.length - 1 
            : this.currentMatchIndex - 1;
        
        const match = this.matches[this.currentMatchIndex];

        // Move cursor to match
        this.editor.setCursor({ line: match.line, column: match.column });
        
        console.log(`[Search] Previous match: ${this.currentMatchIndex + 1}/${this.matches.length}`);
        return match;
    }

    /**
     * Replace current match
     */
    replaceCurrent(replacement) {
        if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matches.length) {
            return false;
        }

        const match = this.matches[this.currentMatchIndex];
        const offset = this.editor.getOffsetFromPosition({ 
            line: match.line, 
            column: match.column 
        });

        // Delete old text
        this.editor.buffer.delete(offset, match.length);
        
        // Insert new text
        this.editor.buffer.insert(offset, replacement);
        
        // Update matches
        this.matches.splice(this.currentMatchIndex, 1);
        this.currentMatchIndex--;

        this.editor.render();
        
        console.log('[Search] Replaced match');
        return true;
    }

    /**
     * Replace all matches
     */
    replaceAll(replacement) {
        if (this.matches.length === 0) return 0;

        let count = 0;
        
        // Replace in reverse order to maintain offsets
        for (let i = this.matches.length - 1; i >= 0; i--) {
            const match = this.matches[i];
            const offset = this.editor.getOffsetFromPosition({ 
                line: match.line, 
                column: match.column 
            });

            this.editor.buffer.delete(offset, match.length);
            this.editor.buffer.insert(offset, replacement);
            count++;
        }

        this.matches = [];
        this.currentMatchIndex = -1;
        this.editor.render();

        console.log(`[Search] Replaced ${count} matches`);
        return count;
    }

    /**
     * Clear search
     */
    clear() {
        this.query = '';
        this.matches = [];
        this.currentMatchIndex = -1;
        this.editor.render();
    }

    /**
     * Render matches (highlight in editor)
     */
    renderMatches(ctx, lineNumberWidth, charWidth, lineHeight, topLine, leftColumn) {
        if (this.matches.length === 0) return;

        ctx.save();

        for (let i = 0; i < this.matches.length; i++) {
            const match = this.matches[i];
            
            // Only render visible matches
            if (match.line < topLine || match.line >= topLine + this.editor.visibleLines) {
                continue;
            }

            const x = lineNumberWidth + 10 + (match.column - leftColumn) * charWidth;
            const y = (match.line - topLine) * lineHeight;
            const width = match.length * charWidth;

            // Highlight color
            const isCurrent = i === this.currentMatchIndex;
            ctx.fillStyle = isCurrent ? 'rgba(0, 122, 204, 0.5)' : 'rgba(255, 255, 0, 0.3)';
            ctx.fillRect(x, y, width, lineHeight);

            // Border for current match
            if (isCurrent) {
                ctx.strokeStyle = '#007acc';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, lineHeight);
            }
        }

        ctx.restore();
    }

    /**
     * Get match count
     */
    getMatchCount() {
        return this.matches.length;
    }

    /**
     * Get current match index
     */
    getCurrentIndex() {
        return this.currentMatchIndex;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Search;
}
