import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnBaseCurve } from "../base-object/ann-base-curve";
import { AnnTextIndicator } from "./ann-text-indicator"
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnSerialize } from "../ann-serialize";
import { AnnConfigLoader } from "../ann-config-loader";

export class AnnAngle extends AnnExtendObject {

    private annBaseLine1: AnnBaseLine;
    private annBaseLine2: AnnBaseLine;
    private annStartPoint: AnnPoint;
    private annEndPoint1: AnnPoint;
    private annEndPoint2: AnnPoint;
    private annBaseCurve: AnnBaseCurve;
    private annTextIndicator: AnnTextIndicator;

    private line1Drawn = false;

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

            if (!this.annStartPoint) {
                this.annStartPoint = this.createPoint(imagePoint);
            } else if (!this.line1Drawn) {
                this.line1Drawn = true;
            }else {
                this.focusedObj = this.annStartPoint;
                this.redrawAngle();

                if (!this.parentObj) {
                    this.onDrawEnded();
                }
            }

        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (!this.annStartPoint) {
                return;
            }

            if (this.annBaseLine1) {
                if (this.line1Drawn) {
                    if (this.annBaseLine2) {
                        this.annBaseLine2.onMoveEndPoint(imagePoint);
                        this.annEndPoint2.onMove(imagePoint);
                    } else {
                        this.annEndPoint2 = this.createPoint(imagePoint);
                        this.annBaseLine2 = new AnnBaseLine(this, this.annStartPoint.getPosition(), imagePoint, this.imageViewer);
                    }
                } else {
                    this.annBaseLine1.onMoveEndPoint(imagePoint);
                    this.annEndPoint1.onMove(imagePoint);
                }
            } else {
                this.annEndPoint1 = this.createPoint(imagePoint);
                this.annBaseLine1 = new AnnBaseLine(this, this.annStartPoint.getPosition(), imagePoint, this.imageViewer);
            }
        }
    }

    onCreate(lineList: any, arrowStartPoint: Point = undefined, arrowEndPoint: Point = undefined) {
        if (lineList.length !==  2) {
            alert("Error config of AnnAngle!");
            return;
        }

        this.annBaseLine1 = new AnnBaseLine(this, lineList[0].startPoint, lineList[0].endPoint, this.imageViewer);
        this.annBaseLine2 = new AnnBaseLine(this, lineList[1].startPoint, lineList[1].endPoint, this.imageViewer);

        this.annStartPoint = this.createPoint(lineList[0].startPoint);
        this.annEndPoint1 = this.createPoint(lineList[0].endPoint);
        this.annEndPoint2 = this.createPoint(lineList[1].endPoint);

        this.redrawAngle();
    }

    onLoad(annSerialize: AnnSerialize) {
        const config = AnnConfigLoader.loadAngle(annSerialize);
        this.onCreate(config.lineList,  config.textIndicator.startPoint, config.textIndicator.endPoint);
        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnProtractor");
        annSerialize.writeNumber(8, 4);     // AnnType
        annSerialize.writeNumber(1, 4);     // created
        annSerialize.writeNumber(0, 4);     // moving
        annSerialize.writeNumber(0, 1);     // selected
        annSerialize.writeNumber(0, 1);     // arcAndTextOnly
        annSerialize.writeNumber(3, 4);     // createState
        const angle = this.annBaseCurve.getAngle();
        annSerialize.writeNumber(angle, 8);     // angle

        const startPoint = this.annStartPoint.getPosition();
        const radius = this.annBaseCurve.getRadius();
        const arcStartPoint = AnnTool.pointInLineByDistance(startPoint, this.annBaseLine1.getEndPosition(), radius);
        annSerialize.writePoint(arcStartPoint);
        const arcEndPoint = AnnTool.pointInLineByDistance(startPoint, this.annBaseLine2.getEndPosition(), radius);
        annSerialize.writePoint(arcEndPoint);

        // TopLeft point of curve's rect
        annSerialize.writePoint({ x: startPoint.x - radius, y: startPoint.y - radius });
        annSerialize.writePoint({ x: startPoint.x + radius, y: startPoint.y + radius });

        this.annBaseLine1.onSave(annSerialize);
        this.annBaseLine2.onSave(annSerialize);
        this.annTextIndicator.onSave(annSerialize);
    }


    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annStartPoint) {
            this.annStartPoint.onDrag(deltaX, deltaY);
            const startPoint = this.annStartPoint.getPosition();
            this.annBaseLine1.onMoveStartPoint(startPoint);
            this.annBaseLine2.onMoveStartPoint(startPoint);
            this.redrawAngle();
        } else if (this.focusedObj === this.annEndPoint1) {
            this.annEndPoint1.onDrag(deltaX, deltaY);
            this.annBaseLine1.onMoveEndPoint(this.annEndPoint1.getPosition());
            this.redrawAngle();
        } else if (this.focusedObj === this.annEndPoint2) {
            this.annEndPoint2.onDrag(deltaX, deltaY);
            this.annBaseLine2.onMoveEndPoint(this.annEndPoint2.getPosition());
            this.redrawAngle();
        } else if (this.focusedObj === this.annTextIndicator) {
            this.annTextIndicator.onDrag(deltaX, deltaY);
        } else {
            this.onTranslate(deltaX, deltaY);
        }
    }

    onFlip(vertical: boolean) {
        super.onFlip(vertical);
        this.redrawAngle();
    }

    // The arrow of the text indicator will always point to the start point
    getSurroundPointList(): Point[] {
        return [this.annStartPoint.getPosition()];
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private redrawAngle() {
        const radius = this.getAngelRadius();
        const arcStartPoint = AnnTool.pointInLineByDistance(this.annStartPoint.getPosition(), this.annBaseLine1.getEndPosition(), radius);
        const arcEndPoint = AnnTool.pointInLineByDistance(this.annStartPoint.getPosition(), this.annBaseLine2.getEndPosition(), radius);
        let arcMiddlePoint = AnnTool.calcMiddlePointOfArc(arcStartPoint, arcEndPoint, radius);

        const lineCenter = AnnTool.centerPoint(arcStartPoint, arcEndPoint);

        // another middle point
        const newMiddlePoint = { x: lineCenter.x * 2 - arcMiddlePoint.x, y: lineCenter.y * 2 - arcMiddlePoint.y };
        const startPoint = this.annStartPoint.getPosition();

        // The nearest is the wanted
        if (AnnTool.countDistance(startPoint, newMiddlePoint) > AnnTool.countDistance(startPoint, arcMiddlePoint)) {
            arcMiddlePoint = newMiddlePoint;
        }

        const arcData = AnnTool.calcArcBy3Points(arcStartPoint, arcEndPoint, arcMiddlePoint, true);

        if (this.annBaseCurve) {
            this.annBaseCurve.onMove(arcData.centerPoint);
            this.annBaseCurve.setRadius(arcData.radius);
            this.annBaseCurve.setAngle(arcData.startAngle, arcData.endAngle);
            this.annBaseCurve.setAnticlockwise(arcData.anticlockwise);

            this.annTextIndicator.setText(this.annBaseCurve.getText(true));
        } else {
            this.annBaseCurve = new AnnBaseCurve(this, arcData.centerPoint, arcData.radius, arcData.startAngle, arcData.endAngle, arcData.anticlockwise, this.imageViewer);
            this.annTextIndicator = new AnnTextIndicator(this, this.imageViewer);
            this.annTextIndicator.onCreate(this.annBaseCurve.getText(true), startPoint);
        }
    }

    private getAngelRadius(): number {
        const scale = this.image.getScaleValue();
        const len1 = this.annBaseLine1.getLengthInPixel() * scale;
        const len2 = this.annBaseLine2.getLengthInPixel() * scale;
        const radius = Math.min(len1, len2, 30);
        return radius / scale;
    }

    private createPoint(point: Point): AnnPoint {
        const annPoint = new AnnPoint(this, this.imageViewer);
        annPoint.onCreate(point);
        annPoint.onLevelUp("top");

        return annPoint;
    }
}
