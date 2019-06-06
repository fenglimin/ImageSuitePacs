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
    studyDateFrom: Date;
    studyDateTo: Date;
    patientBirthDateFrom: Date;
    patientBirthDateTo: Date;
    studyId: string;
    accessionNo: string;
    instanceAvailability: string;
    bodyPartExamined: string;
    scanStatus: string;
    studyDescription: string;
    reserved: string;
    readed: string;
    printed: string;

    constructor() {
        this.id = -1;
        this.name = "";
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
        this.patientId = "";
        this.patientName = "";
        this.gender = "";
        this.modality = "";
        this.studyDate = "";
        this.patientBirthDateFrom = null;
        this.patientBirthDateTo = null;
        this.studyDateFrom = null;
        this.studyDateTo = null;
        this.studyId = "";
        this.accessionNo = "";
        this.instanceAvailability = "";
        this.bodyPartExamined = "";
        this.studyDescription = "";
        this.reserved = "";
        this.readed = "";
        this.printed = "";
    }

    copyConditionFrom(shortcut: Shortcut) {
        this.patientId = shortcut.patientId;
        this.patientName = shortcut.patientName;
        this.gender = shortcut.gender;
        this.modality = shortcut.modality;
        this.studyDate = shortcut.studyDate;
        this.patientBirthDateFrom = shortcut.patientBirthDateFrom;
        this.patientBirthDateTo = shortcut.patientBirthDateTo;
        this.studyDateFrom = shortcut.studyDateFrom;
        this.studyDateTo = shortcut.studyDateTo;
        this.studyId = shortcut.studyId;
        this.accessionNo = shortcut.accessionNo;
        this.instanceAvailability = shortcut.instanceAvailability;
        this.bodyPartExamined = shortcut.bodyPartExamined;
        this.studyDescription = shortcut.studyDescription;
        this.reserved = shortcut.reserved;
        this.readed = shortcut.readed;
        this.printed = shortcut.printed;
    }

    clone(theObj) {
        const obj = {};
        for (let key in theObj) {
            obj[key] = theObj[key];
        }
        return obj;
    }
}
