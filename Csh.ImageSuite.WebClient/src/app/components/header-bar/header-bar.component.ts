import { Component, OnInit, SimpleChanges, AfterContentInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { ShellNavigatorService } from '../../services/shell-navigator.service';
import { Subscription }   from 'rxjs';
import { OpenedViewerShell } from '../../models/openedViewerShell';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.css']
})
export class HeaderBarComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked {

  subscriptionShellNavigated: Subscription;
  // Do NOT need to subscribe on shellCreated message, since when a new ViewerShell is created, 
  // shellNavigatorService.openedViewerShellList will updated, and this will update the UI of 
  // header-bar page
  constructor(private shellNavigatorService: ShellNavigatorService) {
    this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
      openedViewerShell => { this.highlightStudyButton(openedViewerShell);});
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
    this.highlightStudyButton(this.shellNavigatorService.openedViewerShellHighlighted);
  }

  getOpenedViewerShellList() {
    return this.shellNavigatorService.openedViewerShellList;
  }

  showViewerShell(openedViewerShell: OpenedViewerShell) {
    this.shellNavigatorService.shellNavigate(openedViewerShell);
  }

  closeViewerShell(openedViewerShell: OpenedViewerShell) {
    this.shellNavigatorService.shellDelete(openedViewerShell);
  }

  highlightStudyButton(openedViewerShell: OpenedViewerShell) {
    if (openedViewerShell === null || openedViewerShell === undefined) {
      return;
    }

    const len = this.getOpenedViewerShellList().length;
    for (let i = 0; i < len; i++) {
      const id = "headerButton" + this.getOpenedViewerShellList()[i].getId();
      const o = document.getElementById(id);
      if (o !== undefined && o !== null) {
        o.style.color = (this.getOpenedViewerShellList()[i].getId() === openedViewerShell.getId()) ? '#ff9900' : 'white';
      }
    }
  }
}
