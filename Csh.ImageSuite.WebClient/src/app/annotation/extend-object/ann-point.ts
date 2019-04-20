import { Point } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IAnnotationObject } from "../../interfaces/annotation-object-interface";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseCircle } from "../base-object/ann-base-circle";

export class AnnPoint extends AnnObject implements IAnnotationObject{

    private annCenterCircle: AnnBaseCircle;
    private annOuterCircle: AnnBaseCircle;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        
    }

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj: any) {

        const imagePoint = AnnObject.screenToImage(point, this.getTransformMatrix());
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            this.onCreate(imagePoint);
        }
    }

    onCreate(position: Point) {
        this.annCenterCircle = new AnnBaseCircle(this, position, this.pointRadius, this.imageViewer, true);
        this.annOuterCircle = new AnnBaseCircle(this, position, this.pointRadius * 2, this.imageViewer, false);
        this.annOuterCircle.setVisible(false);
    }

    onSwitchFocus() {

    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect Point " + selected + " " + focused);

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.annCenterCircle;
        }

        this.annCenterCircle.setVisible(selected);
        this.annCenterCircle.setColor(color);

        this.annOuterCircle.setVisible(selected && focused);
    }

    onDrawEnded() {
        this.annCenterCircle.onDrawEnded();
        this.annOuterCircle.onDrawEnded();
    }

    onScale() {
        this.annCenterCircle.onScale();
        this.annOuterCircle.onScale();
    }

    onFlip(vertical: boolean) {
        this.annCenterCircle.onFlip(vertical);
        this.annOuterCircle.onFlip(vertical);
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annCenterCircle.onTranslate(deltaX, deltaY);
        this.annOuterCircle.onTranslate(deltaX, deltaY);
    }

    onDeleteChildren() {
        this.deleteObject(this.annCenterCircle);
        this.deleteObject(this.annOuterCircle);
    }

    setRadius(radius: number) {
        this.annCenterCircle.setRadius(radius);
        this.annOuterCircle.setRadius(radius * 2);
    }

    onMove(point: Point) {
        this.annCenterCircle.onMove(point);
        this.annOuterCircle.onMove(point);
    }

    getPosition(): Point {
        return this.annCenterCircle.getPosition();
    }

    up() {
        if (this.annCenterCircle) {
            this.annCenterCircle.up();
        }

        if (this.annOuterCircle) {
            this.annOuterCircle.up();
        }
    }

    down() {
        if (this.annCenterCircle) {
            this.annCenterCircle.down();
        }

        if (this.annOuterCircle) {
            this.annOuterCircle.down();
        }
    }

}