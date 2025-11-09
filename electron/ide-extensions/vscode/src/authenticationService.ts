import * as vscode from 'vscode';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto-js';
import axios from 'axios';
import { EventEmitter } from 'events';

export interface AuthenticationProvider {
    id: string;
    name: string;
    authenticate(): Promise<AuthenticationResult>;
    refresh(token: string): Promise<AuthenticationResult>;
    logout(): Promise<void>;
}

export interface AuthenticationResult {
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: UserInfo;
    error?: string;
    expiresAt?: Date;
}

export interface UserInfo {
    id: string;
    email: string;
    name: string;
    organization?: string;
    plan: 'free' | 'pro' | 'enterprise';
    permissions: string[];
    quotas: {
        dailyRequests: number;
        usedRequests: number;
        maxTokens: number;
    };
}

export class EnterpriseAuthProvider implements AuthenticationProvider {
    id = 'enterprise';
    name = 'Enterprise SSO';

    async authenticate(): Promise<AuthenticationResult> {
        try {
            const config = vscode.workspace.getConfiguration('bigdaddyg');
            const ssoEndpoint = config.get<string>('enterpriseSSOEndpoint');
            
            if (!ssoEndpoint) {
                return { success: false, error: 'Enterprise SSO endpoint not configured' };
            }

            // Open SSO flow in browser
            const authUrl = `${ssoEndpoint}/auth/vscode?client_id=bigdaddyg-vscode`;
            await vscode.env.openExternal(vscode.Uri.parse(authUrl));

            // Wait for callback with token
            const token = await this.waitForCallback();
            
            if (!token) {
                return { success: false, error: 'Authentication cancelled or failed' };
            }

            const userInfo = await this.validateToken(token);
            
            return {
                success: true,
                token,
                user: userInfo,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            };
        } catch (error) {
            return { success: false, error: `Enterprise authentication failed: ${error}` };
        }
    }

    async refresh(token: string): Promise<AuthenticationResult> {
        try {
            const config = vscode.workspace.getConfiguration('bigdaddyg');
            const ssoEndpoint = config.get<string>('enterpriseSSOEndpoint');
            
            const response = await axios.post(`${ssoEndpoint}/auth/refresh`, {
                token
            });

            return {
                success: true,
                token: response.data.token,
                refreshToken: response.data.refreshToken,
                user: response.data.user,
                expiresAt: new Date(response.data.expiresAt)
            };
        } catch (error) {
            return { success: false, error: 'Token refresh failed' };
        }
    }

    async logout(): Promise<void> {
        const config = vscode.workspace.getConfiguration('bigdaddyg');
        const ssoEndpoint = config.get<string>('enterpriseSSOEndpoint');
        
        try {
            await axios.post(`${ssoEndpoint}/auth/logout`);
        } catch (error) {
            console.warn('Logout request failed:', error);
        }
    }

    private async waitForCallback(): Promise<string | null> {
        return new Promise((resolve) => {
            const server = require('http').createServer((req: any, res: any) => {
                const url = new URL(req.url, 'http://localhost');
                const token = url.searchParams.get('token');
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<html><body><h1>Authentication successful!</h1><p>You can close this window.</p></body></html>');
                
                server.close();
                resolve(token);
            });

            server.listen(0, () => {
                const port = server.address()?.port;
                console.log(`Waiting for auth callback on port ${port}`);
            });

            // Timeout after 5 minutes
            setTimeout(() => {
                server.close();
                resolve(null);
            }, 5 * 60 * 1000);
        });
    }

    private async validateToken(token: string): Promise<UserInfo> {
        const decoded = jwt.decode(token) as any;
        return {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            organization: decoded.org,
            plan: decoded.plan || 'free',
            permissions: decoded.permissions || [],
            quotas: decoded.quotas || {
                dailyRequests: 100,
                usedRequests: 0,
                maxTokens: 2048
            }
        };
    }
}

export class APIKeyAuthProvider implements AuthenticationProvider {
    id = 'apikey';
    name = 'API Key';

    async authenticate(): Promise<AuthenticationResult> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your BigDaddyG API Key',
            password: true,
            placeHolder: 'sk-...'
        });

        if (!apiKey) {
            return { success: false, error: 'API key required' };
        }

        try {
            const config = vscode.workspace.getConfiguration('bigdaddyg');
            const endpoint = config.get<string>('apiEndpoint');
            
            const response = await axios.post(`${endpoint}/auth/validate`, {
                apiKey
            });

            if (response.data.valid) {
                return {
                    success: true,
                    token: apiKey,
                    user: response.data.user,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                };
            } else {
                return { success: false, error: 'Invalid API key' };
            }
        } catch (error) {
            return { success: false, error: 'API key validation failed' };
        }
    }

    async refresh(token: string): Promise<AuthenticationResult> {
        return this.authenticate(); // API keys don't need refresh
    }

    async logout(): Promise<void> {
        // Clear stored API key
        await vscode.workspace.getConfiguration('bigdaddyg').update('apiKey', '', vscode.ConfigurationTarget.Global);
    }
}

