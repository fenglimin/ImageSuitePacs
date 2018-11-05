import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ImageLayout } from '../../models/layout';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';
import { Study } from '../../models/pssi';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.css']
})
export class ImageViewerComponent implements OnInit, AfterContentInit {
  @Input() imageLayout: ImageLayout;
  @Input() study: Study;
  id: string = "";
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
    this.id = this.generateId();
  }

  onSelected() {
    this.imageSelectorService.selectImage(this.id);
  }

  doSelectById(id: string, selected: boolean): void {
    const o = document.getElementById(id);
    if (o !== undefined && o !== null) {
      o.style.border = selected ? '1px solid green' : '1px solid #555555';
    }
  }

  doSelectByImageViewerId(imageViewerId: string): void {
    var selectedDivId = "DivImageViewer" + imageViewerId;
    var divId = 'DivImageViewer' + this.id;

    this.doSelectById(divId, selectedDivId === divId);
  }

  generateId(): string {
    return '_' + this.study.studyInstanceUid + '_' + this.imageLayout.rowIndexParent +
      this.imageLayout.colIndexParent +
      this.imageLayout.rowIndex +
      this.imageLayout.colIndex;
  }
}
