/**
 * BigDaddyG IDE - VS Code URI
 * Implements vscode.Uri class
 */

const path = require('path');

class Uri {
    constructor(scheme, authority, path, query, fragment) {
        this.scheme = scheme || 'file';
        this.authority = authority || '';
        this.path = path || '';
        this.query = query || '';
        this.fragment = fragment || '';
    }
    
    /**
     * Create URI from file path
     */
    static file(path) {
        return new Uri('file', '', path, '', '');
    }
    
    /**
     * Parse URI string
     */
    static parse(value, strict = false) {
        // Simple URI parsing
        const uriRegex = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
        const match = value.match(uriRegex);
        
        if (match) {
            return new Uri(
                match[2] || 'file',
                match[4] || '',
                match[5] || '',
                match[7] || '',
                match[9] || ''
            );
        }
        
        return new Uri('file', '', value, '', '');
    }
    
    /**
     * Join path segments
     */
    static joinPath(base, ...pathSegments) {
        const newPath = path.join(base.path, ...pathSegments);
        return new Uri(base.scheme, base.authority, newPath, base.query, base.fragment);
    }
    
    /**
     * Convert to string
     */
    toString(skipEncoding = false) {
        let result = '';
        
        if (this.scheme) {
            result += this.scheme + ':';
        }
        
        if (this.authority || this.scheme === 'file') {
            result += '//';
        }
        
        if (this.authority) {
            result += this.authority;
        }
        
        if (this.path) {
            result += this.path;
        }
        
        if (this.query) {
            result += '?' + this.query;
        }
        
        if (this.fragment) {
            result += '#' + this.fragment;
        }
        
        return result;
    }
    
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            scheme: this.scheme,
            authority: this.authority,
            path: this.path,
            query: this.query,
            fragment: this.fragment
        };
    }
    
    /**
     * Get file system path
     */
    get fsPath() {
        if (this.scheme !== 'file') {
            return this.path;
        }
        
        // Handle Windows paths
        if (process.platform === 'win32') {
            // Remove leading slash if present
            return this.path.replace(/^\/([a-zA-Z]:)/, '$1');
        }
        
        return this.path;
    }
    
    /**
     * With scheme
     */
    with(change) {
        return new Uri(
            change.scheme !== undefined ? change.scheme : this.scheme,
            change.authority !== undefined ? change.authority : this.authority,
            change.path !== undefined ? change.path : this.path,
            change.query !== undefined ? change.query : this.query,
            change.fragment !== undefined ? change.fragment : this.fragment
        );
    }
}

module.exports = Uri;

