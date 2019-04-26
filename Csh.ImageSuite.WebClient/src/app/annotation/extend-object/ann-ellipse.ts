import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnPoint } from "./ann-point";
import { AnnBaseEllipse } from "../base-object/ann-base-ellipse";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnTextIndicator } from "./ann-text-indicator"

export class AnnEllipse extends AnnExtendObject {

    private annEllipse: AnnBaseEllipse;
    private annCenterPoint: AnnPoint;
    private annPointList = new Array<AnnPoint>();
    private annTextIndicator: AnnTextIndicator;

    private widthSet = false;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IAnnotationObject

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        const imagePoint = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (!this.annCenterPoint) {
                this.annCenterPoint = new AnnPoint(this, this.imageViewer);
                this.annCenterPoint.onCreate(imagePoint);
            } else {

                if (!this.widthSet) {
                    this.widthSet = true;
                    return;
                }

                this.focusedObj = this.annEllipse;
                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annCenterPoint) {

                const centerPoint = this.annCenterPoint.getPosition();
                const topPoint = { x: centerPoint.x, y: centerPoint.y * 2 - imagePoint.y };
                const bottomPoint = { x: centerPoint.x, y: imagePoint.y };
                const leftPoint = { x: centerPoint.x * 2 - imagePoint.x, y: centerPoint.y };
                const rightPoint = { x: imagePoint.x, y: centerPoint.y };

                if (this.annEllipse) {

                    if (this.widthSet) {
                        const width = this.annEllipse.getWidth();
                        leftPoint.x = centerPoint.x - width;
                        rightPoint.x = centerPoint.x + width;
                    } 

                    this.redraw(topPoint, bottomPoint, leftPoint, rightPoint);
                } else {

                    
                    this.annEllipse = new AnnBaseEllipse(this, centerPoint, imagePoint.x - centerPoint.x, imagePoint.y - centerPoint.y, this.imageViewer);

                    const annTopPoint = new AnnPoint(this, this.imageViewer);
                    annTopPoint.onCreate(topPoint);
                    this.annPointList.push(annTopPoint);

                    const annRightPoint = new AnnPoint(this, this.imageViewer);
                    annRightPoint.onCreate(rightPoint);
                    this.annPointList.push(annRightPoint);

                    const annBottomPoint = new AnnPoint(this, this.imageViewer);
                    annBottomPoint.onCreate(bottomPoint);
                    this.annPointList.push(annBottomPoint);

                    const annLeftPoint = new AnnPoint(this, this.imageViewer);
                    annLeftPoint.onCreate(leftPoint);
                    this.annPointList.push(annLeftPoint);

                    this.annCenterPoint.onLevelUp();

                    this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
                    this.annTextIndicator.onCreate(topPoint, this.annEllipse.getAreaString());
                }
            }
        }
    }


    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annCenterPoint || this.focusedObj === this.annEllipse) {
            this.onTranslate(deltaX, deltaY);
        } else if (this.annPointList.some(annObj => annObj === this.focusedObj)) {
            this.onPointDragged(this.focusedObj, deltaX, deltaY);
        } else if (this.annTextIndicator === this.focusedObj) {
            this.onTextDragged(deltaX, deltaY);
        }
    }

    onRotate(angle: number) {
        this.annTextIndicator.onRotate(angle);
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

    private redraw(topPoint: Point, bottomPoint: Point, leftPoint: Point, rightPoint: Point) {
        this.annEllipse.setWidth(rightPoint.x - topPoint.x);
        this.annEllipse.setHeight(topPoint.y - rightPoint.y);
        
        this.annPointList[0].onMove(topPoint);
        this.annPointList[1].onMove(rightPoint);
        this.annPointList[2].onMove(bottomPoint);
        this.annPointList[3].onMove(leftPoint);

        this.annTextIndicator.redrawArrow();
        this.annTextIndicator.setText(this.annEllipse.getAreaString());
    }

    private onTextDragged(deltaX: number, deltaY: number) {
        this.annTextIndicator.onDrag(deltaX, deltaY);
    }

    private onPointDragged(draggedObj: any, deltaX: number, deltaY: number) {

        const topPoint = this.annPointList[0].getPosition();
        const leftPoint = this.annPointList[3].getPosition();
        const rightPoint = this.annPointList[1].getPosition();
        const bottomPoint = this.annPointList[2].getPosition();

        if (draggedObj === this.annPointList[0]) {
            topPoint.y += deltaY;
            bottomPoint.y -= deltaY;
        } else if (draggedObj === this.annPointList[3]) {
            leftPoint.x += deltaX;
            rightPoint.x -= deltaX;
        } else if (draggedObj === this.annPointList[1]) {
            leftPoint.x -= deltaX;
            rightPoint.x += deltaX;
        } else if (draggedObj === this.annPointList[2]) {
            topPoint.y -= deltaY;
            bottomPoint.y += deltaY;
        }

        this.redraw(topPoint, bottomPoint, leftPoint, rightPoint);
    }
}