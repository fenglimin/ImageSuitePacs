import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnLine } from "./ann-line";

export class AnnVerticalAxis extends AnnExtendObject {

    private annLine: AnnBaseLine;
    private annCenterPoint: AnnPoint;

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

            if (this.annLine) {

                const centerPoint = AnnTool.centerPoint(this.annLine.getStartPosition(), this.annLine.getEndPosition());
                this.annCenterPoint = new AnnPoint(this, this.imageViewer);
                this.annCenterPoint.onCreate(centerPoint);

                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {

            const startPoint = { x: imagePoint.x, y: 0 };
            const endPoint = { x: imagePoint.x, y: this.image.height() };

            if (this.annLine) {
                this.annLine.onMoveStartPoint(startPoint);
                this.annLine.onMoveEndPoint(endPoint);
            } else {
                this.annLine = new AnnBaseLine(this, startPoint, endPoint, this.imageViewer);
            }
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, 0);
    }
}