export class AuthenticationService extends EventEmitter {
    private providers: Map<string, AuthenticationProvider> = new Map();
    private currentAuth: AuthenticationResult | null = null;
    private refreshTimer: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.registerProviders();
        this.loadStoredAuth();
    }

    private registerProviders() {
        this.providers.set('enterprise', new EnterpriseAuthProvider());
        this.providers.set('apikey', new APIKeyAuthProvider());
    }

    async authenticate(providerId?: string): Promise<AuthenticationResult> {
        if (!providerId) {
            // Show provider selection
            const items = Array.from(this.providers.values()).map(p => ({
                label: p.name,
                description: `Authenticate using ${p.name}`,
                providerId: p.id
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select authentication method'
            });

            if (!selected) {
                return { success: false, error: 'Authentication cancelled' };
            }

            providerId = selected.providerId;
        }

        const provider = this.providers.get(providerId);
        if (!provider) {
            return { success: false, error: 'Invalid authentication provider' };
        }

        const result = await provider.authenticate();
        
        if (result.success) {
            this.currentAuth = result;
            await this.storeAuth(result);
            this.scheduleRefresh(result);
            await vscode.commands.executeCommand('setContext', 'bigdaddyg.authenticated', true);
            this.emit('authenticated', result.user);
        }

        return result;
    }

    async logout(): Promise<void> {
        if (this.currentAuth && this.currentAuth.token) {
            // Find the provider that was used
            for (const provider of this.providers.values()) {
                try {
                    await provider.logout();
                } catch (error) {
                    console.warn('Logout error:', error);
                }
            }
        }

        this.currentAuth = null;
        await this.clearStoredAuth();
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        await vscode.commands.executeCommand('setContext', 'bigdaddyg.authenticated', false);
        this.emit('logout');
    }

    isAuthenticated(): boolean {
        return this.currentAuth?.success === true && 
               this.currentAuth.expiresAt && 
               this.currentAuth.expiresAt > new Date();
    }

    getCurrentUser(): UserInfo | null {
        return this.currentAuth?.user || null;
    }

    getAuthToken(): string | null {
        return this.currentAuth?.token || null;
    }

    hasPermission(permission: string): boolean {
        const user = this.getCurrentUser();
        return user?.permissions.includes(permission) || false;
    }

    async checkQuota(): Promise<{ allowed: boolean; remaining: number }> {
        const user = this.getCurrentUser();
        if (!user) {
            return { allowed: false, remaining: 0 };
        }

        const remaining = user.quotas.dailyRequests - user.quotas.usedRequests;
        return {
            allowed: remaining > 0,
            remaining
        };
    }

    private async storeAuth(auth: AuthenticationResult): Promise<void> {
        const encrypted = crypto.AES.encrypt(JSON.stringify(auth), 'bigdaddyg-secret').toString();
        await vscode.workspace.getConfiguration('bigdaddyg').update(
            'storedAuth', 
            encrypted, 
            vscode.ConfigurationTarget.Global
        );
    }

    private async loadStoredAuth(): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('bigdaddyg');
            const stored = config.get<string>('storedAuth');
            
            if (stored) {
                const decrypted = crypto.AES.decrypt(stored, 'bigdaddyg-secret').toString(crypto.enc.Utf8);
                const auth = JSON.parse(decrypted) as AuthenticationResult;
                
                if (auth.expiresAt && new Date(auth.expiresAt) > new Date()) {
                    this.currentAuth = auth;
                    await vscode.commands.executeCommand('setContext', 'bigdaddyg.authenticated', true);
                    this.scheduleRefresh(auth);
                    this.emit('authenticated', auth.user);
                }
            }
        } catch (error) {
            console.warn('Failed to load stored auth:', error);
            await this.clearStoredAuth();
        }
    }

    private async clearStoredAuth(): Promise<void> {
        await vscode.workspace.getConfiguration('bigdaddyg').update(
            'storedAuth', 
            undefined, 
            vscode.ConfigurationTarget.Global
        );
    }

    private scheduleRefresh(auth: AuthenticationResult): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (!auth.expiresAt) return;

        const refreshTime = auth.expiresAt.getTime() - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry
        
        if (refreshTime > 0) {
            this.refreshTimer = setTimeout(async () => {
                await this.refreshToken();
            }, refreshTime);
        }
    }

    private async refreshToken(): Promise<void> {
        if (!this.currentAuth?.token) return;

        // Try to find the provider that was used
        for (const provider of this.providers.values()) {
            try {
                const result = await provider.refresh(this.currentAuth.token);
                if (result.success) {
                    this.currentAuth = result;
                    await this.storeAuth(result);
                    this.scheduleRefresh(result);
                    this.emit('tokenRefreshed', result);
                    return;
                }
            } catch (error) {
                console.warn('Token refresh failed:', error);
            }
        }

        // If refresh failed, logout
        await this.logout();
    }
}

export const authService = new AuthenticationService();