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

        if (!forTextIndicator) {
            const posPoint = { x: rect.x, y: rect.y + rect.height };
            const posAnn = AnnTool.annLabelLayerToAnnLayer(posPoint, this.imageViewer);
            this.annPosPoint = new AnnPoint(this, this.imageViewer);
            this.annPosPoint.onCreate(posAnn);
            this.annPosPoint.setVisible(false);
            this.annPosPoint.enableShowAlways(false);

            const adjustPoint = { x: rect.x + rect.width, y: rect.y + rect.height };
            const adjustAnn = AnnTool.annLabelLayerToAnnLayer(adjustPoint, this.imageViewer);
            this.annAdjustPoint = new AnnPoint(this, this.imageViewer);
            this.annAdjustPoint.onCreate(adjustAnn);
        }
        
        this.annBaseText.onLevelDown("bottom");
        this.focusedObj = this.annRectangle;
    }

    onLoadConfig(annSerialize: AnnSerialize) {
        return annSerialize.loadTextMark();
    }

    onCreateFromConfig(config: any) {
        this.onCreate(config.position, config.text, false);
        this.annBaseText.setFontSize(config.fontSize * 2);
        this.redrawByText();
        this.focusedObj = this.annRectangle;
    }

    onSave(annSerialize: AnnSerialize) {

        const fontSize = this.annBaseText.getCreateFontSize();
        if (!this.forTextIndicator) {
            annSerialize.writeString(this.annDefData.imageSuiteAnnName);
            annSerialize.writeInteger(this.annDefData.imageSuiteAnnType, 4);     // AnnType
            annSerialize.writeInteger(1, 4);     // created
            annSerialize.writeInteger(0, 4);     // is active
            annSerialize.writeInteger(0, 4);     // edit created
            annSerialize.writeInteger(1, 4);     // state
            annSerialize.writeInteger(this.selected ? 1 : 0, 1);     // selected
            annSerialize.writeInteger(fontSize / 2, 4);     // font size 
        } 

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
        annSerialize.writeInteger(fontSize, 4);
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
        if (this.forTextIndicator) {
            super.onFlip(vertical);
        } else {
            this.annPosPoint.onFlip(vertical);
            this.redrawByPosPoint();
        }
    }

    onRotate(angle: number) {
        if (this.forTextIndicator) {
            super.onRotate(angle);
        } else {
            this.annPosPoint.onRotate(angle);
            this.redrawByPosPoint();
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.focusedObj === this.annRectangle || this.focusedObj === this.annBaseText) {
            this.annBaseText.onDrag(deltaX, deltaY);
            this.redrawByText();
        } else if (this.focusedObj === this.annAdjustPoint) {
            this.annAdjustPoint.setVisible(false);
            this.annAdjustPoint.onDrag(deltaX, deltaY);
            this.redrawByAdjustPoint();
        }
    }

    onDragEnded(pos: Point) {
        if (this.focusedObj === this.annAdjustPoint) {
            this.annAdjustPoint.setVisible(true);
            this.focusedObj = this.annRectangle;
            this.redrawByText();
            this.imageViewer.refresh();
        }
    }

    onMove(point: Point) {
        this.annBaseText.onMove(point);
        this.redrawByText();
    }

    getPosition(): Point {
        return this.annRectangle.getPosition();
    }

    getSurroundPointList(): Point[] {
        return this.annRectangle.getSurroundPointList();
    }

    setText(text: string) {
        this.annBaseText.setText(text);
        this.redrawByText();
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

        if (!this.forTextIndicator) {
            const posPoint = { x: rect.x, y: rect.y + rect.height };
            const posAnn = AnnTool.annLabelLayerToAnnLayer(posPoint, this.imageViewer);
            this.annPosPoint.onMove(posAnn);

            const adjustPoint = { x: rect.x + rect.width, y: rect.y + rect.height };
            const adjustAnn = AnnTool.annLabelLayerToAnnLayer(adjustPoint, this.imageViewer);
            this.annAdjustPoint.onMove(adjustAnn);
        }
    }

    private redrawByAdjustPoint() {
        const adjustPoint = this.annAdjustPoint.getPosition();
        const newBottomRight = AnnTool.annLayerToAnnLabelLayer(adjustPoint, this.imageViewer);
        const pos = this.annRectangle.getPosition();
        const oldHeight = this.annRectangle.getHeight();
        const fontSize = this.annBaseText.getCreateFontSize();

        const newFontSize = fontSize * (newBottomRight.y - pos.y) / oldHeight;
        if (newFontSize < 0) {
            return;
        }

        this.annBaseText.setFontSize(newFontSize);

        const rect = this.annBaseText.getRect();
        this.annRectangle.redraw(rect);

        const posPoint = { x: rect.x, y: rect.y + rect.height };
        const posAnn = AnnTool.annLabelLayerToAnnLayer(posPoint, this.imageViewer);
        this.annPosPoint.onMove(posAnn);
    }
}