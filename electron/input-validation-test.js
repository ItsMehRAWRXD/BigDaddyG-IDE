/**
 * BigDaddyG IDE - Input Validation Test
 * Finds and tests ALL input boxes, textareas, chat boxes, and editable elements
 */

(function() {
'use strict';

console.log('[InputValidator] 🔍 Loading comprehensive input validation test...');

class InputValidationTest {
    constructor() {
        this.results = {
            total: 0,
            working: 0,
            broken: 0,
            details: []
        };
    }
    
    /**
     * Run comprehensive input validation
     */
    async runTest() {
        console.log('\n'.repeat(3));
        console.log('═'.repeat(80));
        console.log('🔍 COMPREHENSIVE INPUT VALIDATION TEST');
        console.log('═'.repeat(80));
        console.log('Testing ALL input boxes, textareas, and editable elements...');
        console.log('═'.repeat(80));
        console.log('\n');
        
        // Test all input types
        await this.testAllInputs();
        await this.testAllTextareas();
        await this.testContentEditables();
        await this.testChatInputs();
        await this.testTerminals();
        await this.testEditors();
        
        this.printReport();
        return this.results;
    }
    
    /**
     * Test all <input> elements
     */
    async testAllInputs() {
        console.log('📋 Testing <input> elements...');
        
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], input[type="url"], input:not([type])');
        
        for (const input of inputs) {
            await this.testInputElement(input, 'input');
        }
        
        console.log(`✓ Tested ${inputs.length} input elements\n`);
    }
    
    /**
     * Test all <textarea> elements
     */
    async testAllTextareas() {
        console.log('📝 Testing <textarea> elements...');
        
        const textareas = document.querySelectorAll('textarea');
        
        for (const textarea of textareas) {
            await this.testInputElement(textarea, 'textarea');
        }
        
        console.log(`✓ Tested ${textareas.length} textarea elements\n`);
    }
    
    /**
     * Test contenteditable elements
     */
    async testContentEditables() {
        console.log('✏️ Testing contenteditable elements...');
        
        const editables = document.querySelectorAll('[contenteditable="true"]');
        
        for (const editable of editables) {
            await this.testInputElement(editable, 'contenteditable');
        }
        
        console.log(`✓ Tested ${editables.length} contenteditable elements\n`);
    }
    
    /**
     * Test specific chat inputs
     */
    async testChatInputs() {
        console.log('💬 Testing chat input boxes...');
        
        const chatInputIds = [
            'floating-chat-input',
            'ai-input',
            'center-chat-input',
            'chat-input',
            'message-input'
        ];
        
        for (const id of chatInputIds) {
            const element = document.getElementById(id);
            if (element) {
                await this.testInputElement(element, `chat-input#${id}`);
            }
        }
        
        console.log(`✓ Tested chat inputs\n`);
    }
    
    /**
     * Test terminal elements
     */
    async testTerminals() {
        console.log('💻 Testing terminal elements...');
        
        // Find all terminals by class or id
        const terminals = document.querySelectorAll('[class*="terminal"], [id*="terminal"]');
        
        for (const terminal of terminals) {
            await this.testTerminalElement(terminal);
        }
        
        console.log(`✓ Tested ${terminals.length} terminal elements\n`);
    }
    
    /**
     * Test code editor elements
     */
    async testEditors() {
        console.log('📄 Testing code editors...');
        
        // Find all editor textareas
        const editors = document.querySelectorAll('textarea[id*="editor"], textarea[placeholder*="code"]');
        
        for (const editor of editors) {
            await this.testInputElement(editor, 'code-editor');
        }
        
        console.log(`✓ Tested ${editors.length} editor elements\n`);
    }
    
    /**
     * Test individual input element
     */
    async testInputElement(element, type) {
        this.results.total++;
        
        const result = {
            type,
            id: element.id || 'no-id',
            class: element.className || 'no-class',
            parent: this.getParentContext(element),
            visible: this.isVisible(element),
            enabled: !element.disabled && !element.readOnly,
            editable: false,
            focusable: false,
            keyboardWorks: false,
            issues: []
        };
        
        // Test visibility
        if (!result.visible) {
            result.issues.push('❌ Element is hidden or has display:none');
        }
        
        // Test if disabled/readonly
        if (!result.enabled) {
            result.issues.push('❌ Element is disabled or readonly');
        }
        
        // Test if element can receive focus
        try {
            element.focus();
            result.focusable = document.activeElement === element;
            if (!result.focusable) {
                result.issues.push('❌ Cannot receive focus');
            }
        } catch (err) {
            result.issues.push(`❌ Focus error: ${err.message}`);
        }
        
        // Test if we can type into it
        if (result.focusable) {
            try {
                const originalValue = element.value || element.textContent || '';
                const testText = 'TEST_INPUT_123';
                
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    element.value = testText;
                    result.editable = element.value === testText;
                    element.value = originalValue; // Restore
                } else {
                    element.textContent = testText;
                    result.editable = element.textContent === testText;
                    element.textContent = originalValue; // Restore
                }
                
                if (!result.editable) {
                    result.issues.push('❌ Cannot modify content');
                }
            } catch (err) {
                result.issues.push(`❌ Edit error: ${err.message}`);
            }
            
            // Test keyboard events
            try {
                let keyEventFired = false;
                const handler = () => { keyEventFired = true; };
                
                element.addEventListener('keydown', handler);
                element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
                element.removeEventListener('keydown', handler);
                
                result.keyboardWorks = keyEventFired;
                if (!result.keyboardWorks) {
                    result.issues.push('⚠️ Keyboard events may not fire');
                }
            } catch (err) {
                result.issues.push(`⚠️ Keyboard test error: ${err.message}`);
            }
        }
        
        // Determine if working or broken
        const isWorking = result.visible && result.enabled && result.focusable && result.editable;
        
        if (isWorking) {
            this.results.working++;
            console.log(`  ✅ ${type} - ${result.id || result.class} - WORKING`);
        } else {
            this.results.broken++;
            console.log(`  ❌ ${type} - ${result.id || result.class} - BROKEN`);
            result.issues.forEach(issue => console.log(`     ${issue}`));
        }
        
        this.results.details.push(result);
    }
    
    /**
     * Test terminal element (special case)
     */
    async testTerminalElement(element) {
        this.results.total++;
        
        const result = {
            type: 'terminal',
            id: element.id || 'no-id',
            class: element.className || 'no-class',
            parent: this.getParentContext(element),
            visible: this.isVisible(element),
            hasInput: false,
            interactive: false,
            issues: []
        };
        
        // Check if terminal has an input element
        const terminalInput = element.querySelector('input, textarea');
        if (terminalInput) {
            result.hasInput = true;
            // Test that input
            await this.testInputElement(terminalInput, 'terminal-input');
        } else {
            result.issues.push('❌ No input element found in terminal');
        }
        
        // Check if terminal is contenteditable
        if (element.contentEditable === 'true') {
            result.interactive = true;
        } else {
            result.issues.push('⚠️ Terminal is not contenteditable');
        }
        
        // Check for keyboard event listeners
        const hasKeyListeners = this.hasKeyboardListeners(element);
        if (!hasKeyListeners) {
            result.issues.push('⚠️ No keyboard event listeners detected');
        }
        
        const isWorking = result.visible && (result.hasInput || result.interactive);
        
        if (isWorking) {
            this.results.working++;
            console.log(`  ✅ Terminal - ${result.id} - WORKING`);
        } else {
            this.results.broken++;
            console.log(`  ❌ Terminal - ${result.id} - BROKEN`);
            result.issues.forEach(issue => console.log(`     ${issue}`));
        }
        
        this.results.details.push(result);
    }
    
    /**
     * Check if element is visible
     */
    isVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetParent !== null;
    }
    
    /**
     * Get parent context (tab, panel, etc.)
     */
    getParentContext(element) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.id && (parent.id.includes('tab') || parent.id.includes('panel') || parent.id.includes('content'))) {
                return parent.id;
            }
            parent = parent.parentElement;
        }
        return 'unknown';
    }
    
    /**
     * Check if element has keyboard event listeners
     */
    hasKeyboardListeners(element) {
        // This is a heuristic - we can't directly inspect event listeners
        // But we can check if the element or its children have keydown/keypress handlers
        const hasKeydownAttr = element.hasAttribute('onkeydown') || element.hasAttribute('onkeypress');
        return hasKeydownAttr;
    }
    
    /**
     * Print comprehensive report
     */
    printReport() {
        console.log('\n' + '═'.repeat(80));
        console.log('📊 INPUT VALIDATION REPORT');
        console.log('═'.repeat(80));
        console.log(`Total Elements Tested: ${this.results.total}`);
        console.log(`✅ Working: ${this.results.working}`);
        console.log(`❌ Broken: ${this.results.broken}`);
        console.log(`📈 Success Rate: ${((this.results.working / this.results.total) * 100).toFixed(1)}%`);
        console.log('═'.repeat(80));
        
        // List all broken elements
        if (this.results.broken > 0) {
            console.log('\n❌ BROKEN ELEMENTS:');
            console.log('─'.repeat(80));
            
            const brokenElements = this.results.details.filter(d => {
                return !d.visible || !d.enabled || !d.focusable || !d.editable;
            });
            
            brokenElements.forEach(elem => {
                console.log(`\n🔴 ${elem.type} - ${elem.id || elem.class}`);
                console.log(`   Parent: ${elem.parent}`);
                console.log(`   Visible: ${elem.visible ? '✓' : '✗'}`);
                console.log(`   Enabled: ${elem.enabled ? '✓' : '✗'}`);
                console.log(`   Focusable: ${elem.focusable ? '✓' : '✗'}`);
                console.log(`   Editable: ${elem.editable ? '✓' : '✗'}`);
                if (elem.issues.length > 0) {
                    console.log('   Issues:');
                    elem.issues.forEach(issue => console.log(`     ${issue}`));
                }
            });
        }
        
        console.log('\n' + '═'.repeat(80));
        console.log('🔍 Test complete! Check console for details.');
        console.log('═'.repeat(80));
    }
}

// Expose globally
window.InputValidationTest = InputValidationTest;

// Expose easy test runner
window.testAllInputs = async function() {
    const tester = new InputValidationTest();
    return await tester.runTest();
};

console.log('[InputValidator] ✅ Input validation test loaded');
console.log('[InputValidator] 🚀 Run: window.testAllInputs()');

})();
