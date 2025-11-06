/**
 * Request Pool Manager
 * 
 * Prevents API spam by:
 * - Deduplicating identical requests
 * - Batching multiple requests
 * - Rate limiting requests per endpoint
 */

(function() {
'use strict';

class RequestPool {
    constructor() {
        this.pendingRequests = new Map(); // Dedupe identical requests
        this.requestCounts = new Map(); // Rate limiting
        this.rateLimits = {
            'localhost:11441': { maxPerSecond: 10, window: 1000 },
            'default': { maxPerSecond: 5, window: 1000 }
        };
        
        console.log('[RequestPool] 🏊 Initializing request pool...');
    }
    
    /**
     * Get cache key for deduplication
     */
    getCacheKey(url, options = {}) {
        const method = options.method || 'GET';
        const body = options.body || '';
        return `${method}:${url}:${body}`;
    }
    
    /**
     * Get rate limit config for URL
     */
    getRateLimitConfig(url) {
        try {
            const urlObj = new URL(url);
            const host = urlObj.host;
            return this.rateLimits[host] || this.rateLimits['default'];
        } catch {
            return this.rateLimits['default'];
        }
    }
    
    /**
     * Check if request is rate limited
     */
    isRateLimited(url) {
        const config = this.getRateLimitConfig(url);
        const now = Date.now();
        
        if (!this.requestCounts.has(url)) {
            this.requestCounts.set(url, []);
        }
        
        const timestamps = this.requestCounts.get(url);
        
        // Remove old timestamps outside the window
        const validTimestamps = timestamps.filter(t => now - t < config.window);
        this.requestCounts.set(url, validTimestamps);
        
        // Check if over limit
        if (validTimestamps.length >= config.maxPerSecond) {
            const oldestRequest = validTimestamps[0];
            const waitTime = config.window - (now - oldestRequest);
            console.warn(`[RequestPool] ⏸️ Rate limited: ${url} (wait ${waitTime}ms)`);
            return { limited: true, waitTime };
        }
        
        return { limited: false };
    }
    
    /**
     * Record request timestamp
     */
    recordRequest(url) {
        if (!this.requestCounts.has(url)) {
            this.requestCounts.set(url, []);
        }
        this.requestCounts.get(url).push(Date.now());
    }
    
    /**
     * Pooled fetch - deduplicates identical requests
     */
    async fetch(url, options = {}) {
        const cacheKey = this.getCacheKey(url, options);
        
        // Check if identical request is already pending
        if (this.pendingRequests.has(cacheKey)) {
            console.log('[RequestPool] 🔄 Reusing pending request:', cacheKey.substring(0, 50) + '...');
            return this.pendingRequests.get(cacheKey);
        }
        
        // Check rate limiting
        const rateCheck = this.isRateLimited(url);
        if (rateCheck.limited) {
            // Wait before making request
            await new Promise(resolve => setTimeout(resolve, rateCheck.waitTime));
        }
        
        // Make request
        const requestPromise = (async () => {
            try {
                this.recordRequest(url);
                
                // Use fetchWithTimeout if available, otherwise plain fetch
                const fetchFn = window.fetchWithTimeout || fetch;
                const response = await fetchFn(url, options);
                
                return response;
            } finally {
                // Remove from pending
                this.pendingRequests.delete(cacheKey);
            }
        })();
        
        // Store pending request
        this.pendingRequests.set(cacheKey, requestPromise);
        
        return requestPromise;
    }
    
    /**
     * Batch multiple requests together
     */
    async batchFetch(requests) {
        console.log(`[RequestPool] 📦 Batching ${requests.length} requests...`);
        
        // Group requests by domain
        const byDomain = new Map();
        requests.forEach((req, index) => {
            try {
                const url = new URL(req.url);
                const domain = url.host;
                if (!byDomain.has(domain)) {
                    byDomain.set(domain, []);
                }
                byDomain.get(domain).push({ ...req, index });
            } catch {
                console.warn('[RequestPool] ⚠️ Invalid URL:', req.url);
            }
        });
        
        // Execute batches with rate limiting per domain
        const results = new Array(requests.length);
        
        for (const [domain, domainRequests] of byDomain.entries()) {
            const config = this.getRateLimitConfig(`http://${domain}`);
            const delay = Math.ceil(config.window / config.maxPerSecond);
            
            for (const req of domainRequests) {
                const response = await this.fetch(req.url, req.options);
                results[req.index] = response;
                
                // Add delay between requests to same domain
                if (domainRequests.indexOf(req) < domainRequests.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        console.log('[RequestPool] ✅ Batch complete');
        return results;
    }
    
    /**
     * Clear all pending requests
     */
    clear() {
        this.pendingRequests.clear();
        this.requestCounts.clear();
        console.log('[RequestPool] 🧹 Request pool cleared');
    }
    
    /**
     * Get statistics
     */
    getStats() {
        return {
            pending: this.pendingRequests.size,
            endpoints: this.requestCounts.size,
            requests: Array.from(this.requestCounts.values()).reduce((sum, arr) => sum + arr.length, 0)
        };
    }
}

// ============================================================================
// GLOBAL EXPOSURE
// ============================================================================

window.requestPool = new RequestPool();

// Override global fetch to use pooled version
const originalFetch = window.fetch;
window.pooledFetch = (url, options) => window.requestPool.fetch(url, options);

// Expose stats
window.getRequestPoolStats = () => {
    const stats = window.requestPool.getStats();
    console.log('[RequestPool] 📊 Request Pool Statistics:');
    console.log(`  Pending Requests: ${stats.pending}`);
    console.log(`  Active Endpoints: ${stats.endpoints}`);
    console.log(`  Total Requests: ${stats.requests}`);
    return stats;
};

console.log('[RequestPool] 📦 Request pool module loaded');
console.log('[RequestPool] 💡 Use pooledFetch() instead of fetch() for deduplication');
console.log('[RequestPool] 💡 Use getRequestPoolStats() to check pool status');

})();

