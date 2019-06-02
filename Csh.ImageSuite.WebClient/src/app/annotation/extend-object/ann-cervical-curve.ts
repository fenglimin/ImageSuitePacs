import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnCurve } from "./ann-curve"
import { AnnSerialize } from "../ann-serialize";

export class AnnCervicalCurve extends AnnCurve {
    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
        this.guideNeeded = true;
        this.annTypeName = "Cervical Curve";
        this.radiusInImage = this.pixelSpacing ? 170 / this.pixelSpacing.cx : 170;
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnCervicalCurve");
        annSerialize.writeInteger(30, 4);     // AnnType
        super.onSave(annSerialize);
    }
}
