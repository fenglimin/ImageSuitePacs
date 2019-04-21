import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnExtendObject } from "../extend-object/ann-extend-object";

export class AnnBaseEllipse extends AnnBaseObject {

    constructor(parentObj: AnnExtendObject, center: Point, width: number, height: number, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcObj = jCanvaScript.ellipse(center.x, center.y, Math.abs(width), Math.abs(height), this.selectedColor).layer(this.layerId);
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    setWidth(width: number) {
        this.jcObj._width = Math.abs(width);
        this.checkCircle();
    }

    setHeight(height: number) {
        this.jcObj._height = Math.abs(height);
        this.checkCircle();
    }

    checkCircle() {
        const isCircle = Math.round(this.getWidth()) === Math.round(this.getHeight());
        this.jcObj.color( isCircle? "#F00" : this.selectedColor);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}