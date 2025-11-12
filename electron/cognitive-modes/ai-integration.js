/**
 * BigDaddyG IDE - Cognitive Mode AI Integration
 * 
 * Integrates cognitive modes with AI system
 * Adjusts AI behavior based on enabled modes
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

class CognitiveAIIntegration {
    constructor(modeManager, aiSystem) {
        this.modeManager = modeManager;
        this.aiSystem = aiSystem;
        
        this.setupListeners();
        
        console.log('[CognitiveAI] ✅ AI integration initialized');
    }

    /**
     * Setup event listeners
     */
    setupListeners() {
        // Listen for mode changes
        this.modeManager.on('modeToggled', (data) => {
            this.onModeChanged(data);
        });

        this.modeManager.on('weightChanged', (data) => {
            this.onWeightChanged(data);
        });

        this.modeManager.on('allModesEnabled', () => {
            this.updateAIConfig();
        });

        this.modeManager.on('allModesDisabled', () => {
            this.updateAIConfig();
        });

        this.modeManager.on('presetLoaded', (data) => {
            this.updateAIConfig();
            console.log(`[CognitiveAI] 📦 AI config updated for preset: ${data.preset}`);
        });
    }

    /**
     * Handle mode change
     */
    onModeChanged(data) {
        console.log(`[CognitiveAI] 🔄 Mode ${data.mode}: ${data.enabled ? 'ON' : 'OFF'}`);
        this.updateAIConfig();
    }

    /**
     * Handle weight change
     */
    onWeightChanged(data) {
        console.log(`[CognitiveAI] ⚖️ Mode ${data.mode} weight: ${data.weight}`);
        this.updateAIConfig();
    }

    /**
     * Update AI configuration
     */
    updateAIConfig() {
        const config = this.modeManager.getAIConfig();
        
        // Update AI system parameters
        if (this.aiSystem) {
            // Thinking mode affects reasoning depth
            if (config.modes.thinking) {
                this.aiSystem.setParameter('reasoning_depth', 3 * config.weights.thinking);
                this.aiSystem.setParameter('analysis_enabled', true);
            } else {
                this.aiSystem.setParameter('reasoning_depth', 1);
                this.aiSystem.setParameter('analysis_enabled', false);
            }

            // Search mode affects information retrieval
            if (config.modes.search) {
                this.aiSystem.setParameter('search_enabled', true);
                this.aiSystem.setParameter('context_expansion', true);
                this.aiSystem.setParameter('search_weight', config.weights.search);
            } else {
                this.aiSystem.setParameter('search_enabled', false);
                this.aiSystem.setParameter('context_expansion', false);
            }

            // Planning mode affects task decomposition
            if (config.modes.planning) {
                this.aiSystem.setParameter('task_planning', true);
                this.aiSystem.setParameter('dependency_tracking', true);
                this.aiSystem.setParameter('planning_weight', config.weights.planning);
            } else {
                this.aiSystem.setParameter('task_planning', false);
                this.aiSystem.setParameter('dependency_tracking', false);
            }

            // Reflect mode affects self-assessment
            if (config.modes.reflect) {
                this.aiSystem.setParameter('self_assessment', true);
                this.aiSystem.setParameter('quality_checking', true);
                this.aiSystem.setParameter('reflection_weight', config.weights.reflect);
            } else {
                this.aiSystem.setParameter('self_assessment', false);
                this.aiSystem.setParameter('quality_checking', false);
            }

            // Learn mode affects adaptation
            if (config.modes.learn) {
                this.aiSystem.setParameter('learning_enabled', true);
                this.aiSystem.setParameter('pattern_recognition', true);
                this.aiSystem.setParameter('learning_weight', config.weights.learn);
            } else {
                this.aiSystem.setParameter('learning_enabled', false);
                this.aiSystem.setParameter('pattern_recognition', false);
            }

            console.log('[CognitiveAI] 🤖 AI configuration updated:', config);
        }
    }

    /**
     * Generate prompt with mode context
     */
    enhancePrompt(basePrompt, context = {}) {
        const modes = this.modeManager.getEnabledModes();
        const config = this.modeManager.getAIConfig();
        
        let enhancedPrompt = basePrompt;
        
        // Add mode instructions
        const modeInstructions = [];
        
        if (modes.thinking) {
            modeInstructions.push('Think deeply and analyze the problem thoroughly.');
        }
        
        if (modes.search) {
            modeInstructions.push('Search for relevant information and context.');
        }
        
        if (modes.planning) {
            modeInstructions.push('Break down the task into steps and plan the approach.');
        }
        
        if (modes.reflect) {
            modeInstructions.push('Reflect on the solution quality and potential improvements.');
        }
        
        if (modes.learn) {
            modeInstructions.push('Learn from patterns and adapt the approach.');
        }

        if (modeInstructions.length > 0) {
            enhancedPrompt += '\n\nCognitive Modes Active:\n' + modeInstructions.join('\n');
        }

        // Add weight information for prioritization
        const weights = config.weights;
        if (Object.keys(weights).length > 0) {
            enhancedPrompt += '\n\nMode Priorities: ' + JSON.stringify(weights);
        }

        return enhancedPrompt;
    }

    /**
     * Process AI response with mode filtering
     */
    processResponse(response, context = {}) {
        const modes = this.modeManager.getEnabledModes();
        
        let processed = {
            original: response,
            thinking: null,
            search: null,
            planning: null,
            reflection: null,
            learning: null
        };

        // Extract thinking if mode enabled
        if (modes.thinking) {
            processed.thinking = this.extractThinking(response);
        }

        // Extract search results if mode enabled
        if (modes.search) {
            processed.search = this.extractSearchResults(response);
        }

        // Extract planning if mode enabled
        if (modes.planning) {
            processed.planning = this.extractPlan(response);
        }

        // Extract reflection if mode enabled
        if (modes.reflect) {
            processed.reflection = this.extractReflection(response);
        }

        // Extract learning insights if mode enabled
        if (modes.learn) {
            processed.learning = this.extractLearning(response);
        }

        return processed;
    }

    /**
     * Extract thinking content
     */
    extractThinking(response) {
        // Look for thinking patterns
        const patterns = [
            /(?:thinking|reasoning|analysis):?\s*(.*)/gi,
            /let me think.*?:(.*)/gi,
            /analyzing.*?:(.*)/gi
        ];

        for (const pattern of patterns) {
            const match = response.match(pattern);
            if (match) {
                return match.map(m => m.trim());
            }
        }

        return null;
    }

    /**
     * Extract search results
     */
    extractSearchResults(response) {
        // Look for search/reference patterns
        const patterns = [
            /(?:found|searched|reference):?\s*(.*)/gi,
            /according to.*?:(.*)/gi,
            /documentation.*?:(.*)/gi
        ];

        for (const pattern of patterns) {
            const match = response.match(pattern);
            if (match) {
                return match.map(m => m.trim());
            }
        }

        return null;
    }

    /**
     * Extract planning content
     */
    extractPlan(response) {
        // Look for planning patterns
        const patterns = [
            /(?:step|phase|stage)\s+\d+:?\s*(.*)/gi,
            /plan:?\s*(.*)/gi,
            /(?:first|next|then|finally).*?:(.*)/gi
        ];

        const steps = [];
        for (const pattern of patterns) {
            const matches = response.matchAll(pattern);
            for (const match of matches) {
                steps.push(match[1].trim());
            }
        }

        return steps.length > 0 ? steps : null;
    }

    /**
     * Extract reflection content
     */
    extractReflection(response) {
        // Look for reflection patterns
        const patterns = [
            /(?:reflection|assessment|review):?\s*(.*)/gi,
            /(?:quality|improvement|better):?\s*(.*)/gi,
            /could be improved.*?:(.*)/gi
        ];

        for (const pattern of patterns) {
            const match = response.match(pattern);
            if (match) {
                return match.map(m => m.trim());
            }
        }

        return null;
    }

    /**
     * Extract learning insights
     */
    extractLearning(response) {
        // Look for learning patterns
        const patterns = [
            /(?:learned|discovered|insight):?\s*(.*)/gi,
            /pattern.*?:(.*)/gi,
            /note that.*?:(.*)/gi
        ];

        for (const pattern of patterns) {
            const match = response.match(pattern);
            if (match) {
                return match.map(m => m.trim());
            }
        }

        return null;
    }

    /**
     * Get mode statistics for AI
     */
    getAIStats() {
        return {
            enabled_modes: Object.keys(this.modeManager.getEnabledModes()),
            total_modes: Object.keys(this.modeManager.getAllModes()).length,
            config: this.modeManager.getAIConfig(),
            statistics: this.modeManager.getStatistics()
        };
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CognitiveAIIntegration;
}
