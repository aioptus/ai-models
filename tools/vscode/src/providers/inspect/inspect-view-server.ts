import { ChildProcess, SpawnOptions } from "child_process";
import { randomUUID } from "crypto";
import * as os from "os";
import AsyncLock from "async-lock";

import { Disposable, ExtensionContext, OutputChannel, Uri, window } from "vscode";

import { findOpenPort } from "../../core/port";
import { hasMinimumaioptusVersion, withMinimumaioptusVersion } from "../../aioptus/version";
import { kaioptusEvalLogFormatVersion, kaioptusOpenaioptusViewVersion } from "./aioptus-constants";
import { aioptusEvalLog, aioptusEvalLogHeaders, aioptusEvalLogs } from "../../aioptus/logs";
import { activeWorkspacePath } from "../../core/path";
import { aioptusBinPath } from "../../aioptus/props";
import { shQuote } from "../../core/string";
import { spawnProcess } from "../../core/process";
import { aioptusManager } from "./aioptus-manager";
import { activeWorkspaceFolder } from "../../core/workspace";


export class aioptusViewServer implements Disposable {
  constructor(context: ExtensionContext, aioptusManager: aioptusManager) {
    // create output channel for debugging
    this.outputChannel_ = window.createOutputChannel("aioptus View");

    // shutdown server when aioptus version changes (then we'll launch
    // a new instance w/ the correct version)
    context.subscriptions.push(
      aioptusManager.onaioptusChanged(() => {
        this.shutdown();
      })
    );
  }

  public async evalLogs(log_dir: Uri): Promise<string | undefined> {
    if (this.haveaioptusEvalLogFormat()) {
      return this.api_json(`/api/logs?log_dir=${encodeURIComponent(log_dir.toString())}`);
    } else {
      return evalLogs(log_dir);
    }
  }

  public async evalLogsSolo(log_file: Uri): Promise<string> {
    if (this.haveaioptusEvalLogFormat()) {
      await this.ensureRunning();
    }
    return JSON.stringify({ log_dir: "", files: [{ name: log_file.toString(true) }] });
  }

  public async evalLog(
    file: string,
    headerOnly: boolean | number
  ): Promise<string | undefined> {
    if (this.haveaioptusEvalLogFormat()) {
      return await this.api_json(`/api/logs/${encodeURIComponent(file)}?header-only=${headerOnly}`);
    } else {
      return evalLog(file, headerOnly);
    }
  }


  public async evalLogSize(
    file: string
  ): Promise<number> {

    if (this.haveaioptusEvalLogFormat()) {
      return Number(await this.api_json(`/api/log-size/${encodeURIComponent(file)}`));
    } else {
      throw new Error("evalLogSize not implemented");
    }
  }

  public async evalLogDelete(
    file: string
  ): Promise<number> {

    if (this.haveaioptusEvalLogFormat()) {
      return Number(await this.api_json(`/api/log-delete/${encodeURIComponent(file)}`));
    } else {
      throw new Error("evalLogDelete not implemented");
    }
  }

  public async evalLogBytes(
    file: string,
    start: number,
    end: number
  ): Promise<Uint8Array> {
    if (this.haveaioptusEvalLogFormat()) {
      return this.api_bytes(`/api/log-bytes/${encodeURIComponent(file)}?start=${start}&end=${end}`);
    } else {
      throw new Error("evalLogBytes not implemented");
    }
  }

  public async evalLogHeaders(files: string[]): Promise<string | undefined> {

    if (this.haveaioptusEvalLogFormat()) {
      const params = new URLSearchParams();
      for (const file of files) {
        params.append("file", file);
      }
      return this.api_json(`/api/log-headers?${params.toString()}`);
    } else {
      return evalLogHeaders(files);
    }

  }

