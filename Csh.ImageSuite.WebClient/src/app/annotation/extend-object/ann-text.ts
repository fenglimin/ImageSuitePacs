import { Point, Rectangle, MouseEventType } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnBaseRectangle } from "../base-object/ann-base-rectangle";
import { AnnBaseText } from "../base-object/ann-base-text";
import { AnnSerialize } from "../ann-serialize";
import { AnnPoint } from "../extend-object/ann-point";
import { AnnTool } from "../ann-tool";

export class AnnText extends AnnExtendObject {

    private annBaseText: AnnBaseText;
    private annRectangle: AnnBaseRectangle;
    private forTextIndicator: boolean;
    private annPosPoint: AnnPoint;
    private annAdjustPoint: AnnPoint;
    
    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onCreate(position: Point, text: string, forTextIndicator: boolean = true) {
        this.forTextIndicator = forTextIndicator;
        this.annBaseText = new AnnBaseText(this, " " + text + " ", position, this.imageViewer);
        this.annBaseText.setFontSizeFixed(!forTextIndicator);

        const rect = this.annBaseText.getRect();
        this.annRectangle = new AnnBaseRectangle(this, { x: rect.x, y: rect.y }, rect.width, rect.height, this.imageViewer, true);

        const posPoint = { x: rect.x, y: rect.y + rect.height };
        const posAnn = AnnTool.annLabelLayerToAnnLayer(posPoint, this.imageViewer);
        this.annPosPoint = new AnnPoint(this, this.imageViewer);
        this.annPosPoint.onCreate(posAnn);
        this.annPosPoint.setVisible(false);

        const adjustPoint = { x: rect.x + rect.width, y: rect.y + rect.height };
        const adjustAnn = AnnTool.annLabelLayerToAnnLayer(adjustPoint, this.imageViewer);
        this.annAdjustPoint = new AnnPoint(this, this.imageViewer);
        this.annAdjustPoint.onCreate(adjustAnn);

        this.annBaseText.onLevelDown("bottom");
        this.focusedObj = this.annBaseText;

        if (!this.parentObj) {
            this.onDrawEnded();
        }
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnText");
        annSerialize.writeInteger(1, 4);
        annSerialize.writeInteger(0, 4);
        annSerialize.writeInteger(0, 1);

        const pointList = this.annRectangle.getSurroundPointList();
        annSerialize.writeIntegerPoint(pointList[2]);
        annSerialize.writeIntegerPoint(pointList[0]);

        annSerialize.writeString(this.annBaseText.getText().trim());
        annSerialize.writeInteger(1, 4);
        annSerialize.writeInteger(0, 4);
        annSerialize.writeInteger(20, 4);
    }

    onScale() {
        if (this.forTextIndicator) {
            super.onScale();
            this.redrawByText();
        } else {
            this.annRectangle.onScale();
            this.annPosPoint.onScale();
            this.annAdjustPoint.onScale();
        }
    }

    onFlip(vertical: boolean) {
        this.annPosPoint.onFlip(vertical);
        this.redrawByPosPoint();
    }

    onRotate(angle: number) {
        this.annPosPoint.onRotate(angle);
        this.redrawByPosPoint();
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annRectangle) {
            this.annBaseText.onDrag(deltaX, deltaY);
            this.redrawByText();
        } else if (this.focusedObj === this.annAdjustPoint) {

        }
    }

    onMove(point: Point) {
        this.annPosPoint.onMove(point);
        this.redrawByPosPoint();
    }

    getPosition(): Point {
        return this.annRectangle.getPosition();
    }

    getSurroundPointList(): Point[] {
        return this.annRectangle.getSurroundPointList();
    }

    setText(text: string) {
        this.annBaseText.setText(text);
        this.redrawByPosPoint();
    }

    getRect(): Rectangle {
        return this.annBaseText.getRect();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private redrawByPosPoint() {
        this.annBaseText.onMove(this.annPosPoint.getPosition());
        const rect = this.annBaseText.getRect();
        this.annRectangle.redraw(rect);
        this.annBaseText.onLevelUp();

        const adjustPoint = { x: rect.x + rect.width, y: rect.y + rect.height };
        const adjustAnn = AnnTool.annLabelLayerToAnnLayer(adjustPoint, this.imageViewer);
        this.annAdjustPoint.onMove(adjustAnn);
    }

    private redrawByText() {
        const rect = this.annBaseText.getRect();
        this.annRectangle.redraw(rect);

        const posPoint = { x: rect.x, y: rect.y + rect.height };
        const posAnn = AnnTool.annLabelLayerToAnnLayer(posPoint, this.imageViewer);
        this.annPosPoint.onMove(posAnn);

        const adjustPoint = { x: rect.x + rect.width, y: rect.y + rect.height };
        const adjustAnn = AnnTool.annLabelLayerToAnnLayer(adjustPoint, this.imageViewer);
        this.annAdjustPoint.onMove(adjustAnn);
    }
}