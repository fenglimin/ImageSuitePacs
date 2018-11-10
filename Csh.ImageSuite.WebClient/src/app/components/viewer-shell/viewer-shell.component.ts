import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { GroupViewerComponent } from '../group-viewer/group-viewer.component';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { HangingProtocalService } from '../../services/hanging-protocal.service';
import { Subscription }   from 'rxjs';
import { LayoutPosition, LayoutMatrix, Layout, GroupLayout } from '../../models/layout';
import { OpenedViewerShell } from '../../models/opened-viewer-shell';
import { GroupHangingProtocal } from '../../models/hanging-protocal';

@Component({
  selector: 'app-viewer-shell',
  templateUrl: './viewer-shell.component.html',
  styleUrls: ['./viewer-shell.component.css']
})
export class ViewerShellComponent implements OnInit, AfterViewInit {
  Arr = Array; //Array type captured in a variable
  groupMatrix = new LayoutMatrix(1, 1);
  groupHangingProtocal = GroupHangingProtocal.BySeries;
  hideMe = false;
  openedViewerShell: OpenedViewerShell;

  @ViewChildren(GroupViewerComponent) viewers: QueryList<GroupViewerComponent>;

  subscriptionShellNavigated: Subscription;

  constructor(private shellNavigatorService: ShellNavigatorService, private hangingProtocalService: HangingProtocalService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      openedViewerShell => {
        this.hideMe = ( openedViewerShell === null || openedViewerShell.getId() !== this.openedViewerShell.getId() );
      });
  }

  ngOnInit() {
    this.onLayoutChanged(GroupHangingProtocal.BySeries);
  }

  ngAfterViewInit() {
  }

  onLayoutChanged(groupHangingProtocalNumber: number): void {
    let groupHangingProtocal: GroupHangingProtocal = groupHangingProtocalNumber;
    this.groupMatrix = this.hangingProtocalService.getGroupLayoutMatrix(this.openedViewerShell, groupHangingProtocal);
  }

  createGroupLayout(rowIndex: number, colIndex: number): GroupLayout {
    let layout = new Layout(new LayoutPosition(rowIndex, colIndex), this.groupMatrix);
    return new GroupLayout(layout, this.groupHangingProtocal);
  }
}
