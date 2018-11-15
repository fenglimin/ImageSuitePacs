import { Component, OnInit, SimpleChanges, AfterContentInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { ViewerShellData } from '../../models/viewer-shell-data';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css']
})
export class HeaderBarComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked {

  subscriptionShellNavigated: Subscription;
  // Do NOT need to subscribe on shellCreated message, since when a new ViewerShell is created, 
  // shellNavigatorService.viewerShellDataList will updated, and this will update the UI of 
  // header-bar page
  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      viewerShellData => { this.highlightStudyButton(viewerShellData);});
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    
  }
 
  ngAfterViewInit() {
    
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngAfterViewChecked(): void {
    this.highlightStudyButton(this.shellNavigatorService.viewerShellDataHighlighted);
  }

  getViewerShellDataList() {
    return this.shellNavigatorService.viewerShellDataList;
  }

  showViewerShell(viewerShellData: ViewerShellData) {
    this.shellNavigatorService.shellNavigate(viewerShellData);
  }

  closeViewerShell(viewerShellData: ViewerShellData) {
    this.shellNavigatorService.shellDelete(viewerShellData);
  }

  highlightStudyButton(viewerShellData: ViewerShellData) {
    if (viewerShellData === null || viewerShellData === undefined) {
      return;
    }

    const len = this.getViewerShellDataList().length;
    for (let i = 0; i < len; i++) {
      const id = "headerButton" + this.getViewerShellDataList()[i].getId();
      const o = document.getElementById(id);
      if (o !== undefined && o !== null) {
        o.style.color = (this.getViewerShellDataList()[i].getId() === viewerShellData.getId()) ? '#ff9900' : 'white';
      }
    }
  }

  getId(viewerShellData: ViewerShellData): string {
    return 'headerButton' + viewerShellData.getId();
  }
}
