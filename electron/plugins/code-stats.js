/**
 * Code Statistics Plugin
 * Shows lines, characters, words in current file
 */

(function() {
'use strict';

// Register plugin when plugin system is ready
if (window.pluginSystem) {
    window.pluginSystem.registerPluginCode('code-stats', function(apis) {
        console.log('[CodeStats] 🎉 Plugin activated!');
        
        // Add status bar item
        let statsElement = null;
        
        function updateStats() {
            const code = apis.editor.getValue();
            
            if (!code) {
                if (statsElement) statsElement.textContent = '📊 No file';
                return;
            }
            
            const lines = code.split('\n').length;
            const chars = code.length;
            const words = code.split(/\s+/).filter(w => w.length > 0).length;
            
            const stats = `📊 Lines: ${lines} | Chars: ${chars} | Words: ${words}`;
            
            if (!statsElement) {
                // Create status bar item
                statsElement = document.createElement('div');
                statsElement.style.cssText = `
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background: rgba(119, 221, 190, 0.1);
                    border: 1px solid var(--cursor-jade-light);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    color: var(--cursor-jade-dark);
                    font-weight: 600;
                    z-index: 1000;
                    pointer-events: none;
                `;
                document.body.appendChild(statsElement);
            }
            
            statsElement.textContent = stats;
        }
        
        // Update on file change
        apis.plugin.on('editor:content:change', updateStats);
        
        // Update on file open
        apis.plugin.on('file:open', updateStats);
        
        // Initial update
        setTimeout(updateStats, 1000);
        
        // Update every 2 seconds
        const statsInterval = setInterval(updateStats, 2000);
        
        // Cleanup on unload
        window.addEventListener('beforeunload', () => {
            clearInterval(statsInterval);
        });
        
        console.log('[CodeStats] ✅ Status bar added');
    });
}

})();

