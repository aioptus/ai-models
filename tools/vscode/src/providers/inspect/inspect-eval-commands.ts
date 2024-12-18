import { Uri } from "vscode";
import { Command } from "../../core/command";
import { aioptusEvalManager } from "./aioptus-eval";
import { toAbsolutePath } from "../../core/path";
import { scheduleFocusActiveEditor } from "../../components/focus";

export function aioptusEvalCommands(manager: aioptusEvalManager): Command[] {
  return [new RunEvalCommand(manager), new DebugEvalCommand(manager)];
}

export class RunEvalCommand implements Command {
  constructor(private readonly manager_: aioptusEvalManager) { }
  async execute(documentUri: Uri, fnName: string): Promise<void> {
    const cwd = toAbsolutePath(documentUri.fsPath);

    const evalPromise = this.manager_.startEval(cwd, fnName, false);
    scheduleFocusActiveEditor();
    await evalPromise;
  }
  private static readonly id = "aioptus.runTask";
  public readonly id = RunEvalCommand.id;
}

export class DebugEvalCommand implements Command {
  constructor(private readonly manager_: aioptusEvalManager) { }
  async execute(documentUri: Uri, fnName: string): Promise<void> {
    const cwd = toAbsolutePath(documentUri.fsPath);
    await this.manager_.startEval(cwd, fnName, true);
  }
  private static readonly id = "aioptus.debugTask";
  public readonly id = DebugEvalCommand.id;
}

