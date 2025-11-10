import * as vscode from 'vscode';
import { BigDaddyGClient } from './client';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private chatHistory: Array<{ role: string; content: string }> = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private client: BigDaddyGClient
    ) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'chat':
                    await this.handleChat(data.message);
                    break;
                case 'clear':
                    this.chatHistory = [];
                    break;
            }
        });
    }

    private async handleChat(message: string) {
        this.chatHistory.push({ role: 'user', content: message });
        
        this._view?.webview.postMessage({
            type: 'userMessage',
            message: message
        });

        try {
            const config = vscode.workspace.getConfiguration('bigdaddyg');
            const model = config.get<string>('defaultModel', 'bigdaddyg:latest');

            let fullResponse = '';
            
            for await (const chunk of this.client.chatStream({
                model,
                messages: this.chatHistory.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                })),
                stream: true
            })) {
                fullResponse += chunk;
                this._view?.webview.postMessage({
                    type: 'assistantChunk',
                    chunk: chunk
                });
            }

            this.chatHistory.push({ role: 'assistant', content: fullResponse });

            this._view?.webview.postMessage({
                type: 'assistantComplete'
            });

        } catch (error) {
            this._view?.webview.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BigDaddyG Chat</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }
        .message {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
        }
        .user-message {
            background: var(--vscode-input-background);
            margin-left: 20px;
        }
        .assistant-message {
            background: var(--vscode-textCodeBlock-background);
            margin-right: 20px;
        }
        .message-role {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
            opacity: 0.8;
        }
        #input-container {
            padding: 10px;
            border-top: 1px solid var(--vscode-panel-border);
            display: flex;
            gap: 5px;
        }
        #message-input {
            flex: 1;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 8px;
            border-radius: 3px;
            font-family: inherit;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 15px;
            border-radius: 3px;
            cursor: pointer;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .typing-indicator {
            display: none;
            padding: 10px;
            font-style: italic;
            opacity: 0.7;
        }
        .typing-indicator.active {
            display: block;
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    <div class="typing-indicator" id="typing">BigDaddyG is typing...</div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="Ask BigDaddyG anything..." />
        <button id="send-btn">Send</button>
        <button id="clear-btn">Clear</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const clearBtn = document.getElementById('clear-btn');
        const typing = document.getElementById('typing');

        let currentAssistantMessage = null;

        sendBtn.addEventListener('click', sendMessage);
        clearBtn.addEventListener('click', () => {
            chatContainer.innerHTML = '';
            vscode.postMessage({ type: 'clear' });
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            vscode.postMessage({ type: 'chat', message });
            messageInput.value = '';
        }

        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'userMessage':
                    addMessage('user', message.message);
                    typing.classList.add('active');
                    break;

                case 'assistantChunk':
                    if (!currentAssistantMessage) {
                        currentAssistantMessage = addMessage('assistant', '');
                    }
                    currentAssistantMessage.textContent += message.chunk;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    break;

                case 'assistantComplete':
                    currentAssistantMessage = null;
                    typing.classList.remove('active');
                    break;

                case 'error':
                    typing.classList.remove('active');
                    addMessage('system', 'Error: ' + message.message);
                    break;
            }
        });

        function addMessage(role, content) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + role + '-message';

            const roleDiv = document.createElement('div');
            roleDiv.className = 'message-role';
            roleDiv.textContent = role === 'user' ? 'You' : 'BigDaddyG';

            const contentDiv = document.createElement('div');
            contentDiv.textContent = content;

            messageDiv.appendChild(roleDiv);
            messageDiv.appendChild(contentDiv);
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            return contentDiv;
        }
    </script>
</body>
</html>`;
    }
}
