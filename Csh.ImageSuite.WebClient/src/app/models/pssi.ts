export class Patient {
  id: string;

  patientId:string;
  patientName:string;
  firstName:string;
  middleName:string;
  lastName:string;
  birthDateString:string;
  gender:string;
}

export class Study {
  id: string;

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
  id: string;
  
  seriesInstanceUid: string;
  modality: string;
  seriesDateString: string;
  seriesTimeString: string;
  bodyPart: string;
  viewPosition: string;
  seriesNumber: number;
  imageCount: number;

  study: Study;
  //images: Array<Image>;
}

export class Image {
  id: string;
  
  series: Series;
  objectFile: string;
}