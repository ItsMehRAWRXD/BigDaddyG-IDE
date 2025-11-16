const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const OrchestraRemote = require(path.join(__dirname, '../../server/orchestra-remote'));

test('OrchestraRemote prefers local bridge when available', async (t) => {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async (url, options) => {
    calls.push(url);
    assert.ok(url.includes('127.0.0.1:11435'), 'should call local bridge first');
    assert.equal(options.method, 'POST');
    return {
      ok: true,
      json: async () => ({ response: 'local-response' })
    };
  };

  try {
    const remote = new OrchestraRemote();
    const result = await remote.generate('hello world', 'bigdaddyg:latest');
    assert.equal(result, 'local-response');
    assert.equal(calls.length, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test('OrchestraRemote falls back to remote API when bridge fails', async () => {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async (url) => {
    calls.push(url);
    if (url.includes('127.0.0.1')) {
      throw new Error('bridge down');
    }
    return {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'remote-response' } }]
      })
    };
  };

  try {
    const remote = new OrchestraRemote('https://example.com/v1', 'sk-test');
    const result = await remote.generate('hello remote', 'deepseek-coder');
    assert.equal(result, 'remote-response');
    assert.equal(calls.length, 2);
    assert.ok(calls[1].startsWith('https://example.com/v1'), 'should hit configured API');
  } finally {
    global.fetch = originalFetch;
  }
});

test('OrchestraRemote uses built-in response when no backends available', async () => {
  const originalFetch = global.fetch;
  const calls = [];

  global.fetch = async () => {
    calls.push('attempt');
    throw new Error('unreachable');
  };

  try {
    const remote = new OrchestraRemote();
    const result = await remote.generate('explain fallback', 'coder');
    assert.ok(result.includes('explain fallback'.substring(0, 15)));
    assert.ok(calls.length >= 1);
  } finally {
    global.fetch = originalFetch;
  }
});
