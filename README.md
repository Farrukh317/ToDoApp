# Todo Application

A modern, feature-rich Todo application built with vanilla JavaScript, featuring local storage persistence, task management, and a clean user interface.

## Features

- ✨ Create, read, update, and delete tasks
- 🔄 Real-time task updates
- 💾 Local storage persistence
- ✅ Task completion tracking
- 🎉 Celebration animation on task completion
- ✏️ Double-click to edit tasks
- 🗑️ Confirmation dialog for task deletion
- 📱 Responsive design

## Prerequisites

- Visual Studio Code (VSCode)
- Live Server extension for VSCode (or any other local development server)

## Setup Instructions

1. Clone the repository or download the source code

2. Open the project in VSCode:
   - Launch VSCode
   - Go to `File > Open Folder`
   - Select the project folder

3. Install the Live Server extension:
   - Click on the Extensions icon in the VSCode sidebar (or press `Ctrl+Shift+X`)
   - Search for "Live Server"
   - Click "Install" on the extension by Ritwick Dey

4. Start the development server:
   - Right-click on `index.html` in the VSCode explorer
   - Select "Open with Live Server"
   - The application will open in your default browser

## Project Structure

```
TodoApp/
├── index.html      # Main HTML file
├── styles.css      # CSS styles
└── app.js          # JavaScript application logic
```

## Usage Guide

### Adding Tasks
- Type your task in the input field
- Press Enter or click the "+" button to add the task

### Managing Tasks
- Click the checkbox to mark a task as complete
- Double-click a task to edit its text
- Click the pencil icon to edit a task
- Click the trash icon to delete a task

### Task Editing
1. Enter edit mode by:
   - Double-clicking the task text
   - Clicking the pencil icon
2. Modify the task text
3. Press Enter or click the save icon to confirm changes

### Deleting Tasks
1. Click the trash icon next to a task
2. Confirm deletion in the popup dialog

## Technical Details

### Local Storage
- Tasks are automatically saved to the browser's local storage
- Data persists across browser sessions
- Tasks are loaded automatically when the application starts

### Task Properties
- Each task has:
  - Unique ID
  - Text content
  - Completion status
  - Creation timestamp
  - Last update timestamp

### Validation
- Task text must be between 1 and 200 characters
- Empty tasks are not allowed
- Duplicate tasks are allowed

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

---

Happy Task Managing! 🎉