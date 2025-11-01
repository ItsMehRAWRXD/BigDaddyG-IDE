/**
 * BigDaddyG IDE - Chat Customizer
 * Customizable chat appearance with theme support and syntax highlighting
 */

class ChatCustomizer {
  constructor() {
    this.themes = {
      default: {
        name: 'Matrix',
        userColor: '#00ff00',
        userBg: 'rgba(0, 255, 0, 0.1)',
        aiColor: '#00ffff',
        aiBg: 'rgba(0, 255, 255, 0.1)',
        codeTheme: 'monokai',
        fontFamily: '"Courier New", monospace',
        fontSize: 14
      },
      cyberpunk: {
        name: 'Cyberpunk',
        userColor: '#ff00ff',
        userBg: 'rgba(255, 0, 255, 0.1)',
        aiColor: '#ffff00',
        aiBg: 'rgba(255, 255, 0, 0.1)',
        codeTheme: 'synthwave',
        fontFamily: '"Fira Code", monospace',
        fontSize: 14
      },
      hacker: {
        name: 'Hacker',
        userColor: '#00ff00',
        userBg: 'rgba(0, 255, 0, 0.05)',
        aiColor: '#ff0000',
        aiBg: 'rgba(255, 0, 0, 0.05)',
        codeTheme: 'terminal',
        fontFamily: '"Consolas", monospace',
        fontSize: 13
      },
      ocean: {
        name: 'Ocean',
        userColor: '#00bfff',
        userBg: 'rgba(0, 191, 255, 0.1)',
        aiColor: '#7fffd4',
        aiBg: 'rgba(127, 255, 212, 0.1)',
        codeTheme: 'oceanic',
        fontFamily: '"Monaco", monospace',
        fontSize: 14
      },
      sunset: {
        name: 'Sunset',
        userColor: '#ff8c00',
        userBg: 'rgba(255, 140, 0, 0.1)',
        aiColor: '#ff69b4',
        aiBg: 'rgba(255, 105, 180, 0.1)',
        codeTheme: 'sunset',
        fontFamily: '"Source Code Pro", monospace',
        fontSize: 14
      }
    };
    
    this.codeThemes = {
      monokai: {
        background: '#272822',
        text: '#f8f8f2',
        keyword: '#f92672',
        string: '#e6db74',
        number: '#ae81ff',
        comment: '#75715e',
        function: '#66d9ef',
        variable: '#a6e22e'
      },
      synthwave: {
        background: '#2b213a',
        text: '#f0eff1',
        keyword: '#ff7edb',
        string: '#fede5d',
        number: '#f97e72',
        comment: '#848bbd',
        function: '#36f9f6',
        variable: '#72f1b8'
      },
      terminal: {
        background: '#000000',
        text: '#00ff00',
        keyword: '#00ff00',
        string: '#00ff00',
        number: '#00ff00',
        comment: '#008800',
        function: '#00ffff',
        variable: '#00ff00'
      },
      oceanic: {
        background: '#1b2b34',
        text: '#d8dee9',
        keyword: '#c594c5',
        string: '#99c794',
        number: '#f99157',
        comment: '#65737e',
        function: '#6699cc',
        variable: '#5fb3b3'
      },
      sunset: {
        background: '#2d1b28',
        text: '#ffedd0',
        keyword: '#ff6b9d',
        string: '#ffa06b',
        number: '#ff6bff',
        comment: '#7d5a67',
        function: '#c96bff',
        variable: '#ffd06b'
      }
    };
    
    this.currentTheme = 'default';
    this.customSettings = null;
    
    this.init();
  }
  
  init() {
    this.loadSettings();
    this.applyTheme(this.currentTheme);
    this.injectStyles();
  }
  
