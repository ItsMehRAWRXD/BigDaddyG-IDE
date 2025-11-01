/**
 * BigDaddyG IDE - Voice Coding System
 * Voice-to-text coding, voice commands, hands-free development
 * Like GitHub Copilot Voice + Cursor Voice + Talon Voice
 */

// ============================================================================
// VOICE CODING CONFIGURATION
// ============================================================================

const VoiceConfig = {
    // Voice recognition
    enabled: false,
    continuous: true,
    interimResults: true,
    language: 'en-US',
    
    // Voice commands
    wakeWord: 'hey bigdaddy',           // Activation phrase
    sleepWord: 'go to sleep',           // Deactivation phrase
    
    // Dictation mode
    dictationMode: false,               // Pure text-to-speech
    codeMode: true,                     // Smart code interpretation
    
    // Voice feedback
    voiceFeedback: true,                // AI speaks responses
    voiceGender: 'female',              // 'male' or 'female'
    voiceRate: 1.0,                     // 0.5 - 2.0
    voicePitch: 1.0,                    // 0.0 - 2.0
    
    // Commands
    commandPrefix: 'command',           // "Command: save file"
    
    // Confirmation
    requireConfirmation: true,          // Confirm destructive actions
    
    // Noise cancellation
    noiseCancellation: true,
    minConfidence: 0.7                  // 0.0 - 1.0
};

// ============================================================================
// VOICE COMMAND REGISTRY
// ============================================================================

const VoiceCommands = {
    // File operations
    'new file': () => createNewFile(),
    'save file': () => saveCurrentFile(),
    'save all': () => saveAllFiles(),
    'close file': () => closeCurrentFile(),
    'open file *': (filename) => openFile(filename),
    
    // Navigation
    'go to line *': (line) => goToLine(parseInt(line)),
    'go to top': () => goToLine(1),
    'go to bottom': () => goToEnd(),
    'next tab': () => switchNextTab(),
    'previous tab': () => switchPreviousTab(),
    'go to tab *': (name) => switchToTab(name),
    
    // Editing
    'select all': () => selectAll(),
    'select line': () => selectLine(),
    'delete line': () => deleteLine(),
    'duplicate line': () => duplicateLine(),
    'move line up': () => moveLineUp(),
    'move line down': () => moveLineDown(),
    'indent': () => indent(),
    'outdent': () => outdent(),
    'comment line': () => commentLine(),
    'uncomment line': () => uncommentLine(),
    
    // Code generation
    'create function *': (name) => createFunction(name),
    'create class *': (name) => createClass(name),
    'create variable *': (name) => createVariable(name),
    'import *': (module) => addImport(module),
    
    // AI commands
    'explain this': () => explainCode(),
    'fix this': () => fixCode(),
    'optimize this': () => optimizeCode(),
    'refactor this': () => refactorCode(),
    'add tests': () => generateTests(),
    'add docs': () => generateDocs(),
    
    // Terminal
    'open terminal': () => openTerminal(),
    'close terminal': () => closeTerminal(),
    'run command *': (cmd) => runTerminalCommand(cmd),
    'compile': () => compile(),
    'run': () => run(),
    
    // Agent
    'open agent': () => openAgentPanel(),
    'close agent': () => closeAgentPanel(),
    'ask bigdaddy *': (question) => askBigDaddyG(question),
    'execute task *': (task) => executeAgenticTask(task),
    
    // UI
    'toggle sidebar': () => toggleSidebar(),
    'toggle terminal': () => toggleTerminal(),
    'toggle fullscreen': () => toggleFullscreen(),
    'zoom in': () => zoomIn(),
    'zoom out': () => zoomOut(),
    'reset zoom': () => resetZoom(),
    
    // Search
    'find *': (text) => find(text),
    'find next': () => findNext(),
    'find previous': () => findPrevious(),
    'replace * with *': (oldText, newText) => replace(oldText, newText),
    
    // Git
    'git status': () => gitStatus(),
    'git commit *': (message) => gitCommit(message),
    'git push': () => gitPush(),
    'git pull': () => gitPull(),
    
    // Window management
    'split editor': () => splitEditor(),
    'close split': () => closeSplit(),
    'focus left': () => focusLeft(),
    'focus right': () => focusRight(),
    
    // Dictation control
    'start dictation': () => startDictation(),
    'stop dictation': () => stopDictation(),
    'insert code': () => insertCode(),
    'new line': () => insertNewLine(),
    'new paragraph': () => insertParagraph()
};

