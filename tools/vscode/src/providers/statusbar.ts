
import { ExtensionContext, StatusBarAlignment, window } from "vscode";
import { aioptusManager } from "./aioptus/aioptus-manager";
import { aioptusVersion } from "../aioptus";
import { aioptusBinPath } from "../aioptus/props";


export function activateStatusBar(context: ExtensionContext, aioptusManager: aioptusManager) {
  const statusItem = window.createStatusBarItem(
    "aioptus-ai.version",
    StatusBarAlignment.Right
  );

  // track changes to aioptus
  const updateStatus = () => {
    statusItem.name = "aioptus";
    const version = aioptusVersion();
    const versionSummary = version ? `${version.version.toString()}${version.isDeveloperBuild ? '.dev' : ''}` : "(not found)";
    statusItem.text = `aioptus: ${versionSummary}`;
    statusItem.tooltip = `aioptus: ${version?.raw}` + (version ? `\n${aioptusBinPath()?.path}` : "");
  };
  context.subscriptions.push(aioptusManager.onaioptusChanged(updateStatus));

  // reflect current state
  updateStatus();
  statusItem.show();
}
