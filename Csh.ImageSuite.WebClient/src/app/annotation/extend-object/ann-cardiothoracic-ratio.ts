import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnPoint } from "./ann-point";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnLine } from "./ann-line";

export class AnnCardiothoracicRatio extends AnnExtendObject {

    /*
                            
                        | A(0)
                        |
                        |
                 C(2)---|-------D(3)
                        |
                        |
                        |
                        |
                        |
            E(4)--------|-------------F(5)
                        |
                        |
                        |
                        B(1)
    */


    private annLineAb: AnnLine;
    private annLineCd: AnnLine;
    private annLineEf: AnnLine;

    private annBaseLineAb: AnnBaseLine;
    private annTextIndicator: AnnTextIndicator;
    private annPointList: Array<AnnPoint> = [];
    private annLineList: Array<AnnBaseLine> = [];

    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
        this.guideNeeded = true;
        this.annTypeName = "Cardiothoracic Ratio";
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {
        const imagePoint = AnnTool.screenToImage(point, this.image.transformMatrix);
        const stepIndex = this.imageViewer.getCurrentStepIndex();

        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            switch (stepIndex) {
                // Draw the start point of line Ab
                case 0: {
                    this.onStep1(point, imagePoint);
                    break;
                }

                // Draw line AB and point B
                case 1: {
                    this.onStep2(imagePoint);
                    break;
                }

                // Draw the start point of line Cd
                case 2: {
                    this.onStep3(point, imagePoint);
                    break;
                }

                // Draw base line Cc and Dd, draw point D, delete temp line Cd
                case 3: {
                    this.onStep4(imagePoint);
                    break;
                }

                // Draw the start point of line EF
                case 4: {
                    this.onStep5(point, imagePoint);
                    break;
                }

                // Draw base line Ee and Ff, draw point F, delete temp line Ef
                case 5: {
                    this.onStep6(imagePoint);
                    break;
                }

                default: {
                    alert("Invalid step index " + stepIndex);
                    return;
                }
            }

            // Step the guide
            this.imageViewer.stepGuide();

        } else if (mouseEventType === MouseEventType.MouseMove) {

            switch (stepIndex) {
                // Move the end point of line AB
                case 1: {
                    this.annLineAb.onMouseEvent(mouseEventType, point, null);
                    break;
                }

                // Move the end point of line CD
                case 3: {
                    this.annLineCd.onMouseEvent(mouseEventType, point, null);
                    break;
                }

                // Move the end point of line EF
                case 5: {
                    this.annLineEf.onMouseEvent(mouseEventType, point, null);
                    break;
                }
            }
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj.getStepIndex() !== -1) {
            this.focusedObj.onTranslate(deltaX, deltaY);
            this.redraw();
        } else if (this.focusedObj === this.annTextIndicator) {
            this.annTextIndicator.onDrag(deltaX, deltaY);
        } else {
            this.onTranslate(deltaX, deltaY);
        }
    }

    // The text indicator is drawn in the separated layer, need to rotate it.
    onRotate(angle: number) {
        this.annTextIndicator.onRotate(angle);
    }

    // The arrow of the text indicator will always point to the  point A
    getSurroundPointList(): Point[] {
        return [this.annPointList[0].getPosition()];
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private onStep1(screenPoint: Point, imagePoint: Point) {
        this.annLineAb = new AnnLine(this, this.imageViewer);
        this.annLineAb.onMouseEvent(MouseEventType.MouseDown, screenPoint, null);

        const annPointA = new AnnPoint(this, this.imageViewer);
        annPointA.onCreate(imagePoint);
        annPointA.setStepIndex(0);
        this.annPointList.push(annPointA);

        const annBaseLineAa = new AnnBaseLine(this, imagePoint, imagePoint, this.imageViewer);
        this.annLineList.push(annBaseLineAa);
    }

    private onStep2(imagePoint: Point) {
        const pointA = this.annLineAb.getStartPosition();
        this.annLineAb.onDeleteChildren();

        this.annBaseLineAb = new AnnBaseLine(this, pointA, imagePoint, this.imageViewer);

        const annPointB = new AnnPoint(this, this.imageViewer);
        annPointB.onCreate(imagePoint);
        annPointB.setStepIndex(1);
        this.annPointList.push(annPointB);

        const annBaseLineBb = new AnnBaseLine(this, imagePoint, imagePoint, this.imageViewer);
        this.annLineList.push(annBaseLineBb);
    }

    private onStep3(screenPoint: Point, imagePoint: Point) {
        this.annLineCd = new AnnLine(this, this.imageViewer);
        this.annLineCd.onMouseEvent(MouseEventType.MouseDown, screenPoint, null);

        const annPointC = new AnnPoint(this, this.imageViewer);
        annPointC.onCreate(imagePoint);
        annPointC.setStepIndex(2);
        this.annPointList.push(annPointC);
    }

    private onStep4(imagePoint: Point) {
        const pointC = this.annLineCd.getStartPosition();
        const pointD = this.annLineCd.getEndPosition();
        this.annLineCd.onDeleteChildren();

        const footPointC = this.handleFootPoint(pointC);
        const annBaseLineCc = new AnnBaseLine(this, pointC, footPointC, this.imageViewer);
        this.annLineList.push(annBaseLineCc);

        const footPointD = this.handleFootPoint(pointD);
        const annBaseLineDd = new AnnBaseLine(this, pointD, footPointD, this.imageViewer);
        this.annLineList.push(annBaseLineDd);

        const annPointD = new AnnPoint(this, this.imageViewer);
        annPointD.onCreate(pointD);
        annPointD.setStepIndex(3);
        this.annPointList.push(annPointD);
    }

    private onStep5(screenPoint: Point, imagePoint: Point) {
        this.annLineEf = new AnnLine(this, this.imageViewer);
        this.annLineEf.onMouseEvent(MouseEventType.MouseDown, screenPoint, null);

        const annPointE = new AnnPoint(this, this.imageViewer);
        annPointE.onCreate(imagePoint);
        annPointE.setStepIndex(4);

        this.annPointList.push(annPointE);
    }

    private onStep6(imagePoint: Point) {
        const pointE = this.annLineEf.getStartPosition();
        const pointF = this.annLineEf.getEndPosition();
        this.annLineEf.onDeleteChildren();

        const pointA = this.annLineAb.getStartPosition();
        const pointB = this.annLineAb.getEndPosition();
        this.annLineAb.onDeleteChildren();

        const footPointE = this.handleFootPoint(pointE);
        const annBaseLineEe = new AnnBaseLine(this, pointE, footPointE, this.imageViewer);
        this.annLineList.push(annBaseLineEe);

        const footPointF = this.handleFootPoint(pointF);
        const annBaseLineFf = new AnnBaseLine(this, pointF, footPointF, this.imageViewer);
        this.annLineList.push(annBaseLineFf);

        const annPointF = new AnnPoint(this, this.imageViewer);
        annPointF.onCreate(pointF);
        annPointF.setStepIndex(5);
        this.annPointList.push(annPointF);

        this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
        this.annTextIndicator.onCreate(pointA, this.getText());

        this.focusedObj = this.annPointList[0];

        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    private getText(): string {
        const heartWidth = this.annLineList[2].getLengthInPixel() + this.annLineList[3].getLengthInPixel();
        const chestWidth = this.annLineList[4].getLengthInPixel() + this.annLineList[5].getLengthInPixel();
        const ratio = (heartWidth * 100 / chestWidth).toFixed(2);

        // Sail: What if the pixel spacing of x and y is different???
        return this.pixelSpacing ? "H: {0}mm / C: {1}mm / R: {2}%".format((heartWidth * this.pixelSpacing.cx).toFixed(2), (chestWidth * this.pixelSpacing.cx).toFixed(2), ratio) :
            "H: {0}pt / C: {1}pt / R: {2}%".format(heartWidth.toFixed(2), chestWidth.toFixed(2), ratio);
    }

    private handleFootPoint(point: Point): Point {
        const pointA = this.annBaseLineAb.getStartPosition();
        const pointB = this.annBaseLineAb.getEndPosition();

        const footPoint = AnnTool.calcFootPoint(pointA, pointB, point);

        const chestPointResult = AnnTool.pointInLine(footPoint, pointA, pointB);
        if (!chestPointResult.isInLine) {
            this.onNewFootPoint(footPoint, chestPointResult.nearStart ? 0 : 1);
        }

        return footPoint;
    }

    private onNewFootPoint(footPoint: Point, index: number) {
        // index must be 0 or 1. 0 means start point(A), 1 means end point(B).
        if (index !== 0 && index !== 1) {
            alert("Internal error in onNewFootPoint");
            return;
        }

        const startPoint = this.annPointList[index].getPosition();
        if (AnnTool.countDistance(footPoint, startPoint) > this.annLineList[index].getLengthInPixel()) {
            this.annLineList[index].onMoveEndPoint(footPoint);
        }
    }

    private redraw() {
        const pointList = [];
        for (let i = 0; i < this.annPointList.length; i ++) {
            pointList.push(this.annPointList[i].getPosition());
        }

        this.annBaseLineAb.onMoveStartPoint(pointList[0]);
        this.annBaseLineAb.onMoveEndPoint(pointList[1]);

        for (let i = 0; i < 2; i++) {
            this.annLineList[i].onMoveStartPoint(pointList[i]);
            this.annLineList[i].onMoveEndPoint(pointList[i]);
        }

        for (let i = 2; i < this.annPointList.length; i++) {
            const footPoint = this.handleFootPoint(pointList[i]);
            this.annLineList[i].onMoveStartPoint(pointList[i]);
            this.annLineList[i].onMoveEndPoint(footPoint);
        }

        this.annTextIndicator.setText(this.getText());
    }
}