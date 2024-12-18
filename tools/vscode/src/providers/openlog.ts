import { ExtensionContext, TextDocumentShowOptions, Uri, commands } from "vscode";
import { kaioptusLogViewType } from "./logview/logview-editor";
import { hasMinimumaioptusVersion } from "../aioptus/version";
import { kaioptusEvalLogFormatVersion } from "./aioptus/aioptus-constants";
import { aioptusViewManager } from "./logview/logview-view";
import { withEditorAssociation } from "../core/vscode/association";


export function activateOpenLog(
  context: ExtensionContext,
  viewManager: aioptusViewManager
) {

  context.subscriptions.push(commands.registerCommand('aioptus.openLogViewer', async (uri: Uri) => {

    // function to open using defualt editor in preview mode
    const openLogViewer = async () => {
      await commands.executeCommand(
        'vscode.open',
        uri,
        <TextDocumentShowOptions>{ preview: true }
      );
    };

    if (hasMinimumaioptusVersion(kaioptusEvalLogFormatVersion)) {
      if (uri.path.endsWith(".eval")) {

        await openLogViewer();

      } else {

        await withEditorAssociation(
          {
            viewType: kaioptusLogViewType,
            filenamePattern: "{[0-9][0-9][0-9][0-9]}-{[0-9][0-9]}-{[0-9][0-9]}T{[0-9][0-9]}[:-]{[0-9][0-9]}[:-]{[0-9][0-9]}*{[A-Za-z0-9]{21}}*.json"
          },
          openLogViewer
        );

      }

      // notify the logs pane that we are doing this so that it can take a reveal action
      await commands.executeCommand('aioptus.logListingReveal', uri);
    } else {
      await viewManager.showLogFile(uri, "activate");
    }

  }));

}