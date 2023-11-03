/* eslint-disable no-case-declarations */
import * as vscode from 'vscode';
import * as Path from 'path';
import { JSDOM } from 'jsdom';
import { type ManifestXML } from '../parser/ManifestXML';

export class ManifestDefinitionProvider implements
    vscode.DefinitionProvider {
    regDisposables: vscode.Disposable[] = [];
    private readonly _manifestXML: ManifestXML;

    constructor (manifestXML: ManifestXML) {
        this.regDisposables.push(vscode.languages.registerDefinitionProvider(
            { scheme: 'file', language: 'xml' },
            this
        ));

        this._manifestXML = manifestXML;
    }

    provideDefinition (
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        if (
            document.languageId === "xml"
        ) {
            // get all the tag
            const fullText = document.getText();
            let offset = document.offsetAt(position);
            let startOffset = offset;
            let endOffset = offset;
            let text = fullText.slice(startOffset, endOffset);

            while (!(text.startsWith("<") && text.endsWith(">"))) {
                if (!text.startsWith("<")) {
                    startOffset--;
                }
                if (!text.endsWith(">")) {
                    endOffset++;
                }
                text = fullText.slice(startOffset, endOffset);
            }

            let start = document.positionAt(startOffset);
            let end = document.positionAt(endOffset);
            const rangeTag = new vscode.Range(start, end);
            const wordTag = document.getText(rangeTag);

            // check if this is an attr
            offset = document.offsetAt(position);
            startOffset = offset;
            endOffset = offset;
            text = fullText.slice(startOffset, endOffset);

            while (
                !(text.startsWith(" ") && text.endsWith("\""))
            ) {
                if (!text.startsWith(" ")) {
                    startOffset--;
                }
                if (!text.endsWith("\"")) {
                    endOffset++;
                }
                text = fullText.slice(startOffset, endOffset);
            }

            start = document.positionAt(startOffset);
            end = document.positionAt(endOffset);
            const rangeAttr = new vscode.Range(start, end);
            const wordAttr = document.getText(rangeAttr).trim();

            // parse the wordAttr in a key value
            const slices = wordAttr.split("=");
            const attr = {
                key: '',
                value: ''
            };

            if (slices.length === 2) {
                attr.key = slices[0];
                attr.value =
                    slices[1]
                        .replace("\"", "")
                        .replace("\"", "");
            }

            // ok now possible we can find the tag by the position
            const tag = new JSDOM(wordTag);
            const includeTag =
                tag.window.document.getElementsByTagName("include")[0];

            if (includeTag != null) {
                const path = Path.join(
                    vscode.workspace.rootPath!,
                    includeTag.getAttribute("name")!
                );

                // for includes we need to go to file
                return [{
                    targetUri: vscode.Uri.file(
                        path
                    ),
                    targetRange: new vscode.Range(
                        0,
                        0,
                        0,
                        0
                    ),
                    originSelectionRange: rangeTag
                }];
            }

            const projectTag =
                tag.window.document.getElementsByTagName("project")[0];

            if (projectTag != null) {
                if (attr.key !== '' && attr.value !== '') {
                    switch (attr.key) {
                        case 'remote':
                            // find the tag attr
                            const domTag = this._manifestXML
                                .workSpaceManifests.find(
                                    obj => obj.remotes.find(
                                        rem => rem.name.value === attr.value
                                    )
                                );

                            if (domTag != null) {
                                const remTag = domTag.remotes.find(
                                    rem => rem.name.value === attr.value
                                );

                                return [{
                                    targetUri: vscode.Uri.file(
                                        domTag.file.toString()
                                    ),
                                    targetRange: new vscode.Range(
                                        remTag!.startLine - 1,
                                        remTag!.startCol,
                                        remTag!.startLine,
                                        remTag!.endCol
                                    ),
                                    originSelectionRange: rangeAttr
                                }];
                            }
                            break;
                    }
                }
            }
        }

        return undefined;
    }
}
