/**
 * Collapsible Agent Sidebar
 * 
 * Manages the agent panel sidebar with collapse/expand functionality
 */

(function() {
'use strict';

class CollapsibleAgentSidebar {
    constructor() {
        this.isCollapsed = false;
        this.init();
    }
    
    init() {
        console.log('[AgentSidebar] 📦 Collapsible agent sidebar loaded');
        
        // Add collapse button to agent panel if it exists
        setTimeout(() => {
            const agentPanel = document.getElementById('agent-panel');
            if (agentPanel) {
                this.addCollapseButton(agentPanel);
            }
        }, 1000);
    }
    
    addCollapseButton(panel) {
        const header = panel.querySelector('h3') || panel.querySelector('[class*="header"]');
        if (!header) return;
        
        const btn = document.createElement('button');
        btn.textContent = '◀';
        btn.style.cssText = `
            background: rgba(119, 221, 190, 0.1);
            border: 1px solid var(--cursor-jade-light);
            color: var(--cursor-jade-dark);
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            float: right;
        `;
        btn.onclick = () => this.toggle();
        
        header.appendChild(btn);
        
        console.log('[AgentSidebar] ✅ Collapse button added');
    }
    
    toggle() {
        this.isCollapsed = !this.isCollapsed;
        
        const agentPanel = document.getElementById('agent-panel');
        if (!agentPanel) return;
        
        if (this.isCollapsed) {
            agentPanel.style.width = '50px';
            agentPanel.style.overflow = 'hidden';
        } else {
            agentPanel.style.width = '300px';
            agentPanel.style.overflow = 'auto';
        }
        
        console.log(`[AgentSidebar] ${this.isCollapsed ? '◀ Collapsed' : '▶ Expanded'}`);
    }
}

// Initialize
window.collapsibleAgentSidebar = new CollapsibleAgentSidebar();

})();