// ============================================================================
// PROGRAMMING KEYWORDS (Voice-to-Code Translation)
// ============================================================================

const CodeTranslations = {
    // JavaScript/TypeScript
    'const': 'const ',
    'let': 'let ',
    'var': 'var ',
    'function': 'function ',
    'arrow function': '() => ',
    'async function': 'async function ',
    'class': 'class ',
    'if': 'if () {\n\n}',
    'else': 'else {\n\n}',
    'for loop': 'for (let i = 0; i < ; i++) {\n\n}',
    'while loop': 'while () {\n\n}',
    'try catch': 'try {\n\n} catch (error) {\n\n}',
    'switch': 'switch () {\n  case :\n    break;\n  default:\n}',
    
    // Python
    'def': 'def ',
    'class python': 'class :',
    'if python': 'if :',
    'for in': 'for  in :',
    'while python': 'while :',
    'try except': 'try:\n\nexcept:',
    
    // C/C++
    'include': '#include <>',
    'define': '#define ',
    'int main': 'int main() {\n\n  return 0;\n}',
    'struct': 'struct  {\n\n};',
    'printf': 'printf("");',
    'scanf': 'scanf("");',
    
    // Common patterns
    'console log': 'console.log()',
    'print': 'print()',
    'return': 'return ',
    'break': 'break;',
    'continue': 'continue;',
    'import': 'import  from "";',
    'export': 'export ',
    'async await': 'async () => await ',
    'arrow': ' => ',
    'equals': ' = ',
    'plus': ' + ',
    'minus': ' - ',
    'multiply': ' * ',
    'divide': ' / ',
    'and': ' && ',
    'or': ' || ',
    'not': '!',
    'semicolon': ';',
    'comma': ',',
    'dot': '.',
    'open paren': '(',
    'close paren': ')',
    'open brace': '{',
    'close brace': '}',
    'open bracket': '[',
    'close bracket': ']',
    'quote': '"',
    'single quote': "'",
    'backtick': '`'
};

// ============================================================================
// VOICE CODING ENGINE
// ============================================================================

class VoiceCodingEngine {
    constructor(editor) {
        this.editor = editor;
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.isAwake = false;
        this.isDictating = false;
        this.currentTranscript = '';
        this.interimTranscript = '';
        
        this.init();
    }
    
    init() {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('[Voice] ❌ Speech recognition not supported');
            return;
        }
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = VoiceConfig.continuous;
        this.recognition.interimResults = VoiceConfig.interimResults;
        this.recognition.lang = VoiceConfig.language;
        
        // Initialize speech synthesis
        this.synthesis = window.speechSynthesis;
        
        // Set up event listeners
        this.setupRecognitionEvents();
        
