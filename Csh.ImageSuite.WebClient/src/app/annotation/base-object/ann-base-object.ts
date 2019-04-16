import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";


export class AnnBaseObject extends AnnObject {

    jcObj: any;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);
    }

    setJcObj() {
        if (this.jcObj) {
            this.jcObj._lineWidth = this.lineWidth;
            this.jcObj.mouseStyle = "move";
            this.jcObj.parentObj = this;
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onSelect(selected: boolean, focused: boolean) {

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.jcObj;
        }

        this.jcObj.color(color);
    }

    onDrawEnded() {
        this.setChildDraggable(this, this.jcObj, true);
        this.setChildMouseEvent(this, this.jcObj);
    }


    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        if (mouseEventType === MouseEventType.MouseDown) {
            console.log("onMouseEvent Point");
            this.onChildSelected(mouseObj);
        }
    }

    onScale() {
        this.jcObj._lineWidth = this.parentObj.getLineWidth();
    }

    onFlip(vertical: boolean) {
        if (vertical) {
            this.jcObj._y = this.image.height() - this.jcObj._y;
        } else {
            this.jcObj._x = this.image.width() - this.jcObj._x;
        }
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcObj._x += deltaX;
        this.jcObj._y += deltaY;
    }

    onMove(point: Point) {
        this.jcObj._x = point.x;
        this.jcObj._y = point.y;
    }

    onDeleteChildren() {
        this.deleteObject(this.jcObj);
    }

    getPosition(): Point {
        return { x: this.jcObj._x, y: this.jcObj._y }
    }

    setStartPosition(point: Point) {
        this.jcObj._x = point.x;
        this.jcObj._y = point.y;
    }

    setWidth(width: number) {
        this.jcObj._width = width;
    }

    setHeight(height: number) {
        this.jcObj._height = height;
    }

    getWidth(): number {
        return this.jcObj._width;
    }

    getHeight(): number {
        return this.jcObj._height;
    }

    up() {
        if (this.jcObj) {
            this.jcObj.up();
        }
    }
}