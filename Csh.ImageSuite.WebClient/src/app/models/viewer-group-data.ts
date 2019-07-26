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
    empty = false;

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

    getImage(pageIndex: number, rowIndex: number, colIndex: number): ViewerImageData {
        if (this.imageDataList.length === 0) {
            return null;
        }

        const imageIndex = pageIndex * this.imageMatrix.rowCount * this.imageMatrix.colCount + rowIndex * this.imageMatrix.colCount + colIndex;
        if (imageIndex >= this.imageDataList.length) {
            alert(`getImage() => Invalid image index : ${imageIndex}`);
            return null;
        }

        return this.imageDataList[imageIndex];
    }

    addImage(image: Image) {
        const imageData = new ViewerImageData(this, LayoutPosition.fromNumber(this.imageDataList.length, this.imageMatrix));
        imageData.setImage(image);
        this.imageDataList.push(imageData);
    }

    updateImagePositionFromIndex(imageIndex: number) {
        if (imageIndex < 0 || imageIndex >= this.imageDataList.length) {
            alert(`updateImagePositionFromIndex() => Invalid image index : ${imageIndex}`);
            return;
        }

        this.imageDataList[imageIndex].setPosition(LayoutPosition.fromNumber(imageIndex, this.imageMatrix));
    }

    setEmpty() {
        this.empty = true;
        this.imageCount = 1;
        this.imageMatrix = new LayoutMatrix(1, 1);
        this.imageDataList = new Array<ViewerImageData>();
        this.addImage(null);
    }

    isEmpty() {
        return this.empty;
    }

    getPageCount(): number {
        return Math.ceil(this.imageDataList.length / (this.imageMatrix.rowCount * this.imageMatrix.colCount));
    }

    removeAllEmptyImage() {
        while (this.imageDataList[this.imageDataList.length - 1].isEmpty()) {
            this.imageDataList.pop();
        }
    }

    normalizeImageList() {
        // Need to add some empty images to make sure the total image (include empty image) is valid.
        // For example, if the image count is 5(not empty), and the layout matrix is 2x2, need to add
        // 3 empty images to make sure total image number(8) is multiple of the matrix size(4)

        const matrixSize = this.imageMatrix.rowCount * this.imageMatrix.colCount;
        const totalSize = this.getPageCount() * matrixSize;
        for (let i = this.imageDataList.length; i < totalSize; i++) {
            this.addImage(null);
        }
    }

    getViewerImageDataByImage(image: Image): ViewerImageData {
        const result = this.imageDataList.filter(imageData => imageData.sameImage(image));
        if (result.length > 1) {
            alert("ViewerGroupData.findViewerImageDataByImage() => Find same images in group data!");
        }

        return result.length === 0 ? undefined : result[0];
    }

    sameGroup(image: Image): boolean {
        return this.getViewerImageDataByImage(image) !== undefined;
    }

    sameShell(image: Image): boolean {
        return this.viewerShellData.getViewerImageDataByImage(image) !== undefined;
    }
}
