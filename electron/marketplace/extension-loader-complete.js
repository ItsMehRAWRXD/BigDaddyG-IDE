/**
 * BigDaddyG IDE - Complete Extension Loader
 * Full installation pipeline: Download → Verify → Extract → Activate
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { promisify } = require('util');
const AdmZip = require('adm-zip');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

class ExtensionLoaderComplete {
    constructor(extensionHost) {
        this.extensionHost = extensionHost;
        this.extensionsDir = path.join(__dirname, '../extensions');
        this.tempDir = path.join(__dirname, '../temp');
        this.downloadQueue = [];
        this.isProcessing = false;
        this.downloadCache = new Map(); // Cache for downloaded extensions
        this.installationStatus = new Set(); // Track currently installing extensions
        
        this.ensureDirectories();
        console.log('[ExtensionLoader] Complete extension loader initialized');
    }
    
    /**
     * Ensure required directories exist
     */
    async ensureDirectories() {
        try {
            if (!fs.existsSync(this.extensionsDir)) {
                await mkdir(this.extensionsDir, { recursive: true });
            }
            if (!fs.existsSync(this.tempDir)) {
                await mkdir(this.tempDir, { recursive: true });
            }
        } catch (error) {
            console.error('[ExtensionLoader] Failed to create directories:', error);
        }
    }
    
    /**
     * STEP 1: Download Extension
     */
    async downloadExtension(extensionId, url, onProgress) {
        return new Promise((resolve, reject) => {
            console.log(`[ExtensionLoader] 📥 Downloading ${extensionId} from ${url}`);
            
            const tempFile = path.join(this.tempDir, `${extensionId}.vsix`);
            const file = fs.createWriteStream(tempFile);
            
            https.get(url, (response) => {
                const totalSize = parseInt(response.headers['content-length'], 10);
                let downloadedSize = 0;
                
                response.on('data', (chunk) => {
                    downloadedSize += chunk.length;
                    const progress = (downloadedSize / totalSize) * 100;
                    
                    if (onProgress) {
                        onProgress({
                            step: 'download',
                            progress: progress.toFixed(1),
                            downloaded: downloadedSize,
                            total: totalSize
                        });
                    }
                });
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close(() => {
                        console.log(`[ExtensionLoader] ✅ Downloaded: ${extensionId}`);
                        resolve({
                            success: true,
                            tempFile,
                            size: downloadedSize
                        });
                    });
                });
                
            }).on('error', (error) => {
                fs.unlink(tempFile, () => {});
                console.error(`[ExtensionLoader] ❌ Download failed: ${extensionId}`, error);
                reject(error);
            });
        });
    }
    
    /**
     * STEP 2: Verify Extension
     */
    async verifyExtension(tempFile, expectedHash = null) {
        try {
            console.log(`[ExtensionLoader] 🔍 Verifying: ${tempFile}`);
            
            // Check file exists
            if (!fs.existsSync(tempFile)) {
                throw new Error('Downloaded file not found');
            }
            
            // Check file size
            const stats = fs.statSync(tempFile);
            if (stats.size === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            // Verify file hash if provided
            if (expectedHash) {
                const fileBuffer = await readFile(tempFile);
                const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
                
                if (hash !== expectedHash) {
                    throw new Error('File hash mismatch - possible corruption or tampering');
                }
                
                console.log(`[ExtensionLoader] ✅ Hash verified: ${hash.substring(0, 16)}...`);
            }
            
            // Verify ZIP structure
            try {
                const zip = new AdmZip(tempFile);
                const zipEntries = zip.getEntries();
                
                if (zipEntries.length === 0) {
                    throw new Error('ZIP file is empty');
                }
                
                // Check for package.json
                const hasPackageJson = zipEntries.some(entry => 
                    entry.entryName.endsWith('package.json')
                );
                
                if (!hasPackageJson) {
                    throw new Error('package.json not found in extension');
                }
                
                console.log(`[ExtensionLoader] ✅ ZIP structure verified (${zipEntries.length} files)`);
                
            } catch (zipError) {
                throw new Error(`Invalid ZIP file: ${zipError.message}`);
            }
            
            console.log(`[ExtensionLoader] ✅ Verification passed`);
            return {
                success: true,
                size: stats.size,
                verified: true
            };
            
        } catch (error) {
            console.error(`[ExtensionLoader] ❌ Verification failed:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * STEP 3: Extract Extension
     */
    async extractExtension(tempFile, extensionId, onProgress) {
        try {
            console.log(`[ExtensionLoader] 📦 Extracting: ${extensionId}`);
            
            const targetDir = path.join(this.extensionsDir, extensionId);
            
            // Remove existing installation
            if (fs.existsSync(targetDir)) {
                console.log(`[ExtensionLoader] 🗑️ Removing old version...`);
                fs.rmSync(targetDir, { recursive: true, force: true });
            }
            
            // Create target directory
            await mkdir(targetDir, { recursive: true });
            
            // Extract ZIP
            const zip = new AdmZip(tempFile);
            const zipEntries = zip.getEntries();
            const totalFiles = zipEntries.length;
            let extractedFiles = 0;
            
            // Extract files
            for (const entry of zipEntries) {
                try {
                    if (!entry.isDirectory) {
                        const entryPath = path.join(targetDir, entry.entryName);
                        const entryDir = path.dirname(entryPath);
                        
                        // Ensure directory exists
                        if (!fs.existsSync(entryDir)) {
                            await mkdir(entryDir, { recursive: true });
                        }
                        
                        // Extract file
                        const content = entry.getData();
                        await writeFile(entryPath, content);
                        
                        extractedFiles++;
                        
                        if (onProgress) {
                            onProgress({
                                step: 'extract',
                                progress: ((extractedFiles / totalFiles) * 100).toFixed(1),
                                file: entry.entryName
                            });
                        }
                    }
                } catch (entryError) {
                    console.warn(`[ExtensionLoader] ⚠️ Failed to extract ${entry.entryName}:`, entryError.message);
                }
            }
            
            console.log(`[ExtensionLoader] ✅ Extracted ${extractedFiles}/${totalFiles} files`);
            
            // Clean up temp file
            try {
                fs.unlinkSync(tempFile);
            } catch (e) {
                console.warn('[ExtensionLoader] Failed to delete temp file:', e.message);
            }
            
            return {
                success: true,
                targetDir,
                filesExtracted: extractedFiles
            };
            
        } catch (error) {
            console.error(`[ExtensionLoader] ❌ Extraction failed:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * STEP 4: Activate Extension
     */
    async activateExtension(extensionId, targetDir) {
        try {
            console.log(`[ExtensionLoader] 🚀 Activating: ${extensionId}`);
            
            // Use extension host to activate
            if (!this.extensionHost) {
                throw new Error('Extension host not available');
            }
            
            const result = await this.extensionHost.activate(extensionId, targetDir);
            
            if (!result.success) {
                throw new Error(result.error || 'Activation failed');
            }
            
            console.log(`[ExtensionLoader] ✅ Activated: ${extensionId}`);
            return {
                success: true,
                context: result.context
            };
            
        } catch (error) {
            console.error(`[ExtensionLoader] ❌ Activation failed:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * COMPLETE INSTALLATION PIPELINE
     */
    async installExtension(extensionId, url, options = {}) {
        const {
            expectedHash = null,
            onProgress = null,
            autoActivate = true
        } = options;
        
        // Check if already installing
        if (this.installationStatus.has(extensionId)) {
            return {
                success: false,
                error: 'Extension is already being installed'
            };
        }
        
        try {
            // Mark as installing
            this.installationStatus.add(extensionId);
            
            console.log(`[ExtensionLoader] 🔧 Starting installation: ${extensionId}`);
            
            // Step 1: Download
            if (onProgress) onProgress({ step: 'download', progress: 0 });
            const downloadResult = await this.downloadExtension(
                extensionId,
                url,
                onProgress
            );
            
            if (!downloadResult.success) {
                throw new Error('Download failed');
            }
            
            // Step 2: Verify
            if (onProgress) onProgress({ step: 'verify', progress: 0 });
            const verifyResult = await this.verifyExtension(
                downloadResult.tempFile,
                expectedHash
            );
            
            if (!verifyResult.success) {
                throw new Error(`Verification failed: ${verifyResult.error}`);
            }
            
            // Step 3: Extract
            if (onProgress) onProgress({ step: 'extract', progress: 0 });
            const extractResult = await this.extractExtension(
                downloadResult.tempFile,
                extensionId,
                onProgress
            );
            
            if (!extractResult.success) {
                throw new Error(`Extraction failed: ${extractResult.error}`);
            }
            
            // Step 4: Activate (if requested)
            let activateResult = null;
            if (autoActivate) {
                if (onProgress) onProgress({ step: 'activate', progress: 0 });
                activateResult = await this.activateExtension(
                    extensionId,
                    extractResult.targetDir
                );
                
                if (!activateResult.success) {
                    console.warn(`[ExtensionLoader] ⚠️ Activation failed (extension installed but not active)`);
                }
            }
            
            // Complete
            if (onProgress) onProgress({ step: 'complete', progress: 100 });
            
            // Cache successful installation
            this.downloadCache.set(extensionId, {
                url,
                installPath: extractResult.targetDir,
                timestamp: Date.now()
            });
            
            console.log(`[ExtensionLoader] ✅ Installation complete: ${extensionId}`);
            return {
                success: true,
                extensionId,
                installPath: extractResult.targetDir,
                activated: autoActivate && activateResult?.success,
                steps: {
                    download: downloadResult,
                    verify: verifyResult,
                    extract: extractResult,
                    activate: activateResult
                }
            };
            
        } catch (error) {
            console.error(`[ExtensionLoader] ❌ Installation failed: ${extensionId}`, error);
            
            if (onProgress) {
                onProgress({
                    step: 'error',
                    progress: 0,
                    error: error.message
                });
            }
            
            return {
                success: false,
                error: error.message
            };
        } finally {
            // Remove from installing status
            this.installationStatus.delete(extensionId);
        }
    }
    
    /**
     * Uninstall extension
     */
    async uninstallExtension(extensionId) {
        try {
            console.log(`[ExtensionLoader] 🗑️ Uninstalling: ${extensionId}`);
            
            // Deactivate if active
            if (this.extensionHost && this.extensionHost.isActive(extensionId)) {
                await this.extensionHost.deactivate(extensionId);
            }
            
            // Remove files
            const extensionDir = path.join(this.extensionsDir, extensionId);
            if (fs.existsSync(extensionDir)) {
                fs.rmSync(extensionDir, { recursive: true, force: true });
                console.log(`[ExtensionLoader] ✅ Uninstalled: ${extensionId}`);
            } else {
                console.log(`[ExtensionLoader] ⚠️ Extension not found: ${extensionId}`);
            }
            
            return { success: true };
            
        } catch (error) {
            console.error(`[ExtensionLoader] ❌ Uninstall failed:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get installed extensions
     */
    getInstalledExtensions() {
        try {
            if (!fs.existsSync(this.extensionsDir)) {
                return [];
            }
            
            const dirs = fs.readdirSync(this.extensionsDir);
            const extensions = [];
            
            for (const dir of dirs) {
                const extensionPath = path.join(this.extensionsDir, dir);
                const packagePath = path.join(extensionPath, 'package.json');
                
                if (fs.existsSync(packagePath)) {
                    try {
                        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                        extensions.push({
                            id: dir,
                            name: packageJson.name || dir,
                            version: packageJson.version || '0.0.0',
                            description: packageJson.description || '',
                            path: extensionPath
                        });
                    } catch (e) {
                        console.warn(`[ExtensionLoader] Failed to read package.json for ${dir}`);
                    }
                }
            }
            
            return extensions;
            
        } catch (error) {
            console.error('[ExtensionLoader] Failed to get installed extensions:', error);
            return [];
        }
    }
}

module.exports = ExtensionLoaderComplete;

// Export for browser
if (typeof window !== 'undefined') {
    window.ExtensionLoaderComplete = ExtensionLoaderComplete;
}
