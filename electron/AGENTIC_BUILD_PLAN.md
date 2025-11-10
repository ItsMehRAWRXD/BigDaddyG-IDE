# BigDaddyG IDE - Full Agentic Build Plan
## 🎯 Goal: 15% → 100% Agentic in 10 Weeks

---

## Phase 0 – Groundwork (Week 0)
### 0.1 Monorepo Structure
- [ ] Create `packages/agent/` directory in monorepo
- [ ] Add `packages/agent/package.json` with basic dependencies
- [ ] Update root `package.json` workspaces to include agent package
- [ ] Ensure existing desktop build remains unaffected

### 0.2 Database Schema
- [ ] Create `AgentConfig` table in existing SQLite DB
  - [ ] `jobId` (TEXT PRIMARY KEY)
  - [ ] `state` (TEXT) - planning|coding|testing|reviewing|deploying
  - [ ] `planMarkdown` (TEXT)
  - [ ] `costUSD` (REAL DEFAULT 0)
  - [ ] `createdAt` (DATETIME DEFAULT CURRENT_TIMESTAMP)
- [ ] Add migration script for existing installations

### 0.3 Environment Configuration
- [ ] Add `AGENT_SANDBOX_ENDPOINT` env var (default: `unix:///var/run/bigdaddyg-sandbox.sock`)
- [ ] Update config loading to handle sandbox endpoint
- [ ] Ensure graceful fallback when sandbox unavailable

---

## Phase 1 – Disposable Runtime (Week 1)
### 1.1 Sandbox Daemon (`sandboxd`)
- [ ] Create `packages/agent/sandbox/` directory
- [ ] Build Go binary `sandboxd` with:
  - [ ] Unix socket listener
  - [ ] runc container management
  - [ ] OCI image `bigdaddyg/runtime:latest` support
  - [ ] tmpfs volume mounting
  - [ ] Capability dropping & cgroups v2 limits
  - [ ] stdout/stderr streaming via msgpack
- [ ] Create Dockerfile for `bigdaddyg/runtime:latest` (Node.js + Python + basic tools)
- [ ] Publish runtime image to GHCR

