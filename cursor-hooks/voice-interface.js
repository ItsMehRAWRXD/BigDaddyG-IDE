// BigDaddyG Next Level - Reasoning Heatmaps & Introspection
// Advanced cognitive load visualization and token-level analysis

class ReasoningHeatmap {
  constructor(container) {
    this.container = container;
    this.heatmapData = new Map();
    this.cognitiveLoads = new Map();
    this.attentionPatterns = new Map();
    this.decisionTrees = new Map();
    this.realTimeMetrics = new Map();
    this.visualizations = new Map();
    this.isMonitoring = false;
  }

  // Visualize cognitive load per token
  visualizeCognitiveLoad(agentId, reasoning) {
    console.log('🧠 Visualizing cognitive load for agent:', agentId);
    
    const tokens = this.tokenizeReasoning(reasoning);
    const cognitiveLoads = this.calculateCognitiveLoads(tokens);
    
    const heatmap = {
      agentId,
      tokens,
      cognitiveLoads,
      visualization: this.createHeatmapVisualization(tokens, cognitiveLoads),
      timestamp: Date.now()
    };
    
    this.heatmapData.set(`${agentId}-${Date.now()}`, heatmap);
    
    // Update UI if available
    this.updateHeatmapDisplay(heatmap);
    
    return heatmap;
  }

  // Tokenize reasoning into individual tokens
  tokenizeReasoning(reasoning) {
    // Simple tokenization - in real implementation, this would use proper NLP
    const tokens = reasoning
      .split(/\s+/)
      .filter(token => token.length > 0)
      .map((token, index) => ({
        text: token,
        index,
        position: index,
        length: token.length,
        type: this.classifyToken(token)
      }));
    
    return tokens;
  }

  // Classify token type
  classifyToken(token) {
    const lower = token.toLowerCase();
    
    // Keywords
    if (['if', 'then', 'else', 'when', 'while', 'for', 'do', 'switch', 'case'].includes(lower)) {
      return 'control';
    }
    
    // Operators
    if (['+', '-', '*', '/', '=', '==', '!=', '<', '>', '<=', '>='].includes(token)) {
      return 'operator';
    }
    
    // Numbers
    if (/^\d+$/.test(token)) {
      return 'number';
    }
    
    // Strings
    if (token.startsWith('"') && token.endsWith('"')) {
      return 'string';
    }
    
    // Functions
    if (lower.includes('function') || lower.includes('method') || lower.includes('procedure')) {
      return 'function';
    }
    
    // Variables
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
      return 'variable';
    }
    
