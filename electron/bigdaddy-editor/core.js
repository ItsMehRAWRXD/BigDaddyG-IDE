/**
 * BigDaddy Editor - Core Editor Engine
 * 
 * A high-performance, AI-native code editor built from scratch.
 * Replaces Monaco with something faster, lighter, and more powerful.
 * 
 * @author BigDaddyG IDE Team
 * @version 1.0.0
 * @license MIT
 */

/**
 * Piece Table - Efficient text buffer
 * 
 * Used by VS Code internally. Allows O(1) insert/delete operations.
 * Memory efficient - no full document copy on each edit.
 */
class PieceTable {
    constructor(original = '') {
        this.original = original;  // Original document (immutable)
        this.add = '';             // Added text buffer
        this.pieces = [];          // Array of pieces
        
        // Initial piece spans entire original
        if (original.length > 0) {
            this.pieces.push({
                source: 'original',
                start: 0,
                length: original.length
            });
        }
        
        // For undo/redo
        this.history = [];
        this.historyIndex = -1;
    }

    /**
     * Insert text at offset
     * O(log n) operation (binary search + array splice)
     */
    insert(offset, text) {
        if (!text || text.length === 0) return;
        
        // Save state for undo
        this.saveState();
        
        // Add text to 'add' buffer
        const addStart = this.add.length;
        this.add += text;
        
        // Handle empty buffer case
        if (this.pieces.length === 0) {
            this.pieces.push({
                source: 'add',
                start: addStart,
                length: text.length
            });
            return;
        }
        
        // Find piece containing offset
        let currentOffset = 0;
        let pieceIndex = 0;
        
        for (let i = 0; i < this.pieces.length; i++) {
            const piece = this.pieces[i];
            const pieceEnd = currentOffset + piece.length;
            
            if (offset >= currentOffset && offset <= pieceEnd) {
                pieceIndex = i;
                break;
            }
            
            currentOffset += piece.length;
        }
        
        const piece = this.pieces[pieceIndex];
        
        // Handle case where offset is beyond all pieces
        if (!piece) {
            this.pieces.push({
                source: 'add',
                start: addStart,
                length: text.length
            });
            return;
        }
        
        const offsetInPiece = offset - currentOffset;
        
        if (offsetInPiece === 0 && pieceIndex > 0) {
            // Insert at piece boundary (before)
            this.pieces.splice(pieceIndex, 0, {
                source: 'add',
                start: addStart,
                length: text.length
            });
        } else if (offsetInPiece === piece.length) {
            // Insert at piece boundary (after)
            this.pieces.splice(pieceIndex + 1, 0, {
                source: 'add',
                start: addStart,
                length: text.length
            });
        } else {
            // Split piece in middle
            const leftPiece = {
                source: piece.source,
                start: piece.start,
                length: offsetInPiece
            };
            
            const newPiece = {
                source: 'add',
                start: addStart,
                length: text.length
            };
            
            const rightPiece = {
                source: piece.source,
                start: piece.start + offsetInPiece,
                length: piece.length - offsetInPiece
            };
            
            this.pieces.splice(pieceIndex, 1, leftPiece, newPiece, rightPiece);
        }
    }

