/**
 * BigDaddyG IDE - Welcome Tab
 * Auto-opens on first launch to help new users get started
 */

(function() {
'use strict';

class WelcomeTab {
    constructor() {
        this.storageKey = 'bigdaddyg-welcome-shown';
        this.init();
    }
    
    init() {
        // Check if this is first launch
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkAndShow());
        } else {
            this.checkAndShow();
        }
        
        console.log('[WelcomeTab] ✅ Welcome tab module loaded');
    }
    
    checkAndShow() {
        const hasSeenWelcome = localStorage.getItem(this.storageKey);
        
        if (!hasSeenWelcome) {
            // First launch - show welcome
            console.log('[WelcomeTab] 🌟 First launch detected, showing welcome tab');
            setTimeout(() => this.show(), 1000); // Delay 1s to let IDE load
        } else {
            console.log('[WelcomeTab] ℹ️ Welcome already shown, skipping');
        }
    }
    
    async show() {
        console.log('[WelcomeTab] 📖 Opening welcome tab...');
        
        try {
            // Load welcome.md content
            const response = await fetch('welcome.md');
            if (!response.ok) {
                throw new Error(`Failed to load welcome.md: ${response.statusText}`);
            }
            
            const markdown = await response.text();
            
            // Convert markdown to HTML
            const html = this.markdownToHtml(markdown);
            
            // Create welcome tab
            if (window.tabSystem && typeof window.tabSystem.createTab === 'function') {
                const content = `
                    <div style="max-width: 900px; margin: 0 auto; padding: 30px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${html}
                        
                        <div style="position: sticky; bottom: 0; background: var(--cursor-bg); padding: 20px 0; border-top: 2px solid var(--cursor-border); margin-top: 40px; display: flex; justify-content: space-between; align-items: center;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--cursor-text-secondary); font-size: 13px;">
                                <input type="checkbox" id="dont-show-again" style="cursor: pointer;">
                                <span>Don't show this again</span>
                            </label>
                            <div style="display: flex; gap: 10px;">
                                <button onclick="window.welcomeTab.showAgain()" style="padding: 10px 20px; background: var(--cursor-bg-secondary); color: var(--cursor-text); border: 1px solid var(--cursor-border); border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">
                                    Show Again Later
                                </button>
                                <button onclick="window.welcomeTab.close()" style="padding: 10px 20px; background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent)); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 2px 8px rgba(119, 221, 190, 0.3);">
                                    Get Started! 🚀
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                window.tabSystem.createTab('Welcome', '🌟', content, 'welcome');
                console.log('[WelcomeTab] ✅ Welcome tab opened successfully');
            } else {
                console.warn('[WelcomeTab] ⚠️ TabSystem not available, cannot create welcome tab');
            }
        } catch (error) {
            console.error('[WelcomeTab] ❌ Failed to show welcome tab:', error);
        }
    }
    
    close() {
        const checkbox = document.getElementById('dont-show-again');
        if (checkbox && checkbox.checked) {
            localStorage.setItem(this.storageKey, 'true');
            console.log('[WelcomeTab] ✅ Welcome dismissed permanently');
        } else {
            console.log('[WelcomeTab] ℹ️ Welcome closed (will show again on next launch)');
        }
        
        // Close the welcome tab
        if (window.tabSystem && typeof window.tabSystem.closeTab === 'function') {
            // Find welcome tab ID
            const welcomeTab = Array.from(document.querySelectorAll('.editor-tab')).find(tab => 
                tab.textContent.includes('Welcome')
            );
            if (welcomeTab) {
                const tabId = welcomeTab.getAttribute('data-tab-id');
                if (tabId) {
                    window.tabSystem.closeTab(tabId);
                }
            }
        }
    }
    
    showAgain() {
        console.log('[WelcomeTab] ℹ️ Welcome will show again on next launch');
        // Just close the tab without setting the "don't show" flag
        if (window.tabSystem && typeof window.tabSystem.closeTab === 'function') {
            const welcomeTab = Array.from(document.querySelectorAll('.editor-tab')).find(tab => 
                tab.textContent.includes('Welcome')
            );
            if (welcomeTab) {
                const tabId = welcomeTab.getAttribute('data-tab-id');
                if (tabId) {
                    window.tabSystem.closeTab(tabId);
                }
            }
        }
    }
    
    reset() {
        // For debugging: reset the welcome flag
        localStorage.removeItem(this.storageKey);
        console.log('[WelcomeTab] 🔄 Welcome flag reset - will show on next launch');
    }
    
    markdownToHtml(markdown) {
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3 style="color: var(--cursor-jade-dark); margin-top: 24px; margin-bottom: 12px; font-size: 18px;">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 style="color: var(--cursor-accent); margin-top: 32px; margin-bottom: 16px; font-size: 24px; border-bottom: 2px solid var(--cursor-border); padding-bottom: 8px;">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 style="color: var(--cursor-jade-dark); margin-bottom: 20px; font-size: 36px; text-align: center; background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">$1</h1>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--cursor-jade-dark);">$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Code blocks
        html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(119, 221, 190, 0.1); padding: 2px 6px; border-radius: 4px; font-family: \'Courier New\', monospace; color: var(--cursor-jade-dark);">$1</code>');
        
        // Lists
        html = html.replace(/^\- (.*$)/gim, '<li style="margin: 6px 0; color: var(--cursor-text);">$1</li>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin: 6px 0; color: var(--cursor-text);">$1</li>');
        
        // Wrap lists in ul/ol
        html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, match => {
            if (match.includes('1.')) {
                return '<ol style="margin: 12px 0; padding-left: 24px;">' + match + '</ol>';
            } else {
                return '<ul style="margin: 12px 0; padding-left: 24px;">' + match + '</ul>';
            }
        });
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--cursor-accent); text-decoration: none; border-bottom: 1px solid var(--cursor-accent);">$1</a>');
        
        // Horizontal rules
        html = html.replace(/^---$/gim, '<hr style="border: none; border-top: 2px solid var(--cursor-border); margin: 24px 0;">');
        
        // Tables
        html = html.replace(/\|(.+)\|/g, match => {
            const cells = match.split('|').filter(cell => cell.trim());
            const cellHtml = cells.map(cell => 
                `<td style="padding: 10px; border: 1px solid var(--cursor-border); color: var(--cursor-text);">${cell.trim()}</td>`
            ).join('');
            return `<tr>${cellHtml}</tr>`;
        });
        html = html.replace(/(<tr>.*?<\/tr>\n?)+/gs, match => 
            `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: var(--cursor-bg-secondary); border-radius: 8px; overflow: hidden;">${match}</table>`
        );
        
        // Paragraphs
        html = html.replace(/^(?!<[hlu]|<\/[hlu]|<table|<div|<hr)(.+)$/gim, '<p style="margin: 12px 0; color: var(--cursor-text); line-height: 1.6;">$1</p>');
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }
}

// Initialize
window.welcomeTab = new WelcomeTab();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WelcomeTab;
}

console.log('[WelcomeTab] 📦 Welcome tab module loaded');

})();
