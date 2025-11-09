import * as vscode from 'vscode';
import { BigDaddyGClient } from '../services/bigdaddyg-client';

export class AgentsViewProvider implements vscode.WebviewViewProvider {
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
                case 'loadAgents':
                    try {
                        const agents = await this.client.listAgents();
                        webviewView.webview.postMessage({
                            type: 'agentsLoaded',
                            agents
                        });
                    } catch (error) {
                        webviewView.webview.postMessage({
                            type: 'error',
                            message: 'Failed to load agents'
                        });
                    }
                    break;
                case 'deleteAgent':
                    try {
                        await this.client.deleteAgent(data.agentId);
                        webviewView.webview.postMessage({
                            type: 'agentDeleted',
                            agentId: data.agentId
                        });
                    } catch (error) {
                        webviewView.webview.postMessage({
                            type: 'error',
                            message: 'Failed to delete agent'
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
                .agent-item { padding: 10px; margin: 5px 0; background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 5px; }
                .agent-name { font-weight: bold; color: var(--vscode-editor-foreground); }
                .agent-model { font-size: 0.9em; color: var(--vscode-descriptionForeground); }
                .agent-actions { margin-top: 5px; }
                button { padding: 4px 8px; margin-right: 5px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; border-radius: 3px; }
                .delete-btn { background: var(--vscode-errorForeground); }
                .empty-state { text-align: center; color: var(--vscode-descriptionForeground); margin-top: 50px; }
            </style>
        </head>
        <body>
            <div id="agents-container">
                <div class="empty-state">Loading agents...</div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                
                function loadAgents() {
                    vscode.postMessage({ type: 'loadAgents' });
                }
                
                function deleteAgent(agentId) {
                    if (confirm('Are you sure you want to delete this agent?')) {
                        vscode.postMessage({ type: 'deleteAgent', agentId });
                    }
                }
                
                function renderAgents(agents) {
                    const container = document.getElementById('agents-container');
                    
                    if (agents.length === 0) {
                        container.innerHTML = '<div class="empty-state">No agents found. Create one using the command palette.</div>';
                        return;
                    }
                    
                    container.innerHTML = agents.map(agent => \`
                        <div class="agent-item" id="agent-\${agent.id}">
                            <div class="agent-name">\${agent.name}</div>
                            <div class="agent-model">Model: \${agent.model}</div>
                            <div class="agent-actions">
                                <button onclick="deleteAgent('\${agent.id}')" class="delete-btn">Delete</button>
                            </div>
                        </div>
                    \`).join('');
                }
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'agentsLoaded':
                            renderAgents(message.agents);
                            break;
                        case 'agentDeleted':
                            const element = document.getElementById('agent-' + message.agentId);
                            if (element) element.remove();
                            break;
                        case 'error':
                            document.getElementById('agents-container').innerHTML = 
                                '<div class="empty-state">Error: ' + message.message + '</div>';
                            break;
                    }
                });
                
                // Load agents on startup
                loadAgents();
            </script>
        </body>
        </html>`;
    }
}