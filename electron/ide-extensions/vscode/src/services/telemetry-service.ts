import * as vscode from 'vscode';

export interface TelemetryEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp: string;
}

export class TelemetryService {
    private events: TelemetryEvent[] = [];

    constructor(private context: vscode.ExtensionContext) {}

    logEvent(name: string, properties?: Record<string, any>): void {
        const event: TelemetryEvent = {
            name,
            properties,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        console.log(`Telemetry [${name}]:`, properties);
        
        if (this.events.length > 500) {
            this.events = this.events.slice(-250);
        }
    }

    getEvents(): TelemetryEvent[] {
        return [...this.events];
    }
}