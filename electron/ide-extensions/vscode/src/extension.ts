import * as vscode from 'vscode';
import { BigDaddyGClient } from './services/bigdaddyg-client';
import { ChatViewProvider } from './providers/chat-view-provider';
import { AgentsViewProvider } from './providers/agents-view-provider';
import { AuthenticationService } from './services/authentication-service';
import { SecurityManager } from './services/security-manager';
import { TelemetryService } from './services/telemetry-service';

let client: BigDaddyGClient;
let authService: AuthenticationService;
let securityManager: SecurityManager;
let telemetryService: TelemetryService;

export async function activate(context: vscode.ExtensionContext) {
    console.log('BigDaddyG Agentic Coding extension is activating...');

    // Initialize services
    securityManager = new SecurityManager(context);
    authService = new AuthenticationService(context, securityManager);
    telemetryService = new TelemetryService(context);
    
    await securityManager.initialize();
    await authService.initialize();
    
    // Initialize BigDaddyG client
    const config = vscode.workspace.getConfiguration('bigdaddyg');
    const serverUrl = config.get<string>('serverUrl', 'http://localhost:11441');
    
    client = new BigDaddyGClient(serverUrl, authService, securityManager);
    await client.initialize();

    // Register view providers
    const chatProvider = new ChatViewProvider(context.extensionUri, client);
    const agentsProvider = new AgentsViewProvider(context.extensionUri, client);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('bigdaddyg.chatView', chatProvider),
        vscode.window.registerWebviewViewProvider('bigdaddyg.agentsView', agentsProvider)
    );

    // Register commands
    registerCommands(context);

    // Set context for views
    vscode.commands.executeCommand('setContext', 'bigdaddyg.enabled', true);

    // Status bar
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(robot) BigDaddyG';
    statusBar.command = 'bigdaddyg.chat';
    statusBar.show();
    context.subscriptions.push(statusBar);

    telemetryService.logEvent('extension.activated');
    console.log('BigDaddyG extension activated successfully');
}

