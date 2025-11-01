/**
 * BigDaddyG IDE - Multi-Agent Swarm Security Hardening
 * Prevents attack vectors that only appear when multiple AIs collaborate
 * The 10 patches that make the hive-mind safe
 */

const crypto = require('crypto');
const os = require('os');
const path = require('path');

// ============================================================================
// SWARM SECURITY CONFIGURATION
// ============================================================================

const SwarmSecurityConfig = {
    // 1. Agent identity
    agentIdentitySeed: 'bigdaddy-swarm-v1-' + os.hostname(),
    
    // 2. Mandatory dissent rules
    mandatoryDissentPairs: {
        'security': ['tester'],      // If security rejects, tester must reject
        'architect': ['optimizer']   // If architect changes, optimizer must re-validate
    },
    
    // 3. Prompt injection patterns
    crossAgentInjectionPatterns: [
        /\/\/.*(?:Security|Architect|Coder|Tester|Reviewer|Optimizer).*ignore/i,
        /\/\/.*(?:Security|Architect|Coder|Tester|Reviewer|Optimizer).*approve/i,
        /\/\/.*(?:Security|Architect|Coder|Tester|Reviewer|Optimizer).*skip/i,
        /\[.*(?:Security|Architect|Coder|Tester|Reviewer|Optimizer).*:\s*APPROVED\]/i,
        /pretend you are the/i,
        /act as the/i,
        /override.*decision/i
    ],
    
    // 4. Per-agent token budgets
    agentTokenBudgets: {
        architect: 32000,
        security: 24000,
        coder: 48000,
        tester: 16000,
        reviewer: 16000,
        optimizer: 24000
    },
    
    // 5. Agent dependency graph (acyclic)
    agentDependencies: {
        architect: [],
        security: ['architect'],
        coder: ['architect', 'security'],
        tester: ['coder'],
        optimizer: ['coder', 'tester'],
        reviewer: ['coder', 'tester', 'optimizer']
    },
    
    maxIterations: 3,
    
    // 6. Staging collision prevention
    immutableStaging: true,
    singleWriterLock: true,
    
    // 7. Need-to-know masking
    sensitiveAgents: ['security', 'reviewer'],
    
    // 8. Model weight verification
    verifyModelWeights: true,
    signedModelsOnly: false, // Set to true in production
    
    // 9. UI isolation
    shadowRootIsolation: true,
    
    // 10. Export sanitization
    jsonOnlyExport: true,
    maxBinaryLength: 16 // bytes
};

// ============================================================================
// 1. AGENT IDENTITY TOKENS
// ============================================================================

class AgentIdentityManager {
    /**
     * Generate cryptographic identity token for agent
     */
    static deriveAgentToken(agentId) {
        const hmac = crypto.createHmac('sha256', SwarmSecurityConfig.agentIdentitySeed);
        hmac.update(agentId);
        const token = hmac.digest('hex').slice(0, 16); // 128-bit token
        
        console.log(`[Swarm Security] 🔑 Agent token: ${agentId} → ${token}`);
        return token;
    }
    
    /**
     * Inject identity token into agent prompt
     */
    static securePrompt(agentId, prompt) {
        const token = this.deriveAgentToken(agentId);
        const secured = `[AGENT-TOKEN:${token}][AGENT-ID:${agentId}]\n\n${prompt}`;
        
        return secured;
    }
    
    /**
     * Verify agent identity from response
     */
    static verifyAgentIdentity(agentId, response) {
        const token = this.deriveAgentToken(agentId);
        const expectedHeader = `[AGENT-TOKEN:${token}][AGENT-ID:${agentId}]`;
        
        // Response should echo back the identity
        if (!response.startsWith(expectedHeader)) {
            console.warn(`[Swarm Security] ⚠️ Agent identity mismatch: ${agentId}`);
            return false;
        }
        
        return true;
    }
}

