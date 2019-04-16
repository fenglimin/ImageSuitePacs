import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";

export class AnnBaseRectangle extends AnnBaseObject {

    jcObj: any;

    constructor(parentObj: AnnObject, center: Point, width: number, height: number, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcObj = jCanvaScript.rect(center.x, center.y, width, height, this.selectedColor).layer(this.layerId);
        super.setJcObj();
    }

   onFlip(vertical: boolean) {

        if (vertical) {
            this.jcObj._y = this.image.height() - this.jcObj._y;
            this.jcObj._height = -this.jcObj._height;
        } else {
            this.jcObj._x = this.image.width() - this.jcObj._x;
            this.jcObj._width = -this.jcObj._width;
        }

    }

    redraw(startPoint: Point, width: number, height: number) {
        this.setStartPosition(startPoint);
        this.setWidth(width);
        this.setHeight(height);
    }
}