import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBaseCurve } from "../base-object/ann-base-curve";
import { AnnTextIndicator } from "./ann-text-indicator"

export class AnnCurve extends AnnExtendObject {

    private annCurve: AnnBaseCurve;
    private annStartPoint: AnnPoint;
    private annMiddlePoint: AnnPoint;
    private annEndPoint: AnnPoint;
    private annTextIndicator: AnnTextIndicator;

    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
        this.annTypeName = "Cervical Curve";
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

            const stepIndex = this.imageViewer.getCurrentStepIndex();
            switch (stepIndex) {

                // Step 0: Draw the start point
                case 0: {
                    this.onStep1(imagePoint);
                    break;
                }

                // Draw line AB and point B
                case 1: {
                    this.onStep2(imagePoint);
                    break;
                }

                // Draw the start point of line Cd
                case 2: {
                    this.onStep3(imagePoint);
                    break;
                }
                    
                default: {
                    alert("Invalid step index " + stepIndex);
                    return;
                }
            }

            // Step the guide
            this.imageViewer.stepGuide();
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annStartPoint) {
            this.onDragStartPoint(deltaX, deltaY);
        } else if (this.focusedObj === this.annEndPoint) {
            this.onDragEndPoint(deltaX, deltaY);
        } else if (this.focusedObj === this.annMiddlePoint) {
            this.onDragMiddlePoint(deltaX, deltaY);
        } else if (this.focusedObj === this.annTextIndicator) {
            this.annTextIndicator.onDrag(deltaX, deltaY);
        } else {
            this.onTranslate(deltaX, deltaY);
        }
    }

    onFlip(vertical: boolean) {
        this.annStartPoint.onFlip(vertical);
        this.annEndPoint.onFlip(vertical);
        this.annMiddlePoint.onFlip(vertical);
        this.annTextIndicator.onFlip(vertical);

        const startPoint = this.annStartPoint.getPosition();
        const endPoint = this.annEndPoint.getPosition();
        const middlePoint = this.annMiddlePoint.getPosition();
        
        this.redraw(startPoint, endPoint, middlePoint);
    }

    // The arrow of the text indicator will always point to the middle point
    getSurroundPointList(): Point[] {
        return [this.annMiddlePoint.getPosition()];
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private onStep1(imagePoint: Point) {
        this.annStartPoint = new AnnPoint(this, this.imageViewer);
        this.annStartPoint.onCreate(imagePoint);
        this.annStartPoint.setStepIndex(0);
    }

    private onStep2(imagePoint: Point) {
        const startPoint = this.annStartPoint.getPosition();
        if (AnnTool.equalPoint(imagePoint, startPoint)) return;

        const radius = AnnTool.countDistance(startPoint, imagePoint);
        const middlePoint = this.calcMiddlePoint(startPoint, imagePoint, radius);

        this.redraw(startPoint, imagePoint, middlePoint);

        this.annEndPoint.setStepIndex(1);
    }

    private onStep3(imagePoint: Point) {
        const startPoint = this.annStartPoint.getPosition();
        const endPoint = this.annEndPoint.getPosition();
        const middlePoint = this.annMiddlePoint.getPosition();
        const lineCenter = AnnTool.centerPoint(startPoint, endPoint);

        // another middle point
        const newMiddlePoint = { x: lineCenter.x * 2 - middlePoint.x, y: lineCenter.y * 2 - middlePoint.y };

        // The nearest is the wanted
        if (AnnTool.countDistance(imagePoint, newMiddlePoint) < AnnTool.countDistance(imagePoint, middlePoint)) {
            this.redraw(startPoint, endPoint, newMiddlePoint);
        }

        this.annMiddlePoint.setStepIndex(2);
        this.focusedObj = this.annMiddlePoint;

        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    // Calculate the middle point of the curve (The curve is determined by start/end point and its radius, default direction is left or up)
    private calcMiddlePoint(startPoint: Point, endPoint: Point, radius: number) {
        const pointDir = { x: 1, y: 1 };
        const centerPoint = AnnTool.centerPoint(startPoint, endPoint);

        const dSinAB = AnnTool.getSineTheta(startPoint, endPoint);
        const dCosAB = AnnTool.getCosineTheta(startPoint, endPoint);

        const dLineAD = AnnTool.countDistance(startPoint, centerPoint);

        const ptO1 = new Point(0, 0);
        const ptO2 = new Point(0, 0);

        //get the two center ponints.
        //check if the arc is almost 180, if true, lineAd is the radius
        if (Math.abs(dLineAD - radius) < AnnTool.minDelta || radius < dLineAD) {
            ptO1.x = ptO2.x = centerPoint.x;
            ptO1.y = ptO2.y = centerPoint.y;
        } else {
            const dLineOD = Math.sqrt(Math.abs(radius * radius - dLineAD * dLineAD));

            ptO1.x = centerPoint.x + dLineOD * dSinAB;
            ptO1.y = centerPoint.y - dLineOD * dCosAB;

            ptO2.x = centerPoint.x - dLineOD * dSinAB;
            ptO2.y = centerPoint.y + dLineOD * dCosAB;
        }

        var dSinBA = AnnTool.getSineTheta(endPoint, startPoint),
            dCosBA = AnnTool.getCosineTheta(endPoint, startPoint),
            dSinBC = AnnTool.getSineTheta(endPoint, pointDir),
            dCosBC = AnnTool.getCosineTheta(endPoint, pointDir);

        //determine the center point
        const middlePoint = new Point(0, 0);
        var dSinBC_BA = dSinBC * dCosBA - dCosBC * dSinBA;
        if (dSinBC_BA < 0.0) {
            middlePoint.x = ptO1.x - radius * dSinAB;
            middlePoint.y = ptO1.y + radius * dCosAB;
        } else {
            middlePoint.x = ptO2.x + radius * dSinAB;
            middlePoint.y = ptO2.y - radius * dCosAB;
        }

        return middlePoint;
    }

    // Calculate the center point of the curve ( The curve is determined by three points )
    private calcCenterBy3Points(startPoint: Point, endPoint: Point, middlePoint: Point): any {
        let isInvalid = false;
        let needRevert = false;

        // D and E is center point of Line AB and Line BC
        const ptD = AnnTool.centerPoint(startPoint, endPoint);
        const ptE = AnnTool.centerPoint(endPoint, middlePoint);

        // k of Line OD and Line OE
        // O is center point of arc
        //
        const dkOD = -(endPoint.x - startPoint.x) / (endPoint.y - startPoint.y);
        const dkOE = -(middlePoint.x - endPoint.x) / (middlePoint.y - endPoint.y);

        const centerPoint = new Point(0, 0);
        if (Math.abs(middlePoint.y - endPoint.y) < AnnTool.minDelta) {
            centerPoint.x = ptE.x;
            centerPoint.y = (ptE.x - ptD.x) * dkOD + ptD.y;
        } else if (Math.abs(endPoint.y - startPoint.y) < AnnTool.minDelta) {
            centerPoint.x = ptD.x;
            centerPoint.y = (ptD.x - ptE.x) * dkOE + ptE.y;
        } else if (Math.abs(middlePoint.x - endPoint.x) < AnnTool.minDelta) {
            centerPoint.y = ptE.y;
            centerPoint.x = (ptE.y - ptD.y) / dkOD + ptD.x;
        } else if (Math.abs(endPoint.x - startPoint.x) < AnnTool.minDelta) {
            centerPoint.y = ptD.y;
            centerPoint.x = (ptD.y - ptE.y) / dkOE + ptE.x;
        } else {
            centerPoint.x = (ptE.y - ptD.y - (ptE.x * dkOE) + (ptD.x * dkOD)) / (dkOD - dkOE);
            centerPoint.y = ptD.y + dkOD * (centerPoint.x - ptD.x);
        }

        // Analysis Start Point and End point
        // Arc() always draw arc in a Clockwise
        //
        var dSinBA = AnnTool.getSineTheta(endPoint, startPoint),
            dCosBA = AnnTool.getCosineTheta(endPoint, startPoint),
            dSinBC = AnnTool.getSineTheta(endPoint, middlePoint),
            dCosBC = AnnTool.getCosineTheta(endPoint, middlePoint);

        var dSinBC_BA = dSinBC * dCosBA - dCosBC * dSinBA;

        // Check Arc angle
        //
        var dSinOA = AnnTool.getSineTheta(centerPoint, startPoint),
            dCosOA = AnnTool.getCosineTheta(centerPoint, startPoint),
            dSinOB = AnnTool.getSineTheta(centerPoint, endPoint),
            dCosOB = AnnTool.getCosineTheta(centerPoint, endPoint);

        var dSinArc = dSinOA * dCosOB - dCosOA * dSinOB;

        if (dSinBC_BA > 0.0) {
            dSinArc = (-1.0) * dSinArc;
        }

        if (dSinArc < 0.0) {
            isInvalid = true;
        }

        //need to revert start and end.
        if (dSinBC_BA > 0.0) {
            needRevert = true;
        }

        return { centerPoint: centerPoint, isInvalid: isInvalid, needRevert: needRevert };
    }

    // Calculate all necessary information of a curve
    calcArcBy3Points(startPoint: Point, endPoint: Point, middlePoint: Point, needCheckArc: boolean): any {
        const arcData = this.calcCenterBy3Points(startPoint, endPoint, middlePoint);

        if (needCheckArc && arcData.isInvalid)
            return false; //user may drag the point out of range

        const radius = AnnTool.countDistance(arcData.centerPoint, startPoint);

        const dSinAB = AnnTool.getSineTheta(startPoint, endPoint);
        const dCosAB = AnnTool.getCosineTheta(startPoint, endPoint);

        if (arcData.needRevert) {
            middlePoint.x = arcData.centerPoint.x + radius * dSinAB;
            middlePoint.y = arcData.centerPoint.y - radius * dCosAB;
        } else {
            middlePoint.x = arcData.centerPoint.x - radius * dSinAB;
            middlePoint.y = arcData.centerPoint.y + radius * dCosAB;
        }

        const arcStart = AnnTool.calcLineAngle(arcData.centerPoint, startPoint);
        let arcEnd = AnnTool.calcLineAngle(arcData.centerPoint, endPoint);
        if (arcEnd < arcStart) {
            arcEnd = arcEnd + 360.0;
        }

        return {
            centerPoint: arcData.centerPoint,
            startPoint: startPoint,
            endPoint: endPoint,
            middlePoint: middlePoint,
            radius: radius,
            startAngle: arcStart,
            endAngle: arcEnd,
            anticlockwise: !arcData.needRevert
        };
    }

    // Calcuate the curve angle of two lines that share the same point
    //private calcCurveAngle(startPoint: Point, endPoint: Point, centerPoint: Point): any {
    //    const arcStart = AnnPoint.calcLineAngle(centerPoint, startPoint);
    //    let arcEnd = AnnPoint.calcLineAngle(centerPoint, endPoint);
    //    if (arcEnd < arcStart) {
    //        arcEnd = arcEnd + 360.0;
    //    }

    //    return { startAngle: arcStart, endAngle: arcEnd };
    //}

    private onDragStartPoint(deltaX: number, deltaY: number) {
        const startPoint = this.annStartPoint.getPosition();
        const endPoint = this.annEndPoint.getPosition();
        const middlePoint = this.annMiddlePoint.getPosition();

        startPoint.x += deltaX;
        startPoint.y += deltaY;

        this.redraw(startPoint, endPoint, middlePoint);
    }

    private onDragEndPoint(deltaX: number, deltaY: number) {
        const startPoint = this.annStartPoint.getPosition();
        const endPoint = this.annEndPoint.getPosition();
        const middlePoint = this.annMiddlePoint.getPosition();

        endPoint.x += deltaX;
        endPoint.y += deltaY;

        this.redraw(startPoint, endPoint, middlePoint);
    }

    private onDragMiddlePoint(deltaX: number, deltaY: number) {
        const startPoint = this.annStartPoint.getPosition();
        const endPoint = this.annEndPoint.getPosition();
        const middlePoint = this.annMiddlePoint.getPosition();

        middlePoint.x += deltaX;
        middlePoint.y += deltaY;

        this.redraw(startPoint, endPoint, middlePoint);
    }

    // Redraw the curve
    private redraw(startPoint: Point, endPoint: Point, middlePoint: Point) {

        const arcData = this.calcArcBy3Points(startPoint, endPoint, middlePoint, true);
        if (!arcData) return;

        if (this.annCurve) {
            this.annStartPoint.onMove(arcData.startPoint);
            this.annEndPoint.onMove(arcData.endPoint);
            this.annMiddlePoint.onMove(arcData.middlePoint);

            this.annCurve.onMove(arcData.centerPoint);
            this.annCurve.setRadius(arcData.radius);
            this.annCurve.setAngle(arcData.startAngle, arcData.endAngle);
            this.annCurve.setAnticlockwise(arcData.anticlockwise);

            this.annTextIndicator.setText(this.annCurve.getText());
        } else {
            this.annEndPoint = new AnnPoint(this, this.imageViewer);
            this.annEndPoint.onCreate(endPoint);

            this.annMiddlePoint = new AnnPoint(this, this.imageViewer);
            this.annMiddlePoint.onCreate(middlePoint);

            this.annCurve = new AnnBaseCurve(this, arcData.centerPoint, arcData.radius, arcData.startAngle, arcData.endAngle, arcData.anticlockwise, this.imageViewer);

            this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
            this.annTextIndicator.onCreate(middlePoint, this.annCurve.getText());

            this.annCurve.onLevelDown();
        }
    }
}