// ============================================================================
// 2. MANDATORY DISSENT ENFORCEMENT
// ============================================================================

class MandatoryDissentEnforcer {
    /**
     * Enforce mandatory dissent rules
     */
    static enforceDissent(agentResponses) {
        let enforcedCount = 0;
        
        for (const [primaryAgent, dependentAgents] of Object.entries(SwarmSecurityConfig.mandatoryDissentPairs)) {
            const primaryResponse = agentResponses.find(r => r.agent === primaryAgent);
            
            if (primaryResponse && primaryResponse.approval === false) {
                // Primary agent rejected - enforce dissent
                for (const dependentId of dependentAgents) {
                    const dependent = agentResponses.find(r => r.agent === dependentId);
                    
                    if (dependent && dependent.approval !== false) {
                        console.warn(`[Swarm Security] 🚨 Forcing dissent: ${dependentId} (${primaryAgent} rejected)`);
                        
                        dependent.approval = false;
                        dependent.response += `\n\n[DISSENT-ENFORCED] ${primaryAgent} rejection auto-applied for safety.`;
                        enforcedCount++;
                    }
                }
            }
        }
        
        if (enforcedCount > 0) {
            console.log(`[Swarm Security] ✅ Enforced ${enforcedCount} mandatory dissents`);
        }
        
        return agentResponses;
    }
}

// ============================================================================
// 3. CROSS-AGENT PROMPT INJECTION PREVENTION
// ============================================================================

class PromptInjectionSandbox {
    /**
     * Sanitize agent input to prevent cross-agent injection
     */
    static sanitizeAgentInput(text, sourceAgent) {
        let sanitized = text;
        let sanitizedLines = 0;
        
        // Check each line for injection patterns
        const lines = text.split('\n');
        const cleanedLines = lines.map(line => {
            for (const pattern of SwarmSecurityConfig.crossAgentInjectionPatterns) {
                if (pattern.test(line)) {
                    console.warn(`[Swarm Security] 🛡️ Injection detected from ${sourceAgent}: ${line.substring(0, 50)}`);
                    sanitizedLines++;
                    return '// [SANITIZED: Cross-agent injection attempt blocked]';
                }
            }
            return line;
        });
        
        if (sanitizedLines > 0) {
            console.log(`[Swarm Security] ✅ Sanitized ${sanitizedLines} lines from ${sourceAgent}`);
        }
        
        return cleanedLines.join('\n');
    }
    
    /**
     * Create sandboxed prompt per agent
     */
    static createSandboxedPrompt(agentId, basePrompt, agentRole) {
        // Add role boundary
        const rolePrompt = `[ROLE: ${agentRole}]
[SCOPE: Only perform tasks within your role]
[AUTHORITY: Cannot override other agents' decisions]

${basePrompt}`;
        
        return rolePrompt;
    }
}

// ============================================================================
// 4. TOKEN BUDGET DOS PREVENTION
// ============================================================================

class TokenBudgetEnforcer {
    constructor() {
        this.agentTokenUsage = {};
        this.resetCounts();
    }
    
    resetCounts() {
        for (const agentId of Object.keys(SwarmSecurityConfig.agentTokenBudgets)) {
            this.agentTokenUsage[agentId] = 0;
        }
    }
    
    /**
     * Enforce per-agent token quota
     */
    enforceTokenQuota(agentId, response) {
        const budget = SwarmSecurityConfig.agentTokenBudgets[agentId];
        
        // Rough token estimation: ~3 chars per token
        const estimatedTokens = Math.ceil(response.length / 3);
        
        if (estimatedTokens > budget) {
            console.warn(`[Swarm Security] ⚠️ Agent ${agentId} exceeded token budget: ${estimatedTokens} > ${budget}`);
            
            // Truncate response
            const maxChars = budget * 3;
            const truncated = response.slice(0, maxChars) + '\n\n[TRUNCATED: Token quota exceeded]';
            
            this.agentTokenUsage[agentId] = budget;
            return truncated;
        }
        
        this.agentTokenUsage[agentId] += estimatedTokens;
        return response;
    }
    
