// Scan for ALL models and agents - no depth limit, no restrictions
const fs = require('fs');
const path = require('path');

console.log('🔍 COMPLETE SCAN - Finding ALL models and agents...\n');
console.log('⚠️ This may take a few minutes - scanning entire C: and D: drives\n');

const registry = {
    models: [],
    agents: [],
    scanned: new Date().toISOString()
};

const basePaths = [
    'C:\\Users\\HiH8e\\.ollama\\models',
    'D:\\Security Research aka GitHub Repos',
    'C:\\Users\\HiH8e\\OneDrive',
    'D:\\'
];

let scannedDirs = 0;
let scannedFiles = 0;

function fullScan(dir, maxDepth = 20) {
    if (maxDepth <= 0) return;
    
    try {
        const items = fs.readdirSync(dir);
        scannedDirs++;
        
        if (scannedDirs % 100 === 0) {
            process.stdout.write(`\r   Scanned: ${scannedDirs} dirs, ${scannedFiles} files, Found: ${registry.models.length} models, ${registry.agents.length} agents`);
        }
        
        for (const item of items) {
            try {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Check if it's a model or agent directory
                    const itemLower = item.toLowerCase();
                    
                    if (itemLower.includes('model') || 
                        itemLower.includes('llm') || 
                        itemLower.includes('bigdaddyg') ||
                        itemLower.includes('gemma') ||
                        itemLower.includes('llama') ||
                        itemLower.includes('qwen') ||
                        itemLower.includes('gpt')) {
                        
                        registry.models.push({
                            name: item,
                            path: fullPath,
                            size: stat.size,
                            type: 'directory',
                            discovered: new Date().toISOString()
                        });
                    }
                    
                    if (itemLower.includes('agent') ||
                        itemLower.includes('bot') ||
                        itemLower.includes('assistant') ||
                        itemLower.includes('agentic')) {
                        
                        registry.agents.push({
                            name: item,
                            path: fullPath,
                            type: 'directory',
                            discovered: new Date().toISOString()
                        });
                    }
                    
                    // Recurse (NO depth limit for important directories)
                    if (fullPath.includes('models') || 
                        fullPath.includes('agents') || 
                        fullPath.includes('.ollama') ||
                        fullPath.includes('GitHub Repos')) {
                        fullScan(fullPath, maxDepth - 1);
                    } else {
                        // Shallow scan for other directories
                        fullScan(fullPath, 2);
                    }
                    
                } else if (stat.isFile()) {
                    scannedFiles++;
                    const ext = path.extname(item).toLowerCase();
                    const itemLower = item.toLowerCase();
                    
                    // Model files (any size)
                    if (ext === '.bin' || ext === '.gguf' || ext === '.safetensors' || 
                        ext === '.pt' || ext === '.pth' || ext === '.onnx' ||
                        itemLower.includes('model')) {
                        
                        registry.models.push({
                            name: item,
                            path: fullPath,
                            size: stat.size,
                            sizeMB: (stat.size / 1024 / 1024).toFixed(2),
                            type: 'file',
                            discovered: new Date().toISOString()
                        });
                    }
                    
                    // Agent files
                    if (itemLower.includes('agent') && 
                        (ext === '.js' || ext === '.py' || ext === '.lua' || ext === '.ts')) {
                        
                        registry.agents.push({
                            name: item,
                            path: fullPath,
                            size: stat.size,
                            type: 'file',
                            discovered: new Date().toISOString()
                        });
                    }
                }
            } catch (e) {
                // Skip permission errors silently
            }
        }
    } catch (e) {
        // Skip permission errors silently
    }
}

// Start scanning
console.log('📂 Scanning all paths...\n');
basePaths.forEach(basePath => {
    if (fs.existsSync(basePath)) {
        console.log(`   Starting: ${basePath}`);
        fullScan(basePath);
    }
});

console.log(`\n\n✅ Scan complete!\n`);
console.log(`📊 Results:`);
console.log(`   📦 Models: ${registry.models.length}`);
console.log(`   🤖 Agents: ${registry.agents.length}`);
console.log(`   📁 Directories scanned: ${scannedDirs}`);
console.log(`   📄 Files scanned: ${scannedFiles}`);

// Calculate total model size
const totalModelSizeMB = registry.models
    .filter(m => m.sizeMB)
    .reduce((sum, m) => sum + parseFloat(m.sizeMB), 0);

console.log(`   💾 Total model size: ${(totalModelSizeMB / 1024).toFixed(2)} GB`);

// Save complete registry
fs.writeFileSync(
    path.join(__dirname, 'configs', 'complete-registry.json'),
    JSON.stringify(registry, null, 2)
);

console.log(`\n💾 Saved complete registry to: configs/complete-registry.json`);

// Create summary files
const modelSummary = `COMPLETE MODEL REGISTRY
Generated: ${new Date().toISOString()}

Total Models Found: ${registry.models.length}
Total Size: ${(totalModelSizeMB / 1024).toFixed(2)} GB

Breakdown:
- Model directories: ${registry.models.filter(m => m.type === 'directory').length}
- Model files: ${registry.models.filter(m => m.type === 'file').length}

Top 10 Largest Files:
${registry.models
    .filter(m => m.sizeMB && parseFloat(m.sizeMB) > 100)
    .sort((a, b) => parseFloat(b.sizeMB) - parseFloat(a.sizeMB))
    .slice(0, 10)
    .map((m, i) => `${i+1}. ${m.name} (${(parseFloat(m.sizeMB) / 1024).toFixed(2)} GB)`)
    .join('\n')}

Full list in: configs/complete-registry.json
`;

fs.writeFileSync(
    path.join(__dirname, 'models', 'MODEL-SUMMARY.txt'),
    modelSummary
);

const agentSummary = `COMPLETE AGENT REGISTRY
Generated: ${new Date().toISOString()}

Total Agents Found: ${registry.agents.length}

Breakdown:
- Agent directories: ${registry.agents.filter(a => a.type === 'directory').length}
- Agent scripts: ${registry.agents.filter(a => a.type === 'file').length}

Agent Script Types:
- JavaScript: ${registry.agents.filter(a => a.name.endsWith('.js')).length}
- Python: ${registry.agents.filter(a => a.name.endsWith('.py')).length}
- Lua: ${registry.agents.filter(a => a.name.endsWith('.lua')).length}
- TypeScript: ${registry.agents.filter(a => a.name.endsWith('.ts')).length}

Full list in: configs/complete-registry.json
`;

fs.writeFileSync(
    path.join(__dirname, 'agents', 'AGENT-SUMMARY.txt'),
    agentSummary
);

console.log(`\n📝 Created summary files:`);
console.log(`   models/MODEL-SUMMARY.txt`);
console.log(`   agents/AGENT-SUMMARY.txt`);

console.log(`\n✅ ALL ${registry.models.length} models + ${registry.agents.length} agents cataloged!`);

