# Getting Started

This guide walks through the minimum steps required to launch the BigDaddyG IDE in development mode and understand the moving pieces that start up alongside the Electron shell.

---

## Prerequisites

- Node.js 18 or newer (Electron 39 bundles Node 20, but the tooling expects a modern LTS release)
- npm 9+ (ships with recent Node installers)
- Git (for cloning and keeping the repository up to date)
- macOS, Windows, or a recent Linux distribution with desktop support

If you plan to build platform installers, install the native dependencies that `electron-builder` requires for your operating system.

---

## 1. Clone and Install

```bash
git clone https://github.com/ItsMehRAWRXD/BigDaddyG-IDE.git
cd BigDaddyG-IDE
npm install
```

The install step downloads roughly 430 MB of dependencies (primarily Electron and Monaco). `electron-builder` runs a post-install hook (`npm run postinstall`) to make sure native modules are rebuilt for the correct Electron runtime.

---

## 2. Run the IDE in Development Mode

```bash
npm start
```

Behind the scenes this command runs `electron .`, which triggers the following flow:

1. `electron/main.js` bootstraps the main process and remembers your previous window position (using `electron-window-state`).
2. The built-in Orchestra agent server (`server/Orchestra-Server.js`) is spawned in a child process.
3. An optional remote log server (`server/Remote-Log-Server.js`) is started if it is present.
4. Safe Mode logic decides which HTML shell to load (`electron/index.html`, `index-working.html`, or fallback variants).
5. The renderer boots the Monaco-based editor, chat panels, agent dashboards, and integrated terminal panes.

Your first launch automatically opens DevTools in a detached window so you can diagnose white-screen issues without editing configuration files.

---

## 3. Explore Available npm Scripts

Commonly used scripts in `package.json`:

| Script | Description |
| --- | --- |
| `npm start` | Launches the Electron app in development mode. |
| `npm run dev` | Same as `npm start`, but adds the `--dev` flag for extra logging. |
| `npm run build` | Creates installers for all platforms in a single pass (Windows, macOS, Linux). |
| `npm run build:win` | Builds Windows NSIS + portable executables. |
| `npm run build:mac` | Builds macOS `.dmg` and `.zip`. |
| `npm run build:linux` | Builds AppImage, `.deb`, and `.rpm`. |
| `npm run pack` | Produces unpacked builds in `dist/` for inspection. |

All build outputs are written to the `dist` directory; adjust `build/artifactName` in `package.json` if you need custom naming.

---

## 4. Running Backend Services Standalone (Optional)

During development you may want to launch the Node services individually:

```bash
# Start the multi-agent “Orchestra” API
node server/Orchestra-Server.js

# Start the streaming log collector
node server/Remote-Log-Server.js

# Micro model server for lightweight endpoints
node server/Micro-Model-Server.js
```

Each service exposes a health endpoint (for example, `http://localhost:11441/health` for Orchestra) that the Electron app probes. If a port is already in use, `electron/main.js` detects the running process and avoids spawning a duplicate.

---

## 5. Folder Map (Where to Look Next)

- `electron/` – Renderer UI, Monaco integration, agent dashboards, and preload configuration.
- `server/` – REST/WebSocket services powering agent coordination, remote logging, and model inference.
- `hooks/` – Prompt preprocessing and automation scripts that run before agent execution.
- `orchestration/` – PowerShell automation helpers for packaging agents and models.
- `assets/` – Icons, theming assets, and static metadata consumed by Electron.

Spend a few minutes skimming `electron/working-ide.js` and `electron/agent-panel.js` to see how panels register themselves with the workspace.

---

## 6. Troubleshooting Quick Reference

- **White screen:** Relaunch—Safe Mode automatically falls back to `index-ultra-simple.html` after three failures. You can also manually load that file from the menu.
- **Dependencies failing to install:** Remove `node_modules` and `package-lock.json`, then re-run `npm install --force`.
- **Ports already in use:** Stop any lingering `node` processes on ports `11441` (Orchestra) and `11442` (Remote Log) or manually run the servers before launching Electron.
- **Local models missing:** Verify Ollama is running (`ollama serve`) and that the model alias you request exists (`ollama list`).

---

## 7. Next Steps

- Review the architecture overview in `docs/ARCHITECTURE.md` once you are comfortable with the basics.
- Browse `electron/ui/` for examples of how new panels or dashboards are wired in.
- Check `hooks/` for automation scripts if you plan to extend agent behaviour.

You now have a working development environment—happy exploring!
