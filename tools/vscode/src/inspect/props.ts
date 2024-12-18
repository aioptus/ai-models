import { SemVer, coerce } from "semver";

import { log } from "../core/log";
import { pythonBinaryPath, pythonInterpreter } from "../core/python";
import { AbsolutePath, toAbsolutePath } from "../core/path";
import { Disposable } from "vscode";
import { runProcess } from "../core/process";
import { join } from "path";
import { userDataDir, userRuntimeDir } from "../core/appdirs";
import { kaioptusChangeEvalSignalVersion } from "../providers/aioptus/aioptus-constants";
import { existsSync } from "fs";

export const kPythonPackageName = "aioptus";

export interface VersionDescriptor {
  raw: string;
  version: SemVer,
  isDeveloperBuild: boolean
}

// we cache the results of these functions so long as
// they (a) return success, and (b) the active python
// interpreter hasn't been changed
class aioptusPropsCache implements Disposable {
  private readonly eventHandle_: Disposable;

  constructor(
    private binPath_: AbsolutePath | null,
    private version_: VersionDescriptor | null,
    private viewPath_: AbsolutePath | null
  ) {
    this.eventHandle_ = pythonInterpreter().onDidChange(() => {
      log.info("Resetting aioptus props to null");
      this.binPath_ = null;
      this.version_ = null;
      this.viewPath_ = null;
    });
  }

  get binPath(): AbsolutePath | null {
    return this.binPath_;
  }

  setBinPath(binPath: AbsolutePath) {
    log.info(`aioptus bin path: ${binPath.path}`);
    this.binPath_ = binPath;
  }

  get version(): VersionDescriptor | null {
    return this.version_;
  }

  setVersion(version: VersionDescriptor) {
    log.info(`aioptus version: ${version.version.toString()}`);
    this.version_ = version;
  }

  get viewPath(): AbsolutePath | null {
    return this.viewPath_;
  }

  setViewPath(path: AbsolutePath) {
    log.info(`aioptus view path: ${path.path}`);
    this.viewPath_ = path;
  }

  dispose() {
    this.eventHandle_.dispose();
  }
}

export function initaioptusProps(): Disposable {
  aioptusPropsCache_ = new aioptusPropsCache(null, null, null);
  return aioptusPropsCache_;
}

let aioptusPropsCache_: aioptusPropsCache;

export function aioptusVersionDescriptor(): VersionDescriptor | null {
  if (aioptusPropsCache_.version) {
    return aioptusPropsCache_.version;
  } else {
    const aioptusBin = aioptusBinPath();
    if (aioptusBin) {
      try {
        const versionJson = runProcess(aioptusBin, [
          "info",
          "version",
          "--json",
        ]);
        const version = JSON.parse(versionJson) as {
          version: string;
          path: string;
        };

        const parsedVersion = coerce(version.version);
        if (parsedVersion) {
          const isDeveloperVersion = version.version.indexOf('.dev') > -1;
          const aioptusVersion = {
            raw: version.version,
            version: parsedVersion,
            isDeveloperBuild: isDeveloperVersion
          };
          aioptusPropsCache_.setVersion(aioptusVersion);
          return aioptusVersion;
        } else {
          return null;
        }
      } catch (error) {
        log.error("Error attempting to read aioptus version.");
        log.error(error instanceof Error ? error : String(error));
        return null;
      }
    } else {
      return null;
    }
  }
}

// path to aioptus view www assets
export function aioptusViewPath(): AbsolutePath | null {
  if (aioptusPropsCache_.viewPath) {
    return aioptusPropsCache_.viewPath;
  } else {
    const aioptusBin = aioptusBinPath();
    if (aioptusBin) {
      try {
        const versionJson = runProcess(aioptusBin, [
          "info",
          "version",
          "--json",
        ]);
        const version = JSON.parse(versionJson) as {
          version: string;
          path: string;
        };
        let viewPath = toAbsolutePath(version.path)
          .child("_view")
          .child("www")
          .child("dist");

        if (!existsSync(viewPath.path)) {
          // The dist folder is only available on newer versions, this is for
          // backwards compatibility only
          viewPath = toAbsolutePath(version.path)
            .child("_view")
            .child("www");
        }
        aioptusPropsCache_.setViewPath(viewPath);
        return viewPath;
      } catch (error) {
        log.error("Error attempting to read aioptus view path.");
        log.error(error instanceof Error ? error : String(error));
        return null;
      }
    } else {
      return null;
    }
  }
}

export function aioptusBinPath(): AbsolutePath | null {
  if (aioptusPropsCache_.binPath) {
    return aioptusPropsCache_.binPath;
  } else {
    const interpreter = pythonInterpreter();
    if (interpreter.available) {
      try {
        const binPath = pythonBinaryPath(interpreter, aioptusFileName());
        if (binPath) {
          aioptusPropsCache_.setBinPath(binPath);
        }
        return binPath;
      } catch (error) {
        log.error("Error attempting to read aioptus version.");
        log.error(error instanceof Error ? error : String(error));
        return null;
      }
    } else {
      return null;
    }
  }
}

export function aioptusLastEvalPaths(): AbsolutePath[] {
  const descriptor = aioptusVersionDescriptor();
  const fileName =
    descriptor && descriptor.version.compare(kaioptusChangeEvalSignalVersion) < 0
      ? "last-eval"
      : "last-eval-result";

  return [userRuntimeDir(kPythonPackageName), userDataDir(kPythonPackageName)]
    .map(dir => join(dir, "view", fileName))
    .map(toAbsolutePath);
}

function aioptusFileName(): string {
  switch (process.platform) {
    case "darwin":
      return "aioptus";
    case "win32":
      return "aioptus.exe";
    case "linux":
    default:
      return "aioptus";
  }
}