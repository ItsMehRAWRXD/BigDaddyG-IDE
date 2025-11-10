# BigDaddyG Agent Core

Phase 0 groundwork for the agentic AI system.

## Features

- **Job Management**: Create and track agentic jobs with state persistence
- **SQLite Database**: AgentConfig table for job metadata and cost tracking
- **Sandbox Integration**: Configurable endpoint for future container runtime
- **Desktop Compatible**: Graceful fallback when sandbox daemon unavailable

## Usage

```javascript
const { AgentCore } = require('@bigdaddyg/agent');

const agent = new AgentCore({
  dbPath: './agent.db'
});

// Create a new job
const jobId = await agent.createJob('# Build React PWA\n- Setup project\n- Add components');

// Update job state
await agent.updateJobState(jobId, 'coding', { costUSD: 0.05 });

// Get job details
const job = await agent.getJob(jobId);
```

## Environment Variables

- `AGENT_SANDBOX_ENDPOINT`: Sandbox daemon endpoint (default: `unix:///var/run/bigdaddyg-sandbox.sock`)

## Database Schema

```sql
CREATE TABLE agent_config (
  jobId TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'planning',
  planMarkdown TEXT,
  costUSD REAL DEFAULT 0.0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## States

- `planning` - Initial state, creating execution plan
- `coding` - Writing/modifying code
- `testing` - Running tests and validation
- `review` - Code review and quality checks
- `deploy` - Deployment and rollback management
- `completed` - Job finished successfully
- `failed` - Job failed with errors