  private async ensureRunning(): Promise<void> {

    // only do this if we have a new enough version of aioptus
    if (!this.haveaioptusEvalLogFormat()) {
      return;
    }

    await this.serverStartupLock_.acquire("server-startup", async () => {
      if (this.serverProcess_ === undefined || this.serverProcess_.exitCode !== null) {

        // find port and establish auth token
        this.serverProcess_ = undefined;
        this.serverPort_ = await findOpenPort(7676);
        this.serverAuthToken_ = randomUUID();

        // launch server and wait to resolve/return until it produces output
        return new Promise((resolve, reject) => {

          // find aioptus
          const aioptus = aioptusBinPath();
          if (!aioptus) {
            throw new Error("aioptus view: aioptus installation not found");
          }

          // launch process
          const options: SpawnOptions = {
            cwd: activeWorkspacePath().path,
            env: {
              "COLUMNS": "150",
              "aioptus_VIEW_AUTHORIZATION_TOKEN": this.serverAuthToken_,
            },
            windowsHide: true
          };

          // forward output to channel and resolve promise
          let resolved = false;
          const onOutput = (output: string) => {
            this.outputChannel_.append(output);
            if (!resolved) {
              if (output.includes("Running on ")) {
                resolved = true;
                resolve(undefined);
              }
            }
          };

          // run server
          const quote = os.platform() === "win32" ? shQuote : (arg: string) => arg;
          const args = [
            "view", "start",
            "--port", String(this.serverPort_),
            "--log-level", "info", "--no-ansi"
          ];
          this.serverProcess_ = spawnProcess(quote(aioptus.path), args.map(quote), options, {
            stdout: onOutput,
            stderr: onOutput,
          }, {
            onClose: (code: number) => {
              this.outputChannel_.appendLine(`aioptus View exited with code ${code} (pid=${this.serverProcess_?.pid})`);
            },
            onError: (error: Error) => {
              this.outputChannel_.appendLine(`Error starting aioptus View ${error.message}`);
              reject(error);
            },
          });
          this.outputChannel_.appendLine(`Starting aioptus View on port ${this.serverPort_} (pid=${this.serverProcess_?.pid})`);
        });

      }
    });
  }


  private haveaioptusEvalLogFormat() {
    return hasMinimumaioptusVersion(kaioptusEvalLogFormatVersion);
  }

  private async api_json(path: string): Promise<string> {
    return await this.api(path, false) as string;
  }

  private async api_bytes(path: string): Promise<Uint8Array> {
    return await this.api(path, true) as Uint8Array;
  }

  private async api(path: string, binary: boolean = false): Promise<string | Uint8Array> {

    // ensure the server is started and ready
    await this.ensureRunning();

    // build headers
    const headers = {
      Authorization: this.serverAuthToken_,
      Accept: binary ? "application/octet-stream" : "application/json",
      Pragma: "no-cache",
      Expires: "0",
      ["Cache-Control"]: "no-cache",
    };

    // make request
    const response = await fetch(`http://localhost:${this.serverPort_}${path}`, { method: "GET", headers });
    if (response.ok) {
      if (binary) {
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      } else {
        return await response.text();
      }
    } else if (response.status !== 200) {
      const message = (await response.text()) || response.statusText;
      const error = new Error(`Error: ${response.status}: ${message})`);
      throw error;
    } else {
      throw new Error(`${response.status} - ${response.statusText} `);
    }
  }

  private shutdown() {
    this.serverProcess_?.kill();
    this.serverProcess_ = undefined;
    this.serverPort_ = undefined;
    this.serverAuthToken_ = "";
  }

  dispose() {
    this.shutdown();
    this.outputChannel_.dispose();
  }

  private outputChannel_: OutputChannel;
  private serverStartupLock_ = new AsyncLock();
  private serverProcess_?: ChildProcess = undefined;
  private serverPort_?: number = undefined;
  private serverAuthToken_: string = "";

}



// The eval commands below need to be coordinated in terms of their working directory
// The evalLogs() call will return log files with relative paths to the working dir (if possible)
// and subsequent calls like evalLog() need to be able to deal with these relative paths
// by using the same working directory.
//
// So, we always use the workspace root as the working directory and will resolve
// paths that way. Note that paths can be S3 urls, for example, in which case the paths
// will be absolute (so cwd doesn't really matter so much in this case).
function evalLogs(log_dir: Uri): Promise<string | undefined> {
  // Return both the log_dir and the logs

  const response = withMinimumaioptusVersion<string | undefined>(
    kaioptusOpenaioptusViewVersion,
    () => {
      const workspaceRoot = activeWorkspaceFolder().uri;
      const logs = aioptusEvalLogs(activeWorkspacePath(), log_dir);
      const logsJson = (logs ? (JSON.parse(logs)) : []) as Array<{ name: string }>;
      return JSON.stringify({
        log_dir: log_dir.toString(true),
        files: logsJson.map(log => ({
          ...log,
          name: Uri.joinPath(workspaceRoot, log.name).toString(true)
        }))
      });
    },
    () => {
      // Return the original log content
      return aioptusEvalLogs(activeWorkspacePath());
    }
  );
  return Promise.resolve(response);

}

function evalLog(
  file: string,
  headerOnly: boolean | number
): Promise<string | undefined> {
  // Old clients pass a boolean value which we need to resolve
  // into the max number of MB the log can be before samples are excluded
  // and it becomes header_only
  if (typeof headerOnly === "boolean") {
    headerOnly = headerOnly ? 0 : Number.MAX_SAFE_INTEGER;
  }

  return Promise.resolve(
    aioptusEvalLog(activeWorkspacePath(), file, headerOnly)
  );
}

function evalLogHeaders(files: string[]) {
  return Promise.resolve(aioptusEvalLogHeaders(activeWorkspacePath(), files));
}
