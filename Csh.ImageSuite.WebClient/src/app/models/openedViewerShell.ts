import { Study } from '../models/pssi';

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
}