import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";

export class AnnBaseLine extends AnnBaseObject {

    constructor(parentObj: AnnObject, posStart: Point, posEnd: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcObj = jCanvaScript.line([[posStart.x, posStart.y], [posEnd.x, posEnd.y]], this.selectedColor).layer(this.layerId);
        super.setJcObj();
    }

    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcObj._y0 = this.image.height() - this.jcObj._y0;
            this.jcObj._y1 = this.image.height() - this.jcObj._y1;
        } else {
            this.jcObj._x0 = this.image.width() - this.jcObj._x0;
            this.jcObj._x1 = this.image.width() - this.jcObj._x1;
        }

    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcObj._x0 += deltaX;
        this.jcObj._y0 += deltaY;

        this.jcObj._x1 += deltaX;
        this.jcObj._y1 += deltaY;
    }

    onMoveStartPoint(point: Point) {
        this.jcObj._x0 = point.x;
        this.jcObj._y0 = point.y;
    }

    onMoveEndPoint(point: Point) {
        this.jcObj._x1 = point.x;
        this.jcObj._y1 = point.y;
    }

    getStartPosition(): Point {
        return { x: this.jcObj._x0, y: this.jcObj._y0 }
    }

    getEndPosition(): Point {
        return { x: this.jcObj._x1, y: this.jcObj._y1 }
    }
}
