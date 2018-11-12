import { Patient, Study, Series, Image } from '../models/pssi';

export class ViewerShellData {
  patientList = new Array<Patient>();

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // Public functions
  addStudy(study: Study) {
    let index = -1;
    for (let i = 0; i < this.patientList.length; i++) {
      if (this.patientList[i].id === study.patient.id) {
        index = i;
        break;
      }
    }
    
    let patient = null;
    if (index === -1) {
      // Clone a patient and added to the list
      patient = study.patient.clone()
      this.patientList.push(patient);
    } else {
      patient = this.patientList[index];
    }

    patient.studyList.push(study);
  }
  
  getId() : string {
    let id = '';
    this.patientList.forEach(patient => id += '.' + this.getIdFromPatient(patient));
    return id;
  }

  getName(): string {
    let name = '';
    this.patientList.forEach(patient => name += patient.patientId + '_' + patient.patientName + ' | ');
    return name.substr(0, name.length - 3);
  }


  getImages(patientIndex: number, studyIndex: number, seriesIndex: number): Array<Image> {
    
    if (patientIndex >= this.patientList.length) return null;

    let totalStudyCount = this.getTotalStudyCount();
    if (studyIndex >= totalStudyCount) return null;

    let totalSeriesCount = this.getTotalSeriesCount();
    if (seriesIndex >= totalSeriesCount) return null;

    return this.patientList[patientIndex].studyList[studyIndex].seriesList[seriesIndex].imageList;
  }

  getAllImageOfPatientByIndex(patientIndex: number): Array<Image> {
    if (patientIndex >= this.patientList.length) return null;

    let images = new Array<Image>();
    let patient = this.patientList[patientIndex];

    patient.studyList.forEach(study => {
      study.seriesList.forEach(series => images = images.concat(series.imageList));
    });

    return images;
  }

  getAllImageOfPatientStudyByIndex(patientIndex: number, studyIndex: number): Array<Image> {
    if (patientIndex >= this.patientList.length) return null;
    let patient = this.patientList[patientIndex];
    if (studyIndex >= patient.studyList.length) return null;

    let images = new Array<Image>();
    patient.studyList[studyIndex].seriesList.forEach(series => images = images.concat(series.imageList));
    return images;
  }

  getAllImageOfPatientStudySeriesByIndex(patientIndex: number, studyIndex: number, seriesIndex: number): Array<Image> {
    if (patientIndex >= this.patientList.length) return null;
    let patient = this.patientList[patientIndex];
    if (studyIndex >= patient.studyList.length) return null;
    let study = patient.studyList[studyIndex];
    if (seriesIndex >= study.seriesList.length) return null;

    return study.seriesList[0].imageList;
  }

  getAllImageOfStudy(study: Study): Array<Image> {
    let images = new Array<Image>();
    study.seriesList.forEach(series => images = images.concat(series.imageList));
    return images;
  }

  getTotalSeriesCount(): number {
    let count = 0;
    this.patientList.forEach(patient => count += this.getPatientSeriesCountByObj(patient));
    return count;
  }

  getTotalStudyCount(): number {
    let count = 0;
    this.patientList.forEach(patient => count += patient.studyList.length);
    return count;
  }

  getTotalPatientCount(): number {
    return this.patientList.length;
  }

  getPatientStudyCountByIndex(patientIndex: number): number {
    if (patientIndex >= this.patientList.length) return 0;
    return this.patientList[patientIndex].studyList.length;
  }

  getPatientSeriesCountByIndex(patientIndex: number): number {
    if (patientIndex >= this.patientList.length) return 0;
    
    let count = 0;
    this.patientList[patientIndex].studyList.forEach(study => count += study.seriesList.length);
    return count;
  }

  getPatientSeriesCountByObj(patient: Patient): number {
    let count = 0;
    patient.studyList.forEach(study => count += study.seriesList.length);
    return count;
  }

  getStudyByIndex(studyIndex: number): Study {
    const studyList = this.getAllStudyList();
    if (studyIndex >= studyList.length) {
      //alert('Error get study by index : ' + studyIndex + ', total study count is ' + studyList.length);
      return null;
    }

    return studyList[studyIndex];
  }

  getSeriesByIndex(seriesIndex: number): Series {
    const seriesList = this.getAllSeriesList();
    if (seriesIndex >= seriesList.length) {
      //alert('Error get series by index : ' + seriesIndex + ', total series count is ' + seriesList.length);
      return null;
    }

    return seriesList[seriesIndex];
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Private functions
  private getIdFromPatient(patient: Patient): string {
    let id = '';
    patient.studyList.forEach(value => id += '.' + value.id);
    return id;
  }

  private getAllStudyList(): Array<Study> {
    let studies = new Array<Study>();
    this.patientList.forEach(patient => studies = studies.concat(patient.studyList));
    return studies;
  }

  private getAllSeriesList(): Array<Series> {
    let studyList = this.getAllStudyList();

    let series = new Array<Series>();
    studyList.forEach(study => series = series.concat(study.seriesList));
    return series;
  }
}