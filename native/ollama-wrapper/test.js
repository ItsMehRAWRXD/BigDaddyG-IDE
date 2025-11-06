/**
 * Test script for BigDaddyG Native Ollama Wrapper
 */

const nativeOllama = require('./index');

async function runTests() {
    console.log('🧪 BigDaddyG Native Ollama - Test Suite\n');
    
    // Test 1: Check availability
    console.log('Test 1: Check if native module is available');
    const available = nativeOllama.isAvailable();
    console.log(`  Result: ${available ? '✅ Available' : '❌ Not available'}\n`);
    
    if (!available) {
        console.log('⚠️  Native module not built. Run "npm install" first.');
        return;
    }
    
    // Test 2: Initialize
    console.log('Test 2: Initialize Ollama');
    const initialized = await nativeOllama.init();
    console.log(`  Result: ${initialized ? '✅ Initialized' : '❌ Failed'}\n`);
    
    if (!initialized) {
        console.log('❌ Initialization failed. Cannot continue tests.');
        return;
    }
    
    // Test 3: List models
    console.log('Test 3: List available models');
    const models = await nativeOllama.listModels();
    console.log(`  Found ${models.length} models:`);
    models.forEach(model => {
        const sizeMB = (model.size / 1024 / 1024).toFixed(0);
        console.log(`    - ${model.name} (${sizeMB} MB)`);
    });
    console.log();
    
    // Test 4: Generate response
    console.log('Test 4: Generate AI response');
    try {
        const startTime = Date.now();
        const response = await nativeOllama.generate(
            'deepseek-r1:1.5b',
            'Write a hello world program in Python'
        );
        const endTime = Date.now();
        
        console.log(`  ✅ Success!`);
        console.log(`  Content: ${response.content.substring(0, 100)}...`);
        console.log(`  Tokens: ${response.tokens}`);
        console.log(`  Speed: ${response.tokensPerSecond} tok/s`);
        console.log(`  Time: ${response.time}s (measured: ${(endTime - startTime) / 1000}s)`);
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
    }
    console.log();
    
    // Test 5: Check stats
    console.log('Test 5: Get stats');
    const stats = nativeOllama.getStats();
    console.log(`  Available: ${stats.available}`);
    console.log(`  Initialized: ${stats.initialized}`);
    console.log(`  Fallback enabled: ${stats.fallbackEnabled}`);
    console.log();
    
    // Test 6: Cleanup
    console.log('Test 6: Cleanup');
    nativeOllama.cleanup();
    console.log('  ✅ Cleanup complete\n');
    
    console.log('🎉 All tests complete!');
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});

