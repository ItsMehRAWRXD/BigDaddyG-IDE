/**
 * BigDaddyG IDE - VS Code Selection
 * Implements vscode.Selection class
 */

const Range = require('./Range');
const Position = require('./Position');

class Selection extends Range {
    constructor(anchorLineOrPosition, anchorCharacterOrActive, activeLine, activeCharacter) {
        if (typeof anchorLineOrPosition === 'number') {
            // Selection(anchorLine, anchorCharacter, activeLine, activeCharacter)
            super(anchorLineOrPosition, anchorCharacterOrActive, activeLine, activeCharacter);
            this.anchor = new Position(anchorLineOrPosition, anchorCharacterOrActive);
            this.active = new Position(activeLine, activeCharacter);
        } else {
            // Selection(anchor: Position, active: Position)
            super(anchorLineOrPosition, anchorCharacterOrActive);
            this.anchor = anchorLineOrPosition;
            this.active = anchorCharacterOrActive;
        }
        
        // Ensure start/end are correct based on anchor/active
        if (this.anchor.isBefore(this.active)) {
            this.start = this.anchor;
            this.end = this.active;
        } else {
            this.start = this.active;
            this.end = this.anchor;
        }
    }
    
    /**
     * Check if selection is reversed
     */
    get isReversed() {
        return this.anchor.isAfter(this.active);
    }
    
    /**
     * Convert to string
     */
    toString() {
        return `[anchor: ${this.anchor.toString()}, active: ${this.active.toString()}]`;
    }
}

module.exports = Selection;

