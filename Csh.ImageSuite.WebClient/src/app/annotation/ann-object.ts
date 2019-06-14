import { Point, Size, Rectangle, PositionInRectangle, MouseEventType } from '../models/annotation';
import { AnnTool } from "./ann-tool";
import { Image } from "../models/pssi";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { ViewContext, ViewContextEnum } from "../services/view-context.service"
import { AnnSerialize } from "./ann-serialize";

export class Colors {
    static white = "#ffffff";
    static red = "#ff0000";
    static yellow = "#ffff00";
    static green = "#00FF00";
    static blue = "#0000FF";
};

export abstract class AnnObject {
    protected created: boolean;
    protected selected: boolean;
    protected dragging: boolean;
    protected mouseResponsible: boolean;

    protected selectedColor = "#F90";
    protected defaultColor = "#FFF";

    protected image: Image;
    protected layerId: string; 
    protected labelLayerId: string;

    protected minLineWidth = 0.3;
    protected minPointRadius = 2;
    protected minArrowLineLength = 10;
    protected minFontSize = 15;

    protected lineWidth: number;
    protected pointRadius: number;

    protected oldCursor: any;

    protected imageViewer: IImageViewer;

    protected parentObj: AnnObject;
    protected focusedObj: AnnObject;

    protected pixelSpacing: Size;
    protected stepIndex = -1;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {

        this.parentObj = parentObj;
        this.imageViewer = imageViewer;
        this.image = imageViewer.getImage();
        this.layerId = imageViewer.getAnnotationLayerId();
        this.labelLayerId = imageViewer.getAnnLabelLayerId();

        this.created = false;
        this.selected = false;
        this.dragging = false;
        this.mouseResponsible = true;

        this.lineWidth = this.getLineWidth();
        this.pointRadius = this.getPointRadius();

        this.pixelSpacing = this.image.getPixelSpacing();
    }

    isCreated() {
        return this.created;
    }

    isSelected(): boolean {
        return this.selected;
    }

    setStepIndex(stepIndex: number) {
        this.stepIndex = stepIndex;
    }

    getDefaultColor(): string {
        return this.defaultColor;
    }

    getFocusedObj(): AnnObject {
        return this.focusedObj;
    }

    getStepIndex(): number {
        return this.stepIndex;
    }

    setMouseResponsible(mouseResponsible: boolean) {
        this.mouseResponsible = mouseResponsible;
    }

