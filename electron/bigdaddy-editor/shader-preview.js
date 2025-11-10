/**
 * BigDaddy Editor - Shader Preview
 * 
 * Live WebGL shader preview with error reporting.
 * Supports GLSL, vertex shaders, and fragment shaders.
 * 
 * @author BigDaddyG IDE Team
 * @version 1.0.0
 */

class ShaderPreview {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.animationFrameId = null;
        this.startTime = Date.now();
        this.errors = [];
        
        this.initCanvas();
        console.log('[ShaderPreview] Initialized');
    }

    /**
     * Initialize WebGL canvas
     */
    initCanvas() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas.style.border = '1px solid #3e3e42';
        this.canvas.style.borderRadius = '4px';
        
        // Get WebGL context
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        
        if (!this.gl) {
            console.error('[ShaderPreview] WebGL not supported');
            return;
        }

        // Setup viewport
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Create default shader
        this.createDefaultShader();
    }

    /**
     * Create default shader
     */
    createDefaultShader() {
        const defaultVertexShader = `
            attribute vec4 position;
            void main() {
                gl_Position = position;
            }
        `;

        const defaultFragmentShader = `
            precision mediump float;
            uniform float time;
            uniform vec2 resolution;
            
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0.0, 2.0, 4.0));
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        this.updateShader(defaultVertexShader, defaultFragmentShader);
    }

    /**
     * Update shader code
     */
    updateShader(vertexSource, fragmentSource) {
        const gl = this.gl;
        if (!gl) return;

        this.errors = [];

        try {
            // Create shaders
            const vertexShader = this.compileShader(gl, vertexSource, gl.VERTEX_SHADER);
            const fragmentShader = this.compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

            // Create program
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            // Check for errors
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const error = gl.getProgramInfoLog(program);
                this.errors.push(`Shader linking error: ${error}`);
                console.error('[ShaderPreview]', error);
                return false;
            }

            // Clean up old program
            if (this.program) {
                gl.deleteProgram(this.program);
            }

            this.program = program;
            gl.useProgram(program);

            // Setup geometry (full-screen quad)
            this.setupGeometry();

            // Get uniform locations
            this.uniforms = {
                time: gl.getUniformLocation(program, 'time'),
                resolution: gl.getUniformLocation(program, 'resolution')
            };

            // Start rendering
            this.startAnimation();

            console.log('[ShaderPreview] Shader compiled successfully');
            return true;

        } catch (error) {
            this.errors.push(error.message);
            console.error('[ShaderPreview]', error);
            return false;
        }
    }

    /**
     * Compile shader
     */
    compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${error}`);
        }

        return shader;
    }

    /**
     * Setup geometry
     */
    setupGeometry() {
        const gl = this.gl;

        // Full-screen quad
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const position = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    }

    /**
     * Start animation loop
     */
    startAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        const render = () => {
            this.render();
            this.animationFrameId = requestAnimationFrame(render);
        };

        render();
    }

    /**
     * Stop animation loop
     */
    stopAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Render frame
     */
    render() {
        const gl = this.gl;
        if (!gl || !this.program) return;

        // Clear
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Update uniforms
        const time = (Date.now() - this.startTime) / 1000.0;
        
        if (this.uniforms.time) {
            gl.uniform1f(this.uniforms.time, time);
        }
        
        if (this.uniforms.resolution) {
            gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        }

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * Show preview
     */
    show() {
        if (this.canvas && this.container) {
            this.container.appendChild(this.canvas);
            this.startAnimation();
        }
    }

    /**
     * Hide preview
     */
    hide() {
        this.stopAnimation();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    /**
     * Get errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Destroy preview
     */
    destroy() {
        this.stopAnimation();
        
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShaderPreview;
}
