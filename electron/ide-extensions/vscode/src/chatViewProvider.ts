import * as vscode from 'vscode';
import { BigDaddyGClient, ChatMessage } from './client';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private messages: ChatMessage[] = [];

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly client: BigDaddyGClient
    ) {}

    public resolveWebviewView(
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

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleUserMessage(data.message);
                    break;
                case 'clearChat':
                    this.messages = [];
                    break;
            }
        });
    }

    public sendMessage(message: string) {
        this.handleUserMessage(message);
    }

    private async handleUserMessage(message: string) {
        this.messages.push({ role: 'user', content: message });
        this._view?.webview.postMessage({ type: 'userMessage', message });

        try {
            let assistantMessage = '';
            await this.client.chat(this.messages, (chunk) => {
                assistantMessage += chunk;
                this._view?.webview.postMessage({ type: 'assistantChunk', chunk });
            });

            this.messages.push({ role: 'assistant', content: assistantMessage });
        } catch (error) {
            this._view?.webview.postMessage({ 
                type: 'error', 
                message: 'Failed to get response from BigDaddyG' 
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
        body {
            padding: 0;
            margin: 0;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        #chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #messages {
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
            background-color: var(--vscode-input-background);
            margin-left: 20px;
        }
        .assistant-message {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            margin-right: 20px;
        }
        .message-role {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9em;
            opacity: 0.8;
        }
        #input-container {
            display: flex;
            padding: 10px;
            border-top: 1px solid var(--vscode-panel-border);
        }
        #message-input {
            flex: 1;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            font-family: var(--vscode-font-family);
        }
        #send-button {
            margin-left: 5px;
            padding: 8px 15px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        #send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        #clear-button {
            margin-left: 5px;
            padding: 8px 15px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
        }
        code {
            font-family: var(--vscode-editor-font-family);
        }
    </style>
</head>
<body>
    <div id="chat-container">
        <div id="messages"></div>
        <div id="input-container">
            <textarea id="message-input" placeholder="Ask BigDaddyG..." rows="3"></textarea>
            <button id="send-button">Send</button>
            <button id="clear-button">Clear</button>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const clearButton = document.getElementById('clear-button');

        let currentAssistantMessage = null;

        sendButton.addEventListener('click', sendMessage);
        clearButton.addEventListener('click', clearChat);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                sendMessage();
            }
        });

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            vscode.postMessage({ type: 'sendMessage', message });
            messageInput.value = '';
        }

        function clearChat() {
            messagesDiv.innerHTML = '';
            vscode.postMessage({ type: 'clearChat' });
        }

        function addMessage(role, content) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}-message\`;
            
            const roleDiv = document.createElement('div');
            roleDiv.className = 'message-role';
            roleDiv.textContent = role === 'user' ? 'You' : 'BigDaddyG';
            
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = formatMessage(content);
            
            messageDiv.appendChild(roleDiv);
            messageDiv.appendChild(contentDiv);
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            return contentDiv;
        }

        function formatMessage(text) {
            // Simple markdown-like formatting
            text = text.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
            text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
            text = text.replace(/\\n/g, '<br>');
            return text;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'userMessage':
                    addMessage('user', message.message);
                    currentAssistantMessage = addMessage('assistant', '');
                    break;
                case 'assistantChunk':
                    if (currentAssistantMessage) {
                        currentAssistantMessage.innerHTML += message.chunk;
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }
                    break;
                case 'error':
                    addMessage('assistant', '❌ ' + message.message);
                    currentAssistantMessage = null;
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
}
