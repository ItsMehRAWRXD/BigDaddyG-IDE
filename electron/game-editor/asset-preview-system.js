/**
 * BigDaddyG IDE - Asset Preview System
 * Handles preview and editing of all game asset types
 */

// Browser-safe requires
const fs = (typeof require !== 'undefined' && typeof process !== 'undefined' && process.versions?.electron) ? require('fs') : null;
const path = (typeof require !== 'undefined' && typeof process !== 'undefined' && process.versions?.electron) ? require('path') : null;

class AssetPreviewSystem {
    constructor() {
        this.supportedTypes = {
            images: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tga', '.webp'],
            models: ['.obj', '.fbx', '.gltf', '.glb', '.blend', '.dae'],
            audio: ['.mp3', '.wav', '.ogg', '.flac', '.m4a'],
            video: ['.mp4', '.webm', '.avi', '.mov'],
            scripts: ['.js', '.ts', '.cs', '.cpp', '.h', '.gd', '.py'],
            shaders: ['.shader', '.glsl', '.hlsl', '.vert', '.frag'],
            materials: ['.mat', '.material'],
            scenes: ['.unity', '.tscn', '.scene', '.umap'],
            prefabs: ['.prefab', '.tscn'],
            animations: ['.anim', '.fbx'],
            fonts: ['.ttf', '.otf', '.woff', '.woff2'],
            data: ['.json', '.xml', '.yaml', '.yml', '.csv']
        };
        
        this.previewCache = new Map();
        console.log('[AssetPreviewSystem] Initialized');
    }
    
    /**
     * Get asset type from file extension
     */
    getAssetType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        
        for (const [type, extensions] of Object.entries(this.supportedTypes)) {
            if (extensions.includes(ext)) {
                return type;
            }
        }
        
