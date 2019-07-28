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

    private shellImageSelectTypeList = [];

    constructor() {

    }

    doImageInteraction(imageOperationData: ImageOperationData) {

        switch (imageOperationData.operationType) {
            case ImageOperationEnum.SelectAllImages:
            case ImageOperationEnum.SelectAllImagesInSelectedGroup:
            case ImageOperationEnum.SelectAllVisibleImages:
            case ImageOperationEnum.SelectAllVisibleImagesInSelectedGroup:
            case ImageOperationEnum.SelectOneImageInSelectedGroup:
                this.shellImageSelectTypeList[imageOperationData.shellId] = imageOperationData.operationType;
                break;
            }

        this.imageOperationSource.next(imageOperationData);
    }

    isImageToolBarButtonCheckStyle(imageOperationType: ImageOperationEnum): boolean {
        switch (imageOperationType) {
            case ImageOperationEnum.ShowAnnotation:
            case ImageOperationEnum.ShowTextOverlay:
            case ImageOperationEnum.ShowRuler:
            case ImageOperationEnum.ShowGraphicOverlay:
            case ImageOperationEnum.SetContext:
            case ImageOperationEnum.ToggleKeyImageSelectedImage:
            case ImageOperationEnum.SelectAllImages:
            case ImageOperationEnum.SelectAllImagesInSelectedGroup:
            case ImageOperationEnum.SelectAllVisibleImages:
            case ImageOperationEnum.SelectAllVisibleImagesInSelectedGroup:
            case ImageOperationEnum.SelectOneImageInSelectedGroup:
                return true;
            default:
                return false;
        }
    }

    // If the toolbar button is initially checked when open studies
    isImageToolBarButtonInitChecked(imageOperationType: ImageOperationEnum): boolean {
        switch (imageOperationType) {
            case ImageOperationEnum.ShowAnnotation:
            case ImageOperationEnum.ShowTextOverlay:
            case ImageOperationEnum.ShowRuler:
            case ImageOperationEnum.ShowGraphicOverlay:
                return true;
            default:
                return false;
        }
    }

    getShellImageSelectType(shellId: string): ImageOperationEnum {
        return this.shellImageSelectTypeList[shellId]
            ? this.shellImageSelectTypeList[shellId]
            : ImageOperationEnum.SelectOneImageInSelectedGroup;
    }
}
