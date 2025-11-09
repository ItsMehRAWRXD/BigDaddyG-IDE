import * as vscode from 'vscode';
import { BigDaddyGClient, Agent } from './client';

export class AgentTreeProvider implements vscode.TreeDataProvider<AgentTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<AgentTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private client: BigDaddyGClient) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: AgentTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: AgentTreeItem): Promise<AgentTreeItem[]> {
        if (!element) {
            const agents = await this.client.getAgents();
            return agents.map(agent => new AgentTreeItem(agent));
        }
        return [];
    }
}

class AgentTreeItem extends vscode.TreeItem {
    constructor(public readonly agent: Agent) {
        super(agent.name, vscode.TreeItemCollapsibleState.None);
        this.description = agent.description;
        this.tooltip = `${agent.name}\n${agent.description}\n\nCapabilities:\n${agent.capabilities.join('\n')}`;
        this.contextValue = 'agent';
        this.command = {
            command: 'bigdaddyg.selectAgent',
            title: 'Select Agent',
            arguments: [agent]
        };
    }
}
