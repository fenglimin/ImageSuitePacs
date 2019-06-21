import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';
import { GraphicOverlayData } from "../../models/overlay";

export class AnnBaseGraphicOverlay extends AnnBaseObject {

    private graphicOverlayCanvas: any;
    private ctx: any;
    private graphicOverlayData: GraphicOverlayData;
    private hFlipped = false;
    private vFlipped = false;

    constructor(parentObj: AnnObject, graphicOverlayData: GraphicOverlayData, imageViewer: IImageViewer, layerId: string) {
        super(parentObj, imageViewer);
        this.graphicOverlayData = graphicOverlayData;

        this.graphicOverlayCanvas = document.createElement("canvas");
        this.graphicOverlayCanvas.width = this.image.width();
        this.graphicOverlayCanvas.height = this.image.height();
        this.ctx = this.graphicOverlayCanvas.getContext("2d");

        this.draw();
        this.jcObj = jCanvaScript.image(this.graphicOverlayCanvas).layer(layerId);
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////s
    // Override functions of base class
    onFlip(vertical: boolean) {
        if (vertical) {
            this.vFlipped = !this.vFlipped;
        } else {
            this.hFlipped = !this.hFlipped;
        }

        this.draw();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    onReset() {
        this.vFlipped = false;
        this.hFlipped = false;
        this.draw();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private draw() {
        const imageWidth = this.image.width();
        const imageHeight = this.image.height();

        this.ctx.clearRect(0, 0, imageWidth, imageHeight);
        this.ctx.beginPath();
        this.graphicOverlayData.dataList.forEach(data => {
            this.ctx.rect(this.hFlipped ? imageWidth - data.x : data.x, this.vFlipped ? imageHeight - data.y : data.y, 1, 1);
        });
        this.ctx.strokeStyle = this.selectedColor;
        this.ctx.stroke();
    }
}