import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { GroupViewerComponent } from '../group-viewer/group-viewer.component';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { Study } from '../../models/pssi';

@Component({
  selector: 'app-viewer-shell',
  templateUrl: './viewer-shell.component.html',
  styleUrls: ['./viewer-shell.component.css']
})
export class ViewerShellComponent implements OnInit, AfterViewInit {
  Arr = Array; //Array type captured in a variable
  totalRow = 1;
  totalCol = 1;
  hideMe = false;
  study: Study;

  @ViewChildren(GroupViewerComponent) viewers: QueryList<GroupViewerComponent>;

  subscriptionShellNavigated: Subscription;

  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      study => {
        this.hideMe = ( study === null || study.studyInstanceUid !== this.study.studyInstanceUid );
      });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {

  }

  onLayoutChanged(newLayout:number): void {
    this.totalRow = Math.trunc(newLayout / 10);
    this.totalCol = newLayout % 10;
  }
}
