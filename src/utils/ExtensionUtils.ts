// Copyright (c) 2023 MicroHobby
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-extraneous-class */
import * as vscode from "vscode";
import {
    EXT_SETTINGS_PREFIX,
    NOTIFICATION_PREFIX,
    OUTPUT_CHANNEL_NAME,
    OUT_ERR,
    OUT_WARN,
    PUBLISHER_NAME
} from "./Consts";

type ProgressCallback = (resolve?: any, progress?: vscode.Progress<{
    message?: string | undefined;
    increment?: number | undefined;
}>) => Promise<void>;

let _termID = 0;

interface IGlobal {
    CONTEXT: object;
};

/* static class */
export class ExtensionUtils {
    static Global: IGlobal = {
        CONTEXT: {}
    };

    static outputChannel: vscode.OutputChannel =
        vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);

    static statusBarProgressBar: vscode.StatusBarItem =
        vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    static getTimeStampFormated (): string {
        const date = new Date();
        const month = `0${(date.getMonth() + 1)}`.slice(-2);
        const day = `0${(date.getDate())}`.slice(-2);
        const hours = `0${(date.getHours())}`.slice(-2);
        const minutes = `0${(date.getMinutes())}`.slice(-2);
        const seconds = `0${(date.getSeconds())}`.slice(-2);
        const milliseconds = `0${(date.getMilliseconds())}`.slice(-3);

        return `${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    static writeln (msg: string, show: boolean = false): void {
        if (msg.trim() !== "") {
            const timeformatted = `[${ExtensionUtils.getTimeStampFormated()}] `;
            ExtensionUtils.outputChannel.appendLine(timeformatted + msg);
            console.log(timeformatted + msg);

            if (show) {
                ExtensionUtils.outputChannel.show(true);
            }
        }
    }

    static showStatusBarLoading (title: string): void {
        this.statusBarProgressBar.text = `$(loading~spin) ${title}`;
        this.statusBarProgressBar.show();
    }

    static hideStatusBar (): void {
        this.statusBarProgressBar.text = ``;
        this.statusBarProgressBar.hide();
    }

    static hideStatusBarLoading = ExtensionUtils.hideStatusBar;

    static showStatusBarError (message: string): void {
        this.statusBarProgressBar.text =
            `$(error) ${NOTIFICATION_PREFIX}: ${message}`;
        this.statusBarProgressBar.show();
    }

    static hideStatusBarError = ExtensionUtils.hideStatusBar;

    static showStatusBarWarning (message: string): void {
        this.statusBarProgressBar.text =
            `$(warning) ${NOTIFICATION_PREFIX}: ${message}`;
        this.statusBarProgressBar.show();
    }

    static hideStatusBarWarning = ExtensionUtils.hideStatusBar;

    static showStatusBarOk (message: string): void {
        this.statusBarProgressBar.text =
            `$(pass-filled) ${NOTIFICATION_PREFIX}: ${message}`;
        this.statusBarProgressBar.show();
    }

    static hideStatusBarOk = ExtensionUtils.hideStatusBar;

    static showProgress (title: string, msg: string,
        resFunc: ProgressCallback, cancellable: boolean = false): void {
        void vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable
        }, async progressNotification => {
            progressNotification.report({ message: msg });

            return await new Promise(resolve => {
                void resFunc(resolve, progressNotification);
            });
        });
    }

    static showError (
        message: string, notification: boolean = true
    ): void {
        ExtensionUtils.writeln(`${OUT_ERR} ${message}`, true);

        if (notification) {
            void vscode.window.showErrorMessage(message);
        }
    }

    static showSuccess (message: string): void {
        ExtensionUtils.writeln(message, true);
        void vscode.window.showInformationMessage(message);
    }

    static showWarning (
        message: string,
        modal: boolean = false,
        toOutput: boolean = true,
        notification: boolean = true
    ): void {
        ExtensionUtils.writeln(`${OUT_WARN} ${message}`, toOutput);

        if (notification) {
            void vscode.window.showWarningMessage(message, {
                modal
            });
        }
    }

    static createTerminal (
        name: string,
        shellArgs: string[]
    ): vscode.Terminal {
        const termOps: vscode.TerminalOptions = { shellArgs: [] };
        termOps.name = name;

        const term = vscode.window.createTerminal(termOps);
        term.sendText(
            `${shellArgs.join(" ")}`
        );
        term.show();

        return term;
    }

    static async showInput (
        title: string,
        placeHolder: string = "",
        password: boolean = false
    ): Promise<string> {
        return await new Promise((resolve, reject) => {
            void vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder,
                title,
                password
            }).then(val => {
                if (val == null) {
                    reject(new Error(`${title} can't be empty`));
                } else {
                    resolve(val);
                }
            });
        });
    }

    static async showInputList (
        list: string[],
        placeHolder: string
    ): Promise<string | undefined> {
        return await vscode.window.showQuickPick(list, {
            ignoreFocusOut: true,
            placeHolder
        });
    }

    static async showInputItem<T> (
        itemList: T[],
        placeHolder: string = ""
    ): Promise<T | undefined> {
        let item: T;
        return await new Promise(resolve => {
            const quickPick = vscode.window.createQuickPick();
            quickPick.items = (itemList as unknown as vscode.QuickPickItem[]);
            quickPick.canSelectMany = false;
            quickPick.ignoreFocusOut = true;
            quickPick.placeholder = placeHolder;
            quickPick.onDidHide(() => {
                quickPick.dispose();
                if (item == null) { resolve(undefined); }
            });
            quickPick.onDidAccept(() => {
                item = quickPick.activeItems[0] as unknown as T;
                quickPick.hide();
                resolve(item as unknown as T);
            });
            quickPick.show();
        });
    }

    static async showMultiInputItem<T> (
        itemList: T[],
        placeHolder: string = ""
    ): Promise<T[] | undefined> {
        let items: T[];
        return await new Promise(resolve => {
            const quickPick = vscode.window.createQuickPick();
            quickPick.items = (itemList as unknown as vscode.QuickPickItem[]);
            quickPick.canSelectMany = true;
            quickPick.ignoreFocusOut = true;
            quickPick.placeholder = placeHolder;
            quickPick.onDidHide(() => {
                quickPick.dispose();
                if (items == null) { resolve(undefined); }
            });
            quickPick.onDidAccept(() => {
                items = quickPick.selectedItems as unknown as T[];
                quickPick.hide();
                resolve(items as unknown as T[]);
            });
            quickPick.show();
        });
    }

    static async showFolderChooser (): Promise<vscode.Uri[] | undefined> {
        return await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            title: "Select Folder"
        });
    }

    static async showYesNoInput (ask: string): Promise<boolean> {
        return await new Promise(resolve => {
            void vscode.window.showInformationMessage(ask, "Yes", "No")
                .then(answer => {
                    if (answer === "Yes") {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
        });
    }

    static fromSettings<T> (key: string): T | undefined {
        return vscode.workspace.getConfiguration(EXT_SETTINGS_PREFIX).get(key);
    }

    static setContextVar<T> (_var: string, _value: T): void {
        void vscode.commands.executeCommand(
            "setContext",
            _var,
            _value
        );
    }

    static async runOnTerminal (cmd: string): Promise<boolean> {
        _termID++;
        return await new Promise(resolve => {
            const term = vscode.window
                .createTerminal({
                    name: `NuttX cmd ${_termID}`,
                    shellPath: "/bin/bash",
                    // eslint-disable-next-line spellcheck/spell-checker
                    shellArgs: ["--norc", "--noprofile"],
                    env: {
                        PS1: ""
                    },
                    message: `Running NuttX cmd ${_termID}`
                });
            term.show();
            term.sendText(`${cmd} ; exit`, true);

            const termDispose = vscode.window.onDidCloseTerminal(term => {
                if (term.name === ` NuttX cmd ${_termID}`) {
                    termDispose.dispose();
                    resolve(term.exitStatus?.code === 0);
                }
            });
        });
    }

    static async runCommand (cmd: string, ...args: any[]): Promise<void> {
        await vscode.commands.executeCommand(cmd, ...args);
    }

    static getInstallationPath (): string | undefined {
        return vscode.extensions
            .getExtension(PUBLISHER_NAME)
            ?.extensionPath;
    }

    static async saveGlobalState<T> (obj: T): Promise<void> {
        const context =
            (ExtensionUtils.Global.CONTEXT as vscode.ExtensionContext);

        await context.globalState.update(
            PUBLISHER_NAME,
            obj
        );
    }

    static async loadGlobalState<T> (): Promise<T | undefined> {
        const context =
            (ExtensionUtils.Global.CONTEXT as vscode.ExtensionContext);

        return await context.globalState.get(
            PUBLISHER_NAME
        );
    }

    static async saveSecret (key: string, value: string): Promise<void> {
        const context = (this.Global.CONTEXT as vscode.ExtensionContext);
        await context.secrets.store(key, value);
    }

    static async getSecret (key: string): Promise<string | undefined> {
        const context = (this.Global.CONTEXT as vscode.ExtensionContext);
        return await context.secrets.get(key);
    }

    static async removeSecret (key: string): Promise<void> {
        const context = (this.Global.CONTEXT as vscode.ExtensionContext);
        await context.secrets.delete(key);
    }

    static async delay (milliseconds: number): Promise<void> {
        await new Promise<void>(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
}
