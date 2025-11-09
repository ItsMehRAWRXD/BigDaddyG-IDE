#!/bin/bash

echo ""
echo "========================================"
echo "  BigDaddyG IDE - Professional Edition"
echo "========================================"
echo ""
echo "Starting IDE with all features..."
echo "- YouTube Browser Integration"
echo "- AI-Powered Coding Assistant"
echo "- Multi-Agent Swarm Engine"
echo "- System Optimization"
echo "- 200+ Professional Features"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Check if Monaco Editor is installed
if [ ! -d "node_modules/monaco-editor" ]; then
    echo "Installing Monaco Editor..."
    npm install monaco-editor
    echo ""
fi

# Check if Electron is installed
if [ ! -d "node_modules/electron" ]; then
    echo "Installing Electron..."
    npm install electron --save-dev
    echo ""
fi

echo "Launching BigDaddyG IDE..."
echo ""

# Start the IDE
npx electron main.js

echo ""
echo "IDE closed."