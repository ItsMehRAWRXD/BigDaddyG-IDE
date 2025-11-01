-- GenesisOS - Introspectable Agent Registry (IAR)
-- PostgreSQL schema with ltree for hierarchical spawn trees

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search

-- ============================================================================
-- AGENT TABLE
-- ============================================================================

CREATE TABLE agent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,                    -- Multi-tenant isolation
  parent_id UUID REFERENCES agent(id) ON DELETE CASCADE,
  spawn_tree LTREE NOT NULL,                  -- Hierarchical path (e.g., '1.2.3')
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,                  -- 'BigDaddyG', 'Elder', 'Fetcher', etc.
  origin VARCHAR(255) NOT NULL,               -- Isolated origin ID
  
  -- State
  mem_state JSONB DEFAULT '{}',               -- Last 128 KB working memory
  goals JSONB DEFAULT '[]',                   -- [{id, weight, ttl}]
  emotion JSONB DEFAULT '{}',                 -- PAD vector + categorical label
  
  -- Capabilities
  capabilities JSONB DEFAULT '[]',            -- What can this agent do?
  permissions JSONB DEFAULT '{}',             -- OPA policy decisions
  
  -- Telemetry
  cpu_usage FLOAT DEFAULT 0.0,
  memory_usage FLOAT DEFAULT 0.0,
  error_rate FLOAT DEFAULT 0.0,
  task_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 1.0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_agent_tenant ON agent(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agent_spawn_tree ON agent USING GIST(spawn_tree);
CREATE INDEX idx_agent_emotion ON agent USING GIN(emotion);
CREATE INDEX idx_agent_parent ON agent(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agent_created ON agent(created_at DESC);

-- ============================================================================
-- COGNITION EVENT TABLE
-- ============================================================================

CREATE TABLE cognition_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agent(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Event type
  type VARCHAR(20) NOT NULL CHECK(type IN ('perceive', 'plan', 'act', 'reflect')),
  
  -- Payload
  payload JSONB NOT NULL,
  
  -- MITRE ATT&CK mapping (if applicable)
  mitre_technique VARCHAR(20),                -- e.g., 'T1071.004'
  mitre_tactic VARCHAR(50),                   -- e.g., 'Command and Control'
  
  -- Timing
  ts TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER
);

-- Indexes for cognition queries
CREATE INDEX idx_cognition_agent_ts ON cognition_event(agent_id, ts DESC);
CREATE INDEX idx_cognition_type ON cognition_event(type, ts DESC);
CREATE INDEX idx_cognition_mitre ON cognition_event(mitre_technique) WHERE mitre_technique IS NOT NULL;
CREATE INDEX idx_cognition_tenant ON cognition_event(tenant_id, ts DESC);

-- ============================================================================
-- MESH MEMBERSHIP TABLE
-- ============================================================================

CREATE TABLE mesh_peer (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agent(id) ON DELETE CASCADE,
  peer_id VARCHAR(255) NOT NULL,              -- libp2p/WebRTC peer ID
  multiaddr TEXT NOT NULL,                    -- Connection address
  emotion_hash VARCHAR(64),                   -- SHA-256 of emotional state
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mesh_agent ON mesh_peer(agent_id);
CREATE INDEX idx_mesh_heartbeat ON mesh_peer(last_heartbeat DESC);

-- ============================================================================
-- ROW-LEVEL SECURITY (Multi-Tenancy)
-- ============================================================================

ALTER TABLE agent ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognition_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesh_peer ENABLE ROW LEVEL SECURITY;

-- Agents can only see agents in their tenant
CREATE POLICY tenant_isolation ON agent
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_cognition ON cognition_event
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_mesh ON mesh_peer
  USING (
    EXISTS (
      SELECT 1 FROM agent 
      WHERE agent.id = mesh_peer.agent_id 
      AND agent.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

CREATE VIEW agent_emotion_distribution AS
SELECT 
  tenant_id,
  emotion->>'label' AS emotion_label,
  COUNT(*) AS agent_count,
  AVG((emotion->>'pleasure')::float) AS avg_pleasure,
  AVG((emotion->>'arousal')::float) AS avg_arousal,
  AVG((emotion->>'fatigue')::float) AS avg_fatigue
FROM agent
WHERE deleted_at IS NULL
GROUP BY tenant_id, emotion->>'label';

CREATE VIEW agent_spawn_depth AS
SELECT 
  tenant_id,
  nlevel(spawn_tree) AS depth,
  COUNT(*) AS agent_count
FROM agent
WHERE deleted_at IS NULL
GROUP BY tenant_id, nlevel(spawn_tree);

CREATE VIEW cognition_by_type AS
SELECT 
  tenant_id,
  type,
  COUNT(*) AS event_count,
  AVG(duration_ms) AS avg_duration_ms
FROM cognition_event
WHERE ts > NOW() - INTERVAL '24 hours'
GROUP BY tenant_id, type;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Trim agent memory to 128 KB
CREATE OR REPLACE FUNCTION trim_agent_memory() RETURNS TRIGGER AS $$
BEGIN
  IF pg_column_size(NEW.mem_state) > 128 * 1024 THEN
    -- Offload to S3 (handled by application)
    RAISE NOTICE 'Agent % memory exceeds 128KB, triggering offload', NEW.id;
    -- Keep only last 10 entries
    NEW.mem_state = jsonb_build_object(
      'truncated', true,
      'last_10', (SELECT jsonb_agg(value) FROM jsonb_each(NEW.mem_state) LIMIT 10)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_memory_trim
  BEFORE INSERT OR UPDATE OF mem_state ON agent
  FOR EACH ROW
  EXECUTE FUNCTION trim_agent_memory();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_updated_at
  BEFORE UPDATE ON agent
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- SEED DATA (Development)
-- ============================================================================

INSERT INTO agent (tenant_id, parent_id, spawn_tree, name, type, origin, emotion, goals)
VALUES 
  (
    uuid_generate_v4(),
    NULL,
    '/',
    'BigDaddyG',
    'root',
    'isolated-' || uuid_generate_v4()::text,
    '{"pleasure": 0.7, "arousal": 0.6, "dominance": 0.5, "label": "CALM", "fatigue": 0.0}',
    '[{"id": "boot-system", "weight": 1.0, "ttl": 3600}]'
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE agent IS 'Introspectable Agent Registry - every agent in the mesh';
COMMENT ON COLUMN agent.spawn_tree IS 'Hierarchical spawn path using ltree (e.g., 1.2.3 means child of child of root)';
COMMENT ON COLUMN agent.mem_state IS 'Working memory (max 128KB, excess offloaded to S3)';
COMMENT ON COLUMN agent.emotion IS 'PAD emotional state vector plus categorical label';
COMMENT ON TABLE cognition_event IS 'Immutable audit log of all agent cognition events';
COMMENT ON COLUMN cognition_event.mitre_technique IS 'MITRE ATT&CK technique ID if detected';

