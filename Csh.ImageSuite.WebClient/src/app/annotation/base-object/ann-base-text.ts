import { Point, Rectangle, MouseEventType } from '../../models/annotation';
import { FontData} from "../../models/misc-data"
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';
import { AnnSerialize } from "../ann-serialize";

export class AnnBaseText extends AnnBaseObject {

    private fontSizeFixed = false;
    private createdFontSize: number;

    constructor(parentObj: AnnObject, text: string, startPoint: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);
        
        // The coordinate of input point is for annotation layer, since text will always be drawn in label layer, need to convert the coordinate
        startPoint = AnnTool.annLayerToAnnLabelLayer(startPoint, imageViewer);

        this.createdFontSize = this.parentObj.getFontSize();
        const font = new FontData("Times New Roman", "#FFF", this.createdFontSize);
        this.jcObj = jCanvaScript.text(text, startPoint.x, startPoint.y).color(this.selectedColor).font(font.getCanvasFontString()).layer(this.labelLayerId).align("left");
        //this.jcObj._shadowX = 1;
        //this.jcObj._shadowY = 1;
        //this.jcObj._shadowColor = "#000";
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnLabel");
        annSerialize.writeInteger(1, 4);
        annSerialize.writeInteger(0, 4);
        annSerialize.writeInteger(0, 1);

        const topLeftPoint = this.getPosition();
        const rect = new Rectangle(topLeftPoint.x, topLeftPoint.y, this.getWidth(), this.getHeight());
        const pointList = AnnTool.pointListFromRect(rect);

        annSerialize.writeIntegerPoint(pointList[0]); // top left
        annSerialize.writeIntegerPoint(pointList[2]); // bottom right
        annSerialize.writeIntegerPoint(pointList[1]); // top right
        annSerialize.writeIntegerPoint(pointList[3]); // bottom left
    }

    onScale() {
        // When scale value changed, the font size need to be changed as well to make sure it look unchanged in the screen
        const fontSize = this.fontSizeFixed ? this.createdFontSize : this.parentObj.getFontSize();
        this.setFontSize(fontSize);

        //const font = this.fontSizeFixed ? new FontData("Times New Roman", "#FFF", this.createdFontSize) :
        //    new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        //this.jcObj.font(font.getCanvasFontString());
    }

    onMove(point: Point) {
        // The coordinate of input point is for annotation layer, since text will always be drawn in label layer, need to convert the coordinate
        point = AnnTool.annLayerToAnnLabelLayer(point, this.imageViewer);
        super.onMove(point);
    }

    getRect(): Rectangle {
        // Not sure why JCanvas returns the wrong rect, adjust it
        const rect = this.jcObj.getRect("poor");

        const newHeight = this.fontSizeFixed? this.createdFontSize : this.parentObj.getFontSize();
        //rect.y -= newHeight - rect.height - 2;
        rect.y = this.getPosition().y - newHeight * 0.85;
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

    onDragStarted(pos: Point) {

    }

    onDragEnded(pos: Point) {

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    getText(): string {
        return this.jcObj._string;
    }

    setText(text: string) {
        this.jcObj.string(text);
    }

    setFontSizeFixed(fontSizeFixed: boolean) {
        this.fontSizeFixed = fontSizeFixed;
    }

    setFontSize(fontSize: number) {
        this.createdFontSize = fontSize
        const font = new FontData("Times New Roman", "#FFF", fontSize);
        this.jcObj.font(font.getCanvasFontString());
    }

    getCreateFontSize(): number {
        return this.createdFontSize;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}