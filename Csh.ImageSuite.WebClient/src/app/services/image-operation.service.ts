import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { ViewerImageData } from "../models/viewer-image-data";
import { ImageOperationData, ImageOperationEnum, ImageContextEnum, ImageContextData, ShellRuntimeData } from "../models/image-operation";
import { Point, MouseEventType, AnnType, Rectangle } from "../models/annotation";

@Injectable({
    providedIn: 'root'
})
export class ImageOperationService {
    // Observable ImageOperationData source
    private imageOperationSource = new Subject<ImageOperationData>();

    // Observable ImageOperationData sources
    imageOperation$ = this.imageOperationSource.asObservable();

    private shellRuntimeDataList: ShellRuntimeData[] = [];

    constructor() {

    }

    doImageOperation(imageOperationData: ImageOperationData) {

        switch (imageOperationData.operationType) {
            case ImageOperationEnum.SelectAllImages:
            case ImageOperationEnum.SelectAllImagesInSelectedGroup:
            case ImageOperationEnum.SelectAllVisibleImages:
            case ImageOperationEnum.SelectAllVisibleImagesInSelectedGroup:
            case ImageOperationEnum.SelectOneImageInSelectedGroup:
                this.onSetImageSelectType(imageOperationData);
                break;

            case ImageOperationEnum.SetContext:
                this.onSetContext(imageOperationData);
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
        return this.getShellRuntimeData(shellId).imageSelectType;
    }

    getShellContextType(shellId: string): ImageContextData {
        return this.getShellRuntimeData(shellId).contextData;
    }

    getShellStampFileName(shellId: string): string {
        return this.getShellRuntimeData(shellId).stampFileName;
    }

    setShellContextType(shellId: string, imageContextData: ImageContextData) {
        const imageOperationData = new ImageOperationData(shellId, ImageOperationEnum.SetContext, imageContextData);
        this.doImageOperation(imageOperationData);
    }

    onClickImageInViewer(viewerImageData: ViewerImageData) {
        const shellId = viewerImageData.groupData.viewerShellData.getId();
        const imageOperationData = new ImageOperationData(shellId, ImageOperationEnum.ClickImageInViewer, viewerImageData);
        this.doImageOperation(imageOperationData);
    }

    setShellStampFileName(shellId: string, stampFileName: string) {
        this.getShellRuntimeData(shellId).stampFileName = stampFileName;
    }

    onNavigateImageInGroup(viewerImageData: ViewerImageData, up: boolean) {
        const nextIndex = viewerImageData.groupData.getNextPageIndex(up);
        if (nextIndex === -1) {
            return;
        }

        this.onDisplayImageInGroup(viewerImageData, nextIndex);
    }

    onMoveAllSelectedImage(viewerImageData: ViewerImageData, deltaX: number, deltaY: number) {
        const shellId = viewerImageData.groupData.viewerShellData.getId();
        const imageOperationData = new ImageOperationData(shellId, ImageOperationEnum.MoveSelectedImage, { viewerImageData: viewerImageData, deltaX: deltaX, deltaY: deltaY });
        this.doImageOperation(imageOperationData);
    }

    onZoomAllSelectedImage(viewerImageData: ViewerImageData, zoomOut: boolean, zoomPoint: Point) {
        const shellId = viewerImageData.groupData.viewerShellData.getId();
        const imageOperationData = new ImageOperationData(shellId, ImageOperationEnum.ZoomSelectedImage, { viewerImageData: viewerImageData, zoomOut: zoomOut, zoomPoint: zoomPoint });
        this.doImageOperation(imageOperationData);
    }

    onWlAllSelectedImage(viewerImageData: ViewerImageData, deltaX: number, deltaY: number) {
        const shellId = viewerImageData.groupData.viewerShellData.getId();
        const imageOperationData = new ImageOperationData(shellId, ImageOperationEnum.WlSelectedImage, { viewerImageData: viewerImageData, deltaX: deltaX, deltaY: deltaY });
        this.doImageOperation(imageOperationData);
    }

    onNavigateFramesInClickedImage(viewerImageData: ViewerImageData, up: boolean) {
        const nextIndex = viewerImageData.image.getNextFrameIndex(up);
        if (nextIndex === -1) {
            return;
        }

        this.onDisplayFramesInClickedImage(viewerImageData, nextIndex);
    }

    onDisplayFramesInClickedImage(viewerImageData: ViewerImageData, index: number) {
        const shellId = viewerImageData.groupData.viewerShellData.getId();
        const imageOperationData = new ImageOperationData(shellId, ImageOperationEnum.DisplayFramesInClickedImage, { viewerImageData: viewerImageData, index: index });
        this.doImageOperation(imageOperationData);
    }

    onDisplayImageInGroup(viewerImageData: ViewerImageData, index: number): void {
        const shellId = viewerImageData.groupData.viewerShellData.getId();
        const imageOperationData = new ImageOperationData(shellId, ImageOperationEnum.DisplayImageInGroup, { viewerImageData: viewerImageData, index: index });
        this.doImageOperation(imageOperationData);
    }

    private onSetImageSelectType(imageOperationData: ImageOperationData) {
        const shellRuntimeData = this.getShellRuntimeData(imageOperationData.shellId);
        shellRuntimeData.imageSelectType = imageOperationData.operationType;
    }

    private onSetContext(imageOperationData: ImageOperationData) {
        const shellRuntimeData = this.getShellRuntimeData(imageOperationData.shellId);
        shellRuntimeData.contextData = imageOperationData.operationPara;
    }

    private getShellRuntimeData(shellId: string): ShellRuntimeData {
        if (!this.shellRuntimeDataList[shellId]) {
            this.shellRuntimeDataList[shellId] = new ShellRuntimeData();

        }

        return this.shellRuntimeDataList[shellId];
    }
}
