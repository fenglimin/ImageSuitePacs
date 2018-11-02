import { Component, OnInit, ViewChildren, QueryList, AfterViewInit  } from '@angular/core';
import { LayoutViewerComponent } from '../layout-viewer/layout-viewer.component';

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

  @ViewChildren(LayoutViewerComponent) viewers: QueryList<LayoutViewerComponent>;

  constructor() {
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
