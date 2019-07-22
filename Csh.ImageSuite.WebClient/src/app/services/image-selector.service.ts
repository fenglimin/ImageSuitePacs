import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ViewerImageData } from "../models/viewer-image-data";
import { Image } from "../models/pssi";

@Injectable({
    providedIn: "root"
})
export class ImageSelectorService {

    // Observable string sources
    private imageSelectedSource = new Subject<ViewerImageData>();

    // Observable number sources
    private imageLayoutChangedSource = new Subject<number>();

    // Observable Image sources
    private thumbnailSelectedSource = new Subject<Image>();

    // Observable boolean sources
    private imagePageNavigatedSource = new Subject<boolean>();

    // Observable string streams
    imageSelected$ = this.imageSelectedSource.asObservable();

    // Observable number streams
    imageLayoutChanged$ = this.imageLayoutChangedSource.asObservable();

    // Observable Image sources
    thumbnailSelected$ = this.thumbnailSelectedSource.asObservable();

    // Observable boolean sources
    imagePageNavigated$ = this.imagePageNavigatedSource.asObservable();

    // Service string commands
    selectImage(viewerImageData: ViewerImageData) {
        this.imageSelectedSource.next(viewerImageData);
    }

    // Service number commands
    changeImageLayout(imageLayoutStyle: number) {
        this.imageLayoutChangedSource.next(imageLayoutStyle);
    }

    selectThumbnail(image: Image) {
        this.thumbnailSelectedSource.next(image);
    }

    navigateImagePage(up: boolean) {
        this.imagePageNavigatedSource.next(up);
    }
}
