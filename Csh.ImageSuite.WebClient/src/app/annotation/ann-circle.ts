import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { Image } from "../models/pssi";
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";


export class AnnCircle extends AnnObject implements IAnnotationObject {
    onSwitchFocus(): void { throw new Error("Not implemented"); }

    onFlip(vertical: boolean): void { throw new Error("Not implemented"); }

    center: Point;
    radius: number;
    jcCircle: any;
    jcCenterPoint: any;
    jcTopPoint: any;
    jcBottomPoint: any;
    jcLeftPoint: any;
    jcRightPoint: any;

    constructor(imageViewer: IImageViewer) {
        super(imageViewer);
    }   

    isCreated() {
        return this.created;
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {
        point = AnnObject.screenToImage(point, this.image.transformMatrix);

        if (mouseEventType === MouseEventType.MouseDown) {
            if (!this.center) {
                this.center = point;
                this.jcCenterPoint = jCanvaScript.circle(this.center.x, this.center.y, this.circleRadius, this.selectedColor, true).layer(this.layerId);
            } else {
                this.radius = AnnObject.countDistance(this.center, point);
                this.created = true;

                this.jcTopPoint = jCanvaScript.circle(this.center.x, this.center.y - this.radius, this.circleRadius, this.selectedColor, true).layer(this.layerId);
                this.jcBottomPoint = jCanvaScript.circle(this.center.x, this.center.y + this.radius, this.circleRadius, this.selectedColor, true).layer(this.layerId);
                this.jcLeftPoint = jCanvaScript.circle(this.center.x - this.radius, this.center.y, this.circleRadius, this.selectedColor, true).layer(this.layerId);
                this.jcRightPoint = jCanvaScript.circle(this.center.x + this.radius, this.center.y, this.circleRadius, this.selectedColor, true).layer(this.layerId);

                this.imageViewer.onAnnotationCreated(this);



                this.jcCircle.mouseStyle = "move";
                this.jcTopPoint.mouseStyle = "crosshair";
                this.jcBottomPoint.mouseStyle = "crosshair";
                this.jcLeftPoint.mouseStyle = "crosshair";
                this.jcRightPoint.mouseStyle = "crosshair";


                this.setChildDraggable(this, this.jcCircle, true, this.onDragCircle);
                this.setChildDraggable(this, this.jcTopPoint, true, this.onDragPoint);
                this.setChildDraggable(this, this.jcBottomPoint, true, this.onDragPoint);
                this.setChildDraggable(this, this.jcLeftPoint, true, this.onDragPoint);
                this.setChildDraggable(this, this.jcRightPoint, true, this.onDragPoint);

                this.setChildMouseEvent(this, this.jcCircle);
                this.setChildMouseEvent(this, this.jcTopPoint);
                this.setChildMouseEvent(this, this.jcBottomPoint);
                this.setChildMouseEvent(this, this.jcLeftPoint);
                this.setChildMouseEvent(this, this.jcRightPoint);
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.center) {
                if (this.jcCircle) {
                    this.jcCircle._radius = AnnObject.countDistance(this.center, point);
                } else {
                    this.jcCircle = jCanvaScript.circle(this.center.x, this.center.y, this.radius, this.selectedColor).layer(this.layerId);
                    this.jcCircle._lineWidth = this.lineWidth;
                }
            }
        } else if (mouseEventType === MouseEventType.MouseOver) {
            if (!this.selected) {
                this.setChild(true);
            }
        } else if (mouseEventType === MouseEventType.MouseOut) {
            if (!this.selected) {
                this.setChild(false);
            }
        } 
    }

    onScale() {
        this.lineWidth = this.getLineWidth();
        this.circleRadius = this.getPointRadius();

        this.jcCircle._lineWidth = this.getLineWidth(); 
        this.jcCenterPoint._radius = this.circleRadius;
        this.jcTopPoint._radius = this.circleRadius;
        this.jcBottomPoint._radius = this.circleRadius;
        this.jcLeftPoint._radius = this.circleRadius;
        this.jcRightPoint._radius = this.circleRadius;
    }

    onSelect(selected: boolean) {
        this.selected = selected;
        this.setChild(selected);

        if (this.selected) {
            this.imageViewer.selectAnnotation(this);
        }

    }

    private setChild(selected: boolean) {

        const color = selected ? this.selectedColor : this.defaultColor;

        if (this.jcCenterPoint) {
            this.jcCenterPoint.visible(selected);
            this.jcCenterPoint.color(color);
        }

        if (this.jcTopPoint) {
            this.jcTopPoint.visible(selected);
            this.jcTopPoint.color(color);
        }

        if (this.jcBottomPoint) {
            this.jcBottomPoint.visible(selected);
            this.jcBottomPoint.color(color);
        }

        if (this.jcLeftPoint) {
            this.jcLeftPoint.visible(selected);
            this.jcLeftPoint.color(color);
        }

        if (this.jcRightPoint) {
            this.jcRightPoint.visible(selected);
            this.jcRightPoint.color(color);
        }

        if (this.jcCircle) { 
            this.jcCircle.color(color);
        }
    } 

    private onDragCircle(draggedObj: any, deltaX: number, deltaY: number) {

        this.center.x += deltaX;
        this.center.y += deltaY;

        this.jcCenterPoint._x = this.center.x;
        this.jcCenterPoint._y = this.center.y;

        this.jcTopPoint._x += deltaX;
        this.jcTopPoint._y += deltaY;

        this.jcBottomPoint._x += deltaX;
        this.jcBottomPoint._y += deltaY;

        this.jcLeftPoint._x += deltaX;
        this.jcLeftPoint._y += deltaY;

        this.jcRightPoint._x += deltaX;
        this.jcRightPoint._y += deltaY;
    }

    private onDragPoint(draggedObj: any, deltaX: number, deltaY: number) {

        let deltaRadius = 0;
        if (draggedObj === this.jcTopPoint) {
            deltaRadius = -deltaY;
        }else if (draggedObj === this.jcBottomPoint) {
            deltaRadius = deltaY;
        }else if (draggedObj === this.jcLeftPoint) {
            deltaRadius = -deltaX;
        }else if (draggedObj === this.jcRightPoint) {
            deltaRadius = deltaX;
        }

        this.radius += deltaRadius;
        if (this.radius < 0) {
            this.radius = -this.radius;
        }
        this.jcCircle._radius = this.radius;

        this.jcTopPoint._x = this.center.x;
        this.jcTopPoint._y = this.center.y - this.radius;

        this.jcBottomPoint._x = this.center.x;
        this.jcBottomPoint._y = this.center.y + this.radius;

        this.jcLeftPoint._x = this.center.x - this.radius;
        this.jcLeftPoint._y = this.center.y;

        this.jcRightPoint._x = this.center.x + this.radius;
        this.jcRightPoint._y = this.center.y;
    }
}