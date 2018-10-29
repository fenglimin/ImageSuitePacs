import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ImageSelectorService } from '../../services/image-selector.service';
import { Subscription }   from 'rxjs';

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

  doSplitLayout(layoutStyle: number): void {
    this.layout.emit(layoutStyle);
  }

  doSplitSubLayout(subLayoutStyle: number): void {
    this.imageSelectorService.changeSubLayout(subLayoutStyle);
  }
}
