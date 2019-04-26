import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
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
        this.guideNeeded = true;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IAnnotationObject

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        const imagePoint = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            const stepIndex = this.imageViewer.getCurrentStepIndex();
            switch (stepIndex) {

                case 0: {
                    this.annStartPoint = new AnnPoint(this, this.imageViewer);
                    this.annStartPoint.onCreate(imagePoint);
                    this.annStartPoint.setStepIndex(stepIndex);
                    break;
                }

                case 1: {
                    const startPoint = this.annStartPoint.getPosition();
                    if (AnnObject.equalPoint(imagePoint, startPoint)) return;

                    const radius = AnnObject.countDistance(startPoint, imagePoint);
                    const middlePoint = this.calcMiddlePoint(startPoint, imagePoint, radius);

                    this.redraw(startPoint, imagePoint, middlePoint);

                    this.annEndPoint.setStepIndex(stepIndex);
                    break;
                }

                case 2: {
                    const startPoint = this.annStartPoint.getPosition();
                    const endPoint = this.annEndPoint.getPosition();
                    const middlePoint = this.annMiddlePoint.getPosition();

                    const lineCenter = AnnObject.centerPoint(startPoint, endPoint);
                    const newMiddlePoint = { x: lineCenter.x * 2 - middlePoint.x, y: lineCenter.y * 2 - middlePoint.y };

                    if (AnnObject.countDistance(imagePoint, newMiddlePoint) < AnnObject.countDistance(imagePoint, middlePoint)) {
                        this.redraw(startPoint, endPoint, newMiddlePoint);
                    }

                    if (!this.parentObj) {
                        this.onDrawEnded();
                    }

                    this.annMiddlePoint.setStepIndex(stepIndex);
                    break;
                }
            }

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

    onRotate(angle: number) {
        this.annTextIndicator.onRotate(angle);
    }

    getSurroundPointList(): Point[] {

        // The arrow of the text indicator will always point to the middle point
        return [this.annMiddlePoint.getPosition()];
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    calcMiddlePoint(startPoint: Point, endPoint: Point, radius: number) {

        const pointDir = { x: 1, y: 1 };
        const centerPoint = AnnObject.centerPoint(startPoint, endPoint);

        const dSinAB = AnnObject.getSineTheta(startPoint, endPoint);
        const dCosAB = AnnObject.getCosineTheta(startPoint, endPoint);

        const dLineAD = AnnObject.countDistance(startPoint, centerPoint);

        const ptO1 = new Point(0, 0);
        const ptO2 = new Point(0, 0);

        //get the two center ponints.
        //check if the arc is almost 180, if true, lineAd is the radius
        if (Math.abs(dLineAD - radius) < AnnObject.minDelta || radius < dLineAD) {
            ptO1.x = ptO2.x = centerPoint.x;
            ptO1.y = ptO2.y = centerPoint.y;
        } else {
            const dLineOD = Math.sqrt(Math.abs(radius * radius - dLineAD * dLineAD));

            ptO1.x = centerPoint.x + dLineOD * dSinAB;
            ptO1.y = centerPoint.y - dLineOD * dCosAB;

            ptO2.x = centerPoint.x - dLineOD * dSinAB;
            ptO2.y = centerPoint.y + dLineOD * dCosAB;
        }

        var dSinBA = AnnObject.getSineTheta(endPoint, startPoint),
            dCosBA = AnnObject.getCosineTheta(endPoint, startPoint),
            dSinBC = AnnObject.getSineTheta(endPoint, pointDir),
            dCosBC = AnnObject.getCosineTheta(endPoint, pointDir);

        //determine the center point
        const ptMiddle = new Point(0, 0);
        var dSinBC_BA = dSinBC * dCosBA - dCosBC * dSinBA;
        if (dSinBC_BA < 0.0) {
            ptMiddle.x = ptO1.x - radius * dSinAB;
            ptMiddle.y = ptO1.y + radius * dCosAB;
        } else {
            ptMiddle.x = ptO2.x + radius * dSinAB;
            ptMiddle.y = ptO2.y - radius * dCosAB;
        }

        return ptMiddle;
    }

    calcCenterBy3Points(ptStart: Point, ptEnd: Point, ptMiddle: Point): any {
        let bIsInvalid = false;
        let bNeedRevert = false;

        // D and E is center point of Line AB and Line BC
        //

        const ptD = AnnObject.centerPoint(ptStart, ptEnd);
        const ptE = AnnObject.centerPoint(ptEnd, ptMiddle);

        // k of Line OD and Line OE
        // O is center point of arc
        //
        const dkOD = -(ptEnd.x - ptStart.x) / (ptEnd.y - ptStart.y);
        const dkOE = -(ptMiddle.x - ptEnd.x) / (ptMiddle.y - ptEnd.y);

        const ptCenter = new Point(0, 0);
        if (Math.abs(ptMiddle.y - ptEnd.y) < AnnObject.minDelta) {
            ptCenter.x = ptE.x;
            ptCenter.y = (ptE.x - ptD.x) * dkOD + ptD.y;
        } else if (Math.abs(ptEnd.y - ptStart.y) < AnnObject.minDelta) {
            ptCenter.x = ptD.x;
            ptCenter.y = (ptD.x - ptE.x) * dkOE + ptE.y;
        } else if (Math.abs(ptMiddle.x - ptEnd.x) < AnnObject.minDelta) {
            ptCenter.y = ptE.y;
            ptCenter.x = (ptE.y - ptD.y) / dkOD + ptD.x;
        } else if (Math.abs(ptEnd.x - ptStart.x) < AnnObject.minDelta) {
            ptCenter.y = ptD.y;
            ptCenter.x = (ptD.y - ptE.y) / dkOE + ptE.x;
        } else {
            ptCenter.x = (ptE.y - ptD.y - (ptE.x * dkOE) + (ptD.x * dkOD)) / (dkOD - dkOE);
            ptCenter.y = ptD.y + dkOD * (ptCenter.x - ptD.x);
        }

        // Analysis Start Point and End point
        // Arc() always draw arc in a Clockwise
        //
        var dSinBA = AnnObject.getSineTheta(ptEnd, ptStart),
            dCosBA = AnnObject.getCosineTheta(ptEnd, ptStart),
            dSinBC = AnnObject.getSineTheta(ptEnd, ptMiddle),
            dCosBC = AnnObject.getCosineTheta(ptEnd, ptMiddle);

        var dSinBC_BA = dSinBC * dCosBA - dCosBC * dSinBA;

        // Check Arc angle
        //
        var dSinOA = AnnObject.getSineTheta(ptCenter, ptStart),
            dCosOA = AnnObject.getCosineTheta(ptCenter, ptStart),
            dSinOB = AnnObject.getSineTheta(ptCenter, ptEnd),
            dCosOB = AnnObject.getCosineTheta(ptCenter, ptEnd);

        var dSinArc = dSinOA * dCosOB - dCosOA * dSinOB;

        if (dSinBC_BA > 0.0) {
            dSinArc = (-1.0) * dSinArc;
        }

        if (dSinArc < 0.0) {
            bIsInvalid = true;
        }

        //need to revert start and end.
        if (dSinBC_BA > 0.0) {
            bNeedRevert = true;
        }

        return { ptCenter: ptCenter, bIsInvalid: bIsInvalid, bNeedRevert: bNeedRevert };
    }

    calcArcBy3Points(startPoint: Point, endPoint: Point, middlePoint: Point, needCheckArc: boolean): any {

        const arcData = this.calcCenterBy3Points(startPoint, endPoint, middlePoint);

        if (needCheckArc && arcData.bIsInvalid)
            return false; //user may drag the point out of range

        const radius = AnnObject.countDistance(arcData.ptCenter, startPoint);

        const dSinAB = AnnObject.getSineTheta(startPoint, endPoint);
        const dCosAB = AnnObject.getCosineTheta(startPoint, endPoint);

        if (arcData.bNeedRevert) {
            middlePoint.x = arcData.ptCenter.x + radius * dSinAB;
            middlePoint.y = arcData.ptCenter.y - radius * dCosAB;
        } else {
            middlePoint.x = arcData.ptCenter.x - radius * dSinAB;
            middlePoint.y = arcData.ptCenter.y + radius * dCosAB;
        }

        const arcStart = AnnObject.calcLineAngle(arcData.ptCenter, startPoint);
        let arcEnd = AnnObject.calcLineAngle(arcData.ptCenter, endPoint);
        if (arcEnd < arcStart) {
            arcEnd = arcEnd + 360.0;
        }

        return {
            centerPoint: arcData.ptCenter,
            startPoint: startPoint,
            endPoint: endPoint,
            middlePoint: middlePoint,
            radius: radius,
            startAngle: arcStart,
            endAngle: arcEnd,
            anticlockwise: !arcData.bNeedRevert
        };
    }


    private calcCurveAngle(startPoint: Point, endPoint: Point, centerPoint: Point): any {
        const arcStart = AnnPoint.calcLineAngle(centerPoint, startPoint);
        let arcEnd = AnnPoint.calcLineAngle(centerPoint, endPoint);
        if (arcEnd < arcStart) {
            arcEnd = arcEnd + 360.0;
        }

        return { startAngle: arcStart, endAngle: arcEnd };
    }

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