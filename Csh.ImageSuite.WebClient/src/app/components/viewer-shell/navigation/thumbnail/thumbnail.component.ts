import { Component, OnInit, Input } from '@angular/core';
import { ImageSelectorService } from '../../../../services/image-selector.service';
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.css']
})
export class ThumbnailComponent implements OnInit {
    subscription: Subscription;
    @Input() imageSop: string;
    constructor(private imageSelectorService: ImageSelectorService) {
        this.subscription = imageSelectorService.imageSelected$.subscribe(
            imageSopSelected => {
                this.setSelectState(this.imageSop === imageSopSelected);
            });
    }


  ngOnInit() {
  }

  setSelectState(selected: boolean): void {
      var o = document.getElementById("thumbnail" + this.imageSop);
      if (o !== null) {
          o.style.color = selected ? 'red' : 'white';
      }
  }

  onClick() {
      this.setSelectState(true);
      this.imageSelectorService.selectImage(this.imageSop);
  }
}
