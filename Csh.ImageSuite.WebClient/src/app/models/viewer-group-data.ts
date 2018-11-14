import { ImageHangingProtocal } from '../models/hanging-protocal';
import { ViewerShellData } from '../models/viewer-shell-data';
import { LayoutPosition, LayoutMatrix, Layout, GroupLayout, ImageLayout } from '../models/layout';
import { ViewerImageData } from '../models/viewer-image-data';
import { Patient, Study, Series, Image } from '../models/pssi';

export class ViewerGroupData {
  viewerShellData: ViewerShellData;
  imageHangingProtocal : ImageHangingProtocal;
  position: LayoutPosition;

  imageCount = 0;
  imageMatrix : LayoutMatrix;
  imageDataList : Array<ViewerImageData>;

  constructor(viewerShellData: ViewerShellData, imageHangingProtocal : ImageHangingProtocal, position: LayoutPosition) { 
    this.viewerShellData = viewerShellData;
    this.imageHangingProtocal = imageHangingProtocal;
    this.position = position;
  }

  getId(): string {
    return this.viewerShellData.getId() + '_' + this.position.getId();
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
      alert("getImage() => Invalid image index : " + imageIndex);
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
      alert("updateImagePositionFromIndex() => Invalid image index : " + imageIndex);
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