  showCustomizer() {
    const modal = document.createElement('div');
    modal.id = 'chat-customizer-modal';
    modal.className = 'customizer-modal';
    modal.innerHTML = `
      <div class="customizer-content">
        <div class="customizer-header">
          <h2>🎨 Customize Chat Appearance</h2>
          <button class="customizer-close" id="customizer-close">×</button>
        </div>
        
        <div class="customizer-body">
          <!-- Theme Presets -->
          <div class="customizer-section">
            <h3>🌈 Theme Presets</h3>
            <div class="theme-presets" id="theme-presets">
              ${Object.entries(this.themes).map(([key, theme]) => `
                <div class="theme-preset ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
                  <div class="theme-preview">
                    <div class="theme-preview-user" style="background: ${theme.userBg}; color: ${theme.userColor};">
                      User
                    </div>
                    <div class="theme-preview-ai" style="background: ${theme.aiBg}; color: ${theme.aiColor};">
                      AI
                    </div>
                  </div>
                  <div class="theme-name">${theme.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- User Message Customization -->
          <div class="customizer-section">
            <h3>👤 User Message</h3>
            <div class="customizer-controls">
              <div class="control-group">
                <label>Text Color</label>
                <input type="color" id="user-color" value="${this.getCurrentTheme().userColor}" />
              </div>
              <div class="control-group">
                <label>Background</label>
                <input type="color" id="user-bg" value="${this.hexToRgb(this.getCurrentTheme().userColor)}" />
                <input type="range" id="user-opacity" min="0" max="100" value="10" />
                <span id="user-opacity-value">10%</span>
              </div>
            </div>
          </div>
          
          <!-- AI Message Customization -->
          <div class="customizer-section">
            <h3>🤖 AI Message</h3>
            <div class="customizer-controls">
              <div class="control-group">
                <label>Text Color</label>
                <input type="color" id="ai-color" value="${this.getCurrentTheme().aiColor}" />
              </div>
              <div class="control-group">
                <label>Background</label>
                <input type="color" id="ai-bg" value="${this.hexToRgb(this.getCurrentTheme().aiColor)}" />
                <input type="range" id="ai-opacity" min="0" max="100" value="10" />
                <span id="ai-opacity-value">10%</span>
              </div>
            </div>
          </div>
          
          <!-- Font Settings -->
          <div class="customizer-section">
            <h3>🔤 Font Settings</h3>
            <div class="customizer-controls">
              <div class="control-group">
                <label>Font Family</label>
                <select id="font-family">
                  <option value='"Courier New", monospace'>Courier New</option>
                  <option value='"Fira Code", monospace'>Fira Code</option>
                  <option value='"Consolas", monospace'>Consolas</option>
                  <option value='"Monaco", monospace'>Monaco</option>
                  <option value='"Source Code Pro", monospace'>Source Code Pro</option>
                  <option value='"JetBrains Mono", monospace'>JetBrains Mono</option>
                </select>
              </div>
              <div class="control-group">
                <label>Font Size</label>
                <input type="range" id="font-size" min="10" max="20" value="14" />
                <span id="font-size-value">14px</span>
              </div>
            </div>
          </div>
          
          <!-- Code Syntax Theme -->
          <div class="customizer-section">
            <h3>💻 Code Syntax Theme</h3>
            <div class="code-theme-selector" id="code-theme-selector">
              ${Object.entries(this.codeThemes).map(([key, theme]) => `
                <div class="code-theme-preset ${key === this.getCurrentTheme().codeTheme ? 'active' : ''}" data-code-theme="${key}">
                  <div class="code-theme-preview" style="background: ${theme.background}; color: ${theme.text};">
                    <span style="color: ${theme.keyword};">function</span>
                    <span style="color: ${theme.function};">hello</span>() {
                    <span style="color: ${theme.keyword};">return</span>
                    <span style="color: ${theme.string};">"world"</span>;
                    }
                  </div>
                  <div class="code-theme-name">${key}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Preview -->
          <div class="customizer-section">
            <h3>👁️ Preview</h3>
            <div class="customizer-preview" id="customizer-preview">
              <div class="preview-message preview-user">
                <strong>You:</strong> How do I create a function in JavaScript?
              </div>
              <div class="preview-message preview-ai">
                <strong>BigDaddyG:</strong> Here's a simple function example:
                <pre class="preview-code"><code class="language-javascript">function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));</code></pre>
              </div>
            </div>
          </div>
        </div>
        
        <div class="customizer-footer">
          <button class="customizer-btn customizer-reset" id="customizer-reset">
            🔄 Reset to Default
          </button>
          <button class="customizer-btn customizer-save" id="customizer-save">
            ✅ Save & Apply
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.attachCustomizerListeners();
    this.updatePreview();
  }
  
  attachCustomizerListeners() {
    // Close modal
    document.getElementById('customizer-close')?.addEventListener('click', () => {
      this.closeCustomizer();
    });
    
    // Theme presets
    document.querySelectorAll('.theme-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const theme = preset.dataset.theme;
        this.currentTheme = theme;
        this.applyThemeToInputs();
        this.updatePreview();
        
        document.querySelectorAll('.theme-preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
      });
    });
    
    // Code theme presets
    document.querySelectorAll('.code-theme-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const codeTheme = preset.dataset.codeTheme;
        const currentSettings = this.getCurrentSettings();
        currentSettings.codeTheme = codeTheme;
        this.applyCustomSettings(currentSettings);
        this.updatePreview();
        
        document.querySelectorAll('.code-theme-preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
      });
    });
    
    // Live updates for all controls
    const controls = [
      'user-color', 'user-bg', 'user-opacity',
      'ai-color', 'ai-bg', 'ai-opacity',
      'font-family', 'font-size'
    ];
    
    controls.forEach(id => {
      const element = document.getElementById(id);
      element?.addEventListener('input', () => {
        if (id === 'user-opacity') {
          document.getElementById('user-opacity-value').textContent = element.value + '%';
        } else if (id === 'ai-opacity') {
          document.getElementById('ai-opacity-value').textContent = element.value + '%';
        } else if (id === 'font-size') {
          document.getElementById('font-size-value').textContent = element.value + 'px';
        }
        this.updatePreview();
      });
    });
    
    // Reset button
    document.getElementById('customizer-reset')?.addEventListener('click', () => {
      if (confirm('Reset to default theme?')) {
        this.currentTheme = 'default';
        this.customSettings = null;
        this.applyTheme('default');
        this.applyThemeToInputs();
        this.updatePreview();
      }
    });
    
    // Save button
    document.getElementById('customizer-save')?.addEventListener('click', () => {
      this.saveCurrentSettings();
      this.applyCurrentSettings();
      this.closeCustomizer();
    });
  }
  
  applyThemeToInputs() {
    const theme = this.getCurrentTheme();
    
    document.getElementById('user-color').value = theme.userColor;
    document.getElementById('ai-color').value = theme.aiColor;
    document.getElementById('font-family').value = theme.fontFamily;
    document.getElementById('font-size').value = theme.fontSize;
    document.getElementById('font-size-value').textContent = theme.fontSize + 'px';
  }
  
  getCurrentSettings() {
    return {
      userColor: document.getElementById('user-color')?.value || this.getCurrentTheme().userColor,
      userBg: document.getElementById('user-bg')?.value || this.getCurrentTheme().userBg,
      userOpacity: document.getElementById('user-opacity')?.value || 10,
      aiColor: document.getElementById('ai-color')?.value || this.getCurrentTheme().aiColor,
      aiBg: document.getElementById('ai-bg')?.value || this.getCurrentTheme().aiBg,
      aiOpacity: document.getElementById('ai-opacity')?.value || 10,
      fontFamily: document.getElementById('font-family')?.value || this.getCurrentTheme().fontFamily,
      fontSize: document.getElementById('font-size')?.value || this.getCurrentTheme().fontSize,
      codeTheme: this.customSettings?.codeTheme || this.getCurrentTheme().codeTheme
    };
  }
  
  getCurrentTheme() {
    return this.themes[this.currentTheme] || this.themes.default;
  }
  
  updatePreview() {
    const settings = this.getCurrentSettings();
    const preview = document.getElementById('customizer-preview');
    if (!preview) return;
    
    const userMsg = preview.querySelector('.preview-user');
    const aiMsg = preview.querySelector('.preview-ai');
    const code = preview.querySelector('.preview-code');
    
    if (userMsg) {
      userMsg.style.color = settings.userColor;
      userMsg.style.background = this.rgbaFromHex(settings.userBg, settings.userOpacity / 100);
      userMsg.style.fontFamily = settings.fontFamily;
      userMsg.style.fontSize = settings.fontSize + 'px';
    }
    
    if (aiMsg) {
      aiMsg.style.color = settings.aiColor;
      aiMsg.style.background = this.rgbaFromHex(settings.aiBg, settings.aiOpacity / 100);
      aiMsg.style.fontFamily = settings.fontFamily;
      aiMsg.style.fontSize = settings.fontSize + 'px';
    }
    
    if (code) {
      this.applyCodeTheme(code, settings.codeTheme);
    }
  }
  
  applyCodeTheme(codeElement, themeName) {
    const theme = this.codeThemes[themeName] || this.codeThemes.monokai;
    
    codeElement.style.background = theme.background;
    codeElement.style.color = theme.text;
    
    // Apply syntax highlighting
    const codeText = codeElement.querySelector('code');
    if (codeText) {
      codeText.innerHTML = this.highlightCode(codeText.textContent, theme);
    }
  }
  
  highlightCode(code, theme) {
    // Simple syntax highlighting
    return code
      .replace(/\b(function|return|const|let|var|if|else|for|while|class|extends|import|export)\b/g, 
        `<span style="color: ${theme.keyword}">$1</span>`)
      .replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, 
        `<span style="color: ${theme.function}">$1</span>`)
      .replace(/("[^"]*"|'[^']*')/g, 
        `<span style="color: ${theme.string}">$1</span>`)
      .replace(/\b(\d+)\b/g, 
        `<span style="color: ${theme.number}">$1</span>`)
      .replace(/(\/\/.*$)/gm, 
        `<span style="color: ${theme.comment}">$1</span>`);
  }
  
  saveCurrentSettings() {
    const settings = this.getCurrentSettings();
    localStorage.setItem('bigdaddyg_chat_theme', this.currentTheme);
    localStorage.setItem('bigdaddyg_chat_custom', JSON.stringify(settings));
    this.customSettings = settings;
  }
  
  loadSettings() {
    try {
      const savedTheme = localStorage.getItem('bigdaddyg_chat_theme');
      const savedCustom = localStorage.getItem('bigdaddyg_chat_custom');
      
      if (savedTheme) {
        this.currentTheme = savedTheme;
      }
      
      if (savedCustom) {
        this.customSettings = JSON.parse(savedCustom);
      }
    } catch (error) {
      console.error('[ChatCustomizer] Error loading settings:', error);
    }
  }
  
  applyTheme(themeName) {
    const theme = this.themes[themeName] || this.themes.default;
    this.applyCustomSettings({
      userColor: theme.userColor,
      userBg: theme.userBg,
      userOpacity: 10,
      aiColor: theme.aiColor,
      aiBg: theme.aiBg,
      aiOpacity: 10,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
      codeTheme: theme.codeTheme
    });
  }
  
  applyCurrentSettings() {
    if (this.customSettings) {
      this.applyCustomSettings(this.customSettings);
    } else {
      this.applyTheme(this.currentTheme);
    }
  }
  
  applyCustomSettings(settings) {
    const style = document.getElementById('chat-custom-theme') || document.createElement('style');
    style.id = 'chat-custom-theme';
    
    const codeTheme = this.codeThemes[settings.codeTheme] || this.codeThemes.monokai;
    
    style.textContent = `
      .chat-message.user-message {
        color: ${settings.userColor} !important;
        background: ${this.rgbaFromHex(settings.userBg, settings.userOpacity / 100)} !important;
        font-family: ${settings.fontFamily} !important;
        font-size: ${settings.fontSize}px !important;
      }
      
      .chat-message.ai-message {
        color: ${settings.aiColor} !important;
        background: ${this.rgbaFromHex(settings.aiBg, settings.aiOpacity / 100)} !important;
        font-family: ${settings.fontFamily} !important;
        font-size: ${settings.fontSize}px !important;
      }
      
      .chat-message pre,
      .chat-message code {
        background: ${codeTheme.background} !important;
        color: ${codeTheme.text} !important;
        font-family: ${settings.fontFamily} !important;
        font-size: ${Math.max(12, settings.fontSize - 2)}px !important;
      }
      
      .chat-message code .keyword { color: ${codeTheme.keyword}; }
      .chat-message code .string { color: ${codeTheme.string}; }
      .chat-message code .number { color: ${codeTheme.number}; }
      .chat-message code .comment { color: ${codeTheme.comment}; }
      .chat-message code .function { color: ${codeTheme.function}; }
      .chat-message code .variable { color: ${codeTheme.variable}; }
    `;
    
    if (!style.parentNode) {
      document.head.appendChild(style);
    }
  }
  
  closeCustomizer() {
    const modal = document.getElementById('chat-customizer-modal');
    if (modal) {
      modal.remove();
    }
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `#${result[1]}${result[2]}${result[3]}` : hex;
  }
  
  rgbaFromHex(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  injectStyles() {
    if (document.getElementById('chat-customizer-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'chat-customizer-styles';
    style.textContent = `
      .customizer-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
      }
      
      .customizer-content {
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        background: rgba(10, 10, 30, 0.95);
        border: 2px solid var(--cyan);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
      }
      
      .customizer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px;
        background: rgba(0, 255, 255, 0.1);
        border-bottom: 2px solid var(--cyan);
      }
      
      .customizer-header h2 {
        margin: 0;
        color: var(--cyan);
        font-size: 20px;
      }
      
      .customizer-close {
        background: none;
        border: none;
        color: var(--red);
        font-size: 32px;
        cursor: pointer;
        line-height: 1;
        transition: all 0.2s;
      }
      
      .customizer-close:hover {
        transform: scale(1.2);
        text-shadow: 0 0 10px var(--red);
      }
      
      .customizer-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px 25px;
      }
      
      .customizer-section {
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
      }
      
      .customizer-section:last-child {
        border-bottom: none;
      }
      
      .customizer-section h3 {
        margin: 0 0 15px 0;
        color: var(--green);
        font-size: 16px;
      }
      
      .theme-presets {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
      }
      
      .theme-preset {
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .theme-preset:hover {
        border-color: var(--cyan);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
      }
      
      .theme-preset.active {
        border-color: var(--green);
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      }
      
      .theme-preview {
        margin-bottom: 8px;
      }
      
      .theme-preview-user,
      .theme-preview-ai {
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 11px;
        margin-bottom: 4px;
      }
      
      .theme-name {
        text-align: center;
        font-size: 13px;
        color: var(--cyan);
        font-weight: bold;
      }
      
      .customizer-controls {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .control-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .control-group label {
        min-width: 120px;
        color: var(--green);
        font-size: 13px;
      }
      
      .control-group input[type="color"] {
        width: 60px;
        height: 35px;
        border: 2px solid var(--cyan);
        border-radius: 6px;
        cursor: pointer;
      }
      
      .control-group input[type="range"] {
        flex: 1;
        max-width: 200px;
      }
      
      .control-group select {
        flex: 1;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid var(--cyan);
        border-radius: 6px;
        color: var(--cyan);
        font-family: inherit;
      }
      
      .code-theme-selector {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }
      
      .code-theme-preset {
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .code-theme-preset:hover {
        border-color: var(--cyan);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
      }
      
      .code-theme-preset.active {
        border-color: var(--green);
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
      }
      
      .code-theme-preview {
        padding: 12px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        margin-bottom: 8px;
        white-space: pre;
        overflow-x: auto;
      }
      
      .code-theme-name {
        text-align: center;
        font-size: 13px;
        color: var(--cyan);
        font-weight: bold;
        text-transform: capitalize;
      }
      
      .customizer-preview {
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        padding: 15px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .preview-message {
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        border-left: 3px solid;
      }
      
      .preview-user {
        border-left-color: var(--orange);
      }
      
      .preview-ai {
        border-left-color: var(--cyan);
      }
      
      .preview-code {
        margin-top: 10px;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.5;
      }
      
      .customizer-footer {
        display: flex;
        gap: 12px;
        padding: 20px 25px;
        background: rgba(0, 0, 0, 0.5);
        border-top: 2px solid rgba(0, 255, 255, 0.2);
      }
      
      .customizer-btn {
        flex: 1;
        padding: 12px 20px;
        border: 2px solid;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .customizer-reset {
        background: rgba(255, 165, 0, 0.1);
        border-color: var(--orange);
        color: var(--orange);
      }
      
      .customizer-reset:hover {
        background: rgba(255, 165, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 165, 0, 0.4);
      }
      
      .customizer-save {
        background: rgba(0, 255, 0, 0.1);
        border-color: var(--green);
        color: var(--green);
      }
      
      .customizer-save:hover {
        background: rgba(0, 255, 0, 0.2);
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chatCustomizer = new ChatCustomizer();
  });
} else {
  window.chatCustomizer = new ChatCustomizer();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatCustomizer;
}

