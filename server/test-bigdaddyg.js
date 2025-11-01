// Test BigDaddyG Trained Model

const http = require('http');

async function testBigDaddyG() {
    console.log('🧪 Testing BigDaddyG Trained Model...\n');
    
    const tests = [
        {
            name: '🔧 Assembly Test',
            prompt: 'Write x86 assembly for XOR encryption'
        },
        {
            name: '🔐 Security Test',
            prompt: 'How do I encrypt passwords securely?'
        },
        {
            name: '🌀 Polymorphic Test',
            prompt: 'Show me polymorphic encryption'
        },
        {
            name: '🔍 Reverse Engineering Test',
            prompt: 'How do I reverse engineer a binary?'
        },
        {
            name: '💬 General Test',
            prompt: 'What can you do?'
        }
    ];
    
    for (const test of tests) {
        console.log('═'.repeat(80));
        console.log(test.name);
        console.log('═'.repeat(80));
        console.log(`📝 Prompt: "${test.prompt}"\n`);
        
        try {
            const response = await queryModel(test.prompt);
            console.log('✅ Response received:\n');
            console.log(response.substring(0, 500) + '...\n');
            console.log(`📊 Length: ${response.length} chars`);
            console.log(`🎯 Source: ${response.includes('Trained on') ? 'TRAINED MODEL' : 'Unknown'}`);
            console.log('\n');
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
        
        // Delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('═'.repeat(80));
    console.log('✅ ALL TESTS COMPLETE!');
    console.log('═'.repeat(80));
}

function queryModel(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: 'BigDaddyG:Latest',
            prompt: prompt,
            stream: false
        });
        
        const options = {
            hostname: 'localhost',
            port: 11441,
            path: '/api/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result.response);
                    }
                } catch (e) {
                    reject(new Error('Parse error: ' + e.message));
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Run tests
testBigDaddyG().then(() => {
    console.log('\n🎉 Testing complete! BigDaddyG is TRAINED and READY!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});

