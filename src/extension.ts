// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import type * as vscode from 'vscode';
import { ExtensionUtils } from './utils/ExtensionUtils';
import { ManifestXML } from './parser/ManifestXML';
import {
    ManifestDefinitionProvider
} from './providers/ManifestDefinitionProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate (
    context: vscode.ExtensionContext
): Promise<void> {
    ExtensionUtils.Global.CONTEXT = context;
    const mainManifestXML = new ManifestXML();

    // assign the providers
    const manifestDefinitionProvider = new ManifestDefinitionProvider(
        mainManifestXML
    );

    context.subscriptions.push(
        ...manifestDefinitionProvider.regDisposables
    );
}

// This method is called when your extension is deactivated
export function deactivate (): void { }
