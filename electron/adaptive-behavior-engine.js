/**
 * BigDaddyG IDE - Adaptive Behavior Engine
 * Learns from user behavior and adapts IDE features
 */

class AdaptiveBehaviorEngine {
    constructor() {
        this.userPatterns = new Map();
        this.suggestions = [];
        this.learningEnabled = true;
        
        console.log('[AdaptiveBehaviorEngine] Initialized');
    }
    
    /**
     * Track user action
     */
    trackAction(action, context = {}) {
        if (!this.learningEnabled) return;
        
        const key = `${action}-${context.file || 'global'}`;
        const pattern = this.userPatterns.get(key) || {
            action,
            context,
            count: 0,
            lastUsed: null,
            frequency: 0
        };
        
        pattern.count++;
        pattern.lastUsed = Date.now();
        pattern.frequency = this.calculateFrequency(pattern);
        
        this.userPatterns.set(key, pattern);
        this.generateSuggestions();
    }
    
    /**
     * Calculate action frequency
     */
    calculateFrequency(pattern) {
        const hoursSinceFirst = (Date.now() - (pattern.lastUsed || Date.now())) / (1000 * 60 * 60);
        return pattern.count / Math.max(1, hoursSinceFirst);
    }
    
    /**
     * Generate adaptive suggestions
     */
    generateSuggestions() {
        this.suggestions = [];
        
        // Find frequently used actions
        const patterns = Array.from(this.userPatterns.values())
            .filter(p => p.count >= 3)
            .sort((a, b) => b.frequency - a.frequency);
        
        // Suggest keyboard shortcuts
        patterns.slice(0, 5).forEach(pattern => {
            if (!pattern.hasKeyboardShortcut) {
                this.suggestions.push({
                    type: 'keyboard-shortcut',
                    message: `Assign keyboard shortcut to "${pattern.action}"?`,
                    action: pattern.action
                });
            }
        });
        
        // Suggest auto-complete
        const filePatterns = Array.from(this.userPatterns.values())
            .filter(p => p.action === 'open-file');
        
        if (filePatterns.length > 10) {
            this.suggestions.push({
                type: 'autocomplete',
                message: 'Enable file path auto-completion?',
                action: 'enable-file-autocomplete'
            });
        }
        
        // Suggest workspace layout
        const layoutActions = Array.from(this.userPatterns.values())
            .filter(p => p.action.includes('panel') || p.action.includes('sidebar'));
        
        if (layoutActions.length > 20) {
            this.suggestions.push({
                type: 'workspace',
                message: 'Save current workspace layout as default?',
                action: 'save-workspace-layout'
            });
        }
    }
    
    /**
     * Get suggestions
     */
    getSuggestions() {
        return this.suggestions;
    }
    
    /**
     * Apply suggestion
     */
    applySuggestion(suggestion) {
        console.log(`[AdaptiveBehaviorEngine] Applying suggestion: ${suggestion.type}`);
        // Implementation would apply the suggested change
        return true;
    }
    
    /**
     * Predict next action
     */
    predictNextAction(currentContext) {
        const recentPatterns = Array.from(this.userPatterns.values())
            .filter(p => Date.now() - p.lastUsed < 60000) // Last minute
            .sort((a, b) => b.lastUsed - a.lastUsed);
        
        if (recentPatterns.length > 0) {
            return recentPatterns[0].action;
        }
        
        return null;
    }
    
    /**
     * Adapt UI based on usage
     */
    adaptUI() {
        const adaptations = {
            quickAccess: [],
            hideFeatures: [],
            reorderMenu: []
        };
        
        // Find most used features
        const topFeatures = Array.from(this.userPatterns.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        adaptations.quickAccess = topFeatures.map(f => f.action);
        
        // Find unused features
        const allActions = Array.from(this.userPatterns.values());
        const unusedFeatures = allActions
            .filter(a => a.count === 0 && Date.now() - a.lastUsed > 7 * 24 * 60 * 60 * 1000)
            .map(a => a.action);
        
        adaptations.hideFeatures = unusedFeatures;
        
        return adaptations;
    }
}

module.exports = AdaptiveBehaviorEngine;
