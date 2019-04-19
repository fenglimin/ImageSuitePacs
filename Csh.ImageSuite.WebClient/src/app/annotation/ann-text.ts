import { Point } from '../models/annotation';
import { MouseEventType, AnnObject } from './ann-object';
import { IAnnotationObject } from "../interfaces/annotation-object-interface";
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnBaseText } from "./base-object/ann-base-text";
import { AnnBaseRectangle } from "./base-object/ann-base-rectangle";

export class AnnText extends AnnObject implements IAnnotationObject {

    onMouseEvent(mouseEventType: MouseEventType, point: Point, mouseObj): void { throw new Error("Not implemented"); }

    onSwitchFocus(): void { throw new Error("Not implemented"); }

    private annText: AnnBaseText;
    private annRectangle: AnnBaseRectangle;

    constructor(parentObj: AnnObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    onCreate(position: Point, text: string) {
        this.annText = new AnnBaseText(this, " " + text + " ", position, this.imageViewer);
        const rect = this.annText.getRect();
        this.annRectangle = new AnnBaseRectangle(this, { x: rect.x, y: rect.y }, rect.width, rect.height, this.imageViewer, true);

        this.onDrawEnded();
        this.up();
    }

    onDrag(deltaX: number, deltaY: number) {
        this.onTranslate(deltaX, deltaY);
    }

    onSelect(selected: boolean, focused: boolean) {

        console.log("onSelect Point " + selected + " " + focused);

        this.selected = selected;
        const color = selected ? this.selectedColor : this.defaultColor;

        if (focused && !this.focusedObj) {
            this.focusedObj = this.annText;
        }

        this.annText.setColor(color);

        this.annRectangle.setVisible(selected && focused);
    }

    onDrawEnded() {
        this.annText.onDrawEnded();
    }

    onScale() {
        this.annText.onScale();
        this.annRectangle.onScale();

        this.redrawRect();

        this.up();
    }

    onFlip(vertical: boolean) {
        this.annText.onFlip(vertical);
        this.annRectangle.onFlip(vertical);
    }

    onTranslate(deltaX: number, deltaY: number) {
        this.annText.onTranslate(deltaX, deltaY);
        this.annRectangle.onTranslate(deltaX, deltaY);
    }

    onDeleteChildren() {
        this.deleteObject(this.annText);
        this.deleteObject(this.annRectangle);
    }

    onMove(point: Point) {
        this.annText.onMove(point);
        this.redrawRect();
    }

    getPosition(): Point {
        return this.annRectangle.getPosition();
    }

    getSurroundPointList(): Point[] {
        return this.annRectangle.getSurroundPointList();
    }

    setText(text: string) {
        this.annText.setText(text);
        this.redrawRect();
    }

    up() {
        if (this.annText) {
            this.annText.up();
        }
    }

    private redrawRect() {
        const rect = this.annText.getRect();
        this.annRectangle.redraw(rect);
    }
}