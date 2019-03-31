import { Point } from '../models/annotation';
import { MouseEventType } from './ann-object';

export class AnnLine {
    start: Point;
    end: Point;
    jcLine: any;
    jcStartPoint: any;
    jcEndPoint: any;

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
                this.jcStartPoint = jCanvaScript.circle(this.start.x, this.start.y, 3, "#FFF", true).layer(this.layerId);
            } else {
                this.end = new Point(point.x, point.y);

                this.jcStartPoint.draggable();
                this.jcEndPoint.draggable();
                this.created = true;
                this.onSelected(true);
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.start) {
                if (this.jcLine) {
                    this.jcLine._x1 = point.x;
                    this.jcLine._y1 = point.y;

                    if (!this.jcEndPoint) {
                        this.jcEndPoint = jCanvaScript.circle(point.x, point.y, 3, "#FFF", true).layer(this.layerId);
                    } else {
                        this.jcEndPoint._x = point.x;
                        this.jcEndPoint._y = point.y;
                    }
                    
                } else {
                    this.jcLine = jCanvaScript.line([[this.start.x, this.start.y], [point.x, point.y]], "#FFF").layer(this.layerId);

                    // Delete the start point and redraw it, so that it is on the top the line
                    // So that we can easily select it for moving
                    if (this.jcStartPoint) {
                        this.jcStartPoint.del();
                    }
                    this.jcStartPoint = jCanvaScript.circle(this.start.x, this.start.y, 3, "#FFF", true).layer(this.layerId);
                }
            }
        }
    }

    onSelected(selected: boolean) {
        this.jcStartPoint.color("#F90");
        this.jcEndPoint.color("#F90");
        this.jcLine.color("#F90");
    }
}