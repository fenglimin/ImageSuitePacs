export enum LayoutContent {
    Patient,
    Study,
    Series,
    Image
}

export class LayoutPosition {
    pageIndex: number;
    rowIndex: number;
    colIndex: number;

    constructor(pageIndex: number, rowIndex: number, colIndex: number) {
        this.pageIndex = pageIndex;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
    }

    getId(): string {
        return `${this.rowIndex}${this.colIndex}`;
    }

    static fromNumber(groupIndex: number, layoutMatrix: LayoutMatrix): LayoutPosition {
        const pageSize = layoutMatrix.rowCount * layoutMatrix.colCount;
        const pageIndex = Math.floor(groupIndex / pageSize);
        groupIndex = groupIndex % pageSize; 
        return new LayoutPosition(pageIndex, Math.floor(groupIndex / layoutMatrix.colCount), groupIndex % layoutMatrix.colCount);
    }

    equal(layoutPosition: LayoutPosition): boolean {
        return this.pageIndex === layoutPosition.rowIndex && this.rowIndex === layoutPosition.rowIndex && this.colIndex === layoutPosition.colIndex;
    }
}

export class LayoutMatrix {
    rowCount: number;
    colCount: number;

    constructor(rowCount: number, colCount: number) {
        this.rowCount = rowCount;
        this.colCount = colCount;
    }

    static fromNumber(matrixNumber: number): LayoutMatrix {
        const layoutMatrix = new LayoutMatrix(1, 1);
        layoutMatrix.rowCount = Math.trunc(matrixNumber / 10);
        layoutMatrix.colCount = matrixNumber % 10;
        return layoutMatrix;
    }

    equal(layoutMatrix: LayoutMatrix): boolean {
        return this.rowCount === layoutMatrix.rowCount && this.colCount === layoutMatrix.colCount;
    }

    toNumber(): number {
        return this.rowCount * 10 + this.colCount;
    }
}
