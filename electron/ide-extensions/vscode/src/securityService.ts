import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';

export interface SecurityScanResult {
    file: string;
    line: number;
    column: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    message: string;
    rule: string;
    fix?: string;
}

export interface SecurityPolicy {
    allowedDomains: string[];
    blockedPatterns: RegExp[];
    maxRequestSize: number;
    rateLimits: {
        requests: number;
        window: number; // milliseconds
    };
    encryptionRequired: boolean;
    auditLogging: boolean;
}

export class SecurityService extends EventEmitter {
    private policy: SecurityPolicy;
    private requestCounts: Map<string, { count: number; window: number }> = new Map();
    private auditLog: Array<{ timestamp: Date; event: string; details: any }> = [];

    constructor() {
        super();
        this.policy = this.loadSecurityPolicy();
        this.startSecurityMonitoring();
    }

    private loadSecurityPolicy(): SecurityPolicy {
        const config = vscode.workspace.getConfiguration('bigdaddyg');
        const securityLevel = config.get<string>('securityLevel', 'standard');

        const policies = {
            basic: {
                allowedDomains: ['localhost', '127.0.0.1'],
                blockedPatterns: [/eval\s*\(/gi, /innerHTML\s*=/gi],
                maxRequestSize: 1024 * 1024, // 1MB
                rateLimits: { requests: 100, window: 60000 },
                encryptionRequired: false,
                auditLogging: false
            },
            standard: {
                allowedDomains: ['localhost', '127.0.0.1', 'api.bigdaddyg.com'],
                blockedPatterns: [
                    /eval\s*\(/gi,
                    /innerHTML\s*=/gi,
                    /document\.write/gi,
                    /setTimeout\s*\(\s*["'].*["']/gi,
                    /setInterval\s*\(\s*["'].*["']/gi
                ],
                maxRequestSize: 512 * 1024, // 512KB
                rateLimits: { requests: 50, window: 60000 },
                encryptionRequired: true,
                auditLogging: true
            },
            enterprise: {
                allowedDomains: ['localhost', '127.0.0.1', 'enterprise.bigdaddyg.com'],
                blockedPatterns: [
                    /eval\s*\(/gi,
                    /innerHTML\s*=/gi,
                    /document\.write/gi,
                    /setTimeout\s*\(\s*["'].*["']/gi,
                    /setInterval\s*\(\s*["'].*["']/gi,
                    /Function\s*\(/gi,
                    /new\s+Function/gi,
                    /\.call\s*\(/gi,
                    /\.apply\s*\(/gi
                ],
                maxRequestSize: 256 * 1024, // 256KB
                rateLimits: { requests: 30, window: 60000 },
                encryptionRequired: true,
                auditLogging: true
            }
        };

        return policies[securityLevel as keyof typeof policies] || policies.standard;
    }

    async scanCode(document: vscode.TextDocument): Promise<SecurityScanResult[]> {
        const results: SecurityScanResult[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        // Static analysis rules
        const rules = [
            {
                pattern: /password\s*=\s*["'][^"']*["']/gi,
                type: 'hardcoded-password',
                severity: 'high' as const,
                message: 'Hardcoded password detected'
            },
            {
                pattern: /api[_-]?key\s*=\s*["'][^"']*["']/gi,
                type: 'hardcoded-api-key',
                severity: 'critical' as const,
                message: 'Hardcoded API key detected'
            },
            {
                pattern: /eval\s*\(/gi,
                type: 'code-injection',
                severity: 'high' as const,
                message: 'Use of eval() can lead to code injection'
            },
            {
                pattern: /innerHTML\s*=/gi,
                type: 'xss-vulnerability',
                severity: 'medium' as const,
                message: 'Direct innerHTML assignment can lead to XSS'
            },
            {
                pattern: /document\.write/gi,
                type: 'xss-vulnerability',
                severity: 'medium' as const,
                message: 'document.write can lead to XSS vulnerabilities'
            },
            {
                pattern: /sql\s*=\s*["'].*\+.*["']/gi,
                type: 'sql-injection',
                severity: 'high' as const,
                message: 'Potential SQL injection vulnerability'
            },
            {
                pattern: /Math\.random\(\)/gi,
                type: 'weak-random',
                severity: 'low' as const,
                message: 'Math.random() is not cryptographically secure'
            },
            {
                pattern: /http:\/\//gi,
                type: 'insecure-protocol',
                severity: 'medium' as const,
                message: 'Use HTTPS instead of HTTP for secure communication'
            }
        ];

        lines.forEach((line, lineIndex) => {
            rules.forEach(rule => {
                let match;
                while ((match = rule.pattern.exec(line)) !== null) {
                    results.push({
                        file: document.fileName,
                        line: lineIndex + 1,
                        column: match.index + 1,
                        severity: rule.severity,
                        type: rule.type,
                        message: rule.message,
                        rule: rule.type,
                        fix: this.generateFix(rule.type, match[0])
                    });
                }
            });
        });

        this.auditEvent('security-scan', {
            file: document.fileName,
            issuesFound: results.length,
            severities: this.groupBySeverity(results)
        });

        return results;
    }

    async scanWorkspace(): Promise<SecurityScanResult[]> {
        const results: SecurityScanResult[] = [];
        
        if (!vscode.workspace.workspaceFolders) {
            return results;
        }

        const files = await vscode.workspace.findFiles(
            '**/*.{js,ts,jsx,tsx,py,java,cs,php,rb,go,rs}',
            '**/node_modules/**'
        );

        for (const file of files) {
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const fileResults = await this.scanCode(document);
                results.push(...fileResults);
            } catch (error) {
                console.warn(`Failed to scan ${file.fsPath}:`, error);
            }
        }

        return results;
    }

    validateRequest(url: string, data: any): { allowed: boolean; reason?: string } {
        // Check domain whitelist
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            if (!this.policy.allowedDomains.includes(domain)) {
                return { allowed: false, reason: `Domain ${domain} not in whitelist` };
            }
        } catch (error) {
            return { allowed: false, reason: 'Invalid URL format' };
        }

        // Check request size
        const dataSize = JSON.stringify(data).length;
        if (dataSize > this.policy.maxRequestSize) {
            return { allowed: false, reason: `Request size ${dataSize} exceeds limit ${this.policy.maxRequestSize}` };
        }

        // Check rate limits
        const clientId = this.getClientId();
        const now = Date.now();
        const clientData = this.requestCounts.get(clientId);

        if (clientData) {
            if (now - clientData.window < this.policy.rateLimits.window) {
                if (clientData.count >= this.policy.rateLimits.requests) {
                    return { allowed: false, reason: 'Rate limit exceeded' };
                }
                clientData.count++;
            } else {
                // Reset window
                this.requestCounts.set(clientId, { count: 1, window: now });
            }
        } else {
            this.requestCounts.set(clientId, { count: 1, window: now });
        }

        // Check for blocked patterns in data
        const dataStr = JSON.stringify(data);
        for (const pattern of this.policy.blockedPatterns) {
            if (pattern.test(dataStr)) {
                return { allowed: false, reason: 'Request contains blocked pattern' };
            }
        }

        return { allowed: true };
    }

    encryptSensitiveData(data: string): string {
        if (!this.policy.encryptionRequired) {
            return data;
        }

        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync('bigdaddyg-encryption-key', 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decryptSensitiveData(encryptedData: string): string {
        if (!this.policy.encryptionRequired) {
            return encryptedData;
        }

        const [ivHex, encrypted] = encryptedData.split(':');
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync('bigdaddyg-encryption-key', 'salt', 32);
        const iv = Buffer.from(ivHex, 'hex');
        
        const decipher = crypto.createDecipher(algorithm, key);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    private generateFix(ruleType: string, match: string): string {
        const fixes: Record<string, string> = {
            'hardcoded-password': 'Use environment variables or secure configuration',
            'hardcoded-api-key': 'Store API keys in environment variables',
            'code-injection': 'Use safer alternatives like JSON.parse() or Function constructor',
            'xss-vulnerability': 'Use textContent or sanitize HTML input',
            'sql-injection': 'Use parameterized queries or prepared statements',
            'weak-random': 'Use crypto.randomBytes() for cryptographic purposes',
            'insecure-protocol': 'Replace http:// with https://'
        };

        return fixes[ruleType] || 'Review and fix this security issue';
    }

    private groupBySeverity(results: SecurityScanResult[]): Record<string, number> {
        return results.reduce((acc, result) => {
            acc[result.severity] = (acc[result.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    private getClientId(): string {
        // Generate a unique client ID based on workspace and user
        const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'unknown';
        return crypto.createHash('sha256').update(workspace).digest('hex').substring(0, 16);
    }

    private auditEvent(event: string, details: any): void {
        if (!this.policy.auditLogging) return;

        this.auditLog.push({
            timestamp: new Date(),
            event,
            details
        });

        // Keep only last 1000 events
        if (this.auditLog.length > 1000) {
            this.auditLog.shift();
        }

        this.emit('auditEvent', { event, details });
    }

    getAuditLog(): Array<{ timestamp: Date; event: string; details: any }> {
        return [...this.auditLog];
    }

    exportAuditLog(): string {
        return JSON.stringify(this.auditLog, null, 2);
    }

    private startSecurityMonitoring(): void {
        // Monitor file changes for security issues
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            if (event.document.languageId === 'javascript' || 
                event.document.languageId === 'typescript') {
                const results = await this.scanCode(event.document);
                if (results.length > 0) {
                    this.emit('securityIssuesFound', results);
                }
            }
        });

        // Clean up old rate limit entries
        setInterval(() => {
            const now = Date.now();
            for (const [clientId, data] of this.requestCounts.entries()) {
                if (now - data.window > this.policy.rateLimits.window * 2) {
                    this.requestCounts.delete(clientId);
                }
            }
        }, 60000); // Clean up every minute
    }
}

export const securityService = new SecurityService();