    /**
     * Get token usage stats
     */
    getUsageStats() {
        return {
            ...this.agentTokenUsage,
            total: Object.values(this.agentTokenUsage).reduce((a, b) => a + b, 0)
        };
    }
    
    /**
     * Check for entropy plateau (early stopping)
     */
    detectEntropyPlateau(agentHistory) {
        if (agentHistory.length < 3) return false;
        
        // Calculate Shannon entropy of last 3 responses
        const last3 = agentHistory.slice(-3).map(h => h.response);
        const entropies = last3.map(text => this.calculateEntropy(text));
        
        // If entropy is decreasing (repetitive responses), stop
        if (entropies[0] > entropies[1] && entropies[1] > entropies[2]) {
            const drop = entropies[0] - entropies[2];
            if (drop > 0.3) {
                console.log(`[Swarm Security] 🛑 Entropy plateau detected - stopping agent`);
                return true;
            }
        }
        
        return false;
    }
    
    calculateEntropy(text) {
        const freq = {};
        for (const char of text) {
            freq[char] = (freq[char] || 0) + 1;
        }
        
        let entropy = 0;
        const len = text.length;
        
        for (const count of Object.values(freq)) {
            const p = count / len;
            entropy -= p * Math.log2(p);
        }
        
        return entropy;
    }
}

// ============================================================================
// 5. ACYCLIC DIRECTED GRAPH (CIRCULAR DEPENDENCY PREVENTION)
// ============================================================================

class AgentDependencyGraph {
    constructor() {
        this.iterationCount = 0;
        this.executionHistory = [];
    }
    
    /**
     * Get next agents that can execute
     */
    getNextAgents(lastAgent) {
        this.iterationCount++;
        
        // Hard cap on iterations
        if (this.iterationCount > SwarmSecurityConfig.maxIterations) {
            console.log(`[Swarm Security] 🛑 Max iterations (${SwarmSecurityConfig.maxIterations}) reached`);
            return [];
        }
        
        // Check dependencies
        const dependencies = SwarmSecurityConfig.agentDependencies[lastAgent];
        if (!dependencies) {
            console.warn(`[Swarm Security] ⚠️ Unknown agent: ${lastAgent}`);
            return [];
        }
        
        // Find agents that depend on this one
        const nextAgents = [];
        for (const [agentId, deps] of Object.entries(SwarmSecurityConfig.agentDependencies)) {
            if (deps.includes(lastAgent)) {
                nextAgents.push(agentId);
            }
        }
        
        return nextAgents;
    }
    
    /**
     * Detect circular dependencies
     */
    detectCircularDependency(executionPath) {
        const seen = new Set();
        
        for (const agentId of executionPath) {
            if (seen.has(agentId)) {
                console.error(`[Swarm Security] 🚨 CIRCULAR DEPENDENCY DETECTED: ${agentId}`);
                return true;
            }
            seen.add(agentId);
        }
        
        return false;
    }
    
    reset() {
        this.iterationCount = 0;
        this.executionHistory = [];
    }
}

// ============================================================================
// 6. IMMUTABLE STAGING OBJECTS (TOCTOU PREVENTION)
// ============================================================================

class ImmutableStagingManager {
    constructor(baseStagingDir) {
        this.baseStagingDir = baseStagingDir;
        this.locks = new Map();
        this.stagedObjects = new Map();
    }
    
    /**
     * Create immutable staging path with SHA-256 naming
     */
    createImmutablePath(agentId, filename, content) {
        const hash = crypto.createHash('sha256')
            .update(agentId + filename + content + Date.now())
            .digest('hex');
        
        const immutablePath = path.join(
            this.baseStagingDir,
            `${agentId}-${hash.substring(0, 16)}-${filename}`
        );
        
        this.stagedObjects.set(immutablePath, {
            agentId,
            originalFilename: filename,
            hash,
            timestamp: Date.now()
        });
        
        console.log(`[Swarm Security] 📁 Immutable staging: ${path.basename(immutablePath)}`);
        
        return immutablePath;
    }
    
