import * as vscode from 'vscode';
import { BigDaddyGClient } from '../services/bigdaddyg-client';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly client: BigDaddyGClient
    ) {}

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        webviewView.webview.html = this.getHtmlContent();

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    try {
                        const response = await this.client.chat(data.message);
                        webviewView.webview.postMessage({
                            type: 'response',
                            content: response.content
                        });
                    } catch (error) {
                        webviewView.webview.postMessage({
                            type: 'error',
                            message: 'Failed to send message'
                        });
                    }
                    break;
            }
        });
    }

    private getHtmlContent(): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: var(--vscode-font-family); margin: 0; padding: 10px; }
                .chat-container { display: flex; flex-direction: column; height: 100vh; }
                .messages { flex: 1; overflow-y: auto; margin-bottom: 10px; }
                .message { margin: 10px 0; padding: 8px; border-radius: 5px; }
                .user { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
                .assistant { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); }
                .input-container { display: flex; gap: 5px; }
                input { flex: 1; padding: 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
                button { padding: 8px 12px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <div class="messages" id="messages"></div>
                <div class="input-container">
                    <input type="text" id="messageInput" placeholder="Ask BigDaddyG..." />
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                
                function sendMessage() {
                    const input = document.getElementById('messageInput');
                    const message = input.value.trim();
                    if (!message) return;
                    
                    addMessage(message, 'user');
                    input.value = '';
                    
                    vscode.postMessage({ type: 'sendMessage', message });
                }
                
                function addMessage(content, type) {
                    const messages = document.getElementById('messages');
                    const div = document.createElement('div');
                    div.className = 'message ' + type;
                    div.textContent = content;
                    messages.appendChild(div);
                    messages.scrollTop = messages.scrollHeight;
                }
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'response') {
                        addMessage(message.content, 'assistant');
                    } else if (message.type === 'error') {
                        addMessage(message.message, 'error');
                    }
                });
                
                document.getElementById('messageInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') sendMessage();
                });
            </script>
        </body>
        </html>`;
    }
}