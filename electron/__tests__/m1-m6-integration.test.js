/**
 * Integration Tests for M1-M6 Features
 * Tests all agentic features together
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

describe('M1-M6 Integration Tests', () => {
  let mockEditor;
  let mockElectron;
  let mockOrchestraApi;

  beforeEach(() => {
    // Mock Monaco editor
    mockEditor = {
      getSelection: jest.fn(() => ({
        startLineNumber: 1,
        endLineNumber: 5,
        startColumn: 1,
        endColumn: 10,
        isEmpty: false
      })),
      getModel: jest.fn(() => ({
        getValueInRange: jest.fn(() => 'const x = 1;'),
        getLanguageId: jest.fn(() => 'javascript'),
        uri: { path: '/test/file.js' }
      })),
      executeEdits: jest.fn(),
      addContentWidget: jest.fn(),
      removeContentWidget: jest.fn(),
      addAction: jest.fn()
    };

    // Mock Electron APIs
    mockElectron = {
      readFile: jest.fn(() => Promise.resolve('file content')),
      writeFile: jest.fn(() => Promise.resolve()),
      executeCommand: jest.fn(() => Promise.resolve({ code: 0, output: '' })),
      onFileChanged: jest.fn()
    };

    // Mock Orchestra API
    mockOrchestraApi = {
      getModels: jest.fn(() => Promise.resolve(['llama3:latest'])),
      generate: jest.fn(() => Promise.resolve('AI response'))
    };

    // Setup global mocks
    global.monaco = {
      editor: {
        addAction: jest.fn(),
        getEditors: jest.fn(() => [mockEditor]),
        ContentWidgetPositionPreference: {
          BELOW: 1
        },
        KeyMod: {
          CtrlCmd: 1,
          Shift: 2
        },
        KeyCode: {
          KeyE: 1,
          KeyF: 2,
          KeyR: 3,
          KeyD: 4,
          KeyT: 5,
          Unknown: 0
        }
      }
    };

    global.window = {
      editor: mockEditor,
      monacoEditor: mockEditor,
      electron: mockElectron,
      orchestraApi: mockOrchestraApi,
      notify: {
        info: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        warning: jest.fn()
      },
      completeTabSystem: {
        createTab: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('M1: Monaco Inline AI', () => {
    test('should initialize Monaco inline AI', () => {
      const MonacoInlineAI = require('../monaco-inline-ai.js');
      expect(window.monacoInlineAI).toBeDefined();
    });

    test('should explain selection', async () => {
      const MonacoInlineAI = require('../monaco-inline-ai.js');
      await window.monacoInlineAI.explainSelection();
      
      expect(mockOrchestraApi.generate).toHaveBeenCalled();
      expect(mockEditor.getSelection).toHaveBeenCalled();
    });

    test('should quick fix selection', async () => {
      const MonacoInlineAI = require('../monaco-inline-ai.js');
      await window.monacoInlineAI.quickFix();
      
      expect(mockOrchestraApi.generate).toHaveBeenCalled();
    });

    test('should refactor selection', async () => {
      const MonacoInlineAI = require('../monaco-inline-ai.js');
      await window.monacoInlineAI.refactor();
      
      expect(mockOrchestraApi.generate).toHaveBeenCalled();
    });
  });

  describe('M2: Command Palette', () => {
    test('should initialize command palette', () => {
      const CommandPalette = require('../command-palette.js');
      expect(window.commandPalette).toBeDefined();
    });

    test('should register commands', () => {
      const CommandPalette = require('../command-palette.js');
      expect(window.commandPalette.commands.size).toBeGreaterThan(0);
    });

    test('should handle slash commands', () => {
      const CommandPalette = require('../command-palette.js');
      window.commandPalette.handleInput('/fix');
      expect(window.commandPalette.currentInput).toBe('/fix');
    });
  });

  describe('M3: Agent Loop', () => {
    test('should initialize agent loop', () => {
      const AgentLoop = require('../agent-loop.js');
      expect(window.agentLoop).toBeDefined();
    });

    test('should register tools', () => {
      const AgentLoop = require('../agent-loop.js');
      expect(window.agentLoop.tools.size).toBeGreaterThan(0);
    });

    test('should execute plan', async () => {
      const AgentLoop = require('../agent-loop.js');
      const plan = {
        name: 'Test Plan',
        steps: [
          { tool: 'fs.read', params: { path: '/test' } }
        ]
      };
      
      const jobId = await window.agentLoop.executePlan(plan);
      expect(jobId).toBeDefined();
    });
  });

  describe('M4: Repo Context Provider', () => {
    test('should initialize repo context provider', () => {
      const RepoContextProvider = require('../repo-context-provider.js');
      expect(window.repoContext).toBeDefined();
    });

    test('should get context for selection', async () => {
      const RepoContextProvider = require('../repo-context-provider.js');
      const context = await window.repoContext.getContextForSelection(
        '/test/file.js',
        { startLine: 1, endLine: 5 },
        'explain'
      );
      
      expect(context).toBeDefined();
      expect(context.file).toBe('/test/file.js');
    });
  });

  describe('M5: Test Orchestrator', () => {
    test('should initialize test orchestrator', () => {
      const TestOrchestrator = require('../test-orchestrator.js');
      expect(window.testOrchestrator).toBeDefined();
    });

    test('should register test runners', () => {
      const TestOrchestrator = require('../test-orchestrator.js');
      expect(window.testOrchestrator.runners.size).toBeGreaterThan(0);
    });
  });

  describe('M6: Git/PR UX', () => {
    test('should initialize Git/PR UX', () => {
      const GitPRUX = require('../git-pr-ux.js');
      expect(window.gitPRUX).toBeDefined();
    });

    test('should refresh git status', async () => {
      const GitPRUX = require('../git-pr-ux.js');
      mockElectron.executeCommand.mockResolvedValue({
        code: 0,
        output: ' M file.js\n'
      });
      
      await window.gitPRUX.refreshStatus();
      expect(mockElectron.executeCommand).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    test('should integrate Monaco AI with repo context', async () => {
      const MonacoInlineAI = require('../monaco-inline-ai.js');
      const RepoContextProvider = require('../repo-context-provider.js');
      
      window.repoContext.symbolIndex.set('test:file:func', {
        name: 'func',
        file: 'test/file.js',
        line: 1,
        kind: 'function'
      });
      
      await window.monacoInlineAI.explainSelection();
      
      expect(mockOrchestraApi.generate).toHaveBeenCalled();
    });

    test('should integrate command palette with Monaco AI', () => {
      const MonacoInlineAI = require('../monaco-inline-ai.js');
      const CommandPalette = require('../command-palette.js');
      
      const command = window.commandPalette.commands.get('ai.explain');
      expect(command).toBeDefined();
      expect(typeof command.handler).toBe('function');
    });
  });
});
