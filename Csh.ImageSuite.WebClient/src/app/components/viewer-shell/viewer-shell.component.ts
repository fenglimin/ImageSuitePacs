import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { LayoutViewerComponent } from '../layout-viewer/layout-viewer.component';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';

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
  studyUid: string;

  @ViewChildren(LayoutViewerComponent) viewers: QueryList<LayoutViewerComponent>;

  subscriptionShellNavigated: Subscription;
  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      studyUid => {
        this.hideMe = studyUid !== this.studyUid;
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
