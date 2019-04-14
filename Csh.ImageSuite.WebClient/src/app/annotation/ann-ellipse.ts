import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBasePoint } from "./base-object/ann-base-point";
import { AnnBaseEllipse } from "./base-object/ann-base-ellipse";

export class AnnEllipse extends AnnObject implements IAnnotationObject {

    private annEllipse: AnnBaseEllipse;
    private annCenterPoint: AnnBasePoint;
    private annPointList = new Array<AnnBasePoint>();

    private widthSet = false;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IAnnotationObject

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        point = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (!this.annCenterPoint) {
                this.annCenterPoint = new AnnBasePoint(this, point, this.imageViewer);
            } else {

                if (!this.widthSet) {
                    this.widthSet = true;
                    return;
                }

                this.annEllipse.onDrawEnded();
                this.annCenterPoint.onDrawEnded();
                this.annPointList.forEach(annObj => annObj.onDrawEnded());

                this.focusedObj = this.annCenterPoint;
                this.created = true;

                if (!this.parentObj) {
                    // Parent not set, this mean it is not a child of a parentObj annotion. 
                    this.imageViewer.onAnnotationCreated(this);
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annCenterPoint) {

                const centerPoint = this.annCenterPoint.getPosition();
                const topPoint = { x: centerPoint.x, y: centerPoint.y * 2 - point.y };
                const bottomPoint = { x: centerPoint.x, y: point.y };
                const leftPoint = { x: centerPoint.x * 2 - point.x, y: centerPoint.y };
                const rightPoint = { x: point.x, y: centerPoint.y };

                if (this.annEllipse) {

                    if (this.widthSet) {
                        const width = this.annEllipse.getWidth();
                        leftPoint.x = centerPoint.x - width;
                        rightPoint.x = centerPoint.x + width;
                    } 

                    this.redraw(topPoint, bottomPoint, leftPoint, rightPoint);
                } else {

                    
                    this.annEllipse = new AnnBaseEllipse(this, centerPoint, point.x - centerPoint.x, point.y - centerPoint.y, this.imageViewer);

                    const annTopPoint = new AnnBasePoint(this, topPoint, this.imageViewer);
                    this.annPointList.push(annTopPoint);

                    const annLeftPoint = new AnnBasePoint(this, leftPoint, this.imageViewer);
                    this.annPointList.push(annLeftPoint);

                    const annRightPoint = new AnnBasePoint(this, rightPoint, this.imageViewer);
                    this.annPointList.push(annRightPoint);

                    const annBottomPoint = new AnnBasePoint(this, bottomPoint, this.imageViewer);
                    this.annPointList.push(annBottomPoint);

                    this.annCenterPoint.up();
                }
            }
        }
    }


    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annCenterPoint || this.focusedObj === this.annEllipse) {
            this.onTranslate(deltaX, deltaY);
        } else if (this.annPointList.some(annObj => annObj === this.focusedObj)) {
            this.onPointDragged(this.focusedObj, deltaX, deltaY);
        }
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect AnnLine");
        this.selected = selected;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.annEllipse;
        }

        this.annEllipse.onSelect(selected, this.focusedObj === this.annEllipse);
        this.annCenterPoint.onSelect(selected, this.focusedObj === this.annCenterPoint);
        this.annPointList.forEach(annObj => annObj.onSelect(selected, this.focusedObj === annObj));

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onScale() {
        this.annEllipse.onScale();
        this.annCenterPoint.onScale();
        this.annPointList.forEach(annObj => annObj.onScale());
    }

    onFlip(vertical: boolean) {
        this.annEllipse.onFlip(vertical);
        this.annCenterPoint.onFlip(vertical);
        this.annPointList.forEach(annObj => annObj.onFlip(vertical));
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annEllipse.onTranslate(deltaX, deltaY);
        this.annCenterPoint.onTranslate(deltaX, deltaY);
        this.annPointList.forEach(annObj => annObj.onTranslate(deltaX, deltaY));
    }

    onSwitchFocus() {

        var nextFocusedObj: AnnObject;

        if (!this.focusedObj) {
            nextFocusedObj = this.annEllipse;
        } else if (this.focusedObj === this.annEllipse) {
            nextFocusedObj = this.annCenterPoint;
        }else {
            const index = this.annPointList.findIndex(annObj => annObj === this.focusedObj);
            nextFocusedObj = index === 3 ? this.annEllipse : this.annPointList[index + 1];
        }

        this.onChildSelected(nextFocusedObj);
    }

    onDeleteChildren() {
        this.deleteObject(this.annEllipse);
        this.deleteObject(this.annCenterPoint);
        this.annPointList.forEach(annObj => this.deleteObject(annObj));
        this.annPointList = [];
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    redraw(topPoint: Point, bottomPoint: Point, leftPoint: Point, rightPoint: Point) {
        this.annEllipse.setWidth(rightPoint.x - topPoint.x);
        this.annEllipse.setHeigth(topPoint.y - rightPoint.y);
        
        this.annPointList[0].moveTo(topPoint);
        this.annPointList[1].moveTo(leftPoint);
        this.annPointList[2].moveTo(rightPoint);
        this.annPointList[3].moveTo(bottomPoint);
    }

    private onPointDragged(draggedObj: any, deltaX: number, deltaY: number) {

        const topPoint = this.annPointList[0].getPosition();
        const leftPoint = this.annPointList[1].getPosition();
        const rightPoint = this.annPointList[2].getPosition();
        const bottomPoint = this.annPointList[3].getPosition();

        if (draggedObj === this.annPointList[0]) {
            topPoint.y += deltaY;
            bottomPoint.y -= deltaY;
        } else if (draggedObj === this.annPointList[1]) {
            leftPoint.x += deltaX;
            rightPoint.x -= deltaX;
        } else if (draggedObj === this.annPointList[2]) {
            leftPoint.x -= deltaX;
            rightPoint.x += deltaX;
        } else if (draggedObj === this.annPointList[3]) {
            topPoint.y -= deltaY;
            bottomPoint.y += deltaY;
        }

        this.redraw(topPoint, bottomPoint, leftPoint, rightPoint);
    }
}