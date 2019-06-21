import { Point } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { FontData } from "../../models/misc-data";

export class AnnMagnify {

    private imageLayer: any;
    private mgLayer: any;
    private canvas: any;
    private font: FontData;

    private jcRect: any;
    private jcImage: any;
    private jcText: any;

    private halfWidth = 80;
    private started = false;
    private textOverlayId: string;
    
    constructor(private imageViewer: IImageViewer) {
        this.imageLayer = this.imageViewer.getImageLayer();
        this.mgLayer = this.imageViewer.getMgLayer();
        this.canvas = this.imageViewer.getCtCanvas();
        this.font = this.imageViewer.getTextFont();
        this.textOverlayId = this.imageViewer.getTextOverlayLayerId();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    start(screenPoint: Point, scale: number) {
        this.mgLayer.transform(1, 0, 0, 1, 0, 0, true);
        this.mgLayer.optns.scaleMatrix = this.imageLayer.optns.scaleMatrix;
        this.mgLayer.optns.rotateMatrix = this.imageLayer.optns.rotateMatrix;
        this.mgLayer.optns.translateMatrix = this.imageLayer.optns.translateMatrix;
        this.mgLayer.scale(scale);
        this.mgLayer.visible(true);

        if (!this.jcImage) {
            this.jcImage = jCanvaScript.image(this.canvas).layer(this.mgLayer.id);
        }
        
        if (!this.jcRect) {
            const rectPos = this.getRectPos(screenPoint);
            this.jcRect = jCanvaScript.rect(rectPos.x, rectPos.y, this.halfWidth * 2, this.halfWidth * 2, "rgba(127,255,0)").layer(this.textOverlayId);
        } else {
            this.jcRect.visible(true);
        }

        if (!this.jcText) {
            const textPos = this.getTextPos(screenPoint);
            this.jcText = jCanvaScript.text(`${scale}`, textPos.x, textPos.y).layer(this.imageViewer.getTextOverlayLayerId()).color("rgba(127,255,0)").font(this.textOverlayId).align("left");
        } else {
            this.jcText.visible(true);
            this.jcText.string(`${scale}`);
        }
         
        this.started = true;
        this.moveTo(screenPoint);
    }

    moveTo(screenPoint: Point) {
        if (!this.started) {
            return;
        }

        const rectPos = this.getRectPos(screenPoint);
        this.jcRect._x = rectPos.x;
        this.jcRect._y = rectPos.y;

        const textPos = this.getTextPos(screenPoint);
        this.jcText._x = textPos.x;
        this.jcText._y = textPos.y;

        // Convert screen point to image point
        const imagePoint = AnnTool.screenToImage(screenPoint, this.imageLayer.transform());
        const screenAfter = AnnTool.imageToScreen(imagePoint, this.mgLayer.transform());

        // Move mg layer
        this.mgLayer.translate(screenPoint.x - screenAfter.x, screenPoint.y - screenAfter.y);

        // Clip the layer to only show the image under rectangle
        this.mgLayer.clip(this.jcRect);
    }

    end() {
        this.mgLayer.visible(false);

        if (this.jcRect) {
            this.jcRect.visible(false);
        }

        if (this.jcText) {
            this.jcText.visible(false);
        }

        this.started = false;
    }

    isStarted(): boolean {
        return this.started;
    }

    del() {
        if (this.jcImage) {
            this.jcImage.del();
        }

        if (this.jcRect) {
            this.jcRect.del();
        }

        if (this.jcText) {
            this.jcText.del();
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    getRectPos(screenPoint: Point): Point {
        return { x: screenPoint.x - this.halfWidth, y: screenPoint.y - this.halfWidth };
    }

    getTextPos(screenPoint: Point): Point {
        return { x: screenPoint.x - this.halfWidth + 2, y: screenPoint.y + this.halfWidth - 2 };
    }
}