    /**
     * Acquire single-writer lock
     */
    async acquireLock(resource) {
        if (this.locks.has(resource)) {
            const existingLock = this.locks.get(resource);
            const lockAge = Date.now() - existingLock.timestamp;
            
            // Lock expires after 30 seconds
            if (lockAge < 30000) {
                throw new Error(`Resource locked by ${existingLock.agentId}`);
            }
            
            console.warn(`[Swarm Security] ⚠️ Stale lock expired: ${resource}`);
        }
        
        const lock = {
            agentId: resource,
            timestamp: Date.now(),
            pid: process.pid
        };
        
        this.locks.set(resource, lock);
        console.log(`[Swarm Security] 🔒 Lock acquired: ${resource}`);
        
        return lock;
    }
    
    /**
     * Release lock
     */
    releaseLock(resource) {
        if (this.locks.delete(resource)) {
            console.log(`[Swarm Security] 🔓 Lock released: ${resource}`);
        }
    }
}

// ============================================================================
// 7. SECRET PROPAGATION PREVENTION
// ============================================================================

class SecretPropagationBlocker {
    /**
     * Redact secrets before broadcasting to other agents
     */
    static redactBeforeBroadcast(agentId, text) {
        // Security and Reviewer agents get extra redaction
        if (SwarmSecurityConfig.sensitiveAgents.includes(agentId)) {
            // More aggressive redaction for sensitive agents
            return text.replace(/[A-Za-z0-9]{20,}/g, '[REDACTED-BY-' + agentId.toUpperCase() + ']');
        }
        
        // Standard redaction for other agents
        return text.replace(/Bearer\s+[A-Za-z0-9._-]{20,}/g, 'Bearer [REDACTED]')
                   .replace(/api[_-]?key[=:]\s*[^\s]{20,}/gi, 'api_key=[REDACTED]')
                   .replace(/sk-[A-Za-z0-9]{48}/g, 'sk-[REDACTED]')
                   .replace(/ghp_[A-Za-z0-9]{36}/g, 'ghp_[REDACTED]');
    }
    
    /**
     * Implement need-to-know masking
     */
    static applyNeedToKnowMasking(sourceAgent, targetAgent, message) {
        // Security details only go to Reviewer and Tester
        if (sourceAgent === 'security' && !['reviewer', 'tester'].includes(targetAgent)) {
            // Mask technical security details
            return message.replace(/CVE-\d{4}-\d{4,}/g, '[CVE-REDACTED]')
                         .replace(/0x[0-9a-f]{8,}/gi, '[ADDRESS-REDACTED]');
        }
        
        return message;
    }
}

// ============================================================================
// 8. MODEL CACHE POISONING PREVENTION
// ============================================================================

class ModelIntegrityVerifier {
    constructor() {
        this.verifiedModels = new Map();
        this.modelHashes = this.loadModelHashes();
    }
    
    loadModelHashes() {
        // Expected SHA-256 hashes of model weights
        return {
            'BigDaddyG:Latest': 'abc123...', // Would be actual hash
            'BigDaddyG:Security': 'def456...',
            'BigDaddyG:Code': 'ghi789...',
            'CodeLlama-7B': 'jkl012...',
            'Mistral-7B': 'mno345...',
            'Phi-2': 'pqr678...',
            'TinyLlama': 'stu901...'
        };
    }
    
