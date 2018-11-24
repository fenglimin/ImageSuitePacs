export enum DataSource {
  LocalTestData = 1,
  MiniPacs = 2,
  OtherPacs = 3
}

export class Shortcut {
  id: number;
  name: string;
  dataSource: DataSource;
 
  patientId: string;
  patientName: string;
  gender: string;
  modality: string;
  studyDate: string;
  birthDate: string;
  studyId: string;
  accessionNo: string;

  constructor() {
    this.id = -1;
    this.name = '';
    this.dataSource = DataSource.LocalTestData;

    this.clearCondition();
  }

  static createDefaultShortcut(name: string): Shortcut {
    const shortcut = new Shortcut();
    shortcut.id = 0;
    shortcut.name = name;
    shortcut.dataSource = DataSource.MiniPacs;
    shortcut.studyDate = name;

    return shortcut;
  }

  clearCondition() {
    this.patientId = '';
    this.patientName = '';
    this.gender = '';
    this.modality = '';
    this.studyDate = '';
    this.birthDate = '';
    this.studyId = '';
    this.accessionNo = '';
  }

  copyConditionFrom(shortcut: Shortcut) {
    this.patientId = shortcut.patientId;     
    this.patientName = shortcut.patientName;
    this.gender = shortcut.gender;
    this.modality = shortcut.modality;
    this.studyDate = shortcut.studyDate;
    this.birthDate = shortcut.birthDate;
    this.studyId = shortcut.studyId;
    this.accessionNo = shortcut.accessionNo;
  }
}