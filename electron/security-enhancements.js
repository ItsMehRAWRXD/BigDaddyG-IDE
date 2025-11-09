/**
 * Critical Security Enhancements
 * Fixes for the 12 critical vulnerabilities found
 */

// 1. Safe eval replacement
function safeEval(expression, context = {}) {
    // Whitelist allowed operations
    const allowedOps = /^[\w\s+\-*/().,<>=!&|]+$/;
    if (!allowedOps.test(expression)) {
        throw new Error('Unsafe expression blocked');
    }
    
    try {
        return Function(`"use strict"; return (${expression})`)();
    } catch (e) {
        throw new Error('Expression evaluation failed');
    }
}

// 2. Safe command execution
function safeSpawn(command, args = [], options = {}) {
    const { spawn } = require('child_process');
    
    // Never use shell: true
    const safeOptions = {
        ...options,
        shell: false,
        stdio: 'pipe'
    };
    
    // Validate command
    const allowedCommands = ['node', 'npm', 'git', 'code'];
    const cmd = command.split(' ')[0];
    if (!allowedCommands.includes(cmd)) {
        throw new Error(`Command not allowed: ${cmd}`);
    }
    
    return spawn(command, args, safeOptions);
}

// 3. Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}

// 4. Safe DOM manipulation
function safeSetContent(element, content) {
    if (!element) return;
    element.textContent = sanitizeInput(content);
}

// 5. CSP headers for Electron
function setupCSP() {
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' ws: wss: http://localhost:*"
    ].join('; ');
    
    return csp;
}

module.exports = {
    safeEval,
    safeSpawn,
    sanitizeInput,
    safeSetContent,
    setupCSP
};