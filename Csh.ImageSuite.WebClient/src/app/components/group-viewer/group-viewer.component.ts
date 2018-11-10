import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';
import { OpenedViewerShell } from '../../models/opened-viewer-shell';
import { Layout, ImageLayout, LayoutPosition, LayoutMatrix } from '../../models/layout';

@Component({
  selector: 'app-group-viewer',
  templateUrl: './group-viewer.component.html',
  styleUrls: ['./group-viewer.component.css']
})
export class GroupViewerComponent implements OnInit, AfterContentInit {
  Arr = Array; //Array type captured in a variable
  @Input() groupLayout: Layout;
  @Input() openedViewerShell: OpenedViewerShell;
  id =  "";
  selected = false;

  imageLayoutMatrix = new LayoutMatrix(1,1);

  subscriptionImageSelection: Subscription;
  subscriptionImageLayoutChange: Subscription;
  
  constructor(private imageSelectorService: ImageSelectorService) {
    this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
      imageViewerId => {
        this.doSelectByImageViewerId(imageViewerId);
      });

    this.subscriptionImageLayoutChange = imageSelectorService.imageLayoutChanged$.subscribe(
      imageLayoutStyle => {
        this.doChangeImageLayout(imageLayoutStyle);
      });

    
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.id = this.generateId();
  }

  onSelected() {
  }

  doSelectById(id: string, selected: boolean): void {
    const o = document.getElementById(id);
    if (o !== undefined && o !== null) {
      o.style.border = selected ? '1px solid yellow' : '1px solid #555555';
    }
  }

  doSelectByImageViewerId(imageViewerId: string): void {
    this.selected = imageViewerId.startsWith(this.id);
    var divId = 'DivLayoutViewer' + this.id;

    this.doSelectById(divId, this.selected);
  }

  doChangeImageLayout(imageLayoutStyle: number): void {
    if (this.selected) {
      this.imageLayoutMatrix.fromNumber(imageLayoutStyle);
    }
  }

  generateId(): string {
    return '_' + this.openedViewerShell.getId() + '_' + this.groupLayout.getId();
  }

  createImageLayout(rowIndex, colIndex): ImageLayout {
    const layout = new Layout(new LayoutPosition(rowIndex, colIndex), this.imageLayoutMatrix);
    const imageLayout = new ImageLayout(this.groupLayout, layout);
    return imageLayout;
  }
}
