import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBasePoint } from "./base-object/ann-base-point";
import { AnnBaseLine } from "./base-object/ann-base-line";

export class AnnLine extends AnnObject implements IAnnotationObject{
    
    private annLine: AnnBaseLine;
    private annStartPoint: AnnBasePoint;
    private annEndPoint: AnnBasePoint;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }    

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IAnnotationObject

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        point = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (!this.annStartPoint) {
                this.annStartPoint = new AnnBasePoint(this, point, this.imageViewer);
            } else {

                this.annStartPoint.onDrawEnded();
                this.annEndPoint.onDrawEnded();
                this.annLine.onDrawEnded();

                this.focusedObj = this.annEndPoint;
                this.created = true;

                if (!this.parentObj) {
                    // Parent not set, this mean it is not a child of a parentObj annotion. 
                    this.imageViewer.onAnnotationCreated(this);
                }
                
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annStartPoint) {
                if (this.annLine) {
                    this.annLine.moveEndTo(point);
                    this.annEndPoint.moveTo(point);
                } else {
                    this.annEndPoint = new AnnBasePoint(this, point, this.imageViewer);
                    this.annLine = new AnnBaseLine(this, this.annStartPoint.getPosition(), point, this.imageViewer);

                    // Make sure the start point is on the top the line So that we can easily select it for moving
                    if (this.annStartPoint.jcCenterPoint) {
                        this.annStartPoint.jcCenterPoint.up();
                    }
                }
            }
        }
    }


    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annStartPoint) {
            this.onStartPointDragged(deltaX, deltaY);
        } else if (this.focusedObj === this.annEndPoint) {
            this.onEndPointDragged(deltaX, deltaY);
        }else {
            this.onLineDragged(deltaX, deltaY);
        }
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect AnnLine");
        this.selected = selected;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.annLine;
        }

        this.annStartPoint.onSelect(selected, this.focusedObj === this.annStartPoint);
        this.annEndPoint.onSelect(selected, this.focusedObj === this.annEndPoint);
        this.annLine.onSelect(selected, this.focusedObj === this.annLine);

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onScale() {
        this.annLine.onScale();
        this.annStartPoint.onScale();
        this.annEndPoint.onScale();
    }

    onFlip(vertical: boolean) {

        this.annLine.onFlip(vertical);
        this.annStartPoint.onFlip(vertical);
        this.annEndPoint.onFlip(vertical);
    }

    onSwitchFocus() {
         if (!this.focusedObj || this.focusedObj === this.annLine) {
             this.onChildSelected(this.annStartPoint);
         }else if (this.focusedObj === this.annStartPoint) {
             this.onChildSelected(this.annEndPoint);
         } else {
             this.onChildSelected(this.annLine);
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private onStartPointDragged(deltaX: number, deltaY: number) {
        this.annStartPoint.onTranslate(deltaX, deltaY);
        const point = this.annStartPoint.getPosition();
        this.annLine.moveStartTo(point);
    }

    private onEndPointDragged(deltaX: number, deltaY: number) {
        this.annEndPoint.onTranslate(deltaX, deltaY);
        const point = this.annEndPoint.getPosition();
        this.annLine.moveEndTo(point);
    }

    private onLineDragged(deltaX: number, deltaY: number) {
        this.annStartPoint.onTranslate(deltaX, deltaY);
        this.annLine.onTranslate(deltaX, deltaY);
        this.annEndPoint.onTranslate(deltaX, deltaY);
    }
}