import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';
import { OpenedViewerShell } from '../models/opened-viewer-shell';

@Injectable({
  providedIn: 'root'
})
export class ShellNavigatorService {

  openedViewerShellList = new Array<OpenedViewerShell>();
  openedViewerShellHighlighted: OpenedViewerShell; // The shell current highlighted

  // Observable string sources
  private shellSelectedSource = new Subject<OpenedViewerShell>();

  // Observable string streams
  shellSelected$ = this.shellSelectedSource.asObservable();

  // Observable string sources
  private shellCreatedSource = new Subject<OpenedViewerShell>();

  // Observable string streams
  shellCreated$ = this.shellCreatedSource.asObservable();

  // Observable string sources
  private shellDeletedSource = new Subject<OpenedViewerShell>();

  // Observable string streams
  shellDeleted$ = this.shellDeletedSource.asObservable();

  constructor() {
  }

  // Service string commands
  private shellCreated(openedViewerShell: OpenedViewerShell) {
    this.shellCreatedSource.next(openedViewerShell);
  }

  // Service string commands
  private shellSelected(openedViewerShell: OpenedViewerShell) {
    this.shellSelectedSource.next(openedViewerShell);
  }

  shellNavigate(openedViewerShell: OpenedViewerShell) {
    if (!this.isViewerShellOpened(openedViewerShell)) {
      this.openedViewerShellList.push(openedViewerShell);
      this.shellCreated(openedViewerShell);
    } else {
      this.shellSelected(openedViewerShell);
    }

    this.openedViewerShellHighlighted = openedViewerShell;
  }

  shellDelete(openedViewerShell: OpenedViewerShell): OpenedViewerShell {
    if (this.isViewerShellOpened(openedViewerShell)) {
      let index = this.openedViewerShellList.indexOf(openedViewerShell);
      this.openedViewerShellList = this.openedViewerShellList.filter((value, index, array) => value.getId() !== openedViewerShell.getId());
      if (index >= this.openedViewerShellList.length) {
        index--;
      }

      if (this.openedViewerShellHighlighted === openedViewerShell) {
        if (index >= 0) {
          this.openedViewerShellHighlighted = this.openedViewerShellList[index];
        } else {
          this.openedViewerShellHighlighted = null;
        }
        this.shellNavigate(this.openedViewerShellHighlighted);
        this.shellDeletedSource.next(openedViewerShell);

      }
      return this.openedViewerShellHighlighted;
    }

    return null;
  }

  private isViewerShellOpened(openedViewerShell: OpenedViewerShell): boolean {
    if (openedViewerShell === null)
      return true;

    return this.openedViewerShellList.some((value, index, array) => value.getId() === openedViewerShell.getId());
  }
}
