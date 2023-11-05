/* eslint-disable no-case-declarations */
import * as vscode from 'vscode';
import * as crypto from 'crypto';
// import * as Path from 'path';
import { JSDOM } from 'jsdom';
import { type ManifestXML } from '../parser/ManifestXML';

export class ManifestHoverProvider implements
    vscode.HoverProvider {
    regDisposables: vscode.Disposable[] = [];
    private readonly _manifestXML: ManifestXML;

    constructor (manifestXML: ManifestXML) {
        this.regDisposables.push(vscode.languages.registerHoverProvider(
            { scheme: 'file', language: 'xml' },
            this
        ));

        this._manifestXML = manifestXML;
    }

    provideHover (
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
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
        const projectTag =
            tag.window.document.getElementsByTagName("project")[0];

        if (projectTag != null) {
            if (attr.key !== '' && attr.value !== '') {
                switch (attr.key) {
                    case 'name':
                        // create a hover with the link for the remote
                        // find the remote tag
                        const remoteName = projectTag.getAttribute("remote");
                        const remoteDomTag = this._manifestXML
                            .workSpaceManifests.find(
                                obj => obj.remotes.find(
                                    rem => rem.name.value === remoteName
                                )
                            );

                        if (remoteDomTag != null) {
                            const remoteTag = remoteDomTag.remotes.find(
                                obj => obj.name.value === remoteName
                            );

                            const remoteFetchURLSlices =
                                remoteTag?.fetch.value?.split("/");
                            const fetchUser = remoteFetchURLSlices![
                                remoteFetchURLSlices!.length - 1
                            ];

                            const date = new Date();
                            const hash = crypto.createHash('sha256');
                            hash.update(date.toISOString());

                            const hoverMsg = new vscode.MarkdownString();
                            hoverMsg.supportHtml = true;
                            hoverMsg.appendMarkdown(`Repo: `);
                            // eslint-disable-next-line max-len
                            hoverMsg.appendMarkdown(`[${remoteTag?.fetch.value}/${attr.value}](${remoteTag?.fetch.value}/${attr.value})`);
                            hoverMsg.appendText("\n");
                            // eslint-disable-next-line max-len
                            // console.log(`https://opengraph.githubassets.com/${hash.digest('hex')}/${fetchUser}/${attr.value}`);
                            // eslint-disable-next-line max-len
                            hoverMsg.appendMarkdown(`<img width="500" src="https://opengraph.githubassets.com/${hash.digest('hex')}/${fetchUser}/${attr.value}" />`);
                            hoverMsg.appendText("\n");

                            const remoteHover = new vscode.Hover(
                                hoverMsg,
                                rangeAttr
                            );

                            return remoteHover;
                        }

                        break;
                }
            }
        }

        return undefined;
    }
}
