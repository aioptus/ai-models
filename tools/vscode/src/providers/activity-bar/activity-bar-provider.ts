import { ExtensionContext, window } from "vscode";
import { EnvConfigurationProvider } from "./env-config-provider";
import { activateTaskOutline } from "./task-outline-provider";
import { aioptusEvalManager } from "../aioptus/aioptus-eval";
import { ActiveTaskManager } from "../active-task/active-task-provider";
import { WorkspaceTaskManager } from "../workspace/workspace-task-provider";
import { WorkspaceEnvManager } from "../workspace/workspace-env-provider";
import { WorkspaceStateManager } from "../workspace/workspace-state-provider";
import { TaskConfigurationProvider } from "./task-config-provider";
import { aioptusManager } from "../aioptus/aioptus-manager";
import { DebugConfigTaskCommand, RunConfigTaskCommand } from "./task-config-commands";
import { aioptusViewManager } from "../logview/logview-view";
import { activateLogListing } from "./log-listing/log-listing-provider";
import { aioptusViewServer } from "../aioptus/aioptus-view-server";
import { aioptusLogsWatcher } from "../aioptus/aioptus-logs-watcher";

export async function activateActivityBar(
  aioptusManager: aioptusManager,
  aioptusEvalMgr: aioptusEvalManager,
  aioptusLogviewManager: aioptusViewManager,
  activeTaskManager: ActiveTaskManager,
  workspaceTaskMgr: WorkspaceTaskManager,
  workspaceStateMgr: WorkspaceStateManager,
  workspaceEnvMgr: WorkspaceEnvManager,
  aioptusViewServer: aioptusViewServer,
  logsWatcher: aioptusLogsWatcher,
  context: ExtensionContext
) {

  const [outlineCommands, treeDataProvider] = await activateTaskOutline(context, aioptusEvalMgr, workspaceTaskMgr, activeTaskManager, aioptusManager, aioptusLogviewManager);
  context.subscriptions.push(treeDataProvider);

  const [logsCommands, logsDispose] = await activateLogListing(context, workspaceEnvMgr, aioptusViewServer, logsWatcher);
  context.subscriptions.push(...logsDispose);

  const envProvider = new EnvConfigurationProvider(context.extensionUri, workspaceEnvMgr, workspaceStateMgr, aioptusManager);
  context.subscriptions.push(
    window.registerWebviewViewProvider(EnvConfigurationProvider.viewType, envProvider)
  );

  const taskConfigProvider = new TaskConfigurationProvider(context.extensionUri, workspaceStateMgr, activeTaskManager, aioptusManager);
  context.subscriptions.push(
    window.registerWebviewViewProvider(TaskConfigurationProvider.viewType, taskConfigProvider)
  );
  const taskConfigCommands = [
    new RunConfigTaskCommand(activeTaskManager, aioptusEvalMgr),
    new DebugConfigTaskCommand(activeTaskManager, aioptusEvalMgr),
  ];

  return [...outlineCommands, ...taskConfigCommands, ...logsCommands];
}

