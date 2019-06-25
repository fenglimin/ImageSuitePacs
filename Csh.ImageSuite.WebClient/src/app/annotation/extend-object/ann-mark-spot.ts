import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnSerialize } from "../ann-serialize";

export class AnnMarkSpot extends AnnExtendObject {

    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {
        const imagePoint = AnnTool.screenToImage(point, this.image.transformMatrix);
        if(mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            this.createNewPoint(imagePoint);
        } else if (mouseEventType === MouseEventType.DblClick) {

            // ********** Mouse down was called two times before calling dbclick, need to delete the additional point
            const length = this.annObjList.length;
            if (length > 1) {
                this.onDeleteChild(this.annObjList[length - 1]);
            }

            // Step the guide
            this.imageViewer.stepGuide();

            this.focusedObj = this.annObjList[0];

            if (!this.parentObj) {
                this.onDrawEnded();
            }
        }
    }

    onCreate(pointList: Point[]) {
        this.onDeleteChildren();

        for (let i = 0; i < pointList.length; i ++) {
            this.createNewPoint(pointList[i]);
        }
    }

    onLoadConfig(annSerialize: AnnSerialize) {
        return annSerialize.loadMarkSpot();
    }

    onCreateFromConfig(config: any) {
        this.onCreate(config.pointList);
        this.focusedObj = this.annObjList[0];
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnMarkSpot");
        annSerialize.writeInteger(36, 4);
        annSerialize.writeInteger(1, 4);
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);

        const count = this.annObjList.length;
        annSerialize.writeInteger(count, 4);

        for (let i = 0; i < count; i++) {
            annSerialize.writeIntegerPoint(this.annObjList[i].getPosition());
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        this.focusedObj.onTranslate(deltaX, deltaY);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private createNewPoint(imagePoint: Point) {
        const annPoint = new AnnPoint(this, this.imageViewer);
        annPoint.onCreate(imagePoint);
        annPoint.enableShowAlways(true);
        annPoint.setStepIndex(0);
    }

}
