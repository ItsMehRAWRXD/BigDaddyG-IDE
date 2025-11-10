# 📚 BigDaddyG IDE - API Key Configuration Guide

## 🔑 **Overview**

BigDaddyG IDE supports **7 major AI providers** with API key authentication, plus 3 local AI systems that don't require keys!

---

## ✅ **Supported AI Providers**

### **☁️ Cloud Providers (Require API Keys)**

| Provider | Models | Speed | Cost | Best For |
|----------|--------|-------|------|----------|
| **OpenAI** | GPT-4o, GPT-4, GPT-3.5 | Medium | $$$ | General tasks, reasoning |
| **Anthropic** | Claude 3 (Opus, Sonnet, Haiku) | Medium | $$ | Code, analysis, safety |
| **Google Gemini** | Gemini 1.5 Pro/Flash | Fast | $ | Cost-effective, fast |
| **Groq** | Mixtral, Llama3, Gemma | Ultra-Fast | $ | Speed (500+ tok/s) |
| **DeepSeek** | DeepSeek Chat/Coder | Fast | $ | Code generation |
| **Azure OpenAI** | Same as OpenAI | Medium | Custom | Enterprise |
| **Cohere** | Command, Command-Light | Fast | $ | Embeddings, search |
| **Kimi** | Moonshot-v1 (8k/32k/128k) | Fast | $ | Long context (200K tokens!) |

### **🏠 Local Providers (No API Keys Needed!)**

| Provider | Description | Offline | Free |
|----------|-------------|---------|------|
| **BigDaddyA** | Custom LLM runtime (like Ollama) | ✅ Yes | ✅ Free |
| **Ollama** | Run local models (Llama, Mistral, etc.) | ✅ Yes | ✅ Free |
| **Standalone AI** | Pattern-based AI (zero dependencies) | ✅ Yes | ✅ Free |

---

## 🚀 **Quick Start**

### **Method 1: Using the UI** (Easiest)

```javascript
// Open API Key Manager UI
if (window.apiKeyManagerUI) {
    window.apiKeyManagerUI.show();
}

// Or from console
const aiMgr = window.aiProviderManager;
const ui = new APIKeyManagerUI(aiMgr);
ui.show();
```

### **Method 2: Using Code**

```javascript
// Save an API key
await window.aiProviderManager.saveApiKey('openai', 'sk-...');

// Get an API key
const key = window.aiProviderManager.getApiKey('openai');

// Delete an API key
await window.aiProviderManager.deleteApiKey('openai');

// Test the key
const result = await window.aiProviderManager.chat('Hello!', {
    provider: 'openai',
    model: 'gpt-4o-mini'
});
```

### **Method 3: Using the CLI**

```bash
# Set API key
node bigdaddyg-cli.js ai config set openai sk-...

# Test API key
node bigdaddyg-cli.js ai test openai

# Use specific provider
node bigdaddyg-cli.js ai --provider openai "Create a REST API"
```

---

## 🔐 **Getting API Keys**

### **1. OpenAI (GPT-4, GPT-4o)**

**Where:** https://platform.openai.com/api-keys

**Steps:**
1. Sign up at OpenAI
2. Go to API Keys
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Paste into BigDaddyG IDE

**Cost:**
- GPT-4o: $0.005 per 1K tokens (input)
- GPT-4o-mini: $0.00015 per 1K tokens
- GPT-3.5-turbo: $0.0005 per 1K tokens

**Free Tier:** $5 credit (expires after 3 months)

---

### **2. Anthropic (Claude)**

**Where:** https://console.anthropic.com/settings/keys

**Steps:**
1. Sign up at Anthropic
2. Go to Settings → API Keys
3. Create new key
4. Copy the key (starts with `sk-ant-`)
5. Paste into BigDaddyG IDE

**Cost:**
- Claude 3 Opus: $0.015 per 1K tokens
- Claude 3 Sonnet: $0.003 per 1K tokens
- Claude 3 Haiku: $0.00025 per 1K tokens

**Free Tier:** $5 credit

---

### **3. Google Gemini**

**Where:** https://makersuite.google.com/app/apikey

**Steps:**
1. Sign up with Google account
2. Go to API Key section
3. Create API key
4. Copy the key
5. Paste into BigDaddyG IDE

