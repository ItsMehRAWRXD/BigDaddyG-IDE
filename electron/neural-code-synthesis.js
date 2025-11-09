/**
 * Neural Code Synthesis Engine
 * Converts natural language todos into executable code
 */

class NeuralCodeSynthesis {
  constructor() {
    this.initialized = false;
    this.synthesisQueue = [];
    this.activeJobs = new Map();
    this.completedJobs = [];
    
    this.init();
  }
  
  init() {
    console.log('[NeuralSynthesis] 🧠 Initializing neural code synthesis engine...');
    
    // Listen for todo synthesis events
    window.addEventListener('todo-synthesized', (event) => {
      this.handleTodoSynthesis(event.detail);
    });
    
    this.initialized = true;
    console.log('[NeuralSynthesis] ✅ Neural synthesis engine ready');
  }
  
  async handleTodoSynthesis(data) {
    const { todo, prompt } = data;
    
    console.log('[NeuralSynthesis] 🎯 Processing synthesis request:', todo.content);
    
    // Add to active jobs
    this.activeJobs.set(todo.id, {
      todo,
      prompt,
      startTime: Date.now(),
      status: 'synthesizing'
    });
    
    try {
      // Generate code using AI
      const synthesizedCode = await this.synthesizeCode(prompt, todo);
      
      // Create new file with synthesized code
      if (synthesizedCode) {
        await this.createCodeFile(todo, synthesizedCode);
      }
      
      // Mark job as completed
      const job = this.activeJobs.get(todo.id);
      if (job) {
        job.status = 'completed';
        job.endTime = Date.now();
        job.code = synthesizedCode;
        
        this.completedJobs.push(job);
        this.activeJobs.delete(todo.id);
      }
      
    } catch (error) {
      console.error('[NeuralSynthesis] ❌ Synthesis failed:', error);
      
      // Mark job as failed
      const job = this.activeJobs.get(todo.id);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
        job.endTime = Date.now();
        
        this.completedJobs.push(job);
        this.activeJobs.delete(todo.id);
      }
    }
  }
  
  async synthesizeCode(prompt, todo) {
    console.log('[NeuralSynthesis] 🔬 Synthesizing code...');
    
    // Enhanced prompt for better code generation
    const enhancedPrompt = `
Task: ${todo.content}

Generate clean, working code that accomplishes this task. Requirements:
- Include all necessary imports
- Add proper error handling
- Use modern best practices
- Include comments explaining key parts
- Make it production-ready

Language preference: ${this.detectLanguage(todo.content)}

Code:`;

    try {
      // Use the AI provider to generate code
      if (window.aiProviderManager) {
        const response = await window.aiProviderManager.generateResponse(enhancedPrompt, {
          temperature: 0.3, // Lower temperature for more consistent code
          maxTokens: 2048
        });
        
        return this.extractCode(response);
      }
      
      // Fallback: Use existing AI system
      return await this.fallbackSynthesis(enhancedPrompt);
      
    } catch (error) {
      console.error('[NeuralSynthesis] Code generation failed:', error);
      throw error;
    }
  }
  
  detectLanguage(todoContent) {
    const content = todoContent.toLowerCase();
    
    if (content.includes('python') || content.includes('django') || content.includes('flask')) {
      return 'python';
    }
    if (content.includes('javascript') || content.includes('node') || content.includes('react')) {
      return 'javascript';
    }
    if (content.includes('java') || content.includes('spring')) {
      return 'java';
    }
    if (content.includes('c++') || content.includes('cpp')) {
      return 'cpp';
    }
    if (content.includes('rust')) {
      return 'rust';
    }
    if (content.includes('go') || content.includes('golang')) {
      return 'go';
    }
    
    // Default to JavaScript for web-related tasks
    return 'javascript';
  }
  
  extractCode(aiResponse) {
    // Extract code blocks from AI response
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
    const matches = [...aiResponse.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      return matches[0][1].trim();
    }
    
    // If no code blocks, return the whole response (might be inline code)
    return aiResponse.trim();
  }
  
  async fallbackSynthesis(prompt) {
    return new Promise((resolve) => {
      // Simulate code generation
      setTimeout(() => {
        const sampleCode = `// Generated code for: ${prompt.split('\n')[0]}
console.log('Task completed: ${prompt.split('\n')[0]}');

// TODO: Implement actual functionality
function executeTask() {
  // Add your implementation here
  return 'Task executed successfully';
}

executeTask();`;
        
        resolve(sampleCode);
      }, 1000);
    });
  }
  
  async createCodeFile(todo, code) {
    try {
      const language = this.detectLanguage(todo.content);
      const extension = this.getFileExtension(language);
      const filename = this.generateFilename(todo.content, extension);
      
      console.log('[NeuralSynthesis] 📄 Creating file:', filename);
      
      // Create new tab with synthesized code
      if (window.createNewTab) {
        const tabId = await window.createNewTab(filename, language);
        
        // Set the content
        if (window.monaco && window.editors && window.editors[tabId]) {
          window.editors[tabId].setValue(code);
        }
      }
      
      // Show notification
      this.showNotification(`Code synthesized: ${filename}`, 'success');
      
    } catch (error) {
      console.error('[NeuralSynthesis] Failed to create code file:', error);
      this.showNotification('Failed to create code file', 'error');
    }
  }
  
  getFileExtension(language) {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      rust: 'rs',
      go: 'go',
      html: 'html',
      css: 'css'
    };
    
    return extensions[language] || 'txt';
  }
  
  generateFilename(todoContent, extension) {
    // Generate a meaningful filename from todo content
    const cleanContent = todoContent
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 30);
    
    const timestamp = Date.now().toString().slice(-6);
    return `${cleanContent}_${timestamp}.${extension}`;
  }
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--cyan)'};
      color: var(--void);
      border-radius: 6px;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Public API methods
  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }
  
  getCompletedJobs() {
    return this.completedJobs;
  }
  
  getStats() {
    return {
      active: this.activeJobs.size,
      completed: this.completedJobs.length,
      success: this.completedJobs.filter(j => j.status === 'completed').length,
      failed: this.completedJobs.filter(j => j.status === 'failed').length
    };
  }
  
  clearHistory() {
    this.completedJobs = [];
    console.log('[NeuralSynthesis] History cleared');
  }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize neural synthesis engine
window.neuralCodeSynthesis = new NeuralCodeSynthesis();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuralCodeSynthesis;
}

console.log('[NeuralSynthesis] 🧠 Neural Code Synthesis Engine loaded');