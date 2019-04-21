import { Point, Rectangle } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBaseRectangle } from "../base-object/ann-base-rectangle";
import { AnnTextIndicator } from "./ann-text-indicator"

export class AnnRectangle extends AnnExtendObject {
    
    /*
         P0                                         P1  
            --------------------------------------
            |                                    |
            |                                    |  
            |                                    |
            --------------------------------------
         P3                                         P2                

    */

    private annPointList = new Array<AnnPoint>();
    private annRectangle: AnnBaseRectangle;
    private annTextIndicator: AnnTextIndicator;


    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
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
                const annTopLeftPoint = new AnnPoint(this, this.imageViewer);
                annTopLeftPoint.onCreate(imagePoint);
                this.annPointList.push(annTopLeftPoint);
            } else {
                this.focusedObj = this.annRectangle;
                this.onDrawEnded();
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

                    for (let i = 1; i < 4; i ++) {
                        const annPoint = new AnnPoint(this, this.imageViewer);
                        annPoint.onCreate(pointList[i]);
                        this.annPointList.push(annPoint);
                    }

                    this.annRectangle = new AnnBaseRectangle(this, topLeftPoint, imagePoint.x - topLeftPoint.x, imagePoint.y - topLeftPoint.y, this.imageViewer);
                    this.annRectangle.onLevelDown();

                    const delta = 30 / this.image.getScaleValue();
                    const arrowStart = { x: imagePoint.x + delta, y: imagePoint.y - delta};
                    this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
                    this.annTextIndicator.onCreate(arrowStart, imagePoint, this.annRectangle.getAreaString());
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

        this.annRectangle.redraw(new Rectangle(pointList[0].x, pointList[0].y, pointList[2].x - pointList[0].x, pointList[2].y - pointList[0].y));
        this.annTextIndicator.redrawArrow();
        this.annTextIndicator.setText(this.annRectangle.getAreaString());
    }
}