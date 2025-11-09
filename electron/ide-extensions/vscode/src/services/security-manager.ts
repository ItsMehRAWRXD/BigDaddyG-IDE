import * as vscode from 'vscode';

export interface SecurityEvent {
    type: string;
    data: any;
    timestamp: string;
}

export class SecurityManager {
    private events: SecurityEvent[] = [];

    constructor(private context: vscode.ExtensionContext) {}

    async initialize(): Promise<void> {
        this.logSecurityEvent('security_manager_initialized', {
            timestamp: new Date().toISOString()
        });
    }

    sanitizeInput(input: string): string {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }

    logSecurityEvent(type: string, data: any): void {
        const event: SecurityEvent = {
            type,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        console.log(`Security Event [${type}]:`, data);
        
        if (this.events.length > 1000) {
            this.events = this.events.slice(-500);
        }
    }

    getSecurityEvents(): SecurityEvent[] {
        return [...this.events];
    }

    validateApiKey(key: string): boolean {
        return key && key.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(key);
    }
}