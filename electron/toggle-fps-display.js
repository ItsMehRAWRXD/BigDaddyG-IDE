/**
 * BigDaddyG IDE - Toggle FPS Display
 * 
 * Simple keyboard shortcut to hide/show FPS overlay
 * Press F3 to toggle
 */

(function() {
    let fpsHidden = false;
    
    // Add keyboard listener
    document.addEventListener('keydown', (e) => {
        // F3 to toggle FPS display
        if (e.key === 'F3') {
            toggleFPSDisplay();
            e.preventDefault();
        }
    });
    
    function toggleFPSDisplay() {
        const overlay = document.getElementById('performance-overlay');
        
        if (overlay) {
            fpsHidden = !fpsHidden;
            overlay.style.display = fpsHidden ? 'none' : 'block';
            
            // Show notification
            showToggleNotification(fpsHidden ? 'FPS Display Hidden (F3 to show)' : 'FPS Display Visible (F3 to hide)');
        }
    }
    
    function showToggleNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 212, 255, 0.9);
            color: #000;
            padding: 20px 40px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000000;
            animation: fadeInOut 2s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('[BigDaddyG] ⌨️ FPS toggle ready - Press F3 to hide/show');
})();

