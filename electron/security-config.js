/**
 * Security Configuration
 * Centralized security settings and utilities
 */

class SecurityConfig {
    constructor() {
        this.cspPolicy = {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", "data:", "https:"],
            'connect-src': ["'self'", "ws:", "wss:", "http://localhost:*"],
            'font-src': ["'self'", "data:"],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"]
        };
        
        this.sanitizationRules = {
            allowedTags: ['b', 'i', 'em', 'strong', 'code', 'pre'],
            allowedAttributes: {},
            maxLength: 10000
        };
    }
    
    sanitizeInput(input, type = 'text') {
        if (!input) return '';
        
        let sanitized = String(input);
        
        // Length check
        if (sanitized.length > this.sanitizationRules.maxLength) {
            sanitized = sanitized.substring(0, this.sanitizationRules.maxLength);
        }
        
        // HTML escape
        sanitized = sanitized.replace(/[<>\"'&]/g, (match) => {
            const escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '&': '&amp;'
            };
            return escapeMap[match];
        });
        
        // Additional type-specific sanitization
        switch (type) {
            case 'number':
                const num = parseFloat(sanitized);
                return isNaN(num) ? 0 : Math.max(0, Math.min(1000000, num));
            case 'url':
                try {
                    const url = new URL(sanitized);
                    return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : '';
                } catch {
                    return '';
                }
            case 'filename':
                return sanitized.replace(/[^a-zA-Z0-9._-]/g, '');
            default:
                return sanitized;
        }
    }
    
    validateApiKey(key, provider) {
        if (!key || typeof key !== 'string') return false;
        
        const patterns = {
            openai: /^sk-[a-zA-Z0-9]{48}$/,
            anthropic: /^sk-ant-[a-zA-Z0-9-]{95}$/,
            google: /^[a-zA-Z0-9_-]{39}$/
        };
        
        return patterns[provider]?.test(key) || false;
    }
    
    generateCSPHeader() {
        return Object.entries(this.cspPolicy)
            .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
            .join('; ');
    }
    
    isSecureContext() {
        return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
    }
    
    logSecurityEvent(event, details = {}) {
        console.warn(`[Security] ${event}:`, details);
        
        // In production, send to security monitoring service
        if (process.env.NODE_ENV === 'production') {
            // Send to monitoring service
        }
    }
}

// Global instance
window.securityConfig = new SecurityConfig();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityConfig;
}