/**
 * Visual Code Flow Mapper
 * Revolutionary: AI analyzes code and generates interactive flowcharts
 * Shows execution paths, loops, conditions, and complexity hotspots
 */

class VisualCodeFlowMapper {
    constructor(editor) {
        this.editor = editor;
        this.flowWindow = null;
        this.currentFlow = null;
        this.canvas = null;
        this.ctx = null;
        
        console.log('[FlowMapper] 🗺️ Visual Code Flow Mapper initialized');
    }
    
    // ========================================================================
    // FLOW MAPPER PANEL
    // ========================================================================
    
    createFlowPanel() {
        const panel = document.createElement('div');
        panel.id = 'visual-flow-panel';
        panel.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            height: 90vh;
            background: rgba(10, 10, 30, 0.98);
            backdrop-filter: blur(20px);
            border: 2px solid var(--purple);
            border-radius: 15px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 80px rgba(168, 85, 247, 0.5);
        `;
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="padding: 20px; background: rgba(0, 0, 0, 0.5); border-bottom: 2px solid var(--purple); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0 0 5px 0; color: var(--purple); font-size: 20px;">🗺️ AI Code Flow Mapper</h2>
                    <p style="margin: 0; color: #888; font-size: 12px;">Visual analysis of code execution paths and complexity</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.visualFlowMapper.analyzeCode()" style="background: var(--purple); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">🔄 Re-analyze</button>
                    <button onclick="window.visualFlowMapper.exportFlow()" style="background: rgba(0, 212, 255, 0.2); border: 1px solid var(--cyan); color: var(--cyan); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">💾 Export PNG</button>
                    <button onclick="window.visualFlowMapper.closePanel()" style="background: rgba(255, 71, 87, 0.2); border: 1px solid var(--red); color: var(--red); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">✕ Close</button>
                </div>
            </div>
            
            <!-- Main Content -->
            <div style="flex: 1; display: flex; overflow: hidden;">
                <!-- Canvas Area -->
                <div style="flex: 1; position: relative; overflow: auto; background: rgba(0, 0, 0, 0.3);" id="flow-canvas-container">
                    <canvas id="flow-canvas" style="display: block; cursor: move;"></canvas>
                    <div id="flow-loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--purple);">
                        <div style="font-size: 48px; margin-bottom: 20px;">🧠</div>
                        <div style="font-size: 16px; font-weight: bold;">AI is analyzing your code...</div>
                        <div style="font-size: 12px; color: #888; margin-top: 10px;">Mapping execution flows and complexity</div>
                    </div>
                </div>
                
                <!-- Side Panel -->
                <div style="width: 320px; background: rgba(0, 0, 0, 0.5); border-left: 1px solid rgba(168, 85, 247, 0.3); overflow-y: auto; padding: 20px;">
                    <h3 style="color: var(--purple); font-size: 14px; margin-bottom: 15px;">📊 Flow Analysis</h3>
                    
                    <div id="flow-stats" style="font-size: 12px;">
                        <div class="flow-stat">
                            <span style="color: #888;">Total Functions:</span>
                            <span style="color: var(--cyan); font-weight: bold;" id="stat-functions">0</span>
                        </div>
                        <div class="flow-stat">
                            <span style="color: #888;">Decision Points:</span>
                            <span style="color: var(--orange); font-weight: bold;" id="stat-decisions">0</span>
                        </div>
                        <div class="flow-stat">
                            <span style="color: #888;">Loop Structures:</span>
                            <span style="color: var(--purple); font-weight: bold;" id="stat-loops">0</span>
                        </div>
                        <div class="flow-stat">
                            <span style="color: #888;">Complexity Score:</span>
                            <span style="color: var(--red); font-weight: bold;" id="stat-complexity">0</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(168, 85, 247, 0.3);">
                        <h3 style="color: var(--purple); font-size: 14px; margin-bottom: 15px;">🎨 Visualization</h3>
                        
                        <label style="display: block; margin-bottom: 12px; color: #ccc; font-size: 12px;">
                            <input type="checkbox" id="flow-show-loops" checked onchange="window.visualFlowMapper.updateDisplay()"> Show Loops
                        </label>
                        <label style="display: block; margin-bottom: 12px; color: #ccc; font-size: 12px;">
                            <input type="checkbox" id="flow-show-complexity" checked onchange="window.visualFlowMapper.updateDisplay()"> Show Complexity
                        </label>
                        <label style="display: block; margin-bottom: 12px; color: #ccc; font-size: 12px;">
                            <input type="checkbox" id="flow-show-paths" checked onchange="window.visualFlowMapper.updateDisplay()"> Show All Paths
                        </label>
                        <label style="display: block; margin-bottom: 12px; color: #ccc; font-size: 12px;">
                            <input type="checkbox" id="flow-animate" onchange="window.visualFlowMapper.toggleAnimation()"> Animate Flow
                        </label>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(168, 85, 247, 0.3);">
                        <h3 style="color: var(--purple); font-size: 14px; margin-bottom: 15px;">⚠️ Hotspots</h3>
                        <div id="flow-hotspots" style="font-size: 11px; color: #888;">
                            No complexity hotspots detected
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .flow-stat {
                display: flex;
                justify-content: space-between;
                padding: 8px 12px;
                background: rgba(168, 85, 247, 0.1);
                border-radius: 5px;
                margin-bottom: 8px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(panel);
        this.flowWindow = panel;
        
        // Initialize canvas
        this.canvas = document.getElementById('flow-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        const container = document.getElementById('flow-canvas-container');
        this.canvas.width = container.clientWidth || 1200;
        this.canvas.height = container.clientHeight || 800;
        
        // Add drag support
        this.setupCanvasDrag();
        
        // Start analysis
        this.analyzeCode();
        
        console.log('[FlowMapper] ✅ Flow panel created');
    }
    
    // ========================================================================
    // AI CODE ANALYSIS
    // ========================================================================
    
    async analyzeCode() {
        const code = this.editor.getValue();
        const language = this.detectLanguage();
        
        console.log('[FlowMapper] 🧠 Analyzing code flow...');
        
        // Show loading
        document.getElementById('flow-loading').style.display = 'block';
        
        try {
            // First: Parse code structure locally
            const structure = this.parseCodeStructure(code, language);
            
            // Second: Get AI insights
            const response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Analyze this ${language} code and provide:
1. List all functions and their relationships
2. Identify all conditional branches (if/else/switch)
3. Identify all loops (for/while)
4. Calculate cyclomatic complexity
5. Find potential infinite loops or performance issues

Code:
${code}

Respond in JSON format.`,
                    model: 'BigDaddyG:Code'
                })
            });
            
            const data = await response.json();
            const aiAnalysis = this.parseAIResponse(data.response);
            
            // Combine local parsing + AI insights
            this.currentFlow = {
                ...structure,
                ...aiAnalysis,
                language
            };
            
            // Draw the flow
            this.drawFlow();
            
            // Update stats
            this.updateStats();
            
            // Hide loading
            document.getElementById('flow-loading').style.display = 'none';
            
            console.log('[FlowMapper] ✅ Analysis complete');
            
        } catch (error) {
            console.error('[FlowMapper] ❌ Analysis error:', error);
            document.getElementById('flow-loading').innerHTML = `
                <div style="color: var(--red); font-size: 16px;">❌ Analysis Failed</div>
                <div style="color: #888; font-size: 12px; margin-top: 10px;">${error.message}</div>
            `;
        }
    }
    
    parseCodeStructure(code, language) {
        const structure = {
            functions: [],
            decisions: [],
            loops: [],
            complexity: 1
        };
        
        // Parse functions
        const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)|(\w+)\s*=\s*\(([^)]*)\)\s*=>/g;
        let match;
        while ((match = funcRegex.exec(code)) !== null) {
            structure.functions.push({
                name: match[1] || match[3] || 'anonymous',
                params: match[2] || match[4] || '',
                line: code.substring(0, match.index).split('\n').length
            });
        }
        
        // Parse decisions (if, else, switch, case, ternary)
        const decisionRegex = /\b(if|else|switch|case|\?)\b/g;
        while ((match = decisionRegex.exec(code)) !== null) {
            structure.decisions.push({
                type: match[1],
                line: code.substring(0, match.index).split('\n').length
            });
            structure.complexity++;
        }
        
        // Parse loops
        const loopRegex = /\b(for|while|do)\b/g;
        while ((match = loopRegex.exec(code)) !== null) {
            structure.loops.push({
                type: match[1],
                line: code.substring(0, match.index).split('\n').length
            });
            structure.complexity++;
        }
        
        return structure;
    }
    
    parseAIResponse(response) {
        // Try to extract JSON from AI response
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('[FlowMapper] Could not parse AI JSON, using fallback');
        }
        
        return {
            hotspots: [],
            suggestions: []
        };
    }
    
    // ========================================================================
    // VISUALIZATION
    // ========================================================================
    
    drawFlow() {
        if (!this.currentFlow) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        this.drawGrid();
        
        // Calculate layout
        const nodes = this.layoutNodes();
        
        // Draw connections first
        this.drawConnections(nodes);
        
        // Draw nodes
        this.drawNodes(nodes);
        
        // Draw legend
        this.drawLegend();
    }
    
    drawGrid() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    layoutNodes() {
        const nodes = [];
        const startX = 100;
        const startY = 80;
        const verticalSpacing = 120;
        const horizontalSpacing = 250;
        
        // Start node
        nodes.push({
            id: 'start',
            type: 'start',
            x: this.canvas.width / 2,
            y: startY,
            label: 'START',
            color: '#00ff88'
        });
        
        let currentY = startY + verticalSpacing;
        
        // Function nodes
        this.currentFlow.functions.forEach((func, i) => {
            const x = startX + (i % 3) * horizontalSpacing;
            const y = currentY + Math.floor(i / 3) * verticalSpacing;
            
            nodes.push({
                id: `func-${i}`,
                type: 'function',
                x,
                y,
                label: func.name,
                sublabel: `(${func.params})`,
                color: '#00d4ff',
                data: func
            });
        });
        
        currentY += Math.ceil(this.currentFlow.functions.length / 3) * verticalSpacing;
        
        // Decision nodes
        this.currentFlow.decisions.forEach((decision, i) => {
            const x = startX + (i % 4) * (horizontalSpacing * 0.8);
            const y = currentY + Math.floor(i / 4) * verticalSpacing;
            
            nodes.push({
                id: `decision-${i}`,
                type: 'decision',
                x,
                y,
                label: decision.type.toUpperCase(),
                sublabel: `Line ${decision.line}`,
                color: '#ffa726',
                shape: 'diamond',
                data: decision
            });
        });
        
        currentY += Math.ceil(this.currentFlow.decisions.length / 4) * verticalSpacing;
        
        // Loop nodes
        this.currentFlow.loops.forEach((loop, i) => {
            const x = startX + (i % 3) * horizontalSpacing;
            const y = currentY + Math.floor(i / 3) * verticalSpacing;
            
            nodes.push({
                id: `loop-${i}`,
                type: 'loop',
                x,
                y,
                label: loop.type.toUpperCase(),
                sublabel: `Line ${loop.line}`,
                color: '#a855f7',
                shape: 'hexagon',
                data: loop
            });
        });
        
        currentY += Math.ceil(this.currentFlow.loops.length / 3) * verticalSpacing;
        
        // End node
        nodes.push({
            id: 'end',
            type: 'end',
            x: this.canvas.width / 2,
            y: currentY,
            label: 'END',
            color: '#ff6b35'
        });
        
        return nodes;
    }
    
    drawNodes(nodes) {
        const ctx = this.ctx;
        
        nodes.forEach(node => {
            const shape = node.shape || 'rect';
            
            // Draw shadow
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 20;
            
            // Draw shape
            ctx.fillStyle = node.color;
            
            if (shape === 'diamond') {
                this.drawDiamond(ctx, node.x, node.y, 80, 60);
            } else if (shape === 'hexagon') {
                this.drawHexagon(ctx, node.x, node.y, 70);
            } else {
                // Rectangle
                const width = 140;
                const height = 60;
                this.roundRect(ctx, node.x - width/2, node.y - height/2, width, height, 8);
            }
            
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw text
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.label, node.x, node.y - 8);
            
            if (node.sublabel) {
                ctx.font = '11px Arial';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillText(node.sublabel, node.x, node.y + 10);
            }
        });
    }
    
    drawConnections(nodes) {
        const ctx = this.ctx;
        
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // Connect sequential nodes
        for (let i = 0; i < nodes.length - 1; i++) {
            const from = nodes[i];
            const to = nodes[i + 1];
            
            this.drawArrow(ctx, from.x, from.y + 30, to.x, to.y - 30);
        }
        
        // Draw loop back arrows
        if (document.getElementById('flow-show-loops')?.checked) {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
            nodes.filter(n => n.type === 'loop').forEach(loop => {
                this.drawCurvedArrow(ctx, loop.x + 70, loop.y, loop.x + 70, loop.y - 40, loop.x - 70, loop.y);
            });
        }
    }
    
    drawArrow(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI/6), y2 - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI/6), y2 - 10 * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
    }
    
    drawCurvedArrow(ctx, x1, y1, cx, cy, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.stroke();
    }
    
    drawDiamond(ctx, x, y, width, height) {
        ctx.beginPath();
        ctx.moveTo(x, y - height/2);
        ctx.lineTo(x + width/2, y);
        ctx.lineTo(x, y + height/2);
        ctx.lineTo(x - width/2, y);
        ctx.closePath();
    }
    
    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
    }
    
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    drawLegend() {
        const ctx = this.ctx;
        const x = 20;
        const y = this.canvas.height - 120;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.roundRect(ctx, x, y, 180, 100, 8);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Legend items
        const items = [
            { color: '#00d4ff', label: 'Function' },
            { color: '#ffa726', label: 'Decision' },
            { color: '#a855f7', label: 'Loop' }
        ];
        
        items.forEach((item, i) => {
            const ly = y + 20 + i * 25;
            
            ctx.fillStyle = item.color;
            ctx.fillRect(x + 15, ly, 20, 15);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, x + 45, ly + 11);
        });
    }
    
    // ========================================================================
    // STATS & UI
    // ========================================================================
    
    updateStats() {
        if (!this.currentFlow) return;
        
        document.getElementById('stat-functions').textContent = this.currentFlow.functions.length;
        document.getElementById('stat-decisions').textContent = this.currentFlow.decisions.length;
        document.getElementById('stat-loops').textContent = this.currentFlow.loops.length;
        document.getElementById('stat-complexity').textContent = this.currentFlow.complexity;
        
        // Update hotspots
        const hotspotsDiv = document.getElementById('flow-hotspots');
        if (this.currentFlow.complexity > 10) {
            hotspotsDiv.innerHTML = `
                <div style="padding: 10px; background: rgba(255, 71, 87, 0.1); border-left: 2px solid var(--red); border-radius: 4px; margin-bottom: 8px;">
                    <strong style="color: var(--red);">High Complexity</strong><br>
                    <span style="color: #ccc; font-size: 10px;">Complexity score: ${this.currentFlow.complexity}</span>
                </div>
            `;
        } else {
            hotspotsDiv.innerHTML = '<div style="color: var(--green); font-size: 11px;">✅ No major issues detected</div>';
        }
    }
    
    updateDisplay() {
        this.drawFlow();
    }
    
    toggleAnimation() {
        // TODO: Implement flow animation
        console.log('[FlowMapper] Animation toggle (coming soon)');
    }
    
    setupCanvasDrag() {
        let isDragging = false;
        let lastX, lastY;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            
            // TODO: Implement actual panning
            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    exportFlow() {
        const link = document.createElement('a');
        link.download = `code-flow-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        console.log('[FlowMapper] 💾 Flow exported as PNG');
    }
    
    closePanel() {
        if (this.flowWindow) {
            this.flowWindow.remove();
            this.flowWindow = null;
        }
    }
    
    detectLanguage() {
        if (!this.editor.getModel()) return 'javascript';
        return this.editor.getModel().getLanguageId() || 'javascript';
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.VisualCodeFlowMapper = VisualCodeFlowMapper;

setTimeout(() => {
    if (window.editor) {
        window.visualFlowMapper = new VisualCodeFlowMapper(window.editor);
        
        // Keyboard shortcut: Ctrl+Shift+F
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                if (!window.visualFlowMapper.flowWindow) {
                    window.visualFlowMapper.createFlowPanel();
                }
            }
        });
        
        console.log('[FlowMapper] 🎯 Ready! Press Ctrl+Shift+F to visualize');
    }
}, 2000);

console.log('[FlowMapper] 📦 Visual Code Flow module loaded');

