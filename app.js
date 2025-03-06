// Constants
const STORAGE_KEY = 'tasks';
const MAX_TASK_LENGTH = 200;
const MIN_TASK_LENGTH = 1;

// Types
/**
 * @typedef {Object} Task
 * @property {number} id - Unique identifier
 * @property {string} text - Task content
 * @property {boolean} completed - Completion status
 * @property {string} createdAt - Creation timestamp
 * @property {string|null} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} TaskEventDetail
 * @property {Task} task - Task object
 * @property {number} [index] - Task index
 * @property {string} [message] - Error message
 */

/**
 * Manages task data operations and persistence
 * @extends EventTarget
 */
class TaskManager extends EventTarget {
    constructor() {
        super();
        this.tasks = this.loadTasks();
    }

    /**
     * Loads tasks from localStorage
     * @returns {Task[]}
     */
    /**
     * Loads tasks from localStorage
     * @returns {Task[]}
     */
    loadTasks() {
        try {
            const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return this.validateTasks(tasks) ? tasks : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    /**
     * Validates tasks array structure
     * @param {any} tasks
     * @returns {boolean}
     */
    validateTasks(tasks) {
        return Array.isArray(tasks) && tasks.every(task => 
            task && 
            typeof task.id === 'number' &&
            typeof task.text === 'string' &&
            typeof task.completed === 'boolean' &&
            typeof task.createdAt === 'string'
        );
    }

    /**
     * Validates task text
     * @param {string} text
     * @returns {boolean}
     */
    validateTask(text) {
        const trimmedText = text?.trim();
        return typeof text === 'string' && 
               trimmedText?.length >= MIN_TASK_LENGTH && 
               trimmedText?.length <= MAX_TASK_LENGTH;
    }

    /**
     * Creates a new task object
     * @param {string} text
     * @returns {Task}
     */
    /**
     * Creates a new task object with default values
     * @param {string} text - Task content
     * @returns {Task} New task object
     * @private
     */
    createTask(text) {
        const now = new Date().toISOString();
        return {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: now,
            updatedAt: null
        };
    }

    /**
     * Adds a new task
     * @param {string} text
     * @returns {boolean}
     */
    /**
     * Adds a new task
     * @param {string} text
     * @returns {boolean}
     */
    addTask(text) {
        if (!this.validateTask(text)) {
            this.dispatchEvent(new CustomEvent('error', { 
                detail: { message: 'Invalid task text' } 
            }));
            return false;
        }
        
        const task = this.createTask(text);
        this.tasks.push(task);
        this.save();
        this.dispatchEvent(new CustomEvent('taskAdded', { detail: { task } }));
        return true;
    }

    /**
     * Toggles task completion status
     * @param {number} index
     * @returns {boolean}
     */
    toggleTask(index) {
        if (!this.isValidIndex(index)) {
            this.dispatchEvent(new CustomEvent('error', { 
                detail: { message: 'Invalid task index' } 
            }));
            return false;
        }
        
        const task = this.tasks[index];
        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        this.save();
        this.dispatchEvent(new CustomEvent('taskToggled', { 
            detail: { task, index } 
        }));
        return true;
    }

    /**
     * Deletes a task
     * @param {number} index
     * @returns {boolean}
     */
    deleteTask(index) {
        if (!this.isValidIndex(index)) {
            this.dispatchEvent(new CustomEvent('error', { 
                detail: { message: 'Invalid task index' } 
            }));
            return false;
        }
        
        const [deletedTask] = this.tasks.splice(index, 1);
        this.save();
        this.dispatchEvent(new CustomEvent('taskDeleted', { 
            detail: { task: deletedTask, index } 
        }));
        return true;
    }

    /**
     * Updates task text
     * @param {number} index
     * @param {string} newText
     * @returns {boolean}
     */
    updateTask(index, newText) {
        if (!this.isValidIndex(index) || !this.validateTask(newText)) {
            this.dispatchEvent(new CustomEvent('error', { 
                detail: { message: 'Invalid task update' } 
            }));
            return false;
        }
        
        const task = this.tasks[index];
        const trimmedText = newText.trim();
        if (trimmedText === task.text) return false;
        
        task.text = trimmedText;
        task.updatedAt = new Date().toISOString();
        this.save();
        this.dispatchEvent(new CustomEvent('taskUpdated', { 
            detail: { task, index } 
        }));
        return true;
    }

    /**
     * Gets all tasks
     * @returns {Task[]}
     */
    getTasks() {
        return [...this.tasks];
    }

    /**
     * Validates task index
     * @param {number} index
     * @returns {boolean}
     */
    isValidIndex(index) {
        return Number.isInteger(index) && index >= 0 && index < this.tasks.length;
    }

    /**
     * Saves tasks to localStorage
     */
    /**
     * Saves tasks to localStorage
     */
    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
            this.dispatchEvent(new CustomEvent('saved'));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.dispatchEvent(new CustomEvent('error', { 
                detail: { message: 'Error saving tasks' } 
            }));
        }
    }
}

