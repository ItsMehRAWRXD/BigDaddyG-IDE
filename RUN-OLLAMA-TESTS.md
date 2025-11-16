# 🧪 How to Run Ollama Integration Tests

## Quick Start

### In Browser Console:
```javascript
// Run all tests
window.runOllamaTests();
```

### Expected Output:
```
🧪 Starting Ollama Integration Tests...

📦 Testing Model Discovery...
  ✅ Discovery API available
  ✅ Model discovery works
  ✅ Discovery has catalog structure
  ✅ Found X Ollama models

🎯 Testing Model Selection...
  ✅ Model selector found in DOM
  ✅ Selected model: llama3.2
  ✅ Model state manager available

💬 Testing Chat Integration...
  ✅ Chat API responds successfully
  ✅ Chat API returns response

...

📊 Test Results Summary
============================================================
Total Tests: 25
✅ Passed: 25
❌ Failed: 0
Success Rate: 100.0%
============================================================
```

## Test Files

1. **Unit Tests:**
   - `electron/__tests__/ollama-integration.test.js`
   - `electron/__tests__/model-selector.test.js`
   - `electron/__tests__/universal-chat-handler.test.js`

2. **E2E Test Runner:**
   - `electron/ollama-integration-test-runner.js`

## Running with Jest

```bash
cd electron
npm test -- ollama-integration
```

## Manual Testing Checklist

1. ✅ Open app → Models should appear in dropdown
2. ✅ Select model → Should save preference
3. ✅ Send chat message → Should use selected model
4. ✅ Refresh models → Should reload list
5. ✅ Switch models → Should update everywhere
6. ✅ Close/reopen app → Should restore last model

## Troubleshooting

**Tests fail?**
- Make sure Ollama is running: `ollama serve`
- Check console for errors
- Verify models are installed: `ollama list`

**Models not showing?**
- Check Ollama API: `curl http://localhost:11434/api/tags`
- Verify discovery: `window.electron.models.discover()`
- Check console logs for errors
