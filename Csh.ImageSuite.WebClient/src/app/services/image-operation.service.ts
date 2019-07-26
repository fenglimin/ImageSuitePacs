import { Injectable } from '@angular/core';
import { Subject } from "rxjs";

import { ImageOperationData, ImageOperationEnum, ImageContextEnum } from "../models/image-operation";

@Injectable({
    providedIn: 'root'
})
export class ImageOperationService {

    // Observable ImageOperationData source
    private imageOperationSource = new Subject<ImageOperationData>();

    // Observable ImageOperationData sources
    imageOperation$ = this.imageOperationSource.asObservable();

    constructor() {

    }

    doImageInteraction(imageOperationData: ImageOperationData) {
        this.imageOperationSource.next(imageOperationData);
    }

    isImageToolBarButtonCheckStyle(imageOperationData: ImageOperationData): boolean {
        switch (imageOperationData.operationType) {
            case ImageOperationEnum.ShowAnnotation:
            case ImageOperationEnum.ShowOverlay:
            case ImageOperationEnum.ShowRuler:
            case ImageOperationEnum.ShowGraphicOverlay:
            case ImageOperationEnum.SetContext:
            case ImageOperationEnum.ToggleKeyImage:
                return true;
            default:
                return false;
        }
    }
}
