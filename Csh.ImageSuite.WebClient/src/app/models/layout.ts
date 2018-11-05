export class Layout {
  rowIndex: number;
  colIndex: number;
  rowCount: number;
  colCount: number;  

  constructor() {
    this.rowIndex = 0;
    this.colIndex = 0;
    this.rowCount = 1;
    this.colCount = 1;
  }
}

export class GroupLayout {
  layout: Layout;
  rowCountChild: number;
  colCountChild: number;

  constructor() {
    this.layout = new Layout();
    this.rowCountChild = 1;
    this.colCountChild = 1;
  }
}

export class ImageLayout {
  groupLayout: GroupLayout;
  rowIndex: number;
  colIndex: number;

  constructor() {
    this.groupLayout = new GroupLayout();
    this.rowIndex = 0;
    this.colIndex = 0;
  }
}