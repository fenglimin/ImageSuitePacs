import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBaseCurve } from "../base-object/ann-base-curve";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnSerialize } from "../ann-serialize";

export class AnnCurve extends AnnExtendObject {

    private annBaseCurve: AnnBaseCurve;
    private annStartPoint: AnnPoint;
    private annMiddlePoint: AnnPoint;
    private annEndPoint: AnnPoint;
    private annTextIndicator: AnnTextIndicator;

    protected radiusInImage: number;

    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
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
            let ret: boolean;
            switch (stepIndex) {

                // Step 0: Draw the start point
                case 0: {
                    ret = this.onStep1(imagePoint);
                    break;
                }

                // Draw curve
                case 1: {
                    ret = this.onStep2(imagePoint);
                    break;
                }

                // Adjust curve direction
                case 2: {
                    ret = this.onStep3(imagePoint);
                    break;
                }
                    
                default: {
                    alert("Invalid step index " + stepIndex);
                    return;
                }
            }

            // Step the guide
            if (ret) {
                this.imageViewer.stepGuide();
            }
        }
    }

    onCreate(pointList: any, arrowStartPoint: Point = undefined, arrowEndPoint: Point = undefined) {
        if (pointList.length !== 3) {
            alert("Error config of AnnCurve!");
            return;
        }

        this.onStep1(pointList[0]);
        this.redraw(pointList[0], pointList[1], pointList[2]);
    }

    onLoadConfig(annSerialize: AnnSerialize) {
        return annSerialize.loadCurve();
    }

    onCreateFromConfig(config: any) {
        this.onCreate(config.pointList, config.textIndicator.startPoint, config.textIndicator.endPoint);
        this.focusedObj = this.annStartPoint;
    }

    onSave(annSerialize: AnnSerialize) {
       this.saveBasicInfo(annSerialize);

        annSerialize.writeDoublePoint(this.annStartPoint.getPosition());
        annSerialize.writeDoublePoint(this.annEndPoint.getPosition());
        annSerialize.writeDoublePoint(this.annMiddlePoint.getPosition());

        this.annTextIndicator.onSave(annSerialize);
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

    private onStep1(imagePoint: Point): boolean {
        this.annStartPoint = new AnnPoint(this, this.imageViewer);
        this.annStartPoint.onCreate(imagePoint);
        this.annStartPoint.enableShowAlways(true);
        this.annStartPoint.setStepIndex(0);
        return true;
    }

    private onStep2(imagePoint: Point): boolean {
        const startPoint = this.annStartPoint.getPosition();
        if (AnnTool.equalPoint(imagePoint, startPoint)) return false;

        const length = AnnTool.countDistance(startPoint, imagePoint);
        if (length > this.radiusInImage * 2) return false;

        const middlePoint = AnnTool.calcMiddlePointOfArc(startPoint, imagePoint, this.radiusInImage);
        this.redraw(startPoint, imagePoint, middlePoint);
        return true;
    }

    private onStep3(imagePoint: Point): boolean {
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

        this.focusedObj = this.annMiddlePoint;

        if (!this.parentObj) {
            this.onDrawEnded();
        }

        return true;
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

    // Redraw the curve
    private redraw(startPoint: Point, endPoint: Point, middlePoint: Point) {

        const arcData = AnnTool.calcArcBy3Points(startPoint, endPoint, middlePoint, true);
        if (!arcData) return;

        if (this.annBaseCurve) {
            this.annStartPoint.onMove(arcData.startPoint);
            this.annEndPoint.onMove(arcData.endPoint);
            this.annMiddlePoint.onMove(arcData.middlePoint);

            this.annBaseCurve.onMove(arcData.centerPoint);
            this.annBaseCurve.setRadius(arcData.radius);
            this.annBaseCurve.setAngle(arcData.startAngle, arcData.endAngle);
            this.annBaseCurve.setAnticlockwise(arcData.anticlockwise);

            this.annTextIndicator.setText(this.annBaseCurve.getText());
        } else {
            this.annEndPoint = new AnnPoint(this, this.imageViewer);
            this.annEndPoint.onCreate(endPoint);
            this.annEndPoint.enableShowAlways(true);
            this.annEndPoint.setStepIndex(1);

            this.annMiddlePoint = new AnnPoint(this, this.imageViewer);
            this.annMiddlePoint.onCreate(middlePoint);
            this.annMiddlePoint.enableShowAlways(true);
            this.annMiddlePoint.setStepIndex(2);

            this.annBaseCurve = new AnnBaseCurve(this, arcData.centerPoint, arcData.radius, arcData.startAngle, arcData.endAngle, arcData.anticlockwise, this.imageViewer);

            this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
            this.annTextIndicator.onCreate(this.annBaseCurve.getText(), middlePoint);

            this.annBaseCurve.onLevelDown();
        }
    }
}