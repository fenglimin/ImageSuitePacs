import { Point, MouseEventType } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';

export class AnnBaseImage extends AnnBaseObject {

    private fill: boolean;

    constructor(parentObj: AnnObject, imageData: any, startPoint: Point, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        const scale = this.image.getScaleValue();
        const width = imageData.width / scale;
        const height = imageData.height / scale;

        this.jcObj = jCanvaScript.image(imageData, startPoint.x, startPoint.y, width, height).layer(this.layerId);
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onSelect(selected: boolean, focused: boolean) {
        this.selected = selected;
    }

    onFlip(vertical: boolean) {

        if (vertical) {
            this.jcObj._y = this.image.height() - this.jcObj._y - this.jcObj._height;
        } else {
            this.jcObj._x = this.image.width() - this.jcObj._x - this.jcObj._width;
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    setImage(imageData: any) {
        this.jcObj._img = imageData;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}