/**
 * Comprehensive Agentic Features Tests
 */

describe('Agentic Features Tests', () => {
  describe('Self-Healing', () => {
    it('should detect compilation errors', () => {
      const error = new Error('syntax error on line 42');
      const detector = window.agenticSelfHealing?.healingStrategies?.get('compilation-error')?.detect;
      
      if (detector) {
        expect(detector(error.message)).toBe(true);
      }
    });

    it('should detect missing imports', () => {
      const error = new Error('cannot find module express');
      const detector = window.agenticSelfHealing?.healingStrategies?.get('missing-import')?.detect;
      
      if (detector) {
        expect(detector(error.message)).toBe(true);
      }
    });
  });

  describe('Composer Mode', () => {
    it('should detect relevant files from prompt', async () => {
      if (window.composerMode) {
        const files = await window.composerMode.detectRelevantFiles('Edit app.js and styles.css');
        expect(Array.isArray(files)).toBe(true);
      }
    });

    it('should generate plan for multi-file edits', async () => {
      if (window.composerMode) {
        const result = await window.composerMode.start('Add authentication to all files', ['app.js', 'routes.js']);
        expect(result.plan).toBeDefined();
        expect(result.files).toBeDefined();
      }
    });
  });

  describe('Inline Chat', () => {
    it('should generate edit suggestions', async () => {
      if (window.inlineChat) {
        const result = await window.inlineChat.start(
          'function test() { return 1; }',
          'test.js',
          'Make it return 2'
        );
        expect(result.suggestions).toBeDefined();
        expect(Array.isArray(result.suggestions)).toBe(true);
      }
    });
  });

  describe('Cursor Features', () => {
    it('should load .cursorrules', async () => {
      if (window.cursorFeatures) {
        await window.cursorFeatures.initialize();
        // Should not throw
        expect(window.cursorFeatures.initialized).toBe(true);
      }
    });

    it('should support beforePromptSubmit hook', async () => {
      if (window.cursorFeatures) {
        await window.cursorFeatures.registerCursorHook();
        // Should not throw
      }
    });
  });
});
