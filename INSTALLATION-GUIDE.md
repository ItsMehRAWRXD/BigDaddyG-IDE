# 🚀 Installation & Quick Start Guide

## Prerequisites

Before running BigDaddyG IDE with revolutionary features, ensure you have:

### Required

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **BigDaddyG AI Backend** running on `<http://localhost:11441`>

### Optional

- **Python 3.x** (for Python code execution in Live Preview)
- **Git** (for version control features)

---

## Installation Steps

### 1. Navigate to Project Directory

```bash

cd "d:\Security Research aka GitHub Repos\ProjectIDEAI"

```plaintext
### 2. Install Dependencies

```bash

npm install

```plaintext
This installs:

- `electron` - Desktop application framework
- `monaco-editor` - VS Code's editor engine
- Other required packages

### 3. Start BigDaddyG AI Backend

Ensure your AI backend is running on port 11441:

```bash

# In your BigDaddyG AI directory

python server.py

# Or however you start your AI backend

```plaintext
### 4. Launch the IDE

```bash

npm start

```plaintext
The IDE should open in a new window! 🎉

---

## First Time Setup

### Initial Configuration

1. **Test AI Connection**
   - Open the IDE
   - Check console (F12) for connection status
   - Should see: `✅ BigDaddyG Latest connected`

  1. **Verify Revolutionary Features**
   - Press `Ctrl+Shift+P` - Live Preview should open
   - Press `Ctrl+Shift+F` - Flow Mapper should appear
   - Write code - Predictive Debugger should show warnings
   - Press `Ctrl+Shift+M` - Agent Swarm panel
   - Press `Ctrl+Shift+R` - Code Review panel

  1. **Test Each Feature**

#### Test Live Preview:

```javascript

// Write this in the editor
function test() {
    console.log("Hello from Live Preview!");
    return "Success";
}

test();

```plaintext
- Press `Ctrl+Shift+P`
- Should see output in Live Preview panel

#### Test Flow Mapper:

```javascript

// Write a function with complexity
function processData(items) {
    if (items.length === 0) return;

    for (let item of items) {
        if (item.valid) {
            processItem(item);
        }
    }
}

```plaintext
- Press `Ctrl+Shift+F`
- Should see flowchart with decisions and loops

#### Test Predictive Debugger:

```javascript

// Write code with intentional bugs
const user = null;
console.log(user.name); // Should get warning: Null access

while(true) { } // Should get error: Infinite loop

```plaintext
- Should see inline warnings automatically

#### Test Agent Swarm:

- Press `Ctrl+Shift+M`
- Enter: "Create a simple calculator class"
- Click "Start Swarm"
- Watch 6 agents collaborate

#### Test Code Review:

```javascript

// Write code with security issues
const query = "SELECT * FROM users WHERE id = " + userId; // SQL injection
document.getElementById('output').innerHTML = userInput; // XSS

```plaintext
- Press `Ctrl+Shift+R`
- Click "Full Review"
- Should detect both vulnerabilities

---

## Configuration

### Customize AI Models

Edit `electron/agent-panel.js`:

```javascript

models: {
    bigdaddyg: [
        'BigDaddyG Latest',
        'BigDaddyG Code',
        'BigDaddyG Security',
        'BigDaddyG ASM',
        'YourCustomModel' // Add your model here
    ]
}

```plaintext
### Change AI Backend URL

If your AI runs on different port, update all feature files:

```javascript

// Find and replace in all files:
'<http://localhost:11441/api/chat'>
// With your URL:
'<http://your-server:port/api/chat'>

```plaintext
Or create a config file:

```javascript

// Create electron/config.js
module.exports = {
    AI_BACKEND_URL: '<http://localhost:11441',>
    AI_TIMEOUT: 30000,
    ENABLE_PREDICTIVE_DEBUG: true,
    ENABLE_LIVE_PREVIEW: true
};

```plaintext
### Adjust Performance

For slower systems, increase debounce delays:

**In `predictive-debugger.js`:**

```javascript

this.analysisInterval = setTimeout(() => {
    this.analyzeCode();
}, 3000); // Increased from 1500ms to 3000ms

```plaintext
**In `ai-live-preview.js`:**

```javascript

this.debounceTimer = setTimeout(() => {
    this.executeCode();
}, 1500); // Increased from 800ms to 1500ms

```plaintext
---

## Troubleshooting

### Issue: AI Features Not Working

**Solution:**

1. Check BigDaddyG backend is running:

   ```bash
   curl <http://localhost:11441/health>
   ```

  1. Open DevTools (F12) and check console for errors
  2. Verify API endpoint in feature files

### Issue: Predictive Debugger Not Showing Warnings

**Solution:**

1. Check console for: `[PredictiveDebugger] 🎯 Active!`
2. Write code with obvious issues (null access, infinite loop)
3. Wait 1.5 seconds after typing
4. Hover over line numbers to see warnings

### Issue: Live Preview Not Executing

**Solution:**

1. Press `Ctrl+Shift+P` to open panel
2. Click "Run Now" button
3. Check "Console" tab for errors
4. For Python code, ensure Python is installed

### Issue: Agent Swarm Times Out

**Solution:**

1. Reduce task complexity
2. Check all 6 AI model endpoints are accessible
3. Increase timeout in `multi-agent-swarm.js`:

   ```javascript
   const response = await fetch('...', {
       // Add timeout
       signal: AbortSignal.timeout(60000) // 60 seconds
   });
   ```

### Issue: High Memory Usage

**Solution:**

1. Disable unused features in `index.html`:

   ```html
   <!-- Comment out features you don't need -->
   <!-- <script src="ai-live-preview.js"></script> -->
   ```

  1. Clear editor frequently for large files
  2. Restart IDE periodically