    onChildSelected(selectedObj: AnnObject) {

        this.focusedObj = selectedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the select status
            this.parentObj.onChildSelected(this);
        } else {
            this.onSelect(true, true);
        }
    }

    onChildDragged(draggedObj: any, deltaX: number, deltaY: number) {

        this.focusedObj = draggedObj;

        if (this.parentObj) {
            // If have parent, let parent manage the drag status
            this.parentObj.onChildDragged(this, deltaX, deltaY);
        } else {
            this.onDrag(deltaX, deltaY);
        }
    }

    deleteObject(obj: any) {
        if (AnnTool.isJcanvasObject(obj)) {
            obj.del();
            obj = undefined;
        } else if (obj instanceof AnnObject) {
            let annObj = obj as AnnObject;
            annObj.onDeleteChildren();
            annObj = undefined;
        }
    }

    onKeyDown(keyEvent: any): void {

        if (!this.focusedObj) return;

        let focusedBottomObj = this.focusedObj;
        while (focusedBottomObj.focusedObj) {
            focusedBottomObj = focusedBottomObj.focusedObj;
        }

        // Move 5 screen point by default, or move 1 screen point if ctrl key is pressed
        const step = keyEvent.ctrlKey ? 1 : 5;

        const posImageOld = this.focusedObj.getPosition();
        let posScreen = AnnTool.imageToScreen(posImageOld, focusedBottomObj.parentObj.getTransformMatrix());

        if (keyEvent.code === "ArrowUp") {
            posScreen.y -= step;
        } else if (keyEvent.code === "ArrowDown") {
            posScreen.y += step;
        } else if (keyEvent.code === "ArrowLeft") {
            posScreen.x -= step;
        } else if (keyEvent.code === "ArrowRight") {
            posScreen.x += step;
        }

        const posImageNew = AnnTool.screenToImage(posScreen, focusedBottomObj.parentObj.getTransformMatrix());
        focusedBottomObj.parentObj.onChildDragged(focusedBottomObj, posImageNew.x - posImageOld.x, posImageNew.y - posImageOld.y);
    }

    getLineWidth(): number {
        let lineWidth = 1 / this.image.getScaleValue();
        if (lineWidth < this.minLineWidth) {
            lineWidth = this.minLineWidth;
        }

        return lineWidth;
    }

    getPointRadius(): number {
        let pointRadius = 3 / this.image.getScaleValue();
        if (pointRadius < this.minPointRadius) {
            pointRadius = this.minPointRadius;
        }

        return pointRadius;
    }

    getArrowLineLength(): number {
        let lineLength = 10 / this.image.getScaleValue();
        if (lineLength < this.minArrowLineLength) {
            lineLength = this.minArrowLineLength;
        }

        return lineLength;
    }

    getFontSize(): number {
        const scale = this.image.getScaleValue();
        return scale > 1 ? this.minFontSize : this.minFontSize / scale;
    }

    getTransformMatrix(): any {
        return this.image.transformMatrix;
    }

    getCursor(): any {
        return this.imageViewer.getCursor();
    }

    setCursor(cursor: any): void {
        this.imageViewer.setCursor(cursor);
    }

    setChildDraggable(parentObj: any, child: any, draggable: boolean) {

        child.draggable({
            disabled: !draggable,
            start: arg => {
                console.log(parentObj.constructor.name + " on drag start");
                child._lastPos = {};

            },
            stop: arg => {
                console.log(parentObj.constructor.name + " on drag stop");
                child._lastPos = {};
                if (this.imageViewer.getContext().action === ViewContextEnum.SelectAnn) {
                    parentObj.dragging = false;
                }
            },
            drag: arg => {

                if (this.imageViewer.getContext().action === ViewContextEnum.SelectAnn && this.imageViewer.isDragging()) {
                    const point = AnnTool.screenToImage({ x: arg.x, y: arg.y }, parentObj.getTransformMatrix());

                    
                    parentObj.dragging = true;

                    if (typeof (child._lastPos.x) != "undefined") {
                        const deltaX = point.x - child._lastPos.x;
                        const deltaY = point.y - child._lastPos.y;

                        console.log(parentObj.constructor.name + " do dragging, deltaX = " + deltaX + " deltaY = " + deltaY);
                        //child._x += deltaX;
                        //child._y += deltaY;

                        //if (onDrag) {
                        //    onDrag.call(parentObj, child, deltaX, deltaY);
                        //}

                        if (parentObj.onChildDragged) {
                            parentObj.onChildDragged(child, deltaX, deltaY);
                        }
                    }

                    child._lastPos = point;
                }
                return true;
            }
        });
    }

    setChildMouseEvent(parentObj: AnnObject, child: any) {

        child._onmouseover = arg => {
            if (parentObj.needResponseToChildMouseEvent()) {
                console.log(parentObj.constructor.name + " on mouse over");
                parentObj.onMouseEvent(MouseEventType.MouseOver, arg, child);
                if (!this.imageViewer.isDragging()) {
                    parentObj.oldCursor = parentObj.getCursor();
                    parentObj.setCursor(child.mouseStyle);
                }
                
            }

            return false;
        };

        child._onmouseout = arg => {
            if (parentObj.needResponseToChildMouseEvent()) {
                console.log(parentObj.constructor.name + " on mouse out");
                parentObj.onMouseEvent(MouseEventType.MouseOut, arg, child);
                if (!this.imageViewer.isDragging()) {
                    parentObj.setCursor(undefined);
                }
            }

            return false;
        };

        child._onmousedown = arg => {
            if (parentObj.needResponseToChildMouseEvent()) {
                console.log(parentObj.constructor.name + " on mouse down");
                parentObj.onMouseEvent(MouseEventType.MouseDown, arg, child);
            }

            //arg.event.cancelBubble = true;
            //arg.event.stopPropagation();
            //arg.event.stopImmediatePropagation();
            //arg.event.preventDefault();

            // return false to make sure no other jc object's mouse event will be called
            return false;
        };
    }

    needResponseToChildMouseEvent(): boolean {
        return !this.dragging && this.imageViewer.getContext().action === ViewContextEnum.SelectAnn;
    }


    abstract onSelect(selected: boolean, focused: boolean);
    abstract onDrag(deltaX: number, deltaY: number);
    abstract onTranslate(deltaX: number, deltaY: number);
    abstract onRotate(angle: number);
    abstract onScale();
    abstract onFlip(vertical: boolean);
    abstract onMove(point: Point);
    abstract onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any);
    abstract onLevelUp(level: any);
    abstract onLevelDown(level: any);
    abstract onChildCreated(annChildObj: AnnObject);
    abstract onDeleteChild(annChildObj: AnnObject);
    abstract onDeleteChildren();
    abstract onDrawEnded();
    abstract getRect(): Rectangle;
    abstract getPosition(): Point;
    abstract getSurroundPointList(): Point[];
    abstract setVisible(visible: boolean);
    abstract onLoad(config: any): any;
    abstract onSave(annSerialize: AnnSerialize);
}
