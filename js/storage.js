/**
 * storage.js - Local Storage Management Module
 * Handles CRUD operations and persistent data storage.
 */

export class StorageManager {
  static STORAGE_KEY = 'task_manager_tasks';

  /**
   * Fetch all tasks from Local Storage.
   * @returns {Array} List of tasks
   */
  static getTasks() {
    try {
      const tasksJSON = localStorage.getItem(this.STORAGE_KEY);
      return tasksJSON ? JSON.parse(tasksJSON) : [];
    } catch (error) {
      console.error('Error reading from Local Storage:', error);
      return [];
    }
  }

  /**
   * Save the full list of tasks to Local Storage.
   * @param {Array} tasks - List of tasks to save
   */
  static saveTasks(tasks) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving to Local Storage:', error);
    }
  }

  /**
   * Add a new task to Local Storage.
   * @param {Object} task - Task object
   */
  static addTask(task) {
    const tasks = this.getTasks();
    tasks.push(task);
    this.saveTasks(tasks);
    return tasks;
  }

  /**
   * Update an existing task in Local Storage.
   * @param {string} id - Task ID
   * @param {Object} updatedFields - Fields to update
   */
  static updateTask(id, updatedFields) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedFields };
      this.saveTasks(tasks);
    }
    return tasks;
  }

  /**
   * Delete a task from Local Storage.
   * @param {string} id - Task ID
   */
  static deleteTask(id) {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    this.saveTasks(filteredTasks);
    return filteredTasks;
  }
}
