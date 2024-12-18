import { ExtensionContext, MessageItem, window } from "vscode";

import { CommandManager } from "./core/command";
import { activateCodeLens } from "./providers/codelens/codelens-provider";
import { activateLogview } from "./providers/logview/logview";
import { logviewTerminalLinkProvider } from "./providers/logview/logview-link-provider";
import { aioptusSettingsManager } from "./providers/settings/aioptus-settings";
import { initializeGlobalSettings } from "./providers/settings/user-settings";
import { activateEvalManager } from "./providers/aioptus/aioptus-eval";
import { activateActivityBar } from "./providers/activity-bar/activity-bar-provider";
import { activateActiveTaskProvider } from "./providers/active-task/active-task-provider";
import { activateWorkspaceTaskProvider } from "./providers/workspace/workspace-task-provider";
import {
  activateWorkspaceState,
} from "./providers/workspace/workspace-state-provider";
import { initializeWorkspace } from "./providers/workspace/workspace-init";
import { activateWorkspaceEnv } from "./providers/workspace/workspace-env-provider";
import { initPythonInterpreter } from "./core/python";
import { initaioptusProps } from "./aioptus";
import { activateaioptusManager } from "./providers/aioptus/aioptus-manager";
import { checkActiveWorkspaceFolder } from "./core/workspace";
import { aioptusBinPath, aioptusVersionDescriptor } from "./aioptus/props";
import { extensionHost } from "./hooks";
import { activateStatusBar } from "./providers/statusbar";
import { aioptusViewServer } from "./providers/aioptus/aioptus-view-server";
import { aioptusLogsWatcher } from "./providers/aioptus/aioptus-logs-watcher";
import { activateLogNotify } from "./providers/lognotify";
import { activateOpenLog } from "./providers/openlog";
import { activateProtocolHandler } from "./providers/protocol-handler";
import { activateaioptusCommands } from "./providers/aioptus/aioptus-commands";

const kaioptusMinimumVersion = "0.3.8";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
  // we don't activate anything if there is no workspace
  if (!checkActiveWorkspaceFolder()) {
    return;
  }

  // Get the host
  const host = extensionHost();

  const commandManager = new CommandManager();

  // init python interpreter
  context.subscriptions.push(await initPythonInterpreter());

  // init aioptus props
  context.subscriptions.push(initaioptusProps());

  // Initialize global settings
  await initializeGlobalSettings();

  // Warn the user if they don't have a recent enough version
  void checkaioptusVersion();

  // Activate the workspacestate manager
  const [stateCommands, stateManager] = activateWorkspaceState(context);

  // For now, create an output channel for env changes
  const workspaceActivationResult = activateWorkspaceEnv();
  const [envComands, workspaceEnvManager] = workspaceActivationResult;
  context.subscriptions.push(workspaceEnvManager);

  // Initial the workspace
  await initializeWorkspace(stateManager);

  // Initialize the protocol handler
  activateProtocolHandler(context);

  // aioptus Manager watches for changes to aioptus binary
  const aioptusManager = activateaioptusManager(context);
  context.subscriptions.push(aioptusManager);

  // Eval Manager
  const [aioptusEvalCommands, aioptusEvalMgr] = await activateEvalManager(
    stateManager,
    context
  );

  // Activate commands interface
  activateaioptusCommands(stateManager, context);

  // Activate a watcher which aioptuss the active document and determines
  // the active task (if any)
  const [taskCommands, activeTaskManager] = activateActiveTaskProvider(
    aioptusEvalMgr,
    context
  );

  // Active the workspace manager to watch for tasks
  const workspaceTaskMgr = activateWorkspaceTaskProvider(
    aioptusManager,
    context
  );

  // Read the extension configuration
  const settingsMgr = new aioptusSettingsManager(() => { });

  // initialiaze view server
  const server = new aioptusViewServer(context, aioptusManager);

  // initialise logs watcher
  const logsWatcher = new aioptusLogsWatcher(stateManager);

  // Activate the log view
  const [logViewCommands, logviewWebviewManager] = await activateLogview(
    aioptusManager,
    server,
    workspaceEnvManager,
    logsWatcher,
    context,
    host
  );
  const aioptusLogviewManager = logviewWebviewManager;

  // initilisze open log
  activateOpenLog(context, logviewWebviewManager);

  // Activate the Activity Bar
  const taskBarCommands = await activateActivityBar(
    aioptusManager,
    aioptusEvalMgr,
    aioptusLogviewManager,
    activeTaskManager,
    workspaceTaskMgr,
    stateManager,
    workspaceEnvManager,
    server,
    logsWatcher,
    context
  );

  // Register the log view link provider
  window.registerTerminalLinkProvider(
    logviewTerminalLinkProvider()
  );

  // Activate Code Lens
  activateCodeLens(context);

  // Activate Status Bar
  activateStatusBar(context, aioptusManager);

  // Activate Log Notification
  activateLogNotify(context, logsWatcher, settingsMgr, aioptusLogviewManager);

  // Activate commands
  [
    ...logViewCommands,
    ...aioptusEvalCommands,
    ...taskBarCommands,
    ...stateCommands,
    ...envComands,
    ...taskCommands,
  ].forEach((cmd) => commandManager.register(cmd));
  context.subscriptions.push(commandManager);

  // refresh the active task state
  await activeTaskManager.refresh();
}


const checkaioptusVersion = async () => {
  if (aioptusBinPath()) {
    const descriptor = aioptusVersionDescriptor();
    if (descriptor && descriptor.version.compare(kaioptusMinimumVersion) === -1) {
      const close: MessageItem = { title: "Close" };
      await window.showInformationMessage<MessageItem>(
        "The VS Code extension requires a newer version of aioptus. Please update " +
        "with pip install --upgrade aioptus-ai",
        close
      );
    }
  }
};