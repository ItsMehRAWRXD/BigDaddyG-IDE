/**
 * BigDaddy Editor - Minimap
 * 
 * Code overview minimap with semantic highlighting.
 * Shows entire document structure at a glance.
 * 
 * @author BigDaddyG IDE Team
 * @version 1.0.0
 */

class Minimap {
    constructor(editor) {
        this.editor = editor;
        this.canvas = null;
        this.ctx = null;
        this.width = 120;
        this.enabled = true;
        
        this.createCanvas();
        console.log('[Minimap] Initialized');
    }

    /**
     * Create minimap canvas
     */
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.right = '0';
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = '100%';
        this.canvas.style.cursor = 'pointer';
        this.canvas.style.background = 'rgba(30, 30, 30, 0.8)';
        this.canvas.style.borderLeft = '1px solid #3e3e42';
        
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Handle clicks
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    }

    /**
     * Render minimap
     */
    render(container) {
        if (!this.enabled) return;

        // Update canvas size
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        // Clear
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.width, rect.height);

        // Get all lines
        const lines = this.editor.buffer.getLines();
        const totalLines = lines.length;
        
        if (totalLines === 0) return;

        // Calculate scale
        const lineHeight = rect.height / totalLines;
        const charWidth = 1;

        // Render lines
        for (let i = 0; i < totalLines; i++) {
            const line = lines[i];
            const y = i * lineHeight;
            
            // Render line as colored blocks
            this.renderMinimapLine(line, y, lineHeight, charWidth);
        }

        // Render viewport indicator
        this.renderViewport(rect.height, totalLines);

        // Add to container if not already added
        if (!this.canvas.parentNode) {
            container.appendChild(this.canvas);
        }
    }

    /**
     * Render single line in minimap
     */
    renderMinimapLine(line, y, height, charWidth) {
        if (!line || line.trim().length === 0) return;

        // Simple color coding based on content
        let color = '#404040'; // Default

        if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
            color = '#6a9955'; // Comment
        } else if (line.includes('function') || line.includes('class') || line.includes('def')) {
            color = '#dcdcaa'; // Function/Class
        } else if (line.includes('if') || line.includes('for') || line.includes('while')) {
            color = '#569cd6'; // Control flow
        } else if (line.includes('import') || line.includes('from') || line.includes('require')) {
            color = '#c586c0'; // Import
        } else if (line.match(/['"`]/)) {
            color = '#ce9178'; // String
        }

        // Draw line as rectangle
        this.ctx.fillStyle = color;
        const lineWidth = Math.min(this.width - 10, line.length * charWidth);
        this.ctx.fillRect(5, y, lineWidth, Math.max(1, height));
    }

    /**
     * Render viewport indicator
     */
    renderViewport(containerHeight, totalLines) {
        const topLine = this.editor.topLine;
        const visibleLines = this.editor.visibleLines;
        
        const lineHeight = containerHeight / totalLines;
        const viewportY = topLine * lineHeight;
        const viewportHeight = visibleLines * lineHeight;

        // Draw viewport box
        this.ctx.strokeStyle = '#007acc';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, viewportY, this.width, viewportHeight);
        
        // Draw semi-transparent fill
        this.ctx.fillStyle = 'rgba(0, 122, 204, 0.2)';
        this.ctx.fillRect(0, viewportY, this.width, viewportHeight);
    }

    /**
     * Handle minimap click
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        
        // Calculate which line was clicked
        const totalLines = this.editor.buffer.getLines().length;
        const lineHeight = rect.height / totalLines;
        const targetLine = Math.floor(y / lineHeight);
        
        // Scroll to that line
        this.editor.topLine = Math.max(0, targetLine - Math.floor(this.editor.visibleLines / 2));
        this.editor.render();
        
        console.log('[Minimap] Jumped to line', targetLine);
    }

    /**
     * Handle minimap drag
     */
    handleMouseDown(e) {
        const handleMouseMove = (e) => {
            this.handleClick(e);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    /**
     * Toggle minimap
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (!this.enabled && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        } else if (this.enabled) {
            this.render(this.editor.container);
        }
    }

    /**
     * Destroy minimap
     */
    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minimap;
}