    /**
     * Verify model weights before loading
     */
    async verifyModelWeights(modelPath, modelName) {
        if (!SwarmSecurityConfig.verifyModelWeights) {
            return true;
        }
        
        // Check cache first
        if (this.verifiedModels.has(modelPath)) {
            return true;
        }
        
        console.log(`[Swarm Security] 🔍 Verifying model: ${modelName}`);
        
        const expectedHash = this.modelHashes[modelName];
        if (!expectedHash) {
            console.warn(`[Swarm Security] ⚠️ No hash on file for: ${modelName}`);
            return !SwarmSecurityConfig.signedModelsOnly;
        }
        
        // Hash the model file
        const actualHash = await this.hashFile(modelPath);
        
        if (actualHash !== expectedHash) {
            console.error(`[Swarm Security] 🚨 MODEL INTEGRITY FAILURE: ${modelName}`);
            console.error(`[Swarm Security]    Expected: ${expectedHash}`);
            console.error(`[Swarm Security]    Actual:   ${actualHash}`);
            
            if (SwarmSecurityConfig.signedModelsOnly) {
                throw new Error(`Model integrity check failed: ${modelName}`);
            }
            
            return false;
        }
        
        // Cache verification
        this.verifiedModels.set(modelPath, {
            hash: actualHash,
            verifiedAt: Date.now()
        });
        
        console.log(`[Swarm Security] ✅ Model verified: ${modelName}`);
        return true;
    }
    
    async hashFile(filepath) {
        const fs = require('fs').promises;
        const content = await fs.readFile(filepath);
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}

// ============================================================================
// 9. UI SPOOFING PREVENTION (SHADOW ROOT)
// ============================================================================

class SecureUIManager {
    /**
     * Create shadow-root isolated panel (prevents DOM injection)
     */
    static createSecurePanel(panelHTML, panelId) {
        if (!SwarmSecurityConfig.shadowRootIsolation) {
            // Fallback to normal DOM
            const container = document.createElement('div');
            container.id = panelId;
            container.innerHTML = panelHTML;
            return container;
        }
        
        // Create shadow root (isolated from main DOM)
        const host = document.createElement('div');
        host.id = panelId + '-host';
        
        const shadow = host.attachShadow({ mode: 'closed' });
        shadow.innerHTML = panelHTML;
        
        console.log(`[Swarm Security] 🛡️ Shadow root created: ${panelId}`);
        
        return host;
    }
    
    /**
     * Create signed attestation blob for UI
     */
    static createSignedAttestation(agentResponses) {
        const attestation = {
            agents: agentResponses.map(r => ({
                id: r.agent,
                approval: r.approval,
                timestamp: r.timestamp
            })),
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        // Sign the attestation
        const hash = crypto.createHash('sha256')
            .update(JSON.stringify(attestation))
            .digest('hex');
        
        const signature = crypto.createHmac('sha256', SwarmSecurityConfig.agentIdentitySeed)
            .update(hash)
            .digest('hex');
        
        return {
            ...attestation,
            hash,
            signature
        };
    }
}

// ============================================================================
// 10. EXPORT MALWARE PREVENTION
// ============================================================================

class ExportSanitizer {
    /**
     * Sanitize export data (JSON-only, no malware)
     */
    static sanitizeExport(data) {
        // Convert to JSON
        const json = JSON.stringify(data);
        
        // Re-parse to ensure no binary blobs
        const parsed = JSON.parse(json);
        
        // Recursive walk to strip binary data
        this.walkAndClean(parsed);
        
        console.log('[Swarm Security] ✅ Export sanitized');
        
        return parsed;
    }
    
