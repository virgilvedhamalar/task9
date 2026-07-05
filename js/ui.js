/**
 * ui.js - UI Rendering and DOM Manipulation Module
 * Manages rendering of stats, lists, toasts, modals, and user interactions.
 */

export class UIManager {
  constructor() {
    // Current filter and sort state
    this.state = {
      searchQuery: '',
      filterStatus: 'all',
      filterPriority: 'all',
      filterCategory: 'all',
      sortBy: 'due-asc',
      editingTaskId: null
    };

    // Store callbacks for events
    this.events = {
      onSaveTask: null, // Callback for form submit (Add/Edit)
      onDeleteTask: null, // Callback for confirmed deletion
      onToggleStatus: null // Callback for completion toggles
    };

    // Keep track of the task currently queued for deletion
    this.taskIdPendingDeletion = null;
  }

  /**
   * Bind event listeners for UI actions
   */
  init(callbacks) {
    this.events = { ...this.events, ...callbacks };
    this.cacheDOM();
    this.setupEventListeners();
    this.updateGreeting();
  }

  /**
   * Cache DOM elements for quick access
   */
  cacheDOM() {
    this.dom = {
      greeting: document.getElementById('welcome-greeting'),
      currentDate: document.getElementById('current-date'),
      
      // Stats
      totalTasks: document.getElementById('total-tasks'),
      completedTasks: document.getElementById('completed-tasks'),
      pendingTasks: document.getElementById('pending-tasks'),
      progressBar: document.getElementById('progress-bar'),
      progressText: document.getElementById('progress-text'),

      // Task Form
      taskForm: document.getElementById('task-form'),
      formTitle: document.getElementById('form-title'),
      taskIdInput: document.getElementById('task-id'),
      titleInput: document.getElementById('task-title'),
      descInput: document.getElementById('task-desc'),
      priorityInput: document.getElementById('task-priority'),
      categoryInput: document.getElementById('task-category'),
      dueInput: document.getElementById('task-due'),
      submitBtn: document.getElementById('form-submit-btn'),
      cancelBtn: document.getElementById('form-cancel-btn'),

      // Filter and Sort controls
      searchInput: document.getElementById('search-input'),
      filterStatus: document.getElementById('filter-status'),
      filterPriority: document.getElementById('filter-priority'),
      filterCategory: document.getElementById('filter-category'),
      sortBy: document.getElementById('sort-by'),

      // List container
      tasksContainer: document.getElementById('tasks-container'),

      // Delete confirmation modal
      deleteModal: document.getElementById('delete-modal'),
      confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
      cancelDeleteBtn: document.getElementById('cancel-delete-btn'),

      // Toasts
      toastContainer: document.getElementById('toast-container')
    };
  }

