import { Patient, Study, Series, Image } from '../models/pssi';

export class ViewerShellData {
  patientList = new Array<Patient>();

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  // Public functions
  addStudy(study: Study) {

    // Set parent for all series and all images, since they are NOT set in JSON string returned from server
    for (let i = 0; i < study.seriesList.length; i++) {
      const series = study.seriesList[i];
      series.study = study;
      for (let j = 0; j < series.imageList.length; j++) {
        series.imageList[j].series = series;
      }
    }


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
      patient = this.clonePatient(study.patient);
      this.patientList.push(patient);
    } else {
      patient = this.patientList[index];
    }

    patient.studyList.push(study);
  }
  
  getId() : string {
    let id = '';
    this.patientList.forEach(patient => id += this.getIdFromPatient(patient));
    return id;
  }

  getName(): string {
    let name = '';
    this.patientList.forEach(patient => name += patient.patientId + '_' + patient.patientName + ' | ');
    return name.substr(0, name.length - 3);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Get count
  getTotalPatientCount(): number {
    return this.patientList.length;
  }
    
  getTotalStudyCount(): number {
    let count = 0;
    this.patientList.forEach(patient => count += patient.studyList.length);
    return count;
  }
 
  getTotalSeriesCount(): number {
    let count = 0;
    this.patientList.forEach(patient => {
      patient.studyList.forEach(study => count += study.seriesList.length);
    });
    return count;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Get image
  getAllImageOfPatient(patient: Patient): Array<Image> {
    let images = new Array<Image>();
    patient.studyList.forEach(study => {
      study.seriesList.forEach(series => images = images.concat(series.imageList));
    });

    return images;
  }

  getAllImageOfStudy(study: Study): Array<Image> {
    let images = new Array<Image>();
    study.seriesList.forEach(series => images = images.concat(series.imageList));
    return images;
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Get object by index
  getPatientByIndex(patientIndex: number): Patient {
    if (patientIndex >= this.patientList.length) {
      return null;
    }

    return this.patientList[patientIndex];
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
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Private functions
  private getIdFromPatient(patient: Patient): string {
    let id = '';
    patient.studyList.forEach(value => id += '_' + value.id);
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

  private clonePatient(patient: Patient): Patient {
      // Clone basic information, withou study list.
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
    return clonedPatient;
  }
}