const http = require('http');

class NativeOllamaClient {
  constructor() {
    this.baseUrl = 'http://localhost:11434';
    this.cache = new Map();
    this.stats = { requests: 0, cached: 0, streaming: 0 };
  }

  async generate(model, prompt, options = {}) {
    this.stats.requests++;
    
    const cacheKey = `${model}:${prompt.slice(0, 100)}`;
    if (this.cache.has(cacheKey) && !options.stream) {
      this.stats.cached++;
      return this.cache.get(cacheKey);
    }

    const payload = { model, prompt, stream: options.stream || false };
    
    try {
      if (options.stream) {
        return this.streamGenerate(payload);
      }
      
      const response = await this.makeRequest('/api/generate', payload);
      this.cache.set(cacheKey, response);
      return response;
    } catch (error) {
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
  }

  async streamGenerate(payload) {
    this.stats.streaming++;
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/generate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async makeRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const options = {
        hostname: 'localhost',
        port: 11434,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  getStats() {
    return { ...this.stats, cacheSize: this.cache.size };
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new NativeOllamaClient();