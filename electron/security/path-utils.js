const fs = require('fs');
const path = require('path');

function toComparablePath(targetPath) {
  const resolved = path.resolve(targetPath);
  const unified = resolved.replace(/\\/g, '/');
  return process.platform === 'win32' ? unified.toLowerCase() : unified;
}

function ensureArrayOfStrings(value, name) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${name} must be a non-empty array of paths`);
  }

  for (let i = 0; i < value.length; i += 1) {
    if (typeof value[i] !== 'string' || value[i].trim() === '') {
      throw new Error(`${name}[${i}] must be a non-empty string`);
    }
  }
}

function isPathWithinAllowed(resolvedPath, allowedBasePaths) {
  const comparableTarget = toComparablePath(resolvedPath);

  return allowedBasePaths.some((basePath) => {
    const comparableBase = toComparablePath(basePath);
    if (comparableTarget === comparableBase) {
      return true;
    }
    const baseWithSep = comparableBase.endsWith('/') ? comparableBase : `${comparableBase}/`;
    return comparableTarget.startsWith(baseWithSep);
  });
}

function validateFsPath(
  targetPath,
  {
    allowedBasePaths,
    allowFiles = true,
    allowDirectories = true,
    mustExist = true,
    label = 'Path',
    maxLength = 4096,
  } = {},
) {
  if (!allowFiles && !allowDirectories) {
    throw new Error('At least one of allowFiles or allowDirectories must be true');
  }

  if (typeof targetPath !== 'string' || targetPath.trim() === '') {
    throw new Error(`${label} must be a non-empty string`);
  }

  if (targetPath.length > maxLength) {
    throw new Error(`${label} exceeds maximum supported length`);
  }

  if (targetPath.includes('\0')) {
    throw new Error(`${label} contains null byte characters`);
  }

  ensureArrayOfStrings(allowedBasePaths, 'allowedBasePaths');

  const resolvedPath = path.resolve(targetPath);

  if (!isPathWithinAllowed(resolvedPath, allowedBasePaths)) {
    throw new Error(`${label} is not within an allowed directory`);
  }

  const exists = fs.existsSync(resolvedPath);

  if (mustExist && !exists) {
    throw new Error(`${label} does not exist`);
  }

  if (exists) {
    const stats = fs.statSync(resolvedPath);

    if (!allowDirectories && stats.isDirectory()) {
      throw new Error(`${label} must refer to a file`);
    }

    if (!allowFiles && stats.isFile()) {
      throw new Error(`${label} must refer to a directory`);
    }
  }

  return resolvedPath;
}

module.exports = {
  toComparablePath,
  isPathWithinAllowed,
  validateFsPath,
};

