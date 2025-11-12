/**
 * BigDaddyG IDE - State Machine
 * Generic state machine for game logic and UI states
 */

class StateMachine {
    constructor(initialState = null) {
        this.currentState = initialState;
        this.previousState = null;
        this.states = new Map();
        this.transitions = new Map();
        this.onStateChangeCallbacks = [];
        
        console.log('[StateMachine] Initialized');
    }
    
    /**
     * Add a state
     */
    addState(name, config = {}) {
        this.states.set(name, {
            name,
            onEnter: config.onEnter || (() => {}),
            onUpdate: config.onUpdate || (() => {}),
            onExit: config.onExit || (() => {}),
            data: config.data || {}
        });
    }
    
    /**
     * Add transition
     */
    addTransition(fromState, toState, condition = null) {
        const key = fromState;
        const transitions = this.transitions.get(key) || [];
        transitions.push({ toState, condition });
        this.transitions.set(key, transitions);
    }
    
    /**
     * Change state
     */
    changeState(newState, data = {}) {
        if (!this.states.has(newState)) {
            console.warn(`[StateMachine] State not found: ${newState}`);
            return false;
        }
        
        // Exit current state
        if (this.currentState) {
            const state = this.states.get(this.currentState);
            state.onExit(data);
        }
        
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // Enter new state
        const state = this.states.get(newState);
        state.onEnter(data);
        
        // Notify listeners
        this.onStateChangeCallbacks.forEach(callback => {
            callback(newState, this.previousState, data);
        });
        
        console.log(`[StateMachine] State changed: ${this.previousState} -> ${newState}`);
        return true;
    }
    
    /**
     * Update current state
     */
    update(deltaTime) {
        if (!this.currentState) return;
        
        const state = this.states.get(this.currentState);
        if (state && state.onUpdate) {
            state.onUpdate(deltaTime);
        }
        
        // Check transitions
        this.checkTransitions();
    }
    
    /**
     * Check for automatic transitions
     */
    checkTransitions() {
        if (!this.currentState) return;
        
        const transitions = this.transitions.get(this.currentState);
        if (!transitions) return;
        
        for (const transition of transitions) {
            if (!transition.condition || transition.condition()) {
                this.changeState(transition.toState);
                break;
            }
        }
    }
    
    /**
     * Get current state
     */
    getCurrentState() {
        return this.currentState;
    }
    
    /**
     * Get previous state
     */
    getPreviousState() {
        return this.previousState;
    }
    
    /**
     * Check if in state
     */
    isInState(stateName) {
        return this.currentState === stateName;
    }
    
    /**
     * Get state data
     */
    getStateData(stateName) {
        const state = this.states.get(stateName || this.currentState);
        return state ? state.data : null;
    }
    
    /**
     * Set state data
     */
    setStateData(stateName, data) {
        const state = this.states.get(stateName);
        if (state) {
            Object.assign(state.data, data);
        }
    }
    
    /**
     * Register state change callback
     */
    onStateChange(callback) {
        this.onStateChangeCallbacks.push(callback);
        return () => this.offStateChange(callback);
    }
    
    /**
     * Unregister state change callback
     */
    offStateChange(callback) {
        const index = this.onStateChangeCallbacks.indexOf(callback);
        if (index !== -1) {
            this.onStateChangeCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Reset to initial state
     */
    reset(initialState = null) {
        if (this.currentState) {
            const state = this.states.get(this.currentState);
            state.onExit({});
        }
        
        this.currentState = initialState;
        this.previousState = null;
        
        if (initialState) {
            const state = this.states.get(initialState);
            if (state) {
                state.onEnter({});
            }
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.StateMachine = StateMachine;
}

module.exports = StateMachine;
