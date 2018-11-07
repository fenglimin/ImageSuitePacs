import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { GroupViewerComponent } from '../group-viewer/group-viewer.component';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { Layout, GroupLayout } from '../../models/layout';
import { OpenedViewerShell } from '../../models/openedViewerShell';

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
  openedViewerShell: OpenedViewerShell;

  @ViewChildren(GroupViewerComponent) viewers: QueryList<GroupViewerComponent>;

  subscriptionShellNavigated: Subscription;

  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      openedViewerShell => {
        this.hideMe = ( openedViewerShell === null || openedViewerShell.getId() !== this.openedViewerShell.getId() );
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
