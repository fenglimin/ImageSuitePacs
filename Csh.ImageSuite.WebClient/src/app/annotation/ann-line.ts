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
    dragging: boolean;


    constructor(layerId: string) {
        this.layerId = layerId;
        this.created = false;
        this.dragging = false;
    }

    isCreated() {
        return this.created;
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {
        if (mouseEventType === MouseEventType.MouseDown) {
            if (!this.start) {
                this.start = new Point(point.x, point.y);
                this.jcStartPoint = jCanvaScript.circle(this.start.x, this.start.y, 3, "#F90", true).layer(this.layerId);
            } else {
                this.end = new Point(point.x, point.y);

                this.created = true;

                this.jcStartPoint.visible(false);
                this.jcEndPoint.visible(false);
               
                this.setChildKeyEvent(this.jcStartPoint);

                this.setChildMouseEvent(this.jcStartPoint);
                this.setChildMouseEvent(this.jcEndPoint);
                this.setChildMouseEvent(this.jcLine);

                this.setChildDraggable(this, this.jcStartPoint, true, this.onDragStartPoint);
                this.setChildDraggable(this, this.jcEndPoint, true, this.onDragEndPoint);

                //this.setChildDraggable(this, this.jcLine, true, function (deltaX, deltaY) {//deltaX, deltaY is image coordinates

                //    this.jcStartPoint._x += deltaX;
                //    this.jcStartPoint._y += deltaY;
                //    this.jcLine._x0 = this.jcStartPoint._x;
                //    this.jcLine._y0 = this.jcStartPoint._y;

                //    this.jcEndPoint._x += deltaX;
                //    this.jcEndPoint._y += deltaY;
                //    this.jcLine._x1 = this.jcEndPoint._x;
                //    this.jcLine._y1 = this.jcEndPoint._y;
                //});

                this.onSelected(true);
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.start) {
                if (this.jcLine) {
                    this.jcLine._x1 = point.x;
                    this.jcLine._y1 = point.y;

                    if (!this.jcEndPoint) {
                        this.jcEndPoint = jCanvaScript.circle(point.x, point.y, 3, "#F90", true).layer(this.layerId);
                    } else {
                        this.jcEndPoint._x = point.x;
                        this.jcEndPoint._y = point.y;
                    }

                } else {
                    this.jcLine = jCanvaScript.line([[this.start.x, this.start.y], [point.x, point.y]], "#F90").layer(this.layerId);

                    // Delete the start point and redraw it, so that it is on the top the line
                    // So that we can easily select it for moving
                    if (this.jcStartPoint) {
                        this.jcStartPoint.up();
                    }
                    //this.jcStartPoint = jCanvaScript.circle(this.start.x, this.start.y, 3, "#FFF", true).layer(this.layerId);
                }
            }
        }
    }

    onSelected(selected: boolean) {

        const color = selected ? "#F90" : "#FFF";

        this.jcStartPoint.visible(selected);
        this.jcEndPoint.visible(selected);

        this.jcStartPoint.color(color);
        this.jcEndPoint.color(color);
        this.jcLine.color(color);
    }

    setChildKeyEvent(child: any) {
        var annObject = this;

        child._onkeydown = function (arg) {
            let i = 1;
        }
    }

    setChildMouseEvent(child: any) {
        var annObject = this;

        child._onmouseover = function (arg) {
            if (!annObject.dragging) {
                annObject.onSelected(true);
            }            
        };

        child._onmouseout = function (arg) {
            if (!annObject.dragging) {
                annObject.onSelected(false);
            }            
        };
    }

    setChildDraggable(parent: any, child: any, draggable: boolean, onDrag: (deltaX, deltaY) => void) {

        child.draggable({
            disabled: !draggable,
            start: function (arg) {
                this._lastPos = {};
                
            },
            stop: function (arg) {
                this._lastPos = {};
                parent.dragging = false;
            },
            drag: function (arg) {
                //ptImg is mouse position, not the object's start position
                //don't translate any annObject, always keep annObject's transform as clear.
                parent.dragging = true;

                if (typeof (this._lastPos.x) != "undefined") {
                    const deltaX = arg.x - this._lastPos.x;
                    const deltaY = arg.y - this._lastPos.y;

                    this._x += deltaX;
                    this._y += deltaY;

                    if (onDrag) {
                        onDrag.call(parent, deltaX, deltaY);
                    }
                }

                this._lastPos = {
                    x: arg.x,
                    y: arg.y
                };
                return true;
            }
        });
    }

    onDragStartPoint(deltaX: number, deltaY: number) {
        this.jcLine._x0 = this.jcStartPoint._x;
        this.jcLine._y0 = this.jcStartPoint._y;
    }

    onDragEndPoint(deltaX: number, deltaY: number) {
        this.jcLine._x1 = this.jcEndPoint._x;
        this.jcLine._y1 = this.jcEndPoint._y;
    }
}