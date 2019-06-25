import { Point, PositionInRectangle, MouseEventType, Rectangle } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnExtendObject } from "./ann-extend-object";
import { AnnRectangle } from "../extend-object/ann-rectangle";
import { AnnBaseImage } from "../base-object/ann-base-image";
import { AnnTool } from "../ann-tool";
import { AnnSerialize } from "../ann-serialize";

export class AnnImage extends AnnExtendObject {

    private annBaseImage: AnnBaseImage;
    private annRectangle: AnnRectangle;
    private imageFileName: string;

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

    onCreate(imageFileName: string, topLeftPoint: Point, bottomRightPoint: Point = undefined) {

        this.imageFileName = imageFileName;
        const imageData = new Image();
        imageData.onload = ev => {
            this.annBaseImage = new AnnBaseImage(this, imageData, topLeftPoint, this.imageViewer);

            let width: number, height: number;
            if (bottomRightPoint) {
                width = bottomRightPoint.x - topLeftPoint.x;
                height = bottomRightPoint.y - topLeftPoint.y;
            } else {
                width = this.annBaseImage.getWidth();
                height = this.annBaseImage.getHeight();
            }

            this.annRectangle = new AnnRectangle(this, this.imageViewer);
            this.annRectangle.onCreate(topLeftPoint, width, height, false);
            this.annBaseImage.onLevelDown("bottom");

            if (bottomRightPoint) {
                this.onRectangleChanged();
            }

            if (this.loadedFromTag) {
                this.focusedObj = this.annBaseImage;
                this.onSelect(this.selected, this.selected);
                if (!this.parentObj) {
                    this.onDrawEnded();
                }
                this.imageViewer.refresh();
            }
        };

        imageData.src = this.imageViewer.getBaseUrl() + "assets/img/Stamp/" + imageFileName + ".PNG";
    }

    onLoad(config: any) {
        this.loadedFromTag = true;
        this.onCreateFromConfig(config);
    }

    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnStamp");
        annSerialize.writeString(this.imageFileName);
        annSerialize.writeBytes([]);
        annSerialize.writeInteger(10, 4);
        annSerialize.writeInteger(1, 4);     // created
        annSerialize.writeInteger(0, 4);     // moving
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);     // selected

        const rect = this.annRectangle.getRect();
        annSerialize.writeIntegerPoint({ x: rect.x, y: rect.y });
        annSerialize.writeIntegerPoint({ x: rect.x + rect.width, y: rect.y + rect.height });
        annSerialize.writeInteger(1, 1);
        annSerialize.writeInteger(0, 4);
    }

    onLoadConfig(annSerialize: AnnSerialize) {
        return annSerialize.loadImage();
    }

    onCreateFromConfig(config: any) {
        this.selected = config.selected;
        this.onCreate(config.imageFileName, config.topLeftPoint, config.bottomRightPoint);
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
            this.onRectangleChanged();
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
    private onRectangleChanged() {
        let rect = this.annRectangle.getRect();
        rect = AnnTool.formatRect(rect);
        this.annBaseImage.onMove(new Point(rect.x, rect.y));
        this.annBaseImage.setWidth(rect.width);
        this.annBaseImage.setHeight(rect.height);
    }
}