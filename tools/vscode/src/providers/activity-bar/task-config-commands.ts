import { Command } from "../../core/command";
import { toAbsolutePath } from "../../core/path";
import { aioptusEvalManager } from "../aioptus/aioptus-eval";
import { ActiveTaskManager } from "../active-task/active-task-provider";
import { scheduleReturnFocus } from "../../components/focus";

export class RunConfigTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly aioptusMgr_: aioptusEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      const evalPromise = this.aioptusMgr_.startEval(docPath, taskInfo.activeTask?.name, false);
      scheduleReturnFocus("aioptus.task-configuration.focus");
      await evalPromise;
    }
  }

  private static readonly id = "aioptus.runConfigTask";
  public readonly id = RunConfigTaskCommand.id;
}

export class DebugConfigTaskCommand implements Command {
  constructor(private readonly manager_: ActiveTaskManager,
    private readonly aioptusMgr_: aioptusEvalManager
  ) { }
  async execute(): Promise<void> {
    const taskInfo = this.manager_.getActiveTaskInfo();
    if (taskInfo) {
      const docPath = toAbsolutePath(taskInfo.document.fsPath);
      const evalPromise = this.aioptusMgr_.startEval(docPath, taskInfo.activeTask?.name, true);
      scheduleReturnFocus("aioptus.task-configuratio.focus");
      await evalPromise;
    }
  }

  private static readonly id = "aioptus.debugConfigTask";
  public readonly id = DebugConfigTaskCommand.id;
}
