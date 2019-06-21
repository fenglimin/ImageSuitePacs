import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBasePolygon } from "../base-object/ann-base-polygon";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnSerialize } from "../ann-serialize";

export class AnnFreeArea extends AnnExtendObject {

    private annBasePolygon: AnnBasePolygon;

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

            if (!this.annBasePolygon) {
                this.annBasePolygon = new AnnBasePolygon(this, [[imagePoint.x, imagePoint.y]], this.imageViewer);
            }
        } else if (mouseEventType === MouseEventType.DblClick) {

            this.annBasePolygon.setClosed(true);
            this.focusedObj = this.annBasePolygon;

            if (!this.parentObj) {
                this.onDrawEnded();
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annBasePolygon) {
                this.annBasePolygon.addPoint(imagePoint);
            }
        }
    }

    onCreate(pointList: any, freeArea: boolean = false) {
        this.annBasePolygon = new AnnBasePolygon(this, [], this.imageViewer, freeArea);

        const dataList = [];
        const length = pointList.length;
        for (let i = 0; i < length; i++) {
            dataList.push([pointList[i].x, pointList[i].y]);
        }
        this.annBasePolygon.setPointList(dataList);
        this.annBasePolygon.setClosed(true);
    }

    onCreateFromConfig(config: any) {
        this.onCreate(config.pointList, true);
        this.focusedObj = this.annBasePolygon;
    }

    onSave(annSerialize: AnnSerialize) {
        this.annBasePolygon.onSave(annSerialize);
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annBasePolygon) {
            this.onTranslate(deltaX, deltaY);
        } else {
            this.focusedObj.onTranslate(deltaX, deltaY);
            const index = this.annObjList.findIndex(annObj => annObj === this.focusedObj);
            this.annBasePolygon.updatePoint(index - 1, this.focusedObj.getPosition());

        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions


}
