/**
 * BigDaddyG IDE - VS Code Position
 * Implements vscode.Position class
 */

class Position {
    constructor(line, character) {
        if (line < 0) {
            throw new Error('Line must be non-negative');
        }
        if (character < 0) {
            throw new Error('Character must be non-negative');
        }
        
        this.line = line;
        this.character = character;
    }
    
    /**
     * Check if before another position
     */
    isBefore(other) {
        if (this.line < other.line) {
            return true;
        }
        if (this.line > other.line) {
            return false;
        }
        return this.character < other.character;
    }
    
    /**
     * Check if before or equal to another position
     */
    isBeforeOrEqual(other) {
        return this.isBefore(other) || this.isEqual(other);
    }
    
    /**
     * Check if after another position
     */
    isAfter(other) {
        return !this.isBeforeOrEqual(other);
    }
    
    /**
     * Check if after or equal to another position
     */
    isAfterOrEqual(other) {
        return !this.isBefore(other);
    }
    
    /**
     * Check if equal to another position
     */
    isEqual(other) {
        return this.line === other.line && this.character === other.character;
    }
    
    /**
     * Compare with another position
     */
    compareTo(other) {
        if (this.line < other.line) {
            return -1;
        }
        if (this.line > other.line) {
            return 1;
        }
        if (this.character < other.character) {
            return -1;
        }
        if (this.character > other.character) {
            return 1;
        }
        return 0;
    }
    
    /**
     * Create new position with offset
     */
    translate(lineDeltaOrChange, characterDelta) {
        if (typeof lineDeltaOrChange === 'object') {
            const change = lineDeltaOrChange;
            const lineDelta = change.lineDelta || 0;
            characterDelta = change.characterDelta || 0;
            
            return new Position(this.line + lineDelta, this.character + characterDelta);
        }
        
        return new Position(this.line + lineDeltaOrChange, this.character + (characterDelta || 0));
    }
    
    /**
     * Create new position with different line/character
     */
    with(lineOrChange, character) {
        if (typeof lineOrChange === 'object') {
            const change = lineOrChange;
            const line = change.line !== undefined ? change.line : this.line;
            character = change.character !== undefined ? change.character : this.character;
            
            return new Position(line, character);
        }
        
        const line = lineOrChange !== undefined ? lineOrChange : this.line;
        character = character !== undefined ? character : this.character;
        
        return new Position(line, character);
    }
    
    /**
     * Convert to string
     */
    toString() {
        return `(${this.line}, ${this.character})`;
    }
}

module.exports = Position;