### 1.2 Desktop Integration
- [ ] Bundle `sandboxd` binary in desktop app resources
- [ ] Add opt-in startup mechanism (don't auto-start)
- [ ] Create sandbox process management in main process
- [ ] Add IPC communication between renderer and sandbox

### 1.3 Web Backend Support
- [ ] Add `/agent/sandbox` HTTP route in existing backend
- [ ] Implement proxy to `sandboxd` unix socket
- [ ] Handle WebSocket upgrade for streaming
- [ ] Add error handling for sandbox unavailable

### 1.4 Smoke Test
- [ ] Write test: agent writes `console.log('42')`
- [ ] Execute `node index.js` in sandbox
- [ ] Verify output capture and streaming
- [ ] **✅ Core Runtime Fabric Complete**

---

## Phase 2 – Job Queue & State Machine (Week 2)
### 2.1 Queue Infrastructure
- [ ] Add `bullmq` and `redis` dependencies
- [ ] Create `packages/agent/worker.ts`
- [ ] Set up `agentJobs` queue with Redis connection
- [ ] Add queue monitoring and health checks

### 2.2 State Machine Implementation
- [ ] Create job handlers for each state:
  - [ ] `PlanningJob` - generates markdown plan
  - [ ] `CodingJob` - writes/modifies code
  - [ ] `TestingJob` - runs tests in sandbox
  - [ ] `ReviewingJob` - self-critique and validation
  - [ ] `DeployingJob` - deployment with approval gate
- [ ] Implement state transitions and job chaining
- [ ] Add job progress tracking and logging

### 2.3 Error Handling & Retries
- [ ] Configure exponential backoff for failed jobs
- [ ] Add dead letter queue for permanently failed jobs
- [ ] Implement job timeout handling
- [ ] Add manual retry mechanisms

### 2.4 Approval Gate UI
- [ ] Create `<AgentGate>` React component
- [ ] Add "Approve & Continue" button for deploy state
- [ ] Implement approval workflow in job queue
- [ ] Add job pause/resume functionality
- [ ] **✅ Agent Orchestration Layer Complete**

---

## Phase 3 – Embeddings & RAG (Week 3)
### 3.1 Vector Database Setup
- [ ] Create `docker-compose.yml` with ChromaDB service
- [ ] Set up persistent volume `./chroma_data`
- [ ] Add ChromaDB client configuration
- [ ] Test connection and basic operations

### 3.2 Embedding Pipeline
- [ ] Create `@bg/agent-embed` package
- [ ] Implement file discovery via `git ls-files`
- [ ] Add file filtering for `*.{js,ts,jsx,tsx,py,md}`
- [ ] Create text chunking (≤512 tokens)
- [ ] Integrate `text-embedding-3-small` API
- [ ] Implement upsert to Chroma with metadata

### 3.3 Incremental Indexing
- [ ] Add git webhook handler for push events
- [ ] Implement incremental re-indexing
- [ ] Add file change detection and delta updates
- [ ] Create indexing status tracking

### 3.4 RAG Integration
- [ ] Implement semantic search (top-6 chunks ≈2k tokens)
- [ ] Auto-inject context into system prompts
- [ ] Add relevance scoring and filtering
- [ ] **✅ Project Context & RAG Complete**

---

## Phase 4 – Planner / Critic Loop (Week 4)
### 4.1 Planning System
- [ ] Create `packages/agent/planner.ts`
- [ ] Implement LLM call with planning prompt
- [ ] Generate markdown task lists with checkboxes
- [ ] Add goal + RAG context injection
- [ ] Store plans in `AgentConfig.planMarkdown`

### 4.2 Self-Critique System
- [ ] Create `packages/agent/critic.ts`
- [ ] Implement second LLM call for plan validation
- [ ] Add scoring system (1-10) and risk assessment
- [ ] Create feedback loop for plan improvement
- [ ] Add iteration limits to prevent infinite loops

### 4.3 Plan Management UI
- [ ] Render plans in chat UI with markdown
- [ ] Add in-place editing capabilities
- [ ] Implement plan approval workflow
- [ ] Add plan versioning and history
- [ ] **✅ Planning & Self-Critique Complete**

---

## Phase 5 – Tool Registry & Strict Types (Week 5)
### 5.1 Tool Schema Definition
- [ ] Create OpenAI-compatible `tools.json` schema
- [ ] Define tools: `file_write`, `npm_test`, `vercel_deploy`, etc.
- [ ] Add strict TypeScript interfaces for all tools
- [ ] Implement schema validation

### 5.2 Idempotent Tool Handlers
- [ ] Create ULID-based idempotency keys
- [ ] Implement `(jobId, toolName, params)` hashing
- [ ] Add execution result caching
- [ ] Create tool execution wrapper with retry logic

### 5.3 Access Control Layer
- [ ] Add ACL flags: `{approval: "auto|gate|forbid"}`
- [ ] Implement permission checking middleware
- [ ] Add user-configurable tool permissions
- [ ] Create audit trail for tool executions

### 5.4 Dynamic Tool Injection
- [ ] Auto-inject available tools into system prompts
- [ ] Add runtime tool discovery
- [ ] Implement conditional tool availability
- [ ] **✅ Tool Registry & MCP Complete**

---

## Phase 6 – CI & Test Harness (Week 6)
### 6.1 Project Detection
- [ ] Parse `package.json` for Node.js projects
- [ ] Parse `pyproject.toml` for Python projects
- [ ] Parse `Cargo.toml` for Rust projects
- [ ] Add support for other common project types
- [ ] Create project type detection logic

### 6.2 Test Scaffolding
- [ ] Auto-scaffold Jest tests for JS/TS projects
- [ ] Auto-scaffold pytest tests for Python projects
- [ ] Create basic test templates
- [ ] Add test file generation logic

### 6.3 Sandbox Test Execution
- [ ] Run tests inside sandbox environment
- [ ] Capture exit codes, stdout, stderr
- [ ] Generate coverage reports (JSON format)
- [ ] Add test result parsing and analysis

### 6.4 Test-Driven Development Loop
- [ ] Implement retry logic (max 5 attempts)
- [ ] Add test failure analysis
- [ ] Create code fix suggestions based on test failures
- [ ] **✅ Testing & CI Harness Complete**

---

## Phase 7 – Deployment & Rollback (Week 7)
### 7.1 Vercel Integration
- [ ] Create `packages/agent/deploy/vercel.ts`
- [ ] Implement Vercel API deployment
- [ ] Add 1% canary deployment with traffic splitting
- [ ] Store deployment URLs and aliases in DB

### 7.2 Rollback Mechanism
- [ ] Implement one-click rollback functionality
- [ ] Add automatic rollback on error rate >1%
- [ ] Integrate Vercel analytics API monitoring
- [ ] Create rollback UI components

### 7.3 Multi-Platform Support
- [ ] Add Netlify deployment module
- [ ] Add Cloudflare Pages deployment module
- [ ] Add Docker Hub deployment module
- [ ] Create deployment provider abstraction

### 7.4 Deployment Monitoring
- [ ] Add deployment status tracking
- [ ] Implement health check endpoints
- [ ] Create deployment analytics dashboard
- [ ] **✅ Deployment & Rollback Complete**

---

## Phase 8 – Observability & Cost Caps (Week 8)
### 8.1 Telemetry System
- [ ] Create `packages/agent/telemetry.ts`
- [ ] Wrap LLM calls with OpenTelemetry spans
- [ ] Wrap tool calls with tracing
- [ ] Export to OTEL HTTP (Grafana Cloud integration)

### 8.2 Cost Tracking
- [ ] Implement token counting (tiktoken/Anthropic)
- [ ] Update `AgentConfig.costUSD` after each LLM call
- [ ] Add real-time cost monitoring
- [ ] Create cost breakdown by operation type

### 8.3 Cost Governance
- [ ] Add daily cron job for spend aggregation
- [ ] Implement 80% monthly cap warnings
- [ ] Add automatic agent disabling on budget exceeded
- [ ] Create cost alert email system
- [ ] **✅ Observability & Cost Governance Complete**

---

## Phase 9 – Compliance & Audit Trail (Week 9)
### 9.1 Audit Logging
- [ ] Create JWT-signed audit payload system
- [ ] Implement `audit.csv` generation after each job
- [ ] Add S3-compatible bucket storage
- [ ] Include: `{jobId, userId, action, params, cost, timestamp, signature}`

### 9.2 Data Export & Management
- [ ] Create `/agent/audit/export` endpoint
- [ ] Implement date range filtering for exports
- [ ] Add CSV streaming for large datasets
- [ ] Create audit report generation

### 9.3 GDPR Compliance
- [ ] Implement `/agent/data-delete` endpoint
- [ ] Add hard deletion of all user data
- [ ] Create data retention policies
- [ ] Add consent management system
- [ ] **✅ Compliance & Audit Complete**

---

## Phase 10 – Polish & Dog-food (Week 10)
### 10.1 Slash Commands
- [ ] Implement `/plan` command in chat
- [ ] Implement `/test` command in chat
- [ ] Implement `/deploy` command in chat
- [ ] Add command auto-completion

### 10.2 Session Management
- [ ] Persist chat threads in database
- [ ] Add session resume on refresh
- [ ] Implement conversation history
- [ ] Add session export/import

### 10.3 UI Enhancements
- [ ] Create dark-mode agent diff viewer in Monaco
- [ ] Add syntax highlighting for diffs
- [ ] Implement collapsible code sections
- [ ] Add progress indicators for long operations

### 10.4 Template Repository
- [ ] Create public `agent-starter` template repo
- [ ] Add TodoMVC React example
- [ ] Include comprehensive documentation
- [ ] Add one-click deployment setup

---

## 🎯 Exit Criteria Validation
### Final Test Scenario:
1. [ ] Clone `agent-starter` repo
2. [ ] Open issue: "Create a React PWA that stores notes in IndexedDB and works offline"
3. [ ] Verify agent completes within 10 minutes:
   - [ ] Posts plan markdown
   - [ ] Shows passing CI screenshot
   - [ ] Provides Vercel preview URL
   - [ ] Achieves Lighthouse score ≥90
4. [ ] User only clicks "Approve deploy"

---

## 📊 Progress Tracking
- [ ] Phase 0: Groundwork (Week 0)
- [ ] Phase 1: Disposable Runtime (Week 1)
- [ ] Phase 2: Job Queue & State Machine (Week 2)
- [ ] Phase 3: Embeddings & RAG (Week 3)
- [ ] Phase 4: Planner / Critic Loop (Week 4)
- [ ] Phase 5: Tool Registry & Strict Types (Week 5)
- [ ] Phase 6: CI & Test Harness (Week 6)
- [ ] Phase 7: Deployment & Rollback (Week 7)
- [ ] Phase 8: Observability & Cost Caps (Week 8)
- [ ] Phase 9: Compliance & Audit Trail (Week 9)
- [ ] Phase 10: Polish & Dog-food (Week 10)

**Total Tasks: 150+ actionable items**
**Estimated Effort: 2-3 days per phase**
**Target: Fully agentic IDE in 10 weeks**