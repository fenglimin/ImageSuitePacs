import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { ImageInteractionData, ImageInteractionEnum } from "../models/image-operation";
import { ViewerImageData } from "../models/viewer-image-data";
import { ViewerGroupData } from "../models/viewer-group-data";
import { ViewerShellData } from "../models/viewer-shell-data";

@Injectable({
    providedIn: 'root'
})
export class ImageInteractionService {

    // Observable ImageInteractionData source
    private imageInteractionSource = new Subject<ImageInteractionData>();

    // Observable ImageInteractionData sources
    imageInteraction$ = this.imageInteractionSource.asObservable();

    constructor() {

    }

    private doImageInteraction(imageInteractionData: ImageInteractionData) {
        this.imageInteractionSource.next(imageInteractionData);
    }

    onNavigationImageInGroup(viewerImageData: ViewerImageData, up: boolean) {
        const imageInteractionData = new ImageInteractionData(ImageInteractionEnum.NavigationImageInGroup, up);
        imageInteractionData.setImage(viewerImageData);
        this.doImageInteraction(imageInteractionData);
    }
}
