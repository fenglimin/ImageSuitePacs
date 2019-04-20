import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";

export class AnnBasePoint extends AnnBaseObject {

    jcCenterPoint: any;
    jcOuterCircle: any;

    constructor(parentObj: AnnObject, position: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        this.jcOuterCircle = jCanvaScript.circle(position.x, position.y, this.pointRadius * 2, this.selectedColor, false).layer(this.layerId);
        this.jcOuterCircle._lineWidth = this.lineWidth;
        this.jcOuterCircle.mouseStyle = "crosshair";
        this.jcOuterCircle.visible(false);
        this.jcOuterCircle.parentObj = this;

        this.jcCenterPoint = jCanvaScript.circle(position.x, position.y, this.pointRadius, this.selectedColor, true).layer(this.layerId);
        this.jcCenterPoint.mouseStyle = "crosshair";
        this.jcCenterPoint.parentObj = this;
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect Point " + selected + " " + focused);

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.jcCenterPoint;
        }

        this.jcCenterPoint.visible(selected);
        this.jcCenterPoint.color(color);

        this.jcOuterCircle.visible(selected && focused);
    }

    onDrawEnded() {
        this.setChildDraggable(this, this.jcCenterPoint, true);
        this.setChildMouseEvent(this, this.jcCenterPoint);
    }

    onScale() {
        this.setRadius(this.parentObj.getPointRadius());
        this.jcOuterCircle._lineWidth = this.parentObj.getLineWidth();

        this.up();
    }

    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcCenterPoint._y = this.image.height() - this.jcCenterPoint._y;
            this.jcOuterCircle._y = this.jcCenterPoint._y;
        } else {
            this.jcCenterPoint._x = this.image.width() - this.jcCenterPoint._x;
            this.jcOuterCircle._x = this.jcCenterPoint._x;
        }

    }

    onTranslate(deltaX: number, deltaY: number) {
        this.jcCenterPoint._x += deltaX;
        this.jcCenterPoint._y += deltaY;

        this.jcOuterCircle._x += deltaX;
        this.jcOuterCircle._y += deltaY;
    }

    onDeleteChildren() {
        this.deleteObject(this.jcCenterPoint);
        this.deleteObject(this.jcOuterCircle);
    }

    setRadius(radius: number) {
        this.jcCenterPoint._radius = radius;
        this.jcOuterCircle._radius = radius * 2;
    }

    onMove(point: Point) {
        this.jcCenterPoint._x = point.x;
        this.jcCenterPoint._y = point.y;

        this.jcOuterCircle._x = point.x;
        this.jcOuterCircle._y = point.y;
    }

    getPosition(): Point {
        return { x: this.jcOuterCircle._x, y: this.jcOuterCircle._y }
    }

    up() {
        if (this.jcOuterCircle) {
            this.jcOuterCircle.up();
        }

        if (this.jcCenterPoint) {
            this.jcCenterPoint.up();
        }
    }

    down() {
        if (this.jcOuterCircle) {
            this.jcOuterCircle.down();
        }

        if (this.jcCenterPoint) {
            this.jcCenterPoint.down();
        }
    }

}