import { Command } from "../../core/command";
import { aioptusViewManager } from "./logview-view";
import { showError } from "../../components/error";
import { commands } from "vscode";
import { kaioptusEvalLogFormatVersion, kaioptusOpenaioptusViewVersion } from "../aioptus/aioptus-constants";
import { LogviewState } from "./logview-state";
import { aioptusVersionDescriptor } from "../../aioptus/props";

export interface LogviewOptions {
  state?: LogviewState;
  activate?: boolean;
}


export async function logviewCommands(
  manager: aioptusViewManager,
): Promise<Command[]> {

  // Check whether the open in aioptus view command should be enabled
  const descriptor = aioptusVersionDescriptor();
  const enableOpenInView = descriptor?.version && descriptor.version.compare(kaioptusOpenaioptusViewVersion) >= 0 && descriptor.version.compare(kaioptusEvalLogFormatVersion) <= 0;
  await commands.executeCommand(
    "setContext",
    "aioptus.enableOpenInView",
    enableOpenInView
  );

  return [new ShowLogviewCommand(manager)];
}

class ShowLogviewCommand implements Command {
  constructor(private readonly manager_: aioptusViewManager) { }
  async execute(): Promise<void> {
    // ensure logview is visible
    try {
      await this.manager_.showaioptusView();
    } catch (err: unknown) {
      await showError(
        "An error occurred while attempting to start aioptus View",
        err instanceof Error ? err : Error(String(err))
      );
    }
  }

  private static readonly id = "aioptus.aioptusView";
  public readonly id = ShowLogviewCommand.id;
}

