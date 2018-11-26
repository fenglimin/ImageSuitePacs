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

  static clone(patient: Patient, cloneChild: boolean): Patient {
    const clonedPatient = new Patient();

    clonedPatient.id = patient.id;
    clonedPatient.patientId = patient.patientId;
    clonedPatient.patientName = patient.patientName;
    clonedPatient.firstName = patient.firstName;
    clonedPatient.middleName = patient.middleName;
    clonedPatient.lastName = patient.lastName;
    clonedPatient.birthDateString = patient.birthDateString;
    clonedPatient.gender = patient.gender;

    clonedPatient.studyList = new Array<Study>();
    if (cloneChild) {
      patient.studyList.forEach(study => {
        const clonedStudy = Study.clone(study, cloneChild);
        clonedStudy.patient = clonedPatient;
        clonedPatient.studyList.push(clonedStudy);
      });
    }

    return clonedPatient;
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
  studyDesc: string; 

  patient: Patient;
  seriesList: Array<Series>;

  setHide(hide: boolean) {
    this.hide = hide;
    this.seriesList.forEach(series => series.setHide(hide));
  }

  static clone(study: Study, cloneChild: boolean): Study {
    const clonedStudy = new Study();

    clonedStudy.checked = study.checked;
    clonedStudy.detailsLoaded = study.detailsLoaded;

    clonedStudy.id = study.id;
    clonedStudy.studyId = study.studyId;
    clonedStudy.studyInstanceUid = study.studyInstanceUid;
    clonedStudy.studyDateString = study.studyDateString;
    clonedStudy.studyTimeString = study.studyTimeString;
    clonedStudy.accessionNo = study.accessionNo;
    clonedStudy.seriesCount = study.seriesCount;
    clonedStudy.imageCount = study.imageCount;
    clonedStudy.modality = study.modality;
    clonedStudy.studyDesc = study.studyDesc;

    clonedStudy.seriesList = new Array<Series>();
    if (cloneChild) {
      study.seriesList.forEach(series => {
        const clonedSeries = Series.clone(series, cloneChild);
        clonedSeries.study = clonedStudy;
        clonedStudy.seriesList.push(clonedSeries);
      });
    }

    return clonedStudy;
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

  static clone(series: Series, cloneChild: boolean): Series {
    const clonedSeries = new Series();

    clonedSeries.id = series.id;
    clonedSeries.seriesInstanceUid = series.seriesInstanceUid;
    clonedSeries.modality = series.modality;
    clonedSeries.seriesDateString = series.seriesDateString;
    clonedSeries.seriesTimeString = series.seriesTimeString;
    clonedSeries.bodyPart = series.bodyPart;
    clonedSeries.viewPosition = series.viewPosition;
    clonedSeries.seriesNumber = series.seriesNumber;
    clonedSeries.imageCount = series.imageCount;

    clonedSeries.imageList = new Array<Image>();
    if (cloneChild) {
      series.imageList.forEach(image => {
        const clonedImage = Image.clone(image, cloneChild);
        clonedImage.series = clonedSeries;
        clonedSeries.imageList.push(clonedImage);
      });
    }

    return clonedSeries;
  }
}

export class Image extends Pssi {
  
  series: Series;
  objectFile: string;

  setHide(hide: boolean) {
    this.hide = hide;
  }

  static clone(image: Image, cloneChild: boolean): Image {
    const clonedImage = new Image();

    clonedImage.id = image.id;
    clonedImage.objectFile = image.objectFile;

    return clonedImage;
  }
}