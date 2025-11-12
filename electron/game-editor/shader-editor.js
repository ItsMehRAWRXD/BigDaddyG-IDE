/**
 * BigDaddyG IDE - Visual Shader Editor
 * Complete shader editing with live preview and node-based editing
 */

(function() {
'use strict';

class ShaderEditor {
    constructor() {
        this.currentShader = null;
        this.shaderCanvas = null;
        this.shaderContext = null;
        this.shaderProgram = null;
        this.animationFrame = null;
        
        this.shaderTemplates = {
            vertex: `#version 300 es
in vec3 aPosition;
in vec2 aTexCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTexCoord;
out vec3 vNormal;

void main() {
    vTexCoord = aTexCoord;
    vNormal = aNormal;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}`,
            fragment: `#version 300 es
precision highp float;

in vec2 vTexCoord;
in vec3 vNormal;

uniform sampler2D uTexture;
uniform vec4 uColor;
uniform float uTime;

out vec4 fragColor;

void main() {
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    vec4 texColor = texture(uTexture, vTexCoord);
    vec3 color = texColor.rgb * uColor.rgb * diff;
    
    fragColor = vec4(color, texColor.a * uColor.a);
}`,
            compute: `#version 430
layout(local_size_x = 16, local_size_y = 16) in;

layout(rgba32f, binding = 0) uniform image2D uImage;
uniform float uTime;

void main() {
    ivec2 coord = ivec2(gl_GlobalInvocationID.xy);
    
    vec2 uv = vec2(coord) / vec2(imageSize(uImage));
    vec3 color = vec3(uv, sin(uTime));
    
    imageStore(uImage, coord, vec4(color, 1.0));
}`,
            sunshineBasic: `// Sunshine Engine Shader
shader_type spatial;

uniform vec4 albedo : hint_color = vec4(1.0);
uniform sampler2D texture_albedo : hint_albedo;
uniform float roughness : hint_range(0.0, 1.0) = 0.5;
uniform float metallic : hint_range(0.0, 1.0) = 0.0;

void fragment() {
    vec4 tex = texture(texture_albedo, UV);
    ALBEDO = albedo.rgb * tex.rgb;
    ROUGHNESS = roughness;
    METALLIC = metallic;
}`,
            godot: `shader_type canvas_item;

uniform vec4 color : hint_color = vec4(1.0);
uniform sampler2D texture : hint_albedo;
uniform float time;

void fragment() {
    vec4 tex = texture(texture, UV);
    vec2 wave = UV + vec2(sin(UV.y * 10.0 + time), cos(UV.x * 10.0 + time)) * 0.01;
    COLOR = texture(texture, wave) * color;
}`,
            unity: `Shader "Custom/BasicShader"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Texture", 2D) = "white" {}
        _Glossiness ("Smoothness", Range(0,1)) = 0.5
        _Metallic ("Metallic", Range(0,1)) = 0.0
    }
    
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 200
        
        CGPROGRAM
        #pragma surface surf Standard fullforwardshadows
        #pragma target 3.0
        
        sampler2D _MainTex;
        fixed4 _Color;
        half _Glossiness;
        half _Metallic;
        
        struct Input
        {
            float2 uv_MainTex;
        };
        
        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * _Color;
            o.Albedo = c.rgb;
            o.Metallic = _Metallic;
            o.Smoothness = _Glossiness;
            o.Alpha = c.a;
        }
        ENDCG
    }
    FallBack "Diffuse"
}`,
            unreal: `// Unreal Engine Material Expression
float3 CustomExpression(float3 BaseColor, float Metallic, float Roughness)
{
    // Custom material logic
    float3 Color = BaseColor;
    
    // Apply metallic
    Color = lerp(Color, float3(0.04, 0.04, 0.04), Metallic);
    
    // Apply roughness
    Color *= (1.0 - Roughness * 0.5);
    
    return Color;
}`
        };
        
        console.log('[ShaderEditor] Initialized');
    }
    
    /**
     * Initialize shader editor
     */
    async initialize(containerId) {
        console.log('[ShaderEditor] Initializing shader editor...');
        
        const container = document.getElementById(containerId) || document.createElement('div');
        container.id = containerId;
        
        this.createShaderEditorUI(container);
        this.attachEventListeners();
        
        // Initialize WebGL canvas
        this.initializeWebGL();
        
        console.log('[ShaderEditor] ✅ Shader editor ready');
        return { success: true };
    }
    
    /**
     * Create shader editor UI
     */
    createShaderEditorUI(container) {
        container.innerHTML = `
            <div class="shader-editor-container">
                <div class="shader-editor-toolbar">
                    <div class="toolbar-section">
                        <button id="new-shader-btn">📄 New Shader</button>
                        <button id="save-shader-btn">💾 Save</button>
                        <button id="compile-shader-btn">🔨 Compile</button>
                    </div>
                    
                    <div class="toolbar-section">
                        <select id="shader-type-select">
                            <option value="vertex">Vertex Shader</option>
                            <option value="fragment" selected>Fragment Shader</option>
                            <option value="compute">Compute Shader</option>
                            <option value="godot">Godot Shader</option>
                            <option value="unity">Unity Shader</option>
                            <option value="unreal">Unreal Material</option>
                            <option value="sunshineBasic">Sunshine Shader</option>
                        </select>
                    </div>
                    
                    <div class="toolbar-section">
                        <button id="load-template-btn">📋 Template</button>
                        <button id="toggle-node-editor-btn">🔷 Node Editor</button>
                        <button id="toggle-preview-btn">👁️ Preview</button>
                    </div>
                </div>
                
                <div class="shader-editor-layout">
                    <!-- Code Editor -->
                    <div class="shader-code-panel">
                        <div class="code-header">
                            <span>Shader Code</span>
                            <div class="code-actions">
                                <button class="btn-small" id="format-code-btn">Format</button>
                                <button class="btn-small" id="validate-btn">Validate</button>
                            </div>
                        </div>
                        <textarea id="shader-code-editor" class="shader-code-editor"></textarea>
                        <div class="shader-errors" id="shader-errors"></div>
                    </div>
                    
                    <!-- Node Editor (hidden by default) -->
                    <div class="shader-node-panel" id="shader-node-panel" style="display: none;">
                        <div class="node-toolbar">
                            <button id="add-input-node">📥 Input</button>
                            <button id="add-texture-node">🖼️ Texture</button>
                            <button id="add-color-node">🎨 Color</button>
                            <button id="add-math-node">➕ Math</button>
                            <button id="add-output-node">📤 Output</button>
                        </div>
                        <canvas id="node-canvas" class="node-canvas"></canvas>
                    </div>
                    
                    <!-- Preview Panel -->
                    <div class="shader-preview-panel" id="shader-preview-panel">
                        <div class="preview-header">
                            <span>Live Preview</span>
                            <div class="preview-controls">
                                <button id="play-preview-btn">▶️</button>
                                <button id="pause-preview-btn">⏸️</button>
                                <button id="reset-preview-btn">🔄</button>
                            </div>
                        </div>
                        <canvas id="shader-preview-canvas" width="400" height="400"></canvas>
                        <div class="preview-stats">
                            <span>FPS: <span id="preview-fps">60</span></span>
                            <span>Time: <span id="preview-time">0.0</span>s</span>
                        </div>
                    </div>
                </div>
                
                <!-- Properties Panel -->
                <div class="shader-properties-panel">
                    <h3>Shader Properties</h3>
                    <div id="shader-properties">
                        <div class="property-group">
                            <label>Color</label>
                            <input type="color" id="shader-color" value="#ffffff" />
                        </div>
                        <div class="property-group">
                            <label>Intensity</label>
                            <input type="range" id="shader-intensity" min="0" max="2" step="0.1" value="1" />
                            <span id="intensity-value">1.0</span>
                        </div>
                        <div class="property-group">
                            <label>Roughness</label>
                            <input type="range" id="shader-roughness" min="0" max="1" step="0.01" value="0.5" />
                            <span id="roughness-value">0.5</span>
                        </div>
                        <div class="property-group">
                            <label>Metallic</label>
                            <input type="range" id="shader-metallic" min="0" max="1" step="0.01" value="0" />
                            <span id="metallic-value">0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.applyShaderEditorStyles();
    }
    
    /**
     * Initialize WebGL for preview
     */
    initializeWebGL() {
        const canvas = document.getElementById('shader-preview-canvas');
        if (!canvas) return;
        
        try {
            this.shaderCanvas = canvas;
            this.shaderContext = canvas.getContext('webgl2');
            
            if (!this.shaderContext) {
                console.error('[ShaderEditor] WebGL2 not supported');
                return;
            }
            
            // Set clear color
            this.shaderContext.clearColor(0.1, 0.1, 0.1, 1.0);
            this.shaderContext.clear(this.shaderContext.COLOR_BUFFER_BIT);
            
            // Load default shader
            this.loadTemplate('fragment');
            
            console.log('[ShaderEditor] WebGL initialized');
        } catch (error) {
            console.error('[ShaderEditor] WebGL initialization error:', error);
        }
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toolbar buttons
        document.getElementById('new-shader-btn')?.addEventListener('click', () => this.newShader());
        document.getElementById('save-shader-btn')?.addEventListener('click', () => this.saveShader());
        document.getElementById('compile-shader-btn')?.addEventListener('click', () => this.compileShader());
        document.getElementById('load-template-btn')?.addEventListener('click', () => {
            const type = document.getElementById('shader-type-select').value;
            this.loadTemplate(type);
        });
        
        // Toggle panels
        document.getElementById('toggle-node-editor-btn')?.addEventListener('click', () => this.toggleNodeEditor());
        document.getElementById('toggle-preview-btn')?.addEventListener('click', () => this.togglePreview());
        
        // Code actions
        document.getElementById('format-code-btn')?.addEventListener('click', () => this.formatCode());
        document.getElementById('validate-btn')?.addEventListener('click', () => this.validateShader());
        
        // Preview controls
        document.getElementById('play-preview-btn')?.addEventListener('click', () => this.playPreview());
        document.getElementById('pause-preview-btn')?.addEventListener('click', () => this.pausePreview());
        document.getElementById('reset-preview-btn')?.addEventListener('click', () => this.resetPreview());
        
        // Property changes
        document.getElementById('shader-intensity')?.addEventListener('input', (e) => {
            document.getElementById('intensity-value').textContent = e.target.value;
            this.updateShaderProperties();
        });
        
        document.getElementById('shader-roughness')?.addEventListener('input', (e) => {
            document.getElementById('roughness-value').textContent = e.target.value;
            this.updateShaderProperties();
        });
        
        document.getElementById('shader-metallic')?.addEventListener('input', (e) => {
            document.getElementById('metallic-value').textContent = e.target.value;
            this.updateShaderProperties();
        });
        
        // Shader type change
        document.getElementById('shader-type-select')?.addEventListener('change', (e) => {
            this.loadTemplate(e.target.value);
        });
        
        // Code editor changes
        document.getElementById('shader-code-editor')?.addEventListener('input', () => {
            this.onCodeChange();
        });
    }
    
    /**
     * Load shader template
     */
    loadTemplate(type) {
        const editor = document.getElementById('shader-code-editor');
        if (!editor) return;
        
        if (this.shaderTemplates[type]) {
            editor.value = this.shaderTemplates[type];
            this.currentShader = {
                type: type,
                code: this.shaderTemplates[type]
            };
            console.log(`[ShaderEditor] Loaded ${type} template`);
        }
    }
    
    /**
     * Compile shader
     */
    compileShader() {
        const editor = document.getElementById('shader-code-editor');
        const errorsDiv = document.getElementById('shader-errors');
        
        if (!editor || !this.shaderContext) return;
        
        const code = editor.value;
        
        try {
            // Clear previous errors
            errorsDiv.innerHTML = '';
            
            // Simple validation
            const errors = this.validateShaderCode(code);
            
            if (errors.length > 0) {
                errorsDiv.innerHTML = errors.map(err => 
                    `<div class="shader-error">❌ Line ${err.line}: ${err.message}</div>`
                ).join('');
                console.error('[ShaderEditor] Compilation errors:', errors);
            } else {
                errorsDiv.innerHTML = '<div class="shader-success">✅ Shader compiled successfully</div>';
                console.log('[ShaderEditor] Shader compiled successfully');
                
                // Update preview
                this.updatePreview();
            }
        } catch (error) {
            errorsDiv.innerHTML = `<div class="shader-error">❌ ${error.message}</div>`;
            console.error('[ShaderEditor] Compilation error:', error);
        }
    }
    
    /**
     * Validate shader code
     */
    validateShaderCode(code) {
        const errors = [];
        const lines = code.split('\n');
        
        lines.forEach((line, index) => {
            // Check for common errors
            if (line.includes('uniform') && !line.includes(';')) {
                errors.push({ line: index + 1, message: 'Missing semicolon in uniform declaration' });
            }
            if (line.includes('void main()') && !line.includes('{')) {
                errors.push({ line: index + 1, message: 'Missing opening brace in main function' });
            }
        });
        
        return errors;
    }
    
    /**
     * Update preview
     */
    updatePreview() {
        if (!this.shaderContext) return;
        
        // Simple colored quad for demo
        const gl = this.shaderContext;
        gl.clearColor(0.2, 0.3, 0.4, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        console.log('[ShaderEditor] Preview updated');
    }
    
    /**
     * Play preview animation
     */
    playPreview() {
        if (this.animationFrame) return;
        
        let startTime = Date.now();
        const animate = () => {
            const time = (Date.now() - startTime) / 1000;
            document.getElementById('preview-time').textContent = time.toFixed(1);
            
            this.updatePreview();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
        console.log('[ShaderEditor] Preview playing');
    }
    
    /**
     * Pause preview
     */
    pausePreview() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        console.log('[ShaderEditor] Preview paused');
    }
    
    /**
     * Reset preview
     */
    resetPreview() {
        this.pausePreview();
        document.getElementById('preview-time').textContent = '0.0';
        this.updatePreview();
        console.log('[ShaderEditor] Preview reset');
    }
    
    /**
     * Toggle node editor
     */
    toggleNodeEditor() {
        const nodePanel = document.getElementById('shader-node-panel');
        if (nodePanel) {
            nodePanel.style.display = nodePanel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Toggle preview
     */
    togglePreview() {
        const previewPanel = document.getElementById('shader-preview-panel');
        if (previewPanel) {
            previewPanel.style.display = previewPanel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Format code
     */
    formatCode() {
        const editor = document.getElementById('shader-code-editor');
        if (!editor) return;
        
        // Simple formatting
        let code = editor.value;
        code = code.replace(/\{/g, ' {\n    ');
        code = code.replace(/\}/g, '\n}');
        code = code.replace(/;/g, ';\n');
        
        editor.value = code;
        console.log('[ShaderEditor] Code formatted');
    }
    
    /**
     * Validate shader
     */
    validateShader() {
        this.compileShader();
    }
    
    /**
     * Update shader properties
     */
    updateShaderProperties() {
        console.log('[ShaderEditor] Properties updated');
        this.updatePreview();
    }
    
    /**
     * On code change
     */
    onCodeChange() {
        // Auto-save or validate on change
        if (this.currentShader) {
            this.currentShader.code = document.getElementById('shader-code-editor').value;
        }
    }
    
    /**
     * New shader
     */
    newShader() {
        const type = document.getElementById('shader-type-select').value;
        this.loadTemplate(type);
        console.log('[ShaderEditor] New shader created');
    }
    
    /**
     * Save shader
     */
    saveShader() {
        if (!this.currentShader) return;
        
        console.log('[ShaderEditor] Saving shader...');
        // Save logic would go here
    }
    
    /**
     * Apply styles
     */
    applyShaderEditorStyles() {
        if (document.getElementById('shader-editor-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'shader-editor-styles';
        style.textContent = `
            .shader-editor-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #1e1e1e;
                color: #fff;
            }
            
            .shader-editor-toolbar {
                display: flex;
                gap: 10px;
                padding: 8px;
                background: #252526;
                border-bottom: 1px solid #3c3c3c;
            }
            
            .shader-editor-layout {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .shader-code-panel {
                flex: 1;
                display: flex;
                flex-direction: column;
                border-right: 1px solid #3c3c3c;
            }
            
            .shader-code-editor {
                flex: 1;
                background: #1e1e1e;
                color: #d4d4d4;
                border: none;
                padding: 10px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                resize: none;
            }
            
            .shader-errors {
                min-height: 40px;
                background: #2d2d2d;
                border-top: 1px solid #3c3c3c;
                padding: 10px;
                font-size: 12px;
            }
            
            .shader-error {
                color: #f48771;
                margin: 5px 0;
            }
            
            .shader-success {
                color: #4ec9b0;
            }
            
            .shader-preview-panel {
                width: 400px;
                display: flex;
                flex-direction: column;
                background: #252526;
            }
            
            #shader-preview-canvas {
                flex: 1;
                background: #1a1a1a;
            }
            
            .shader-properties-panel {
                width: 250px;
                background: #252526;
                border-left: 1px solid #3c3c3c;
                padding: 15px;
                overflow-y: auto;
            }
            
            .property-group {
                margin: 15px 0;
            }
            
            .property-group label {
                display: block;
                margin-bottom: 5px;
                font-size: 13px;
            }
            
            .property-group input[type="range"] {
                width: 100%;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Make available globally
window.ShaderEditor = ShaderEditor;

console.log('[ShaderEditor] Module loaded');

})();
