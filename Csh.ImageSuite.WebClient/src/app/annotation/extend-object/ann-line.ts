import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnSerialize } from "../ann-serialize";
import { AnnConfigLoader } from "../ann-config-loader";

export class AnnLine extends AnnExtendObject {
    
    private annBaseLine: AnnBaseLine;
    private annStartPoint: AnnPoint;
    private annEndPoint: AnnPoint;

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

            if (!this.annStartPoint) {
                this.annStartPoint = new AnnPoint(this, this.imageViewer);
                this.annStartPoint.onCreate(imagePoint);
            } else {
                this.focusedObj = this.annBaseLine;

                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annStartPoint) {
                if (this.annBaseLine) {
                    this.annBaseLine.onMoveEndPoint(imagePoint);
                    this.annEndPoint.onMove(imagePoint);
                } else {
                    this.annEndPoint = new AnnPoint(this, this.imageViewer);
                    this.annEndPoint.onCreate(imagePoint);
                    this.annBaseLine = new AnnBaseLine(this, this.annStartPoint.getPosition(), imagePoint, this.imageViewer);

                    // Make sure the start point is on the top the line So that we can easily select it for moving
                    this.annStartPoint.onLevelUp();
                }
            }
        }
    }

    onCreate(startPoint: Point, endPoint: Point) {
        this.onDeleteChildren();

        this.annBaseLine = new AnnBaseLine(this, startPoint, endPoint, this.imageViewer);
        this.annStartPoint = new AnnPoint(this, this.imageViewer);
        this.annStartPoint.onCreate(startPoint);
        this.annEndPoint = new AnnPoint(this, this.imageViewer);
        this.annEndPoint.onCreate(endPoint);

        this.focusedObj = this.annBaseLine;
    }

    onLoad(annSerialize: AnnSerialize) {
        const config = AnnConfigLoader.loadLine(annSerialize);
        this.onCreate(config.startPoint, config.endPoint);
        this.focusedObj = this.annBaseLine;
        this.onSelect(config.selected, config.selected);
        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnLineEx");
        annSerialize.writeNumber(33, 4);
        annSerialize.writeNumber(1, 4);
        annSerialize.writeNumber(1, 1);

        this.annBaseLine.onSave(annSerialize);
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annStartPoint) {
            this.onDragStartPoint(deltaX, deltaY);
        } else if (this.focusedObj === this.annEndPoint) {
            this.onDragEndPoint(deltaX, deltaY);
        }else {
            this.onTranslate(deltaX, deltaY);
        }
    }

    onMoveStartPoint(point: Point) {
        this.annBaseLine.onMoveStartPoint(point);
        this.annStartPoint.onMove(point);
    }

    onMoveEndPoint(point: Point) {
        this.annBaseLine.onMoveEndPoint(point);
        this.annEndPoint.onMove(point);
    }

    getStartPosition(): Point {
        return this.annBaseLine.getStartPosition();
    }

    getEndPosition(): Point {
        return this.annBaseLine.getEndPosition();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    getBaseLine(): AnnBaseLine {
        return this.annBaseLine;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private onDragStartPoint(deltaX: number, deltaY: number) {
        this.annStartPoint.onTranslate(deltaX, deltaY);
        const point = this.annStartPoint.getPosition();
        this.annBaseLine.onMoveStartPoint(point);
    }

    private onDragEndPoint(deltaX: number, deltaY: number) {
        this.annEndPoint.onTranslate(deltaX, deltaY);
        const point = this.annEndPoint.getPosition();
        this.annBaseLine.onMoveEndPoint(point);
    }
}