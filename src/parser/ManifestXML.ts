import type * as vscode from 'vscode';
import * as jsdom from 'jsdom';
import { Include } from './Include';
import { Remote } from './Remote';
import { Project } from './Project';

export class ManifestXML {
    private readonly _mainFile: jsdom.JSDOM;
    private readonly _includes: Include[] = [];
    private readonly _remotes: Remote[] = [];
    private readonly _projects: Project[] = [];

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
                inc.name = name!;

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

    constructor (
        mainDOM: jsdom.JSDOM,
        includes: Include[],
        remotes: Remote[],
        projects: Project[]
    ) {
        this._mainFile = mainDOM;
        this._includes = includes;
        this._remotes = remotes;
        this._projects = projects;
    }
}
