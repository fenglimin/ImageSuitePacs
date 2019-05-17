import { Point, Rectangle, MouseEventType } from '../../models/annotation';
import { FontData} from "../../models/misc-data"
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';
import { AnnSerialize } from "../ann-serialize";

export class AnnBaseText extends AnnBaseObject {

    constructor(parentObj: AnnObject, text: string, startPoint: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        
        // The coordinate of input point is for annotation layer, since text will always be drawn in label layer, need to convert the coordinate
        startPoint = AnnTool.annLayerToAnnLabelLayer(startPoint, imageViewer);

        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        this.jcObj = jCanvaScript.text(text, startPoint.x, startPoint.y).color(this.selectedColor).font(font.getCanvasFontString()).layer(this.labelLayerId).align("left");
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnLabel");
        annSerialize.writeNumber(1, 4);
        annSerialize.writeNumber(0, 4);
        annSerialize.writeNumber(0, 1);

        const topLeftPoint = this.getPosition();
        const rect = new Rectangle(topLeftPoint.x, topLeftPoint.y, this.getWidth(), this.getHeight());
        const pointList = AnnTool.pointListFromRect(rect);

        annSerialize.writePoint(pointList[0]); // top left
        annSerialize.writePoint(pointList[2]); // bottom right
        annSerialize.writePoint(pointList[1]); // top right
        annSerialize.writePoint(pointList[3]); // bottom left
    }

    onScale() {
        // When scale value changed, the font size need to be changed as well to make sure it look unchanged in the screen
        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        this.jcObj.font(font.getCanvasFontString());
    }

    onMove(point: Point) {
        // The coordinate of input point is for annotation layer, since text will always be drawn in label layer, need to convert the coordinate
        point = AnnTool.annLayerToAnnLabelLayer(point, this.imageViewer);
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

        // the coordinate is for annotation label layer
        return rect;
    } 

    getTransformMatrix(): any {
        // Text is always in label layer
        return this.imageViewer.getAnnLabelLayer().transform();
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    getText(): string {
        return this.jcObj._string;
    }

    setText(text: string) {
        this.jcObj.string(text);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}