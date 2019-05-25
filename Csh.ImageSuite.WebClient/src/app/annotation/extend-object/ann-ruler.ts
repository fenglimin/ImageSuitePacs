import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnLine } from "./ann-line";

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
                this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);

                this.annMiddlePoint = new AnnPoint(this, this.imageViewer);
                this.annMiddlePoint.onCreate(AnnTool.centerPoint(this.annLine.getStartPosition(), imagePoint));

                let text = this.getLength(this.annLine.getStartPosition(), this.annLine.getEndPosition());
                this.annTextIndicator.onCreate(text, this.annMiddlePoint.getPosition());

                this.focusedObj = this.annLine;

                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annLine) {
                this.annLine.onMouseEvent(mouseEventType, point, null);

                this.CalNodePos(this.annLine.getStartPosition(), imagePoint);
            }
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annLine) {
            this.annLine.onDrag(deltaX, deltaY);
            this.CalNodePos(this.annLine.getStartPosition(), this.annLine.getEndPosition());
            this.annMiddlePoint.onMove(AnnTool.centerPoint(this.annLine.getStartPosition(), this.annLine.getEndPosition()));

            const text = this.getLength(this.annLine.getStartPosition(), this.annLine.getEndPosition());
            this.annTextIndicator.setText(text);
        } else if (this.focusedObj === this.annTextIndicator) {
            this.annTextIndicator.onDrag(deltaX, deltaY);
        } else {
            this.onTranslate(deltaX, deltaY);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private CalNodePos(ptStart, ptEnd) {
        let sineTheta = AnnTool.getSineTheta(ptEnd, ptStart);
        let cosineTheta = AnnTool.getCosineTheta(ptEnd, ptStart);
        let ptStartA: Point;
        let ptStartB: Point;
        let ptEndA: Point;
        let ptEndB: Point;

        ptStartA = new Point(0, 0);
        ptStartB = new Point(0, 0);
        ptEndA = new Point(0, 0);
        ptEndB = new Point(0, 0);

        ptStartA.x = ptStart.x - this.rulerNode * sineTheta + 0.5;
        ptStartB.x = ptStart.x + this.rulerNode * sineTheta + 0.5;

        ptStartA.y = ptStart.y + this.rulerNode * cosineTheta + 0.5;
        ptStartB.y = ptStart.y - this.rulerNode * cosineTheta + 0.5;

        sineTheta = AnnTool.getSineTheta(ptStart, ptEnd);
        cosineTheta = AnnTool.getCosineTheta(ptStart, ptEnd);

        ptEndA.x = ptEnd.x - this.rulerNode * sineTheta + 0.5;
        ptEndB.x = ptEnd.x + this.rulerNode * sineTheta + 0.5;

        ptEndA.y = ptEnd.y + this.rulerNode * cosineTheta + 0.5;
        ptEndB.y = ptEnd.y - this.rulerNode * cosineTheta + 0.5;

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
    }

    getSurroundPointList(): Point[] {
        AnnTool.centerPoint(this.annLine.getStartPosition(), this.annLine.getEndPosition());
        return [this.annMiddlePoint.getPosition()];
    }

    private getLength(ptStart, ptEnd) {
        let strDist;

        if (this.pixelSpacing) {
            const dDistance = AnnTool.countPhysicalDistance(ptStart, ptEnd, this.pixelSpacing);
            strDist = dDistance.toFixed(2) + "mm";
        }
        else {
            const dDistance = AnnTool.countDistance(ptStart, ptEnd);
            strDist = dDistance.toFixed(2) + "pt";
        }

        return strDist;
    }
}