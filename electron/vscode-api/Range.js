/**
 * BigDaddyG IDE - VS Code Range
 * Implements vscode.Range class
 */

const Position = require('./Position');

class Range {
    constructor(startLineOrPosition, startCharacterOrEnd, endLine, endCharacter) {
        if (typeof startLineOrPosition === 'number') {
            // Range(startLine, startCharacter, endLine, endCharacter)
            this.start = new Position(startLineOrPosition, startCharacterOrEnd);
            this.end = new Position(endLine, endCharacter);
        } else {
            // Range(start: Position, end: Position)
            this.start = startLineOrPosition;
            this.end = startCharacterOrEnd;
        }
    }
    
    /**
     * Check if empty
     */
    get isEmpty() {
        return this.start.line === this.end.line && 
               this.start.character === this.end.character;
    }
    
    /**
     * Check if single line
     */
    get isSingleLine() {
        return this.start.line === this.end.line;
    }
    
    /**
     * Check if contains position
     */
    contains(positionOrRange) {
        if (positionOrRange instanceof Range) {
            return this.contains(positionOrRange.start) && 
                   this.contains(positionOrRange.end);
        }
        
        const position = positionOrRange;
        
        if (position.line < this.start.line || position.line > this.end.line) {
            return false;
        }
        
        if (position.line === this.start.line && position.character < this.start.character) {
            return false;
        }
        
        if (position.line === this.end.line && position.character > this.end.character) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if equal to another range
     */
    isEqual(other) {
        return this.start.isEqual(other.start) && this.end.isEqual(other.end);
    }
    
    /**
     * Get intersection with another range
     */
    intersection(other) {
        const start = this.start.isAfter(other.start) ? this.start : other.start;
        const end = this.end.isBefore(other.end) ? this.end : other.end;
        
        if (start.isAfterOrEqual(end)) {
            return undefined;
        }
        
        return new Range(start, end);
    }
    
    /**
     * Get union with another range
     */
    union(other) {
        const start = this.start.isBefore(other.start) ? this.start : other.start;
        const end = this.end.isAfter(other.end) ? this.end : other.end;
        
        return new Range(start, end);
    }
    
    /**
     * Create new range with different start/end
     */
    with(change) {
        const start = change.start !== undefined ? change.start : this.start;
        const end = change.end !== undefined ? change.end : this.end;
        
        return new Range(start, end);
    }
    
    /**
     * Convert to string
     */
    toString() {
        return `[${this.start.toString()}, ${this.end.toString()}]`;
    }
}

module.exports = Range;

