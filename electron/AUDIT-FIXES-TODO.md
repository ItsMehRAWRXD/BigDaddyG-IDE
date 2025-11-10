# Audit Fixes TODO List
**Generated:** ${new Date().toISOString()}
**Status:** 🔴 In Progress

## Critical Issues (Must Fix)

### 1. ✅ Duplicate Terminal Toggles (Ctrl+J vs Ctrl+`)
**Issue:** Both hotkeys call different placeholders (toggleTerminal, toggleConsolePanel)
**Files:** hotkey-manager.js, console-panel.js, terminal-panel.js
**Fix:** Unified terminal toggle to Ctrl+J (terminal-panel.js), Ctrl+` removed
**Status:** ✅ FIXED - Consolidated to single terminal panel with Ctrl+J

### 2. 🔴 Console/Terminal/Browser Panels Outside Layout Manager
**Issue:** Panels are absolute-position overlays causing conflicts
**Files:** console-panel.js, terminal-panel.js, browser-panel.js, panel-manager.js
**Fix:** Create unified panel manager with shared state
**Status:** 🔴 TODO - Needs panel-manager.js refactor

### 3. 🔴 Command Palette: Marketplace & Model Catalog Don't Open
**Issue:** Menu entries exist but no UI invocation
**Files:** plugin-marketplace.js, model-loader.js, hotkey-manager.js
**Fix:** Implement openMarketplace() & openModelCatalog() functions
**Status:** 🔴 TODO - Functions stubbed, need implementation

### 4. 🔴 Chat Quick Actions Only Write Text
**Issue:** Buttons fill textarea without invoking agentic executor
**Files:** index.html, agentic-executor.js
**Fix:** Connect buttons to agenticExecutor.planTask/execute
**Status:** 🔴 TODO - Need to wire quick actions to executor

### 5. 🔴 Command System Slash Commands Unimplemented
**Issue:** Handlers mostly stubbed (!projectnew, !compile, etc.)
**Files:** command-system.js
**Fix:** Implement real workflows or mark experimental
**Status:** 🔴 TODO - Most commands log to console only

### 6. 🔴 Memory Bridge Controls Lack Runtime
**Issue:** Buttons call window.memory.* without service check
**Files:** memory-dashboard.js, memory-bridge.js
**Fix:** Gate UI by service availability, add health check
**Status:** 🔴 TODO - Need service availability check

### 7. 🔴 Model Hot-Swap Dropdown Duplicates Orchestra List
**Issue:** Two separate fetch flows for models
**Files:** model-hotswap.js, model-loader.js
**Fix:** Consolidate on single model source (Orchestra health)
**Status:** 🔴 TODO - Remove duplicate UI

### 8. 🔴 Agent Panel Quick Actions Log Warnings
**Issue:** orchestraClient often undefined, fails silently
**Files:** agent-panel.js, agent-panel-enhanced.js
**Fix:** Initialize shared client via preload, handle offline
**Status:** 🔴 TODO - Need proper client initialization

### 9. 🔴 Floating Chat + Sidebar Chat + Command System Overlap
**Issue:** Three input surfaces with inconsistent command handling
**Files:** floating-chat.js, agentic-global-api.js, command-system.js
**Fix:** Choose primary surface, ensure consistent commands
**Status:** 🔴 TODO - Need to unify chat interfaces

### 10. 🔴 Hotkeys Documented But Unmapped
**Issue:** Ctrl+Shift+M, Ctrl+Alt+S advertised but missing
**Files:** TURNKEY-COMPARISON.md, README.md, hotkey-manager.js
**Fix:** Add bindings or remove from docs
**Status:** 🔴 TODO - Need to add missing hotkeys

### 11. 🔴 Agentic "Auto Fix" Context Menu Inserts Prompt Only
**Issue:** Options add text without invoking automation
**Files:** context-summarizer.js, quick-fixes.js
**Fix:** Wire to executor tasks or rename to "Insert prompt"
**Status:** 🔴 TODO - Need executor integration

### 12. 🔴 Orchestra Status Indicator Duplicates Console Panel
**Issue:** Two independent polling loops, inconsistent state
**Files:** index.html, console-panel.js
**Fix:** Centralize health state (single event bus)
**Status:** 🔴 TODO - Need unified status system

---

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix duplicate terminal toggles
- [ ] Implement unified panel manager
- [ ] Add missing hotkey bindings
- [ ] Centralize Orchestra status

### Phase 2: Feature Completion (Week 2)
- [ ] Implement marketplace/model catalog UI
- [ ] Wire chat quick actions to executor
- [ ] Complete command system handlers
- [ ] Add memory service health checks

### Phase 3: Cleanup & Polish (Week 3)
- [ ] Consolidate model selection UI
- [ ] Unify chat interfaces
- [ ] Fix agent panel client initialization
- [ ] Wire context menu to executor

### Phase 4: Documentation (Week 4)
- [ ] Update README with accurate hotkeys
- [ ] Document all working features
- [ ] Mark experimental features clearly
- [ ] Create user guide

---

## Files to Modify

### High Priority
1. `hotkey-manager.js` - Add missing hotkeys
2. `panel-manager.js` - Create unified panel system
3. `console-panel.js` - Integrate with panel manager
4. `terminal-panel.js` - Integrate with panel manager
5. `browser-panel.js` - Integrate with panel manager

### Medium Priority
6. `command-system.js` - Implement handlers
7. `agentic-executor.js` - Wire quick actions
8. `agent-panel.js` - Fix client initialization
9. `floating-chat.js` - Unify with command system
10. `memory-dashboard.js` - Add service checks

### Low Priority
11. `plugin-marketplace.js` - Implement UI
12. `model-loader.js` - Consolidate with hotswap
13. `context-summarizer.js` - Wire to executor
14. `quick-fixes.js` - Wire to executor
15. `index.html` - Update status indicators

---

## Testing Checklist

### Terminal & Panels
- [ ] Ctrl+J toggles terminal (no conflicts)
- [ ] Ctrl+Shift+U toggles console
- [ ] Ctrl+Shift+B toggles browser
- [ ] No hidden panel conflicts
- [ ] Panel state persists correctly

### Hotkeys
- [ ] All documented hotkeys work
- [ ] No duplicate bindings
- [ ] Escape closes modals
- [ ] Ctrl+L opens floating chat

### Commands
- [ ] !projectnew creates project
- [ ] !compile works for current file
- [ ] !run executes code
- [ ] !test generates tests
- [ ] !help shows all commands

### Chat & AI
- [ ] Quick actions invoke executor
- [ ] Floating chat handles commands
- [ ] Sidebar chat consistent
- [ ] Agent panel client works
- [ ] Context menu automation works

### Status & Health
- [ ] Orchestra status accurate
- [ ] Console panel synced
- [ ] Memory service gated
- [ ] Model list unified
- [ ] No duplicate polling

---

## Notes

- All fixes should maintain backward compatibility
- Mark experimental features clearly in UI
- Add console warnings for missing services
- Document all breaking changes
- Test on Windows, Linux, macOS

---

## Progress Tracking

**Total Issues:** 12
**Fixed:** 1 (8%)
**In Progress:** 0 (0%)
**TODO:** 11 (92%)

**Target Completion:** 4 weeks
**Current Sprint:** Phase 1 - Critical Fixes
