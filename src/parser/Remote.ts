export class Remote {
    private readonly _alias: string = "";
    private readonly _fetch: string = "";
    private readonly _name: string = "";

    get alias (): string {
        return this._alias;
    }

    get fetch (): string {
        return this._fetch;
    }

    get name (): string {
        return this._name;
    }

    constructor (alias: string, fetch: string, name: string) {
        this._alias = alias;
        this._fetch = fetch;
        this._name = name;
    }
}
