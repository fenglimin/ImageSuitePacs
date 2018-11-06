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
  patient: Patient;

  studyInstanceUid: string;
  studyId: string;
  studyDateString: string;
  studyTimeString:string;
  accessionNo: string;
  seriesCount: number;
  imageCount: number;
  modality: string;

  seriesList: Array<Series>;
}


export class Series {
  study: Study;
  
  seriesInstanceUid: string;
  modality: string;
  seriesDateString: string;
  seriesTimeString: string;
  bodyPart: string;
  viewPosition: string;
  seriesNumber: number;
  imageCount: number;

  //images: Array<Image>;
}

export class Image {
    series: Series;

    objectFile: string;
}