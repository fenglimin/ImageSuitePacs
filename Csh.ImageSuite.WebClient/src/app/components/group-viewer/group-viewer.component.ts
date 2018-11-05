import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';
import { Study } from '../../models/pssi';
import { GroupLayout, ImageLayout, Layout } from '../../models/layout';

@Component({
  selector: 'app-group-viewer',
  templateUrl: './group-viewer.component.html',
  styleUrls: ['./group-viewer.component.css']
})
export class GroupViewerComponent implements OnInit, AfterContentInit {
  Arr = Array; //Array type captured in a variable
  @Input() groupLayout: GroupLayout;
  @Input() study: Study;
  id =  "";
  selected = false;

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
      this.groupLayout.rowCountChild = Math.trunc(subLayoutStyle / 10);
      this.groupLayout.colCountChild = subLayoutStyle % 10;
    }
  }

  generateId(): string {
    return '_' + this.study.studyInstanceUid + '_' + this.groupLayout.layout.rowIndex + this.groupLayout.layout.colIndex;
  }

  createImageLayout(rowIndex, colIndex): ImageLayout {
    const imageLayout = new ImageLayout();

    imageLayout.groupLayout = this.groupLayout;
    imageLayout.rowIndex = rowIndex;
    imageLayout.colIndex = colIndex;

    return imageLayout;
  }
}
