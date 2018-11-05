import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';
import { Study } from '../models/pssi';

@Injectable({
  providedIn: 'root'
})
export class ShellNavigatorService {

  createdShell = new Array<Study>();

  // Observable string sources
  private shellSelectedSource = new Subject<Study>();

  // Observable string streams
  shellSelected$ = this.shellSelectedSource.asObservable();

  // Observable string sources
  private shellCreatedSource = new Subject<Study>();

  // Observable string streams
  shellCreated$ = this.shellCreatedSource.asObservable();

  // Observable string sources
  private shellDeletedSource = new Subject<Study>();

  // Observable string streams
  shellDeleted$ = this.shellDeletedSource.asObservable();

  constructor() {
  }

  // Service string commands
  private shellCreated(study: Study) {
    this.shellCreatedSource.next(study);
  }

  // Service string commands
  private shellSelected(study: Study) {
    this.shellSelectedSource.next(study);
  }

  shellNavigate(study: Study) {
    if (!this.isStudyOpened(study)) {
      this.createdShell.push(study);
      this.shellCreated(study);
    } else {
      this.shellSelected(study);
    }
  }

  shellDelete(study: Study): Study {
    if (this.isStudyOpened(study)) {
      let index = this.createdShell.indexOf(study);
      this.createdShell = this.createdShell.filter((value, index, array) => value.studyInstanceUid !== study.studyInstanceUid);
      if (index >= this.createdShell.length) {
        index--;
      }

      let nextSelectedStudy: Study;
      if (index >= 0) {
        nextSelectedStudy = this.createdShell[index];
      } else {
        nextSelectedStudy = null;
      }

      this.shellNavigate(nextSelectedStudy);
      this.shellDeletedSource.next(study);

      return nextSelectedStudy;
    }
  }

  private isStudyOpened(study: Study): boolean {
    if (study === null)
      return true;

    return this.createdShell.some((value, index, array) => value.studyInstanceUid === study.studyInstanceUid);
  }
}