// UI Management Module
/**
 * Manages the UI components and user interactions
 */
class TodoUI {
    /**
     * @param {TaskManager} taskManager - Task management instance
     * @throws {Error} If taskManager is invalid
     */
    constructor(taskManager) {
        if (!(taskManager instanceof TaskManager)) {
            throw new Error('Invalid TaskManager instance');
        }
        this.taskManager = taskManager;
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.elements = {
            taskInput: document.getElementById('taskInput'),
            addTaskButton: document.getElementById('addTask'),
            taskList: document.getElementById('taskList')
        };

        if (!Object.values(this.elements).every(Boolean)) {
            throw new Error('Required DOM elements not found');
        }
    }

    bindEvents() {
        const { taskInput, addTaskButton } = this.elements;
        addTaskButton.innerHTML = '<i class="fas fa-plus"></i>';
        addTaskButton.addEventListener('click', () => this.handleAddTask());
        taskInput.addEventListener('keypress', this.handleKeyPress.bind(this));
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleAddTask();
        }
    }

    handleAddTask() {
        const { taskInput } = this.elements;
        if (this.taskManager.addTask(taskInput.value)) {
            taskInput.value = '';
            this.render();
        }
    }

    /**
     * Initiates task editing mode
     * @param {HTMLElement} taskElement - Task list item element
     * @param {number} index - Task index
     * @private
     */
    startEditing(taskElement, index) {
        const span = taskElement.querySelector('span');
        if (!span || taskElement.classList.contains('completed')) return;

        const text = span.textContent;
        const controls = this.getTaskControls(taskElement);
        this.toggleControls(controls, false);

        const input = this.createEditInput(text, index);
        const updateButton = this.createUpdateButton(index);

        taskElement.replaceChild(input, span);
        taskElement.appendChild(updateButton);
        input.focus();
    }

    getTaskControls(taskElement) {
        return {
            editButton: taskElement.querySelector('.edit-btn'),
            deleteButton: taskElement.querySelector('.delete-btn'),
            checkbox: taskElement.querySelector('input[type="checkbox"]')
        };
    }

    toggleControls(controls, show = true) {
        Object.values(controls).forEach(control => {
            if (control) control.style.display = show ? '' : 'none';
        });
    }

    createEditInput(text, index) {
        const input = document.createElement('input');
        Object.assign(input, {
            type: 'text',
            value: text,
            className: 'edit-input'
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleUpdateTask(index, input.value);
            }
        });

        input.addEventListener('blur', () => {
            this.handleUpdateTask(index, input.value);
        });

        return input;
    }

    createUpdateButton(index) {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-floppy-disk"></i>';
        button.className = 'edit-btn update-btn';
        button.addEventListener('click', this.handleUpdateButtonClick.bind(this, index));
        return button;
    }

    createEditButton(index) {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-pen-to-square"></i>';
        button.className = 'edit-btn';

        button.addEventListener('click', (e) => {
            const parent = e.target.closest('li');
            if (parent && !parent.classList.contains('completed')) {
                this.startEditing(parent, index);
            }
        });

        return button;
    }

    createDeleteButton(index) {
        const button = document.createElement('button');
        button.innerHTML = '<i class="fas fa-trash-can"></i>';
        button.className = 'delete-btn';

        button.addEventListener('click', () => {
            this.showDeleteConfirmation(index);
        });

        return button;
    }

    /**
     * Handles update button click event
     * @param {number} index - Task index
     * @param {Event} e - Click event
     * @private
     */
    handleUpdateButtonClick(index, e) {
        const taskElement = e.target.closest('li');
        if (!taskElement) return;

        const input = taskElement.querySelector('.edit-input');
        if (!input) return;

        this.handleUpdateTask(index, input.value);
        const controls = this.getTaskControls(taskElement);
        const span = this.createTaskSpan(input.value, index);
        taskElement.replaceChild(span, input);
        this.toggleControls(controls, true);
        
        const updateButton = taskElement.querySelector('.update-btn');
        updateButton?.remove();
    }

    showDeleteConfirmation(index) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const message = document.createElement('p');
        message.textContent = 'Are you sure you want to delete this task?';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'modal-buttons';

        const yesButton = document.createElement('button');
        yesButton.className = 'modal-button yes';
        yesButton.innerHTML = '👍';
        yesButton.addEventListener('click', () => {
            this.taskManager.deleteTask(index);
            this.render();
            document.body.removeChild(overlay);
        });

        const noButton = document.createElement('button');
        noButton.className = 'modal-button no';
        noButton.innerHTML = '🚫';
        noButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        buttonsContainer.append(yesButton, noButton);
        modal.append(message, buttonsContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    handleUpdateTask(index, newText) {
        if (this.taskManager.updateTask(index, newText)) {
            this.render();
        }
    }

    /**
     * Creates a task list item element
     * @param {Task} task - Task object
     * @param {number} index - Task index
     * @returns {HTMLElement} Task list item element
     * @private
     */
    createTaskElement(task, index) {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        const elements = [
            this.createCheckbox(task.completed, index),
            this.createTaskSpan(task.text, index),
            this.createEditButton(index),
            this.createDeleteButton(index)
        ];

        li.append(...elements.filter(Boolean));
        return li;
    }

    createCheckbox(completed, index) {
        const checkbox = document.createElement('input');
        Object.assign(checkbox, {
            type: 'checkbox',
            checked: completed
        });

        checkbox.addEventListener('change', () => {
            const taskElement = checkbox.closest('li');
            if (checkbox.checked) {
                taskElement.classList.add('completed');
                confetti({
                    particleCount: 150,
                    spread: 180,
                    origin: { x: 0.5, y: 0.5 },
                    gravity: 0.5,
                    ticks: 200,
                    shapes: ['square', 'circle'],
                    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
                });
            } else {
                taskElement.classList.remove('completed');
            }
            this.taskManager.toggleTask(index);
            this.render();
        });

        return checkbox;
    }

    createTaskSpan(text, index) {
        const span = document.createElement('span');
        span.textContent = text;

        span.addEventListener('dblclick', (e) => {
            const parent = e.target.parentElement;
            if (parent && !parent.classList.contains('completed')) {
                this.startEditing(parent, index);
            }
        });

        return span;
    }

    render() {
        const { taskList } = this.elements;
        taskList.innerHTML = '';
        
        const tasks = this.taskManager.getTasks();
        const fragment = document.createDocumentFragment();
        
        tasks.forEach((task, index) => {
            fragment.appendChild(this.createTaskElement(task, index));
        });

        taskList.appendChild(fragment);
    }
}

// Initialize the application
const taskManager = new TaskManager();
const todoUI = new TodoUI(taskManager);