import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { GroupLayout } from '../../models/layout';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-layout-viewer',
  templateUrl: './layout-viewer.component.html',
  styleUrls: ['./layout-viewer.component.css']
})
export class LayoutViewerComponent implements OnInit, AfterContentInit {
  Arr = Array; //Array type captured in a variable
  @Input() groupLayout: GroupLayout;
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
    this.id = this.id + this.groupLayout.rowIndex + this.groupLayout.colIndex;
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
    this.selected = imageViewerId.startsWith(this.groupLayout.id + '.' + this.id);
    var divId = 'DivLayoutViewer' + this.groupLayout.id + '.' + this.id;

    this.doSelectById(divId, this.selected);
  }

  doChangeSubLayout(subLayoutStyle: number): void {
    if (this.selected) {
      this.groupLayout.rowCountChild = Math.trunc(subLayoutStyle / 10);
      this.groupLayout.colCountChild = subLayoutStyle % 10;
    }
  }
}
