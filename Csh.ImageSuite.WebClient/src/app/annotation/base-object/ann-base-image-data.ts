import { Rectangle } from '../../models/annotation';
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';

export class AnnBaseImageData extends AnnBaseObject {

    constructor(parentObj: AnnObject, imageData: any, rect: Rectangle, imageViewer: IImageViewer) {

        super(parentObj, imageViewer);

        //this.jcObj = jCanvaScript.imageData(rect.width, rect.height).layer(this.graphicOlLayerLayerId);
       
        const length = imageData.length;
        for (let i = 0; i < length; i++) {
            const byte = imageData[i];
            if (byte === 0) {
                continue;
            }

            const y = Math.floor(i * 8 / rect.width);
            let x = i * 8 % rect.width;
            let flag = 128;
            for (let j = 0; j < 8; j ++) {
                if (byte & flag) {
                    //this.jcObj.setPixel(x - j, y, this.selectedColor);
                    jCanvaScript.rect(x - j, y, 1, 1, this.selectedColor).layer(this.graphicOlLayerLayerId);
                    //jcObj._lineWidth = this.lineWidth;
                }
                flag = flag >> 1;
            }
        }


        //this.jcObj.putData(rect.x, rect.y).draggable(); //设置渐变区域的位置

        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onSelect(selected: boolean, focused: boolean) {
        this.selected = selected;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    setImage(imageData: any) {
        this.jcObj._data = imageData;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}