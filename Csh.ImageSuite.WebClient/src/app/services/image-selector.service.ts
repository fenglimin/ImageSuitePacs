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

    // Observable string sources
    private thumbnailSelectedSource = new Subject<Image>();

    // Observable string streams
    imageSelected$ = this.imageSelectedSource.asObservable();

    // Observable number streams
    imageLayoutChanged$ = this.imageLayoutChangedSource.asObservable();

    thumbnailSelected$ = this.thumbnailSelectedSource.asObservable();

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
}
