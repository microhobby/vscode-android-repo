// import type * as vscode from 'vscode';

export interface IAttr {
    startLine: number;
    startCol: number;
    startOffset: number;
    endLine: number;
    endCol: number;
    setPositionData?: (
        obj: IAttr
    ) => void;
    value?: string;
}

export class Attr implements IAttr {
    startLine: number;
    startCol: number;
    startOffset: number;
    endLine: number;
    endCol: number;
    value?: string;

    constructor (eC = 0, eL = 0,
        sC = 0, sL = 0,
        sO = 0, val = ""
    ) {
        this.endCol = eC;
        this.endLine = eL;
        this.startCol = sC;
        this.startLine = sL;
        this.startOffset = sO;
        this.value = val;
    }

    setPositionData (
        obj: IAttr
    ): void {
        this.endCol = obj.endCol;
        this.endLine = obj.endLine;
        this.startCol = obj.startCol;
        this.startLine = obj.startLine;
        this.startOffset = obj.startOffset;
    }
}
