import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { Image } from "../models/pssi";
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";


export class AnnBasePoint extends AnnObject implements IAnnotationObject{
    
    jcCenterPoint: any;
    jcOuterCircle: any;
    onDragParent: (draggedObjParent, deltaX, deltaY) => void;

    constructor(parent: AnnObject, position: Point, imageViewer: IImageViewer, onDragParent: (draggedObjParent, deltaX, deltaY) => void) {

        super(imageViewer);
        this.parent = parent;
        this.onDragParent = onDragParent;

        this.jcCenterPoint = jCanvaScript.circle(position.x, position.y, this.circleRadius, this.selectedColor, true).layer(this.layerId);
        this.jcOuterCircle = jCanvaScript.circle(position.x, position.y, this.circleRadius * 2, this.selectedColor, false).layer(this.layerId);
        this.jcOuterCircle._lineWidth = this.lineWidth;
        this.jcOuterCircle.mouseStyle = "crosshair";
    }

    private onDrag(draggedObj: any, deltaX: number, deltaY: number) {
        this.jcCenterPoint._x = this.jcOuterCircle._x;
        this.jcCenterPoint._y = this.jcOuterCircle._y;
        if (this.onDragParent) {
            this.onDragParent(this.parent, deltaX, deltaY);
        }
    }

    onDrawEnd() {
        this.setChildDraggable(this, this.jcOuterCircle, true, this.onDrag);
    }

    onSelect(selected: boolean) {
        const color = selected ? this.selectedColor : this.defaultColor;

        if (this.jcCenterPoint) {
            this.jcCenterPoint.visible(selected);
            this.jcCenterPoint.color(color);
        }

        if (this.jcOuterCircle) {
            this.jcOuterCircle.visible(selected);
            this.jcOuterCircle.color(color);
        }
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {
        
    }

    onScale() {
        this.setRadius(this.circleRadius);
        this.jcOuterCircle._lineWidth = this.lineWidth;
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcCenterPoint._x += deltaX;
        this.jcCenterPoint._y += deltaY;

        this.jcOuterCircle._x += deltaX;
        this.jcOuterCircle._y += deltaY;
    }

    setRadius(radius: number) {
        this.jcCenterPoint._radius = radius;
        this.jcOuterCircle._radius = radius*2;
    }

    moveTo(point: Point) {
        this.jcCenterPoint._x = point.x;
        this.jcCenterPoint._y = point.y;

        this.jcOuterCircle._x = point.x;
        this.jcOuterCircle._y = point.y;
    }

    getPosition(): Point {
        return { x: this.jcOuterCircle._x, y: this.jcOuterCircle._y }
    }
}

export class AnnLine extends AnnObject implements IAnnotationObject{

    start: Point;
    end: Point;
    jcLine: any;
    //jcStartPoint: any;
    annStartPoint: AnnBasePoint;
    jcEndPoint: any;

    constructor(imageViewer: IImageViewer) {
        super(imageViewer);
    }    


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IAnnotationObject

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        point = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (!this.start) {
                this.start = new Point(point.x, point.y);
                //this.jcStartPoint = jCanvaScript.circle(this.start.x, this.start.y, this.circleRadius, this.selectedColor, true).layer(this.layerId);
                this.annStartPoint = new AnnBasePoint(this, point, this.imageViewer, this.onDragStartPoint);
                
                console.log("Draw start point.");
            } else {

                console.log("Start to end draw.");
                this.end = new Point(point.x, point.y);

                this.created = true;
                this.imageViewer.onAnnotationCreated(this);

                console.log("End draw.");

                //this.jcStartPoint.mouseStyle = "crosshair";
                this.jcEndPoint.mouseStyle = "crosshair";
                this.jcLine.mouseStyle = "move";

                //this.setChildDraggable(this, this.jcStartPoint, true, this.onDragStartPoint);
                //this.setChildDraggable(this, this.annStartPoint.jcCenterPoint, true, this.onDragStartPoint);
                this.annStartPoint.onDrawEnd();
                this.setChildDraggable(this, this.jcEndPoint, true, this.onDragEndPoint);
                this.setChildDraggable(this, this.jcLine, true, this.onDragLine);

                this.setChildMouseEvent(this, this.annStartPoint.jcOuterCircle);
                this.setChildMouseEvent(this, this.jcEndPoint);
                this.setChildMouseEvent(this, this.jcLine);

            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            console.log("mouse move");
            if (this.start) {
                console.log("Start pointed drawn.");
                if (this.jcLine) {
                    console.log("redraw line.");
                    this.jcLine._x1 = point.x;
                    this.jcLine._y1 = point.y;

                    if (!this.jcEndPoint) {
                        this.jcEndPoint = jCanvaScript.circle(point.x, point.y, this.circleRadius, this.selectedColor, true).layer(this.layerId);
                    } else {
                        this.jcEndPoint._x = point.x;
                        this.jcEndPoint._y = point.y;
                    }
                    
                } else {
                    console.log("Start to draw line.");
                    this.jcLine = jCanvaScript.line([[this.start.x, this.start.y], [point.x, point.y]], this.selectedColor).layer(this.layerId);
                    this.jcLine._lineWidth = this.lineWidth;

                    // Make sure the start point is on the top the line So that we can easily select it for moving
                    if (this.annStartPoint.jcOuterCircle) {
                        this.annStartPoint.jcOuterCircle.up();
                    }
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

    onSelect(selected: boolean) {
        this.selected = selected;
        this.setChild(selected);

        if (this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
        
    }

    onScale() {
        this.lineWidth = this.getLineWidth();
        this.circleRadius = this.getPointRadius();

        this.jcLine._lineWidth = this.getLineWidth();
        //this.jcStartPoint._radius = this.circleRadius;
        this.annStartPoint.onScale();
        this.jcEndPoint._radius = this.circleRadius;

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private setChild(selected: boolean) {

        const color = selected ? this.selectedColor : this.defaultColor;

        //if (this.jcStartPoint) {
        //    this.jcStartPoint.visible(selected);
        //    this.jcStartPoint.color(color);
        //}

        this.annStartPoint.onSelect(selected);

        if (this.jcEndPoint) {
            this.jcEndPoint.visible(selected);
            this.jcEndPoint.color(color);
        }

        if (this.jcLine) {
            this.jcLine.color(color);
        }
    }    

    private onDragStartPoint(draggedObjParent: any, deltaX: number, deltaY: number) {
        const point = draggedObjParent.annStartPoint.getPosition();
        draggedObjParent.jcLine._x0 = point.x;
        draggedObjParent.jcLine._y0 = point.y;
    }

    private onDragEndPoint(draggedObj: any, deltaX: number, deltaY: number) {
        this.jcLine._x1 = this.jcEndPoint._x;
        this.jcLine._y1 = this.jcEndPoint._y;
    }

    private onDragLine(draggedObj: any, deltaX: number, deltaY: number) {

        this.annStartPoint.onTranslate(deltaX, deltaY);
        const point = this.annStartPoint.getPosition();
        this.jcLine._x0 = point.x;
        this.jcLine._y0 = point.y;

        //this.jcStartPoint._x += deltaX;
        //this.jcStartPoint._y += deltaY;
        //this.jcLine._x0 = this.jcStartPoint._x;
        //this.jcLine._y0 = this.jcStartPoint._y;

        this.jcEndPoint._x += deltaX;
        this.jcEndPoint._y += deltaY;
        this.jcLine._x1 = this.jcEndPoint._x;
        this.jcLine._y1 = this.jcEndPoint._y;
    }
}