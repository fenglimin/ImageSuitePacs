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
      study.seriesList.forEach(series => images.concat(series.imageList));
    });

    return images;
  }

  getAllImageOfPatientStudyByIndex(patientIndex: number, studyIndex: number): Array<Image> {
    if (patientIndex >= this.patientList.length) return null;
    let patient = this.patientList[patientIndex];
    if (studyIndex >= patient.studyList.length) return null;

    let images = new Array<Image>();
    patient.studyList[studyIndex].seriesList.forEach(series => images.concat(series.imageList));
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
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Private functions
  private getIdFromPatient(patient: Patient): string {
    let id = '';
    patient.studyList.forEach(value => id += '.' + value.id);
    return id;
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



  getAllStudyList(): Array<Study> {
    let studies = new Array<Study>();
    this.patientList.forEach(patient => studies.concat(patient.studyList));
    return studies;
  }

  getAllImageOfStudy(studyIndex: number): Array<Image> {
    if (studyIndex >= this.getTotalStudyCount()) return null;
    let study = this.getAllStudyList()[studyIndex];

    let images = new Array<Image>();
    study.seriesList.forEach(series => images.concat(series.imageList));
    return images;
  }


  /*
  splitGroupByPatient(): Array<ViewerShellData> {
    let dataList = new Array<ViewerShellData>();

    for (let i = 0; i < this.studies.length; i++) {
      let patientIndex = -1;
      for (let j = 0; j < dataList.length; j++) {
        if (dataList[j].studies.some(study => study.patient === this.studies[i].patient)) {
          patientIndex = j;
          break;
        }
      }

      let viewerShellData = null;
      if (patientIndex === -1) {
        viewerShellData = new ViewerShellData();
        dataList.push(viewerShellData);
      } else {
        viewerShellData = dataList[patientIndex];
      }

      viewerShellData.studies.push(this.studies[i]);
    }

    return dataList;
  }

  splitGroupByStudy(): Array<ViewerShellData> {
    let dataList = new Array<ViewerShellData>();

    for (let i = 0; i < this.studies.length; i++) {
      let viewerShellData = new ViewerShellData();
      viewerShellData.studies.push(this.studies[i]);
      dataList.push(viewerShellData);
    }

    return dataList;
  }

  splitGroupBySeries(): Array<ViewerShellData> {
    let dataList = new Array<ViewerShellData>();

    for (let i = 0; i < this.studies.length; i++) {
      for (let j = 0; j < this.studies[i].seriesList.length; j++) {


        let viewerShellData = new ViewerShellData();

        viewerShellData.studies.push(this.studies[i]);
        dataList.push(viewerShellData);
      }
    }

    return dataList;
  }
  */
}