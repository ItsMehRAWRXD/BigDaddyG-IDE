/**
 * BigDaddyG IDE - Collapsible TODO Panel
 * Smart todo list with progress tracking and expandable view
 */

class TodoPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.todos = [];
    this.isExpanded = false;
    this.filter = 'all'; // 'all' | 'pending' | 'in_progress' | 'completed'
    
    this.init();
  }
  
  init() {
    this.injectStyles();
    this.render();
    this.loadTodos();
  }
  
  render() {
    const stats = this.getStats();
    const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    
    this.container.innerHTML = `
      <div class="todo-panel ${this.isExpanded ? 'expanded' : 'collapsed'}">
        <!-- Collapsed Header (Always Visible) -->
        <div class="todo-header" id="todo-header">
          <div class="todo-header-left">
            <button class="todo-expand-btn" id="todo-expand-btn">
              ${this.isExpanded ? '▼' : '▶'}
            </button>
            <span class="todo-title">📋 TODO List</span>
            <span class="todo-count">${stats.completed}/${stats.total} Done</span>
          </div>
          
          <div class="todo-header-right">
            <div class="todo-progress-mini">
              <div class="todo-progress-mini-bar" style="width: ${percentage}%"></div>
            </div>
            <span class="todo-percentage">${percentage}%</span>
            <button class="todo-add-btn" id="todo-add-btn" title="Add TODO">+</button>
          </div>
        </div>
        
        <!-- Expandable Content -->
        <div class="todo-content" id="todo-content" style="display: ${this.isExpanded ? 'block' : 'none'}">
          <!-- Progress Bar -->
          <div class="todo-progress-section">
            <div class="todo-progress-bar">
              <div class="todo-progress-fill" style="width: ${percentage}%">
                <span class="todo-progress-text">${stats.completed} of ${stats.total} completed (${percentage}%)</span>
              </div>
            </div>
            
            <div class="todo-stats">
              <div class="todo-stat todo-stat-pending">
                <span class="todo-stat-icon">⏳</span>
                <span class="todo-stat-label">Pending</span>
                <span class="todo-stat-value">${stats.pending}</span>
              </div>
              <div class="todo-stat todo-stat-progress">
                <span class="todo-stat-icon">🔄</span>
                <span class="todo-stat-label">In Progress</span>
                <span class="todo-stat-value">${stats.in_progress}</span>
              </div>
              <div class="todo-stat todo-stat-done">
                <span class="todo-stat-icon">✅</span>
                <span class="todo-stat-label">Completed</span>
                <span class="todo-stat-value">${stats.completed}</span>
              </div>
            </div>
          </div>
          
          <!-- Filters -->
          <div class="todo-filters">
            <button class="todo-filter ${this.filter === 'all' ? 'active' : ''}" data-filter="all">
              All (${stats.total})
            </button>
            <button class="todo-filter ${this.filter === 'pending' ? 'active' : ''}" data-filter="pending">
              Pending (${stats.pending})
            </button>
            <button class="todo-filter ${this.filter === 'in_progress' ? 'active' : ''}" data-filter="in_progress">
              In Progress (${stats.in_progress})
            </button>
            <button class="todo-filter ${this.filter === 'completed' ? 'active' : ''}" data-filter="completed">
              Completed (${stats.completed})
            </button>
          </div>
          
          <!-- TODO List -->
          <div class="todo-list" id="todo-list">
            ${this.renderTodoItems()}
          </div>
          
          <!-- Actions -->
          <div class="todo-actions">
            <button class="todo-action-btn" id="todo-clear-completed">
              🗑️ Clear Completed
            </button>
            <button class="todo-action-btn" id="todo-export">
              📤 Export
            </button>
            <button class="todo-action-btn" id="todo-import">
              📥 Import
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  renderTodoItems() {
    const filtered = this.getFilteredTodos();
    
    if (filtered.length === 0) {
      return `
        <div class="todo-empty">
          <span class="todo-empty-icon">📝</span>
          <span class="todo-empty-text">
            ${this.filter === 'all' ? 'No todos yet. Click + to add one!' : `No ${this.filter.replace('_', ' ')} todos`}
          </span>
        </div>
      `;
    }
    
    return filtered.map((todo, index) => this.renderTodoItem(todo, index)).join('');
  }
  
  renderTodoItem(todo, index) {
    const statusIcons = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      cancelled: '❌'
    };
    
    const statusColors = {
      pending: '#888',
      in_progress: 'var(--cyan)',
      completed: 'var(--green)',
      cancelled: 'var(--red)'
    };
    
    return `
      <div class="todo-item ${todo.status}" data-id="${todo.id}">
        <div class="todo-item-left">
          <button class="todo-checkbox" data-id="${todo.id}">
            ${statusIcons[todo.status]}
          </button>
          <div class="todo-item-content">
            <div class="todo-item-text clickable ${todo.status === 'completed' ? 'completed' : ''}" onclick="window.todoPanel.executeTodo('${todo.id}')" title="Click to execute instantly">${this.escapeHtml(todo.content)}</div>
            ${todo.details ? `<div class="todo-item-details">${this.escapeHtml(todo.details)}</div>` : ''}
            ${todo.tags ? `<div class="todo-item-tags">${todo.tags.map(t => `<span class="todo-tag">${t}</span>`).join('')}</div>` : ''}
          </div>
        </div>
        
        <div class="todo-item-right">
          ${todo.priority ? `<span class="todo-priority todo-priority-${todo.priority}">!</span>` : ''}
          <button class="todo-item-btn" data-action="execute" data-id="${todo.id}" title="Execute Now">⚡</button>
          <button class="todo-item-btn" data-action="edit" data-id="${todo.id}" title="Edit">✏️</button>
          <button class="todo-item-btn" data-action="delete" data-id="${todo.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Toggle expand/collapse
    document.getElementById('todo-header')?.addEventListener('click', (e) => {
      if (!e.target.closest('.todo-add-btn')) {
        this.toggleExpand();
      }
    });
    
    document.getElementById('todo-expand-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleExpand();
    });
    
    // Add TODO
    document.getElementById('todo-add-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showAddDialog();
    });
    
    // Filters
    document.querySelectorAll('.todo-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        this.render();
      });
    });
    
    // Checkbox (cycle status)
    document.querySelectorAll('.todo-checkbox').forEach(btn => {
      btn.addEventListener('click', () => {
        this.cycleStatus(btn.dataset.id);
      });
    });
    
    // Item actions
    document.querySelectorAll('.todo-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        
        if (action === 'execute') {
          this.executeTodo(id);
        } else if (action === 'edit') {
          this.editTodo(id);
        } else if (action === 'delete') {
          this.deleteTodo(id);
        }
      });
    });
    
    // Clear completed
    document.getElementById('todo-clear-completed')?.addEventListener('click', () => {
      this.clearCompleted();
    });
    
    // Export
    document.getElementById('todo-export')?.addEventListener('click', () => {
      this.exportTodos();
    });
    
    // Import
    document.getElementById('todo-import')?.addEventListener('click', () => {
      this.importTodos();
    });
  }
  
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    
    const panel = this.container.querySelector('.todo-panel');
    const content = document.getElementById('todo-content');
    const expandBtn = document.getElementById('todo-expand-btn');
    
    if (this.isExpanded) {
      panel?.classList.add('expanded');
      panel?.classList.remove('collapsed');
      if (content) content.style.display = 'block';
      if (expandBtn) expandBtn.textContent = '▼';
    } else {
      panel?.classList.remove('expanded');
      panel?.classList.add('collapsed');
      if (content) content.style.display = 'none';
      if (expandBtn) expandBtn.textContent = '▶';
    }
    
    this.saveTodos();
  }
  
  showAddDialog() {
    const content = prompt('Enter TODO:');
    if (!content) return;
    
    const priority = confirm('High priority?') ? 'high' : 'normal';
    
    this.addTodo({
      content,
      priority,
      status: 'pending',
      tags: []
    });
  }
  
  addTodo(todo) {
    const newTodo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: todo.content,
      status: todo.status || 'pending',
      priority: todo.priority || 'normal',
      tags: todo.tags || [],
      details: todo.details || '',
      created: Date.now(),
      updated: Date.now()
    };
    
    this.todos.push(newTodo);
    this.saveTodos();
    this.render();
    
    // Auto-expand if collapsed
    if (!this.isExpanded) {
      this.toggleExpand();
    }
  }
  
  addSampleTodos() {
    const samples = [
      {
        content: 'Create a REST API for user authentication',
        priority: 'high',
        tags: ['api', 'auth']
      },
      {
        content: 'Build a React component for file upload',
        priority: 'normal',
        tags: ['react', 'ui']
      },
      {
        content: 'Write Python script to analyze CSV data',
        priority: 'normal',
        tags: ['python', 'data']
      },
      {
        content: 'Generate HTML form with validation',
        priority: 'low',
        tags: ['html', 'forms']
      }
    ];
    
    samples.forEach(sample => this.addTodo(sample));
  }
  
  cycleStatus(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    
    const statusCycle = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusCycle.indexOf(todo.status);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    
    todo.status = statusCycle[nextIndex];
    todo.updated = Date.now();
    
    this.saveTodos();
    this.render();
    
    // Emit event
    this.emitEvent('todo-updated', todo);
  }
  
  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    
    const newContent = prompt('Edit TODO:', todo.content);
    if (!newContent) return;
    
    todo.content = newContent;
    todo.updated = Date.now();
    
    this.saveTodos();
    this.render();
  }
  
  deleteTodo(id) {
    if (!confirm('Delete this TODO?')) return;
    
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.render();
  }
  
  clearCompleted() {
    if (!confirm('Clear all completed TODOs?')) return;
    
    this.todos = this.todos.filter(t => t.status !== 'completed');
    this.saveTodos();
    this.render();
  }
  
  getFilteredTodos() {
    if (this.filter === 'all') {
      return this.todos;
    }
    return this.todos.filter(t => t.status === this.filter);
  }
  
  getStats() {
    return {
      total: this.todos.length,
      pending: this.todos.filter(t => t.status === 'pending').length,
      in_progress: this.todos.filter(t => t.status === 'in_progress').length,
      completed: this.todos.filter(t => t.status === 'completed').length,
      cancelled: this.todos.filter(t => t.status === 'cancelled').length
    };
  }
  
  loadTodos() {
    try {
      const stored = localStorage.getItem('bigdaddyg_todos');
      if (stored) {
        this.todos = JSON.parse(stored);
        this.render();
      } else {
        // Add sample todos on first load
        this.addSampleTodos();
      }
    } catch (error) {
      console.error('[TodoPanel] Error loading todos:', error);
    }
  }
  
  saveTodos() {
    try {
      localStorage.setItem('bigdaddyg_todos', JSON.stringify(this.todos));
      localStorage.setItem('bigdaddyg_todo_expanded', this.isExpanded);
    } catch (error) {
      console.error('[TodoPanel] Error saving todos:', error);
    }
  }
  
  exportTodos() {
    const data = JSON.stringify(this.todos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bigdaddyg-todos-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  importTodos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        
        if (Array.isArray(imported)) {
          this.todos = imported;
          this.saveTodos();
          this.render();
        } else {
          alert('Invalid TODO file format');
        }
      } catch (error) {
        alert('Error importing TODOs: ' + error.message);
      }
    };
    
    input.click();
  }
  
  executeTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;
    
    // Mark as in progress
    todo.status = 'in_progress';
    todo.updated = Date.now();
    this.saveTodos();
    this.render();
    
    // Execute the todo using neural code synthesis
    this.synthesizeAndExecute(todo);
  }
  
  async synthesizeAndExecute(todo) {
    try {
      console.log('[TodoPanel] 🧠 Synthesizing code for:', todo.content);
      
      // Send to AI for code synthesis
      const prompt = `Generate code to accomplish this task: "${todo.content}"
      
Provide working code that can be executed immediately. Include any necessary imports or setup.`;
      
      // Use the existing AI system to generate code
      if (window.sendToAI) {
        // Add the prompt to AI input and send
        const aiInput = document.getElementById('ai-input');
        if (aiInput) {
          aiInput.value = prompt;
          await window.sendToAI();
        }
      }
      
      // Mark as completed after synthesis
      setTimeout(() => {
        const updatedTodo = this.todos.find(t => t.id === todo.id);
        if (updatedTodo && updatedTodo.status === 'in_progress') {
          updatedTodo.status = 'completed';
          updatedTodo.updated = Date.now();
          this.saveTodos();
          this.render();
        }
      }, 2000);
      
      // Emit event for neural synthesis
      this.emitEvent('todo-synthesized', { todo, prompt });
      
    } catch (error) {
      console.error('[TodoPanel] ❌ Synthesis failed:', error);
      
      // Mark as failed
      const failedTodo = this.todos.find(t => t.id === todo.id);
      if (failedTodo) {
        failedTodo.status = 'pending';
        failedTodo.updated = Date.now();
        this.saveTodos();
        this.render();
      }
    }
  }
  
  emitEvent(name, data) {
    window.dispatchEvent(new CustomEvent(name, { detail: data }));
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  injectStyles() {
    if (document.getElementById('todo-panel-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'todo-panel-styles';
    style.textContent = `
      .todo-panel {
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid var(--green);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .todo-panel.collapsed {
        max-height: 50px;
      }
      
      .todo-panel.expanded {
        max-height: 80vh;
      }
      
      .todo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 15px;
        background: rgba(0, 255, 0, 0.1);
        border-bottom: 1px solid var(--green);
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .todo-header:hover {
        background: rgba(0, 255, 0, 0.15);
      }
      
      .todo-header-left, .todo-header-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .todo-expand-btn {
        padding: 4px 8px;
        background: rgba(0, 255, 0, 0.1);
        border: 1px solid var(--green);
        border-radius: 4px;
        color: var(--green);
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
      }
      
      .todo-title {
        font-weight: bold;
        font-size: 14px;
        color: var(--green);
      }
      
      .todo-count {
        padding: 3px 8px;
        background: rgba(0, 255, 0, 0.2);
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        color: var(--green);
      }
      
      .todo-progress-mini {
        width: 60px;
        height: 6px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
        overflow: hidden;
      }
      
      .todo-progress-mini-bar {
        height: 100%;
        background: var(--green);
        transition: width 0.3s ease;
      }
      
      .todo-percentage {
        font-size: 13px;
        font-weight: bold;
        color: var(--green);
        min-width: 40px;
        text-align: right;
      }
      
      .todo-add-btn {
        padding: 4px 10px;
        background: var(--green);
        border: none;
        border-radius: 4px;
        color: var(--void);
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.2s;
      }
      
      .todo-add-btn:hover {
        background: var(--cyan);
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
      }
      
      .todo-content {
        display: flex;
        flex-direction: column;
        max-height: calc(80vh - 50px);
        overflow-y: auto;
      }
      
      .todo-progress-section {
        padding: 15px;
        background: rgba(0, 0, 0, 0.5);
        border-bottom: 1px solid rgba(0, 255, 0, 0.2);
      }
      
      .todo-progress-bar {
        height: 30px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 12px;
        border: 1px solid rgba(0, 255, 0, 0.3);
      }
      
      .todo-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--green), var(--cyan));
        display: flex;
        align-items: center;
        justify-content: center;
        transition: width 0.5s ease;
        min-width: 50px;
      }
      
      .todo-progress-text {
        font-size: 12px;
        font-weight: bold;
        color: var(--void);
        text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
      }
      
      .todo-stats {
        display: flex;
        gap: 10px;
      }
      
      .todo-stat {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .todo-stat-icon {
        font-size: 20px;
      }
      
      .todo-stat-label {
        font-size: 10px;
        text-transform: uppercase;
        opacity: 0.7;
      }
      
      .todo-stat-value {
        font-size: 16px;
        font-weight: bold;
        color: var(--green);
      }
      
      .todo-filters {
        display: flex;
        gap: 5px;
        padding: 10px 15px;
        background: rgba(0, 0, 0, 0.3);
        border-bottom: 1px solid rgba(0, 255, 0, 0.2);
        overflow-x: auto;
      }
      
      .todo-filter {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 255, 0, 0.3);
        border-radius: 4px;
        color: var(--green);
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
        transition: all 0.2s;
      }
      
      .todo-filter:hover {
        background: rgba(0, 255, 0, 0.1);
      }
      
      .todo-filter.active {
        background: var(--green);
        color: var(--void);
        font-weight: bold;
      }
      
      .todo-list {
        flex: 1;
        overflow-y: auto;
        padding: 10px 15px;
      }
      
      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(0, 255, 0, 0.2);
        border-radius: 6px;
        transition: all 0.2s;
      }
      
      .todo-item:hover {
        background: rgba(0, 255, 0, 0.05);
        border-color: var(--green);
      }
      
      .todo-item.completed {
        opacity: 0.6;
      }
      
      .todo-item-left {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        flex: 1;
      }
      
      .todo-checkbox {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid var(--green);
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      .todo-checkbox:hover {
        background: rgba(0, 255, 0, 0.1);
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.3);
      }
      
      .todo-item-content {
        flex: 1;
      }
      
      .todo-item-text {
        font-size: 13px;
        line-height: 1.4;
        color: var(--green);
        margin-bottom: 4px;
        transition: all 0.2s;
      }
      
      .todo-item-text.clickable {
        cursor: pointer;
      }
      
      .todo-item-text.clickable:hover {
        color: var(--cyan);
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
        transform: translateX(2px);
      }
      
      .todo-item-text.completed {
        text-decoration: line-through;
        opacity: 0.6;
      }
      
      .todo-item-details {
        font-size: 11px;
        color: var(--cyan);
        opacity: 0.7;
        margin-top: 4px;
      }
      
      .todo-item-tags {
        display: flex;
        gap: 4px;
        margin-top: 6px;
      }
      
      .todo-tag {
        padding: 2px 6px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid var(--cyan);
        border-radius: 3px;
        font-size: 10px;
        color: var(--cyan);
      }
      
      .todo-item-right {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .todo-priority {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }
      
      .todo-priority-high {
        background: rgba(255, 0, 0, 0.2);
        border: 1px solid var(--red);
        color: var(--red);
      }
      
      .todo-priority-normal {
        background: rgba(255, 165, 0, 0.2);
        border: 1px solid var(--orange);
        color: var(--orange);
      }
      
      .todo-item-btn {
        padding: 4px 6px;
        background: rgba(0, 255, 0, 0.1);
        border: 1px solid var(--green);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .todo-item-btn:hover {
        background: rgba(0, 255, 0, 0.2);
      }
      
      .todo-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        opacity: 0.5;
      }
      
      .todo-empty-icon {
        font-size: 48px;
        margin-bottom: 10px;
      }
      
      .todo-empty-text {
        font-size: 13px;
        color: var(--green);
      }
      
      .todo-actions {
        display: flex;
        gap: 8px;
        padding: 12px 15px;
        background: rgba(0, 0, 0, 0.5);
        border-top: 1px solid rgba(0, 255, 0, 0.2);
      }
      
      .todo-action-btn {
        flex: 1;
        padding: 8px 12px;
        background: rgba(0, 255, 0, 0.1);
        border: 1px solid var(--green);
        border-radius: 4px;
        color: var(--green);
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .todo-action-btn:hover {
        background: rgba(0, 255, 0, 0.2);
        box-shadow: 0 0 8px rgba(0, 255, 0, 0.3);
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Auto-initialize if container exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('todo-panel-container');
    if (container) {
      window.todoPanel = new TodoPanel('todo-panel-container');
    }
  });
} else {
  const container = document.getElementById('todo-panel-container');
  if (container) {
    window.todoPanel = new TodoPanel('todo-panel-container');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TodoPanel;
}

