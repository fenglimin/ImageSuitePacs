import { Point } from '../models/annotation';
import { MouseEventType } from './ann-object';

export class AnnRectangle {
    start: Point;
    end: Point;
    jcObj: any;
    created: boolean;
    layerId: string;

    constructor(layerId: string) {
        this.layerId = layerId;
        this.created = false;
    }     

    isCreated() {
        return this.created;
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {
        if (mouseEventType === MouseEventType.MouseDown) {
            if (!this.start) {
                this.start = new Point(point.x, point.y);
            } else {
                this.end = new Point(point.x, point.y);
                this.created = true;
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.start) {
                if (this.jcObj) {
                    this.jcObj._width = point.x - this.start.x;
                    this.jcObj._height = point.y - this.start.y;
                } else {
                    this.jcObj = jCanvaScript.rect(this.start.x, this.start.y, 
                        point.x - this.start.x, point.y - this.start.y, "#FFF").layer(this.layerId).draggable();
                }
            }
        }
    }
}