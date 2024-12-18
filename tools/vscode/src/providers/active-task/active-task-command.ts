import { Command } from "../../core/command";
import { toAbsolutePath } from "../../core/path";
import { aioptusEvalManager } from "../aioptus/aioptus-eval";
import { ActiveTaskManager } from "./active-task-provider";



export class RunActiveTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly aioptusMgr_: aioptusEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      await this.aioptusMgr_.startEval(docPath, taskInfo.activeTask?.name, false);
    }
  }

  private static readonly id = "aioptus.runActiveTask";
  public readonly id = RunActiveTaskCommand.id;
}

export class DebugActiveTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly aioptusMgr_: aioptusEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      await this.aioptusMgr_.startEval(docPath, taskInfo.activeTask?.name, true);
    }
  }

  private static readonly id = "aioptus.debugActiveTask";
  public readonly id = DebugActiveTaskCommand.id;
}

