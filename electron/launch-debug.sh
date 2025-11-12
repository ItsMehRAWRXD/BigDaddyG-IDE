#!/bin/bash
# BigDaddyG IDE - Debug Launch Script
# Tests black screen fixes with maximum safety

echo "==============================================="
echo "  BigDaddyG IDE - DEBUG LAUNCH"
echo "==============================================="
echo ""

# Clear GPU cache
echo "[1/4] Clearing GPU cache..."
if [ -d "$HOME/.config/BigDaddyG IDE/GPUCache" ]; then
    rm -rf "$HOME/.config/BigDaddyG IDE/GPUCache"
    echo "   ✓ GPU cache cleared"
else
    echo "   ℹ No GPU cache found"
fi

# Clear main cache
echo "[2/4] Clearing main cache..."
if [ -d "$HOME/.config/BigDaddyG IDE/Cache" ]; then
    rm -rf "$HOME/.config/BigDaddyG IDE/Cache"
    echo "   ✓ Main cache cleared"
else
    echo "   ℹ No main cache found"
fi

echo "[3/4] Setting environment variables..."
export NODE_ENV=development
export ELECTRON_ENABLE_LOGGING=1
echo "   ✓ Logging enabled"

echo "[4/4] Launching with safety flags..."
echo ""
echo "FLAGS:"
echo "  • --disable-gpu"
echo "  • --disable-gpu-compositing"
echo "  • --disable-software-rasterizer"
echo "  • --no-sandbox"
echo "  • --disable-dev-shm-usage"
echo ""

cd "$(dirname "$0")"
npm start -- \
    --disable-gpu \
    --disable-gpu-compositing \
    --disable-software-rasterizer \
    --no-sandbox \
    --disable-dev-shm-usage \
    --enable-logging

echo ""
echo "==============================================="
echo "  Launch complete. Check for errors above."
echo "==============================================="
