/**
 * validation.js - Form Validation Module
 * Validates task inputs and returns structured error messages.
 */

export class ValidationManager {
  /**
   * Validate task input fields.
   * @param {Object} data - Input fields { title, description, dueDate, priority, category }
   * @returns {Object} Object containing isValid and specific field errors
   */
  static validateTask(data) {
    const errors = {};
    const title = data.title ? data.title.trim() : '';
    const description = data.description ? data.description.trim() : '';
    const dueDate = data.dueDate ? data.dueDate.trim() : '';

    // Title validation
    if (!title) {
      errors.title = 'Task Title is required.';
    } else if (title.length < 3) {
      errors.title = 'Task Title must be at least 3 characters long.';
    } else if (title.length > 50) {
      errors.title = 'Task Title cannot exceed 50 characters.';
    }

    // Description validation
    if (!description) {
      errors.description = 'Task Description is required.';
    } else if (description.length < 5) {
      errors.description = 'Task Description must be at least 5 characters long.';
    } else if (description.length > 500) {
      errors.description = 'Task Description cannot exceed 500 characters.';
    }

    // Due Date validation
    if (!dueDate) {
      errors.dueDate = 'Due Date is required.';
    } else {
      const selectedDate = new Date(dueDate);
      // Ensure the selected date is valid
      if (isNaN(selectedDate.getTime())) {
        errors.dueDate = 'Please select a valid date.';
      }
    }

    // Priority validation
    const validPriorities = ['low', 'medium', 'high'];
    if (!data.priority || !validPriorities.includes(data.priority.toLowerCase())) {
      errors.priority = 'Please select a valid priority level.';
    }

    // Category validation
    const validCategories = ['work', 'personal', 'study', 'other'];
    if (!data.category || !validCategories.includes(data.category.toLowerCase())) {
      errors.category = 'Please select a valid category.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
