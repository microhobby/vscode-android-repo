import * as vscode from 'vscode';
import * as jsdom from 'jsdom';
import { type Token } from 'parse5';
import { Include } from './Include';
import { Remote } from './Remote';
import { Project } from './Project';
import { ExtensionUtils } from '../utils/ExtensionUtils';
import { type IAttr } from './IAttr';

export class ManifestXML {
    private readonly _mainFile: jsdom.JSDOM;
    private readonly _includes: Include[] = [];
    private readonly _remotes: Remote[] = [];
    private readonly _projects: Project[] = [];
    private _parsedManifests: IAttr[] = [];

    get mainFile (): jsdom.JSDOM {
        return this._mainFile;
    }

    get includes (): Include[] {
        return this._includes;
    }

    get remotes (): Remote[] {
        return this._remotes;
    }

    get projects (): Project[] {
        return this._projects;
    }

    public static async Parse (
        xmlDoc: vscode.TextDocument
    ): Promise<ManifestXML | undefined> {
        const xmlDOM = new jsdom.JSDOM(xmlDoc.getText(), {
            includeNodeLocations: true
        });

        if (xmlDOM != null) {
            // get all the remotes
            const rawRemotes =
                xmlDOM.window.document.getElementsByTagName("remote");
            const remotes: Remote[] = [];

            for (const rem of rawRemotes) {
                const alias = rem.getAttribute("alias");
                const fetch = rem.getAttribute("fetch");
                const name = rem.getAttribute("name");

                const remote = new Remote(alias!, fetch!, name!);

                // position
                const remLoc =
                    xmlDOM.nodeLocation(rem) as Token.LocationWithAttributes;
                remote.setPositionData(remLoc);

                if (remLoc.attrs?.alias != null) {
                    remote.alias.setPositionData(remLoc.attrs.alias);
                }

                if (remLoc.attrs?.fetch != null) {
                    remote.fetch.setPositionData(remLoc.attrs.fetch);
                }

                if (remLoc.attrs?.name != null) {
                    remote.name.setPositionData(remLoc.attrs.name);
                }

                // add to the remotes array
                remotes.push(remote);
            }

            // get all the includes
            const rawIncludes =
                xmlDOM.window.document.getElementsByTagName("include");
            const includes: Include[] = [];

            for (const include of rawIncludes) {
                const name = include.getAttribute("name");

                const inc = new Include();
                inc.name.value = name!;

                // position
                const incLoc =
                    xmlDOM.nodeLocation(
                        include
                    ) as Token.LocationWithAttributes;
                inc.setPositionData(incLoc);

                if (incLoc.attrs?.name != null) {
                    inc.name.setPositionData(incLoc.attrs.name);
                }

                // add to the includes array
                includes.push(inc);
            }

            // get all projects
            const rawProjects =
                xmlDOM.window.document.getElementsByTagName("project");
            const projects: Project[] = [];

            for (const project of rawProjects) {
                const name = project.getAttribute("name");
                const path = project.getAttribute("path");
                const remote = project.getAttribute("remote");
                const revision = project.getAttribute("revision");

                const proj = new Project(name!, path!, remote!, revision!);

                // position
                const projLoc =
                    xmlDOM.nodeLocation(
                        project
                    ) as Token.LocationWithAttributes;
                proj.setPositionData(projLoc);

                if (projLoc.attrs?.name != null) {
                    proj.name.setPositionData(projLoc.attrs.name);
                }

                if (projLoc.attrs?.path != null) {
                    proj.path.setPositionData(projLoc.attrs.path);
                }

                if (projLoc.attrs?.remote != null) {
                    proj.remote.setPositionData(projLoc.attrs.remote);
                }

                if (projLoc.attrs?.revision != null) {
                    proj.revision.setPositionData(projLoc.attrs.revision);
                }

                // add to the projects array
                projects.push(proj);
            }

            // the OBJECT
            return new ManifestXML(
                xmlDOM,
                includes,
                remotes,
                projects
            );
        }

        return undefined;
    };

    private async _parseWorkSpace (): Promise<void> {
        this._parsedManifests = [];

        ExtensionUtils.showStatusBarLoading("Parsing Manifests...");

        // first of all parse the workspace
        const xmlFiles = await vscode.workspace.findFiles('**/*.xml');
        for (const xmlFile of xmlFiles) {
            this._parsedManifests.push(await ManifestXML.Parse(
                await vscode.workspace.openTextDocument(xmlFile)
            ) as unknown as IAttr);
        }

        ExtensionUtils.hideStatusBarLoading();
        ExtensionUtils.showStatusBarOk("Manifests OK");
    }

    get workSpaceManifests (): IAttr[] {
        return this._parsedManifests;
    }

    constructor (
        mainDOM?: jsdom.JSDOM,
        includes?: Include[],
        remotes?: Remote[],
        projects?: Project[]
    ) {
        this._mainFile = mainDOM ?? new jsdom.JSDOM('');
        this._includes = includes ?? [];
        this._remotes = remotes ?? [];
        this._projects = projects ?? [];

        void this._parseWorkSpace();
    }
}
