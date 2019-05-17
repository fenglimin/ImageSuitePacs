﻿import { Point, PositionInRectangle, MouseEventType, Rectangle } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnRectangle } from "../extend-object/ann-rectangle";
import { AnnBaseImage } from "../base-object/ann-base-image";
import { AnnTool } from "../ann-tool";

export class AnnImage extends AnnExtendObject {

    private annBaseImage: AnnBaseImage;
    private annRectangle: AnnRectangle;

    constructor(parentObj: AnnExtendObject, imageViewer: IImageViewer) {
        super(parentObj, imageViewer);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class

    onMouseEvent(mouseEventType: MouseEventType, point: Point) {

        const imagePoint = AnnTool.screenToImage(point, this.image.transformMatrix);
        if (mouseEventType === MouseEventType.MouseDown) {

            if (this.created) {
                this.onSelect(true, false);
                return;
            }

            this.focusedObj = this.annBaseImage;
            if (!this.parentObj) {
                this.onDrawEnded();
            }
        } else if (mouseEventType === MouseEventType.MouseMove) {
            if (this.annBaseImage) {
                this.onMove(imagePoint);
            }
        }
    }

    onCreate(imageData: any, topLeftPoint: Point) {
        this.annBaseImage = new AnnBaseImage(this, imageData, topLeftPoint, this.imageViewer);

        const width = this.annBaseImage.getWidth();
        const height = this.annBaseImage.getHeight();
        this.annRectangle = new AnnRectangle(this, this.imageViewer);
        this.annRectangle.onCreate(topLeftPoint, width, height, false);
        this.annBaseImage.onLevelDown("bottom");
    }

    onSelect(selected: boolean, focused: boolean) {
        super.onSelect(selected, focused);
        if (this.annRectangle) {
            this.annRectangle.setVisible(selected);
        }
    }

    onDrag(deltaX: number, deltaY: number) {
        if (this.annRectangle === this.focusedObj) {
            this.annRectangle.onDrag(deltaX, deltaY);
            let rect = this.annRectangle.getRect();
            rect = AnnTool.formatRect(rect);
            this.annBaseImage.onMove(new Point(rect.x, rect.y));
            this.annBaseImage.setWidth(rect.width);
            this.annBaseImage.setHeight(rect.height);
        } else {
            this.onTranslate(deltaX, deltaY);
        }
    }

    onMove(point: Point) {
        this.annBaseImage.onMove(point);

        const width = this.annBaseImage.getWidth();
        const height = this.annBaseImage.getHeight();
        const pointList = AnnTool.pointListFrom(point, PositionInRectangle.TopLeft, width, height);
        this.annRectangle.redraw(pointList);
    }

    onSwitchFocus() {
        this.annRectangle.onSwitchFocus();
    }

    getRect(): Rectangle {
        return this.annBaseImage.getRect();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}