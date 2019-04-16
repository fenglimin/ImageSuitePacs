import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBasePoint } from "./base-object/ann-base-point";
import { AnnBaseLine } from "./base-object/ann-base-line";
import { AnnLine } from "./ann-line";

export class AnnArrow extends AnnObject implements IAnnotationObject {

    private annLine: AnnLine;
    private annArrowLineA: AnnBaseLine;
    private annArrowLineB: AnnBaseLine;

    constructor(parent: AnnObject, imageViewer: IImageViewer) {
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
                    // Parent not set, this mean it is not a child of a parentObj annotion. 
                    this.imageViewer.onAnnotationCreated(this);
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annLine) {
                this.annLine.onMouseEvent(mouseEventType, point, null);
                this.redrawArrow(imagePoint, this.annLine.getStartPosition());
            }
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        this.annLine.onDrag(deltaX, deltaY);
        this.redrawArrow(this.annLine.getEndPosition(), this.annLine.getStartPosition());
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect AnnLine");
        this.selected = selected;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.annLine;
        }

        this.annLine.onSelect(selected, this.focusedObj === this.annLine);
        this.annArrowLineA.onSelect(selected, false);
        this.annArrowLineB.onSelect(selected, false);

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onScale() {
        this.annLine.onScale();

        this.annArrowLineA.onScale();
        this.annArrowLineB.onScale();
        this.redrawArrow(this.annLine.getEndPosition(), this.annLine.getStartPosition());
    }

    onFlip(vertical: boolean) {

        this.annLine.onFlip(vertical);
        this.annArrowLineA.onFlip(vertical);
        this.annArrowLineB.onFlip(vertical);
    }

    onSwitchFocus() {
        this.annLine.onSwitchFocus();
    }

    onDeleteChildren() {
        this.deleteObject(this.annLine);
        this.deleteObject(this.annArrowLineA);
        this.deleteObject(this.annArrowLineB);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private redrawArrow(endPoint: Point, startPoint: Point) {
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
            this.annArrowLineA.moveStartTo(endPoint);
            this.annArrowLineA.moveEndTo(lineAEndPoint);

            this.annArrowLineB.moveStartTo(endPoint);
            this.annArrowLineB.moveEndTo(lineBEndPoint);

        } else {
            this.annArrowLineA = new AnnBaseLine(this, endPoint, lineAEndPoint, this.imageViewer);
            this.annArrowLineB = new AnnBaseLine(this, endPoint, lineBEndPoint, this.imageViewer);
        }
    }
}