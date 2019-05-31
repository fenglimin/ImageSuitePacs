import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnCurve } from "./ann-curve"
import { AnnSerialize } from "../ann-serialize";

export class AnnLumbarCurve extends AnnCurve {
    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
        this.guideNeeded = true;
        this.annTypeName = "Lumbar Curve";
        this.radiusInImage = this.pixelSpacing.cx ? 220 / this.pixelSpacing.cx : 220;
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnLumbarCurve");
        annSerialize.writeInteger(31, 4);     // AnnType
        super.onSave(annSerialize);
    }
}