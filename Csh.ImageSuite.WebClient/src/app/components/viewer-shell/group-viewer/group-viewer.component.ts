import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ImageSelectorService } from '../../../services/image-selector.service';
import { HangingProtocalService } from '../../../services/hanging-protocal.service';
import { Subscription }   from 'rxjs';
import { ViewerShellData } from '../../../models/viewer-shell-data';
import { Layout, ImageLayout, GroupLayout, LayoutPosition, LayoutMatrix } from '../../../models/layout';
import { ImageHangingProtocal } from '../../../models/hanging-protocal';

@Component({
  selector: 'app-group-viewer',
  templateUrl: './group-viewer.component.html',
  styleUrls: ['./group-viewer.component.css']
})
export class GroupViewerComponent implements OnInit, AfterContentInit {
  Arr = Array; //Array type captured in a variable
  @Input() groupLayout: GroupLayout;
  @Input() viewerShellData: ViewerShellData;

  imageHaningProtocal = ImageHangingProtocal.Auto;
  id =  "";
  selected = false;

  imageLayoutList: Array<ImageLayout>;
  imageLayoutMatrix: LayoutMatrix;

  subscriptionImageSelection: Subscription;
  subscriptionImageLayoutChange: Subscription;
  
  constructor(private imageSelectorService: ImageSelectorService, private hangingProtocalService: HangingProtocalService) {
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
    this.imageLayoutList = this.hangingProtocalService.createImageLayoutList(this.viewerShellData,
      this.imageHaningProtocal, this.groupLayout);
    this.imageLayoutMatrix = this.imageLayoutList[0].layout.matrix;
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
      this.imageHaningProtocal = imageLayoutStyle;
      this.imageLayoutMatrix.fromNumber(imageLayoutStyle);
    }
  }

  generateId(): string {
    return '_' + this.viewerShellData.getId() + '_' + this.groupLayout.getId();
  }

  createImageLayout(rowIndex, colIndex): ImageLayout {
    let index = rowIndex * this.imageLayoutMatrix.colCount + colIndex;
    if (index >= this.imageLayoutList.length) return null;

    return this.imageLayoutList[index]; 
  }
}