        return 'unknown';
    }
    
    /**
     * Generate preview for asset
     */
    async generatePreview(filePath, options = {}) {
        const assetType = this.getAssetType(filePath);
        
        // Check cache
        if (this.previewCache.has(filePath) && !options.forceRefresh) {
            return this.previewCache.get(filePath);
        }
        
        let preview;
        
        switch (assetType) {
            case 'images':
                preview = await this.previewImage(filePath, options);
                break;
            case 'models':
                preview = await this.previewModel(filePath, options);
                break;
            case 'audio':
                preview = await this.previewAudio(filePath, options);
                break;
            case 'video':
                preview = await this.previewVideo(filePath, options);
                break;
            case 'scripts':
                preview = await this.previewScript(filePath, options);
                break;
            case 'shaders':
                preview = await this.previewShader(filePath, options);
                break;
            case 'materials':
                preview = await this.previewMaterial(filePath, options);
                break;
            case 'scenes':
                preview = await this.previewScene(filePath, options);
                break;
            case 'prefabs':
                preview = await this.previewPrefab(filePath, options);
                break;
            case 'animations':
                preview = await this.previewAnimation(filePath, options);
                break;
            case 'fonts':
                preview = await this.previewFont(filePath, options);
                break;
            case 'data':
                preview = await this.previewData(filePath, options);
                break;
            default:
                preview = await this.previewGeneric(filePath, options);
        }
        
        // Cache preview
        this.previewCache.set(filePath, preview);
        
        return preview;
    }
    
    /**
     * Preview image asset
     */
    async previewImage(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'image',
                path: filePath,
                thumbnail: `file://${filePath}`,
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview image-preview">
                        <img src="file://${filePath}" alt="Image Preview" />
                        <div class="preview-info">
                            <p><strong>Format:</strong> ${path.extname(filePath).substring(1).toUpperCase()}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview 3D model
     */
    async previewModel(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'model',
                path: filePath,
                thumbnail: '🗿',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview model-preview">
                        <div class="model-viewer">
                            <canvas id="model-canvas"></canvas>
                            <div class="model-placeholder">
                                <span style="font-size: 64px;">🗿</span>
                                <p>3D Model Preview</p>
                                <p>${path.basename(filePath)}</p>
                            </div>
                        </div>
                        <div class="preview-info">
                            <p><strong>Format:</strong> ${path.extname(filePath).substring(1).toUpperCase()}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview audio file
     */
    async previewAudio(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'audio',
                path: filePath,
                thumbnail: '🔊',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview audio-preview">
                        <div class="audio-player">
                            <audio controls>
                                <source src="file://${filePath}" type="audio/${path.extname(filePath).substring(1)}">
                            </audio>
                        </div>
                        <div class="preview-info">
                            <p><strong>Format:</strong> ${path.extname(filePath).substring(1).toUpperCase()}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview video file
     */
    async previewVideo(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'video',
                path: filePath,
                thumbnail: '🎬',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview video-preview">
                        <div class="video-player">
                            <video controls width="100%">
                                <source src="file://${filePath}" type="video/${path.extname(filePath).substring(1)}">
                            </video>
                        </div>
                        <div class="preview-info">
                            <p><strong>Format:</strong> ${path.extname(filePath).substring(1).toUpperCase()}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview script file
     */
    async previewScript(filePath, options) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            const lines = content.split('\n').length;
            
            // Get first 20 lines for preview
            const preview = content.split('\n').slice(0, 20).join('\n');
            
            return {
                type: 'script',
                path: filePath,
                thumbnail: '📄',
                metadata: {
                    size: stats.size,
                    lines: lines,
                    language: this.detectLanguage(filePath),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview script-preview">
                        <pre><code>${this.escapeHtml(preview)}${lines > 20 ? '\n...' : ''}</code></pre>
                        <div class="preview-info">
                            <p><strong>Language:</strong> ${this.detectLanguage(filePath)}</p>
                            <p><strong>Lines:</strong> ${lines}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview shader file
     */
    async previewShader(filePath, options) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            
            // Get first 30 lines
            const preview = content.split('\n').slice(0, 30).join('\n');
            
            return {
                type: 'shader',
                path: filePath,
                thumbnail: '✨',
                metadata: {
                    size: stats.size,
                    shaderType: this.detectShaderType(content),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview shader-preview">
                        <div class="shader-viewer">
                            <canvas id="shader-canvas" width="300" height="300"></canvas>
                            <div class="shader-placeholder">
                                <span style="font-size: 64px;">✨</span>
                                <p>Shader Preview</p>
                            </div>
                        </div>
                        <pre><code>${this.escapeHtml(preview)}</code></pre>
                        <div class="preview-info">
                            <p><strong>Type:</strong> ${this.detectShaderType(content)}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview material file
     */
    async previewMaterial(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'material',
                path: filePath,
                thumbnail: '🎨',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview material-preview">
                        <div class="material-sphere">
                            <canvas id="material-canvas"></canvas>
                            <div class="material-placeholder">
                                <span style="font-size: 64px;">🎨</span>
                                <p>Material Preview</p>
                            </div>
                        </div>
                        <div class="preview-info">
                            <p><strong>Type:</strong> Material</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview scene file
     */
    async previewScene(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'scene',
                path: filePath,
                thumbnail: '🎬',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview scene-preview">
                        <div class="scene-thumbnail">
                            <span style="font-size: 64px;">🎬</span>
                            <p>Scene Preview</p>
                            <p>${path.basename(filePath)}</p>
                        </div>
                        <div class="preview-info">
                            <p><strong>Type:</strong> Scene</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview prefab file
     */
    async previewPrefab(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'prefab',
                path: filePath,
                thumbnail: '📦',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview prefab-preview">
                        <div class="prefab-thumbnail">
                            <span style="font-size: 64px;">📦</span>
                            <p>Prefab Preview</p>
                            <p>${path.basename(filePath)}</p>
                        </div>
                        <div class="preview-info">
                            <p><strong>Type:</strong> Prefab</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview animation file
     */
    async previewAnimation(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'animation',
                path: filePath,
                thumbnail: '🎭',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview animation-preview">
                        <div class="animation-player">
                            <span style="font-size: 64px;">🎭</span>
                            <p>Animation Preview</p>
                            <p>${path.basename(filePath)}</p>
                        </div>
                        <div class="preview-info">
                            <p><strong>Type:</strong> Animation</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview font file
     */
    async previewFont(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'font',
                path: filePath,
                thumbnail: '🔤',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview font-preview">
                        <div class="font-sample">
                            <p style="font-size: 24px;">The quick brown fox</p>
                            <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                            <p>abcdefghijklmnopqrstuvwxyz</p>
                            <p>0123456789</p>
                        </div>
                        <div class="preview-info">
                            <p><strong>Format:</strong> ${path.extname(filePath).substring(1).toUpperCase()}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview data file
     */
    async previewData(filePath, options) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            
            // Format based on type
            let formatted = content;
            const ext = path.extname(filePath).toLowerCase();
            
            if (ext === '.json') {
                try {
                    formatted = JSON.stringify(JSON.parse(content), null, 2);
                } catch (e) {
        console.error('[Error]', e);
    }
            }
            
            // Get first 30 lines
            const preview = formatted.split('\n').slice(0, 30).join('\n');
            
            return {
                type: 'data',
                path: filePath,
                thumbnail: '📊',
                metadata: {
                    size: stats.size,
                    format: ext.substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview data-preview">
                        <pre><code>${this.escapeHtml(preview)}</code></pre>
                        <div class="preview-info">
                            <p><strong>Format:</strong> ${ext.substring(1).toUpperCase()}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Generic preview for unknown types
     */
    async previewGeneric(filePath, options) {
        try {
            const stats = fs.statSync(filePath);
            
            return {
                type: 'generic',
                path: filePath,
                thumbnail: '📄',
                metadata: {
                    size: stats.size,
                    format: path.extname(filePath).substring(1).toUpperCase(),
                    modified: stats.mtime
                },
                html: `
                    <div class="asset-preview generic-preview">
                        <div class="generic-icon">
                            <span style="font-size: 64px;">📄</span>
                            <p>${path.basename(filePath)}</p>
                        </div>
                        <div class="preview-info">
                            <p><strong>Type:</strong> ${path.extname(filePath).substring(1).toUpperCase()}</p>
                            <p><strong>Size:</strong> ${this.formatFileSize(stats.size)}</p>
                        </div>
                    </div>
                `
            };
        } catch (error) {
            return this.previewError(filePath, error);
        }
    }
    
    /**
     * Preview error
     */
    previewError(filePath, error) {
        return {
            type: 'error',
            path: filePath,
            thumbnail: '❌',
            error: error.message,
            html: `
                <div class="asset-preview error-preview">
                    <p>❌ Error loading preview</p>
                    <p>${error.message}</p>
                </div>
            `
        };
    }
    
    /**
     * Detect language from file extension
     */
    detectLanguage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const languages = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.cs': 'C#',
            '.cpp': 'C++',
            '.h': 'C++ Header',
            '.gd': 'GDScript',
            '.py': 'Python',
            '.lua': 'Lua'
        };
        return languages[ext] || 'Unknown';
    }
    
    /**
     * Detect shader type from content
     */
    detectShaderType(content) {
        if (content.includes('vertex')) return 'Vertex Shader';
        if (content.includes('fragment')) return 'Fragment Shader';
        if (content.includes('compute')) return 'Compute Shader';
        return 'Shader';
    }
    
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.previewCache.clear();
        console.log('[AssetPreviewSystem] Cache cleared');
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            supportedTypes: Object.keys(this.supportedTypes).length,
            cachedPreviews: this.previewCache.size
        };
    }
}

module.exports = AssetPreviewSystem;
