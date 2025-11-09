import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { SecurityManager } from './security-manager';

export class AuthenticationService {
    private static readonly TOKEN_KEY = 'bigdaddyg.authToken';
    private static readonly SESSION_KEY = 'bigdaddyg.sessionId';
    private token: string | null = null;
    private sessionId: string | null = null;

    constructor(
        private context: vscode.ExtensionContext,
        private security: SecurityManager
    ) {}

    async initialize(): Promise<void> {
        await this.authenticate();
    }

    async authenticate(): Promise<boolean> {
        // Check for existing token
        this.token = await this.context.secrets.get(AuthenticationService.TOKEN_KEY);
        this.sessionId = await this.context.secrets.get(AuthenticationService.SESSION_KEY);

        if (this.token && this.sessionId) {
            if (await this.validateToken()) {
                return true;
            }
        }

        // Generate new session
        return await this.createNewSession();
    }

    private async createNewSession(): Promise<boolean> {
        try {
            // Generate secure token
            this.token = crypto.randomBytes(32).toString('hex');
            this.sessionId = crypto.randomUUID();

            // Store securely
            await this.context.secrets.store(AuthenticationService.TOKEN_KEY, this.token);
            await this.context.secrets.store(AuthenticationService.SESSION_KEY, this.sessionId);

            // Log security event
            this.security.logSecurityEvent('session_created', {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Failed to create session:', error);
            return false;
        }
    }

    private async validateToken(): Promise<boolean> {
        if (!this.token || !this.sessionId) {
            return false;
        }

        // Check token age
        const sessionData = this.context.globalState.get<any>('bigdaddyg.sessionData');
        if (sessionData) {
            const age = Date.now() - sessionData.created;
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
            
            if (age > maxAge) {
                await this.logout();
                return false;
            }
        }

        return true;
    }

    async getToken(): Promise<string | null> {
        return this.token;
    }

    async getSessionId(): Promise<string | null> {
        return this.sessionId;
    }

    async logout(): Promise<void> {
        await this.context.secrets.delete(AuthenticationService.TOKEN_KEY);
        await this.context.secrets.delete(AuthenticationService.SESSION_KEY);
        this.token = null;
        this.sessionId = null;

        this.security.logSecurityEvent('session_destroyed', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        });
    }

    async refreshToken(): Promise<boolean> {
        await this.logout();
        return await this.createNewSession();
    }
}
