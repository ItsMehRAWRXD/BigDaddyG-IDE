const fs = require('fs');
const path = require('path');
const root = process.cwd();
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.cursor') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(full);
  }
}
walk(root);
const defineSet = new Map();
const useCount = new Map();
const regex = /window\.([A-Za-z0-9_]+)/g;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = match[1];
    const assign = text.slice(regex.lastIndex).trimStart();
    if (assign.startsWith('=')) {
      if (!defineSet.has(name)) defineSet.set(name, new Set());
      defineSet.get(name).add(path.relative(root, file));
    }
    useCount.set(name, (useCount.get(name) || 0) + 1);
  }
}
const missing = [];
for (const [name, count] of useCount.entries()) {
  if (!defineSet.has(name)) missing.push({ name, count });
}
missing.sort((a,b)=>b.count-a.count);
console.log('Total window usages:', useCount.size);
console.log('Total definitions:', defineSet.size);
console.log('Potential missing window globals (top 50):');
for (const item of missing.slice(0,50)) {
  console.log(item.name, item.count);
}
