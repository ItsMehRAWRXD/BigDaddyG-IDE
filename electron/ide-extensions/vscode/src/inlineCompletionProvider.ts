import * as vscode from 'vscode';
import { BigDaddyGClient } from './client';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private debounceTimer: NodeJS.Timeout | null = null;

    constructor(private client: BigDaddyGClient) {}

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
        // Debounce to avoid too many requests
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        return new Promise((resolve) => {
            this.debounceTimer = setTimeout(async () => {
                try {
                    const textBeforeCursor = document.getText(
                        new vscode.Range(new vscode.Position(Math.max(0, position.line - 10), 0), position)
                    );

                    const completion = await this.client.getCompletion({
                        prompt: textBeforeCursor,
                        context: document.getText(),
                        language: document.languageId
                    });

                    if (completion && !token.isCancellationRequested) {
                        resolve([new vscode.InlineCompletionItem(completion)]);
                    } else {
                        resolve([]);
                    }
                } catch (error) {
                    console.error('Inline completion error:', error);
                    resolve([]);
                }
            }, 300);
        });
    }
}
