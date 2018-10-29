export class GroupLayout {
  rowIndex: number;
  colIndex: number;
  rowCountChild: number;
  colCountChild: number;
  width: number;
  height: number;

  constructor() {
    this.rowIndex = 0;
    this.colIndex = 0;
    this.rowCountChild = 1;
    this.colCountChild = 1;
    this.width = 100;
    this.height = 100;
  }
}

export class ImageLayout {
  rowIndex: number;
  colIndex: number;
  rowIndexParent: number;
  colIndexParent: number;
  width: number;
  height: number;

  constructor() {
    this.rowIndex = 0;
    this.colIndex = 0;
    this.rowIndexParent = 0;
    this.colIndexParent = 0;
    this.width = 100;
    this.height = 100;

  }
}