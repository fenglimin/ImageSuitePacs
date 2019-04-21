import { Point, Rectangle } from '../../models/annotation';
import { FontData} from "../../models/misc-data"
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnExtendObject } from "../extend-object/ann-extend-object";

export class AnnBaseText extends AnnBaseObject {

    constructor(parentObj: AnnExtendObject, text: string, startPoint: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        
        // The coordinate of input point is for annotation layer, since text will always be drawn in label layer, need to convert the coordinate
        startPoint = AnnObject.annLayerToAnnLabelLayer(startPoint, imageViewer);

        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        this.jcObj = jCanvaScript.text(text, startPoint.x, startPoint.y).color(this.selectedColor).font(font.getCanvasFontString()).layer(this.labelLayerId).align("left");
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onScale() {

        // When scale value changed, the font size need to be changed as well to make sure it look unchanged in the screen
        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        this.jcObj.font(font.getCanvasFontString());
    }

    onMove(point: Point) {

        // The coordinate of input point is for annotation layer, since text will always be drawn in label layer, need to convert the coordinate
        point = AnnObject.annLayerToAnnLabelLayer(point, this.imageViewer);
        super.onMove(point);
    }

    getRect(): Rectangle {

        // Not sure why JCanvas returns the wrong rect, adjust it
        const rect = this.jcObj.getRect("poor");

        const newHeight = this.parentObj.getFontSize();
        rect.y -= newHeight - rect.height - 2;
        rect.height = newHeight + 4;
        rect.x -= 2;
        rect.width += 4;
        return rect;
    } 

    getTransformMatrix(): any {

        // Text is always in label layer
        return this.imageViewer.getAnnLabelLayer().transform();
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    setText(text: string) {
        this.jcObj.string(text);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}