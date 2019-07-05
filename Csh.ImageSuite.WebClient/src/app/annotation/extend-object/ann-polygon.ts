import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBasePolygon } from "../base-object/ann-base-polygon";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnSerialize } from "../ann-serialize";

export class AnnPolygon extends AnnExtendObject {

    private annBasePolygon: AnnBasePolygon;
    private annPoint: AnnPoint;
    private annTextIndicator: AnnTextIndicator;
    private moveToCreate = true;

    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
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

            if (this.annObjList.length === 0) {
                this.annBasePolygon = new AnnBasePolygon(this, [[imagePoint.x, imagePoint.y]], this.imageViewer);
                this.createNewPoint(imagePoint);
            }
            this.moveToCreate = true;
        } else if (mouseEventType === MouseEventType.DblClick) {

            // ********** Mouse down was called two times before calling dbclick, need to delete the additional point
            const length = this.annObjList.length;
            if (length > 1) {
                this.onDeleteChild(this.annObjList[length - 1]);
            }

            this.createNewPoint(imagePoint);

            this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
            this.annTextIndicator.onCreate(this.annBasePolygon.getAreaString(), imagePoint);

            this.annBasePolygon.setClosed(true);
            this.focusedObj = this.annBasePolygon;

            if (!this.parentObj) {
                this.onDrawEnded();
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annObjList.length !== 0) {
                if (this.moveToCreate) {
                    this.moveToCreate = false;

                    this.createNewPoint(imagePoint);
                    this.annBasePolygon.addPoint(imagePoint);
                } else {
                    this.annBasePolygon.updateLastPoint(imagePoint);
                    this.annPoint.onMove(imagePoint);
                }
            }
        }
    }

    onCreate(pointList: any, showIndicator: boolean, arrowStartPoint: Point = undefined, arrowEndPoint: Point = undefined) {
        this.annBasePolygon = new AnnBasePolygon(this, [], this.imageViewer);

        const dataList = [];
        const length = pointList.length;
        for (let i = 0; i < length; i ++) {
            dataList.push([pointList[i].x, pointList[i].y]);
            this.createNewPoint(pointList[i]);
        }
        this.annBasePolygon.setPointList(dataList);
        this.annBasePolygon.setClosed(true);

        if (showIndicator) {
            this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
            this.annTextIndicator.onCreate(this.annBasePolygon.getAreaString(), arrowEndPoint, arrowStartPoint);
        }
    }

    onLoadConfig(annSerialize: AnnSerialize) {
        return annSerialize.loadPolygon();
    }

    onCreateFromConfig(config: any) {
        this.onCreate(config.pointList, true, config.textIndicator.startPoint, config.textIndicator.endPoint);
        this.focusedObj = this.annBasePolygon;
    }

    onSave(annSerialize: AnnSerialize) {
        this.annBasePolygon.saveBasicInfo(annSerialize, this.annDefData);
        this.annBasePolygon.onSave(annSerialize);
        this.annTextIndicator.onSave(annSerialize);
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annBasePolygon) {
            this.onTranslate(deltaX, deltaY);
        } else if (this.annTextIndicator === this.focusedObj) {
            this.annTextIndicator.onDrag(deltaX, deltaY);
        } else {
            this.focusedObj.onTranslate(deltaX, deltaY);
            const index = this.annObjList.findIndex(annObj => annObj === this.focusedObj);
            this.annBasePolygon.updatePoint(index - 1, this.focusedObj.getPosition());

            if (this.annTextIndicator) {
                this.annTextIndicator.redrawArrow();
                this.annTextIndicator.setText(this.annBasePolygon.getAreaString());
            }
        }
    }

    getSurroundPointList(): Point[] {
        
        const pointList = [];

        for (let i = 1; i < this.annObjList.length - 1; i++) {
            pointList.push(this.annObjList[i].getPosition());
        }

        return pointList;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private createNewPoint(imagePoint: Point) {
        this.annPoint = new AnnPoint(this, this.imageViewer);
        this.annPoint.onCreate(imagePoint);
    }

}
