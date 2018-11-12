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

  fromNumber(positionNumber: number, colCount: number) {
    this.rowIndex = Math.trunc(positionNumber / colCount);
    this.colIndex = positionNumber % colCount;
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
}