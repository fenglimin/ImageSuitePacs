import { Point, MouseEventType } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';

export class AnnBaseEllipse extends AnnBaseObject {

    constructor(parentObj: AnnObject, center: Point, width: number, height: number, imageViewer: IImageViewer) {

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

    getAreaString(): string {

        const width = this.getWidth();
        const height = this.getHeight();
        const area = Math.abs(width * height) * Math.PI;

        let areaString = "Size = ";
        if (this.pixelSpacing) {
            areaString += (area * this.pixelSpacing.cx * this.pixelSpacing.cy).toFixed(2) + "mm2";
        } else {
            areaString += area.toFixed(2) + "pt2";
        }

        return areaString;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}