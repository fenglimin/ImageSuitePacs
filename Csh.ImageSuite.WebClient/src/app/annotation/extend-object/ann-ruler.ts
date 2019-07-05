import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnLine } from "./ann-line";
import { AnnSerialize } from "../ann-serialize";

export class AnnRuler extends AnnExtendObject {
    private annLine: AnnLine;
    private annMiddlePoint: AnnPoint;
    private lineNodeA: AnnBaseLine;
    private lineNodeB: AnnBaseLine;
    private rulerNode = 15;
    private annTextIndicator: AnnTextIndicator;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }    

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        const imagePoint = AnnTool.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (!this.annLine) {
                this.annLine = new AnnLine(this, this.imageViewer);
                this.annLine.onMouseEvent(mouseEventType, point, null);
            } else {
                this.redraw(this.annLine.getStartPosition(), imagePoint);
                this.focusedObj = this.annLine;

                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annLine) {
                this.annLine.onMouseEvent(mouseEventType, point, null);
                this.redraw(this.annLine.getStartPosition(), imagePoint);
            }
        }
    }

    onCreate(startPoint: Point, endPoint: Point, textPoint: Point) {
        this.onDeleteChildren();

        this.annLine = new AnnLine(this, this.imageViewer);
        this.annLine.onCreate(startPoint, endPoint);
        this.redraw(startPoint, endPoint, textPoint);
    }

    onLoadConfig(annSerialize: AnnSerialize) {
        return annSerialize.loadRuler();
    }

    onCreateFromConfig(config: any) {
        this.onCreate(config.startPoint, config.endPoint, config.textIndicator.startPoint);
        this.focusedObj = this.annLine;
    }

    onSave(annSerialize: AnnSerialize) {
        this.saveBasicInfo(annSerialize);

        this.annLine.getBaseLine().onSave(annSerialize);
        this.lineNodeA.onSave(annSerialize);
        this.lineNodeB.onSave(annSerialize);
        this.annTextIndicator.onSave(annSerialize);
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annLine) {
            this.annLine.onDrag(deltaX, deltaY);
            this.redraw(this.annLine.getStartPosition(), this.annLine.getEndPosition());
            this.annMiddlePoint.onMove(AnnTool.centerPoint(this.annLine.getStartPosition(), this.annLine.getEndPosition()));

            const text = this.getLength(this.annLine.getStartPosition(), this.annLine.getEndPosition());
            this.annTextIndicator.setText(text);
        } else if (this.focusedObj === this.annTextIndicator) {
            this.annTextIndicator.onDrag(deltaX, deltaY);
        } else {
            this.onTranslate(deltaX, deltaY);
        }
    }

    getSurroundPointList(): Point[] {
        AnnTool.centerPoint(this.annLine.getStartPosition(), this.annLine.getEndPosition());
        return [this.annMiddlePoint.getPosition()];
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private redraw(startPoint: Point, endPoint: Point, textPoint: Point = undefined) {
        let sineTheta = AnnTool.getSineTheta(endPoint, startPoint);
        let cosineTheta = AnnTool.getCosineTheta(endPoint, startPoint);
        let ptStartA: Point;
        let ptStartB: Point;
        let ptEndA: Point;
        let ptEndB: Point;

        ptStartA = new Point(0, 0);
        ptStartB = new Point(0, 0);
        ptEndA = new Point(0, 0);
        ptEndB = new Point(0, 0);

        ptStartA.x = startPoint.x - this.rulerNode * sineTheta + 0.5;
        ptStartB.x = startPoint.x + this.rulerNode * sineTheta + 0.5;

        ptStartA.y = startPoint.y + this.rulerNode * cosineTheta + 0.5;
        ptStartB.y = startPoint.y - this.rulerNode * cosineTheta + 0.5;

        sineTheta = AnnTool.getSineTheta(startPoint, endPoint);
        cosineTheta = AnnTool.getCosineTheta(startPoint, endPoint);

        ptEndA.x = endPoint.x - this.rulerNode * sineTheta + 0.5;
        ptEndB.x = endPoint.x + this.rulerNode * sineTheta + 0.5;

        ptEndA.y = endPoint.y + this.rulerNode * cosineTheta + 0.5;
        ptEndB.y = endPoint.y - this.rulerNode * cosineTheta + 0.5;

        if (!this.lineNodeA) {
            this.lineNodeA = new AnnBaseLine(this, ptStartA, ptStartB, this.imageViewer);
            this.lineNodeA.onLevelDown("bottom");
        } else {
            this.lineNodeA.onMoveStartPoint(ptStartA);
            this.lineNodeA.onMoveEndPoint(ptStartB);
        }

        if (!this.lineNodeB) {
            this.lineNodeB = new AnnBaseLine(this, ptEndA, ptEndB, this.imageViewer);
            this.lineNodeB.onLevelDown("bottom");
        } else {
            this.lineNodeB.onMoveStartPoint(ptEndA);
            this.lineNodeB.onMoveEndPoint(ptEndB);
        }

        const centerPoint = AnnTool.centerPoint(startPoint, endPoint);
        if (!this.annMiddlePoint) {
            this.annMiddlePoint = new AnnPoint(this, this.imageViewer);
            this.annMiddlePoint.onCreate(centerPoint);
        } else {
            this.annMiddlePoint.onMove(centerPoint);
        }

        const text = this.getLength(startPoint, endPoint);
        if (!this.annTextIndicator) {
            this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
            this.annTextIndicator.onCreate(text, this.annMiddlePoint.getPosition(), textPoint);
        } else {
            this.annTextIndicator.setText(text);
        }
    }

    private getLength(startPoint, endPoint) {
        let strDist;

        if (this.pixelSpacing) {
            const dDistance = AnnTool.countPhysicalDistance(startPoint, endPoint, this.pixelSpacing);
            strDist = dDistance.toFixed(2) + "mm";
        }
        else {
            const dDistance = AnnTool.countDistance(startPoint, endPoint);
            strDist = dDistance.toFixed(2) + "pt";
        }

        return strDist;
    }
}