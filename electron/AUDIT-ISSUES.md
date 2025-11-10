# ProjectIDEAI Audit Report - Actionable Issues

**Audit Date:** 2024  
**Scope:** Renderer modules, main process, orchestration server, documentation  
**Status:** 12 critical issues identified requiring immediate attention

---

## Issue #1: Duplicate Terminal Toggle Hotkeys (Ctrl+J vs Ctrl+`)

**Priority:** High  
**Labels:** `enhancement`, `help-wanted`, `duplicate`, `hotkeys`

### Problem
Two separate hotkeys (`Ctrl+J` and ``Ctrl+` ``) trigger different terminal panel implementations:
- `Ctrl+J` calls `toggleTerminal()` 
- ``Ctrl+` `` calls `toggleConsolePanel()`

Neither implementation shares state, causing confusion and conflicting UI behavior.

### Affected Files
- `hotkey-manager.js` - Hotkey bindings
- `index.html` - Menu button handlers
- `terminal-panel.js` - Terminal implementation
- `console-panel.js` - Console implementation
- Documentation: README.md, terminal shortcuts section

### Recommendation
1. Merge both implementations into single unified terminal panel
2. Consolidate to one hotkey (suggest ``Ctrl+` `` as industry standard)
3. Update all menu buttons to use unified toggle
4. Remove duplicate code

### Acceptance Criteria
- [ ] Single terminal panel implementation
- [ ] One hotkey binding for terminal toggle
- [ ] Consistent state management
- [ ] Documentation updated

---

## Issue #2: Panel System Outside Layout Manager

**Priority:** Critical  
**Labels:** `enhancement`, `help-wanted`, `architecture`, `refactor`

### Problem
Console, terminal, and browser panels use absolute positioning as overlays instead of being managed by the layout system. This causes:
- Hidden panels when multiple toggles conflict
- No shared state management
- Inconsistent z-index layering
- Menu/hotkey conflicts

### Affected Files
- `console-panel.js`
- `terminal-panel.js`
- `browser-panel.js`
- `panel-manager.js` - Should manage these but doesn't
- `layout-manager.js` - Missing panel integration
- `ui/layout-manager.js` - Duplicate implementation

### Recommendation
1. Refactor all panels into centralized layout manager
2. Implement tab-based panel system
3. Remove absolute positioning overlays
4. Harmonize all panel hotkeys through layout manager
5. Add panel state persistence

### Acceptance Criteria
- [ ] All panels managed by `panel-manager.js`
- [ ] Tab-based UI for panel switching
- [ ] Consistent toggle behavior
- [ ] State persistence across sessions
- [ ] Remove duplicate layout managers

---

## Issue #3: Marketplace & Model Catalog Commands Non-Functional

**Priority:** High  
**Labels:** `enhancement`, `documentation`, `ui`

### Problem
Command palette entries exist for "Open Marketplace" and "Open Model Catalog" but clicking them does nothing. The functions are not implemented.

### Affected Files
- `plugin-marketplace.js` - Missing `openMarketplace()` implementation
- `model-loader.js` - Missing `openModelCatalog()` implementation
- `index.html` - Command palette menu entries
- `command-palette.js` - Command registration
- Documentation: Marketplace feature docs

### Recommendation
**Option A:** Implement the features
1. Create modal UI for marketplace
2. Implement model browser interface
3. Wire to command palette and hotkeys

**Option B:** Hide until ready
1. Comment out menu entries
2. Add "Coming Soon" badge in docs
3. Create feature roadmap issue

### Acceptance Criteria
- [ ] Either working UI or hidden menu entries
- [ ] Documentation reflects actual state
- [ ] No broken command palette entries

---

## Issue #4: Chat Quick Actions Only Insert Text

**Priority:** Medium  
**Labels:** `enhancement`, `help-wanted`, `agentic`

### Problem
Quick action buttons ("Generate Code", "Fix Bug", "Summarize", etc.) only insert text into the chat textarea. They don't invoke the agentic executor as documented.

### Affected Files
- `index.html` - Quick action button handlers
- `agentic-executor.js` - Not invoked by buttons
- `enhanced-agentic-executor.js` - Duplicate implementation
- Documentation: Agentic toolbar docs

### Current Behavior
```javascript
// Just inserts text
button.onclick = () => textarea.value = "Generate code for...";
```

### Expected Behavior
```javascript
// Should invoke executor
button.onclick = () => agenticExecutor.planTask("Generate code for...");
```

### Recommendation
1. Connect buttons to `agenticExecutor.planTask()` or `execute()`
2. Add loading states during execution
3. OR relabel buttons as "Insert Prompt Template"
4. Remove duplicate executor implementations

### Acceptance Criteria
- [ ] Buttons trigger actual agentic workflows
- [ ] Loading/progress indicators shown
- [ ] Error handling implemented
- [ ] Documentation matches behavior

---

## Issue #5: Command System Handlers Are Stubs

**Priority:** High  
**Labels:** `enhancement`, `help-wanted`, `documentation`, `commands`

### Problem
Slash commands (`!projectnew`, `!projectresume`, `!compile`, etc.) are registered but handlers only log to console or return dummy strings. Documentation promises fully-functional workflows.

### Affected Files
- `command-system.js` - Stub implementations
- `command-generator.js` - Related but disconnected
- Documentation: Command system docs

### Example Stub
```javascript
'!compile': () => {
  console.log('Compile command triggered');
  return 'Compilation started...'; // Does nothing
}
```

### Recommendation
1. Implement real workflows for each command OR
2. Mark commands as "experimental" in UI
3. Align documentation with actual capabilities
4. Add command status indicators (✓ ready, ⚠ experimental, 🚧 coming soon)

### Acceptance Criteria
- [ ] All commands either work or marked experimental
- [ ] Documentation accurate
- [ ] Status indicators in command palette
- [ ] Roadmap for unimplemented commands

---

## Issue #6: Memory Bridge Controls Fail Silently

**Priority:** Medium  
**Labels:** `enhancement`, `help-wanted`, `backend`

### Problem
Memory dashboard UI surfaces controls that call `window.memory.*` methods, but without the memory service running, they fail silently with no user feedback.

### Affected Files
- `memory-dashboard.js` - UI controls
- `memory-bridge.js` - Bridge implementation
- `memory-service.js` - Backend service
- Documentation: Memory integration docs

### Recommendation
1. Add health check for memory service availability
2. Gate UI controls based on service status
3. Show connection indicator (🟢 connected / 🔴 offline)
4. Display helpful error messages when service unavailable
5. Add "Start Memory Service" button with instructions

### Acceptance Criteria
- [ ] Service health check on startup
- [ ] UI disabled when service unavailable
- [ ] Clear status indicator
- [ ] Helpful error messages
- [ ] Documentation includes service setup

---

## Issue #7: Duplicate Model Lists (Hot-Swap vs Orchestra)

**Priority:** Medium  
**Labels:** `enhancement`, `duplicate`, `models`

### Problem
Two separate model fetching flows exist:
- `model-hotswap.js` - Fetches model list independently
- `model-loader.js` - Fetches from Orchestra health endpoint

Results are inconsistent and disconnected from active model state.

### Affected Files
- `model-hotswap.js`
- `model-loader.js`
- `console-panel.js` - Model dropdown
- `ui/model-selector.js` - Another duplicate

### Recommendation
1. Consolidate on single source of truth (Orchestra `/health` endpoint)
2. Remove duplicate fetching logic
3. Centralize model state management
4. Sync all UI dropdowns to single state

### Acceptance Criteria
- [ ] Single model data source
- [ ] Unified state management
- [ ] All dropdowns synchronized
- [ ] Remove duplicate implementations

---

## Issue #8: Agent Panel Orchestra Client Undefined

**Priority:** High  
**Labels:** `bug`, `help-wanted`, `agent-panel`

### Problem
Agent panel quick actions ("Fix issue", "Generate tests") call `this.orchestraClient.sendMessage()` but `orchestraClient` is often undefined, causing silent failures.

### Affected Files
- `agent-panel.js` - Uses undefined client
- `agent-panel-enhanced.js` - Duplicate with same issue
- `ui/agent-panel-enhanced.js` - Third duplicate
- `preload.js` - Should expose client but doesn't

### Root Cause
Initialization order issue - agent panel loads before orchestra client is available.

### Recommendation
1. Initialize shared orchestra client via preload bridge
2. Add null checks with user-visible warnings
3. Show "Connecting..." state during initialization
4. Handle offline state gracefully
5. Consolidate duplicate agent panel implementations

### Acceptance Criteria
- [ ] Orchestra client properly initialized
- [ ] Null checks with error messages
- [ ] Connection status indicator
- [ ] Graceful offline handling
- [ ] Single agent panel implementation

---

## Issue #9: Multiple Overlapping Chat Interfaces

**Priority:** High  
**Labels:** `enhancement`, `duplicate`, `help-wanted`, `ux`

### Problem
Three separate chat input surfaces with inconsistent behavior:
- **Sidebar chat** - Integrates with command-system
- **Floating chat** - Intercepts `!` commands but duplicates logic
- **Command system** - Separate input handling

Users are confused about which to use and behavior differs.

### Affected Files
- `floating-chat.js`
- `agentic-global-api.js`
- `command-system.js`
- `universal-chat-handler.js` - Exists but not used
- Documentation: Quick command docs

### Recommendation
1. Choose primary chat surface (recommend sidebar)
2. Ensure consistent command handling across all inputs
3. Deprecate/remove duplicate implementations
4. Use `universal-chat-handler.js` as single entry point
5. Update UX to guide users to primary interface

### Acceptance Criteria
- [ ] Single primary chat interface
- [ ] Consistent command handling
- [ ] Deprecated interfaces removed
- [ ] Clear UX guidance
- [ ] Documentation updated

---

## Issue #10: Documented Hotkeys Not Mapped

**Priority:** Medium  
**Labels:** `documentation`, `enhancement`, `hotkeys`

### Problem
Documentation advertises hotkeys that don't exist in code:
- `Ctrl+Shift+M` - Memory dashboard (not in hotkey-manager.js)
- `Ctrl+Alt+S` - Swarm Engine (not mapped)
- Others listed in TURNKEY-COMPARISON.md

### Affected Files
- `hotkey-manager.js` - Missing bindings
- `TURNKEY-COMPARISON.md` - Lists non-existent shortcuts
- `README.md` - Hotkey reference table

### Recommendation
**Option A:** Add the bindings
```javascript
'Ctrl+Shift+M': () => toggleMemoryDashboard(),
'Ctrl+Alt+S': () => openSwarmEngine()
```

**Option B:** Remove from documentation

### Acceptance Criteria
- [ ] All documented hotkeys work OR
- [ ] Documentation only lists working hotkeys
- [ ] Hotkey reference table accurate
- [ ] In-app hotkey help matches reality

---

## Issue #11: Context Menu "Auto Fix" Only Inserts Prompts

**Priority:** Low  
**Labels:** `enhancement`, `help-wanted`, `context-menu`

### Problem
Right-click context menu options like "Auto Fix" add text to chat without invoking automation. This duplicates quick action button behavior and misleads users.

### Affected Files
- `context-summarizer.js` - Context menu handlers
- `quick-fixes.js` - Related functionality
- `agentic-auto-fixer.js` - Not invoked by context menu
- UI context menu definitions in `index.html`

### Recommendation
1. Wire context menu to executor tasks OR
2. Rename to "Insert Fix Prompt"
3. Add separate "Auto Fix (Execute)" option
4. Consolidate with quick action buttons

### Acceptance Criteria
- [ ] Context menu triggers automation OR
- [ ] Renamed to reflect actual behavior
- [ ] No user confusion about functionality

---

## Issue #12: Duplicate Orchestra Status Indicators

**Priority:** Low  
**Labels:** `enhancement`, `duplicate`, `status`

### Problem
Two independent status polling loops:
- Header status indicator in `index.html`
- Console panel status in `console-panel.js`

They can show conflicting states (header green, console shows error).

### Affected Files
- `index.html` - Header status widget
- `console-panel.js` - Panel status
- `ollama-integration.js` - Health checks

### Recommendation
1. Centralize orchestra/ollama health state
2. Use single event bus for status updates
3. All UI components subscribe to same state
4. Single polling loop

### Acceptance Criteria
- [ ] Single source of truth for status
- [ ] Event-based status updates
- [ ] All indicators synchronized
- [ ] Single polling mechanism

---

## Summary Statistics

| Priority | Count |
|----------|-------|
| Critical | 1 |
| High | 5 |
| Medium | 5 |
| Low | 2 |
| **Total** | **12** |

| Category | Count |
|----------|-------|
| Duplicates | 5 |
| Unimplemented | 4 |
| Architecture | 2 |
| Documentation | 6 |
| Bugs | 1 |

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Week 1)
1. Issue #2 - Panel system refactor
2. Issue #8 - Agent panel client initialization

### Phase 2: High Priority (Week 2-3)
3. Issue #1 - Terminal toggle consolidation
4. Issue #3 - Marketplace commands
5. Issue #5 - Command system implementation
6. Issue #9 - Chat interface consolidation

### Phase 3: Medium Priority (Week 4)
7. Issue #4 - Quick actions wiring
8. Issue #6 - Memory bridge health checks
9. Issue #7 - Model list consolidation
10. Issue #10 - Hotkey documentation

### Phase 4: Polish (Week 5)
11. Issue #11 - Context menu clarity
12. Issue #12 - Status indicator consolidation

---

## Contributing

Each issue above can be converted to a GitHub issue using this template:

```markdown
**Priority:** [Critical/High/Medium/Low]
**Labels:** [comma-separated labels]

### Problem
[Problem description]

### Affected Files
[File list]

### Recommendation
[Proposed solution]

### Acceptance Criteria
[Checklist]
```

For questions or clarifications, please comment on the specific issue.
