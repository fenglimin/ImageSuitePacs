import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";


export class AnnBaseEllipse extends AnnObject {

    jcEllipse: any;

    constructor(parentObj: AnnObject, center: Point, width: number, height: number, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcEllipse = jCanvaScript.ellipse(center.x, center.y, Math.abs(width), Math.abs(height), this.selectedColor).layer(this.layerId);
        this.jcEllipse._lineWidth = this.lineWidth;
        this.jcEllipse.mouseStyle = "move";
        this.jcEllipse.parentObj = this;
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect Point " + selected + " " + focused);

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.jcEllipse;
        }

        this.jcEllipse.color(color);
    }

    onDrawEnded() {
        this.setChildDraggable(this, this.jcEllipse, true);
        this.setChildMouseEvent(this, this.jcEllipse);
    }


    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        if (mouseEventType === MouseEventType.MouseDown) {
            console.log("onMouseEvent Point");
            this.onChildSelected(mouseObj);
        }
    }

    onScale() {
        this.jcEllipse._lineWidth = this.parentObj.getLineWidth();

        this.up();
    }

    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcEllipse._y = this.image.height() - this.jcEllipse._y;
        } else {
            this.jcEllipse._x = this.image.width() - this.jcEllipse._x;
        }

    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcEllipse._x += deltaX;
        this.jcEllipse._y += deltaY;
    }

    onDeleteChildren() {
        this.deleteObject(this.jcEllipse);
    }

    getPosition(): Point {
        return { x: this.jcEllipse._x, y: this.jcEllipse._y }
    }

    up() {
        if (this.jcEllipse) {
            this.jcEllipse.up();
        }
    }

    setWidth(width: number) {
        this.jcEllipse._width = Math.abs(width);
        this.checkCircle();
    }

    setHeigth(height: number) {
        this.jcEllipse._height = Math.abs(height);
        this.checkCircle();
    }

    getWidth(): number {
        return this.jcEllipse._width;
    }

    getHeight(): number {
        return this.jcEllipse._height;
    }

    checkCircle() {
        const isCircle = Math.round(this.getWidth()) === Math.round(this.getHeight());
        this.jcEllipse.color( isCircle? "#F00" : this.selectedColor);
    }
}