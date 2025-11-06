/**
 * Virtual Scroller - Render only visible items
 * 
 * Dramatically improves performance for large lists (chat, file explorer, etc.)
 * Only renders items in viewport + small buffer
 */

(function() {
'use strict';

class VirtualScroller {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container)
            : container;
        
        this.items = [];
        this.renderedItems = new Map();
        this.itemHeight = options.itemHeight || 60;
        this.buffer = options.buffer || 5; // Render 5 extra items above/below
        this.renderItem = options.renderItem || ((item) => `<div>${JSON.stringify(item)}</div>`);
        
        this.viewport = null;
        this.scrollbar = null;
        this.lastScrollTop = 0;
        
        if (!this.container) {
            console.error('[VirtualScroller] ❌ Container not found');
            return;
        }
        
        this.setup();
    }
    
    setup() {
        // Create viewport and scrollbar
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        
        this.viewport = document.createElement('div');
        this.viewport.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 15px;
            bottom: 0;
            overflow-y: auto;
            overflow-x: hidden;
        `;
        
        this.content = document.createElement('div');
        this.content.style.cssText = 'position: relative;';
        
        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);
        
        // Add scroll listener
        this.viewport.addEventListener('scroll', () => this.onScroll());
        
        console.log('[VirtualScroller] ✅ Virtual scroller initialized');
    }
    
    setItems(items) {
        this.items = items;
        this.render();
    }
    
    addItem(item) {
        this.items.push(item);
        this.render();
        this.scrollToBottom();
    }
    
    onScroll() {
        const scrollTop = this.viewport.scrollTop;
        
        // Only re-render if scrolled significantly
        if (Math.abs(scrollTop - this.lastScrollTop) > this.itemHeight) {
            this.lastScrollTop = scrollTop;
            this.render();
        }
    }
    
    render() {
        if (!this.items || this.items.length === 0) {
            this.content.innerHTML = '';
            return;
        }
        
        // Calculate visible range
        const scrollTop = this.viewport.scrollTop;
        const viewportHeight = this.viewport.clientHeight;
        
        const firstVisible = Math.floor(scrollTop / this.itemHeight);
        const lastVisible = Math.ceil((scrollTop + viewportHeight) / this.itemHeight);
        
        // Add buffer
        const startIndex = Math.max(0, firstVisible - this.buffer);
        const endIndex = Math.min(this.items.length, lastVisible + this.buffer);
        
        // Set content height to maintain scrollbar
        this.content.style.height = `${this.items.length * this.itemHeight}px`;
        
        // Clear old items outside visible range
        for (const [index, element] of this.renderedItems.entries()) {
            if (index < startIndex || index >= endIndex) {
                element.remove();
                this.renderedItems.delete(index);
            }
        }
        
        // Render visible items
        for (let i = startIndex; i < endIndex; i++) {
            if (!this.renderedItems.has(i)) {
                const item = this.items[i];
                const element = document.createElement('div');
                element.style.cssText = `
                    position: absolute;
                    top: ${i * this.itemHeight}px;
                    left: 0;
                    right: 0;
                    height: ${this.itemHeight}px;
                `;
                element.innerHTML = this.renderItem(item, i);
                
                this.content.appendChild(element);
                this.renderedItems.set(i, element);
            }
        }
        
        console.log(`[VirtualScroller] 📊 Rendered ${endIndex - startIndex}/${this.items.length} items`);
    }
    
    scrollToBottom() {
        requestAnimationFrame(() => {
            this.viewport.scrollTop = this.viewport.scrollHeight;
        });
    }
    
    scrollToIndex(index) {
        const scrollTop = index * this.itemHeight;
        this.viewport.scrollTop = scrollTop;
    }
    
    clear() {
        this.items = [];
        this.renderedItems.clear();
        this.content.innerHTML = '';
    }
    
    destroy() {
        this.clear();
        this.viewport.removeEventListener('scroll', this.onScroll);
        this.container.innerHTML = '';
        console.log('[VirtualScroller] 🗑️ Destroyed');
    }
}

// ============================================================================
// GLOBAL EXPOSURE
// ============================================================================

window.VirtualScroller = VirtualScroller;

// Helper to convert existing container to virtual scroller
window.createVirtualScroller = (containerSelector, options) => {
    return new VirtualScroller(containerSelector, options);
};

console.log('[VirtualScroller] 📦 Virtual scroller module loaded');
console.log('[VirtualScroller] 💡 Use for lists with 100+ items for massive performance boost');

})();

