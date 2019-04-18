import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBasePoint } from "./base-object/ann-base-point";
import { AnnBaseRectangle } from "./base-object/ann-base-rectangle";
import { AnnTextIndicator } from "./ann-text-indicator"

export class AnnRectangle extends AnnObject implements IAnnotationObject {
    
    /*
         P0                                         P1  
            --------------------------------------
            |                                    |
            |                                    |  
            |                                    |
            --------------------------------------
         P3                                         P2                

    */

    private annPointList = new Array<AnnBasePoint>();
    private annRectangle: AnnBaseRectangle;
    private annTextIndicator: AnnTextIndicator;


    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }     


    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        const imagePoint = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (this.annPointList.length === 0) {
                const annTopLeftPoint = new AnnBasePoint(this, imagePoint, this.imageViewer);
                this.annPointList.push(annTopLeftPoint);
            } else {

                this.annPointList.forEach(annObj => annObj.onDrawEnded());
                this.annRectangle.onDrawEnded();

                this.focusedObj = this.annRectangle;
                this.created = true;
                this.imageViewer.onAnnotationCreated(this);
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annPointList.length !== 0) {

                const pointList = [];
                
                const topLeftPoint = this.annPointList[0].getPosition();
                pointList.push(topLeftPoint);
                pointList.push({ x: imagePoint.x, y: topLeftPoint.y });
                pointList.push(imagePoint);
                pointList.push({ x: topLeftPoint.x, y: imagePoint.y });
                

                if (this.annRectangle) {
                    this.redraw(pointList);
                } else {

                    this.annRectangle = new AnnBaseRectangle(this, topLeftPoint, imagePoint.x - topLeftPoint.x, imagePoint.y - topLeftPoint.y, this.imageViewer);

                    const annTopRightPoint = new AnnBasePoint(this, pointList[1], this.imageViewer);
                    this.annPointList.push(annTopRightPoint);

                    const annBottomRightPoint = new AnnBasePoint(this, imagePoint, this.imageViewer);
                    this.annPointList.push(annBottomRightPoint);

                    const annBottomLeftPoint = new AnnBasePoint(this, pointList[3], this.imageViewer);
                    this.annPointList.push(annBottomLeftPoint);

                    const arrowStart = { x: imagePoint.x + 300, y: imagePoint.y };
                    this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
                    this.annTextIndicator.onCreate(arrowStart, imagePoint, "Area");
                }
            }
        }
    }


    onDrag(deltaX: number, deltaY: number) {

        if (this.annRectangle === this.focusedObj) {
            this.onTranslate(deltaX, deltaY);
        } else if (this.annPointList.some(annObj => annObj === this.focusedObj)) {
            this.focusedObj.onTranslate(deltaX, deltaY);
            this.onPointDragged(this.focusedObj, deltaX, deltaY);
        } else if (this.annTextIndicator === this.focusedObj) {
            this.onTextDragged(deltaX, deltaY);
        }
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect AnnRectangle");
        this.selected = selected;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.annRectangle;
        }

        this.annRectangle.onSelect(selected, this.focusedObj === this.annRectangle);
        this.annPointList.forEach(annObj => annObj.onSelect(selected, this.focusedObj === annObj));

        this.annTextIndicator.onSelect(selected, false);

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annRectangle.onTranslate(deltaX, deltaY);
        this.annPointList.forEach(annObj => annObj.onTranslate(deltaX, deltaY));
        this.annTextIndicator.onTranslate(deltaX, deltaY);
    }

    onScale() {
        this.annRectangle.onScale();
        this.annPointList.forEach(annObj => annObj.onScale());
        this.annTextIndicator.onScale();
    }

    onFlip(vertical: boolean) {
        this.annRectangle.onFlip(vertical);
        this.annPointList.forEach(annObj => annObj.onFlip(vertical));
        this.annTextIndicator.onFlip(vertical);
    }

    onRotate(angle: number) {
        this.annTextIndicator.onRotate(angle);
    }

    onSwitchFocus() {

        let nextFocusedObj: AnnObject;

        if (!this.focusedObj) {
            nextFocusedObj = this.annRectangle;
        } else if (this.focusedObj === this.annRectangle) {
            nextFocusedObj = this.annPointList[0];
        } else {
            const index = this.annPointList.findIndex(annObj => annObj === this.focusedObj);
            nextFocusedObj = index === 3 ? this.annRectangle : this.annPointList[index + 1];
        }

        this.onChildSelected(nextFocusedObj);
    }

    onDeleteChildren() {
        this.deleteObject(this.annRectangle);

        this.deleteObject(this.annTextIndicator);

        this.annPointList.forEach(annObj => this.deleteObject(annObj));
        this.annPointList = [];
    }

    getSurroundPointList(): Point[] {

        const pointList = [];

        for (let i = 0; i < 4; i++) {
            pointList.push(this.annPointList[i].getPosition());
        }

        return pointList;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private onPointDragged(draggedObj: any, deltaX: number, deltaY: number) {

        const pointList = this.getSurroundPointList();
        
        if (draggedObj === this.annPointList[0]) {
            pointList[1].y = pointList[0].y;
            pointList[3].x = pointList[0].x;
        } else if (draggedObj === this.annPointList[1]) {
            pointList[0].y = pointList[1].y;
            pointList[2].x = pointList[1].x;
        } else if (draggedObj === this.annPointList[2]) {
            pointList[3].y = pointList[2].y;
            pointList[1].x = pointList[2].x;
        } else if (draggedObj === this.annPointList[3]) {
            pointList[2].y = pointList[3].y;
            pointList[0].x = pointList[3].x;
        }

        this.redraw(pointList);
    }

    private onTextDragged(deltaX: number, deltaY: number) {
        this.annTextIndicator.onDrag(deltaX, deltaY);
    }

    private redraw(pointList: Point[]) {

        for (let i = 0; i < 4; i++) {
            this.annPointList[i].onMove(pointList[i]);
        }

        this.annRectangle.redraw(pointList[0], pointList[2].x - pointList[0].x, pointList[2].y - pointList[0].y);

        this.annTextIndicator.redrawArrow();
    }
}