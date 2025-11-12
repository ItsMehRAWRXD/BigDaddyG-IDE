/**
 * Real Notification System - NO ALERTS!
 * Toast notifications that don't block the UI
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }
    
    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }
    
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${this.getColor(type)};
            color: #fff;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            min-width: 300px;
            max-width: 500px;
            pointer-events: auto;
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
            border-left: 4px solid ${this.getBorderColor(type)};
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <span style="font-size: 20px;">${this.getIcon(type)}</span>
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${this.getTitle(type)}</div>
                    <div style="font-size: 13px; opacity: 0.9;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #fff; cursor: pointer; font-size: 18px; padding: 0; opacity: 0.7;">×</button>
            </div>
        `;
        
        this.container.appendChild(notification);
        this.notifications.push(notification);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    notification.remove();
                    this.notifications = this.notifications.filter(n => n !== notification);
                }, 300);
            }, duration);
        }
        
        // Click to dismiss
        notification.onclick = () => notification.remove();
        
        return notification;
    }
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
    
    getColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
            error: 'linear-gradient(135deg, #ff4757 0%, #cc3644 100%)',
            warning: 'linear-gradient(135deg, #ffa502 0%, #cc8400 100%)',
            info: 'linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)'
        };
        return colors[type] || colors.info;
    }
    
    getBorderColor(type) {
        const colors = {
            success: '#00ff88',
            error: '#ff4757',
            warning: '#ffa502',
            info: '#00d4ff'
        };
        return colors[type] || colors.info;
    }
    
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || titles.info;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize and expose globally
window.notify = new NotificationSystem();

console.log('[Notifications] ✅ System ready - NO MORE ALERTS!');
