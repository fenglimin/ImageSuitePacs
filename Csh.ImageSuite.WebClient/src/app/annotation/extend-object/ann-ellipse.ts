import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnPoint } from "./ann-point";
import { AnnBaseEllipse } from "../base-object/ann-base-ellipse";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnSerialize } from "../ann-serialize";

export class AnnEllipse extends AnnExtendObject {

    private annBaseEllipse: AnnBaseEllipse;
    private annCenterPoint: AnnPoint;
    private annPointList = new Array<AnnPoint>();
    private annTextIndicator: AnnTextIndicator;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {
        const imagePoint = AnnTool.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (!this.annCenterPoint) {
                this.annCenterPoint = new AnnPoint(this, this.imageViewer);
                this.annCenterPoint.onCreate(imagePoint);
            } else {
                this.focusedObj = this.annBaseEllipse;
                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annCenterPoint) {
                const centerPoint = this.annCenterPoint.getPosition();
                const pointList = AnnTool.pointListFromEllipse(centerPoint, imagePoint.x - centerPoint.x, imagePoint.y - centerPoint.y);

                if (this.annBaseEllipse) {
                    this.redraw(pointList);
                } else {
                    pointList.push(undefined);  // Arrow start
                    pointList.push(pointList[0]); // Arrow end
                    this.createFromPointList(pointList);
                }
            }
        }
    }

    onCreate(centerPoint: Point, width: number, height: number, showIndicator: boolean, arrowStartPoint: Point = undefined, arrowEndPoint: Point = undefined) {
        this.annCenterPoint = new AnnPoint(this, this.imageViewer);
        this.annCenterPoint.onCreate(centerPoint);

        const pointList = AnnTool.pointListFromEllipse(centerPoint, width, height);
        pointList.push(arrowStartPoint);
        pointList.push(arrowEndPoint);
        this.createFromPointList(pointList);
    }

    onCreateFromConfig(config: any) {
        this.onCreate(config.centerPoint, config.width, config.height, true, config.textIndicator.startPoint, config.textIndicator.endPoint);
        this.focusedObj = this.annBaseEllipse;
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnEllipse");
        annSerialize.writeInteger(this.annBaseEllipse.getWidth(), 4);
        annSerialize.writeInteger(this.annBaseEllipse.getHeight(), 4);
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);
        annSerialize.writeIntegerPoint(this.annCenterPoint.getPosition());

        this.annTextIndicator.onSave(annSerialize);
        annSerialize.writeInteger(1, 1);
        annSerialize.writeDouble(0);
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annCenterPoint || this.focusedObj === this.annBaseEllipse) {
            this.onTranslate(deltaX, deltaY);
        } else if (this.annPointList.some(annObj => annObj === this.focusedObj)) {
            this.onDragPoint(this.focusedObj, deltaX, deltaY);
        } else if (this.annTextIndicator === this.focusedObj) {
            this.annTextIndicator.onDrag(deltaX, deltaY);
        }
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

    private redraw(pointList: Point[]) {
        if (pointList.length !== 4 || this.annPointList.length !== 4) {
            alert("Internal error in AnnEllipse.redraw()");
            return;
        }

        this.annBaseEllipse.setWidth(pointList[1].x - pointList[0].x);
        this.annBaseEllipse.setHeight(pointList[1].y - pointList[0].y);

        for (let i = 0; i < 4; i ++) {
            this.annPointList[i].onMove(pointList[i]);
        }

        this.annTextIndicator.redrawArrow();
        this.annTextIndicator.setText(this.annBaseEllipse.getAreaString());
    }

    private createFromPointList(pointList: Point[]) {
        if (pointList.length !== 6 || !this.annCenterPoint) {
            alert("Internal error in AnnEllipse.createFromPointList()");
            return;
        }

        for (let i = 0; i < 4; i++) {
            const annPoint = new AnnPoint(this, this.imageViewer);
            annPoint.onCreate(pointList[i]);
            this.annPointList.push(annPoint);
        }

        const centerPoint = this.annCenterPoint.getPosition();
        this.annBaseEllipse = new AnnBaseEllipse(this, centerPoint, pointList[1].x - centerPoint.x, pointList[2].y - centerPoint.y, this.imageViewer);
        this.annBaseEllipse.onLevelDown();

        this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
        this.annTextIndicator.onCreate(this.annBaseEllipse.getAreaString(), pointList[5], pointList[4]);
    }

    private onDragPoint(draggedObj: any, deltaX: number, deltaY: number) {
        const pointList = this.getSurroundPointList();

        if (draggedObj === this.annPointList[0]) {
            // Top point
            pointList[0].y += deltaY;
            pointList[2].y -= deltaY;
        } else if (draggedObj === this.annPointList[1]) {
            // Right point
            pointList[1].x += deltaX;
            pointList[3].x -= deltaX;
        } else if (draggedObj === this.annPointList[2]) {
            // Bottom point
            pointList[0].y -= deltaY;
            pointList[2].y += deltaY;
        } else if (draggedObj === this.annPointList[3]) {
            // Left point
            pointList[1].x -= deltaX;
            pointList[3].x += deltaX;
        }
        this.redraw(pointList);
    }
}