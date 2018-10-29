import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ImageLayout } from '../../models/layout';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css']
})
export class ImageViewerComponent implements OnInit, AfterContentInit {
  @Input() imageLayout: ImageLayout;
  id:string =  "";
  subscriptionImageSelection: Subscription;
  subscriptionSubLayoutChange: Subscription;

  constructor(private imageSelectorService: ImageSelectorService) {
    this.subscriptionImageSelection = imageSelectorService.imageSelected$.subscribe(
      imageViewerId => {
        this.doSelectByImageViewerId(imageViewerId);
      });
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    this.id = this.id + this.imageLayout.rowIndexParent +
      this.imageLayout.colIndexParent +
      this.imageLayout.rowIndex +
      this.imageLayout.colIndex;
  }

  onSelected() {
    this.imageSelectorService.selectImage(this.id);
  }

  doSelectById(id: string, selected: boolean): void {
    const o = document.getElementById(id);
    if (o !== undefined && o !== null) {
      o.style.border = selected ? '1px solid green' : '1px solid #CCCCCC';
    }
  }

  doSelectByImageViewerId(imageViewerId: string): void {
    var selectedDivId = "DivImageViewer" + imageViewerId;
    var divId = 'DivImageViewer' + this.id;

    this.doSelectById(divId, selectedDivId === divId);
  }
}
