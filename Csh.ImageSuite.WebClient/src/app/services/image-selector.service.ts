import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';
import { ViewerImageData } from '../models/viewer-image-data';

@Injectable({
  providedIn: 'root'
})
export class ImageSelectorService {

  // Observable string sources
    private imageSelectedSource = new Subject<ViewerImageData>();

  // Observable number sources
  private imageLayoutChangedSource = new Subject<number>();

  // Observable string streams
  imageSelected$ = this.imageSelectedSource.asObservable();

  // Observable number streams
  imageLayoutChanged$ = this.imageLayoutChangedSource.asObservable();

  // Service string commands
    selectImage(viewerImageData: ViewerImageData) {
        this.imageSelectedSource.next(viewerImageData);
  }

  // Service number commands
  changeImageLayout(imageLayoutStyle: number) {
    this.imageLayoutChangedSource.next(imageLayoutStyle);
  }
}
