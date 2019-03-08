import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { GroupViewerComponent } from './group-viewer/group-viewer.component';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { HangingProtocalService } from '../../services/hanging-protocal.service';
import { Subscription }   from 'rxjs';
import { ViewerShellData } from '../../models/viewer-shell-data';
import { GroupHangingProtocal } from '../../models/hanging-protocal';

@Component({
  selector: 'app-viewer-shell',
  templateUrl: './viewer-shell.component.html',
  styleUrls: ['./viewer-shell.component.css']
})
export class ViewerShellComponent implements OnInit, AfterViewInit {
  Arr = Array; //Array type captured in a variable
 
  viewerShellData: ViewerShellData;
  subscriptionShellNavigated: Subscription;

  @ViewChildren(GroupViewerComponent) childGroups: QueryList<GroupViewerComponent>;

  constructor(private shellNavigatorService: ShellNavigatorService, private hangingProtocalService: HangingProtocalService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      viewerShellData => {
        this.viewerShellData.hide = ( viewerShellData === null || viewerShellData.getId() !== this.viewerShellData.getId() );
      });
  }

  ngOnInit() {
    this.onChangeGroupLayout(this.viewerShellData.defaultGroupHangingProtocal);
  }

  ngAfterViewInit() {
      let self = this;
      $(".sp_panel-left").spResizable({
          handleSelector: ".sp_splitter",
          resizeHeight: false
      });

      $(window).resize(function () {
          self.onResize();
      });

      this.onResize();
  }

  onChangeGroupLayout(groupHangingProtocalNumber: number): void {
      this.hangingProtocalService.applyGroupHangingProtocal(this.viewerShellData, groupHangingProtocalNumber);
      this.onResize();
  }

  onResize(): void {
      //if (this.viewerShellData.hide)
      //    return;

      if (!this.childGroups)
          return;

      this.childGroups.forEach((groupViewer) => {
          groupViewer.onResize();
      });
  }

}
