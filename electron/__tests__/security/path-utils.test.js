const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const { validateFsPath } = require('../../security/path-utils');

function createFixture() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdg-path-'));
  const nestedDir = path.join(rootDir, 'nested');
  const filePath = path.join(nestedDir, 'test.txt');

  fs.mkdirSync(nestedDir, { recursive: true });
  fs.writeFileSync(filePath, 'hello world', 'utf8');

  return { rootDir, nestedDir, filePath };
}

test('validateFsPath allows files within allowed directories', () => {
  const { rootDir, nestedDir, filePath } = createFixture();
  try {
    const resolvedFile = validateFsPath(filePath, {
      allowedBasePaths: [rootDir],
      allowFiles: true,
      allowDirectories: false,
      mustExist: true,
    });

    const resolvedDir = validateFsPath(nestedDir, {
      allowedBasePaths: [rootDir],
      allowFiles: false,
      allowDirectories: true,
      mustExist: true,
    });

    assert.strictEqual(resolvedFile, path.resolve(filePath));
    assert.strictEqual(resolvedDir, path.resolve(nestedDir));
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

test('validateFsPath blocks traversal outside allowed directories', () => {
  const { rootDir } = createFixture();
  try {
    assert.throws(
      () =>
        validateFsPath(path.join(rootDir, '..', 'outside.txt'), {
          allowedBasePaths: [rootDir],
          allowFiles: true,
          allowDirectories: false,
        }),
      /not within an allowed directory/i,
    );
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

test('validateFsPath rejects null bytes', () => {
  const { rootDir, filePath } = createFixture();
  try {
    assert.throws(
      () =>
        validateFsPath(`${filePath}\u0000`, {
          allowedBasePaths: [rootDir],
          allowFiles: true,
          allowDirectories: false,
        }),
      /null byte/i,
    );
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

test('validateFsPath respects mustExist=false for future files', () => {
  const { rootDir, nestedDir } = createFixture();
  try {
    const futureFile = path.join(nestedDir, 'new-file.txt');
    const futureResolved = validateFsPath(futureFile, {
      allowedBasePaths: [rootDir],
      allowFiles: true,
      allowDirectories: false,
      mustExist: false,
    });

    assert.strictEqual(futureResolved, path.resolve(futureFile));
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

test('validateFsPath normalises path casing within allowed directories', () => {
  const { rootDir } = createFixture();
  try {
    const caseVariant = path.join(rootDir, 'nested', 'TEST.txt');
    const resolved = validateFsPath(caseVariant, {
      allowedBasePaths: [rootDir],
      allowFiles: true,
      allowDirectories: false,
      mustExist: false,
    });

    assert.strictEqual(resolved, path.resolve(caseVariant));
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});