        console.log('[Voice] 🎤 Voice coding engine initialized');
        console.log(`[Voice] 💡 Say "${VoiceConfig.wakeWord}" to activate`);
    }
    
    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('[Voice] 👂 Listening...');
            this.updateUI('listening');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('[Voice] 🔇 Stopped listening');
            this.updateUI('stopped');
            
            // Auto-restart if still awake
            if (this.isAwake) {
                this.recognition.start();
            }
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('[Voice] ❌ Error:', event.error);
            this.speak(`Voice error: ${event.error}`);
        };
    }
    
    handleSpeechResult(event) {
        this.interimTranscript = '';
        this.currentTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript.toLowerCase().trim();
            
            if (result.isFinal) {
                this.currentTranscript += transcript;
            } else {
                this.interimTranscript += transcript;
            }
        }
        
        // Show interim results
        if (this.interimTranscript) {
            this.showInterimText(this.interimTranscript);
        }
        
        // Process final results
        if (this.currentTranscript) {
            this.processTranscript(this.currentTranscript);
        }
    }
    
    processTranscript(transcript) {
        console.log(`[Voice] 📝 Heard: "${transcript}"`);
        
        // Check for wake word
        if (transcript.includes(VoiceConfig.wakeWord) && !this.isAwake) {
            this.wake();
            return;
        }
        
        // Check for sleep word
        if (transcript.includes(VoiceConfig.sleepWord) && this.isAwake) {
            this.sleep();
            return;
        }
        
        // Only process commands if awake
        if (!this.isAwake) {
            return;
        }
        
        // Dictation mode - just insert text
        if (this.isDictating) {
            this.insertDictation(transcript);
            return;
        }
        
        // Code mode - interpret as code
        if (VoiceConfig.codeMode) {
            // Try to match voice command
            const commandExecuted = this.executeVoiceCommand(transcript);
            if (commandExecuted) {
                return;
            }
            
            // Translate to code
            const code = this.translateToCode(transcript);
            this.insertCode(code);
        }
    }
    
    executeVoiceCommand(transcript) {
        // Check exact matches first
        if (VoiceCommands[transcript]) {
            VoiceCommands[transcript]();
            this.speak('Done');
            return true;
        }
        
        // Check pattern matches (commands with parameters)
        for (const pattern in VoiceCommands) {
            if (pattern.includes('*')) {
                const regex = new RegExp(
                    '^' + pattern.replace(/\*/g, '(.+)') + '$'
                );
                const match = transcript.match(regex);
                
                if (match) {
                    const params = match.slice(1);
                    VoiceCommands[pattern](...params);
                    this.speak('Done');
                    return true;
                }
            }
        }
        
        return false;
    }
    
    translateToCode(transcript) {
        // Check for direct code translations
        if (CodeTranslations[transcript]) {
            return CodeTranslations[transcript];
        }
        
        // Try to intelligently convert to code
        let code = transcript;
        
        // Replace common phrases
        for (const phrase in CodeTranslations) {
            if (transcript.includes(phrase)) {
                code = code.replace(phrase, CodeTranslations[phrase]);
            }
        }
        
        return code;
    }
    
    insertCode(code) {
        if (!this.editor) return;
        
        const position = this.editor.getPosition();
        this.editor.executeEdits('voice-insert', [{
            range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
            ),
            text: code
        }]);
        
        console.log(`[Voice] ✅ Inserted: ${code}`);
    }
    
    insertDictation(text) {
        if (!this.editor) return;
        
        const position = this.editor.getPosition();
        this.editor.executeEdits('voice-dictation', [{
            range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
            ),
            text: text + ' '
        }]);
    }
    
    showInterimText(text) {
        // Show interim results in a tooltip
        const tooltip = document.getElementById('voice-interim-tooltip');
        if (tooltip) {
            tooltip.textContent = text;
            tooltip.style.display = 'block';
        }
    }
    
    speak(text) {
        if (!VoiceConfig.voiceFeedback || !this.synthesis) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = VoiceConfig.voiceRate;
        utterance.pitch = VoiceConfig.voicePitch;
        
        // Select voice
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => 
            v.name.toLowerCase().includes(VoiceConfig.voiceGender)
        ) || voices[0];
        
        utterance.voice = voice;
        
        this.synthesis.speak(utterance);
        console.log(`[Voice] 🔊 Speaking: "${text}"`);
    }
    
    wake() {
        this.isAwake = true;
        this.speak('Voice coding activated. How can I help?');
        this.updateUI('awake');
        console.log('[Voice] 🌟 AWAKE - Ready for commands');
    }
    
    sleep() {
        this.isAwake = false;
        this.speak('Going to sleep');
        this.updateUI('asleep');
        console.log('[Voice] 😴 ASLEEP');
    }
    
    startListening() {
        if (this.isListening) return;
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('[Voice] Error starting recognition:', error);
        }
    }
    
    stopListening() {
        if (!this.isListening) return;
        
        this.recognition.stop();
        this.isAwake = false;
    }
    
    toggle() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startDictation() {
        this.isDictating = true;
        this.speak('Dictation mode enabled');
        this.updateUI('dictating');
        console.log('[Voice] 📝 Dictation mode');
    }
    
    stopDictation() {
        this.isDictating = false;
        this.speak('Dictation mode disabled');
        this.updateUI('awake');
        console.log('[Voice] 💻 Code mode');
    }
    
    updateUI(state) {
        const indicator = document.getElementById('voice-indicator');
        if (!indicator) return;
        
        const states = {
            listening: { icon: '🎤', color: '#00ff88', text: 'Listening...' },
            awake: { icon: '🌟', color: '#00d4ff', text: 'Voice Active' },
            asleep: { icon: '😴', color: '#666', text: 'Voice Sleeping' },
            dictating: { icon: '📝', color: '#ff6b35', text: 'Dictating' },
            stopped: { icon: '🔇', color: '#666', text: 'Voice Off' }
        };
        
        const current = states[state] || states.stopped;
        indicator.innerHTML = `${current.icon} ${current.text}`;
        indicator.style.color = current.color;
    }
}

