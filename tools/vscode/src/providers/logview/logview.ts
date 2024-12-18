import { ExtensionContext } from "vscode";

import { Command } from "../../core/command";
import { logviewCommands } from "./commands";
import { aioptusViewWebviewManager } from "./logview-view";
import { aioptusViewManager } from "./logview-view";
import { aioptusManager } from "../aioptus/aioptus-manager";
import { WorkspaceEnvManager } from "../workspace/workspace-env-provider";
import { ExtensionHost } from "../../hooks";
import { aioptusViewServer } from "../aioptus/aioptus-view-server";
import { activateLogviewEditor } from "./logview-editor";
import { aioptusLogsWatcher } from "../aioptus/aioptus-logs-watcher";

export async function activateLogview(
  aioptusManager: aioptusManager,
  server: aioptusViewServer,
  envMgr: WorkspaceEnvManager,
  logsWatcher: aioptusLogsWatcher,
  context: ExtensionContext,
  host: ExtensionHost
): Promise<[Command[], aioptusViewManager]> {

  // activate the log viewer editor
  activateLogviewEditor(context, server);

  // initilize manager
  const logviewWebManager = new aioptusViewWebviewManager(
    aioptusManager,
    server,
    context,
    host
  );
  const logviewManager = new aioptusViewManager(
    context,
    logviewWebManager,
    envMgr,
    logsWatcher
  );

  // logview commands
  return [await logviewCommands(logviewManager), logviewManager];
}
