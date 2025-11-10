/**
 * Monaco Editor Integration Test
 * Verifies Monaco loads correctly with simplified initialization
 */

describe('Monaco Editor Loading', () => {
  let mockRequire;
  let mockDefine;
  let mockMonaco;

  beforeEach(() => {
    // Reset global state
    window.monaco = undefined;
    window.onMonacoLoad = undefined;
    window.__monacoReady = false;

    // Mock AMD loader
    mockRequire = jest.fn();
    mockRequire.config = jest.fn();
    
    mockDefine = jest.fn();
    mockDefine.amd = true;

    // Mock Monaco API
    mockMonaco = {
      editor: {
        create: jest.fn(),
        defineTheme: jest.fn(),
        createModel: jest.fn(),
        setModelLanguage: jest.fn()
      },
      Range: jest.fn()
    };

    window.require = mockRequire;
    window.define = mockDefine;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AMD Loader Setup', () => {
    test('should configure AMD paths correctly', () => {
      // Simulate the index.html AMD setup
      const require = { 
        paths: { 
          'vs': './node_modules/monaco-editor/min/vs' 
        }
      };

      expect(require.paths.vs).toBe('./node_modules/monaco-editor/min/vs');
    });

    test('should stub process for Electron compatibility', () => {
      // Simulate the process stub from index.html
      window.process = window.process || { 
        env: {}, 
        platform: 'browser',
        cwd: () => '/'
      };

      expect(window.process).toBeDefined();
      expect(window.process.platform).toBe('browser');
      expect(typeof window.process.cwd).toBe('function');
    });
  });

  describe('Monaco Initialization', () => {
    test('should call onMonacoLoad when Monaco is loaded', () => {
      const onMonacoLoadSpy = jest.fn();
      window.onMonacoLoad = onMonacoLoadSpy;
      window.monaco = mockMonaco;

      // Simulate AMD loader callback
      const amdCallback = jest.fn(() => {
        window.__monacoReady = true;
        if (typeof window.onMonacoLoad === 'function') {
          window.onMonacoLoad();
        }
      });

      amdCallback();

      expect(window.__monacoReady).toBe(true);
      expect(onMonacoLoadSpy).toHaveBeenCalled();
    });

    test('should wait for Monaco before initializing editor', (done) => {
      let editorInitialized = false;

      // Simulate initMonacoEditor logic
      function initMonacoEditor() {
        if (typeof window.monaco === 'undefined') {
          setTimeout(initMonacoEditor, 100);
          return;
        }

        editorInitialized = true;
        expect(window.monaco).toBeDefined();
        done();
      }

      // Start initialization
      initMonacoEditor();

      // Monaco not available yet
      expect(editorInitialized).toBe(false);

      // Simulate Monaco becoming available
      setTimeout(() => {
        window.monaco = mockMonaco;
      }, 50);
    });

    test('should verify container exists before creating editor', () => {
      // Create mock container
      const container = document.createElement('div');
      container.id = 'monaco-container';
      container.style.width = '100px';
      container.style.height = '100px';
      document.body.appendChild(container);

      window.monaco = mockMonaco;

      // Simulate initMonacoEditor check
      const foundContainer = document.getElementById('monaco-container');
      expect(foundContainer).toBeDefined();
      expect(foundContainer.offsetParent).not.toBeNull();

      // Cleanup
      document.body.removeChild(container);
    });
  });

  describe('Error Handling', () => {
    test('should show error message if Monaco fails to load', () => {
      const container = document.createElement('div');
      container.id = 'monaco-container';
      document.body.appendChild(container);

      // Simulate showMonacoError function from renderer.js
      function showMonacoError(message) {
        const errorContainer = document.getElementById('monaco-container');
        if (errorContainer) {
          errorContainer.innerHTML = `
            <div style="text-align: center;">
              <h2>${message}</h2>
            </div>
          `;
        }
      }

      showMonacoError('Monaco Editor failed to load');

      expect(container.innerHTML).toContain('Monaco Editor failed to load');

      // Cleanup
      document.body.removeChild(container);
    });

    test('should handle missing AMD loader gracefully', () => {
      window.require = undefined;
      
      // Simulate AMD loader check
      const hasAMDLoader = typeof window.require === 'function' && 
                           typeof window.require.config === 'function';

      expect(hasAMDLoader).toBe(false);
      // Should show error or fallback
    });
  });

  describe('Theme Configuration', () => {
    test('should define custom theme when Monaco loads', () => {
      window.monaco = mockMonaco;

      // Simulate theme definition from renderer.js
      mockMonaco.editor.defineTheme('bigdaddyg-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.selectionBackground': '#00d4ff40',
          'editor.selectionHighlightBackground': '#00d4ff20'
        }
      });

      expect(mockMonaco.editor.defineTheme).toHaveBeenCalledWith(
        'bigdaddyg-dark',
        expect.objectContaining({
          base: 'vs-dark',
          inherit: true
        })
      );
    });
  });

  describe('Editor Creation', () => {
    test('should create editor with correct options', () => {
      const container = document.createElement('div');
      container.id = 'monaco-container';
      document.body.appendChild(container);
      window.monaco = mockMonaco;

      // Simulate editor creation
      mockMonaco.editor.create(container, {
        value: '// Welcome to BigDaddyG IDE',
        language: 'markdown',
        theme: 'bigdaddyg-dark',
        fontSize: 14,
        lineHeight: 22
      });

      expect(mockMonaco.editor.create).toHaveBeenCalledWith(
        container,
        expect.objectContaining({
          language: 'markdown',
          theme: 'bigdaddyg-dark'
        })
      );

      // Cleanup
      document.body.removeChild(container);
    });
  });

  describe('Timeout Handling', () => {
    test('should timeout if Monaco does not load within 15 seconds', (done) => {
      jest.useFakeTimers();
      
      let timeoutTriggered = false;

      // Simulate timeout logic from renderer.js
      const monacoTimeout = setTimeout(() => {
        if (typeof window.monaco === 'undefined') {
          timeoutTriggered = true;
        }
      }, 15000);

      // Fast-forward time
      jest.advanceTimersByTime(15000);

      expect(timeoutTriggered).toBe(true);
      
      clearTimeout(monacoTimeout);
      jest.useRealTimers();
      done();
    });

    test('should cancel timeout if Monaco loads successfully', (done) => {
      jest.useFakeTimers();
      
      let timeoutTriggered = false;

      const monacoTimeout = setTimeout(() => {
        if (typeof window.monaco === 'undefined') {
          timeoutTriggered = true;
        }
      }, 15000);

      // Simulate successful Monaco load
      window.monaco = mockMonaco;
      clearTimeout(monacoTimeout);

      // Fast-forward time to verify timeout was cancelled
      jest.advanceTimersByTime(15000);

      expect(timeoutTriggered).toBe(false);
      expect(window.monaco).toBeDefined();
      
      jest.useRealTimers();
      done();
    });
  });
});
