#!/bin/bash
# BigDaddyG IDE - Universal Startup Script (Linux/Mac)
# This script handles everything needed to start the IDE

echo ""
echo "================================================================"
echo "   BigDaddyG IDE - Starting Up"
echo "================================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[1/5] Checking Node.js..."
node --version
npm --version
echo ""

echo "[2/5] Installing dependencies (if needed)..."
if [ ! -d "node_modules" ]; then
    echo "Installing packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies!"
        exit 1
    fi
else
    echo "Dependencies already installed."
fi
echo ""

echo "[3/5] Checking Ollama service..."
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "✓ Ollama is running"
else
    echo "⚠ Ollama is not running (optional - AI features will be limited)"
fi
echo ""

echo "[4/5] Starting BigDaddyG IDE..."
echo "================================================================"
echo ""
echo "The IDE will now launch with:"
echo "  • Auto-update check from GitHub"
echo "  • Full tab system (23+ tab types)"
echo "  • AI features (if Ollama is running)"
echo "  • Orchestra server on port 11441"
echo "  • Remote log server on port 11442"
echo ""
echo "To stop the IDE, close the window or press Ctrl+C"
echo ""
echo "================================================================"
echo ""

# Start the IDE
npm start

# If npm start fails, show error
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] IDE failed to start!"
    echo "Check the error messages above."
    echo ""
    exit 1
fi

echo ""
echo "IDE has closed."
