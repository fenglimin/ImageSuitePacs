import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBasePoint } from "./base-object/ann-base-point";
import { AnnBaseRectangle } from "./base-object/ann-base-rectangle";

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
    private annRectangle;

    private topLeftPoint: Point;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }     


    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        point = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (this.annPointList.length === 0) {
                this.topLeftPoint = point;
                const annTopLeftPoint = new AnnBasePoint(this, point, this.imageViewer);
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

                const topRightPoint = { x: point.x, y: this.topLeftPoint.y };
                const bottomLeftPoint = { x: this.topLeftPoint.x, y: point.y };

                if (this.annRectangle) {
                    this.redraw(this.topLeftPoint, topRightPoint, bottomLeftPoint, point);
                } else {

                    this.annRectangle = new AnnBaseRectangle(this, this.topLeftPoint, point.x - this.topLeftPoint.x, point.y - this.topLeftPoint.y, this.imageViewer);

                    const annTopRightPoint = new AnnBasePoint(this, topRightPoint, this.imageViewer);
                    this.annPointList.push(annTopRightPoint);

                    const annBottomRightPoint = new AnnBasePoint(this, point, this.imageViewer);
                    this.annPointList.push(annBottomRightPoint);

                    const annBottomLeftPoint = new AnnBasePoint(this, bottomLeftPoint, this.imageViewer);
                    this.annPointList.push(annBottomLeftPoint);
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

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annRectangle.onTranslate(deltaX, deltaY);
        this.annPointList.forEach(annObj => annObj.onTranslate(deltaX, deltaY));
    }

    onScale() {
        this.annRectangle.onScale();
        this.annPointList.forEach(annObj => annObj.onScale());
    }

    onFlip(vertical: boolean) {
        this.annRectangle.onFlip(vertical);
        this.annPointList.forEach(annObj => annObj.onFlip(vertical));
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

        this.annPointList.forEach(annObj => this.deleteObject(annObj));
        this.annPointList = [];
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private onPointDragged(draggedObj: any, deltaX: number, deltaY: number) {

        const topLeftPoint = this.annPointList[0].getPosition();
        const topRightPoint = this.annPointList[1].getPosition();
        const bottomRightPoint = this.annPointList[2].getPosition();
        const bottomLeftPoint = this.annPointList[3].getPosition();

        if (draggedObj === this.annPointList[0]) {
            topRightPoint.y = topLeftPoint.y;
            bottomLeftPoint.x = topLeftPoint.x;
        } else if (draggedObj === this.annPointList[1]) {
            topLeftPoint.y = topRightPoint.y;
            bottomRightPoint.x = topRightPoint.x;
        } else if (draggedObj === this.annPointList[2]) {
            bottomLeftPoint.y = bottomRightPoint.y;
            topRightPoint.x = bottomRightPoint.x;
        } else if (draggedObj === this.annPointList[3]) {
            bottomRightPoint.y = bottomLeftPoint.y;
            topLeftPoint.x = bottomLeftPoint.x;
        }

        this.redraw(topLeftPoint, topRightPoint, bottomLeftPoint, bottomRightPoint);
    }

    private redraw(topLeftPoint: Point, topRightPoint: Point, bottomLeftPoint: Point, bottomRightPoint: Point) {

        this.annPointList[0].moveTo(topLeftPoint);
        this.annPointList[1].moveTo(topRightPoint);
        this.annPointList[2].moveTo(bottomRightPoint);
        this.annPointList[3].moveTo(bottomLeftPoint);

        this.annRectangle.redraw(topLeftPoint, bottomRightPoint.x - topLeftPoint.x, bottomRightPoint.y - topLeftPoint.y);
    }
}