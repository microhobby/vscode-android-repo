// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ExtensionUtils } from './utils/ExtensionUtils';
import { ManifestXML } from './parser/ManifestXML';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate (context: vscode.ExtensionContext): void {
    ExtensionUtils.Global.CONTEXT = context;

    console
        // eslint-disable-next-line max-len
        .log('Congratulations, your extension "vscode-android-repo" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand(
        'vscode-android-repo.helloWorld',
        () => {
            if (vscode.window.activeTextEditor != null) {
                void ManifestXML.Parse(vscode.window.activeTextEditor.document);
            }
        }
    );

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate (): void { }
