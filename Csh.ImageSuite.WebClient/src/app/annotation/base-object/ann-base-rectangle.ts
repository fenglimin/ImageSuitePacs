import { Point, Rectangle } from "../../models/annotation";
import { AnnObject } from "../ann-object";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnExtendObject } from "../extend-object/ann-extend-object";

export class AnnBaseRectangle extends AnnBaseObject {

    
    forText: boolean;

    constructor(parentObj: AnnExtendObject, topLeft: Point, width: number, height: number, imageViewer: IImageViewer, forText: boolean = false) {

        // AnnBaseRectangle can be used either for AnnRectangle which is in annotation layer, or for AnnText which is in label layer
        super(parentObj, imageViewer);

        // Set layer based on its usage
        this.forText = forText;
        this.jcObj = jCanvaScript.rect(topLeft.x, topLeft.y, width, height, this.selectedColor).layer(forText? this.labelLayerId : this.layerId);
        super.setJcObj();

        this.setMouseResponsible(!forText);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcObj._y = this.image.height() - this.jcObj._y;
            this.jcObj._height = -this.jcObj._height;
        } else {
            this.jcObj._x = this.image.width() - this.jcObj._x;
            this.jcObj._width = -this.jcObj._width;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    getSurroundPointList(): Point[] {
        const rect = new Rectangle(this.jcObj._x, this.jcObj._y, this.jcObj._width, this.jcObj._height);
        const pointList = AnnObject.pointListFromRect(rect);
        return this.forText
            ? AnnObject.imageListToImageList(pointList,
                this.imageViewer.getAnnLabelLayer().transform(),
                this.imageViewer.getImageLayer().transform())
            : pointList;
    }

    redraw(rect: Rectangle) {
        this.onMove({ x: rect.x, y: rect.y });
        this.setWidth(rect.width);
        this.setHeight(rect.height);
    }

    getAreaString(): string {

        const width = this.getWidth();
        const height = this.getHeight();
        const area = Math.abs(width * height);

        let areaString = "Size = ";
        if (this.pixelSpacing) {
            areaString += (area * this.pixelSpacing.cx * this.pixelSpacing.cy).toFixed(2) + "mm2";
        } else {
            areaString += area.toFixed(2) + "pt2";
        }

        return areaString;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}