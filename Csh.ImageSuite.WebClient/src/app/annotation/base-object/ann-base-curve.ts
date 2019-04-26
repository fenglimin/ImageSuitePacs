import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnExtendObject } from "../extend-object/ann-extend-object";

export class AnnBaseCurve extends AnnBaseObject {

    constructor(parentObj: AnnExtendObject, center: Point, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcObj = jCanvaScript.arc(center.x, center.y, radius, startAngle, endAngle, anticlockwise, this.selectedColor).layer(this.layerId);
        super.setJcObj();
        this.jcObj.mouseStyle = "move";

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    setAngle(startAngle: number, endAngle: number) {
        this.jcObj._startAngle = startAngle;
        this.jcObj._endAngle = endAngle;
    }

    setAnticlockwise(anticlockwise: boolean) {
        this.jcObj._anticlockwise = anticlockwise;
    }

    getText(): string {
        let arcAngle = this.jcObj._endAngle - this.jcObj._startAngle;
        if (arcAngle > 180) {
            arcAngle = 360 - arcAngle;
        }

        // Display radius, not the length of the arc
        //const arcLength = Math.PI * this.jcObj._radius * arcAngle / 180;

        let text : string;
        if (this.pixelSpacing) {
            text = (this.jcObj._radius * this.pixelSpacing.cx).toFixed(2) + "mm";
        } else {
            text = this.jcObj._radius.toFixed(2) + "pt";
        }

        text += " " + arcAngle.toFixed(2) + "\xb0";

        return text;
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}
