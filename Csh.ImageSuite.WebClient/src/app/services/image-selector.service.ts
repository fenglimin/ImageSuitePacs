import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageSelectorService {

  // Observable string sources
  private imageSelectedSource = new Subject<string>();

  // Observable number sources
  private subLayoutChangedSource = new Subject<number>();

  // Observable string streams
  imageSelected$ = this.imageSelectedSource.asObservable();

  // Observable number streams
  subLayoutChanged$ = this.subLayoutChangedSource.asObservable();

  // Service string commands
  selectImage(imageSopSelected: string) {
      this.imageSelectedSource.next(imageSopSelected);
  }

  // Service number commands
  changeSubLayout(subLayoutStyle: number) {
    this.subLayoutChangedSource.next(subLayoutStyle);
  }
}
