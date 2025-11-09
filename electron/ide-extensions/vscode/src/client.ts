import axios, { AxiosInstance } from 'axios';

export interface Agent {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface CompletionRequest {
    prompt: string;
    context: string;
    language: string;
}

export class BigDaddyGClient {
    private api: AxiosInstance;
    private currentAgent: string = 'default';
    private wsConnection: WebSocket | null = null;

    constructor(private endpoint: string, private apiKey: string) {
        this.api = axios.create({
            baseURL: endpoint,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey ? `Bearer ${apiKey}` : ''
            },
            timeout: 30000
        });
    }

    updateConfig(endpoint: string, apiKey: string) {
        this.endpoint = endpoint;
        this.apiKey = apiKey;
        this.api = axios.create({
            baseURL: endpoint,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': apiKey ? `Bearer ${apiKey}` : ''
            },
            timeout: 30000
        });
    }

    async getAgents(): Promise<Agent[]> {
        try {
            const response = await this.api.get('/api/agents');
            return response.data.agents || [];
        } catch (error) {
            console.error('Failed to fetch agents:', error);
            return [];
        }
    }

    setCurrentAgent(agentId: string) {
        this.currentAgent = agentId;
    }

    async chat(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<string> {
        try {
            const response = await this.api.post('/api/chat', {
                messages,
                agent: this.currentAgent,
                stream: !!onChunk
            }, {
                responseType: onChunk ? 'stream' : 'json'
            });

            if (onChunk && response.data) {
                let fullResponse = '';
                response.data.on('data', (chunk: Buffer) => {
                    const text = chunk.toString();
                    fullResponse += text;
                    onChunk(text);
                });
                return new Promise((resolve) => {
                    response.data.on('end', () => resolve(fullResponse));
                });
            }

            return response.data.response || '';
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }

    async getCompletion(request: CompletionRequest): Promise<string> {
        try {
            const response = await this.api.post('/api/complete', {
                ...request,
                agent: this.currentAgent
            });
            return response.data.completion || '';
        } catch (error) {
            console.error('Completion error:', error);
            return '';
        }
    }

    dispose() {
        if (this.wsConnection) {
            this.wsConnection.close();
        }
    }
}
