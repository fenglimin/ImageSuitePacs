export class LayoutPosition {
  rowIndex: number;
  colIndex: number;

  getId(): string {
    return '' + this.rowIndex + this.colIndex;
  }

  constructor(rowIndex: number, colIndex: number) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
  }
}

export class LayoutMatrix {
  rowCount: number;
  colCount: number;

  constructor(rowCount: number, colCount: number) {
    this.rowCount = rowCount;
    this.colCount = colCount;
  }

  fromNumber(matrixNumber: number) {
    this.rowCount = Math.trunc(matrixNumber / 10);
    this.colCount = matrixNumber % 10;
  }
}

export class Layout {
  position: LayoutPosition;
  matrix: LayoutMatrix;

  getId(): string {
    return '' + this.position.getId();
  }

  constructor(position: LayoutPosition, matrix: LayoutMatrix) {
    this.position = position;
    this.matrix = matrix;
  }
}

export class ImageLayout {
  groupLayout: Layout;
  imageLayout: Layout;

  constructor(groupLayout: Layout, imageLayout: Layout) {
    this.groupLayout = groupLayout;
    this.imageLayout = imageLayout;
  }

  getId(): string {
    return this.groupLayout.getId() + this.imageLayout.getId();
  }
}