    /**
     * Delete text from offset to offset+length
     * O(log n) operation
     */
    delete(offset, length) {
        if (length === 0) return;
        
        this.saveState();
        
        // Find and remove pieces in range
        let currentOffset = 0;
        let deleteStart = offset;
        let deleteEnd = offset + length;
        
        const newPieces = [];
        
        for (const piece of this.pieces) {
            const pieceStart = currentOffset;
            const pieceEnd = currentOffset + piece.length;
            
            if (pieceEnd <= deleteStart || pieceStart >= deleteEnd) {
                // Piece is outside delete range
                newPieces.push(piece);
            } else if (pieceStart >= deleteStart && pieceEnd <= deleteEnd) {
                // Piece is fully inside delete range - skip it
                continue;
            } else if (pieceStart < deleteStart && pieceEnd > deleteEnd) {
                // Delete range is inside piece - split into left and right
                const leftLength = deleteStart - pieceStart;
                const rightStart = piece.start + (deleteEnd - pieceStart);
                const rightLength = pieceEnd - deleteEnd;
                
                newPieces.push({
                    source: piece.source,
                    start: piece.start,
                    length: leftLength
                });
                
                newPieces.push({
                    source: piece.source,
                    start: rightStart,
                    length: rightLength
                });
            } else if (pieceStart < deleteStart) {
                // Delete range overlaps right side of piece
                const newLength = deleteStart - pieceStart;
                newPieces.push({
                    source: piece.source,
                    start: piece.start,
                    length: newLength
                });
            } else {
                // Delete range overlaps left side of piece
                const deletedFromPiece = deleteEnd - pieceStart;
                const newStart = piece.start + deletedFromPiece;
                const newLength = piece.length - deletedFromPiece;
                newPieces.push({
                    source: piece.source,
                    start: newStart,
                    length: newLength
                });
            }
            
            currentOffset += piece.length;
        }
        
        this.pieces = newPieces;
    }

    /**
     * Get text in range
     * Lazy evaluation - only construct when needed
     */
    getText(start = 0, end = null) {
        if (end === null) {
            end = this.getLength();
        }
        
        let result = '';
        let currentOffset = 0;
        
        for (const piece of this.pieces) {
            const pieceEnd = currentOffset + piece.length;
            
            if (pieceEnd <= start) {
                currentOffset += piece.length;
                continue;
            }
            
            if (currentOffset >= end) {
                break;
            }
            
            const buffer = piece.source === 'original' ? this.original : this.add;
            const pieceStart = Math.max(0, start - currentOffset);
            const pieceEndInBuffer = Math.min(piece.length, end - currentOffset);
            
            result += buffer.substring(
                piece.start + pieceStart,
                piece.start + pieceEndInBuffer
            );
            
            currentOffset += piece.length;
        }
        
        return result;
    }

    /**
     * Get line at index
     */
    getLine(lineNumber) {
        const lines = this.getLines();
        return lines[lineNumber] || null;
    }

    /**
     * Get all lines
     */
    getLines() {
        return this.getText().split('\n');
    }

    /**
     * Get total length
     */
    getLength() {
        return this.pieces.reduce((sum, piece) => sum + piece.length, 0);
    }

    /**
     * Save state for undo
     */
    saveState() {
        // Remove any history after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Save current state
        this.history.push({
            pieces: JSON.parse(JSON.stringify(this.pieces)),
            add: this.add
        });
        
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > 100) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    /**
     * Undo last operation
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.pieces = JSON.parse(JSON.stringify(state.pieces));
            this.add = state.add;
            return true;
        }
        return false;
    }

    /**
     * Redo last undone operation
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.pieces = JSON.parse(JSON.stringify(state.pieces));
            this.add = state.add;
            return true;
        }
        return false;
    }
}

/**
 * BigDaddy Editor - Main Class
 */
class BigDaddyEditor {
    constructor(container, options = {}) {
        // Handle both old and new API
        if (typeof container === 'object' && container.container) {
            // Old API: BigDaddyEditor({container: el, ...})
            options = container;
            this.container = options.container;
        } else {
            // New API: BigDaddyEditor(el, {...})
            this.container = container;
        }
        
        if (!this.container) {
            throw new Error('BigDaddyEditor: container element is required');
        }
        
        this.options = Object.assign({
            language: 'javascript',
            theme: 'bigdaddy-dark',
            fontSize: 14,
            fontFamily: 'Fira Code, Consolas, monospace',
            lineHeight: 20,
            tabSize: 4,
            ai: {
                enabled: true,
                provider: 'bigdaddya',
                autocomplete: true,
                inlineEdits: true
            },
            gamedev: {
                shaderPreview: false,
                nodeEditor: false,
                assetPreview: false
            }
        }, options);

        // Initialize text buffer
        this.buffer = new PieceTable(options.value || '');
        
        // Cursor position
        this.cursor = { line: 0, column: 0 };
        this.selections = [];
        
        // Viewport
        this.topLine = 0;
        this.leftColumn = 0;
        this.visibleLines = 0;
        this.visibleColumns = 0;
        
        // Event listeners
        this.listeners = new Map();
        
        // Initialize renderer
        this.initializeRenderer();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        console.log('[BigDaddyEditor] Initialized successfully');
    }

