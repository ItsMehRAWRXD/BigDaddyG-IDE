import fetch from 'node-fetch';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatRequest {
    model: string;
    messages: ChatMessage[];
    stream?: boolean;
}

export class BigDaddyGClient {
    constructor(private apiEndpoint: string) {}

    async chat(request: ChatRequest): Promise<string> {
        const response = await fetch(`${this.apiEndpoint}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message?.content || '';
    }

    async *chatStream(request: ChatRequest): AsyncGenerator<string> {
        const response = await fetch(`${this.apiEndpoint}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...request, stream: true })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    if (data.message?.content) {
                        yield data.message.content;
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
    }

    async listModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.apiEndpoint}/api/tags`);
            const data = await response.json();
            return data.models?.map((m: any) => m.name) || [];
        } catch {
            return ['bigdaddyg:latest'];
        }
    }

    async generate(prompt: string, model: string = 'bigdaddyg:latest'): Promise<string> {
        const response = await fetch(`${this.apiEndpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, prompt })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response || '';
    }
}
