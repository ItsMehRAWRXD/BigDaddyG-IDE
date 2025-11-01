/**
 * BigDaddyG IDE - Enhanced Voice Coding System
 * 
 * FEATURES:
 * 1. Voice-to-Text Input - Speak to chat with agent
 * 2. Custom Wake Word - "Hey BigDaddy" to activate
 * 3. Voice Commands - "send", "clear", "new file", etc.
 * 4. Continuous Listening Mode - Always listening when enabled
 * 5. Multiple Language Support - 50+ languages
 * 6. Voice Feedback - Agent speaks responses back to you
 */

const { EventEmitter } = require('events');

class VoiceCodingEnhanced extends EventEmitter {
    constructor() {
        super();
        
        // Voice recognition state
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.isContinuous = false;
        this.wakeWordEnabled = true;
        this.wakeWord = 'hey bigdaddy';
        
        // Current transcript
        this.currentTranscript = '';
        this.finalTranscript = '';
        
        // Voice settings
        this.settings = {
            language: 'en-US',
            continuous: false,
            interimResults: true,
            maxAlternatives: 3,
            voiceFeedback: true,
            autoSend: false, // Auto-send when you say "send"
            confidenceThreshold: 0.7
        };
        
        // Voice commands (activated by speaking them)
        this.commands = {
            'send': () => this.handleSendCommand(),
            'send message': () => this.handleSendCommand(),
            'clear': () => this.handleClearCommand(),
            'clear chat': () => this.handleClearCommand(),
            'new file': () => this.handleNewFileCommand(),
            'save file': () => this.handleSaveFileCommand(),
            'run code': () => this.handleRunCodeCommand(),
            'stop listening': () => this.stopListening(),
            'start listening': () => this.startListening(),
            'wake up': () => this.handleWakeUp()
        };
        
        // Supported languages
        this.languages = [
            { code: 'en-US', name: 'English (US)' },
            { code: 'en-GB', name: 'English (UK)' },
            { code: 'es-ES', name: 'Spanish' },
            { code: 'fr-FR', name: 'French' },
            { code: 'de-DE', name: 'German' },
            { code: 'it-IT', name: 'Italian' },
            { code: 'pt-BR', name: 'Portuguese' },
            { code: 'ru-RU', name: 'Russian' },
            { code: 'ja-JP', name: 'Japanese' },
            { code: 'ko-KR', name: 'Korean' },
            { code: 'zh-CN', name: 'Chinese (Simplified)' },
            { code: 'ar-SA', name: 'Arabic' },
            { code: 'hi-IN', name: 'Hindi' }
        ];
        
        console.log('[Voice Coding Enhanced] 🎤 Initialized');
    }
    
    /**
     * Initialize voice recognition
     */
    initialize() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechSynthesis = window.speechSynthesis;
        
        if (!SpeechRecognition) {
            console.error('[Voice Coding] ❌ Speech recognition not supported in this browser');
            this.emit('error', { message: 'Speech recognition not supported' });
            return false;
        }
        
        // Create recognition instance
        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.settings.language;
        this.recognition.continuous = this.settings.continuous;
        this.recognition.interimResults = this.settings.interimResults;
        this.recognition.maxAlternatives = this.settings.maxAlternatives;
        
        // Create synthesis instance
        this.synthesis = SpeechSynthesis;
        
        // Set up event handlers
        this.setupEventHandlers();
        
        console.log('[Voice Coding] ✅ Voice recognition initialized');
        console.log(`[Voice Coding] Language: ${this.settings.language}`);
        console.log(`[Voice Coding] Wake word: "${this.wakeWord}"`);
        
