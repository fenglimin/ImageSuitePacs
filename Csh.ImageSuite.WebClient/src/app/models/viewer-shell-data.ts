import { Patient, Study, Image } from '../models/pssi';

export class ViewerShellData {
  studies = new Array<Study>();

  getId() : string {
    let id = '';
    this.studies.forEach(value => id += '.' + value.id);
    return id;
  }

  getName(): string {
    if (this.studies.length === 0) {
      return '';
    }

    let name = '';
    this.studies.forEach(value => name += value.patient.patientId + '_' + value.patient.patientName + ' | ');
    return name.substr(0, name.length - 3);
  }

  getTotalSeriesCount(): number {
    let count = 0;
    this.studies.forEach(value => count += value.seriesCount);
    return count;
  }

  getTotalStudyCount(): number {
    return this.studies.length;
  }

  getTotalPatientCount(): number {
    return this.getAllPatients().length;
  }

  private getAllPatients(): Array<Patient> {
    let patients = Array<Patient>();

    this.studies.forEach(value => {
      if (patients.indexOf(value.patient) == -1) {
        patients.push(value.patient);
      }
    });

    return patients;
  }

  getPatientImages(patientIndex: number): Array<Image> {
    let images = new Array<Image>();
    let patients = this.getAllPatients();

    if (patientIndex >= 0 && patientIndex < patients.length) {
      this.studies.forEach(study => {
        if (patients.indexOf(study.patient) != -1) {
          study.seriesList.forEach(series => {
            images.concat(series.imageList);
          });
        }
      });
    }

    return images;
  }

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
}