import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';
import { OpenedViewerShell } from '../../models/openedViewerShell';
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
  subscriptionSubLayoutChange: Subscription;
  
  constructor(private imageSelectorService: ImageSelectorService) {
    this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
      imageViewerId => {
        this.doSelectByImageViewerId(imageViewerId);
      });

    this.subscriptionSubLayoutChange = imageSelectorService.subLayoutChanged$.subscribe(
      subLayoutStyle => {
        this.doChangeSubLayout(subLayoutStyle);
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

  doChangeSubLayout(subLayoutStyle: number): void {
    if (this.selected) {
      this.imageLayoutMatrix.fromNumber(subLayoutStyle);
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
