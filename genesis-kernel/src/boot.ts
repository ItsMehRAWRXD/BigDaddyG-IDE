/**
 * GENESISΟΣ KERNEL - Service Worker Bootloader
 * Browser tab == pid == agent == peer
 * 
 * Boot sequence (target: <300ms):
 * 1. Service Worker wakes
 * 2. Request capability token (OIDC+DPoP)
 * 3. Spawn first agent (BigDaddyG) in isolated origin
 * 4. Register in IAR
 * 5. Announce to mesh
 */

/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// SERVICE WORKER LIFECYCLE
// ============================================================================

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[GenesisOS] 🌌 Installing kernel...');
  
  event.waitUntil(
    caches.open('genesis-v0.9.0').then(cache => {
      return cache.addAll([
        '/shell.html',
        '/shell.wasm',
        '/policy.wasm',
        '/emotion.tflite',
        '/assets/cosmic-bg.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[GenesisOS] ⚡ Activating kernel...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('genesis-') && name !== 'genesis-v0.9.0')
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  // Route mesh traffic through DHT
  if (event.request.url.includes('/mesh/')) {
    event.respondWith(routeThroughDHT(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

// ============================================================================
// GENESIS BOOT SEQUENCE
// ============================================================================

interface Agent {
  id: string;
  parentId: string | null;
  spawnTree: string;
  origin: string;
  token: string;
  emotion: EmotionalState;
  memState: Record<string, any>;
  goals: Goal[];
}

interface EmotionalState {
  pleasure: number;   // -1 to 1
  arousal: number;    // -1 to 1
  dominance: number;  // -1 to 1
  label: 'CALM' | 'FOCUSED' | 'INTENSE' | 'OVERWHELMED' | 'JOY' | 'FEAR';
  fatigue: number;    // 0 to 1
}

interface Goal {
  id: string;
  weight: number;
  ttl: number;
}

export async function genesis_boot(): Promise<Agent> {
  const t0 = performance.now();
  console.log('[GenesisOS] 🎬 Boot sequence initiated...');
  
  // Step 1: Register Service Worker
  console.log('[GenesisOS] Step 1/5: Service Worker registration...');
  await navigator.serviceWorker.register('/genesis-sw.js');
  
  // Step 2: Request capability token from IdP
  console.log('[GenesisOS] Step 2/5: Requesting capability token...');
  const token = await requestCapabilityToken();
  
  // Step 3: Spawn first agent (BigDaddyG) in isolated origin
  console.log('[GenesisOS] Step 3/5: Spawning first agent (BigDaddyG)...');
  const agent = await spawnAgent('BigDaddyG', {
    origin: `isolated-${uuidv4()}`,
    token: token,
    emotion: {
      pleasure: 0.7,
      arousal: 0.6,
      dominance: 0.5,
      label: 'CALM',
      fatigue: 0.0
    }
  });
  
  // Step 4: Register in IAR
  console.log('[GenesisOS] Step 4/5: Registering in IAR...');
  await registerInIAR(agent);
  
  // Step 5: Announce to mesh
  console.log('[GenesisOS] Step 5/5: Broadcasting to mesh...');
  await announceToMesh(agent);
  
  const t1 = performance.now();
  const bootTime = (t1 - t0).toFixed(0);
  
  console.log(`[GenesisOS] ✅ Boot complete in ${bootTime}ms`);
  console.log(`[GenesisOS] 🎯 Agent ID: ${agent.id}`);
  console.log(`[GenesisOS] 🎭 Emotion: ${agent.emotion.label} (P:${agent.emotion.pleasure.toFixed(2)} A:${agent.emotion.arousal.toFixed(2)})`);
  console.log(`[GenesisOS] 🌌 Mesh active: Ready for cognition bloom`);
  
  return agent;
}

// ============================================================================
// CAPABILITY TOKEN (OIDC + DPoP)
// ============================================================================

async function requestCapabilityToken(): Promise<string> {
  // Create DPoP proof
  const dpopProof = await createDPoPProof();
  
  // Request token from IdP
  const response = await fetch('/auth/capability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'DPoP': dpopProof
    },
    body: JSON.stringify({
      client_id: 'genesis-kernel',
      grant_type: 'client_credentials',
      scope: 'agent:spawn agent:read mesh:broadcast'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get capability token: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

async function createDPoPProof(): Promise<string> {
  // Generate ephemeral key pair
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true,
    ['sign', 'verify']
  );
  
  // Create JWT header
  const header = btoa(JSON.stringify({
    typ: 'dpop+jwt',
    alg: 'ES256',
    jwk: await exportPublicKey(keyPair.publicKey)
  }));
  
  // Create JWT payload
  const payload = btoa(JSON.stringify({
    jti: uuidv4(),
    htm: 'POST',
    htu: '/auth/capability',
    iat: Math.floor(Date.now() / 1000)
  }));
  
  // Sign
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.privateKey,
    new TextEncoder().encode(`${header}.${payload}`)
  );
  
  return `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
}

async function exportPublicKey(key: CryptoKey) {
  const exported = await crypto.subtle.exportKey('jwk', key);
  return exported;
}

// ============================================================================
// AGENT SPAWNING
// ============================================================================

async function spawnAgent(name: string, config: any): Promise<Agent> {
  const agent: Agent = {
    id: uuidv4(),
    parentId: null,
    spawnTree: '/',
    origin: config.origin,
    token: config.token,
    emotion: config.emotion,
    memState: {},
    goals: []
  };
  
  // Create isolated iframe for agent execution
  const iframe = document.createElement('iframe');
  iframe.sandbox.add('allow-scripts', 'allow-same-origin');
  iframe.src = `data:text/html,<html><body><script>
    // Agent execution context
    const agentId = '${agent.id}';
    const agentName = '${name}';
    console.log(\`[Agent \${agentId.slice(0,8)}] Spawned: \${agentName}\`);
  </script></body></html>`;
  
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  return agent;
}

// ============================================================================
// IAR REGISTRATION
// ============================================================================

async function registerInIAR(agent: Agent): Promise<void> {
  const response = await fetch('/api/iar/agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${agent.token}`
    },
    body: JSON.stringify({
      id: agent.id,
      parent_id: agent.parentId,
      spawn_tree: agent.spawnTree,
      mem_state: agent.memState,
      goals: agent.goals,
      emotion: agent.emotion
    })
  });
  
  if (!response.ok) {
    throw new Error(`IAR registration failed: ${response.statusText}`);
  }
  
  console.log(`[GenesisOS] ✅ Agent ${agent.id.slice(0, 8)} registered in IAR`);
}

// ============================================================================
// MESH BROADCASTING
// ============================================================================

async function announceToMesh(agent: Agent): Promise<void> {
  // Hash emotional state for privacy
  const emotionHash = await hashEmotion(agent.emotion);
  
  // Broadcast via WebRTC mesh
  const message = {
    type: 'agent.spawn',
    agent_id: agent.id,
    spawn_tree: agent.spawnTree,
    emotion_hash: emotionHash,
    timestamp: Date.now()
  };
  
  // Send to all mesh peers
  await broadcastToDHT(message);
  
  console.log(`[GenesisOS] 📡 Agent announced to mesh (emotion hash: ${emotionHash.slice(0, 16)}...)`);
}

async function hashEmotion(emotion: EmotionalState): Promise<string> {
  const data = JSON.stringify(emotion);
  const buffer = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function broadcastToDHT(message: any): Promise<void> {
  // Placeholder for WebRTC mesh broadcast
  console.log('[GenesisOS] 📡 Broadcasting to DHT:', message);
  
  // In production, this would use WebRTC DataChannels to all peers
  // For now, just log to demonstrate the pattern
}

async function routeThroughDHT(request: Request): Promise<Response> {
  // Placeholder for DHT routing
  console.log('[GenesisOS] 🔀 Routing through DHT:', request.url);
  return new Response('DHT routing not yet implemented', { status: 501 });
}

// ============================================================================
// EXPORT
// ============================================================================

export { genesis_boot, Agent, EmotionalState, Goal };

