import { Point, Rectangle } from '../../models/annotation';
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnBaseRectangle } from "../base-object/ann-base-rectangle";
import { AnnBaseText } from "../base-object/ann-base-text";

export class AnnText extends AnnExtendObject {

    private annText: AnnBaseText;
    private annRectangle: AnnBaseRectangle;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    onCreate(position: Point, text: string) {
        this.annText = new AnnBaseText(this, " " + text + " ", position, this.imageViewer);
        const rect = this.annText.getRect();
        this.annRectangle = new AnnBaseRectangle(this, { x: rect.x, y: rect.y }, rect.width, rect.height, this.imageViewer, true);
        this.annText.onLevelUp();

        this.focusedObj = this.annText;

        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onSelect(selected: boolean, focused: boolean) {

        this.selected = selected;
        this.annText.onSelect(selected, focused);
        this.annRectangle.setVisible(selected && focused);
    }

    onScale() {
        super.onScale();

        this.redrawRect();
        this.onLevelUp();
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

    getRect(): Rectangle {
        return this.annText.getRect();
    }

    private redrawRect() {
        const rect = this.annText.getRect();
        this.annRectangle.redraw(rect);
        this.annText.onLevelUp();
    }
}