  /**
   * Set up all global UI event listeners
   */
  setupEventListeners() {
    // 1. Task Form Submit
    if (this.dom.taskForm) {
      this.dom.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // 2. Form Cancel Button (Exit edit mode)
    if (this.dom.cancelBtn) {
      this.dom.cancelBtn.addEventListener('click', () => {
        this.resetForm();
      });
    }

    // 3. Search and Filtering Events (Reactive)
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value.toLowerCase();
        this.triggerRender();
      });
    }

    if (this.dom.filterStatus) {
      this.dom.filterStatus.addEventListener('change', (e) => {
        this.state.filterStatus = e.target.value;
        this.triggerRender();
      });
    }

    if (this.dom.filterPriority) {
      this.dom.filterPriority.addEventListener('change', (e) => {
        this.state.filterPriority = e.target.value;
        this.triggerRender();
      });
    }

    if (this.dom.filterCategory) {
      this.dom.filterCategory.addEventListener('change', (e) => {
        this.state.filterCategory = e.target.value;
        this.triggerRender();
      });
    }

    if (this.dom.sortBy) {
      this.dom.sortBy.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.triggerRender();
      });
    }

    // 4. Modal Event Listeners
    if (this.dom.confirmDeleteBtn) {
      this.dom.confirmDeleteBtn.addEventListener('click', () => {
        if (this.taskIdPendingDeletion && this.events.onDeleteTask) {
          this.events.onDeleteTask(this.taskIdPendingDeletion);
          this.showToast('Task deleted successfully', 'danger');
        }
        this.closeDeleteModal();
      });
    }

    if (this.dom.cancelDeleteBtn) {
      this.dom.cancelDeleteBtn.addEventListener('click', () => {
        this.closeDeleteModal();
      });
    }

    // Click outside modal to close
    if (this.dom.deleteModal) {
      this.dom.deleteModal.addEventListener('click', (e) => {
        if (e.target === this.dom.deleteModal) {
          this.closeDeleteModal();
        }
      });
    }
  }

  /**
   * Set Greeting and Date
   */
  updateGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = 'Good morning';

    if (hours >= 12 && hours < 17) {
      greeting = 'Good afternoon';
    } else if (hours >= 17 || hours < 4) {
      greeting = 'Good evening';
    }

    if (this.dom.greeting) {
      this.dom.greeting.textContent = `${greeting}, Task Manager!`;
    }

    if (this.dom.currentDate) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      this.dom.currentDate.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  /**
   * Display dynamic statistics card numbers & progress bar
   * @param {Array} tasks - Full list of tasks
   */
  renderStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (this.dom.totalTasks) this.dom.totalTasks.textContent = total;
    if (this.dom.completedTasks) this.dom.completedTasks.textContent = completed;
    if (this.dom.pendingTasks) this.dom.pendingTasks.textContent = pending;

    if (this.dom.progressBar) {
      this.dom.progressBar.style.width = `${completionRate}%`;
    }
    if (this.dom.progressText) {
      this.dom.progressText.textContent = `${completionRate}% Tasks Completed`;
    }
  }

  /**
   * Handle form submission for adding or editing tasks
   */
  handleFormSubmit() {
    const title = this.dom.titleInput.value.trim();
    const description = this.dom.descInput.value.trim();
    const priority = this.dom.priorityInput.value;
    const category = this.dom.categoryInput.value;
    const dueDate = this.dom.dueInput.value;
    const isEditing = this.state.editingTaskId !== null;

    // Clear old errors
    this.clearValidationErrors();

    const data = { title, description, priority, category, dueDate };

    if (this.events.onSaveTask) {
      const result = this.events.onSaveTask(data, this.state.editingTaskId);
      if (result.success) {
        this.resetForm();
        this.showToast(
          isEditing ? 'Task updated successfully!' : 'Task added successfully!',
          'success'
        );
      } else {
        this.displayValidationErrors(result.errors);
      }
    }
  }

  /**
   * Populates the form fields to switch into Editing Mode
   * @param {Object} task - Task to edit
   */
  enterEditMode(task) {
    this.state.editingTaskId = task.id;
    this.dom.formTitle.textContent = 'Edit Task Details';
    this.dom.taskIdInput.value = task.id;
    this.dom.titleInput.value = task.title;
    this.dom.descInput.value = task.description;
    this.dom.priorityInput.value = task.priority;
    this.dom.categoryInput.value = task.category;
    this.dom.dueInput.value = task.dueDate;
    
    this.dom.submitBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Update Task';
    this.dom.cancelBtn.classList.remove('hidden');

    // Smooth scroll to form container for high quality desktop experience
    document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
    this.dom.titleInput.focus();
  }

  /**
   * Resets editing mode and clears form inputs
   */
  resetForm() {
    this.state.editingTaskId = null;
    this.dom.formTitle.textContent = 'Create New Task';
    this.dom.taskForm.reset();
    this.dom.taskIdInput.value = '';
    
    this.dom.submitBtn.innerHTML = '<i class="fa-solid fa-plus mr-2"></i>Add Task';
    this.dom.cancelBtn.classList.add('hidden');
    this.clearValidationErrors();
  }

  /**
   * Display red warning error states under input elements
   */
  displayValidationErrors(errors) {
    Object.keys(errors).forEach(field => {
      const errorSpan = document.getElementById(`error-${field}`);
      const inputEl = document.getElementById(`task-${field}`);
      if (errorSpan) {
        errorSpan.textContent = errors[field];
        errorSpan.classList.add('visible');
      }
      if (inputEl) {
        inputEl.classList.add('border-rose-500', 'ring-2', 'ring-rose-200');
        inputEl.style.borderColor = '#f43f5e';
      }
    });
  }

  /**
   * Remove error text and red highlights
   */
  clearValidationErrors() {
    const errorSpans = document.querySelectorAll('.error-msg');
    errorSpans.forEach(span => {
      span.textContent = '';
      span.classList.remove('visible');
    });

    const inputs = this.dom.taskForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.classList.remove('border-rose-500', 'ring-2', 'ring-rose-200');
      input.style.borderColor = '';
    });
  }

  /**
   * Triggers the full dynamic list render based on cached state and data
   */
  triggerRender() {
    if (this.events.onRefreshRequired) {
      this.events.onRefreshRequired();
    }
  }

  /**
   * Open Custom Confirm Delete Modal
   */
  openDeleteModal(id) {
    this.taskIdPendingDeletion = id;
    if (this.dom.deleteModal) {
      this.dom.deleteModal.style.display = 'flex';
      setTimeout(() => {
        this.dom.deleteModal.classList.add('active');
      }, 10);
    }
  }

  /**
   * Close Custom Confirm Delete Modal
   */
  closeDeleteModal() {
    this.taskIdPendingDeletion = null;
    if (this.dom.deleteModal) {
      this.dom.deleteModal.classList.remove('active');
      setTimeout(() => {
        this.dom.deleteModal.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Toast notification generator
   * @param {string} message - Display text
   * @param {string} type - 'success', 'info', 'danger'
   */
  showToast(message, type = 'success') {
    if (!this.dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} flex items-center justify-between p-4 mb-3 rounded-xl shadow-lg border`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'danger') iconClass = 'fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
      <div class="toast-content flex items-center gap-3">
        <i class="fa-solid ${iconClass}"></i>
        <span class="font-medium text-sm text-slate-800">${message}</span>
      </div>
      <button class="toast-close ml-4 text-slate-400 hover:text-slate-600 focus:outline-none">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    this.dom.toastContainer.appendChild(toast);

    // Dynamic entry animation
    setTimeout(() => {
      toast.classList.add('active');
    }, 10);

    // Auto dismiss after 4 seconds
    const dismissTimeout = setTimeout(() => {
      this.dismissToast(toast);
    }, 4000);

    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(dismissTimeout);
      this.dismissToast(toast);
    });
  }

  dismissToast(toast) {
    toast.classList.remove('active');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Filter, sort, and render full cards list
   * @param {Array} tasks - Full list of tasks from LocalStorage
   */
  renderTaskList(tasks) {
    this.renderStats(tasks);

    // 1. Filter Tasks
    let filteredTasks = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(this.state.searchQuery) || 
                            task.description.toLowerCase().includes(this.state.searchQuery);
      
      const matchesStatus = this.state.filterStatus === 'all' || task.status === this.state.filterStatus;
      const matchesPriority = this.state.filterPriority === 'all' || task.priority === this.state.filterPriority;
      const matchesCategory = this.state.filterCategory === 'all' || task.category === this.state.filterCategory;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    // 2. Sort Tasks
    filteredTasks.sort((a, b) => {
      if (this.state.sortBy === 'due-asc') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (this.state.sortBy === 'due-desc') {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (this.state.sortBy === 'alpha-asc') {
        return a.title.localeCompare(b.title);
      } else if (this.state.sortBy === 'alpha-desc') {
        return b.title.localeCompare(a.title);
      } else if (this.state.sortBy === 'date-created-desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    // Clear old container
    this.dom.tasksContainer.innerHTML = '';

    // 3. Render Empty State if no matches found
    if (filteredTasks.length === 0) {
      this.renderEmptyState();
      return;
    }

    // 4. Render Active Tasks
    filteredTasks.forEach(task => {
      const card = this.createTaskCardElement(task);
      this.dom.tasksContainer.appendChild(card);
    });
  }

  /**
   * Render vector placeholder empty state inside container
   */
  renderEmptyState() {
    const isEmptyAll = this.state.searchQuery === '' && 
                       this.state.filterStatus === 'all' && 
                       this.state.filterPriority === 'all' && 
                       this.state.filterCategory === 'all';

    const titleText = isEmptyAll ? 'No Tasks Scheduled' : 'No Matching Tasks';
    const subText = isEmptyAll 
      ? 'Get started by creating your very first task in the sidebar scheduler!' 
      : 'Try adjusting your filters, searching for another keyword, or resetting fields.';

    this.dom.tasksContainer.innerHTML = `
      <div class="empty-state flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm max-w-lg mx-auto mt-6">
        <svg class="w-32 h-32 mb-4 text-indigo-400 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
        </svg>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">${titleText}</h3>
        <p class="text-sm text-slate-500 leading-relaxed">${subText}</p>
      </div>
    `;
  }

  /**
   * Build complete Task Card element
   * @param {Object} task - Task object
   * @returns {HTMLElement} Card container
   */
  createTaskCardElement(task) {
    const card = document.createElement('div');
    const isCompleted = task.status === 'completed';
    card.id = `task-card-${task.id}`;
    card.className = `task-card bg-white/65 border border-white/50 shadow-sm rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative ${isCompleted ? 'completed-card opacity-75 border-emerald-100' : ''}`;

    // Get color theme styles based on priority levels
    const priorityColors = {
      high: { bg: 'bg-rose-50 text-rose-700 border-rose-100', icon: 'fa-circle-exclamation', border: 'border-l-rose-500' },
      medium: { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: 'fa-circle-chevron-up', border: 'border-l-amber-500' },
      low: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'fa-circle-chevron-down', border: 'border-l-emerald-500' }
    };
    const priorityStyle = priorityColors[task.priority.toLowerCase()] || priorityColors.low;

    // Get icon class based on Category
    const categoryIcons = {
      work: 'fa-briefcase',
      personal: 'fa-user-astronaut',
      study: 'fa-book-open',
      other: 'fa-hashtag'
    };
    const categoryIcon = categoryIcons[task.category.toLowerCase()] || 'fa-hashtag';

    // Format Due date nicely
    const formattedDueDate = this.formatFriendlyDate(task.dueDate);

    // Color code due date warnings if task is pending and overdue
    const isOverdue = !isCompleted && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
    const dueDateClass = isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500';

    card.innerHTML = `
      <!-- Color highlight indicator bar -->
      <div class="priority-strip absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}"></div>
      
      <div class="card-body pl-2">
        <div class="flex items-start justify-between gap-4 mb-2">
          <!-- Title with complete-strike if done -->
          <h4 class="task-card-title text-base font-semibold text-slate-800 break-words leading-snug flex-1 ${isCompleted ? 'line-through text-slate-400' : ''}">
            ${this.escapeHTML(task.title)}
          </h4>
          
          <!-- Quick complete checkbox button -->
          <button class="status-toggle-btn w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center cursor-pointer ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600' : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20'}" title="${isCompleted ? 'Mark as Pending' : 'Mark as Completed'}">
            <i class="fa-solid fa-check text-xs transition-opacity duration-300 ${isCompleted ? 'opacity-100' : 'opacity-0 hover:opacity-40'}"></i>
          </button>
        </div>

        <p class="text-sm text-slate-500 break-words mb-4 leading-relaxed ${isCompleted ? 'text-slate-400/80' : ''}">
          ${this.escapeHTML(task.description)}
        </p>
      </div>

      <div class="card-footer pl-2 pt-3 border-t border-slate-100/60 flex flex-wrap gap-2 items-center justify-between">
        <div class="flex flex-wrap gap-2 items-center">
          <!-- Priority tag -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${priorityStyle.bg}">
            <i class="fa-solid ${priorityStyle.icon}"></i>
            ${task.priority}
          </span>

          <!-- Category tag -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100/70 text-slate-600 border border-slate-200">
            <i class="fa-solid ${categoryIcon}"></i>
            ${task.category}
          </span>
        </div>

        <div class="flex items-center gap-4 mt-1 sm:mt-0 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <!-- Due Date text -->
          <span class="inline-flex items-center gap-1 ${dueDateClass}" title="Due Date">
            <i class="fa-solid fa-calendar-days"></i>
            <span>${formattedDueDate}</span>
            ${isOverdue ? '<span class="text-[10px] uppercase font-bold tracking-tight bg-rose-100 text-rose-700 px-1 rounded">Overdue</span>' : ''}
          </span>

          <!-- Action buttons (Edit & Delete) -->
          <div class="flex items-center gap-1.5">
            <button class="edit-btn p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit Task">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="delete-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete Task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // 5. Register Card Interactivity callbacks
    // Status button toggle
    card.querySelector('.status-toggle-btn').addEventListener('click', () => {
      if (this.events.onToggleStatus) {
        this.events.onToggleStatus(task.id);
        const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
        this.showToast(
          nextStatus === 'completed' ? 'Task marked as completed!' : 'Task returned to pending status',
          nextStatus === 'completed' ? 'success' : 'info'
        );
      }
    });

    // Edit Button
    card.querySelector('.edit-btn').addEventListener('click', () => {
      this.enterEditMode(task);
    });

    // Delete Button (triggers modal confirmation)
    card.querySelector('.delete-btn').addEventListener('click', () => {
      this.openDeleteModal(task.id);
    });

    return card;
  }

  /**
   * Helper function to escape special characters to avoid XSS
   */
  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  /**
   * Formats string YYYY-MM-DD into a clean, human-friendly readable string.
   */
  formatFriendlyDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      // Avoid time zone shifts by creating date directly using year, month (0-indexed), day
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }

      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  }
}
