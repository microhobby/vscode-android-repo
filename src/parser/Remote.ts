import { Attr } from "./IAttr";

export class Remote extends Attr {
    alias: Attr = new Attr();
    fetch: Attr = new Attr();
    name: Attr = new Attr();

    constructor (alias: string, fetch: string, name: string) {
        super();

        this.alias.value = alias;
        this.fetch.value = fetch;
        this.name.value = name;
    }
}