    /**
     * Initialize Canvas renderer
     */
    initializeRenderer() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.cursor = 'text';
        this.canvas.style.outline = 'none';
        this.canvas.tabIndex = 0;
        
        this.container.appendChild(this.canvas);
        
        // Get 2D context (faster than WebGL for text)
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,
            desynchronized: true // Hint for better performance
        });
        
        // Initialize charWidth and lineHeight to defaults
        this.charWidth = 8;  // Temporary, will be measured
        this.lineHeight = this.options.lineHeight;
        
        // Handle high DPI displays
        this.updateCanvasSize();
        
        // Measure font metrics (updates charWidth with actual value)
        this.measureFont();
        
        // Update canvas size again with correct charWidth
        this.updateCanvasSize();
        
        // Initial render
        this.render();
    }

    /**
     * Update canvas size for high DPI
     */
    updateCanvasSize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Calculate visible lines/columns
        this.visibleLines = Math.ceil(rect.height / this.options.lineHeight) + 1;
        this.visibleColumns = Math.ceil(rect.width / this.charWidth) + 1;
    }

    /**
     * Measure font metrics
     */
    measureFont() {
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        const metrics = this.ctx.measureText('M');
        this.charWidth = metrics.width;
        this.lineHeight = this.options.lineHeight;
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Keyboard
        this.canvas.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.canvas.addEventListener('keypress', (e) => this.handleKeyPress(e));
        
        // Mouse
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Focus
        this.canvas.addEventListener('focus', () => this.render());
        this.canvas.addEventListener('blur', () => this.render());
        
        // Resize
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
            this.render();
        });
    }

    /**
     * Main render loop
     */
    render() {
        const startTime = performance.now();
        
        // Clear canvas
        const rect = this.container.getBoundingClientRect();
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        
        // Render line numbers
        this.renderLineNumbers();
        
        // Render text lines
        this.renderLines();
        
        // Render cursor
        this.renderCursor();
        
        // Render scrollbars (if needed)
        this.renderScrollbars();
        
        const renderTime = performance.now() - startTime;
        
        // Display FPS in corner
        this.ctx.fillStyle = '#888';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(`${(1000 / renderTime).toFixed(1)} FPS (${renderTime.toFixed(2)}ms)`, rect.width - 120, 15);
        
        // Emit render event
        this.emit('render', { renderTime });
    }

    /**
     * Render line numbers
     */
    renderLineNumbers() {
        const lineNumberWidth = 50;
        const lines = this.buffer.getLines();
        
        this.ctx.fillStyle = '#252526';
        this.ctx.fillRect(0, 0, lineNumberWidth, this.canvas.height);
        
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        this.ctx.fillStyle = '#858585';
        this.ctx.textAlign = 'right';
        
        for (let i = 0; i < this.visibleLines; i++) {
            const lineNumber = this.topLine + i;
            if (lineNumber >= lines.length) break;
            
            const y = i * this.lineHeight + this.lineHeight - 4;
            this.ctx.fillText((lineNumber + 1).toString(), lineNumberWidth - 10, y);
        }
        
        this.ctx.textAlign = 'left';
    }

    /**
     * Render text lines
     */
    renderLines() {
        const lineNumberWidth = 50;
        const lines = this.buffer.getLines();
        
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        this.ctx.fillStyle = '#d4d4d4';
        
        for (let i = 0; i < this.visibleLines; i++) {
            const lineNumber = this.topLine + i;
            if (lineNumber >= lines.length) break;
            
            const line = lines[lineNumber] || '';
            const y = i * this.lineHeight + this.lineHeight - 4;
            const x = lineNumberWidth + 10 - (this.leftColumn * this.charWidth);
            
            // Simple rendering (syntax highlighting will be added via Web Worker)
            if (line) {
                this.ctx.fillText(line, x, y);
            }
        }
    }

    /**
     * Render cursor
     */
    renderCursor() {
        if (!this.canvas.matches(':focus')) return;
        
        const lineNumberWidth = 50;
        const x = lineNumberWidth + 10 + (this.cursor.column - this.leftColumn) * this.charWidth;
        const y = (this.cursor.line - this.topLine) * this.lineHeight;
        
        // Blinking cursor effect
        const blink = Math.floor(Date.now() / 500) % 2;
        if (blink) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x, y, 2, this.lineHeight);
        }
        
        // Schedule next frame for blink
        setTimeout(() => this.render(), 500);
    }

    /**
     * Render scrollbars
     */
    renderScrollbars() {
        const lines = this.buffer.getLines();
        const rect = this.container.getBoundingClientRect();
        
        // Vertical scrollbar
        if (lines.length > this.visibleLines) {
            const scrollbarWidth = 10;
            const scrollbarHeight = (this.visibleLines / lines.length) * rect.height;
            const scrollbarY = (this.topLine / lines.length) * rect.height;
            
            this.ctx.fillStyle = '#424242';
            this.ctx.fillRect(rect.width - scrollbarWidth, 0, scrollbarWidth, rect.height);
            
            this.ctx.fillStyle = '#686868';
            this.ctx.fillRect(rect.width - scrollbarWidth, scrollbarY, scrollbarWidth, scrollbarHeight);
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        const lines = this.buffer.getLines();
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.cursor.line = Math.max(0, this.cursor.line - 1);
                this.ensureCursorVisible();
                this.render();
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.cursor.line = Math.min(lines.length - 1, this.cursor.line + 1);
                this.ensureCursorVisible();
                this.render();
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                if (this.cursor.column > 0) {
                    this.cursor.column--;
                } else if (this.cursor.line > 0) {
                    this.cursor.line--;
                    this.cursor.column = lines[this.cursor.line].length;
                }
                this.ensureCursorVisible();
                this.render();
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                const currentLine = lines[this.cursor.line] || '';
                if (this.cursor.column < currentLine.length) {
                    this.cursor.column++;
                } else if (this.cursor.line < lines.length - 1) {
                    this.cursor.line++;
                    this.cursor.column = 0;
                }
                this.ensureCursorVisible();
                this.render();
                break;
                
            case 'Backspace':
                e.preventDefault();
                this.handleBackspace();
                break;
                
            case 'Delete':
                e.preventDefault();
                this.handleDelete();
                break;
                
            case 'Enter':
                e.preventDefault();
                this.handleEnter();
                break;
                
            case 'Tab':
                e.preventDefault();
                this.handleTab();
                break;
                
            case 'z':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                }
                break;
        }
    }

    handleKeyPress(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key.length !== 1) return;
        
        e.preventDefault();
        this.insertText(e.key);
    }

    /**
     * Insert text at cursor
     */
    insertText(text) {
        if (!text || text.length === 0) return;
        
        const offset = this.getOffsetFromPosition(this.cursor);
        this.buffer.insert(offset, text);
        
        // Update cursor position
        const lines = text.split('\n');
        if (lines.length > 1) {
            // Multi-line insert
            this.cursor.line += lines.length - 1;
            this.cursor.column = lines[lines.length - 1].length;
        } else {
            // Single line insert
            this.cursor.column += text.length;
        }
        
        this.emit('change', { type: 'insert', text, offset });
        this.render();
    }

    /**
     * Handle backspace
     */
    handleBackspace() {
        if (this.cursor.column > 0) {
            const offset = this.getOffsetFromPosition(this.cursor) - 1;
            this.buffer.delete(offset, 1);
            this.cursor.column--;
        } else if (this.cursor.line > 0) {
            const prevLine = this.buffer.getLine(this.cursor.line - 1);
            const offset = this.getOffsetFromPosition(this.cursor) - 1;
            this.buffer.delete(offset, 1);
            this.cursor.line--;
            this.cursor.column = prevLine ? prevLine.length : 0;
        }
        this.emit('change', { type: 'delete' });
        this.render();
    }

    /**
     * Handle delete
     */
    handleDelete() {
        const offset = this.getOffsetFromPosition(this.cursor);
        const lines = this.buffer.getLines();
        const currentLine = lines[this.cursor.line] || '';
        
        if (this.cursor.column < currentLine.length || this.cursor.line < lines.length - 1) {
            this.buffer.delete(offset, 1);
            this.emit('change', { type: 'delete' });
            this.render();
        }
    }

    /**
     * Handle enter
     */
    handleEnter() {
        this.insertText('\n');
        this.cursor.line++;
        this.cursor.column = 0;
        this.ensureCursorVisible();
    }

    /**
     * Handle tab
     */
    handleTab() {
        const spaces = ' '.repeat(this.options.tabSize);
        this.insertText(spaces);
    }

    /**
     * Handle mouse events
     */
    handleMouseDown(e) {
        const pos = this.getPositionFromMouse(e);
        this.cursor = pos;
        this.canvas.focus();
        this.render();
    }

    handleMouseMove(e) {
        // Handle selection (TODO)
    }

    handleMouseUp(e) {
        // Handle selection (TODO)
    }

    handleWheel(e) {
        e.preventDefault();
        
        const delta = Math.sign(e.deltaY);
        const lines = this.buffer.getLines();
        
        this.topLine = Math.max(0, Math.min(
            lines.length - this.visibleLines + 1,
            this.topLine + delta * 3
        ));
        
        this.render();
    }

    /**
     * Ensure cursor is visible
     */
    ensureCursorVisible() {
        // Vertical scrolling
        if (this.cursor.line < this.topLine) {
            this.topLine = this.cursor.line;
        } else if (this.cursor.line >= this.topLine + this.visibleLines - 1) {
            this.topLine = this.cursor.line - this.visibleLines + 2;
        }
        
        // Horizontal scrolling
        if (this.cursor.column < this.leftColumn) {
            this.leftColumn = this.cursor.column;
        } else if (this.cursor.column >= this.leftColumn + this.visibleColumns - 5) {
            this.leftColumn = this.cursor.column - this.visibleColumns + 10;
        }
    }

    /**
     * Convert mouse position to editor position
     */
    getPositionFromMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const lineNumberWidth = 50;
        
        const x = e.clientX - rect.left - lineNumberWidth - 10;
        const y = e.clientY - rect.top;
        
        const line = Math.max(0, Math.floor(y / this.lineHeight) + this.topLine);
        const column = Math.max(0, Math.floor(x / this.charWidth) + this.leftColumn);
        
        const lines = this.buffer.getLines();
        const actualLine = Math.min(line, lines.length - 1);
        const actualColumn = Math.min(column, (lines[actualLine] || '').length);
        
        return { line: actualLine, column: actualColumn };
    }

    /**
     * Convert position to buffer offset
     */
    getOffsetFromPosition(pos) {
        const lines = this.buffer.getLines();
        let offset = 0;
        
        for (let i = 0; i < pos.line && i < lines.length; i++) {
            offset += (lines[i] || '').length + 1; // +1 for newline
        }
        
        offset += pos.column;
        return offset;
    }

    /**
     * Public API
     */

    getValue() {
        return this.buffer.getText();
    }

    setValue(text) {
        this.buffer = new PieceTable(text);
        this.cursor = { line: 0, column: 0 };
        this.topLine = 0;
        this.leftColumn = 0;
        this.render();
    }

    getCursor() {
        return { ...this.cursor };
    }

    setCursor(pos) {
        this.cursor = pos;
        this.ensureCursorVisible();
        this.render();
    }

    undo() {
        if (this.buffer.undo()) {
            this.render();
            this.emit('change', { type: 'undo' });
        }
    }

    redo() {
        if (this.buffer.redo()) {
            this.render();
            this.emit('change', { type: 'redo' });
        }
    }

    /**
     * Event system
     */

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            for (const callback of this.listeners.get(event)) {
                callback(data);
            }
        }
    }

    /**
     * Destroy editor
     */
    destroy() {
        this.canvas.remove();
        this.listeners.clear();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BigDaddyEditor, PieceTable };
}
