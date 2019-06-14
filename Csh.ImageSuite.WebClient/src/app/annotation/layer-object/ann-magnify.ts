import { Point } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";

export class AnnMagnify {

    private scale: number;
    private imageLayer: any;
    private mgLayer: any;
    private jcRect: any;
    private jcImage: any;
    private halfWidth = 80;

    constructor(private imageViewer: IImageViewer) {
        this.imageLayer = this.imageViewer.getImageLayer();
        this.mgLayer = this.imageViewer.getMgLayer();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    setScale(scale: number) {
        this.scale = scale;
    }

    start(screenPoint: Point, scale: number) {
        this.mgLayer.visible(true);
        this.mgLayer.transform(1, 0, 0, 1, 0, 0, true);
        this.mgLayer.optns.scaleMatrix = this.imageLayer.optns.scaleMatrix;
        this.mgLayer.optns.rotateMatrix = this.imageLayer.optns.rotateMatrix;
        this.mgLayer.optns.translateMatrix = this.imageLayer.optns.translateMatrix;
        this.mgLayer.scale(scale);

        // Convert screen point to image point
        const imagePoint = AnnTool.screenToImage(screenPoint, this.imageLayer.transform());
        const screenAfter = AnnTool.imageToScreen(imagePoint, this.mgLayer.transform());
        this.mgLayer.translate(screenPoint.x - screenAfter.x, screenPoint.y - screenAfter.y);

        this.jcRect = jCanvaScript.rect(screenPoint.x - this.halfWidth, screenPoint.y - this.halfWidth, this.halfWidth * 2, this.halfWidth * 2, "rgba(127,255,0)").layer(this.imageViewer.getTextOverlayLayerId());
        const layerId = this.imageViewer.getMgLayer().id;
        this.jcImage = jCanvaScript.image(this.imageViewer.getCtCanvas()).layer(layerId);
        this.mgLayer.clip(this.jcRect);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}