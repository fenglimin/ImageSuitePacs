import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBaseCurve } from "../base-object/ann-base-curve";
import { AnnTextIndicator } from "./ann-text-indicator"

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