        this.emit('initialized');
        return true;
    }
    
    /**
     * Set up speech recognition event handlers
     */
    setupEventHandlers() {
        // Start event
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('[Voice Coding] 🎤 Listening started');
            this.emit('listening-started');
        };
        
        // Result event (interim and final)
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    
                    console.log(`[Voice Coding] 📝 Final: "${transcript}" (confidence: ${(confidence * 100).toFixed(1)}%)`);
                    
                    // Check for wake word
                    if (this.wakeWordEnabled && transcript.toLowerCase().includes(this.wakeWord)) {
                        console.log('[Voice Coding] 👂 Wake word detected!');
                        this.handleWakeUp();
                        this.speak('Yes, I\'m listening');
                        return;
                    }
                    
                    // Check for voice commands
                    const commandExecuted = this.checkVoiceCommands(transcript);
                    
                    if (!commandExecuted && confidence >= this.settings.confidenceThreshold) {
                        // Add to transcript
                        this.finalTranscript += (this.finalTranscript ? ' ' : '') + transcript;
                        
                        this.emit('transcript-final', {
                            transcript: this.finalTranscript,
                            confidence: confidence
                        });
                    }
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Emit interim results
            if (interimTranscript) {
                this.currentTranscript = interimTranscript;
                this.emit('transcript-interim', {
                    transcript: interimTranscript
                });
            }
        };
        
        // Error event
        this.recognition.onerror = (event) => {
            console.error('[Voice Coding] ❌ Recognition error:', event.error);
            this.emit('error', { error: event.error });
        };
        
        // End event
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('[Voice Coding] 🛑 Listening stopped');
            this.emit('listening-stopped');
            
            // Restart if continuous mode
            if (this.isContinuous) {
                setTimeout(() => {
                    this.startListening();
                }, 100);
            }
        };
    }
    
    /**
     * Start listening
     */
    startListening(continuous = false) {
        if (!this.recognition) {
            console.error('[Voice Coding] ❌ Voice recognition not initialized');
            return false;
        }
        
        if (this.isListening) {
            console.log('[Voice Coding] ⚠️ Already listening');
            return false;
        }
        
        this.isContinuous = continuous;
        this.currentTranscript = '';
        
        try {
            this.recognition.start();
            console.log('[Voice Coding] 🎤 Starting to listen...');
            return true;
        } catch (error) {
            console.error('[Voice Coding] ❌ Failed to start listening:', error);
            return false;
        }
    }
    
    /**
     * Stop listening
     */
    stopListening() {
        if (!this.recognition || !this.isListening) {
            return false;
        }
        
        this.isContinuous = false;
        this.recognition.stop();
        console.log('[Voice Coding] 🛑 Stopping listening...');
        return true;
    }
    
    /**
     * Toggle continuous listening
     */
    toggleContinuousListening() {
        if (this.isContinuous) {
            this.stopListening();
        } else {
            this.startListening(true);
        }
        
        return this.isContinuous;
    }
    
    /**
     * Check for voice commands in transcript
     */
    checkVoiceCommands(transcript) {
        const lowerTranscript = transcript.toLowerCase().trim();
        
        for (const [command, handler] of Object.entries(this.commands)) {
            if (lowerTranscript === command || lowerTranscript.endsWith(command)) {
                console.log(`[Voice Coding] 🎯 Command detected: "${command}"`);
                handler();
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Speak text using text-to-speech
     */
    speak(text, options = {}) {
        if (!this.settings.voiceFeedback || !this.synthesis) {
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.settings.language;
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        
        // Get available voices
        const voices = this.synthesis.getVoices();
        if (voices.length > 0) {
            // Try to find a natural-sounding voice
            const preferredVoice = voices.find(v => 
                v.lang === this.settings.language && 
                (v.name.includes('Google') || v.name.includes('Natural'))
            ) || voices[0];
            
            utterance.voice = preferredVoice;
        }
        
        utterance.onstart = () => {
            console.log(`[Voice Coding] 🔊 Speaking: "${text}"`);
        };
        
        utterance.onend = () => {
            console.log('[Voice Coding] 🔇 Speech finished');
        };
        
        this.synthesis.speak(utterance);
    }
    
    /**
     * Get current transcript
     */
    getTranscript() {
        return this.finalTranscript;
    }
    
    /**
     * Clear transcript
     */
    clearTranscript() {
        this.currentTranscript = '';
        this.finalTranscript = '';
        this.emit('transcript-cleared');
    }
    
    /**
     * Set language
     */
    setLanguage(languageCode) {
        this.settings.language = languageCode;
        
        if (this.recognition) {
            this.recognition.lang = languageCode;
        }
        
        console.log(`[Voice Coding] 🌐 Language changed to: ${languageCode}`);
        this.emit('language-changed', { language: languageCode });
    }
    
    /**
     * Set wake word
     */
    setWakeWord(wakeWord) {
        this.wakeWord = wakeWord.toLowerCase();
        console.log(`[Voice Coding] 👂 Wake word set to: "${this.wakeWord}"`);
    }
    
    /**
     * Toggle wake word
     */
    toggleWakeWord() {
        this.wakeWordEnabled = !this.wakeWordEnabled;
        console.log(`[Voice Coding] Wake word: ${this.wakeWordEnabled ? 'enabled' : 'disabled'}`);
        return this.wakeWordEnabled;
    }
    
    // ============================================================================
    // VOICE COMMAND HANDLERS
    // ============================================================================
    
    handleSendCommand() {
        console.log('[Voice Coding] 📤 Send command executed');
        this.emit('command-send', { transcript: this.finalTranscript });
    }
    
    handleClearCommand() {
        console.log('[Voice Coding] 🗑️ Clear command executed');
        this.clearTranscript();
        this.emit('command-clear');
    }
    
    handleNewFileCommand() {
        console.log('[Voice Coding] 📄 New file command executed');
        this.emit('command-new-file');
    }
    
    handleSaveFileCommand() {
        console.log('[Voice Coding] 💾 Save file command executed');
        this.emit('command-save-file');
    }
    
    handleRunCodeCommand() {
        console.log('[Voice Coding] ▶️ Run code command executed');
        this.emit('command-run-code');
    }
    
    handleWakeUp() {
        console.log('[Voice Coding] 👋 Wake up command executed');
        this.clearTranscript();
        this.emit('wake-up');
    }
    
    // ============================================================================
    // RENDER UI COMPONENT
    // ============================================================================
    
    /**
     * Render voice control UI
     */
    renderVoiceControls() {
        return `
            <div class="voice-controls" style="padding: 10px; background: rgba(0,0,0,0.2); border-radius: 4px; margin: 10px 0;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <button id="voice-toggle" 
                            class="voice-btn ${this.isListening ? 'active' : ''}"
                            onclick="voiceCoding.toggleListening()"
                            style="background: ${this.isListening ? '#f44' : 'var(--accent)'}; border: none; color: white; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        ${this.isListening ? '🔴 Stop' : '🎤 Voice Input'}
                    </button>
                    
                    <button class="voice-btn ${this.isContinuous ? 'active' : ''}"
                            onclick="voiceCoding.toggleContinuous()"
                            style="background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text); padding: 10px 15px; border-radius: 4px; cursor: pointer;">
                        ${this.isContinuous ? '🔁 Continuous ON' : '🔁 Continuous OFF'}
                    </button>
                    
                    <button class="voice-btn"
                            onclick="voiceCoding.toggleWakeWord()"
                            style="background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text); padding: 10px 15px; border-radius: 4px; cursor: pointer;">
                        ${this.wakeWordEnabled ? '👂 Wake: ON' : '👂 Wake: OFF'}
                    </button>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px;">
                    <select id="voice-language" 
                            onchange="voiceCoding.setLanguage(this.value)"
                            style="flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text); padding: 8px; border-radius: 4px;">
                        ${this.languages.map(lang => `
                            <option value="${lang.code}" ${this.settings.language === lang.code ? 'selected' : ''}>
                                ${lang.name}
                            </option>
                        `).join('')}
                    </select>
                    
                    <label style="display: flex; align-items: center; gap: 5px; font-size: 12px; cursor: pointer;">
                        <input type="checkbox" 
                               ${this.settings.voiceFeedback ? 'checked' : ''}
                               onchange="voiceCoding.toggleVoiceFeedback(this.checked)">
                        🔊 Voice Feedback
                    </label>
                </div>
                
                ${this.isListening ? `
                    <div style="margin-top: 10px; padding: 10px; background: rgba(0,152,255,0.1); border: 1px solid var(--accent); border-radius: 4px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="pulse" style="width: 10px; height: 10px; background: #f44; border-radius: 50%; animation: pulse 1s infinite;"></span>
                            <span style="font-weight: bold;">Listening...</span>
                        </div>
                        <div id="voice-transcript" style="margin-top: 8px; font-size: 13px; font-family: monospace;">
                            ${this.currentTranscript || this.finalTranscript || 'Say "Hey BigDaddy" or start speaking...'}
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-top: 10px; font-size: 11px; opacity: 0.6;">
                    💡 Say "send" to send message | "clear" to clear | "Hey BigDaddy" to activate
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                
                .voice-btn:hover {
                    opacity: 0.8;
                    transform: translateY(-1px);
                }
                
                .voice-btn.active {
                    box-shadow: 0 0 10px var(--accent);
                }
            </style>
        `;
    }
    
    /**
     * Toggle listening (for UI button)
     */
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    /**
     * Toggle continuous mode (for UI button)
     */
    toggleContinuous() {
        return this.toggleContinuousListening();
    }
    
    /**
     * Toggle voice feedback (for UI checkbox)
     */
    toggleVoiceFeedback(enabled) {
        this.settings.voiceFeedback = enabled;
        console.log(`[Voice Coding] Voice feedback: ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// ============================================================================
// INTEGRATION WITH AGENT PANEL
// ============================================================================

/**
 * Add voice input to agent panel's input area
 */
function integrateVoiceWithAgentPanel(agentPanel, voiceCoding) {
    // Listen for voice transcripts
    voiceCoding.on('transcript-final', ({ transcript, confidence }) => {
        // Add transcript to input field
        const input = document.getElementById('ai-input');
        if (input) {
            input.value = (input.value + ' ' + transcript).trim();
            
            // Trigger input event to update agent panel
            input.dispatchEvent(new Event('input'));
        }
    });
    
    // Listen for interim results (real-time display)
    voiceCoding.on('transcript-interim', ({ transcript }) => {
        const displayElement = document.getElementById('voice-transcript');
        if (displayElement) {
            displayElement.textContent = transcript;
        }
    });
    
    // Listen for send command
    voiceCoding.on('command-send', ({ transcript }) => {
        // Auto-send the message
        agentPanel.sendMessage();
        voiceCoding.clearTranscript();
        
        // Give voice feedback
        voiceCoding.speak('Message sent');
    });
    
    // Listen for clear command
    voiceCoding.on('command-clear', () => {
        const input = document.getElementById('ai-input');
        if (input) {
            input.value = '';
        }
        
        voiceCoding.speak('Cleared');
    });
    
    // Listen for wake-up
    voiceCoding.on('wake-up', () => {
        // Focus the input
        const input = document.getElementById('ai-input');
        if (input) {
            input.focus();
        }
    });
    
    console.log('[Voice Coding] ✅ Integrated with agent panel');
}

module.exports = {
    VoiceCodingEnhanced,
    integrateVoiceWithAgentPanel
};

