# aioptus-vscode

VS Code extension for the aioptus framework for large language model evaluations. This extension provides support for developing evaluations using aioptus, including:

- Integrated viewer for evaluation log files
- Panel to browse, run, and debug tasks in the workspace
- Panel for editing aioptus `.env` file
- Panel for configuring task CLI options and args
- Commands and key-bindings for running tasks
- Commands and key-bindings for debugging tasks

## Log Viewer

The `aioptus view` command is used to automatically display the log for tasks executed within the workspace (this behavior can be controlled with an option).

## Task Navigation

The Tasks panel displays a listing of all the aioptus tasks within your workspace. Selecting the source file or task within the listing will open the task source code in the source editor (or Notebook viewer). You can display a tree of tasks including folders and hierarchy or a flat list of tasks sorted alphabetically.

## Configuration Panel

Use the Configuration (.env) panel to edit common settings in your `.env.` file including the model provider and name, and the log directory and level.

## Task Panel

Use the Task panel to edit CLI options for a task, set task args, and run or debug a task. Values will be saved for each task and used whenever the task is run or debugged from within the aioptus VS Code extension.

## Running and Debugging

The aioptus VS Code extension includes commands and keyboard shortcuts for running or debugging tasks. After the task has been completed, `aioptus view` is used behind the scenes to provide a results pane within VS Code alongside your source code.

Use the run or debug commands to execute the current task. You can alternatively use the <kbd>Ctrl+Shift+U</kbd> keyboard shortcut to run a task, or the <kbd>Ctrl+Shift+T</kbd> keyboard shortcut to debug a task.

> Note that on the Mac you should use `Cmd` rather than `Ctrl` as the prefix for all aioptus keyboard shortcuts.


