import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';
import { GroupHangingProtocal } from '../../models/hanging-protocal';

@Component({
  selector: 'app-viewer-toolbar',
  templateUrl: './viewer-toolbar.component.html',
  styleUrls: ['./viewer-toolbar.component.css']
})
export class ViewerToolbarComponent implements OnInit {
  @Output() layout = new EventEmitter<number>();
  constructor(private imageSelectorService: ImageSelectorService) { }

  ngOnInit() {
  }

  createGroupLayoutMatrix(groupHangingProtocalNumber: number): void {
    this.layout.emit(groupHangingProtocalNumber);
  }

  doSplitImageLayout(imageLayoutStyle: number): void {
    this.imageSelectorService.changeImageLayout(imageLayoutStyle);
  }
}
