import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnCurve } from "./ann-curve"

export class AnnCervicalCurve extends AnnCurve {
    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
        this.radiusInImage = this.pixelSpacing ? 170 / this.pixelSpacing.cx : 170;
    }
}
