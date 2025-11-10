import * as vscode from 'vscode';
import { ChatViewProvider } from './chatViewProvider';
import { AgentTreeProvider } from './agentTreeProvider';
import { BigDaddyGClient } from './client';
import { VoiceCodingService } from './voiceCoding';
import { CodeFixService } from './codeFix';

let client: BigDaddyGClient;
let voiceService: VoiceCodingService;
let codeFixService: CodeFixService;

export function activate(context: vscode.ExtensionContext) {
    console.log('BigDaddyG extension activated');

    const config = vscode.workspace.getConfiguration('bigdaddyg');
    const apiEndpoint = config.get<string>('apiEndpoint', 'http://localhost:11434');
    
    client = new BigDaddyGClient(apiEndpoint);
    voiceService = new VoiceCodingService(client);
    codeFixService = new CodeFixService(client);

    const chatProvider = new ChatViewProvider(context.extensionUri, client);
    const agentProvider = new AgentTreeProvider();

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('bigdaddyg.chatView', chatProvider)
    );

    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('bigdaddyg.agentView', agentProvider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.chat', () => {
            vscode.commands.executeCommand('workbench.view.extension.bigdaddyg');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.voiceCode', async () => {
            if (voiceService.isRecording) {
                await voiceService.stopRecording();
            } else {
                await voiceService.startRecording();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.fixCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'BigDaddyG: Fixing code...',
                cancellable: false
            }, async () => {
                await codeFixService.fixCode(editor);
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.explainCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const text = editor.document.getText(selection);
            
            const explanation = await client.chat({
                model: config.get<string>('defaultModel', 'bigdaddyg:latest'),
                messages: [{
                    role: 'user',
                    content: `Explain this code:\n\n${text}`
                }]
            });

            const panel = vscode.window.createWebviewPanel(
                'codeExplanation',
                'Code Explanation',
                vscode.ViewColumn.Beside,
                {}
            );

            panel.webview.html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { padding: 20px; font-family: var(--vscode-font-family); }
                        pre { background: var(--vscode-textCodeBlock-background); padding: 10px; }
                    </style>
                </head>
                <body>
                    <h2>Code Explanation</h2>
                    <pre>${text}</pre>
                    <div>${explanation}</div>
                </body>
                </html>
            `;
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.generateTests', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const code = editor.document.getText();
            const language = editor.document.languageId;

            const tests = await client.chat({
                model: config.get<string>('defaultModel', 'bigdaddyg:latest'),
                messages: [{
                    role: 'user',
                    content: `Generate comprehensive unit tests for this ${language} code:\n\n${code}`
                }]
            });

            const doc = await vscode.workspace.openTextDocument({
                content: tests,
                language: language
            });

            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.refactor', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.selection;
            const text = editor.document.getText(selection);

            const refactored = await client.chat({
                model: config.get<string>('defaultModel', 'bigdaddyg:latest'),
                messages: [{
                    role: 'user',
                    content: `Refactor this code for better readability and performance:\n\n${text}`
                }]
            });

            await editor.edit(editBuilder => {
                editBuilder.replace(selection, refactored);
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('bigdaddyg.selectModel', async () => {
            const models = await client.listModels();
            const selected = await vscode.window.showQuickPick(models, {
                placeHolder: 'Select AI model'
            });

            if (selected) {
                await config.update('defaultModel', selected, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Model changed to: ${selected}`);
            }
        })
    );

    // Auto-fix on save
    if (config.get<boolean>('autoFix', true)) {
        context.subscriptions.push(
            vscode.workspace.onWillSaveTextDocument(async (event) => {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document === event.document) {
                    event.waitUntil(codeFixService.fixCode(editor));
                }
            })
        );
    }

    // Status bar
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(robot) BigDaddyG';
    statusBar.command = 'bigdaddyg.chat';
    statusBar.show();
    context.subscriptions.push(statusBar);

    vscode.window.showInformationMessage('BigDaddyG AI Assistant is ready!');
}

export function deactivate() {
    if (voiceService) {
        voiceService.dispose();
    }
}