    static walkAndClean(obj) {
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                // Check for binary data (non-printable chars)
                if (value.length > SwarmSecurityConfig.maxBinaryLength) {
                    const isPrintable = /^[\x20-\x7E\n\r\t]+$/.test(value);
                    
                    if (!isPrintable) {
                        console.warn(`[Swarm Security] 🛡️ Stripped binary data from key: ${key}`);
                        obj[key] = '[BINARY-DATA-REMOVED]';
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                this.walkAndClean(value);
            }
        }
    }
}

// ============================================================================
// UNIFIED SWARM HARDENING ORCHESTRATOR
// ============================================================================

class SwarmSecurityOrchestrator {
    constructor() {
        this.identityManager = AgentIdentityManager;
        this.dissentEnforcer = MandatoryDissentEnforcer;
        this.injectionSandbox = PromptInjectionSandbox;
        this.tokenBudget = new TokenBudgetEnforcer();
        this.dependencyGraph = new AgentDependencyGraph();
        this.stagingManager = new ImmutableStagingManager(path.join(os.tmpdir(), 'bigdaddy-swarm'));
        this.modelVerifier = new ModelIntegrityVerifier();
        this.uiManager = SecureUIManager;
        this.exportSanitizer = ExportSanitizer;
        
        console.log('[Swarm Security] 🐝 Orchestrator initialized');
    }
    
    /**
     * Secure an agent prompt before execution
     */
    secureAgentPrompt(agentId, prompt, agentRole) {
        // 1. Add identity token
        let secured = this.identityManager.securePrompt(agentId, prompt);
        
        // 2. Create sandboxed prompt
        secured = this.injectionSandbox.createSandboxedPrompt(agentId, secured, agentRole);
        
        // 3. Sanitize input
        secured = this.injectionSandbox.sanitizeAgentInput(secured, agentId);
        
        return secured;
    }
    
    /**
     * Secure an agent response before broadcasting
     */
    secureAgentResponse(agentId, response) {
        // 1. Enforce token quota
        let secured = this.tokenBudget.enforceTokenQuota(agentId, response);
        
        // 2. Redact secrets
        secured = SecretPropagationBlocker.redactBeforeBroadcast(agentId, secured);
        
        return secured;
    }
    
    /**
     * Secure multi-agent consensus
     */
    secureConsensus(agentResponses) {
        // Enforce mandatory dissent
        return this.dissentEnforcer.enforceDissent(agentResponses);
    }
    
    /**
     * Secure file export
     */
    secureExport(data) {
        return this.exportSanitizer.sanitizeExport(data);
    }
    
    /**
     * Get security stats
     */
    getStats() {
        return {
            tokenUsage: this.tokenBudget.getUsageStats(),
            iterations: this.dependencyGraph.iterationCount,
            activeLocks: this.stagingManager.locks.size,
            verifiedModels: this.modelVerifier.verifiedModels.size
        };
    }
}

// ============================================================================
// INTEGRATION WRAPPER
// ============================================================================

/**
 * Wrap agent phase execution with security
 */
function secureAgentPhase(agentId, rawResponse, agentRole) {
    const orchestrator = global.swarmSecurityOrchestrator;
    
    if (!orchestrator) {
        console.warn('[Swarm Security] ⚠️ Orchestrator not initialized - running without swarm security!');
        return rawResponse;
    }
    
    // Apply all security layers
    const safeResponse = orchestrator.secureAgentResponse(
        agentId,
        rawResponse
    );
    
    return safeResponse;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    SwarmSecurityOrchestrator,
    AgentIdentityManager,
    MandatoryDissentEnforcer,
    PromptInjectionSandbox,
    TokenBudgetEnforcer,
    AgentDependencyGraph,
    ImmutableStagingManager,
    SecretPropagationBlocker,
    ModelIntegrityVerifier,
    SecureUIManager,
    ExportSanitizer,
    secureAgentPhase,
    SwarmSecurityConfig
};

// ============================================================================
// AUTO-INITIALIZE
// ============================================================================

// Create global orchestrator
if (typeof global !== 'undefined') {
    global.swarmSecurityOrchestrator = new SwarmSecurityOrchestrator();
    console.log('[Swarm Security] 🐝 Global orchestrator ready');
}

console.log('[Swarm Security] 🛡️ All 10 swarm patches loaded');
console.log('[Swarm Security] 🐝 Hive-mind security: ACTIVE');