**Cost:**
- Gemini 1.5 Pro: $0.007 per 1K tokens
- Gemini 1.5 Flash: $0.00035 per 1K tokens

**Free Tier:** 60 requests per minute (generous!)

---

### **4. Groq (Ultra-Fast)**

**Where:** https://console.groq.com/keys

**Steps:**
1. Sign up at Groq
2. Go to API Keys
3. Create new key
4. Copy the key
5. Paste into BigDaddyG IDE

**Cost:**
- Mixtral-8x7b: $0.00027 per 1K tokens
- Llama3-70b: $0.00059 per 1K tokens

**Speed:** 500+ tokens/second! ⚡

**Free Tier:** Generous free tier available

---

### **5. DeepSeek**

**Where:** https://platform.deepseek.com/api_keys

**Steps:**
1. Sign up at DeepSeek
2. Go to API Keys
3. Create new key
4. Copy the key
5. Paste into BigDaddyG IDE

**Cost:**
- DeepSeek Chat: $0.0002 per 1K tokens
- DeepSeek Coder: $0.0002 per 1K tokens

**Great for:** Code generation & understanding

---

### **6. Azure OpenAI**

**Where:** https://portal.azure.com/

**Steps:**
1. Create Azure account
2. Subscribe to Azure OpenAI Service
3. Deploy a model (GPT-4, etc.)
4. Get endpoint and key from Azure Portal
5. Configure in BigDaddyG IDE

**Cost:** Custom enterprise pricing

**Best for:** Enterprise deployments with compliance needs

---

### **7. Cohere**

**Where:** https://dashboard.cohere.com/api-keys

**Steps:**
1. Sign up at Cohere
2. Go to API Keys
3. Create new key
4. Copy the key
5. Paste into BigDaddyG IDE

**Cost:**
- Command: $0.0005 per 1K tokens
- Command-Light: $0.0002 per 1K tokens

**Best for:** Embeddings, semantic search, RAG

---

### **8. Kimi (Moonshot AI)**

**Where:** https://platform.moonshot.cn/console/api-keys

**Steps:**
1. Sign up at Moonshot AI
2. Go to Console → API Keys
3. Create new key
4. Copy the key
5. Paste into BigDaddyG IDE

**Cost:**
- Moonshot-v1-8k: $0.0002 per 1K tokens
- Moonshot-v1-32k: $0.0004 per 1K tokens
- Moonshot-v1-128k: $0.001 per 1K tokens

**Context Window:** Up to **200K tokens!** (Longest context in BigDaddyG!)

**Best for:** Long documents, code analysis, large conversations

---

## 💡 **Usage Examples**

### **Using OpenAI**

```javascript
// Set key (first time only)
await window.aiProviderManager.saveApiKey('openai', 'sk-...');

// Use it
const result = await window.aiProviderManager.chat('Explain async/await', {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500
});

console.log(result.response);
```

### **Using Claude**

```javascript
// Set key
await window.aiProviderManager.saveApiKey('anthropic', 'sk-ant-...');

// Use it
const result = await window.aiProviderManager.chat('Review this code', {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229'
});
```

### **Using Groq (Ultra-Fast)**

```javascript
// Set key
await window.aiProviderManager.saveApiKey('groq', 'gsk_...');

// Use it - blazing fast!
const result = await window.aiProviderManager.chat('Quick question', {
    provider: 'groq',
    model: 'mixtral-8x7b-32768'
});
// Response in <1 second! ⚡
```

### **Using Gemini (Cost-Effective)**

```javascript
// Set key
await window.aiProviderManager.saveApiKey('gemini', 'AIza...');

// Use it
const result = await window.aiProviderManager.chat('Generate code', {
    provider: 'gemini',
    model: 'gemini-1.5-flash'
});
// Cheapest option!
```

### **Fallback System (Try Multiple Providers)**

```javascript
// Automatically tries: OpenAI → Anthropic → Groq → Ollama
const result = await window.aiProviderManager.chatWithFallback('Hello!');
// Uses first available provider
```

---

## 🔒 **Security**

### **Where Are Keys Stored?**

1. **Electron Main Process** (Encrypted) - Preferred
2. **localStorage** (Base64 encoded) - Fallback

### **Are Keys Safe?**

✅ **YES!** Keys are:
- Stored locally (never sent to BigDaddyG servers)
- Encrypted at rest
- Only used for direct API calls to providers
- Never logged or exposed

