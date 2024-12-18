import { Disposable, Event, EventEmitter, ExtensionContext } from "vscode";
import { pythonInterpreter } from "../../core/python";
import { aioptusBinPath } from "../../aioptus/props";
import { AbsolutePath } from "../../core/path";
import { delimiter } from "path";

// Activates the provider which tracks the availability of aioptus
export function activateaioptusManager(context: ExtensionContext) {
  const aioptusManager = new aioptusManager(context);

  // Initialize the terminal with the aioptus bin path
  // on the path (if needed)
  const terminalEnv = terminalEnvironment(context);
  context.subscriptions.push(aioptusManager.onaioptusChanged((e: aioptusChangedEvent) => {
    terminalEnv.update(e.binPath);
  }));
  terminalEnv.update(aioptusBinPath());

  return aioptusManager;
}

// Fired when the active task changes
export interface aioptusChangedEvent {
  available: boolean;
  binPath: AbsolutePath | null;
}

export class aioptusManager implements Disposable {
  constructor(context: ExtensionContext) {
    // If the interpreter changes, refresh the tasks
    context.subscriptions.push(
      pythonInterpreter().onDidChange(() => {
        this.updateaioptusAvailable();
      })
    );
    this.updateaioptusAvailable();
  }
  private aioptusBinPath_: string | undefined = undefined;

  get available(): boolean {
    return this.aioptusBinPath_ !== null;
  }

  private updateaioptusAvailable() {
    const binPath = aioptusBinPath();
    const available = binPath !== null;
    const valueChanged = this.aioptusBinPath_ !== binPath?.path;
    if (valueChanged) {
      this.aioptusBinPath_ = binPath?.path;
      this.onaioptusChanged_.fire({ available: !!this.aioptusBinPath_, binPath });
    }
    if (!available) {
      this.watchForaioptus();
    }
  }

  watchForaioptus() {
    this.aioptusTimer = setInterval(() => {
      const path = aioptusBinPath();
      if (path) {
        if (this.aioptusTimer) {
          clearInterval(this.aioptusTimer);
          this.aioptusTimer = null;
          this.updateaioptusAvailable();
        }
      }
    }, 3000);
  }

  private aioptusTimer: NodeJS.Timeout | null = null;

  dispose() {
    if (this.aioptusTimer) {
      clearInterval(this.aioptusTimer);
      this.aioptusTimer = null;
    }
  }

  private readonly onaioptusChanged_ = new EventEmitter<aioptusChangedEvent>();
  public readonly onaioptusChanged: Event<aioptusChangedEvent> =
    this.onaioptusChanged_.event;
}

// Configures the terminal environment to support aioptus. We do this
// to ensure the the 'aioptus' command will work from within the
// terminal (especially in cases where the global interpreter is being used)
const terminalEnvironment = (context: ExtensionContext) => {
  const filter = (binPath: AbsolutePath | null) => {
    switch (process.platform) {
      case "win32":
        {
          const localPath = process.env['LocalAppData'];
          if (localPath) {
            return binPath?.path.startsWith(localPath);
          }
          return false;
        }
      case "linux":
        return binPath && binPath.path.includes(".local/bin");
      default:
        return false;
    }
  };

  return {
    update: (binPath: AbsolutePath | null) => {
      // The path info
      const env = context.environmentVariableCollection;
      env.delete('PATH');
      // Actually update the path
      const binDir = binPath?.dirname();
      if (binDir && filter(binPath)) {
        env.append('PATH', `${delimiter}${binDir.path}`);
      }
    }
  };
};
