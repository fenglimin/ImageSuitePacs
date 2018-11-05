export class GroupLayout {
  rowIndex: number;
  colIndex: number;
  rowCountChild: number;
  colCountChild: number;

  constructor() {
    this.rowIndex = 0;
    this.colIndex = 0;
    this.rowCountChild = 1;
    this.colCountChild = 1;
  }
}

export class ImageLayout {
  rowIndex: number;
  colIndex: number;
  rowIndexParent: number;
  colIndexParent: number;

  constructor() {
    this.rowIndex = 0;
    this.colIndex = 0;
    this.rowIndexParent = 0;
    this.colIndexParent = 0;
  }
}