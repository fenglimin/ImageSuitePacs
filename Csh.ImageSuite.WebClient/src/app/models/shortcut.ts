export enum DataSource {
  LocalTestData = 1,
  MiniPacs = 2,
  OtherPacs = 3
}

export class Shortcut {
  dataSource: DataSource;
  id: number;
  name: string;

  constructor() {
    this.dataSource = DataSource.LocalTestData;
  }
}