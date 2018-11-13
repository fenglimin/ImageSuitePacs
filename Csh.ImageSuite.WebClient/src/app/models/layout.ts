import { GroupHangingProtocal, ImageHangingProtocal } from './hanging-protocal';
import { Patient, Study, Series, Image } from '../models/pssi';

export enum LayoutContent {
  Patient,
  Study,
  Series,
  Image
}

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

  static fromNumber(positionNumber: number, colCount: number) : LayoutPosition {
    const layoutPosition = new LayoutPosition(0, 0);
    layoutPosition.rowIndex = Math.trunc(positionNumber / colCount);
    layoutPosition.colIndex = positionNumber % colCount;
    return layoutPosition;
  }
}

export class LayoutMatrix {
  rowCount: number;
  colCount: number;

  constructor(rowCount: number, colCount: number) {
    this.rowCount = rowCount;
    this.colCount = colCount;
  }

  static fromNumber(matrixNumber: number) : LayoutMatrix {
    const layoutMatrix = new LayoutMatrix(1, 1);
    layoutMatrix.rowCount = Math.trunc(matrixNumber / 10);
    layoutMatrix.colCount = matrixNumber % 10;
    return layoutMatrix;
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

  static fromNumber(positionNumber: number, colCount: number, matrixNumber: number): Layout {
    const layout = new Layout(LayoutPosition.fromNumber(positionNumber, colCount), LayoutMatrix.fromNumber(matrixNumber));
      return layout;
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
  private image: Image;

  constructor(groupLayout: GroupLayout, layout: Layout, haningProtocal: ImageHangingProtocal) {
    this.groupLayout = groupLayout;
    this.layout = layout;
    this.haningProtocal = haningProtocal;
    this.image = null;
  }

  getId(): string {
    return this.groupLayout.getId() + this.layout.getId();
  }

  setImage(image: Image) {
    this.image = image;
  }

  getImage(): Image {
    return this.image;
  }

  static createDefaultFromGroupLayout(groupLayout: GroupLayout) : ImageLayout {
    const imageLayout = new ImageLayout(groupLayout, Layout.fromNumber(0, 1, 11), ImageHangingProtocal.Auto);
    return imageLayout;
  }

}