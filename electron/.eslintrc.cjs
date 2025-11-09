module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2021: true
    },
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        monaco: 'readonly'
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        'build-resources/',
        'BigDaddyG-AI-Bundle/'
    ],
    rules: {}
};

