/**
 * app.js - Main Application Controller
 * Coordinates and glues storage, validation, and UI modules together.
 */

import { StorageManager } from './storage.js';
import { ValidationManager } from './validation.js';
import { UIManager } from './ui.js';

class AppController {
  constructor() {
    this.ui = new UIManager();
  }

  /**
   * Main entry point to initialize the application
   */
  init() {
    // 1. Seed sample tasks if local storage is completely empty
    this.seedSampleTasks();

    // 2. Initialize UIManager and register callback event actions
    this.ui.init({
      onSaveTask: (data, id) => this.handleSaveTask(data, id),
      onDeleteTask: (id) => this.handleDeleteTask(id),
      onToggleStatus: (id) => this.handleToggleStatus(id),
      onRefreshRequired: () => this.refreshView()
    });

    // 3. Render initial view
    this.refreshView();
  }

  /**
   * Creates a list of beautifully structured demo tasks for first-time users
   */
  seedSampleTasks() {
    const existingTasks = StorageManager.getTasks();
    if (existingTasks.length === 0) {
      const today = new Date();
      const formatOffsetDate = (daysOffset) => {
        const d = new Date();
        d.setDate(today.getDate() + daysOffset);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const sampleTasks = [
        {
          id: 'demo-1',
          title: 'Welcome to Task Manager! 🚀',
          description: 'This is a premium task manager crafted with pure glassmorphism design. Explore categories, priorities, sorting features, and try creating or editing tasks!',
          priority: 'high',
          category: 'work',
          dueDate: formatOffsetDate(0), // Due today
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'demo-2',
          title: 'Review Frontend UI Patterns 📚',
          description: 'Study UI/UX trends, spacing hierarchies, and CSS color palettes to build gorgeous professional developer portfolios.',
          priority: 'medium',
          category: 'study',
          dueDate: formatOffsetDate(1), // Due tomorrow
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: 'demo-3',
          title: 'Completed Sample Task 🎉',
          description: 'A demonstration showing how completed tasks are styled with strikethrough typography and high-contrast completion ticks.',
          priority: 'low',
          category: 'personal',
          dueDate: formatOffsetDate(3), // Due in 3 days
          status: 'completed',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];

      StorageManager.saveTasks(sampleTasks);
    }
  }

  /**
   * Action handler: Save a task (Create or Update)
   * @param {Object} data - Form data
   * @param {string|null} id - ID if editing, otherwise null
   * @returns {Object} Object indicating success and errors if any
   */
  handleSaveTask(data, id) {
    // Validate form inputs
    const validation = ValidationManager.validateTask(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    if (id !== null) {
      // Update existing task
      StorageManager.updateTask(id, data);
    } else {
      // Create new task object
      const newTask = {
        id: 'task-' + Date.now().toString(),
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      StorageManager.addTask(newTask);
    }

    // Update list dynamically
    this.refreshView();
    return { success: true };
  }

  /**
   * Action handler: Delete a task
   * @param {string} id - Task ID
   */
  handleDeleteTask(id) {
    StorageManager.deleteTask(id);
    this.refreshView();
  }

  /**
   * Action handler: Toggle completion status (Pending <-> Completed)
   * @param {string} id - Task ID
   */
  handleToggleStatus(id) {
    const tasks = StorageManager.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      StorageManager.updateTask(id, { status: nextStatus });
      this.refreshView();
    }
  }

  /**
   * Refresh views dynamically based on current filter & sort states
   */
  refreshView() {
    const tasks = StorageManager.getTasks();
    this.ui.renderTaskList(tasks);
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
