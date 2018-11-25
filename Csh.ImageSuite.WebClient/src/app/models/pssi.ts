export abstract class Pssi {
  id: number;
  hide: boolean;

  abstract setHide(hide: boolean): void;
}

export class Patient extends Pssi {

  patientId:string;
  patientName:string;
  firstName:string;
  middleName:string;
  lastName:string;
  birthDateString:string;
  gender: string;

  studyList: Array<Study>;

  setHide(hide: boolean) {
    this.hide = hide;
    this.studyList.forEach(study => study.setHide(hide));
  }
}

export class Study extends Pssi {

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

  setHide(hide: boolean) {
    this.hide = hide;
    this.seriesList.forEach(series => series.setHide(hide));
  }
}


export class Series extends Pssi{
  
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

  setHide(hide: boolean) {
    this.hide = hide;
    this.imageList.forEach(image => image.setHide(hide));
  }
}

export class Image extends Pssi {
  
  series: Series;
  objectFile: string;

  setHide(hide: boolean) {
    this.hide = hide;
  }
}