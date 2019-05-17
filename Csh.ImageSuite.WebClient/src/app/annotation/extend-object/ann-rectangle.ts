import { Point, Rectangle, MouseEventType, PositionInRectangle } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBaseRectangle } from "../base-object/ann-base-rectangle";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnSerialize } from "../ann-serialize";
import { AnnConfigLoader } from "../ann-config-loader";

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
    private annBaseRectangle: AnnBaseRectangle;
    private annTextIndicator: AnnTextIndicator;


    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }     

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        const imagePoint = AnnTool.screenToImage(point, this.image.transformMatrix);
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
                this.focusedObj = this.annBaseRectangle;
                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annPointList.length !== 0) {

                const pointList = [];
                
                const topLeftPoint = this.annPointList[0].getPosition();
                pointList.push(topLeftPoint);
                pointList.push({ x: imagePoint.x, y: topLeftPoint.y });
                pointList.push(imagePoint);
                pointList.push({ x: topLeftPoint.x, y: imagePoint.y });
                

                if (this.annBaseRectangle) {
                    this.redraw(pointList);
                } else {

                    for (let i = 1; i < 4; i ++) {
                        const annPoint = new AnnPoint(this, this.imageViewer);
                        annPoint.onCreate(pointList[i]);
                        this.annPointList.push(annPoint);
                    }

                    this.annBaseRectangle = new AnnBaseRectangle(this, topLeftPoint, imagePoint.x - topLeftPoint.x, imagePoint.y - topLeftPoint.y, this.imageViewer);
                    this.annBaseRectangle.onLevelDown("bottom");

                    this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
                    this.annTextIndicator.onCreate(this.annBaseRectangle.getAreaString(), topLeftPoint);
                }
            }
        }
    }

    onCreate(topLeftPoint: Point, width: number, height: number, showIndicator: boolean, arrowStartPoint: Point = undefined, arrowEndPoint: Point = undefined ) {
        const pointList = AnnTool.pointListFrom(topLeftPoint, PositionInRectangle.TopLeft, width, height);
        if (arrowStartPoint) {
            pointList.push(arrowStartPoint);
        }

        if (arrowEndPoint) {
            pointList.push(arrowEndPoint);
        }

        this.createFromPointList(pointList, showIndicator);
        this.focusedObj = this.annBaseRectangle;
    }

    onLoad(annSerialize: AnnSerialize) {
        const config = AnnConfigLoader.loadRectangle(annSerialize);
        this.onCreate(config.baseRect.topLeftPoint, config.baseRect.width, config.baseRect.height, true, config.textIndicator.startPoint, config.textIndicator.endPoint);
        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnSquare");
        annSerialize.writeNumber(2, 4);
        annSerialize.writeNumber(1, 4);
        annSerialize.writeNumber(1, 1);

        this.annBaseRectangle.onSave(annSerialize);
        this.annTextIndicator.onSave(annSerialize);
    }

    onDrag(deltaX: number, deltaY: number) {

        if (this.annBaseRectangle === this.focusedObj) {
            this.onTranslate(deltaX, deltaY);
        } else if (this.annPointList.some(annObj => annObj === this.focusedObj)) {
            this.focusedObj.onTranslate(deltaX, deltaY);
            this.onPointDragged(this.focusedObj, deltaX, deltaY);
        } else if (this.annTextIndicator === this.focusedObj) {
            this.onTextDragged(deltaX, deltaY);
        }
    }

    getSurroundPointList(): Point[] {

        const pointList = [];

        for (let i = 0; i < 4; i++) {
            pointList.push(this.annPointList[i].getPosition());
        }

        return pointList;
    }

    getRect(): Rectangle {
        return this.annBaseRectangle.getRect();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    redraw(pointList: Point[]) {

        for (let i = 0; i < 4; i++) {
            this.annPointList[i].onMove(pointList[i]);
        }

        this.annBaseRectangle.redraw(new Rectangle(pointList[0].x, pointList[0].y, pointList[2].x - pointList[0].x, pointList[2].y - pointList[0].y));

        if (this.annTextIndicator) {
            this.annTextIndicator.redrawArrow();
            this.annTextIndicator.setText(this.annBaseRectangle.getAreaString());
        }
    }

    showBorder(show: boolean) {
        this.annBaseRectangle.setVisible(show);
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

    private createFromPointList(pointList: Point[], showIndicator: boolean) {
        for (let i = 0; i < 4; i++) {
            const annPoint = new AnnPoint(this, this.imageViewer);
            annPoint.onCreate(pointList[i]);
            this.annPointList.push(annPoint);
        }

        this.annBaseRectangle = new AnnBaseRectangle(this, pointList[0], pointList[2].x - pointList[0].x, pointList[2].y - pointList[0].y, this.imageViewer);
        this.annBaseRectangle.onLevelDown("bottom");

        if (showIndicator) {
            this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
            const arrowStartPoint = pointList.length >= 5 ? pointList[4] : undefined;
            const arrowEndPoint = pointList.length === 6 ? pointList[5] : pointList[0];
            this.annTextIndicator.onCreate(this.annBaseRectangle.getAreaString(), arrowEndPoint, arrowStartPoint);
        }
    }
}