function registerCommands(context: vscode.ExtensionContext) {
    // Chat command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.chat', async () => {
            const input = await vscode.window.showInputBox({
                prompt: 'Ask BigDaddyG anything',
                placeHolder: 'Type your question or request...'
            });
            
            if (input) {
                const response = await client.chat(input);
                vscode.window.showInformationMessage(response.content);
            }
        })
    );

    // Generate code command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.generateCode', async () => {
            const prompt = await vscode.window.showInputBox({
                prompt: 'Describe the code you want to generate',
                placeHolder: 'e.g., Create a REST API endpoint for user authentication'
            });
            
            if (!prompt) return;

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Generating code...',
                cancellable: false
            }, async () => {
                const response = await client.generateCode(prompt, editor.document.languageId);
                const position = editor.selection.active;
                await editor.edit(editBuilder => {
                    editBuilder.insert(position, response.content);
                });
            });
        })
    );

    // Analyze code command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.analyzeCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const code = editor.document.getText(selection);

            if (!code) {
                vscode.window.showErrorMessage('No code selected');
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing code...',
                cancellable: false
            }, async () => {
                const analysis = await client.analyzeCode(code, editor.document.languageId);
                
                const panel = vscode.window.createWebviewPanel(
                    'bigdaddyg.analysis',
                    'Code Analysis',
                    vscode.ViewColumn.Beside,
                    { enableScripts: true }
                );

                panel.webview.html = getAnalysisHtml(analysis);
            });
        })
    );

    // Debug code command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.debugCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
            if (diagnostics.length === 0) {
                vscode.window.showInformationMessage('No errors found');
                return;
            }

            const code = editor.document.getText();
            const errors = diagnostics.map(d => d.message).join('\n');

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Debugging code...',
                cancellable: false
            }, async () => {
                const solution = await client.debugCode(code, errors, editor.document.languageId);
                
                const action = await vscode.window.showInformationMessage(
                    'Debug solution ready',
                    'Apply Fix',
                    'View Solution'
                );

                if (action === 'Apply Fix') {
                    await editor.edit(editBuilder => {
                        const fullRange = new vscode.Range(
                            editor.document.positionAt(0),
                            editor.document.positionAt(editor.document.getText().length)
                        );
                        editBuilder.replace(fullRange, solution.content);
                    });
                } else if (action === 'View Solution') {
                    const doc = await vscode.workspace.openTextDocument({
                        content: solution.content,
                        language: editor.document.languageId
                    });
                    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                }
            });
        })
    );

    // Fix code command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.fixCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const code = editor.document.getText(selection);

            if (!code) {
                vscode.window.showErrorMessage('No code selected');
                return;
            }

            const issue = await vscode.window.showInputBox({
                prompt: 'Describe the issue to fix',
                placeHolder: 'e.g., Fix memory leak, Improve performance'
            });

            if (!issue) return;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Fixing code...',
                cancellable: false
            }, async () => {
                const fix = await client.fixCode(code, issue, editor.document.languageId);
                
                await editor.edit(editBuilder => {
                    editBuilder.replace(selection, fix.content);
                });
            });
        })
    );

    // Explain code command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.explainCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const code = editor.document.getText(selection);

            if (!code) {
                vscode.window.showErrorMessage('No code selected');
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Explaining code...',
                cancellable: false
            }, async () => {
                const explanation = await client.explainCode(code, editor.document.languageId);
                
                const panel = vscode.window.createWebviewPanel(
                    'bigdaddyg.explanation',
                    'Code Explanation',
                    vscode.ViewColumn.Beside,
                    { enableScripts: true }
                );

                panel.webview.html = getExplanationHtml(explanation);
            });
        })
    );

    // Refactor code command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.refactorCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const code = editor.document.getText(selection);

            if (!code) {
                vscode.window.showErrorMessage('No code selected');
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Refactoring code...',
                cancellable: false
            }, async () => {
                const refactored = await client.refactorCode(code, editor.document.languageId);
                
                const action = await vscode.window.showInformationMessage(
                    'Refactoring complete',
                    'Apply Changes',
                    'View Diff'
                );

                if (action === 'Apply Changes') {
                    await editor.edit(editBuilder => {
                        editBuilder.replace(selection, refactored.content);
                    });
                } else if (action === 'View Diff') {
                    const originalDoc = await vscode.workspace.openTextDocument({
                        content: code,
                        language: editor.document.languageId
                    });
                    const refactoredDoc = await vscode.workspace.openTextDocument({
                        content: refactored.content,
                        language: editor.document.languageId
                    });
                    await vscode.commands.executeCommand('vscode.diff', originalDoc.uri, refactoredDoc.uri, 'Original ↔ Refactored');
                }
            });
        })
    );

    // Create agent command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.createAgent', async () => {
            const name = await vscode.window.showInputBox({
                prompt: 'Agent name',
                placeHolder: 'e.g., Code Reviewer'
            });

            if (!name) return;

            const model = await vscode.window.showQuickPick(
                ['bigdaddyg:latest', 'qwen2.5-coder:7b', 'llama3.2:3b'],
                { placeHolder: 'Select model' }
            );

            if (!model) return;

            const tools = await vscode.window.showQuickPick(
                ['file-system', 'code-execution', 'web-search', 'calculator'],
                { placeHolder: 'Select tools', canPickMany: true }
            );

            const agent = await client.createAgent({
                name,
                model,
                tools: tools || []
            });

            vscode.window.showInformationMessage(`Agent "${agent.name}" created successfully`);
        })
    );

    // Show agents command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.showAgents', async () => {
            const agents = await client.listAgents();
            
            const items = agents.map(agent => ({
                label: agent.name,
                description: agent.model,
                detail: `Status: ${agent.status} | Created: ${new Date(agent.created).toLocaleString()}`
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select an agent to view details'
            });

            if (selected) {
                vscode.window.showInformationMessage(`Agent: ${selected.label}\nModel: ${selected.description}`);
            }
        })
    );

    // Toggle sandbox command
    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.toggleSandbox', async () => {
            const config = vscode.workspace.getConfiguration('bigdaddyg');
            const current = config.get<boolean>('sandboxMode', true);
            await config.update('sandboxMode', !current, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Sandbox mode ${!current ? 'enabled' : 'disabled'}`);
        })
    );
}

function getAnalysisHtml(analysis: any): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: var(--vscode-font-family); padding: 20px; }
            h2 { color: var(--vscode-editor-foreground); }
            .section { margin: 20px 0; padding: 15px; background: var(--vscode-editor-background); border-radius: 5px; }
            pre { background: var(--vscode-textCodeBlock-background); padding: 10px; border-radius: 3px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h2>Code Analysis Results</h2>
        <div class="section">
            <h3>Summary</h3>
            <pre>${analysis.content}</pre>
        </div>
    </body>
    </html>`;
}

function getExplanationHtml(explanation: any): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: var(--vscode-font-family); padding: 20px; }
            h2 { color: var(--vscode-editor-foreground); }
            .explanation { margin: 20px 0; line-height: 1.6; }
            code { background: var(--vscode-textCodeBlock-background); padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h2>Code Explanation</h2>
        <div class="explanation">
            ${explanation.content.replace(/\n/g, '<br>')}
        </div>
    </body>
    </html>`;
}

export function deactivate() {
    if (client) {
        client.dispose();
    }
    if (telemetryService) {
        telemetryService.logEvent('extension.deactivated');
    }
}
