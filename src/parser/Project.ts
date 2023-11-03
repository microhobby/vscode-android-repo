import { Attr } from "./IAttr";

export class Project extends Attr {
    name: Attr = new Attr();
    path: Attr = new Attr();
    remote: Attr = new Attr();
    revision: Attr = new Attr();

    constructor (name: string, path: string, remote: string, revision: string) {
        super();

        this.name.value = name;
        this.path.value = path;
        this.remote.value = remote;
        this.revision.value = revision;
    }
}
