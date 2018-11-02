import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShellNavigatorService {

  createdShell = new Array<string>();

  // Observable string sources
  private shellSelectedSource = new Subject<string>();

  // Observable string streams
  shellSelected$ = this.shellSelectedSource.asObservable();

  // Observable string sources
  private shellCreatedSource = new Subject<string>();

  // Observable string streams
  shellCreated$ = this.shellCreatedSource.asObservable();

  constructor() {
    this.createdShell.push('');
  }

  // Service string commands
  private shellCreated(shellCreated: string) {
    this.shellCreatedSource.next(shellCreated);
  }

  // Service string commands
  private shellSelected(shellSelected: string) {
    this.shellSelectedSource.next(shellSelected);
  }

  shellNavigate(studyUid: string) {
    if (this.createdShell.indexOf(studyUid) === -1) {
      this.shellCreated(studyUid);
      this.createdShell.push(studyUid);
    } else {
      this.shellSelected(studyUid);
    }

  }
}
