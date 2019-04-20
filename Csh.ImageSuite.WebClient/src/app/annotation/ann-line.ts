import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBaseLine } from "./base-object/ann-base-line";
import { AnnPoint } from "./extend-object/ann-point";

export class AnnLine extends AnnObject implements IAnnotationObject{
    
    private annLine: AnnBaseLine;
    private annStartPoint: AnnPoint;
    private annEndPoint: AnnPoint;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
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

            if (!this.annStartPoint) {
                this.annStartPoint = new AnnPoint(this, this.imageViewer);
                this.annStartPoint.onCreate(imagePoint);
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
                    this.annLine.onMoveEndPoint(imagePoint);
                    this.annEndPoint.onMove(imagePoint);
                } else {
                    this.annEndPoint = new AnnPoint(this, this.imageViewer);
                    this.annEndPoint.onCreate(imagePoint);
                    this.annLine = new AnnBaseLine(this, this.annStartPoint.getPosition(), imagePoint, this.imageViewer);

                    // Make sure the start point is on the top the line So that we can easily select it for moving
                    this.annStartPoint.up();
                }
            }
        }
    }

    onCreate(startPoint: Point, endPoint: Point) {
        this.onDeleteChildren();

        this.annLine = new AnnBaseLine(this, startPoint, endPoint, this.imageViewer);
        this.annStartPoint = new AnnPoint(this, this.imageViewer);
        this.annStartPoint.onCreate(startPoint);
        this.annEndPoint = new AnnPoint(this, this.imageViewer);
        this.annEndPoint.onCreate(endPoint);
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annStartPoint) {
            this.onDragStartPoint(deltaX, deltaY);
        } else if (this.focusedObj === this.annEndPoint) {
            this.onDragEndPoint(deltaX, deltaY);
        }else {
            this.onTranslate(deltaX, deltaY);
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

    onTranslate(deltaX: number, deltaY: number) {
        this.annStartPoint.onTranslate(deltaX, deltaY);
        this.annLine.onTranslate(deltaX, deltaY);
        this.annEndPoint.onTranslate(deltaX, deltaY);
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

    onDeleteChildren() {
        this.deleteObject(this.annStartPoint);
        this.deleteObject(this.annEndPoint);
        this.deleteObject(this.annLine);
    }

    onMoveStartPoint(point: Point) {
        this.annLine.onMoveStartPoint(point);
        this.annStartPoint.onMove(point);
    }

    onMoveEndPoint(point: Point) {
        this.annLine.onMoveEndPoint(point);
        this.annEndPoint.onMove(point);
    }

    getStartPosition(): Point {
        return this.annLine.getStartPosition();
    }

    getEndPosition(): Point {
        return this.annLine.getEndPosition();
    }

    down() {
        this.annLine.down();
        this.annStartPoint.down();
        this.annEndPoint.down();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private onDragStartPoint(deltaX: number, deltaY: number) {
        this.annStartPoint.onTranslate(deltaX, deltaY);
        const point = this.annStartPoint.getPosition();
        this.annLine.onMoveStartPoint(point);
    }

    private onDragEndPoint(deltaX: number, deltaY: number) {
        this.annEndPoint.onTranslate(deltaX, deltaY);
        const point = this.annEndPoint.getPosition();
        this.annLine.onMoveEndPoint(point);
    }

    
}