#!/usr/bin/env node

/**
 * BigDaddyG IDE - Remote Log Server
 * Receives logs from IDE instances (even on remote PCs!)
 * View all logs in real-time in your terminal
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.LOG_PORT || 11442;
const HOST = process.env.LOG_HOST || '0.0.0.0'; // Listen on all interfaces for remote

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   BigDaddyG IDE - Remote Log Server                      ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('BigDaddyG Remote Log Server - Use WebSocket on this port\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

const sessions = new Map();
let totalLogs = 0;

// Color codes for terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
};

function formatLog(logEntry) {
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const levelColors = {
        log: colors.white,
        info: colors.cyan,
        warn: colors.yellow,
        error: colors.red,
        debug: colors.gray,
        event: colors.magenta,
        status: colors.green
    };
    
    const levelColor = levelColors[logEntry.level] || colors.white;
    const categoryColor = colors.bright + colors.blue;
    
    let dataStr = '';
    if (typeof logEntry.data === 'object') {
        dataStr = JSON.stringify(logEntry.data, null, 2);
    } else {
        dataStr = logEntry.data;
    }
    
    return `${colors.gray}[${timestamp}]${colors.reset} ${levelColor}${logEntry.level.toUpperCase()}${colors.reset} ${categoryColor}${logEntry.category}${colors.reset}: ${dataStr}`;
}

wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`\n${colors.green}✅ CLIENT CONNECTED${colors.reset} from ${colors.cyan}${clientIP}${colors.reset}\n`);
    
    ws.on('message', (message) => {
        try {
            const logEntry = JSON.parse(message.toString());
            totalLogs++;
            
            // Track session
            if (logEntry.type === 'session_start') {
                sessions.set(logEntry.sessionId, {
                    startTime: Date.now(),
                    clientIP,
                    userAgent: logEntry.userAgent,
                    platform: logEntry.platform,
                    logCount: 0
                });
                
                console.log(`\n${colors.bright}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
                console.log(`${colors.bright}${colors.green}🚀 NEW SESSION STARTED${colors.reset}`);
                console.log(`${colors.bright}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
                console.log(`  Session ID: ${colors.cyan}${logEntry.sessionId}${colors.reset}`);
                console.log(`  Client IP: ${colors.cyan}${clientIP}${colors.reset}`);
                console.log(`  Platform: ${colors.cyan}${logEntry.platform}${colors.reset}`);
                console.log(`  User Agent: ${colors.gray}${logEntry.userAgent}${colors.reset}`);
                console.log(`${colors.bright}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
                return;
            }
            
            // Update session stats
            const session = sessions.get(logEntry.sessionId);
            if (session) {
                session.logCount++;
            }
            
            // Format and display log
            console.log(formatLog(logEntry));
            
            // Special handling for errors
            if (logEntry.level === 'error') {
                console.log(`${colors.red}${colors.bright}⚠️  ERROR DETAILS:${colors.reset}`);
                if (logEntry.data.stack) {
                    console.log(`${colors.red}${logEntry.data.stack}${colors.reset}`);
                }
                console.log('');
            }
            
        } catch (error) {
            console.error(`${colors.red}Failed to parse log:${colors.reset}`, error);
        }
    });
    
    ws.on('close', () => {
        console.log(`\n${colors.yellow}⚠️  CLIENT DISCONNECTED${colors.reset} from ${colors.cyan}${clientIP}${colors.reset}\n`);
    });
    
    ws.on('error', (error) => {
        console.error(`${colors.red}WebSocket error:${colors.reset}`, error);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`${colors.green}✅ Remote Log Server Started${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}📡 Listening on:${colors.reset} ${colors.cyan}${HOST}:${PORT}${colors.reset}`);
    console.log(`${colors.bright}🌐 WebSocket URL:${colors.reset} ${colors.cyan}ws://${HOST}:${PORT}${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}💡 TIP:${colors.reset} To monitor remote PCs, change ${colors.cyan}localhost${colors.reset} to your PC's IP`);
    console.log(`${colors.yellow}💡 USAGE:${colors.reset} Launch BigDaddyG IDE anywhere and logs appear here!`);
    console.log('');
    console.log(`${colors.bright}${colors.magenta}Waiting for connections...${colors.reset}`);
    console.log('');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(`\n\n${colors.yellow}📊 SESSION SUMMARY:${colors.reset}`);
    console.log(`  Total Sessions: ${colors.cyan}${sessions.size}${colors.reset}`);
    console.log(`  Total Logs: ${colors.cyan}${totalLogs}${colors.reset}`);
    console.log('');
    
    sessions.forEach((session, sessionId) => {
        const duration = ((Date.now() - session.startTime) / 1000).toFixed(1);
        console.log(`  ${colors.gray}Session: ${sessionId}${colors.reset}`);
        console.log(`    Logs: ${colors.cyan}${session.logCount}${colors.reset}`);
        console.log(`    Duration: ${colors.cyan}${duration}s${colors.reset}`);
        console.log(`    Client: ${colors.gray}${session.clientIP}${colors.reset}`);
        console.log('');
    });
    
    console.log(`${colors.green}✅ Remote Log Server stopped${colors.reset}\n`);
    process.exit(0);
});

// Health check
setInterval(() => {
    if (sessions.size > 0) {
        console.log(`${colors.gray}[Status] ${sessions.size} active session(s), ${totalLogs} total logs${colors.reset}`);
    }
}, 60000); // Every minute

console.log(`${colors.dim}[RemoteLogServer] Press Ctrl+C to stop${colors.reset}\n`);