    // Default
    return 'word';
  }

  // Calculate cognitive load for each token
  calculateCognitiveLoads(tokens) {
    const loads = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const load = this.calculateTokenLoad(token, i, tokens);
      loads.push({
        token: token.text,
        index: i,
        load: load.value,
        factors: load.factors,
        complexity: load.complexity,
        attention: load.attention,
        color: this.getLoadColor(load.value)
      });
    }
    
    return loads;
  }

  // Calculate load for individual token
  calculateTokenLoad(token, index, tokens) {
    const factors = {
      semantic: this.calculateSemanticComplexity(token),
      contextual: this.calculateContextualComplexity(token, index, tokens),
      attentional: this.calculateAttentionalLoad(token, index, tokens),
      memory: this.calculateMemoryLoad(token, index, tokens),
      syntactic: this.calculateSyntacticComplexity(token)
    };
    
    const totalLoad = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    
    return {
      value: totalLoad,
      factors,
      complexity: this.calculateComplexityScore(factors),
      attention: this.calculateAttentionScore(factors)
    };
  }

  // Calculate semantic complexity
  calculateSemanticComplexity(token) {
    let complexity = 0;
    
    // Base complexity by token type
    switch (token.type) {
      case 'control':
        complexity += 0.8;
        break;
      case 'operator':
        complexity += 0.6;
        break;
      case 'function':
        complexity += 0.9;
        break;
      case 'variable':
        complexity += 0.4;
        break;
      case 'number':
        complexity += 0.2;
        break;
      case 'string':
        complexity += 0.3;
        break;
      default:
        complexity += 0.5;
    }
    
    // Length factor
    complexity += Math.min(token.length / 20, 0.5);
    
    // Special keywords
    const specialKeywords = ['async', 'await', 'promise', 'callback', 'recursive', 'recursion'];
    if (specialKeywords.includes(token.text.toLowerCase())) {
      complexity += 0.7;
    }
    
    return Math.min(complexity, 1.0);
  }

  // Calculate contextual complexity
  calculateContextualComplexity(token, index, tokens) {
    let complexity = 0;
    
    // Context window analysis
    const windowSize = 5;
    const start = Math.max(0, index - windowSize);
    const end = Math.min(tokens.length, index + windowSize + 1);
    const context = tokens.slice(start, end);
    
    // Count related concepts
    const relatedConcepts = this.findRelatedConcepts(token, context);
    complexity += relatedConcepts.length * 0.1;
    
    // Nested structure detection
    const nestingLevel = this.calculateNestingLevel(index, tokens);
    complexity += nestingLevel * 0.2;
    
    // Dependency analysis
    const dependencies = this.findDependencies(token, context);
    complexity += dependencies.length * 0.15;
    
    return Math.min(complexity, 1.0);
  }

  // Calculate attentional load
  calculateAttentionalLoad(token, index, tokens) {
    let load = 0;
    
    // Position-based attention
    const position = index / tokens.length;
    if (position < 0.1 || position > 0.9) {
      load += 0.3; // Higher attention at beginning and end
    }
    
    // Repetition factor
    const repetitions = tokens.filter(t => t.text === token.text).length;
    if (repetitions > 1) {
      load += 0.2;
    }
    
    // Uniqueness factor
    const uniqueTokens = new Set(tokens.map(t => t.text)).size;
    const uniqueness = 1 - (uniqueTokens / tokens.length);
    load += uniqueness * 0.3;
    
    return Math.min(load, 1.0);
  }

  // Calculate memory load
  calculateMemoryLoad(token, index, tokens) {
    let load = 0;
    
    // Working memory requirements
    if (token.type === 'variable') {
      load += 0.4;
    }
    
    if (token.type === 'function') {
      load += 0.6;
    }
    
    // Long-term memory activation
    const memoryKeywords = ['remember', 'recall', 'store', 'retrieve', 'cache'];
    if (memoryKeywords.includes(token.text.toLowerCase())) {
      load += 0.5;
    }
    
    // Context switching
    if (index > 0) {
      const prevToken = tokens[index - 1];
      if (this.requiresContextSwitch(token, prevToken)) {
        load += 0.3;
      }
    }
    
    return Math.min(load, 1.0);
  }

  // Calculate syntactic complexity
  calculateSyntacticComplexity(token) {
    let complexity = 0;
    
    // Syntax complexity by type
    switch (token.type) {
      case 'control':
        complexity += 0.7;
        break;
      case 'operator':
        complexity += 0.5;
        break;
      case 'function':
        complexity += 0.8;
        break;
      default:
        complexity += 0.3;
    }
    
    // Special characters
    const specialChars = /[{}[\]();,]/;
    if (specialChars.test(token.text)) {
      complexity += 0.4;
    }
    
    return Math.min(complexity, 1.0);
  }

  // Find related concepts
  findRelatedConcepts(token, context) {
    const concepts = [];
    
    for (const ctxToken of context) {
      if (ctxToken.text !== token.text) {
        if (this.areRelated(token, ctxToken)) {
          concepts.push(ctxToken.text);
        }
      }
    }
    
    return concepts;
  }

  // Check if tokens are related
  areRelated(token1, token2) {
    // Simple relatedness check
    const text1 = token1.text.toLowerCase();
    const text2 = token2.text.toLowerCase();
    
    // Same type
    if (token1.type === token2.type) return true;
    
    // Semantic similarity (simplified)
    const semanticPairs = [
      ['if', 'then'],
      ['for', 'while'],
      ['function', 'return'],
      ['var', 'let'],
      ['const', 'let']
    ];
    
    for (const [term1, term2] of semanticPairs) {
      if ((text1.includes(term1) && text2.includes(term2)) ||
          (text1.includes(term2) && text2.includes(term1))) {
        return true;
      }
    }
    
    return false;
  }

  // Calculate nesting level
  calculateNestingLevel(index, tokens) {
    let level = 0;
    const nestingChars = { '{': 1, '}': -1, '[': 1, ']': -1, '(': 1, ')': -1 };
    
    for (let i = 0; i < index; i++) {
      const token = tokens[i];
      if (nestingChars[token.text]) {
        level += nestingChars[token.text];
      }
    }
    
    return Math.max(0, level);
  }

  // Find dependencies
  findDependencies(token, context) {
    const dependencies = [];
    
    for (const ctxToken of context) {
      if (this.hasDependency(token, ctxToken)) {
        dependencies.push(ctxToken.text);
      }
    }
    
    return dependencies;
  }

  // Check dependency
  hasDependency(token1, token2) {
    // Simple dependency detection
    if (token1.type === 'variable' && token2.type === 'function') return true;
    if (token1.type === 'function' && token2.type === 'variable') return true;
    
    return false;
  }

  // Check if context switch is required
  requiresContextSwitch(token1, token2) {
    const switchPatterns = [
      ['async', 'sync'],
      ['function', 'variable'],
      ['control', 'operator']
    ];
    
    for (const [type1, type2] of switchPatterns) {
      if ((token1.type === type1 && token2.type === type2) ||
          (token1.type === type2 && token2.type === type1)) {
        return true;
      }
    }
    
    return false;
  }

  // Calculate complexity score
  calculateComplexityScore(factors) {
    const weights = {
      semantic: 0.3,
      contextual: 0.25,
      attentional: 0.2,
      memory: 0.15,
      syntactic: 0.1
    };
    
    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += value * weights[factor];
    }
    
    return Math.min(score, 1.0);
  }

  // Calculate attention score
  calculateAttentionScore(factors) {
    const weights = {
      semantic: 0.2,
      contextual: 0.3,
      attentional: 0.4,
      memory: 0.1,
      syntactic: 0.0
    };
    
    let score = 0;
    for (const [factor, value] of Object.entries(factors)) {
      score += value * weights[factor];
    }
    
    return Math.min(score, 1.0);
  }

  // Get color for load value
  getLoadColor(load) {
    if (load < 0.3) return '#4CAF50'; // Green
    if (load < 0.6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  // Create heatmap visualization
  createHeatmapVisualization(tokens, cognitiveLoads) {
    const visualization = {
      type: 'heatmap',
      data: tokens.map((token, index) => ({
        token: token.text,
        x: index,
        y: 0,
        intensity: cognitiveLoads[index].load,
        color: cognitiveLoads[index].color,
        factors: cognitiveLoads[index].factors,
        complexity: cognitiveLoads[index].complexity,
        attention: cognitiveLoads[index].attention
      })),
      colorScale: this.createColorScale(),
      interactions: this.createInteractions()
    };
    
    return visualization;
  }

  // Create color scale
  createColorScale() {
    return {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#9C27B0'
    };
  }

  // Create interactions
  createInteractions() {
    return {
      hover: true,
      click: true,
      zoom: true,
      pan: true,
      tooltip: true
    };
  }

  // Update heatmap display
  updateHeatmapDisplay(heatmap) {
    // Create or update heatmap visualization
    const container = document.getElementById('reasoning-heatmap-container');
    if (container) {
      this.renderHeatmap(container, heatmap);
    }
  }

  // Render heatmap
  renderHeatmap(container, heatmap) {
    // Clear existing content
    container.innerHTML = '';
    
    // Create heatmap visualization
    const heatmapDiv = document.createElement('div');
    heatmapDiv.className = 'reasoning-heatmap';
    heatmapDiv.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 8px;
    `;
    
    // Add tokens
    for (const data of heatmap.visualization.data) {
      const tokenDiv = document.createElement('div');
      tokenDiv.textContent = data.token;
      tokenDiv.style.cssText = `
        padding: 4px 8px;
        background: ${data.color};
        color: white;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        opacity: ${0.5 + data.intensity * 0.5};
      `;
      
      // Add hover effect
      tokenDiv.addEventListener('mouseenter', () => {
        tokenDiv.style.transform = 'scale(1.1)';
        this.showTokenDetails(data);
      });
      
      tokenDiv.addEventListener('mouseleave', () => {
        tokenDiv.style.transform = 'scale(1)';
        this.hideTokenDetails();
      });
      
      heatmapDiv.appendChild(tokenDiv);
    }
    
    container.appendChild(heatmapDiv);
  }

  // Show token details
  showTokenDetails(data) {
    const tooltip = document.getElementById('token-tooltip');
    if (tooltip) {
      tooltip.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          <strong>Token:</strong> ${data.token}<br>
          <strong>Load:</strong> ${(data.intensity * 100).toFixed(1)}%<br>
          <strong>Complexity:</strong> ${(data.complexity * 100).toFixed(1)}%<br>
          <strong>Attention:</strong> ${(data.attention * 100).toFixed(1)}%<br>
          <strong>Factors:</strong><br>
          • Semantic: ${(data.factors.semantic * 100).toFixed(1)}%<br>
          • Contextual: ${(data.factors.contextual * 100).toFixed(1)}%<br>
          • Attentional: ${(data.factors.attentional * 100).toFixed(1)}%<br>
          • Memory: ${(data.factors.memory * 100).toFixed(1)}%<br>
          • Syntactic: ${(data.factors.syntactic * 100).toFixed(1)}%
        </div>
      `;
      tooltip.style.display = 'block';
    }
  }

  // Hide token details
  hideTokenDetails() {
    const tooltip = document.getElementById('token-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  // Attention pattern analysis
  analyzeAttentionPatterns(agentId, reasoning) {
    console.log('🧠 Analyzing attention patterns for agent:', agentId);
    
    const patterns = {
      agentId,
      reasoning,
      attentionWeights: this.calculateAttentionWeights(reasoning),
      focusAreas: this.identifyFocusAreas(reasoning),
      attentionShifts: this.trackAttentionShifts(reasoning),
      concentration: this.calculateConcentration(reasoning),
      timestamp: Date.now()
    };
    
    this.attentionPatterns.set(`${agentId}-${Date.now()}`, patterns);
    
    // Update UI if available
    this.updateAttentionDisplay(patterns);
    
    return patterns;
  }

  // Calculate attention weights
  calculateAttentionWeights(reasoning) {
    const tokens = this.tokenizeReasoning(reasoning);
    const weights = [];
    
    for (let i = 0; i < tokens.length; i++) {
      const weight = this.calculateTokenAttentionWeight(tokens[i], i, tokens);
      weights.push({
        token: tokens[i].text,
        index: i,
        weight,
        normalized: weight / Math.max(...weights.map(w => w.weight), 1)
      });
    }
    
    return weights;
  }

  // Calculate token attention weight
  calculateTokenAttentionWeight(token, index, tokens) {
    let weight = 0.5; // Base weight
    
    // Position-based attention
    const position = index / tokens.length;
    if (position < 0.1 || position > 0.9) {
      weight += 0.3; // Higher attention at beginning and end
    }
    
    // Keyword attention
    const keywords = ['important', 'critical', 'key', 'main', 'primary', 'focus'];
    if (keywords.some(keyword => token.text.toLowerCase().includes(keyword))) {
      weight += 0.4;
    }
    
    // Repetition attention
    const repetitions = tokens.filter(t => t.text === token.text).length;
    if (repetitions > 1) {
      weight += 0.2;
    }
    
    // Context attention
    const context = tokens.slice(Math.max(0, index - 3), Math.min(tokens.length, index + 4));
    const contextWeight = this.calculateContextAttention(context);
    weight += contextWeight * 0.3;
    
    return Math.min(weight, 1.0);
  }

  // Calculate context attention
  calculateContextAttention(context) {
    let attention = 0;
    
    for (const token of context) {
      if (token.type === 'control' || token.type === 'function') {
        attention += 0.2;
      }
    }
    
    return Math.min(attention, 1.0);
  }

  // Identify focus areas
  identifyFocusAreas(reasoning) {
    const tokens = this.tokenizeReasoning(reasoning);
    const focusAreas = [];
    
    let currentArea = null;
    let areaStart = 0;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const attentionWeight = this.calculateTokenAttentionWeight(token, i, tokens);
      
      if (attentionWeight > 0.7) {
        if (!currentArea) {
          currentArea = {
            start: i,
            tokens: [],
            maxAttention: attentionWeight,
            avgAttention: attentionWeight
          };
        }
        
        currentArea.tokens.push(token);
        currentArea.maxAttention = Math.max(currentArea.maxAttention, attentionWeight);
        currentArea.avgAttention = (currentArea.avgAttention + attentionWeight) / 2;
      } else {
        if (currentArea && currentArea.tokens.length > 2) {
          currentArea.end = i - 1;
          focusAreas.push(currentArea);
        }
        currentArea = null;
      }
    }
    
    // Add final area if exists
    if (currentArea && currentArea.tokens.length > 2) {
      currentArea.end = tokens.length - 1;
      focusAreas.push(currentArea);
    }
    
    return focusAreas;
  }

  // Track attention shifts
  trackAttentionShifts(reasoning) {
    const tokens = this.tokenizeReasoning(reasoning);
    const shifts = [];
    
    for (let i = 1; i < tokens.length; i++) {
      const prevWeight = this.calculateTokenAttentionWeight(tokens[i - 1], i - 1, tokens);
      const currWeight = this.calculateTokenAttentionWeight(tokens[i], i, tokens);
      
      const shift = Math.abs(currWeight - prevWeight);
      if (shift > 0.3) {
        shifts.push({
          from: i - 1,
          to: i,
          shift,
          fromToken: tokens[i - 1].text,
          toToken: tokens[i].text,
          type: currWeight > prevWeight ? 'increase' : 'decrease'
        });
      }
    }
    
    return shifts;
  }

  // Calculate concentration
  calculateConcentration(reasoning) {
    const tokens = this.tokenizeReasoning(reasoning);
    const attentionWeights = tokens.map((token, index) => 
      this.calculateTokenAttentionWeight(token, index, tokens)
    );
    
    const avgAttention = attentionWeights.reduce((sum, weight) => sum + weight, 0) / attentionWeights.length;
    const variance = attentionWeights.reduce((sum, weight) => sum + Math.pow(weight - avgAttention, 2), 0) / attentionWeights.length;
    const concentration = 1 - Math.sqrt(variance);
    
    return {
      concentration: Math.max(0, Math.min(1, concentration)),
      avgAttention,
      variance,
      focusScore: this.calculateFocusScore(attentionWeights)
    };
  }

  // Calculate focus score
  calculateFocusScore(attentionWeights) {
    const highAttention = attentionWeights.filter(weight => weight > 0.7).length;
    const totalTokens = attentionWeights.length;
    
    return highAttention / totalTokens;
  }

  // Update attention display
  updateAttentionDisplay(patterns) {
    const container = document.getElementById('attention-patterns-container');
    if (container) {
      this.renderAttentionPatterns(container, patterns);
    }
  }

  // Render attention patterns
  renderAttentionPatterns(container, patterns) {
    container.innerHTML = '';
    
    // Create attention visualization
    const attentionDiv = document.createElement('div');
    attentionDiv.className = 'attention-patterns';
    attentionDiv.style.cssText = `
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    // Add attention weights
    const weightsDiv = document.createElement('div');
    weightsDiv.innerHTML = '<h3>Attention Weights</h3>';
    
    for (const weight of patterns.attentionWeights) {
      const weightDiv = document.createElement('div');
      weightDiv.style.cssText = `
        display: flex;
        align-items: center;
        margin: 5px 0;
        padding: 5px;
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
      `;
      
      const tokenSpan = document.createElement('span');
      tokenSpan.textContent = weight.token;
      tokenSpan.style.marginRight = '10px';
      
      const weightBar = document.createElement('div');
      weightBar.style.cssText = `
        width: ${weight.normalized * 200}px;
        height: 20px;
        background: linear-gradient(90deg, #4CAF50, #FF9800, #F44336);
        border-radius: 10px;
        margin-right: 10px;
      `;
      
      const weightText = document.createElement('span');
      weightText.textContent = `${(weight.weight * 100).toFixed(1)}%`;
      
      weightDiv.appendChild(tokenSpan);
      weightDiv.appendChild(weightBar);
      weightDiv.appendChild(weightText);
      weightsDiv.appendChild(weightDiv);
    }
    
    attentionDiv.appendChild(weightsDiv);
    container.appendChild(attentionDiv);
  }

  // Decision tree visualization
  visualizeDecisionTree(agentId, decisions) {
    console.log('🧠 Visualizing decision tree for agent:', agentId);
    
    const tree = {
      agentId,
      decisions,
      nodes: this.createDecisionNodes(decisions),
      edges: this.createDecisionEdges(decisions),
      paths: this.identifyDecisionPaths(decisions),
      confidence: this.calculateDecisionConfidence(decisions),
      timestamp: Date.now()
    };
    
    this.decisionTrees.set(`${agentId}-${Date.now()}`, tree);
    
    // Update UI if available
    this.updateDecisionTreeDisplay(tree);
    
    return tree;
  }

  // Create decision nodes
  createDecisionNodes(decisions) {
    const nodes = [];
    
    for (let i = 0; i < decisions.length; i++) {
      const decision = decisions[i];
      const node = {
        id: `decision-${i}`,
        decision,
        type: this.classifyDecision(decision),
        confidence: this.calculateDecisionConfidence([decision]),
        timestamp: decision.timestamp || Date.now(),
        dependencies: this.findDecisionDependencies(decision, decisions),
        outcomes: this.identifyDecisionOutcomes(decision)
      };
      
      nodes.push(node);
    }
    
    return nodes;
  }

  // Classify decision
  classifyDecision(decision) {
    const text = decision.text || decision.toString();
    const lower = text.toLowerCase();
    
    if (lower.includes('if') || lower.includes('condition')) return 'conditional';
    if (lower.includes('loop') || lower.includes('repeat')) return 'iterative';
    if (lower.includes('choose') || lower.includes('select')) return 'choice';
    if (lower.includes('return') || lower.includes('exit')) return 'terminal';
    
    return 'general';
  }

  // Calculate decision confidence
  calculateDecisionConfidence(decisions) {
    if (decisions.length === 0) return 0;
    
    const confidences = decisions.map(d => d.confidence || 0.5);
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    return avgConfidence;
  }

  // Find decision dependencies
  findDecisionDependencies(decision, allDecisions) {
    const dependencies = [];
    
    for (const otherDecision of allDecisions) {
      if (otherDecision !== decision) {
        if (this.hasDecisionDependency(decision, otherDecision)) {
          dependencies.push(otherDecision);
        }
      }
    }
    
    return dependencies;
  }

  // Check decision dependency
  hasDecisionDependency(decision1, decision2) {
    // Simple dependency detection
    const text1 = (decision1.text || decision1.toString()).toLowerCase();
    const text2 = (decision2.text || decision2.toString()).toLowerCase();
    
    // Check for variable references
    const variables1 = this.extractVariables(text1);
    const variables2 = this.extractVariables(text2);
    
    return variables1.some(v1 => variables2.includes(v1));
  }

  // Extract variables from text
  extractVariables(text) {
    const variables = [];
    const words = text.split(/\s+/);
    
    for (const word of words) {
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word) && word.length > 1) {
        variables.push(word);
      }
    }
    
    return variables;
  }

  // Identify decision outcomes
  identifyDecisionOutcomes(decision) {
    const outcomes = [];
    const text = decision.text || decision.toString();
    
    // Simple outcome detection
    if (text.includes('success')) outcomes.push('success');
    if (text.includes('failure')) outcomes.push('failure');
    if (text.includes('error')) outcomes.push('error');
    if (text.includes('continue')) outcomes.push('continue');
    if (text.includes('break')) outcomes.push('break');
    
    return outcomes;
  }

  // Create decision edges
  createDecisionEdges(decisions) {
    const edges = [];
    
    for (let i = 0; i < decisions.length - 1; i++) {
      const from = decisions[i];
      const to = decisions[i + 1];
      
      const edge = {
        from: `decision-${i}`,
        to: `decision-${i + 1}`,
        type: 'sequential',
        strength: this.calculateEdgeStrength(from, to),
        label: this.generateEdgeLabel(from, to)
      };
      
      edges.push(edge);
    }
    
    return edges;
  }

  // Calculate edge strength
  calculateEdgeStrength(decision1, decision2) {
    let strength = 0.5; // Base strength

    // Temporal proximity
    if (decision1.timestamp && decision2.timestamp) {
      const timeDiff = Math.abs(decision2.timestamp - decision1.timestamp);
      if (timeDiff < 1000) strength += 0.3; // Within 1 second
    }

    // Semantic similarity
    const similarity = this.calculateSemanticSimilarity(decision1, decision2);
    strength += similarity * 0.2;

    return strength;
  }

  // Calculate semantic similarity
  calculateSemanticSimilarity(decision1, decision2) {
    const text1 = (decision1.text || decision1.toString()).toLowerCase();
    const text2 = (decision2.text || decision2.toString()).toLowerCase();

    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  // Generate edge label
  generateEdgeLabel(decision1, decision2) {
    const text1 = (decision1.text || decision1.toString()).toLowerCase();
    const text2 = (decision2.text || decision2.toString()).toLowerCase();

    if (text1.includes('if') && text2.includes('then')) return 'conditional';
    if (text1.includes('loop') || text2.includes('repeat')) return 'iterative';
    if (text1.includes('return') || text2.includes('exit')) return 'terminal';

    return 'sequential';
  }

  // Identify decision paths
  identifyDecisionPaths(decisions) {
    const paths = [];
    const visited = new Set();

    for (let i = 0; i < decisions.length; i++) {
      if (!visited.has(i)) {
        const path = this.traceDecisionPath(decisions, i, visited);
        if (path.length > 1) {
          paths.push(path);
        }
      }
    }

    return paths;
  }

  // Trace decision path
  traceDecisionPath(decisions, startIndex, visited) {
    const path = [];
    let currentIndex = startIndex;

    while (currentIndex < decisions.length && !visited.has(currentIndex)) {
      visited.add(currentIndex);
      path.push(decisions[currentIndex]);
      currentIndex++;
    }

    return path;
  }

  // Update decision tree display
  updateDecisionTreeDisplay(tree) {
    const container = document.getElementById('decision-tree-container');
    if (container) {
      this.renderDecisionTree(container, tree);
    }
  }

  // Render decision tree
  renderDecisionTree(container, tree) {
    container.innerHTML = '';

    const treeDiv = document.createElement('div');
    treeDiv.className = 'decision-tree';
    treeDiv.style.cssText = `
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    // Add tree visualization
    const treeContent = document.createElement('div');
    treeContent.innerHTML = `
      <h3>Decision Tree - ${tree.agentId}</h3>
      <p><strong>Confidence:</strong> ${(tree.confidence * 100).toFixed(1)}%</p>
      <p><strong>Nodes:</strong> ${tree.nodes.length}</p>
      <p><strong>Paths:</strong> ${tree.paths.length}</p>
    `;

    treeDiv.appendChild(treeContent);
    container.appendChild(treeDiv);
  }

  // Real-time metrics tracking
  startMonitoring(agentId) {
    console.log('🧠 Starting real-time monitoring for agent:', agentId);
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics(agentId);
    }, 1000);
  }

  // Stop monitoring
  stopMonitoring() {
    console.log('🧠 Stopping real-time monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  // Collect real-time metrics
  collectMetrics(agentId) {
    const metrics = {
      timestamp: Date.now(),
      cognitiveLoad: Math.random(), // Placeholder
      attentionLevel: Math.random(), // Placeholder
      decisionConfidence: Math.random(), // Placeholder
      processingSpeed: Math.random() * 1000 // Placeholder
    };

    this.realTimeMetrics.set(`${agentId}-${Date.now()}`, metrics);

    // Update UI if available
    this.updateMetricsDisplay(metrics);
  }

  // Update metrics display
  updateMetricsDisplay(metrics) {
    const container = document.getElementById('real-time-metrics-container');
    if (container) {
      this.renderMetrics(container, metrics);
    }
  }

  // Render metrics
  renderMetrics(container, metrics) {
    container.innerHTML = `
      <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; margin: 5px 0;">
        <strong>Cognitive Load:</strong> ${(metrics.cognitiveLoad * 100).toFixed(1)}%<br>
        <strong>Attention Level:</strong> ${(metrics.attentionLevel * 100).toFixed(1)}%<br>
        <strong>Decision Confidence:</strong> ${(metrics.decisionConfidence * 100).toFixed(1)}%<br>
        <strong>Processing Speed:</strong> ${metrics.processingSpeed.toFixed(0)}ms
      </div>
    `;
  }
}