/**
 * FileExplorer - High-performance file browser with AI integration
 */

class FileExplorer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentPath = '';
    this.files = [];
    this.filteredFiles = [];
    this.virtualScroller = null;
    this.init();
  }

  init() {
    this.render();
    this.setupVirtualScrolling();
    this.setupSearch();
  }

  render() {
    this.container.innerHTML = `
      <div class="explorer-header">
        <input type="text" id="file-search" placeholder="🔍 Search files..." 
               style="width:100%;padding:8px;background:#2d2d2d;border:1px solid #444;color:#fff;border-radius:4px;">
      </div>
      <div class="explorer-toolbar">
        <button onclick="this.createFile()" style="background:var(--green);color:#000;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">+ File</button>
        <button onclick="this.createFolder()" style="background:var(--cyan);color:#000;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">+ Folder</button>
        <button onclick="this.refresh()" style="background:var(--orange);color:#000;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">🔄</button>
      </div>
      <div id="file-list" class="file-list" style="flex:1;overflow-y:auto;"></div>
    `;
  }

  setupVirtualScrolling() {
    const fileList = document.getElementById('file-list');
    this.virtualScroller = new VirtualScroller(fileList, {
      itemHeight: 32,
      renderItem: (item, index) => this.renderFileItem(item, index)
    });
  }

  setupSearch() {
    const searchInput = document.getElementById('file-search');
    searchInput.addEventListener('input', (e) => {
      this.filterFiles(e.target.value);
    });
  }

  async loadFiles(path = '') {
    try {
      if (window.electron && window.electron.getFiles) {
        this.files = await window.electron.getFiles(path);
      } else {
        // Fallback mock data
        this.files = [
          { name: 'src', type: 'folder', path: 'src/' },
          { name: 'package.json', type: 'file', path: 'package.json' },
          { name: 'README.md', type: 'file', path: 'README.md' }
        ];
      }
      
      this.currentPath = path;
      this.filteredFiles = [...this.files];
      this.virtualScroller.setItems(this.filteredFiles);
    } catch (error) {
      console.error('[FileExplorer] Load error:', error);
    }
  }

  filterFiles(query) {
    if (!query) {
      this.filteredFiles = [...this.files];
    } else {
      this.filteredFiles = this.files.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.virtualScroller.setItems(this.filteredFiles);
  }

  renderFileItem(file, index) {
    const icon = file.type === 'folder' ? '📁' : this.getFileIcon(file.name);
    const element = document.createElement('div');
    element.className = 'file-item';
    element.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;cursor:pointer;border-radius:4px;';
    element.innerHTML = `
      <span>${icon}</span>
      <span style="flex:1;">${file.name}</span>
      <span style="font-size:10px;opacity:0.7;">${file.type}</span>
    `;
    
    element.addEventListener('click', () => this.handleFileClick(file));
    element.addEventListener('mouseenter', () => {
      element.style.background = 'rgba(0,212,255,0.1)';
    });
    element.addEventListener('mouseleave', () => {
      element.style.background = 'transparent';
    });
    
    return element;
  }

  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      js: '📜', ts: '📘', html: '🌐', css: '🎨', json: '📋',
      md: '📝', txt: '📄', png: '🖼️', jpg: '🖼️', gif: '🖼️'
    };
    return icons[ext] || '📄';
  }

  handleFileClick(file) {
    if (file.type === 'folder') {
      this.loadFiles(file.path);
    } else {
      this.openFile(file);
    }
  }

  openFile(file) {
    if (window.openFile) {
      window.openFile(file.name, this.getLanguageFromExtension(file.name));
    }
    console.log('[FileExplorer] Opening file:', file.name);
  }

  getLanguageFromExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const languages = {
      js: 'javascript', ts: 'typescript', html: 'html',
      css: 'css', json: 'json', md: 'markdown', txt: 'plaintext'
    };
    return languages[ext] || 'plaintext';
  }

  createFile() {
    const name = prompt('File name:');
    if (name) {
      console.log('[FileExplorer] Creating file:', name);
      // Integrate with your existing file creation system
    }
  }

  createFolder() {
    const name = prompt('Folder name:');
    if (name) {
      console.log('[FileExplorer] Creating folder:', name);
    }
  }

  refresh() {
    this.loadFiles(this.currentPath);
  }
}

// Simple VirtualScroller for performance
class VirtualScroller {
  constructor(container, options) {
    this.container = container;
    this.itemHeight = options.itemHeight || 32;
    this.renderItem = options.renderItem;
    this.items = [];
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.init();
  }

  init() {
    this.container.addEventListener('scroll', () => this.updateVisible());
    window.addEventListener('resize', () => this.updateVisible());
  }

  setItems(items) {
    this.items = items;
    this.updateVisible();
  }

  updateVisible() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.min(
      this.items.length,
      this.visibleStart + Math.ceil(containerHeight / this.itemHeight) + 1
    );
    
    this.render();
  }

  render() {
    const totalHeight = this.items.length * this.itemHeight;
    const offsetY = this.visibleStart * this.itemHeight;
    
    this.container.innerHTML = `
      <div style="height:${totalHeight}px;position:relative;">
        <div style="transform:translateY(${offsetY}px);">
          ${this.items.slice(this.visibleStart, this.visibleEnd)
            .map((item, i) => this.renderItem(item, this.visibleStart + i).outerHTML)
            .join('')}
        </div>
      </div>
    `;
  }
}

window.FileExplorer = FileExplorer;