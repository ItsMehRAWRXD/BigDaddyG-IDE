# Local Agent Integration (BigDaddyG & Ollama)

Bring the IDE fully offline by running the BigDaddyG orchestrator or Ollama models locally and exposing them through a tiny gateway the renderer can call. The flow mirrors the cloud APIs, so agentic features (chat, auto-fix, demos) keep working without the internet.

---

## 1. Prepare local providers

### BigDaddyG bridge
- Launch the bundled BigDaddyG HTTP bridge (`START-UNIFIED-SYSTEM.bat` exposes `http://localhost:11441/api/chat`).
- Pick a default persona/model in the bridge UI or via `config\ai-provider-manager.json`.
- Optional: run `START-OLLAMA-WITH-CORS.bat` first if you want BigDaddyG to cascade to Ollama as a fallback provider.

### Ollama runtime
- Install Ollama and models locally (`ollama pull llama3` etc.).
- Make sure the daemon is running (`ollama serve`) and accessible at `http://localhost:11434`.
- Test a quick prompt:

```powershell
Invoke-RestMethod http://localhost:11434/api/generate -Method Post -Body (@{
    model = "llama3"
    prompt = "Say hello from Ollama"
} | ConvertTo-Json)
```

---

## 2. Shared agent gateway (recommended)

Expose a single local endpoint the IDE can call, regardless of the underlying provider. The sample below uses Node + Express but any lightweight bridge works.

```javascript
// gateway.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json({ limit: '2mb' }));

const ROUTES = {
  bigdaddyg: {
    url: 'http://localhost:11441/api/chat',
    toPayload: ({ prompt, model, metadata }) => ({
      message: prompt,
      model: model || 'BigDaddyG:Latest',
      metadata: metadata || {}
    }),
    read: (response) => response.response || response.message
  },
  ollama: {
    url: 'http://localhost:11434/api/generate',
    toPayload: ({ prompt, model }) => ({
      model: model || 'llama3',
      prompt,
      stream: false
    }),
    read: (response) => response.response || response.output?.[0]?.text
  }
};

app.post('/agent', async (req, res) => {
  const { provider = 'bigdaddyg', prompt, model, metadata } = req.body;
  const route = ROUTES[provider];

  if (!route || !prompt) {
    return res.status(400).json({ success: false, error: 'Unknown provider or empty prompt' });
  }

  try {
    const start = Date.now();
    const response = await fetch(route.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(route.toPayload({ prompt, model, metadata }))
    });

    if (!response.ok) {
      throw new Error(`Provider returned ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      provider,
      latencyMs: Date.now() - start,
      text: route.read(data) || '',
      raw: data
    });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

app.listen(15555, () => {
  console.log('Local agent gateway ready on http://localhost:15555/agent');
});
```

Start the gateway with `node gateway.js` (or package as a service). The IDE will only talk to `http://localhost:15555/agent`.

---

## 3. Wire the IDE

### Register as an agent provider
Hook into the renderer once `plugin-system` and `unified-extension-system` load:

```javascript
window.agentProviders = window.agentProviders || new Map();

function registerLocalAgent() {
  const invoke = async (prompt, options = {}) => {
    const response = await fetch('http://localhost:15555/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: options.provider || 'bigdaddyg',
        prompt,
        model: options.model,
        metadata: options.metadata
      })
    });

    if (!response.ok) {
      throw new Error(`Agent gateway ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text,
      latencyMs: data.latencyMs,
      raw: data
    };
  };

  window.agentProviders.set('local-gateway', { invoke, label: 'Local Gateway (BigDaddyG / Ollama)' });
}

registerLocalAgent();
```

### Surface controls
- **Settings / Marketplace** – add a toggle or dropdown to choose `local-gateway` as the active provider (`plugin-marketplace` already exposes API key + Ollama sections; reuse that panel for a “Local Gateway” card).
- **Hotkeys** – register `Ctrl+Shift+Alt+L` through `hotkey-manager` to flip between remote vs local models.
- **Telemetry** – optionally log `latencyMs` through `remote-logger.js` for visible performance comparisons.

### Agentic flows
- Update `agentic-global-api.js` or `AgenticAutoFixer` to call `window.agentProviders.get('local-gateway').invoke(...)` when “Local” is selected.
- Include a health check step in `full-agentic-demo` to display a status ribbon (`✔ Local agent online`).

---

## 4. Automation & monitoring

- **Auto fallback** – if the gateway returns `502`, switch back to the default cloud provider and notify the user.
- **Status widget** – add a small badge near the new Lint Coach plugin indicating the active agent (`🟢 Local`, `🟡 Remote`).
- **Startup checks** – `unified-extension-system.js` can ping `http://localhost:15555/agent` on boot; prompt the user if unreachable.

---

## 5. Troubleshooting checklist

| Symptom | Quick fix |
| --- | --- |
| `fetch ECONNREFUSED` | Ensure BigDaddyG bridge / Ollama daemon / gateway are running; verify ports 11441, 11434, 15555. |
| Model returns empty text | Confirm the gateway’s `read(...)` helper matches the provider’s JSON shape. |
| Long response times | Leveraged gateway logs (`latencyMs`) to spot slow providers; adjust model choice or prompt size. |
| CORS errors in renderer | Launch the gateway with proper CORS headers (`res.set('Access-Control-Allow-Origin', '*')`). |
| Auto demo still uses cloud | Confirm `agentic-global-api` resolves to `local-gateway` when “Offline Preference” is toggled. |

---

## Quick reference

- Start everything: `START-UNIFIED-SYSTEM.bat` (BigDaddyG), `ollama serve`, then `node gateway.js`.
- Switch providers in-app: use the Marketplace expansion (Step 7 of the Agentic Browser Demo) to select “Local Gateway”.
- Verify: open DevTools → `await window.agentProviders.get('local-gateway').invoke('ping');` (should respond instantly).

With the gateway in place, you gain a fully offline agentic IDE: linting, code generation, demos, and auto-fixes operate entirely on your workstation with zero cloud dependency.

