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

  equal(layoutPosition: LayoutPosition): boolean {
    return this.rowIndex === layoutPosition.rowIndex && this.colIndex === layoutPosition.colIndex;
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

  equal(layoutMatrix: LayoutMatrix): boolean {
    return this.rowCount === layoutMatrix.rowCount && this.colCount === layoutMatrix.colCount;
  }
}

