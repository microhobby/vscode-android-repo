export class Project {
    private readonly _name: string;
    private readonly _path: string;
    private readonly _remote: string;
    private readonly _revision: string;

    get name (): string {
        return this._name;
    }

    get path (): string {
        return this._path;
    }

    get remote (): string {
        return this._remote;
    }

    get revision (): string {
        return this._revision;
    }

    constructor (name: string, path: string, remote: string, revision: string) {
        this._name = name;
        this._path = path;
        this._remote = remote;
        this._revision = revision;
    }
}