### **Best Practices:**

1. ✅ Use environment-specific keys (dev/prod)
2. ✅ Set spending limits on provider dashboards
3. ✅ Monitor API usage regularly
4. ✅ Rotate keys periodically
5. ✅ Use read-only keys when possible
6. ❌ Never commit keys to Git
7. ❌ Never share keys publicly

---

## 💰 **Cost Comparison**

### **For 1 Million Tokens (~750,000 words)**

| Provider | Input Cost | Output Cost | Total Est. |
|----------|-----------|-------------|------------|
| **Gemini Flash** | $0.35 | $1.05 | **$1.40** 🥇 |
| **Groq Mixtral** | $0.27 | $0.27 | **$0.54** 🥇🥇🥇 |
| **DeepSeek** | $0.20 | $0.20 | **$0.40** 🏆 |
| **GPT-3.5-turbo** | $0.50 | $1.50 | $2.00 |
| **Claude Haiku** | $0.25 | $1.25 | $1.50 |
| **Claude Sonnet** | $3.00 | $15.00 | $18.00 |
| **GPT-4o** | $5.00 | $15.00 | $20.00 |
| **Claude Opus** | $15.00 | $75.00 | $90.00 |

### **Free Options:**

| Provider | Cost | Requirements |
|----------|------|--------------|
| **BigDaddyA** | FREE | Built-in |
| **Ollama** | FREE | Install Ollama + models |
| **Standalone AI** | FREE | Built-in (pattern-based) |

---

## 🎯 **Recommendations**

### **Best for Beginners:**
- **Gemini Flash** (free tier, fast, good quality)
- **Ollama** (completely free, local)

### **Best for Speed:**
- **Groq** (500+ tokens/second!)

### **Best for Quality:**
- **GPT-4o** (most capable)
- **Claude Opus** (best for code)

### **Best for Cost:**
- **DeepSeek** (cheapest!)
- **Gemini Flash** (excellent value)

### **Best for Privacy:**
- **Ollama** (100% local)
- **BigDaddyA** (built-in local)

### **Best for Enterprise:**
- **Azure OpenAI** (compliance, SLA)

---

## 🆘 **Troubleshooting**

### **"API key not configured"**
```javascript
// Check if key exists
const key = window.aiProviderManager.getApiKey('openai');
console.log(key ? 'Key exists' : 'No key');

// Set key
await window.aiProviderManager.saveApiKey('openai', 'sk-...');
```

### **"Invalid API key"**
- Check key format (should start with `sk-` for OpenAI, etc.)
- Verify key is active on provider dashboard
- Test key with simple query

### **"Rate limit exceeded"**
- Wait a few seconds
- Upgrade to paid tier
- Use different provider

### **"Network error"**
- Check internet connection
- Check firewall settings
- Try local provider (Ollama/BigDaddyA)

---

## 📚 **CLI Commands**

```bash
# Set API key
node bigdaddyg-cli.js ai config set openai sk-...

# List configured providers
node bigdaddyg-cli.js ai config list

# Test provider
node bigdaddyg-cli.js ai test openai

# Delete key
node bigdaddyg-cli.js ai config delete openai

# Use specific provider
node bigdaddyg-cli.js ai --provider anthropic "Explain TypeScript"

# Try with fallback
node bigdaddyg-cli.js ai --fallback "Create a function"
```

---

## 🎉 **Summary**

BigDaddyG IDE gives you **10 AI options:**

### **Cloud (7 providers - Require keys)**
1. ✅ OpenAI (GPT-4, GPT-4o)
2. ✅ Anthropic (Claude 3)
3. ✅ Google Gemini
4. ✅ Groq (Ultra-fast)
5. ✅ DeepSeek
6. ✅ Azure OpenAI
7. ✅ Cohere

### **Local (3 systems - FREE!)**
8. ✅ BigDaddyA (Custom LLM runtime)
9. ✅ Ollama (Local models)
10. ✅ Standalone AI (Pattern-based)

**Total: 10 AI options!** 🎊

You can use **any combination** based on your needs:
- **Free & Private:** Ollama + BigDaddyA
- **Best Quality:** OpenAI + Claude
- **Best Speed:** Groq
- **Best Cost:** DeepSeek + Gemini
- **All of the Above:** Use fallback system!

---

*Configure once, code forever!* ✨