// ============================================================================
// VOICE COMMAND IMPLEMENTATIONS
// ============================================================================

// (These would integrate with existing IDE functions)

function createNewFile() {
    if (typeof createNewTab === 'function') {
        const filename = prompt('Filename:') || 'untitled.txt';
        createNewTab(filename, 'plaintext');
    }
}

function saveCurrentFile() {
    // Implement save
    console.log('[Voice] 💾 Saving file...');
}

function openAgentPanel() {
    if (typeof showAgentPanel === 'function') {
        showAgentPanel();
    }
}

function askBigDaddyG(question) {
    if (typeof sendAgentMessage === 'function') {
        document.getElementById('agent-input').value = question;
        sendAgentMessage();
    }
}

function executeAgenticTask(task) {
    if (window.agenticExecutor) {
        window.agenticExecutor.executeTask(task, (progress) => {
            console.log('[Voice] Agentic progress:', progress);
        });
    }
}

// ============================================================================
// UI COMPONENTS
// ============================================================================

function createVoiceUI() {
    // Voice indicator
    const indicator = document.createElement('div');
    indicator.id = 'voice-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 10px 20px;
        background: rgba(10, 10, 30, 0.95);
        backdrop-filter: blur(20px);
        border: 2px solid var(--cyan);
        border-radius: 25px;
        color: var(--cyan);
        font-size: 14px;
        font-weight: bold;
        z-index: 999998;
        cursor: pointer;
        display: none;
    `;
    indicator.innerHTML = '🔇 Voice Off';
    indicator.onclick = () => toggleVoiceCoding();
    document.body.appendChild(indicator);
    
    // Interim tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'voice-interim-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 20px;
        padding: 15px 20px;
        background: rgba(0, 212, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid var(--cyan);
        border-radius: 10px;
        color: var(--cyan);
        font-size: 13px;
        z-index: 999997;
        display: none;
        max-width: 400px;
    `;
    document.body.appendChild(tooltip);
    
    // Voice button
    const button = document.createElement('button');
    button.id = 'voice-toggle-btn';
    button.innerHTML = '🎤';
    button.title = 'Voice Coding (Ctrl+Shift+V)';
    button.style.cssText = `
        position: fixed;
        bottom: 200px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #ff6b35, #f9ca24);
        border: 2px solid var(--orange);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 99995;
        box-shadow: 0 5px 20px rgba(255,107,53,0.5);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 8px 30px rgba(255,107,53,0.8)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 5px 20px rgba(255,107,53,0.5)';
    };
    
    button.onclick = () => toggleVoiceCoding();
    
    document.body.appendChild(button);
}

function toggleVoiceCoding() {
    if (window.voiceCodingEngine) {
        window.voiceCodingEngine.toggle();
        document.getElementById('voice-indicator').style.display = 
            window.voiceCodingEngine.isListening ? 'block' : 'none';
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Create UI when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createVoiceUI);
} else {
    createVoiceUI();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VoiceCodingEngine,
        VoiceConfig,
        VoiceCommands,
        CodeTranslations
    };
}

console.log('[Voice] 🎤 Voice coding module loaded');
console.log('[Voice] 💡 Press Ctrl+Shift+V or click 🎤 button to start');

