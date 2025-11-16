const test = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { BigDaddyGCoreBridge } = require('../../bigdaddyg-agentic-core');

test('discoverModelPaths includes Unix-style Ollama directories', () => {
  const originalExistsSync = fs.existsSync;
  const originalHome = process.env.HOME;

  process.env.HOME = '/home/tester';

  const expectedPaths = new Set([
    path.join(process.env.HOME, '.ollama'),
    path.join(process.env.HOME, '.ollama', 'models'),
    '/usr/local/share/ollama',
  ]);

  fs.existsSync = (candidate) => expectedPaths.has(candidate);

  try {
    const core = new BigDaddyGCoreBridge();
    expectedPaths.forEach((candidate) => {
      assert(
        core.modelPaths.includes(candidate),
        `Expected ${candidate} to be included in discovered model paths`,
      );
    });
  } finally {
    fs.existsSync = originalExistsSync;
    process.env.HOME = originalHome;
  }
});
