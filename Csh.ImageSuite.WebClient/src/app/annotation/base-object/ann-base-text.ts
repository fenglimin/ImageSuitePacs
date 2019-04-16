import { Point } from '../../models/annotation';
import { FontData} from "../../models/misc-data"
import { MouseEventType, AnnObject } from '../ann-object';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";

export class AnnBaseText extends AnnBaseObject {

    jcObj: any;

    constructor(parentObj: AnnObject, text: string, startPoint: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        this.jcObj = jCanvaScript.text(text, startPoint.x, startPoint.y).color(this.selectedColor).font(font.getCanvasFontString()).layer(this.layerId);
        super.setJcObj();
    }

    onScale() {
        const font = new FontData("Times New Roman", "#FFF", this.parentObj.getFontSize());
        this.jcObj.font(font.getCanvasFontString());
    }
}