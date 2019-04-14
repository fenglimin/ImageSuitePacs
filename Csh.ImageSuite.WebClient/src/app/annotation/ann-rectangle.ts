import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBasePoint } from "./base-object/ann-base-point";
import { AnnBaseLine } from "./base-object/ann-base-line";

export class AnnRectangle extends AnnObject implements IAnnotationObject {
    
    /*
         P0                   L0                    P1  
            --------------------------------------
            |                                    |
         L1 |                                    |  L2
            |                                    |
            --------------------------------------
         P2                   L3                    P3                

    */


    private annLineList = new Array<AnnBaseLine>();
    private annPointList = new Array<AnnBasePoint>();

    private topLeftPoint: Point;
    private width: number;
    private height: number;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);

        this.width = 0;
        this.height = 0;
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
                this.annLineList.forEach(annObj => annObj.onDrawEnded());

                this.focusedObj = this.annPointList[3];
                this.created = true;
                this.imageViewer.onAnnotationCreated(this);
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annPointList.length !== 0) {

                const topRightPoint = { x: point.x, y: this.topLeftPoint.y };
                const bottomLeftPoint = { x: this.topLeftPoint.x, y: point.y };

                if (this.annLineList.length === 4) {
                    this.redraw(this.topLeftPoint, topRightPoint, bottomLeftPoint, point);
                } else {

                    const annTopRightPoint = new AnnBasePoint(this, topRightPoint, this.imageViewer);
                    this.annPointList.push(annTopRightPoint);

                    const annBottomLeftPoint = new AnnBasePoint(this, bottomLeftPoint, this.imageViewer);
                    this.annPointList.push(annBottomLeftPoint);

                    const annBottomRightPoint = new AnnBasePoint(this, point, this.imageViewer);
                    this.annPointList.push(annBottomRightPoint);

                    const annTopLine = new AnnBaseLine(this, this.topLeftPoint, topRightPoint, this.imageViewer);
                    this.annLineList.push(annTopLine);

                    const annLeftLine = new AnnBaseLine(this, this.topLeftPoint, bottomLeftPoint, this.imageViewer);
                    this.annLineList.push(annLeftLine);

                    const annRightLine = new AnnBaseLine(this, topRightPoint, point, this.imageViewer);
                    this.annLineList.push(annRightLine);

                    const annBottomLine = new AnnBaseLine(this, bottomLeftPoint, point, this.imageViewer);
                    this.annLineList.push(annBottomLine);

                    // Make sure the start point is on the top the line So that we can easily select it for moving
                    if (this.annPointList[0].jcCenterPoint) {
                        this.annPointList[0].jcCenterPoint.up();
                    }
                }
            }
        }
    }


    onDrag(deltaX: number, deltaY: number) {

        if (this.annLineList.some(annObj => annObj === this.focusedObj)) {
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
            this.focusedObj = this.annLineList[0];
        }

        this.annLineList.forEach(annObj => annObj.onSelect(selected, this.focusedObj === annObj));
        this.annPointList.forEach(annObj => annObj.onSelect(selected, this.focusedObj === annObj));

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annLineList.forEach(annObj => annObj.onTranslate(deltaX, deltaY));
        this.annPointList.forEach(annObj => annObj.onTranslate(deltaX, deltaY));
    }

    onScale() {
        this.annLineList.forEach(annObj => annObj.onScale());
        this.annPointList.forEach(annObj => annObj.onScale());
    }

    onFlip(vertical: boolean) {
        this.annLineList.forEach(annObj => annObj.onFlip(vertical));
        this.annPointList.forEach(annObj => annObj.onFlip(vertical));
    }

    onSwitchFocus() {
        
        if (!this.focusedObj || this.annLineList.some(annObj => annObj === this.focusedObj)) {
            this.onChildSelected(this.annPointList[0]);
        } else {
            const index = this.annPointList.findIndex(annObj => annObj === this.focusedObj);
            this.onChildSelected(index === 3 ? this.annLineList[0] : this.annPointList[index + 1]);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private onPointDragged(draggedObj: any, deltaX: number, deltaY: number) {

        const topLeftPoint = this.annPointList[0].getPosition();
        const topRightPoint = this.annPointList[1].getPosition();
        const bottomLeftPoint = this.annPointList[2].getPosition();
        const bottomRightPoint = this.annPointList[3].getPosition();

        if (draggedObj === this.annPointList[0]) {
            topRightPoint.y = topLeftPoint.y;
            bottomLeftPoint.x = topLeftPoint.x;
        } else if (draggedObj === this.annPointList[1]) {
            topLeftPoint.y = topRightPoint.y;
            bottomRightPoint.x = topRightPoint.x;
        } else if (draggedObj === this.annPointList[2]) {
            bottomRightPoint.y = bottomLeftPoint.y;
            topLeftPoint.x = bottomLeftPoint.x;
        } else if (draggedObj === this.annPointList[3]) {
            bottomLeftPoint.y = bottomRightPoint.y;
            topRightPoint.x = bottomRightPoint.x;
        }

        this.redraw(topLeftPoint, topRightPoint, bottomLeftPoint, bottomRightPoint);
    }

    private redraw(topLeftPoint: Point, topRightPoint: Point, bottomLeftPoint: Point, bottomRightPoint: Point) {

        this.annPointList[0].moveTo(topLeftPoint);
        this.annPointList[1].moveTo(topRightPoint);
        this.annPointList[2].moveTo(bottomLeftPoint);
        this.annPointList[3].moveTo(bottomRightPoint);

        this.annLineList[0].moveStartTo(topLeftPoint);
        this.annLineList[0].moveEndTo(topRightPoint);

        this.annLineList[1].moveStartTo(topLeftPoint);
        this.annLineList[1].moveEndTo(bottomLeftPoint);

        this.annLineList[2].moveStartTo(topRightPoint);
        this.annLineList[2].moveEndTo(bottomRightPoint);

        this.annLineList[3].moveStartTo(bottomLeftPoint);
        this.annLineList[3].moveEndTo(bottomRightPoint);
    }
}