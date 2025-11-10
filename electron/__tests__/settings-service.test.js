const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

function loadSettingsService(tempDir) {
  const modulePath = require.resolve('../settings/settings-service');
  delete require.cache[modulePath];
  const service = require('../settings/settings-service');

  if (tempDir) {
    const appStub = {
      getPath: () => tempDir,
    };
    service.initialize(appStub);
  }

  return service;
}

test('services.orchestra defaults, updates, and reset', async (t) => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bdg-settings-'));
  const settingsService = loadSettingsService(tmpRoot);

  t.after(() => {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch (error) {
      if (process.env.DEBUG_SETTINGS_TESTS) {
        console.warn('Cleanup warning:', error);
      }
    }
  });

  await t.test('defaults expose orchestra auto-start configuration', () => {
    const defaults = settingsService.getDefaults();
    const orchestraDefaults = defaults.services?.orchestra;

    assert.ok(orchestraDefaults, 'orchestra defaults should exist');
    assert.equal(orchestraDefaults.autoStart, true);
    assert.equal(orchestraDefaults.autoRestart, true);
    assert.equal(orchestraDefaults.autoStartDelayMs, 1500);
  });

  await t.test('get returns persisted orchestra settings', () => {
    assert.equal(settingsService.get('services.orchestra.autoStart'), true);
    assert.equal(settingsService.get('services.orchestra.autoRestart'), true);
    assert.equal(settingsService.get('services.orchestra.autoStartDelayMs'), 1500);
  });

  await t.test('set updates orchestra service properties', () => {
    settingsService.set('services.orchestra.autoStart', false, { save: false, silent: true });
    settingsService.set('services.orchestra.autoRestart', false, { save: false, silent: true });
    settingsService.set('services.orchestra.autoStartDelayMs', 2500, { save: false, silent: true });

    assert.equal(settingsService.get('services.orchestra.autoStart'), false);
    assert.equal(settingsService.get('services.orchestra.autoRestart'), false);
    assert.equal(settingsService.get('services.orchestra.autoStartDelayMs'), 2500);
  });

  await t.test('reset restores orchestra defaults', () => {
    settingsService.reset('services.orchestra', { save: false, silent: true });

    assert.equal(settingsService.get('services.orchestra.autoStart'), true);
    assert.equal(settingsService.get('services.orchestra.autoRestart'), true);
    assert.equal(settingsService.get('services.orchestra.autoStartDelayMs'), 1500);
  });

  await t.test('update merges orchestra configuration', () => {
    settingsService.update(
      { services: { orchestra: { autoStartDelayMs: 3200, autoStart: false } } },
      { save: false, silent: true },
    );

    assert.equal(settingsService.get('services.orchestra.autoStartDelayMs'), 3200);
    assert.equal(settingsService.get('services.orchestra.autoStart'), false);

    settingsService.reset('services.orchestra', { save: false, silent: true });
  });
});
