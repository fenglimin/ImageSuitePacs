import { ViewerImageData } from "../models/viewer-image-data";
import { ViewerGroupData } from "../models/viewer-group-data";
import { ViewerShellData } from "../models/viewer-shell-data";

export enum ImageInteractionEnum {
    NavigationImageInGroup = 0,
    SelectImageInGroup,
    SelectThumbnailInNavigator,
    ChangeImageLayoutForGroup,
}

export class ImageInteractionData {
    private viewerImageData: ViewerImageData;
    private viewerGroupData: ViewerGroupData;
    private viewerShellData: ViewerShellData;
    private interactionType: ImageInteractionEnum;
    private interactionPara: any;

    constructor(interactionType: ImageInteractionEnum, interactionPara: any) {
        this.interactionType = interactionType;
        this.interactionPara = interactionPara;
    }

    setImage(viewerImageData: ViewerImageData) {
        this.viewerImageData = viewerImageData;
        this.setGroup(viewerImageData.groupData);
    }

    setGroup(viewerGroupData: ViewerGroupData) {
        this.viewerGroupData = viewerGroupData;
        this.setShell(viewerGroupData.viewerShellData);
    }

    setShell(viewerShellData: ViewerShellData) {
        this.viewerShellData = viewerShellData;
    }

    sameImage(viewerImageData: ViewerImageData): boolean {
        return this.viewerImageData === viewerImageData;
    }

    sameGroup(viewerGroupData: ViewerGroupData): boolean {
        return this.viewerGroupData === viewerGroupData;
    }

    sameShell(viewerShellData: ViewerShellData): boolean {
        return this.viewerShellData === viewerShellData;
    }

    getType(): ImageInteractionEnum {
        return this.interactionType;
    }

    getPara(): any {
        return this.interactionPara;
    }
}

