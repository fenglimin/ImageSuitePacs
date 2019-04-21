import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";
import { AnnLine } from "./ann-line";

export class AnnArrow extends AnnExtendObject {

    private annLine: AnnLine;
    private annArrowLineA: AnnBaseLine;
    private annArrowLineB: AnnBaseLine;

    constructor(parent: AnnExtendObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
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

            if (!this.annLine) {
                this.annLine = new AnnLine(this, this.imageViewer);
                this.annLine.onMouseEvent(mouseEventType, point, null);
            } else {
                this.annLine.onMouseEvent(mouseEventType, point, null);

                this.created = true;

                if (!this.parentObj) {
                    // Parent not set, this mean it is not a child of a parentObj annotation. 
                    this.imageViewer.onAnnotationCreated(this);
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annLine) {
                this.annLine.onMouseEvent(mouseEventType, point, null);
                this.redrawArrow(this.annLine.getStartPosition(), imagePoint);
            }
        }
    }

    onCreate(arrowStartPoint: Point, arrowEndPoint: Point) {
        this.onDeleteChildren();

        this.annLine = new AnnLine(this, this.imageViewer);
        this.annLine.onCreate(arrowStartPoint, arrowEndPoint);
        this.redrawArrow(arrowStartPoint, arrowEndPoint);
    }

    onDrag(deltaX: number, deltaY: number) {
        this.annLine.onDrag(deltaX, deltaY);
        this.redrawArrow(this.annLine.getStartPosition(), this.annLine.getEndPosition());
    }

    onScale() {
        super.onScale();
        this.redrawArrow(this.annLine.getStartPosition(), this.annLine.getEndPosition());
    }

    onSwitchFocus() {
        this.annLine.onSwitchFocus();
    }

    onMoveStartPoint(point: Point) {
        this.annLine.onMoveStartPoint(point);
        const endPoint = this.annLine.getEndPosition();
        this.redrawArrow(point, endPoint);
    }

    onMoveEndPoint(point: Point) {
        this.annLine.onMoveEndPoint(point);
        const startPoint = this.annLine.getStartPosition();
        this.redrawArrow(startPoint, point);
    }

    getStartPosition(): Point {
        return this.annLine.getStartPosition();
    }

    getEndPosition(): Point {
        return this.annLine.getEndPosition();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private redrawArrow(startPoint: Point, endPoint: Point) {
        const arrowLength = this.getArrowLineLength();
        const sineTheta = AnnObject.getSineTheta(endPoint, startPoint);
        const cosineTheta = AnnObject.getCosineTheta(endPoint, startPoint);

        const lineAEndPoint = {
            x: endPoint.x + arrowLength * cosineTheta - arrowLength / 2.0 * sineTheta,
            y: endPoint.y + arrowLength * sineTheta + arrowLength / 2.0 * cosineTheta
        };

        const lineBEndPoint = {
            x: endPoint.x + arrowLength * cosineTheta + arrowLength / 2.0 * sineTheta,
            y: endPoint.y + arrowLength * sineTheta - arrowLength / 2.0 * cosineTheta
        }

        if (this.annArrowLineA && this.annArrowLineB) {
            this.annArrowLineA.onMoveStartPoint(endPoint);
            this.annArrowLineA.onMoveEndPoint(lineAEndPoint);

            this.annArrowLineB.onMoveStartPoint(endPoint);
            this.annArrowLineB.onMoveEndPoint(lineBEndPoint);

        } else {
            this.annArrowLineA = new AnnBaseLine(this, endPoint, lineAEndPoint, this.imageViewer);
            this.annArrowLineB = new AnnBaseLine(this, endPoint, lineBEndPoint, this.imageViewer);
        }
    }
}