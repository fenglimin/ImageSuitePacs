import { ImageHangingProtocol } from "../models/hanging-protocol";
import { ViewerShellData } from "../models/viewer-shell-data";
import { LayoutPosition, LayoutMatrix } from "../models/layout";
import { ViewerImageData } from "../models/viewer-image-data";
import { Image } from "../models/pssi";
import { LogService } from "../services/log.service";

export class ViewerGroupData {
    static logService: LogService;
    viewerShellData: ViewerShellData;
    imageHangingProtocol: ImageHangingProtocol;
    position: LayoutPosition;

    imageCount = 0;
    imageMatrix: LayoutMatrix;
    imageDataList = new Array<ViewerImageData>();

    constructor(viewerShellData: ViewerShellData,
        imageHangingProtocol: ImageHangingProtocol,
        position: LayoutPosition) {
        this.viewerShellData = viewerShellData;
        this.imageHangingProtocol = imageHangingProtocol;
        this.position = position;

        ViewerGroupData.logService.debug("ViewerGroupData " + this.getId() + " created!");
    }

    getId(): string {
        return this.viewerShellData.getId() + "_" + this.position.getId();
    }

    getIndex(): number {
        return this.position.rowIndex * this.viewerShellData.groupMatrix.colCount + this.position.colIndex;
    }

    setPosition(position: LayoutPosition) {
        this.position = position;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Image Operation
    cleanImage() {
        this.imageDataList.length = 0;
        this.imageCount = 0;
    }

    getImage(rowIndex: number, colIndex: number): ViewerImageData {
        if (this.imageDataList.length === 0) {
            return null;
        }

        const imageIndex = rowIndex * this.imageMatrix.colCount + colIndex;
        if (imageIndex >= this.imageDataList.length) {
            alert(`getImage() => Invalid image index : ${imageIndex}`);
            return null;
        }

        return this.imageDataList[imageIndex];
    }

    addImage(imageIndex: number, image: Image) {
        const imageData = new ViewerImageData(this, LayoutPosition.fromNumber(imageIndex, this.imageMatrix.colCount));
        imageData.setImage(image);
        this.imageDataList.push(imageData);
    }

    updateImagePositionFromIndex(imageIndex: number) {
        if (imageIndex < 0 || imageIndex >= this.imageDataList.length) {
            alert(`updateImagePositionFromIndex() => Invalid image index : ${imageIndex}`);
            return;
        }

        this.imageDataList[imageIndex].setPosition(LayoutPosition.fromNumber(imageIndex, this.imageMatrix.colCount));
    }

    setEmpty() {
        this.imageCount = 1;
        this.imageMatrix = new LayoutMatrix(1, 1);
        this.imageDataList = new Array<ViewerImageData>();
        this.addImage(0, null);
    }
}
