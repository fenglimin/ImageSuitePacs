import { Point, Rectangle } from '../../models/annotation';
import { FontData} from "../../models/misc-data"
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";

export class AnnBaseText extends AnnBaseObject {

    jcObj: any;

    constructor(parentObj: AnnObject, text: string, startPoint: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        startPoint = this.annLayerToAnnLabelLayer(startPoint);
        this.jcObj = jCanvaScript.text(text, startPoint.x, startPoint.y).color(this.selectedColor).font(font.getCanvasFontString()).layer(this.labelLayerId).align("left");
        super.setJcObj();
    }

    onScale() {
        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        this.jcObj.font(font.getCanvasFontString());
    }

    //onFlip(vertical: boolean) {


    //    if (!vertical) {
    //        if (this.jcObj._align === "left") {
    //            this.jcObj.align("right");
    //        } else if (this.jcObj._align === "right") {
    //            this.jcObj.align("left");
    //        }
    //    }
    //}

    onMove(point: Point) {
        point = this.annLayerToAnnLabelLayer(point);
        super.onMove(point);
    }


    getTransformMatrix(): any {
        return this.imageViewer.getAnnLabelLayer().transform();
    }

    getRect(): Rectangle {
        return this.jcObj.getRect("poor");
    } 

    getSurroundPointList(): Point[] {

        const rectText = this.jcObj.getRect("poor");

        const retPointList = AnnObject.pointListFromRect(rectText);
        for (let i = 0; i < retPointList.length; i ++) {
            retPointList[i] = this.annLabelLayerToAnnLayer(retPointList[i]);
        }

        return retPointList;
    }

    private annLabelLayerToAnnLayer(point: Point): Point {
        return AnnObject.imageToImage(point, this.getTransformMatrix(), this.imageViewer.getImageLayer().transform());
    }

    private annLayerToAnnLabelLayer(point: Point): Point {
        return AnnObject.imageToImage(point, this.imageViewer.getImageLayer().transform(), this.getTransformMatrix());
    }
}