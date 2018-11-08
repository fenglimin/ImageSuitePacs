import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { GroupViewerComponent } from '../group-viewer/group-viewer.component';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { LayoutPosition, LayoutMatrix, Layout } from '../../models/layout';
import { OpenedViewerShell } from '../../models/openedViewerShell';

@Component({
  selector: 'app-viewer-shell',
  templateUrl: './viewer-shell.component.html',
  styleUrls: ['./viewer-shell.component.css']
})
export class ViewerShellComponent implements OnInit, AfterViewInit {
  Arr = Array; //Array type captured in a variable
  groupMatrix = new LayoutMatrix(1,1);
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
    this.groupMatrix.fromNumber(newLayout);
  }

  createGroupLayout(rowIndex: number, colIndex: number): Layout {
    return new Layout(new LayoutPosition(rowIndex, colIndex), this.groupMatrix);
  }
}
