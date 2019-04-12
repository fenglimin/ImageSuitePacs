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

    constructor(imageViewer: IImageViewer) {
        super(imageViewer);
    }    

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IAnnotationObject

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        point = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (!this.annStartPoint) {
                this.annStartPoint = new AnnBasePoint(this, point, this.imageViewer);
            } else {

                this.annStartPoint.onDrawEnded(this.onStartPointDragged, this.onChildSelected);
                this.annEndPoint.onDrawEnded(this.onEndPointDragged, this.onChildSelected);
                this.annLine.onDrawEnded(this.onLineDragged, this.onChildSelected);

                this.focusedObj = this.annEndPoint;
                this.created = true;
                this.imageViewer.onAnnotationCreated(this);
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
        } else if (mouseEventType === MouseEventType.MouseOver) {
            if (!this.selected) {
                this.setChild(true);
            }
        } else if (mouseEventType === MouseEventType.MouseOut) {
            if (!this.selected) {
                this.setChild(false);
            }
        } 
    }

    onChildSelected(selectedObj: AnnObject) {
        this.selected = true;
        this.focusedObj = selectedObj;
        this.setChild(true);
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect AnnLine");
        if (this.isSelected() !== selected) {
            this.selected = selected;
            this.setChild(selected);
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

    private setChild(selected: boolean) {
        this.annStartPoint.onSelect(selected, this.focusedObj === this.annStartPoint);
        this.annEndPoint.onSelect(selected, this.focusedObj === this.annEndPoint);
        this.annLine.onSelect(selected, this.focusedObj === this.annEndPoint);

        if (this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }    

    private onStartPointDragged(draggedObj: any, deltaX: number, deltaY: number) {
        const point = this.annStartPoint.getPosition();
        this.annLine.moveStartTo(point);
    }

    private onEndPointDragged(draggedObj: any, deltaX: number, deltaY: number) {
        const point = this.annEndPoint.getPosition();
        this.annLine.moveEndTo(point);
    }

    private onLineDragged(draggedObj: any, deltaX: number, deltaY: number) {

        this.annStartPoint.onTranslate(deltaX, deltaY);
        this.annLine.onTranslate(deltaX, deltaY);
        this.annEndPoint.onTranslate(deltaX, deltaY);
    }
}