### Issue: Monaco Editor Not Loading

**Solution:**

1. Check `node_modules/monaco-editor` exists
2. Run: `npm install monaco-editor`
3. Clear browser cache if using Electron cache

---

## Development Mode

### Enable Debug Logging

Add to each feature file:

```javascript

const DEBUG = true;

function log(...args) {
    if (DEBUG) console.log('[FeatureName]', ...args);
}

```plaintext
### Hot Reload

For faster development, use:

```bash

npm install -g nodemon
nodemon --exec "npm start"

```plaintext
### Build for Production

```bash

npm run build

```plaintext
This creates distributable package in `/dist`.

---

## Keyboard Shortcuts Reference

### Core IDE Features

| Shortcut | Feature |
|----------|---------|
| `Ctrl+N` | New File |
| `Ctrl+O` | Open File |
| `Ctrl+S` | Save File |
| `Ctrl+K` | Ask AI |
| `Ctrl+J` | Toggle Terminal |
| `Ctrl+B` | Toggle Sidebar |

### Revolutionary Features

| Shortcut | Feature |
|----------|---------|
| `Ctrl+Shift+P` | AI Live Preview |
| `Ctrl+Shift+F` | Visual Flow Mapper |
| `Ctrl+Shift+M` | Multi-Agent Swarm |
| `Ctrl+Shift+R` | Code Review |
| `Ctrl+Shift+A` | Agent Panel |
| `Ctrl+Shift+V` | Voice Coding |

### Editor Features

| Shortcut | Feature |
|----------|---------|
| `Ctrl+Space` | Autocomplete |
| `F2` | Rename Symbol |
| `F12` | Go to Definition |
| `Shift+F12` | Find References |

---

## Performance Benchmarks

### System Requirements

**Minimum:**

- CPU: Dual-core 2GHz
- RAM: 4GB
- Storage: 500MB
- GPU: None required

**Recommended:**

- CPU: Quad-core 3GHz+
- RAM: 8GB+
- Storage: 1GB
- GPU: Optional (for smoother UI)

### Feature Performance

| Feature | Startup Time | Analysis Time | Memory |
|---------|--------------|---------------|--------|
| Predictive Debugger | < 1s | 1-3s | 30MB |
| Live Preview | < 1s | < 500ms | 50MB |
| Flow Mapper | 2s | 3-5s | 80MB |
| Agent Swarm | 2s | 30-60s | 200MB |
| Code Review | 1s | 10-20s | 100MB |

**Total IDE Footprint:** ~500MB with all features active

---

## Updating

### Update Revolutionary Features

```bash

# Pull latest changes

git pull origin main

# Reinstall dependencies

npm install

# Restart IDE

npm start

```plaintext
### Update Individual Features

Replace feature file and reload:

1. Download new `ai-live-preview.js`
2. Replace in `electron/`
3. Restart IDE

---

## Customization Examples

### Add Custom Agent to Swarm

Edit `multi-agent-swarm.js`:

```javascript

{
    id: 'documenter',
    name: 'Documentation Expert',
    emoji: '📚',
    color: '#00d4ff',
    role: 'Write comprehensive documentation',
    model: 'BigDaddyG:Latest',
    specialties: ['technical writing', 'API docs', 'tutorials'],
    active: false
}

```plaintext
### Create Custom Review Rules

Edit `ai-code-review-security.js`:

```javascript

// Add custom detection pattern
if (/YOUR_PATTERN/.test(line)) {
    issues.push({
        line: lineNum,
        severity: 'warning',
        message: 'Your custom message',
        type: 'custom-rule',
        suggestion: 'How to fix'
    });
}

```plaintext
### Custom Live Preview Languages

Edit `ai-live-preview.js`:

```javascript

switch(language) {
    case 'javascript':
        result = await this.executeJavaScript(code);
        break;
    case 'python':
        result = await this.executePython(code);
        break;
    case 'ruby': // Add new language
        result = await this.executeRuby(code);
        break;
}

```plaintext
---

## Support & Resources

### Documentation

- `README.md` - Main project overview
- `REVOLUTIONARY-FEATURES.md` - Detailed feature documentation
- `DEPLOYMENT-GUIDE.md` - Production deployment
- `AGENT-AUTOCOMPLETE-FEATURES.md` - Autocomplete details

### Community

- GitHub Issues: Report bugs
- Discord: Real-time support
- Stack Overflow: Tag `bigdaddyg-ide`

### Contributing

1. Fork repository
2. Create feature branch
3. Add revolutionary features
4. Submit pull request

---

## What's Next?

### Recommended Learning Path

1. **Week 1:** Master Live Preview
   - Try different languages
   - Experiment with predictions
   - Optimize slow code

  1. **Week 2:** Learn Flow Mapping
   - Analyze complex algorithms
   - Find optimization opportunities
   - Document your code

  1. **Week 3:** Use Predictive Debugger
   - Fix warnings as you code
   - Learn security patterns
   - Write cleaner code

  1. **Week 4:** Agent Swarm Projects
   - Build full features
   - Create APIs
   - Generate test suites

  1. **Week 5:** Code Review Mastery
   - Review all old projects
   - Learn security best practices
   - Improve code quality

---

## Success Checklist

- [ ] IDE launches successfully
- [ ] AI backend connected
- [ ] All 5 revolutionary features working
- [ ] Autocomplete functioning
- [ ] Voice coding active
- [ ] Terminal accessible
- [ ] File system integration working
- [ ] Monaco editor loading
- [ ] No console errors

**If all checked, you're ready to build amazing things! 🚀**

---

*Happy Coding with the Most Advanced IDE Ever Created!*

