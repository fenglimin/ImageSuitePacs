import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ViewerImageData } from "../models/viewer-image-data";
import { Image } from "../models/pssi";

export class ImageInterationData {
    viewerImageData: ViewerImageData;
    interactionType: ImageInteractionEnum;
    interactionPara: any;

    constructor(viewerImageData: ViewerImageData, interactionType: ImageInteractionEnum, interactionPara: any) {
        this.viewerImageData = viewerImageData;
        this.interactionType = interactionType;
        this.interactionPara = interactionPara;
    }
}

export enum ImageInteractionEnum {
    NavigationImageInGroup = 0,
    SelectImageInGroup,
    SelectThumbnailInNavigator,
    ChangeImageLayoutForGroup,


}

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

    // Observable ImageInterationData source
    private imageInteractionSource = new Subject<ImageInterationData>();

    // Observable string streams
    imageSelected$ = this.imageSelectedSource.asObservable();

    // Observable number streams
    imageLayoutChanged$ = this.imageLayoutChangedSource.asObservable();

    // Observable Image sources
    thumbnailSelected$ = this.thumbnailSelectedSource.asObservable();

    // Observable boolean sources
    imagePageNavigated$ = this.imagePageNavigatedSource.asObservable();

    // Observable ImageInterationData sources
    imageInteraction$ = this.imageInteractionSource.asObservable();

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

    doImageInteraction(imageInterationData: ImageInterationData) {
        this.imageInteractionSource.next(imageInterationData);
    }
}
