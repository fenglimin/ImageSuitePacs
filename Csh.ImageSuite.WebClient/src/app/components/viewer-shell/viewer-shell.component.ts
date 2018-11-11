import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { GroupViewerComponent } from './group-viewer/group-viewer.component';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { HangingProtocalService } from '../../services/hanging-protocal.service';
import { Subscription }   from 'rxjs';
import { LayoutPosition, LayoutMatrix, Layout, GroupLayout } from '../../models/layout';
import { ViewerShellData } from '../../models/viewer-shell-data';
import { GroupHangingProtocal } from '../../models/hanging-protocal';

@Component({
  selector: 'app-viewer-shell',
  templateUrl: './viewer-shell.component.html',
  styleUrls: ['./viewer-shell.component.css']
})
export class ViewerShellComponent implements OnInit, AfterViewInit {
  Arr = Array; //Array type captured in a variable
  groupMatrix = new LayoutMatrix(1, 1);
  groupHangingProtocal = GroupHangingProtocal.ByPatent;
  hideMe = false;
  viewerShellData: ViewerShellData;

  @ViewChildren(GroupViewerComponent) viewers: QueryList<GroupViewerComponent>;

  subscriptionShellNavigated: Subscription;

  constructor(private shellNavigatorService: ShellNavigatorService, private hangingProtocalService: HangingProtocalService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      viewerShellData => {
        this.hideMe = ( viewerShellData === null || viewerShellData.getId() !== this.viewerShellData.getId() );
      });
  }

  ngOnInit() {
    this.onLayoutChanged(this.groupHangingProtocal);
  }

  ngAfterViewInit() {
  }

  onLayoutChanged(groupHangingProtocalNumber: number): void {

    if (groupHangingProtocalNumber === GroupHangingProtocal.ByPatent ||
      groupHangingProtocalNumber === GroupHangingProtocal.ByStudy ||
      groupHangingProtocalNumber === GroupHangingProtocal.BySeries) {
      this.groupHangingProtocal = groupHangingProtocalNumber;
    }

    this.groupMatrix = this.hangingProtocalService.getGroupLayoutMatrix(this.viewerShellData, groupHangingProtocalNumber);
  }

  createGroupLayout(rowIndex: number, colIndex: number): GroupLayout {
    let layout = new Layout(new LayoutPosition(rowIndex, colIndex), this.groupMatrix);
    return new GroupLayout(layout, this.groupHangingProtocal);
  }
}
