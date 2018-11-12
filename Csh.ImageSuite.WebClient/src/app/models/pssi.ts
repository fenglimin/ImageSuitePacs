export class Patient {
  id: number;

  patientId:string;
  patientName:string;
  firstName:string;
  middleName:string;
  lastName:string;
  birthDateString:string;
  gender: string;

  studyList: Array<Study>;

  clone(): Patient {

    // Clone basic information, withou study list.
    let patient = new Patient();

    patient.id = this.id;
    patient.patientId = this.patientId;
    patient.patientName = this.patientName;
    patient.firstName = this.firstName;
    patient.middleName = this.middleName;
    patient.lastName = this.lastName;
    patient.birthDateString = this.birthDateString;
    patient.gender = this.gender;

    patient.studyList = new Array<Study>();
    return patient;
  }
}

export class Study {
  id: number;
  checked: boolean;

  studyInstanceUid: string;
  studyId: string;
  studyDateString: string;
  studyTimeString:string;
  accessionNo: string;
  seriesCount: number;
  imageCount: number;
  modality: string;

  

  patient: Patient;
  seriesList: Array<Series>;
}


export class Series {
  id: number;
  
  seriesInstanceUid: string;
  modality: string;
  seriesDateString: string;
  seriesTimeString: string;
  bodyPart: string;
  viewPosition: string;
  seriesNumber: number;
  imageCount: number;

  study: Study;
  imageList: Array<Image>;
}

export class Image {
  id: number;
  
  series: Series;
  objectFile: string;
}