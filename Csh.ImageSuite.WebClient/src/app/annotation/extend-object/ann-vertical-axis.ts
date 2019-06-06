import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnLine } from "./ann-line";
import { AnnSerialize } from "../ann-serialize";

export class AnnVerticalAxis extends AnnExtendObject {

    private annBaseLine: AnnBaseLine;
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

            if (this.annBaseLine) {
                this.createCenterPoint();
                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            this.redraw(imagePoint);
        }
    }

    onCreate(centerPoint: Point) {
        this.onDeleteChildren();

        this.redraw(centerPoint);
        this.createCenterPoint();
    }

    onCreateFromConfig(config: any) {
        const centerPoint = AnnTool.centerPoint(config.startPoint, config.endPoint);
        this.onCreate(centerPoint);
        this.focusedObj = this.annBaseLine;
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnVAxis");
        annSerialize.writeInteger(27, 4);
        annSerialize.writeInteger(1, 4);
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);

        annSerialize.writeInteger(0, 4);  //initRotateCount

        this.annBaseLine.onSave(annSerialize);
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, 0);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private redraw(centerPoint: Point) {
        const startPoint = { x: centerPoint.x, y: 0 };
        const endPoint = { x: centerPoint.x, y: this.image.height() };

        if (this.annBaseLine) {
            this.annBaseLine.onMoveStartPoint(startPoint);
            this.annBaseLine.onMoveEndPoint(endPoint);
        } else {
            this.annBaseLine = new AnnBaseLine(this, startPoint, endPoint, this.imageViewer);
        }
    }

    private createCenterPoint() {
        const centerPoint = AnnTool.centerPoint(this.annBaseLine.getStartPosition(), this.annBaseLine.getEndPosition());
        this.annCenterPoint = new AnnPoint(this, this.imageViewer);
        this.annCenterPoint.onCreate(centerPoint);
    }
}