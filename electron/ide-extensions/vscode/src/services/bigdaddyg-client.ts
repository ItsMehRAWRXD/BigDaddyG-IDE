import axios, { AxiosInstance } from 'axios';
import * as WebSocket from 'ws';
import { AuthenticationService } from './authentication-service';
import { SecurityManager } from './security-manager';

export interface ChatResponse {
    content: string;
    usage?: any;
    model: string;
    provider: string;
}

export interface AgentConfig {
    name: string;
    model: string;
    tools?: string[];
    systemPrompt?: string;
}

export class BigDaddyGClient {
    private http: AxiosInstance;
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, (data: any) => void> = new Map();

    constructor(
        private serverUrl: string,
        private auth: AuthenticationService,
        private security: SecurityManager
    ) {
        this.http = axios.create({
            baseURL: serverUrl,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.http.interceptors.request.use(async (config) => {
            const token = await this.auth.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.http.interceptors.response.use(
            response => response,
            error => {
                this.security.logSecurityEvent('http_error', {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.message
                });
                throw error;
            }
        );
    }

    async initialize(): Promise<void> {
        try {
            const response = await this.http.get('/health');
            console.log('BigDaddyG server connected:', response.data);
            await this.connectWebSocket();
        } catch (error) {
            console.error('Failed to connect to BigDaddyG server:', error);
            throw new Error('BigDaddyG server unavailable');
        }
    }

    private async connectWebSocket(): Promise<void> {
        const wsUrl = this.serverUrl.replace('http', 'ws') + '/ws';
        const token = await this.auth.getToken();

        this.ws = new WebSocket(wsUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        this.ws.on('open', () => {
            console.log('WebSocket connected');
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            try {
                const message = JSON.parse(data.toString());
                const handler = this.messageHandlers.get(message.type);
                if (handler) {
                    handler(message.data);
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        });

        this.ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.security.logSecurityEvent('websocket_error', { error: error.message });
        });

        this.ws.on('close', () => {
            console.log('WebSocket disconnected');
            setTimeout(() => this.connectWebSocket(), 5000);
        });
    }

    onMessage(type: string, handler: (data: any) => void): void {
        this.messageHandlers.set(type, handler);
    }

    async chat(message: string, model?: string): Promise<ChatResponse> {
        const sanitizedMessage = this.security.sanitizeInput(message);
        
        const response = await this.http.post('/api/chat', {
            message: sanitizedMessage,
            model: model || 'bigdaddyg:latest'
        });

        return response.data;
    }

    async *chatStream(message: string, model?: string): AsyncGenerator<string> {
        const sanitizedMessage = this.security.sanitizeInput(message);
        
        const response = await this.http.post('/api/chat/stream', {
            message: sanitizedMessage,
            model: model || 'bigdaddyg:latest'
        }, {
            responseType: 'stream'
        });

        for await (const chunk of response.data) {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') return;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            yield parsed.content;
                        }
                    } catch (e) {}
                }
            }
        }
    }

    async generateCode(prompt: string, language: string): Promise<ChatResponse> {
        return this.chat(`Generate ${language} code: ${prompt}`, 'qwen2.5-coder:7b');
    }

    async analyzeCode(code: string, language: string): Promise<ChatResponse> {
        return this.chat(`Analyze this ${language} code:\n\n${code}`, 'qwen2.5-coder:7b');
    }

    async debugCode(code: string, error: string, language: string): Promise<ChatResponse> {
        return this.chat(`Debug this ${language} code:\n\nCode:\n${code}\n\nError:\n${error}`, 'qwen2.5-coder:7b');
    }

    async fixCode(code: string, issue: string, language: string): Promise<ChatResponse> {
        return this.chat(`Fix this ${language} code:\n\nCode:\n${code}\n\nIssue:\n${issue}`, 'qwen2.5-coder:7b');
    }

    async explainCode(code: string, language: string): Promise<ChatResponse> {
        return this.chat(`Explain this ${language} code:\n\n${code}`);
    }

    async refactorCode(code: string, language: string): Promise<ChatResponse> {
        return this.chat(`Refactor this ${language} code:\n\n${code}`, 'qwen2.5-coder:7b');
    }

    async createAgent(config: AgentConfig): Promise<any> {
        const response = await this.http.post('/api/agents', config);
        return response.data;
    }

    async listAgents(): Promise<any[]> {
        const response = await this.http.get('/api/agents');
        return response.data;
    }

    async deleteAgent(agentId: string): Promise<void> {
        await this.http.delete(`/api/agents/${agentId}`);
    }

    async listModels(): Promise<any[]> {
        const response = await this.http.get('/api/models');
        return response.data;
    }

    async getStats(): Promise<any> {
        const response = await this.http.get('/api/stats');
        return response.data;
    }

    dispose(): void {
        if (this.ws) {
            this.ws.close();
        }
    }
}
