import { ViewerImageData } from "../models/viewer-image-data";
import { ViewerGroupData } from "../models/viewer-group-data";
import { ViewerShellData } from "../models/viewer-shell-data";
import { Image } from "../models/pssi";

export enum ImageInteractionEnum {
    NavigationImageInGroup = 0,
    SelectImageInGroup,
    SelectThumbnailInNavigator,
    ChangeImageLayoutForSelectedGroup,
}

export class ImageInteractionData {
    private image: Image;
    private viewerImageData: ViewerImageData;
    private viewerGroupData: ViewerGroupData;
    private viewerShellData: ViewerShellData;
    private interactionType: ImageInteractionEnum;
    private interactionPara: any;

    constructor(interactionType: ImageInteractionEnum, interactionPara: any) {
        this.interactionType = interactionType;
        this.interactionPara = interactionPara;
    }

    getPssiImage(): Image {
        return this.image;
    }

    setPssiImage(image: Image) {
        this.image = image;
    }

    setImageData(viewerImageData: ViewerImageData) {
        this.viewerImageData = viewerImageData;
        this.setPssiImage(viewerImageData.image);
        this.setGroupData(viewerImageData.groupData);
    }

    getImageData(): ViewerImageData {
        return this.viewerImageData;
    }

    setGroupData(viewerGroupData: ViewerGroupData) {
        this.viewerGroupData = viewerGroupData;
        this.setShellData(viewerGroupData.viewerShellData);
    }

    getGroupData(): ViewerGroupData {
        return this.viewerGroupData;
    }

    setShellData(viewerShellData: ViewerShellData) {
        this.viewerShellData = viewerShellData;
    }

    getShellData(): ViewerShellData {
        return this.viewerShellData;
    }

    sameImageData(viewerImageData: ViewerImageData): boolean {
        return this.viewerImageData === viewerImageData;
    }

    sameGroupData(viewerGroupData: ViewerGroupData): boolean {
        return this.viewerGroupData === viewerGroupData;
    }

    sameShellData(viewerShellData: ViewerShellData): boolean {
        return this.viewerShellData === viewerShellData;
    }

    sameShellByPssiImage(image: Image): boolean {
        if (!image) return false;

        if (!this.viewerShellData) {
            alert("ImageInteractionData.sameShellByPssiImage() => Internal error, viewerShellData must NOT be undefined");
            return false;
        }

        return this.viewerShellData.sameShell(image);
    }

    getType(): ImageInteractionEnum {
        return this.interactionType;
    }

    getPara(): any {
        return this.interactionPara;
    }
}

export enum ImageOperationTargetEnum {
    ForAllImages = 1,
    ForSelectedImages = 10,
    ForClickedImage = 20
}

export enum ImageOperationEnum {
    // Operation takes effect for all images
    SetContext = 1,
    ShowAnnotation,
    ShowTextOverlay,
    ShowRuler,
    ShowGraphicOverlay,

    // Operation takes effect for all selected images
    RotateCwSelectedImage = 10,
    RotateCcwSelectedImage,
    FlipHorizontalSelectedImage,
    FlipVerticalSelectedImage,
    InvertSelectedImage,
    SaveSelectedImage,
    FitHeightSelectedImage,
    FitWidthSelectedImage,
    FitWindowSelectedImage,
    FitOriginalSelectedImage,
    
    // Operation takes effect for clicked image
    ManualWl = 20,
    DeleteAnnotation,
    Reset,
    ToggleKeyImage,
    AddMarker
}

export enum ImageContextEnum {
    Select = 1,
    Pan,
    Wl,
    Zoom,
    Magnify,
    RoiZoom,
    CreateAnn,
    RoiWl,
    SelectAnn
}

export class ImageOperationData {
    // The viewer shell ID for the operation
    shellId: string;

    // The operation type
    operationType: ImageOperationEnum;

    // The context type if the operation is SetContext
    contextType: ImageContextEnum;

    // The parameters for setting context
    contextPara: any;

    // The operation target
    operationTarget: ImageOperationTargetEnum;

    constructor(shellId: string, operationType: ImageOperationEnum, contextType: ImageContextEnum = undefined, contextPara: any = undefined) {
        this.shellId = shellId;
        this.operationType = operationType;
        this.contextType = contextType;
        this.contextPara = contextPara;

        if (operationType >= ImageOperationEnum.ManualWl) {
            this.operationTarget = ImageOperationTargetEnum.ForClickedImage;
        } else if (operationType >= ImageOperationEnum.RotateCwSelectedImage) {
            this.operationTarget = ImageOperationTargetEnum.ForSelectedImages;
        } else {
            this.operationTarget = ImageOperationTargetEnum.ForAllImages;
        }
    }

    needResponse(shellId: string, selected: boolean = true, clicked: boolean = true): boolean {
        if (this.shellId !== shellId) return false;

        if (this.operationTarget === ImageOperationTargetEnum.ForAllImages) return true;

        if (this.operationTarget === ImageOperationTargetEnum.ForSelectedImages && selected) return true;

        if (this.operationTarget === ImageOperationTargetEnum.ForClickedImage && clicked) return true;

        return false;
    }
}