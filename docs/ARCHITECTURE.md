# Architecture Overview

BigDaddyG IDE combines an Electron shell, a set of Node-based agent services, and a large bundle of renderer-side modules. This document highlights where the important pieces live so you can navigate without reading every file.

---

## High-Level Diagram

```
┌──────────────────────────┐        ┌─────────────────────────────┐
│ Electron Main Process    │        │ Renderer (Monaco UI + UI    │
│ ─ electron/main.js       │        │ modules in electron/)       │
│ ─ window lifecycle       │◄──────►│ ─ agent panels              │
│ ─ spawns Node services   │  IPC   │ ─ chat + terminal surfaces  │
└──────────┬───────────────┘        │ ─ settings & safe mode      │
           │                        └──────────┬──────────────────┘
           │ HTTP/WebSocket                     │ WebSocket / REST
           ▼                                    ▼
┌──────────────────────────┐        ┌─────────────────────────────┐
│ Orchestra Server         │        │ Remote Log Server & Tools   │
│ ─ server/Orchestra-*     │        │ ─ server/Remote-Log-Server  │
│ ─ multi-agent routing    │        │ ─ server/Micro-Model-Server │
│ ─ model discovery        │        │ ─ hooks/ prompt processors  │
└──────────────────────────┘        └─────────────────────────────┘
```

---

## Key Directories

- `electron/`
  - `main.js`: Electron entry point that starts backend services and loads the renderer shell.
  - `preload.js`: Defines the IPC surface available to renderer code.
  - `working-ide.js`, `agent-panel.js`, `multi-agent-swarm.js`: Compose the UI for editor tabs, agent dashboards, and automation panels.
  - `ui/`: Declarative UI widgets for live coding, swarm visualisation, todo panels, and extension panels.
  - `settings/` & `hardening/`: Safe Mode fallback logic and runtime hardening tweaks (GPU settings, sandbox flags, etc.).

- `server/`
  - `Orchestra-Server.js`: Express server that exposes agent orchestration routes, health checks, and model discovery endpoints.
  - `Agent-WebSocket-Server.js`: Real-time transport for chat, agent telemetry, and live collaboration.
  - `Remote-Log-Server.js`: Optional log streamer that forwards renderer output to external dashboards.
  - `Micro-Model-Server.js`: Lightweight HTTP interface for bundled micro-models.

- `hooks/`
  - PowerShell and Bash automation invoked before agent execution. These scripts sanitise prompts, seed context, and enforce security policy.

- `orchestration/`
  - Packaging scripts used by release tooling (`*.ps1`) to bundle models, agents, and offline resources.

- `assets/`
  - Application icons (`icon.png`, `.ico`, `.icns`) and JSON metadata consumed at build time.

---

## Runtime Lifecycle

1. Users run `npm start`, which launches `electron/main.js`.
2. `main.js` starts the Orchestra and Remote Log servers as child processes; health probes ensure duplicates are not created.
3. Safe Mode detection selects which HTML scaffold to load. Fallback files (`index-ultra-simple.html`, `index-minimal.html`) keep the IDE usable when advanced features fail.
4. The renderer initialises Monaco, registers agent tabs, and hydrates settings stored on disk.
5. Renderer UI communicates with the backend through IPC (`ipcRenderer`) and WebSockets (for live agent streams).

---

## Configuration and Persistence

- Orchestra service reads `server/settings.ini` (generated on first launch) for port configuration, model scan depth, and Ollama integration.
- Window state is saved in the user data directory by `electron-window-state`.
- Prompt hooks can load custom JSON/YAML definitions from the `hooks/` directory (see individual scripts for supported fields).

---

## Extending the IDE

1. **Add a new panel:** Create a module in `electron/ui/` and register it inside `electron/agent-panel.js` or `electron/working-ide.js`.
2. **Add a backend endpoint:** Extend `server/Orchestra-Server.js` with a new Express route or WebSocket event, then expose it to the renderer via `preload.js`.
3. **Bundle new assets:** Place icons or static files in `assets/` and reference them through `electron-builder` (see `build/files` in `package.json`).

Keep cross-process communication in mind—anything that touches Node APIs from the renderer should be exposed through the preload bridge to remain compatible with context isolation.

---

## Useful Entry Points for Further Reading

- `electron/background-agent-manager.js` – Coordinates background tasks and queueing.
- `electron/enhanced-agentic-executor.js` – Orchestrates multi-step agent runs.
- `server/Agent-WebSocket-Server.js` – WebSocket server implementation details.
- `hooks/prompt-preprocessor.sh` (and related scripts) – Automation hooks for prompt conditioning.

These files provide the clearest examples of how the IDE layers (renderer ↔ services ↔ automation) interact in real code.
