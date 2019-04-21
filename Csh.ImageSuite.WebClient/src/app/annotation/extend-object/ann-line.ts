import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IAnnotationObject } from "../../interfaces/annotation-object-interface";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseLine } from "../base-object/ann-base-line";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnPoint } from "./ann-point";

export class AnnLine extends AnnExtendObject implements IAnnotationObject{
    
    private annLine: AnnBaseLine;
    private annStartPoint: AnnPoint;
    private annEndPoint: AnnPoint;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
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

                this.onDrawEnded();

                this.focusedObj = this.annLine;
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
                    this.annStartPoint.onLevelUp();
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

        this.focusedObj = this.annLine;
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