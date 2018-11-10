import { Patient, Study, Image } from '../models/pssi';

export class OpenedViewerShell {
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

  splitGroupByPatient(): Array<OpenedViewerShell> {
    let dataList = new Array<OpenedViewerShell>();

    for (let i = 0; i < this.studies.length; i++) {
      let patientIndex = -1;
      for (let j = 0; j < dataList.length; j++) {
        if (dataList[j].studies.some(study => study.patient === this.studies[i].patient)) {
          patientIndex = j;
          break;
        }
      }

      let openedViewerShell = null;
      if (patientIndex === -1) {
        openedViewerShell = new OpenedViewerShell();
        dataList.push(openedViewerShell);
      } else {
        openedViewerShell = dataList[patientIndex];
      }

      openedViewerShell.studies.push(this.studies[i]);
    }

    return dataList;
  }

  splitGroupByStudy(): Array<OpenedViewerShell> {
    let dataList = new Array<OpenedViewerShell>();

    for (let i = 0; i < this.studies.length; i++) {
      let openedViewerShell = new OpenedViewerShell();
      openedViewerShell.studies.push(this.studies[i]);
      dataList.push(openedViewerShell);
    }

    return dataList;
  }

  splitGroupBySeries(): Array<OpenedViewerShell> {
    let dataList = new Array<OpenedViewerShell>();

    for (let i = 0; i < this.studies.length; i++) {
      for (let j = 0; j < this.studies[i].seriesList.length; j++) {


        let openedViewerShell = new OpenedViewerShell();

        openedViewerShell.studies.push(this.studies[i]);
        dataList.push(openedViewerShell);
      }
    }

    return dataList;
  }
}