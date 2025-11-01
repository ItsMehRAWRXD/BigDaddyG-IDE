/**
 * BigDaddyG IDE - Marketplace Client
 * Connects to VS Code Marketplace to search, download, and install extensions
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const AdmZip = require('adm-zip'); // We'll need to add this to package.json

class MarketplaceClient extends EventEmitter {
    constructor() {
        super();
        
        // VS Code Marketplace API endpoints
        this.marketplaceURL = 'https://marketplace.visualstudio.com';
        this.galleryAPI = `${this.marketplaceURL}/_apis/public/gallery`;
        this.assetURL = `${this.marketplaceURL}/_apis/public/gallery/publishers`;
        
        // Extension storage
        this.extensionsDir = path.join(
            process.env.APPDATA || process.env.HOME || process.cwd(),
            'BigDaddyG',
            'extensions'
        );
        
        // API version
        this.apiVersion = '7.2-preview.1';
        
        console.log('[Marketplace] Client initialized');
        console.log(`[Marketplace] Extensions directory: ${this.extensionsDir}`);
    }
    
    /**
     * Initialize marketplace client
     */
    async initialize() {
        // Ensure extensions directory exists
        await fs.mkdir(this.extensionsDir, { recursive: true });
        console.log('[Marketplace] ✅ Ready');
    }
    
    /**
     * Search for extensions
     */
    async searchExtensions(query, pageNumber = 1, pageSize = 50) {
        console.log(`[Marketplace] Searching for: "${query}"`);
        
        try {
            const filters = [
                {
                    criteria: [
                        { filterType: 8, value: 'Microsoft.VisualStudio.Code' }, // Target VS Code
                        { filterType: 10, value: query }, // Search term
                        { filterType: 12, value: '5366' } // Exclude unpublished
                    ],
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                    sortBy: 4, // InstallCount
                    sortOrder: 2 // Descending
                }
            ];
            
            const flags = 0x1 | 0x2 | 0x4 | 0x8 | 0x10 | 0x20 | 0x40 | 0x80 | 0x100;
            
            const requestBody = JSON.stringify({ filters, flags });
            
            const results = await this._makeRequest(
                `${this.galleryAPI}/extensionquery`,
                'POST',
                {
                    'Content-Type': 'application/json',
                    'Accept': `application/json;api-version=${this.apiVersion}`,
                    'Content-Length': Buffer.byteLength(requestBody)
                },
                requestBody
            );
            
            const extensions = results.results?.[0]?.extensions || [];
            
            console.log(`[Marketplace] Found ${extensions.length} extensions`);
            
            return extensions.map(ext => this._parseExtension(ext));
            
        } catch (error) {
            console.error('[Marketplace] Search error:', error);
            throw error;
        }
    }
    
    /**
     * Get extension details
     */
    async getExtension(publisher, extensionName) {
        console.log(`[Marketplace] Getting extension: ${publisher}.${extensionName}`);
        
        try {
            const filters = [
                {
                    criteria: [
                        { filterType: 7, value: `${publisher}.${extensionName}` }
                    ]
                }
            ];
            
            const flags = 0x1 | 0x2 | 0x4 | 0x8 | 0x10 | 0x20 | 0x40 | 0x80 | 0x100;
            
            const requestBody = JSON.stringify({ filters, flags });
            
            const results = await this._makeRequest(
                `${this.galleryAPI}/extensionquery`,
                'POST',
                {
                    'Content-Type': 'application/json',
                    'Accept': `application/json;api-version=${this.apiVersion}`
                },
                requestBody
            );
            
            const extension = results.results?.[0]?.extensions?.[0];
            
            if (!extension) {
                throw new Error(`Extension not found: ${publisher}.${extensionName}`);
            }
            
            return this._parseExtension(extension);
            
        } catch (error) {
            console.error('[Marketplace] Get extension error:', error);
            throw error;
        }
    }
    
    /**
     * Download extension
     */
    async downloadExtension(publisher, extensionName, version = 'latest') {
        console.log(`[Marketplace] Downloading: ${publisher}.${extensionName}@${version}`);
        
        try {
            // Get extension details if version is 'latest'
            let actualVersion = version;
            if (version === 'latest') {
                const ext = await this.getExtension(publisher, extensionName);
                actualVersion = ext.version;
            }
            
            // Download VSIX
            const vsixURL = `${this.assetURL}/${publisher}/vsextensions/${extensionName}/${actualVersion}/vspackage`;
            
            console.log(`[Marketplace] Downloading from: ${vsixURL}`);
            
            const vsixBuffer = await this._downloadFile(vsixURL);
            
            // Save VSIX to temp location
            const vsixPath = path.join(this.extensionsDir, `${publisher}.${extensionName}-${actualVersion}.vsix`);
            await fs.writeFile(vsixPath, vsixBuffer);
            
            console.log(`[Marketplace] ✅ Downloaded: ${vsixPath}`);
            
            this.emit('extension-downloaded', {
                publisher,
                extensionName,
                version: actualVersion,
                path: vsixPath
            });
            
            return vsixPath;
            
        } catch (error) {
            console.error('[Marketplace] Download error:', error);
            throw error;
        }
    }
    
    /**
     * Install extension from VSIX
     */
    async installExtension(vsixPath, extensionHost) {
        console.log(`[Marketplace] Installing: ${vsixPath}`);
        
        try {
            // Extract VSIX (it's a ZIP file)
            const zip = new AdmZip(vsixPath);
            
            // Read package.json from VSIX
            const packageEntry = zip.getEntry('extension/package.json');
            if (!packageEntry) {
                throw new Error('Invalid VSIX: missing package.json');
            }
            
            const packageJSON = JSON.parse(packageEntry.getData().toString('utf8'));
            const extensionId = `${packageJSON.publisher}.${packageJSON.name}`;
            
            // Extract to extensions directory
            const extractPath = path.join(this.extensionsDir, extensionId);
            
            // Remove existing installation
            try {
                await fs.rm(extractPath, { recursive: true, force: true });
            } catch (error) {
                // Directory might not exist, ignore
            }
            
            // Create directory
            await fs.mkdir(extractPath, { recursive: true });
            
            // Extract all files from extension/ folder
            zip.getEntries().forEach(entry => {
                if (entry.entryName.startsWith('extension/')) {
                    const relativePath = entry.entryName.substring('extension/'.length);
                    if (relativePath) {
                        const targetPath = path.join(extractPath, relativePath);
                        
                        if (entry.isDirectory) {
                            fs.mkdir(targetPath, { recursive: true }).catch(() => {});
                        } else {
                            fs.mkdir(path.dirname(targetPath), { recursive: true })
                                .then(() => fs.writeFile(targetPath, entry.getData()))
                                .catch(err => console.error(`Error extracting ${relativePath}:`, err));
                        }
                    }
                }
            });
            
            // Wait a bit for extraction to complete
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`[Marketplace] ✅ Extracted to: ${extractPath}`);
            
            // Load extension into extension host
            if (extensionHost) {
                const extension = await extensionHost.loadExtension(extractPath);
                console.log(`[Marketplace] ✅ Loaded extension: ${extensionId}`);
                
                this.emit('extension-installed', {
                    extensionId,
                    path: extractPath,
                    extension
                });
                
                return extension;
            }
            
            return {
                extensionId,
                path: extractPath
            };
            
        } catch (error) {
            console.error('[Marketplace] Installation error:', error);
            throw error;
        }
    }
    
    /**
     * Uninstall extension
     */
    async uninstallExtension(extensionId, extensionHost) {
        console.log(`[Marketplace] Uninstalling: ${extensionId}`);
        
        try {
            const extensionPath = path.join(this.extensionsDir, extensionId);
            
            // Unload from extension host first
            if (extensionHost) {
                try {
                    await extensionHost.unloadExtension(extensionId);
                } catch (error) {
                    console.warn(`[Marketplace] Extension not loaded: ${extensionId}`);
                }
            }
            
            // Remove directory
            await fs.rm(extensionPath, { recursive: true, force: true });
            
            console.log(`[Marketplace] ✅ Uninstalled: ${extensionId}`);
            
            this.emit('extension-uninstalled', { extensionId });
            
        } catch (error) {
            console.error('[Marketplace] Uninstall error:', error);
            throw error;
        }
    }
    
    /**
     * List installed extensions
     */
    async listInstalledExtensions() {
        try {
            const entries = await fs.readdir(this.extensionsDir, { withFileTypes: true });
            
            const extensions = [];
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const packagePath = path.join(this.extensionsDir, entry.name, 'package.json');
                    
                    try {
                        const packageJSON = JSON.parse(await fs.readFile(packagePath, 'utf8'));
                        extensions.push({
                            id: entry.name,
                            name: packageJSON.name,
                            displayName: packageJSON.displayName || packageJSON.name,
                            publisher: packageJSON.publisher,
                            version: packageJSON.version,
                            description: packageJSON.description,
                            path: path.join(this.extensionsDir, entry.name)
                        });
                    } catch (error) {
                        // Skip invalid extensions
                    }
                }
            }
            
            return extensions;
            
        } catch (error) {
            console.error('[Marketplace] List installed error:', error);
            return [];
        }
    }
    
    /**
     * Helper: Parse extension from API response
     */
    _parseExtension(ext) {
        const latestVersion = ext.versions?.[0];
        
        return {
            id: ext.extensionId,
            publisher: ext.publisher?.publisherName || '',
            name: ext.extensionName || '',
            displayName: ext.displayName || ext.extensionName || '',
            shortDescription: ext.shortDescription || '',
            version: latestVersion?.version || '0.0.0',
            lastUpdated: latestVersion?.lastUpdated || new Date().toISOString(),
            installCount: ext.statistics?.find(s => s.statisticName === 'install')?.value || 0,
            averageRating: ext.statistics?.find(s => s.statisticName === 'averagerating')?.value || 0,
            ratingCount: ext.statistics?.find(s => s.statisticName === 'ratingcount')?.value || 0,
            icon: ext.versions?.[0]?.files?.find(f => f.assetType === 'Microsoft.VisualStudio.Services.Icons.Default')?.source || '',
            raw: ext
        };
    }
    
    /**
     * Helper: Make HTTPS request
     */
    _makeRequest(url, method = 'GET', headers = {}, body = null) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: headers
            };
            
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (error) {
                            resolve(data);
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });
            
            req.on('error', reject);
            
            if (body) {
                req.write(body);
            }
            
            req.end();
        });
    }
    
    /**
     * Helper: Download file
     */
    _downloadFile(url) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: 'GET'
            };
            
            const req = https.request(options, (res) => {
                const chunks = [];
                
                res.on('data', chunk => {
                    chunks.push(chunk);
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(Buffer.concat(chunks));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', reject);
            req.end();
        });
    }
}

module.exports = MarketplaceClient;

