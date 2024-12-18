import { workspace } from "vscode";

// aioptus Settings
export interface aioptusSettings {
  notifyEvalComplete: boolean;
}
export type aioptusLogViewStyle = "html" | "text";

// Settings namespace and constants
const kaioptusConfigSection = "aioptus";
const kaioptusConfigNotifyEvalComplete = "notifyEvalComplete";

// Manages the settings for the aioptus extension
export class aioptusSettingsManager {
  constructor(private readonly onChanged_: (() => void) | undefined) {
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(kaioptusConfigSection)) {
        // Configuration for has changed
        this.settings_ = undefined;
        if (this.onChanged_) {
          this.onChanged_();
        }
      }
    });
  }
  private settings_: aioptusSettings | undefined;

  // get the current settings values
  public getSettings(): aioptusSettings {
    if (!this.settings_) {
      this.settings_ = this.readSettings();
    }
    return this.settings_;
  }

  // write the notification pref
  public setNotifyEvalComplete(notify: boolean) {
    const configuration = workspace.getConfiguration(kaioptusConfigSection,);
    void configuration.update(kaioptusConfigNotifyEvalComplete, notify, true);
  }


  // Read settings values directly from VS.Code
  private readSettings() {
    const configuration = workspace.getConfiguration(kaioptusConfigSection);
    const notifyEvalComplete = configuration.get<boolean>(kaioptusConfigNotifyEvalComplete);
    return {
      notifyEvalComplete: notifyEvalComplete !== undefined ? notifyEvalComplete : true
    };
  }

}