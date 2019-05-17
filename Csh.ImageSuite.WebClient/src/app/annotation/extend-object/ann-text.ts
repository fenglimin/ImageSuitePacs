import { Point, Rectangle, MouseEventType } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnBaseRectangle } from "../base-object/ann-base-rectangle";
import { AnnBaseText } from "../base-object/ann-base-text";
import { AnnSerialize } from "../ann-serialize";

export class AnnText extends AnnExtendObject {

    private annBaseText: AnnBaseText;
    private annRectangle: AnnBaseRectangle;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onCreate(position: Point, text: string) {
        this.annBaseText = new AnnBaseText(this, " " + text + " ", position, this.imageViewer);
        const rect = this.annBaseText.getRect();
        this.annRectangle = new AnnBaseRectangle(this, { x: rect.x, y: rect.y }, rect.width, rect.height, this.imageViewer, true);
        this.annBaseText.onLevelUp();

        this.focusedObj = this.annBaseText;

        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnText");
        annSerialize.writeNumber(2, 4);
        annSerialize.writeNumber(1, 4);
        annSerialize.writeNumber(1, 1);

        const pointList = this.annRectangle.getSurroundPointList();
        annSerialize.writePoint(pointList[2]);
        annSerialize.writePoint(pointList[0]);
        annSerialize.writeString(this.annBaseText.getText());
        annSerialize.writeNumber(1, 4);
        annSerialize.writeNumber(0, 4);
        annSerialize.writeNumber(20, 4);
    }

    onSelect(selected: boolean, focused: boolean) {

        this.selected = selected;
        this.annBaseText.onSelect(selected, focused);
        this.annRectangle.setVisible(selected && focused);
    }

    onScale() {
        super.onScale();

        this.redrawRect();
        this.onLevelUp();
    }

    onMove(point: Point) {
        this.annBaseText.onMove(point);
        this.redrawRect();
    }

    getPosition(): Point {
        return this.annRectangle.getPosition();
    }

    getSurroundPointList(): Point[] {
        return this.annRectangle.getSurroundPointList();
    }

    setText(text: string) {
        this.annBaseText.setText(text);
        this.redrawRect();
    }

    getRect(): Rectangle {
        return this.annBaseText.getRect();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private redrawRect() {
        const rect = this.annBaseText.getRect();
        this.annRectangle.redraw(rect);
        this.annBaseText.onLevelUp();
    }
}