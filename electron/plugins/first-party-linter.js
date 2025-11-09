(function() {
'use strict';

const PLUGIN_ID = 'lint-coach';
const STORAGE_KEY = 'lint-coach:last-result';
const STYLE_ID = 'lint-coach-styles';

function waitForPluginSystem() {
    if (window.pluginSystem) {
        activate();
        return;
    }
    setTimeout(waitForPluginSystem, 500);
}

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        #lint-coach-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 340px;
            max-height: 60vh;
            background: rgba(10, 12, 32, 0.92);
            border: 1px solid rgba(0, 212, 255, 0.35);
            border-radius: 14px;
            box-shadow: 0 18px 48px rgba(0, 0, 0, 0.45);
            color: #e0f7ff;
            z-index: 11000;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(12px);
            overflow: hidden;
            transition: transform 0.2s ease, opacity 0.2s ease;
        }

        #lint-coach-panel.hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateY(12px);
        }

        #lint-coach-panel header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.35), rgba(0, 255, 136, 0.2));
            border-bottom: 1px solid rgba(0, 212, 255, 0.25);
        }

        #lint-coach-panel header h2 {
            font-size: 15px;
            font-weight: 700;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        #lint-coach-panel header button {
            margin-left: 6px;
            padding: 6px 10px;
            background: rgba(3, 17, 40, 0.6);
            color: #e0f7ff;
            border: 1px solid rgba(0, 212, 255, 0.45);
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.2s ease;
        }

        #lint-coach-panel header button:hover {
            background: rgba(3, 17, 40, 0.85);
            transform: translateY(-1px);
        }

        #lint-coach-body {
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            overflow-y: auto;
        }

        .lint-coach-status {
            font-size: 12px;
            color: rgba(225, 245, 255, 0.75);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .lint-coach-status .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #7ef9c6;
            box-shadow: 0 0 12px rgba(126, 249, 198, 0.8);
        }

        .lint-coach-status.running .dot {
            background: #ffd166;
            box-shadow: 0 0 10px rgba(255, 209, 102, 0.9);
            animation: lintPulse 0.8s infinite;
        }

        .lint-coach-status.error .dot {
            background: #ff6b6b;
            box-shadow: 0 0 10px rgba(255, 107, 107, 0.9);
        }

        @keyframes lintPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.25); }
        }

        .lint-coach-summary {
            background: rgba(0, 18, 43, 0.65);
            border: 1px solid rgba(0, 212, 255, 0.18);
            border-radius: 10px;
            padding: 10px 12px;
            font-size: 12px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .lint-coach-summary .stat {
            text-align: center;
        }

        .lint-coach-summary .label {
            color: rgba(209, 239, 255, 0.6);
            font-size: 11px;
        }

        .lint-coach-summary .value {
            font-size: 15px;
            font-weight: 700;
        }

        .lint-coach-issues {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 200px;
            overflow-y: auto;
        }

        .lint-coach-issues.empty::before {
            content: '✅ Workspace is lint-clean. Great job!';
            font-size: 12px;
            color: rgba(126, 249, 198, 0.9);
        }

        .lint-issue {
            border: 1px solid rgba(0, 212, 255, 0.15);
            border-radius: 8px;
            padding: 8px 10px;
            background: rgba(2, 24, 58, 0.6);
            font-size: 12px;
            cursor: pointer;
            transition: border 0.2s ease, transform 0.2s ease;
        }

        .lint-issue:hover {
            border-color: rgba(0, 212, 255, 0.35);
            transform: translateX(2px);
        }

        .lint-issue .meta {
            font-size: 11px;
            color: rgba(209, 239, 255, 0.65);
            margin-bottom: 4px;
        }

        .lint-issue.error .meta {
            color: rgba(255, 118, 118, 0.85);
        }

        .lint-issue.warning .meta {
            color: rgba(255, 209, 102, 0.85);
        }

        .lint-issue .rule {
            margin-top: 4px;
            font-size: 10px;
            color: rgba(126, 199, 255, 0.65);
        }

        #lint-coach-panel footer {
            padding: 10px 12px;
            border-top: 1px solid rgba(0, 212, 255, 0.12);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: rgba(205, 235, 255, 0.65);
            background: rgba(0, 18, 43, 0.55);
        }

        #lint-coach-panel footer button {
            padding: 4px 8px;
            border-radius: 5px;
            border: 1px solid rgba(0, 212, 255, 0.3);
            background: rgba(3, 30, 68, 0.75);
            color: #e0f7ff;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        #lint-coach-panel footer button:hover {
            background: rgba(3, 45, 90, 0.95);
        }
    `;

    document.head.appendChild(style);
}

class LintCoach {
    constructor(apis) {
        this.apis = apis;
        this.electron = window.electron || null;
        this.state = 'idle';
        this.results = null;
        this.pendingRun = null;
        this.autoDelay = 1500;
        this.lastCommand = 'npm run lint -- --max-warnings=0';

        ensureStyles();
        this.panel = this.createPanel();
        this.restoreLastResult();
        this.registerHooks();
        this.exposeAPI();
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'lint-coach-panel';
        panel.innerHTML = `
            <header>
                <h2>🧹 Lint Coach</h2>
                <div>
                    <button data-action="run">Run Lint</button>
                    <button data-action="toggle">Hide</button>
                </div>
            </header>
            <div id="lint-coach-body">
                <div class="lint-coach-status"><span class="dot"></span><span class="text">Idle</span></div>
                <div class="lint-coach-summary">
                    <div class="stat">
                        <div class="label">Problems</div>
                        <div class="value" data-summary="problems">0</div>
                    </div>
                    <div class="stat">
                        <div class="label">Errors</div>
                        <div class="value" data-summary="errors">0</div>
                    </div>
                    <div class="stat">
                        <div class="label">Warnings</div>
                        <div class="value" data-summary="warnings">0</div>
                    </div>
                </div>
                <div class="lint-coach-issues empty" data-role="issues"></div>
            </div>
            <footer>
                <span data-role="last-run">No lint run yet.</span>
                <div>
                    <button data-action="copy">Copy Output</button>
                    <button data-action="clear">Clear</button>
                </div>
            </footer>
        `;

        document.body.appendChild(panel);

        panel.addEventListener('click', (event) => {
            const action = event.target.dataset.action;
            if (!action) return;

            switch (action) {
                case 'run':
                    this.runLint('manual');
                    break;
                case 'toggle':
                    this.toggleVisibility();
                    break;
                case 'copy':
                    this.copyOutput();
                    break;
                case 'clear':
                    this.clearResults();
                    break;
            }
        });

        panel.querySelector('[data-role="issues"]').addEventListener('click', (event) => {
            const item = event.target.closest('.lint-issue');
            if (!item) return;
            const index = Number(item.dataset.index);
            const issue = this.results?.issues?.[index];
            if (!issue) return;
            this.focusIssue(issue);
        });

        return panel;
    }

    registerHooks() {
        if (this.apis?.plugin?.on) {
            this.apis.plugin.on('file:save', () => this.scheduleLint('file-save'));
        }

        if (window.hotkeyManager?.register) {
            window.hotkeyManager.register('lint-coach-run', 'Ctrl+Alt+L', () => {
                this.runLint('hotkey');
            }, 'Run first-party linter');
        }
    }

    exposeAPI() {
        window.lintCoach = {
            run: (source) => this.runLint(source || 'manual'),
            getLastResult: () => this.results,
            show: () => this.show(),
            hide: () => this.hide(),
            toggle: () => this.toggleVisibility(),
            schedule: (reason) => this.scheduleLint(reason || 'api')
        };
    }

    scheduleLint(reason) {
        if (this.pendingRun) {
            clearTimeout(this.pendingRun);
        }
        this.pendingRun = setTimeout(() => {
            this.runLint(reason || 'auto');
        }, this.autoDelay);
    }

    async runLint(trigger) {
        if (this.state === 'running') {
            console.warn('[LintCoach] Lint already in progress. Skipping.');
            return;
        }

        if (!this.electron?.executeCommand) {
            this.updateStatus('error', 'Electron command bridge unavailable.');
            console.error('[LintCoach] executeCommand API is not available.');
            return;
        }

        this.updateStatus('running', `Running ESLint (${trigger || 'manual'})...`);

        try {
            const result = await this.electron.executeCommand(this.lastCommand, 'powershell');
            this.handleLintResult(result);
        } catch (error) {
            console.error('[LintCoach] Lint execution failed:', error);
            this.updateStatus('error', error?.message || 'Lint execution error');
            this.showNotification('Lint run failed. See console for details.', 'error');
        }
    }

    handleLintResult(result) {
        this.pendingRun = null;

        if (!result) {
            this.updateStatus('error', 'No output from lint command');
            return;
        }

        const combined = [result.output, result.error]
            .filter(Boolean)
            .join('\n')
            .trim();

        const parsed = this.parseLintOutput(combined);
        parsed.exitCode = typeof result.code === 'number' ? result.code : null;
        parsed.command = this.lastCommand;
        parsed.completedAt = new Date().toISOString();

        this.results = parsed;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

        this.renderResults(parsed);

        if (parsed.summary.totalProblems === 0) {
            this.updateStatus('success', 'Workspace is lint-clean.');
            this.showNotification('Lint check passed – zero problems detected.', 'success');
        } else {
            this.updateStatus('error', `${parsed.summary.errors} error(s), ${parsed.summary.warnings} warning(s)`);
            this.showNotification(`Lint found ${parsed.summary.totalProblems} problem(s).`, 'warning');
        }
    }

    parseLintOutput(output) {
        const issues = [];
        const lines = output.split(/\r?\n/);
        let currentFile = null;

        const fileRegex = /^(?:[A-Za-z]:\\|\.{0,2}[\\/]|\/).+\.(?:js|jsx|ts|tsx|mjs|cjs)$/i;
        const issueRegex = /^\s*(\d+):(\d+)\s+(error|warning)\s+(.*?)\s{2,}([\w-\/]+)$/i;
        const summaryRegex = /^✖\s*(\d+)\s+problem.*?(\d+)\s+error.*?(\d+)\s+warning/i;

        const summary = {
            totalProblems: 0,
            errors: 0,
            warnings: 0
        };

        for (const raw of lines) {
            const line = raw.trimEnd();
            if (!line) continue;

            if (fileRegex.test(line)) {
                currentFile = line.trim();
                continue;
            }

            const issueMatch = line.match(issueRegex);
            if (issueMatch && currentFile) {
                issues.push({
                    file: currentFile,
                    line: Number(issueMatch[1]),
                    column: Number(issueMatch[2]),
                    severity: issueMatch[3].toLowerCase(),
                    message: issueMatch[4].trim(),
                    ruleId: issueMatch[5]
                });
                continue;
            }

            if (summaryRegex.test(line)) {
                const match = line.match(summaryRegex);
                summary.totalProblems = Number(match[1] || 0);
                summary.errors = Number(match[2] || 0);
                summary.warnings = Number(match[3] || 0);
            }
        }

        if (summary.totalProblems === 0 && issues.length > 0) {
            const errors = issues.filter((issue) => issue.severity === 'error').length;
            const warnings = issues.length - errors;
            summary.totalProblems = issues.length;
            summary.errors = errors;
            summary.warnings = warnings;
        }

        return {
            output,
            issues,
            summary
        };
    }

    renderResults(results) {
        const issuesContainer = this.panel.querySelector('[data-role="issues"]');
        const lastRun = this.panel.querySelector('[data-role="last-run"]');

        if (!issuesContainer || !lastRun) return;

        const { summary, issues } = results;

        this.panel.querySelector('[data-summary="problems"]').textContent = String(summary.totalProblems);
        this.panel.querySelector('[data-summary="errors"]').textContent = String(summary.errors);
        this.panel.querySelector('[data-summary="warnings"]').textContent = String(summary.warnings);

        issuesContainer.innerHTML = '';
        issuesContainer.classList.toggle('empty', issues.length === 0);

        issues.forEach((issue, index) => {
            const item = document.createElement('div');
            item.className = `lint-issue ${issue.severity}`;
            item.dataset.index = String(index);

            item.innerHTML = `
                <div class="meta">${this.compactPath(issue.file)} • ${issue.line}:${issue.column} • ${issue.severity.toUpperCase()}</div>
                <div class="message">${issue.message}</div>
                <div class="rule">${issue.ruleId}</div>
            `;

            issuesContainer.appendChild(item);
        });

        if (results.completedAt) {
            const completed = new Date(results.completedAt);
            lastRun.textContent = `Last run: ${completed.toLocaleTimeString()} (${results.summary.totalProblems} issue${results.summary.totalProblems === 1 ? '' : 's'})`;
        }
    }

    focusIssue(issue) {
        console.log('[LintCoach] Issue selected:', issue);
        const openFile = window.openFileFromPath || window.openFileAbsolute || window.fullAgenticDemo?.openFile;
        if (typeof openFile === 'function' && issue.file) {
            try {
                openFile(issue.file, issue.line, issue.column);
                return;
            } catch (error) {
                console.warn('[LintCoach] Failed to open file via bridge:', error);
            }
        }

        if (window.editor?.revealLineInCenter) {
            try {
                window.editor.revealLineInCenter(issue.line, monaco?.editor?.ScrollType?.Smooth);
                window.editor.setPosition({ lineNumber: issue.line, column: issue.column });
            } catch (error) {
                console.warn('[LintCoach] Unable to move cursor to issue:', error);
            }
        }

        this.showNotification(`Lint issue in ${this.compactPath(issue.file)} • ${issue.message}`, 'warning');
    }

    copyOutput() {
        if (!this.results?.output) {
            this.showNotification('No lint output to copy.', 'info');
            return;
        }

        navigator.clipboard?.writeText(this.results.output).then(() => {
            this.showNotification('Lint output copied to clipboard.', 'success');
        }).catch((error) => {
            console.warn('[LintCoach] Clipboard copy failed:', error);
            this.showNotification('Failed to copy lint output.', 'error');
        });
    }

    clearResults() {
        this.results = null;
        localStorage.removeItem(STORAGE_KEY);
        this.panel.querySelector('[data-role="issues"]').innerHTML = '';
        this.panel.querySelector('[data-role="issues"]').classList.add('empty');
        this.panel.querySelector('[data-role="last-run"]').textContent = 'Cleared lint history.';
        this.panel.querySelector('[data-summary="problems"]').textContent = '0';
        this.panel.querySelector('[data-summary="errors"]').textContent = '0';
        this.panel.querySelector('[data-summary="warnings"]').textContent = '0';
        this.updateStatus('idle', 'Awaiting lint run.');
    }

    restoreLastResult() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            this.results = parsed;
            this.renderResults(parsed);
            this.updateStatus('success', 'Loaded cached lint results.');
        } catch (error) {
            console.warn('[LintCoach] Failed to restore cached lint data:', error);
        }
    }

    updateStatus(state, message) {
        this.state = state;
        const status = this.panel.querySelector('.lint-coach-status');
        if (!status) return;
        status.classList.remove('running', 'error', 'success');
        if (state === 'running') status.classList.add('running');
        if (state === 'error') status.classList.add('error');
        if (state === 'success') status.classList.add('success');
        status.querySelector('.text').textContent = message;
    }

    showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type || 'info');
            return;
        }
        console.log(`[LintCoach][${type || 'info'}] ${message}`);
    }

    show() {
        this.panel.classList.remove('hidden');
    }

    hide() {
        this.panel.classList.add('hidden');
    }

    toggleVisibility() {
        this.panel.classList.toggle('hidden');
    }

    compactPath(path) {
        if (!path) return 'unknown';
        const normalized = path.replace(/\\/g, '/');
        const segments = normalized.split('/');
        if (segments.length <= 3) return normalized;
        return `${segments.slice(-3).join('/')}`;
    }
}

function activate() {
    window.pluginSystem.registerPluginCode(PLUGIN_ID, (apis) => {
        console.log('[LintCoach] Activating first-party linter plugin...');
        new LintCoach(apis);
    });
}

waitForPluginSystem();

})();

