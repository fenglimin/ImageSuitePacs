﻿import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBasePoint } from "./base-object/ann-base-point";
import { AnnBaseLine } from "./base-object/ann-base-line";
import { AnnLine } from "./ann-line";

export class AnnArrow extends AnnObject implements IAnnotationObject {

    private annLine: AnnLine;
    private annAdd: any;

    constructor(parent: AnnObject, imageViewer: IImageViewer) {
        super(parent, imageViewer);
    } 

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Implementation of interface IAnnotationObject

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        const imagePoint = AnnObject.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            if (!this.annLine) {
                this.annLine = new AnnLine(this, this.imageViewer);
                this.annLine.onMouseEvent(mouseEventType, point);
            } else {
                this.annLine.onMouseEvent(mouseEventType, point);

                this.created = true;

                if (!this.parentObj) {
                    // Parent not set, this mean it is not a child of a parentObj annotion. 
                    this.imageViewer.onAnnotationCreated(this);
                }
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annLine) {
                this.annLine.onMouseEvent(mouseEventType, point);
                if (!this.annAdd) {
                    this.annAdd = jCanvaScript.rect(imagePoint.x, imagePoint.y, 100, 100, this.selectedColor).layer(this.layerId);
                } else {
                    this.annAdd._x = imagePoint.x;
                    this.annAdd._y = imagePoint.y;
                }
            }
        }
    }

    onChildDragged(draggedObj: any, deltaX: number, deltaY: number) {

        this.focusedObj = draggedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the drag status
            this.parentObj.onChildDragged(this, deltaX, deltaY);
        } else {
            this.onDrag(draggedObj, deltaX, deltaY);
        }
    }

    onDrag(draggedObj: any, deltaX: number, deltaY: number) {
        //this.annLine.onDrag();
    }

    onChildSelected(selectedObj: AnnObject) {
        this.selected = true;
        this.focusedObj = selectedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the select status
            this.parentObj.onChildSelected(selectedObj);
        } else {
            this.onSelect(true, true);
        }
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect AnnLine");
        this.selected = selected;

        if (!this.parentObj && this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }

    onScale() {
        this.annLine.onScale();
    }

    onFlip(vertical: boolean) {

        this.annLine.onFlip(vertical);
    }

    onSwitchFocus() {

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions

    private setChild(selected: boolean) {
        this.annLine.onSelect(selected, this.focusedObj === this.annLine);

        if (this.selected) {
            this.imageViewer.selectAnnotation(this);
        }
    }    
}