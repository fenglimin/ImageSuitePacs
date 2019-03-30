import { Point } from '../models/annotation';
import { MouseEventType } from './ann-object';

export class AnnCircle {
    center: Point;
    radius: number;
    jcObj: any;
    created: boolean;

    constructor() {
        this.created = false;
    }    

    isCreated() {
        return this.created;
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {
        if (mouseEventType === MouseEventType.MouseDown) {
            if (!this.center) {
                this.center = new Point(point.x, point.y);
            } else {
                this.radius = this.countDistance(this.center, point);
                this.created = true;
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.center) {
                if (this.jcObj) {
                    this.jcObj._radius = this.countDistance(this.center, point);
                } else {
                    this.jcObj = jCanvaScript.circle(this.center.x, this.center.y, this.radius, "#FFF");
                }
            }
        }
    }

    countDistance(point1: any, point2: any): number {
        let value = Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2);
        value = Math.sqrt(value);

        return value;
    }
}