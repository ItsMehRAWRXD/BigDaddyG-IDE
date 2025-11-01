const WebSocket = require('ws');
const http = require('http');

// ============================================================================
// BIGDADDYG AGENT WEBSOCKET SERVER
// ============================================================================
// Real-time multi-agent orchestration system
// Port: 8001
// ============================================================================

const PORT = 8001;
const HOST = '0.0.0.0';

console.log('🤖 Starting BigDaddyG Agent WebSocket Server...');
console.log(`📍 Port: ${PORT}`);

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }
    
    if (req.url === '/health') {
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'BigDaddyG Agent WebSocket Server',
            port: PORT,
            active_connections: wss.clients.size,
            agents: ['Elder', 'Fetcher', 'Browser', 'Parser'],
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Agent registry
const agents = {
    Elder: {
        name: 'Elder',
        description: 'Orchestrates all operations',
        status: 'idle',
        tasks_completed: 0
    },
    Fetcher: {
        name: 'Fetcher',
        description: 'Retrieves web content',
        status: 'idle',
        tasks_completed: 0
    },
    Browser: {
        name: 'Browser',
        description: 'Controls web navigation',
        status: 'idle',
        tasks_completed: 0
    },
    Parser: {
        name: 'Parser',
        description: 'Processes and analyzes data',
        status: 'idle',
        tasks_completed: 0
    }
};

// Track connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    clients.add(ws);
    
    console.log(`🔗 Client connected: ${clientId}`);
    console.log(`📊 Total connections: ${clients.size}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        message: 'Connected to BigDaddyG Agent System',
        clientId: clientId,
        agents: Object.values(agents),
        timestamp: new Date().toISOString()
    }));
    
    // Handle incoming messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`📨 Received command: ${data.command} from ${clientId}`);
            
            switch (data.command) {
                case 'run_agent':
                    await handleRunAgent(ws, data.agent, data.data);
                    break;
                    
                case 'get_status':
                    handleGetStatus(ws);
                    break;
                    
                case 'get_agents':
                    handleGetAgents(ws);
                    break;
                    
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                    break;
                    
                default:
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: `Unknown command: ${data.command}`,
                        timestamp: new Date().toISOString()
                    }));
            }
        } catch (error) {
            console.error('❌ Message parsing error:', error.message);
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            }));
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`🔌 Client disconnected: ${clientId}`);
        console.log(`📊 Total connections: ${clients.size}`);
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${clientId}:`, error.message);
    });
});

// Agent execution handler
async function handleRunAgent(ws, agentName, data) {
    if (!agents[agentName]) {
        ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown agent: ${agentName}`,
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    const agent = agents[agentName];
    
    // Update agent status
    agent.status = 'active';
    
    // Send status update
    ws.send(JSON.stringify({
        agent: agentName,
        status: 'active',
        message: `${agentName} agent started`,
        timestamp: new Date().toISOString()
    }));
    
    // Simulate agent work (in production, this would call Orchestra or perform real tasks)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Complete task
    agent.status = 'idle';
    agent.tasks_completed++;
    
    // Send completion message
    ws.send(JSON.stringify({
        agent: agentName,
        status: 'done',
        message: getAgentCompletionMessage(agentName),
        tasks_completed: agent.tasks_completed,
        timestamp: new Date().toISOString()
    }));
    
    console.log(`✅ ${agentName} agent completed task (Total: ${agent.tasks_completed})`);
}

// Get agent completion messages
function getAgentCompletionMessage(agentName) {
    const messages = {
        Elder: 'Orchestration complete - all systems synchronized',
        Fetcher: 'Data retrieved successfully from sources',
        Browser: 'Navigation task completed',
        Parser: 'Data parsed and structured successfully'
    };
    return messages[agentName] || 'Task completed';
}

// Get status handler
function handleGetStatus(ws) {
    ws.send(JSON.stringify({
        type: 'status',
        agents: Object.values(agents),
        active_connections: clients.size,
        timestamp: new Date().toISOString()
    }));
}

// Get agents handler
function handleGetAgents(ws) {
    ws.send(JSON.stringify({
        type: 'agents',
        agents: Object.values(agents),
        timestamp: new Date().toISOString()
    }));
}

// Broadcast to all clients
function broadcast(message) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// Heartbeat to keep connections alive
setInterval(() => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
            }));
        }
    });
}, 30000); // Every 30 seconds

// Start server
server.listen(PORT, HOST, () => {
    console.log('✅ BigDaddyG Agent WebSocket Server is LIVE!');
    console.log(`📍 ws://localhost:${PORT}`);
    console.log(`📍 ws://127.0.0.1:${PORT}`);
    console.log(`📍 Listening on all interfaces (${HOST}:${PORT})`);
    console.log('');
    console.log('🎯 Available Agents:');
    Object.values(agents).forEach(agent => {
        console.log(`   🤖 ${agent.name}: ${agent.description}`);
    });
    console.log('');
    console.log('🌐 CORS: Enabled for browser access');
    console.log('💓 Heartbeat: Active (30s interval)');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Agent WebSocket Server...');
    wss.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});

