import { GroupHangingProtocal, ImageHangingProtocal } from './hanging-protocal';

export class LayoutPosition {
  rowIndex: number;
  colIndex: number;

  constructor(rowIndex: number, colIndex: number) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
  }

  getId(): string {
    return '' + this.rowIndex + this.colIndex;
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

  constructor(position: LayoutPosition, matrix: LayoutMatrix) {
    this.position = position;
    this.matrix = matrix;
  }

  getId(): string {
    return '' + this.position.getId();
  }
}

export class GroupLayout {
  layout: Layout;
  hangingProtocal: GroupHangingProtocal;

  constructor(layout: Layout, hangingProtocal: GroupHangingProtocal) {
    this.layout = layout;
    this.hangingProtocal = hangingProtocal;
  }

  getId(): string {
    return this.layout.getId();
  }
}

export class ImageLayout {
  groupLayout: GroupLayout;
  layout: Layout;
  haningProtocal: ImageHangingProtocal;

  constructor(groupLayout: GroupLayout, layout: Layout, haningProtocal: ImageHangingProtocal) {
    this.groupLayout = groupLayout;
    this.layout = layout;
    this.haningProtocal = haningProtocal;
  }

  getId(): string {
    return this.groupLayout.getId() + this.layout.getId();
  }
}