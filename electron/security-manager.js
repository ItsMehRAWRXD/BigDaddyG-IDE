/**
 * BigDaddyG IDE - Security Manager
 * Comprehensive security features: CSP, CSRF, File Access Control
 */

const crypto = require('crypto');
const path = require('path');

class SecurityManager {
    constructor() {
        this.csrfTokens = new Map();
        this.allowedPaths = new Set();
        this.blockedPaths = new Set();
        this.sessionSecret = this.generateSecret();
        
        this.initializeDefaults();
        
        console.log('[SecurityManager] Initialized');
    }
    
    /**
     * Initialize default security settings
     */
    initializeDefaults() {
        // Default allowed paths
        this.allowedPaths.add(process.cwd());
        this.allowedPaths.add(path.join(process.cwd(), 'electron'));
        this.allowedPaths.add(path.join(process.cwd(), 'assets'));
        this.allowedPaths.add(path.join(process.cwd(), 'node_modules'));
        
        // Default blocked paths
        this.blockedPaths.add('/etc');
        this.blockedPaths.add('/sys');
        this.blockedPaths.add('/proc');
        this.blockedPaths.add('C:\\Windows\\System32');
    }
    
    // ========================
    // Content Security Policy
    // ========================
    
    /**
     * Get Content Security Policy headers
     */
    getCSP() {
        return {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'", // Required for Monaco Editor
                'https://cdn.jsdelivr.net'
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'",
                'https://cdn.jsdelivr.net'
            ],
            'img-src': [
                "'self'",
                'data:',
                'https:',
                'file:'
            ],
            'font-src': [
                "'self'",
                'data:',
                'https://cdn.jsdelivr.net'
            ],
            'connect-src': [
                "'self'",
                'http://localhost:*',
                'ws://localhost:*',
                'https://api.github.com'
            ],
            'media-src': ["'self'", 'data:'],
            'object-src': ["'none'"],
            'frame-src': ["'self'"],
            'worker-src': ["'self'", 'blob:'],
            'child-src': ["'self'", 'blob:']
        };
    }
    
    /**
     * Generate CSP header string
     */
    getCSPString() {
        const csp = this.getCSP();
        return Object.entries(csp)
            .map(([key, values]) => `${key} ${values.join(' ')}`)
            .join('; ');
    }
    
    /**
     * Apply CSP to webContents
     */
    applyCSP(webContents) {
        webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': [this.getCSPString()]
                }
            });
        });
        
        console.log('[SecurityManager] CSP applied');
    }
    
    // ========================
    // CSRF Protection
    // ========================
    
    /**
     * Generate CSRF token
     */
    generateCSRFToken(sessionId) {
        const token = crypto.randomBytes(32).toString('hex');
        const timestamp = Date.now();
        
        this.csrfTokens.set(sessionId, {
            token,
            timestamp,
            used: false
        });
        
        // Clean old tokens
        this.cleanOldTokens();
        
        return token;
    }
    
    /**
     * Validate CSRF token
     */
    validateCSRFToken(sessionId, token) {
        const stored = this.csrfTokens.get(sessionId);
        
        if (!stored) {
            console.warn('[SecurityManager] No CSRF token found for session');
            return false;
        }
        
        if (stored.used) {
            console.warn('[SecurityManager] CSRF token already used');
            return false;
        }
        
        if (stored.token !== token) {
            console.warn('[SecurityManager] Invalid CSRF token');
            return false;
        }
        
        // Check expiration (1 hour)
        const age = Date.now() - stored.timestamp;
        if (age > 3600000) {
            console.warn('[SecurityManager] CSRF token expired');
            return false;
        }
        
        // Mark as used
        stored.used = true;
        
        return true;
    }
    
    /**
     * Clean old CSRF tokens
     */
    cleanOldTokens() {
        const now = Date.now();
        const maxAge = 3600000; // 1 hour
        
        for (const [sessionId, data] of this.csrfTokens.entries()) {
            if (now - data.timestamp > maxAge) {
                this.csrfTokens.delete(sessionId);
            }
        }
    }
    
    /**
     * Generate session ID
     */
    generateSessionId() {
        return crypto.randomBytes(16).toString('hex');
    }
    
    // ========================
    // File Access Control
    // ========================
    
    /**
     * Check if path is allowed
     */
    isPathAllowed(filePath) {
        const normalized = path.normalize(filePath);
        
        // Check if blocked
        for (const blocked of this.blockedPaths) {
            if (normalized.startsWith(blocked)) {
                console.warn(`[SecurityManager] Blocked path: ${filePath}`);
                return false;
            }
        }
        
        // Check if allowed
        for (const allowed of this.allowedPaths) {
            if (normalized.startsWith(allowed)) {
                return true;
            }
        }
        
        console.warn(`[SecurityManager] Path not in allowed list: ${filePath}`);
        return false;
    }
    
    /**
     * Add allowed path
     */
    allowPath(filePath) {
        const normalized = path.normalize(filePath);
        this.allowedPaths.add(normalized);
        console.log(`[SecurityManager] Added allowed path: ${normalized}`);
    }
    
    /**
     * Remove allowed path
     */
    disallowPath(filePath) {
        const normalized = path.normalize(filePath);
        this.allowedPaths.delete(normalized);
    }
    
    /**
     * Add blocked path
     */
    blockPath(filePath) {
        const normalized = path.normalize(filePath);
        this.blockedPaths.add(normalized);
        console.log(`[SecurityManager] Added blocked path: ${normalized}`);
    }
    
    /**
     * Unblock path
     */
    unblockPath(filePath) {
        const normalized = path.normalize(filePath);
        this.blockedPaths.delete(normalized);
    }
    
    /**
     * Validate file operation
     */
    validateFileOperation(filePath, operation) {
        if (!this.isPathAllowed(filePath)) {
            throw new Error(`Access denied: ${operation} on ${filePath}`);
        }
        
        return true;
    }
    
    // ========================
    // Input Validation
    // ========================
    
    /**
     * Sanitize input
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    
    /**
     * Validate file path
     */
    validateFilePath(filePath) {
        // Prevent path traversal
        const normalized = path.normalize(filePath);
        
        if (normalized.includes('..')) {
            throw new Error('Path traversal not allowed');
        }
        
        return normalized;
    }
    
    // ========================
    // Encryption
    // ========================
    
    /**
     * Generate secret
     */
    generateSecret() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    /**
     * Encrypt data
     */
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.sessionSecret, 'hex'), iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    }
    
    /**
     * Decrypt data
     */
    decrypt(text) {
        const parts = text.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.sessionSecret, 'hex'), iv);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    /**
     * Hash password
     */
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }
    
    /**
     * Get security status
     */
    getStatus() {
        return {
            cspEnabled: true,
            csrfProtectionEnabled: true,
            fileAccessControlEnabled: true,
            allowedPaths: Array.from(this.allowedPaths),
            blockedPaths: Array.from(this.blockedPaths),
            activeCSRFTokens: this.csrfTokens.size
        };
    }
}

module.exports = SecurityManager;
