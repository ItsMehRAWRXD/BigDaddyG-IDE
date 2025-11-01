/**
 * BigDaddyG IDE - Build with Bundled AI Model
 * Creates a standalone executable that includes a local AI model
 */

const builder = require('electron-builder');
const fs = require('fs');
const path = require('path');

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║         BUILDING BIGDADDYG IDE WITH BUNDLED AI MODEL             ║
╚═══════════════════════════════════════════════════════════════════╝
`);

// Find the best model to bundle
const modelPaths = [
  'D:\\OllamaModels',
  'C:\\Users\\HiH8e\\.ollama\\models'
];

console.log('🔍 Scanning for AI models...\n');

const models = [];
for (const basePath of modelPaths) {
  if (fs.existsSync(basePath)) {
    const manifests = path.join(basePath, 'manifests', 'registry.ollama.ai', 'library');
    if (fs.existsSync(manifests)) {
      const modelDirs = fs.readdirSync(manifests);
      modelDirs.forEach(modelName => {
        const modelPath = path.join(manifests, modelName);
        const versions = fs.readdirSync(modelPath);
        versions.forEach(version => {
          const manifestPath = path.join(modelPath, version);
          const stat = fs.statSync(manifestPath);
          if (stat.isFile()) {
            models.push({
              name: modelName,
              version,
              path: basePath,
              manifestPath
            });
          }
        });
      });
    }
  }
}

console.log(`✅ Found ${models.length} models\n`);

// Pick the best model for bundling (prefer coding models, smaller size)
const preferredModels = [
  'qwen2.5-coder',
  'deepseek-coder',
  'codellama',
  'starcoder2',
  'phi3',
  'tinyllama'
];

let selectedModel = null;
for (const preferred of preferredModels) {
  const found = models.find(m => m.name.includes(preferred));
  if (found) {
    selectedModel = found;
    break;
  }
}

if (!selectedModel && models.length > 0) {
  selectedModel = models[0];
}

if (!selectedModel) {
  console.log('❌ No models found! Please install a model first:');
  console.log('   ollama pull qwen2.5-coder:3b');
  process.exit(1);
}

console.log(`📦 Selected Model: ${selectedModel.name}:${selectedModel.version}`);
console.log(`📂 Model Path: ${selectedModel.path}\n`);

// Create models directory in project
const projectModelsDir = path.join(__dirname, 'bundled-models');
if (!fs.existsSync(projectModelsDir)) {
  fs.mkdirSync(projectModelsDir, { recursive: true });
}

console.log('📋 Creating model manifest...\n');

// Copy model manifest
const modelManifest = {
  name: selectedModel.name,
  version: selectedModel.version,
  path: selectedModel.manifestPath,
  bundled: true,
  embeddedPath: 'resources/models'
};

fs.writeFileSync(
  path.join(projectModelsDir, 'model-manifest.json'),
  JSON.stringify(modelManifest, null, 2)
);

console.log('✅ Model manifest created\n');

// Build configuration with model
const config = {
  appId: 'com.bigdaddyg.ide',
  productName: 'BigDaddyG IDE with AI',
  
  directories: {
    output: 'dist-with-ai',
    buildResources: 'build-resources'
  },
  
  files: [
    'electron/**/*',
    'server/**/*',
    'hooks/**/*',
    'orchestration/**/*',
    'bundled-models/**/*',
    'package.json',
    'node_modules/**/*',
    '!node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!node_modules/*.d.ts',
    '!node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ],
  
  extraResources: [
    {
      from: selectedModel.path,
      to: 'models',
      filter: ['**/*']
    },
    {
      from: 'bundled-models',
      to: 'models-config',
      filter: ['**/*']
    }
  ],
  
  win: {
    target: [
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    publisherName: 'BigDaddyG IDE',
    verifyUpdateCodeSignature: false
  },
  
  portable: {
    artifactName: 'BigDaddyG-AI-Bundled-${version}.exe',
  },
  
  compression: 'maximum'
};

console.log('🔨 Building standalone executable with AI model...');
console.log('⚠️  This will take a while (large model files)...\n');

builder.build({
  targets: builder.Platform.WINDOWS.createTarget(),
  config
})
.then(() => {
  console.log('\n✅ Build complete!\n');
  
  const distDir = path.join(__dirname, 'dist-with-ai');
  const files = fs.readdirSync(distDir).filter(f => f.endsWith('.exe'));
  
  if (files.length > 0) {
    const exePath = path.join(distDir, files[0]);
    const stats = fs.statSync(exePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`🎉 BigDaddyG IDE with AI Model is ready!`);
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`📦 File: ${files[0]}`);
    console.log(`📏 Size: ${sizeMB} MB`);
    console.log(`📂 Location: ${distDir}`);
    console.log(`🤖 Model: ${selectedModel.name}:${selectedModel.version}`);
    console.log(`\n✨ This is a FULLY STANDALONE executable with embedded AI!`);
    console.log(`   - No internet required`);
    console.log(`   - No Ollama required`);
    console.log(`   - No external dependencies`);
    console.log(`   - Run anywhere on Windows`);
    console.log('═══════════════════════════════════════════════════════════════════\n');
  }
})
.catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

