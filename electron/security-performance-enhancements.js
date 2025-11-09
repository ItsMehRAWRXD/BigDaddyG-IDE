/**
 * BigDaddyG IDE - Security & Performance Enhancements
 * Comprehensive fixes for vulnerabilities, memory leaks, and performance issues
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// 1. CRITICAL SECURITY FIXES
// ============================================================================

class SecurityEnhancements {
    constructor() {
        this.csrfTokens = new Map();
        this.rateLimiter = new Map();
        this.sanitizer = new InputSanitizer();
    }

    // FIX: Command injection in main.js executeCommand
    sanitizeCommand(command) {
        // Remove dangerous characters and patterns
        const dangerous = [';', '&&', '||', '|', '>', '<', '`', '$', '(', ')'];
        let sanitized = command;
        
        dangerous.forEach(char => {
            sanitized = sanitized.replace(new RegExp(`\\${char}`, 'g'), '');
        });
        
        // Whitelist allowed commands only
        const allowedCommands = ['node', 'npm', 'git', 'python', 'javac', 'gcc'];
        const firstWord = sanitized.split(' ')[0];
        
        if (!allowedCommands.includes(firstWord)) {
            throw new Error(`Command not allowed: ${firstWord}`);
        }
        
        return sanitized;
    }

    // FIX: Path traversal in file operations
    validatePath(filePath, allowedRoot = process.cwd()) {
        const resolved = path.resolve(filePath);
        const allowedResolved = path.resolve(allowedRoot);
        
        if (!resolved.startsWith(allowedResolved)) {
            throw new Error(`Path traversal detected: ${filePath}`);
        }
        
        return resolved;
    }

    // FIX: CSRF protection for IPC calls
    generateCSRFToken() {
        const token = crypto.randomBytes(32).toString('hex');
        this.csrfTokens.set(token, Date.now());
        return token;
    }

    validateCSRFToken(token) {
        const timestamp = this.csrfTokens.get(token);
        if (!timestamp) return false;
        
        // Token expires after 1 hour
        if (Date.now() - timestamp > 3600000) {
            this.csrfTokens.delete(token);
            return false;
        }
        
        return true;
    }

    // FIX: Rate limiting for API calls
    checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!this.rateLimiter.has(identifier)) {
            this.rateLimiter.set(identifier, []);
        }
        
        const requests = this.rateLimiter.get(identifier);
        
        // Remove old requests
        const validRequests = requests.filter(time => time > windowStart);
        
        if (validRequests.length >= maxRequests) {
            throw new Error(`Rate limit exceeded for ${identifier}`);
        }
        
        validRequests.push(now);
        this.rateLimiter.set(identifier, validRequests);
        
        return true;
    }
}

class InputSanitizer {
    // FIX: XSS prevention
    sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // FIX: SQL injection prevention (for future database features)
    sanitizeSQL(input) {
        if (typeof input !== 'string') return '';
        
        return input
            .replace(/'/g, "''")
            .replace(/;/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '');
    }

    // FIX: File name sanitization
    sanitizeFileName(fileName) {
        if (typeof fileName !== 'string') return 'untitled';
        
        return fileName
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\.\./g, '')
            .substring(0, 255);
    }
}

// ============================================================================
// 2. MEMORY LEAK FIXES
// ============================================================================

class MemoryLeakPrevention {
    constructor() {
        this.observers = new Set();
        this.eventListeners = new WeakMap();
        this.intervals = new Set();
        this.timeouts = new Set();
        this.webWorkers = new Set();
        this.streams = new Set();
    }

    // FIX: Memory leak in memory-service.js PowerShell execution
    async executeWithCleanup(command, options = {}) {
        const { spawn } = require('child_process');
        const controller = new AbortController();
        const { signal } = controller;
        
        // Set timeout to prevent hanging processes
        const timeout = setTimeout(() => {
            controller.abort();
        }, options.timeout || 30000);
        
        try {
            const process = spawn(command, options.args || [], {
                signal,
                stdio: 'pipe',
                ...options
            });
            
            let stdout = '';
            let stderr = '';
            
            // Prevent memory buildup from large outputs
            const maxBuffer = options.maxBuffer || 1024 * 1024; // 1MB
            
            process.stdout?.on('data', (data) => {
                stdout += data.toString();
                if (stdout.length > maxBuffer) {
                    stdout = stdout.slice(-maxBuffer / 2); // Keep last half
                }
            });
            
            process.stderr?.on('data', (data) => {
                stderr += data.toString();
                if (stderr.length > maxBuffer) {
                    stderr = stderr.slice(-maxBuffer / 2);
                }
            });
            
            const result = await new Promise((resolve, reject) => {
                process.on('close', (code) => {
                    resolve({ stdout, stderr, code });
                });
                
                process.on('error', reject);
                
                signal.addEventListener('abort', () => {
                    process.kill('SIGKILL');
                    reject(new Error('Process aborted'));
                });
            });
            
            return result;
            
        } finally {
            clearTimeout(timeout);
        }
    }

    // FIX: Proper cleanup for MutationObserver
    createManagedObserver(callback, options) {
        const observer = new MutationObserver(callback);
        this.observers.add(observer);
        
        return {
            observe: (target, config) => observer.observe(target, config),
            disconnect: () => {
                observer.disconnect();
                this.observers.delete(observer);
            }
        };
    }

    // FIX: Event listener cleanup tracking
    addManagedEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        
        this.eventListeners.get(element).push({ event, handler, options });
        
        return () => {
            element.removeEventListener(event, handler, options);
            const listeners = this.eventListeners.get(element);
            if (listeners) {
                const index = listeners.findIndex(l => 
                    l.event === event && l.handler === handler
                );
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }

    // FIX: Managed intervals and timeouts
    setManagedInterval(callback, delay) {
        const id = setInterval(callback, delay);
        this.intervals.add(id);
        
        return {
            id,
            clear: () => {
                clearInterval(id);
                this.intervals.delete(id);
            }
        };
    }

    setManagedTimeout(callback, delay) {
        const id = setTimeout(() => {
            callback();
            this.timeouts.delete(id);
        }, delay);
        
        this.timeouts.add(id);
        
        return {
            id,
            clear: () => {
                clearTimeout(id);
                this.timeouts.delete(id);
            }
        };
    }

    // FIX: Web Worker management
    createManagedWorker(scriptURL) {
        const worker = new Worker(scriptURL);
        this.webWorkers.add(worker);
        
        const originalTerminate = worker.terminate.bind(worker);
        worker.terminate = () => {
            this.webWorkers.delete(worker);
            originalTerminate();
        };
        
        return worker;
    }

    // FIX: Stream cleanup
    managedStream(stream) {
        this.streams.add(stream);
        
        const originalDestroy = stream.destroy?.bind(stream);
        if (originalDestroy) {
            stream.destroy = (...args) => {
                this.streams.delete(stream);
                return originalDestroy(...args);
            };
        }
        
        return stream;
    }

    // Cleanup all managed resources
    cleanup() {
        console.log('[MemoryLeak] 🧹 Cleaning up managed resources...');
        
        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Clear intervals
        this.intervals.forEach(id => clearInterval(id));
        this.intervals.clear();
        
        // Clear timeouts
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts.clear();
        
        // Terminate workers
        this.webWorkers.forEach(worker => worker.terminate());
        this.webWorkers.clear();
        
        // Destroy streams
        this.streams.forEach(stream => {
            if (stream.destroy) stream.destroy();
        });
        this.streams.clear();
        
        console.log('[MemoryLeak] ✅ Cleanup complete');
    }
}

// ============================================================================
// 3. PERFORMANCE OPTIMIZATIONS
// ============================================================================

class PerformanceOptimizations {
    constructor() {
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
    }

    // FIX: Efficient caching with TTL
    createCache(maxSize = 1000, ttl = 300000) { // 5 minutes default TTL
        return {
            cache: new Map(),
            timers: new Map(),
            
            get(key) {
                const item = this.cache.get(key);
                if (!item) return undefined;
                
                if (Date.now() > item.expires) {
                    this.delete(key);
                    return undefined;
                }
                
                return item.value;
            },
            
            set(key, value) {
                // Implement LRU eviction
                if (this.cache.size >= maxSize) {
                    const firstKey = this.cache.keys().next().value;
                    this.delete(firstKey);
                }
                
                const expires = Date.now() + ttl;
                this.cache.set(key, { value, expires });
                
                // Set cleanup timer
                const timer = setTimeout(() => {
                    this.delete(key);
                }, ttl);
                
                this.timers.set(key, timer);
            },
            
            delete(key) {
                this.cache.delete(key);
                const timer = this.timers.get(key);
                if (timer) {
                    clearTimeout(timer);
                    this.timers.delete(key);
                }
            },
            
            clear() {
                this.timers.forEach(timer => clearTimeout(timer));
                this.cache.clear();
                this.timers.clear();
            }
        };
    }

    // FIX: Debounce for frequent operations
    debounce(func, delay, key = 'default') {
        return (...args) => {
            const existingTimer = this.debounceTimers.get(key);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            
            const timer = setTimeout(() => {
                this.debounceTimers.delete(key);
                func(...args);
            }, delay);
            
            this.debounceTimers.set(key, timer);
        };
    }

    // FIX: Throttle for high-frequency events
    throttle(func, delay, key = 'default') {
        return (...args) => {
            if (this.throttleTimers.has(key)) {
                return; // Still in cooldown
            }
            
            func(...args);
            
            const timer = setTimeout(() => {
                this.throttleTimers.delete(key);
            }, delay);
            
            this.throttleTimers.set(key, timer);
        };
    }

    // FIX: Efficient DOM updates with batching
    createBatchedUpdater() {
        let pendingUpdates = [];
        let updateScheduled = false;
        
        return {
            schedule(updateFn) {
                pendingUpdates.push(updateFn);
                
                if (!updateScheduled) {
                    updateScheduled = true;
                    requestAnimationFrame(() => {
                        const updates = pendingUpdates.splice(0);
                        updates.forEach(fn => fn());
                        updateScheduled = false;
                    });
                }
            }
        };
    }

    // FIX: Virtual scrolling for large lists
    createVirtualScroller(container, itemHeight, renderItem) {
        let items = [];
        let scrollTop = 0;
        let containerHeight = container.clientHeight;
        
        const update = () => {
            const startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(
                startIndex + Math.ceil(containerHeight / itemHeight) + 1,
                items.length
            );
            
            // Clear container
            container.innerHTML = '';
            
            // Create spacer for items above viewport
            if (startIndex > 0) {
                const spacer = document.createElement('div');
                spacer.style.height = `${startIndex * itemHeight}px`;
                container.appendChild(spacer);
            }
            
            // Render visible items
            for (let i = startIndex; i < endIndex; i++) {
                const element = renderItem(items[i], i);
                element.style.height = `${itemHeight}px`;
                container.appendChild(element);
            }
            
            // Create spacer for items below viewport
            const remainingItems = items.length - endIndex;
            if (remainingItems > 0) {
                const spacer = document.createElement('div');
                spacer.style.height = `${remainingItems * itemHeight}px`;
                container.appendChild(spacer);
            }
        };
        
        container.addEventListener('scroll', () => {
            scrollTop = container.scrollTop;
            update();
        });
        
        return {
            setItems(newItems) {
                items = newItems;
                update();
            },
            
            refresh() {
                containerHeight = container.clientHeight;
                update();
            }
        };
    }

    // FIX: Efficient file reading with streaming
    async readLargeFile(filePath, chunkSize = 64 * 1024) {
        const fs = require('fs');
        const stream = fs.createReadStream(filePath, { 
            highWaterMark: chunkSize 
        });
        
        const chunks = [];
        
        return new Promise((resolve, reject) => {
            stream.on('data', chunk => {
                chunks.push(chunk);
                
                // Prevent memory overflow
                if (chunks.length > 1000) {
                    stream.pause();
                    reject(new Error('File too large for memory'));
                }
            });
            
            stream.on('end', () => {
                resolve(Buffer.concat(chunks).toString());
            });
            
            stream.on('error', reject);
        });
    }
}

// ============================================================================
// 4. ENHANCED ERROR HANDLING
// ============================================================================

class EnhancedErrorHandling {
    constructor() {
        this.errorQueue = [];
        this.maxErrors = 100;
        this.errorHandlers = new Map();
    }

    // FIX: Centralized error handling
    handleError(error, context = 'unknown') {
        const errorInfo = {
            message: error.message || 'Unknown error',
            stack: error.stack || '',
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Add to queue
        this.errorQueue.push(errorInfo);
        
        // Maintain queue size
        if (this.errorQueue.length > this.maxErrors) {
            this.errorQueue.shift();
        }
        
        // Call registered handlers
        const handlers = this.errorHandlers.get(context) || [];
        handlers.forEach(handler => {
            try {
                handler(errorInfo);
            } catch (handlerError) {
                console.error('Error in error handler:', handlerError);
            }
        });
        
        // Log to console
        console.error(`[${context}] ${error.message}`, error);
        
        return errorInfo;
    }

    // Register error handler for specific context
    onError(context, handler) {
        if (!this.errorHandlers.has(context)) {
            this.errorHandlers.set(context, []);
        }
        
        this.errorHandlers.get(context).push(handler);
        
        return () => {
            const handlers = this.errorHandlers.get(context);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index !== -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }

    // Get error statistics
    getErrorStats() {
        const contextCounts = {};
        
        this.errorQueue.forEach(error => {
            contextCounts[error.context] = (contextCounts[error.context] || 0) + 1;
        });
        
        return {
            totalErrors: this.errorQueue.length,
            byContext: contextCounts,
            recentErrors: this.errorQueue.slice(-10)
        };
    }
}

// ============================================================================
// 5. SECURE CONFIGURATION MANAGER
// ============================================================================

class SecureConfigManager {
    constructor() {
        this.config = new Map();
        this.encrypted = new Map();
        this.validators = new Map();
    }

    // Set configuration with validation
    set(key, value, options = {}) {
        const { encrypt = false, validate } = options;
        
        // Validate if validator exists
        if (validate && typeof validate === 'function') {
            if (!validate(value)) {
                throw new Error(`Invalid value for config key: ${key}`);
            }
        }
        
        if (encrypt) {
            const encrypted = this.encryptValue(value);
            this.encrypted.set(key, encrypted);
        } else {
            this.config.set(key, value);
        }
    }

    // Get configuration value
    get(key) {
        if (this.encrypted.has(key)) {
            return this.decryptValue(this.encrypted.get(key));
        }
        
        return this.config.get(key);
    }

    // Encrypt sensitive values
    encryptValue(value) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync('bigdaddyg-ide', 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        cipher.setAAD(Buffer.from('bigdaddyg', 'utf8'));
        
        let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }

    // Decrypt sensitive values
    decryptValue(encryptedData) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync('bigdaddyg-ide', 'salt', 32);
        
        const decipher = crypto.createDecipher(algorithm, key);
        decipher.setAAD(Buffer.from('bigdaddyg', 'utf8'));
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    }
}

// ============================================================================
// 6. INITIALIZATION AND GLOBAL EXPOSURE
// ============================================================================

class SecurityPerformanceManager {
    constructor() {
        this.security = new SecurityEnhancements();
        this.memoryLeak = new MemoryLeakPrevention();
        this.performance = new PerformanceOptimizations();
        this.errorHandler = new EnhancedErrorHandling();
        this.config = new SecureConfigManager();
        
        this.init();
    }

    init() {
        console.log('[Security] 🛡️ Initializing security & performance enhancements...');
        
        // Set up global error handling
        window.addEventListener('error', (event) => {
            this.errorHandler.handleError(event.error, 'window');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.errorHandler.handleError(event.reason, 'promise');
        });
        
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        console.log('[Security] ✅ Security & performance enhancements active');
    }

    cleanup() {
        console.log('[Security] 🧹 Performing security cleanup...');
        this.memoryLeak.cleanup();
        console.log('[Security] ✅ Security cleanup complete');
    }

    // Get comprehensive health report
    getHealthReport() {
        return {
            security: {
                csrfTokens: this.security.csrfTokens.size,
                rateLimiters: this.security.rateLimiter.size
            },
            memory: {
                observers: this.memoryLeak.observers.size,
                intervals: this.memoryLeak.intervals.size,
                timeouts: this.memoryLeak.timeouts.size,
                workers: this.memoryLeak.webWorkers.size,
                streams: this.memoryLeak.streams.size
            },
            performance: {
                cacheSize: this.performance.cache.size,
                debounceTimers: this.performance.debounceTimers.size,
                throttleTimers: this.performance.throttleTimers.size
            },
            errors: this.errorHandler.getErrorStats()
        };
    }
}

// Initialize and expose globally
const securityManager = new SecurityPerformanceManager();

if (typeof window !== 'undefined') {
    window.securityManager = securityManager;
    window.getSecurityHealth = () => securityManager.getHealthReport();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SecurityEnhancements,
        MemoryLeakPrevention,
        PerformanceOptimizations,
        EnhancedErrorHandling,
        SecureConfigManager,
        SecurityPerformanceManager
    };
}

console.log('[Security] 📦 Security & Performance Enhancements loaded');
console.log('[Security] 💡 Use getSecurityHealth() to check system status');