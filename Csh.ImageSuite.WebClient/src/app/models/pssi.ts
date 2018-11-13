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
}

export class Study {
  id: number;
  checked: boolean;
  detailsLoaded: boolean;

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