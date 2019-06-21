import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseGraphicOverlay } from "../base-object/ann-base-graphic-overlay";
import { GraphicOverlayData } from '../../models/overlay';

export class AnnGraphicOverlay {

    private annGraphicOverlayList = new Array<AnnBaseGraphicOverlay>();
    private mgLayerDrawn = false;

    constructor(private graphicOverlayDataList: GraphicOverlayData[], private imageViewer: IImageViewer) {
        this.graphicOverlayDataList.forEach(
            graphicOverlayData => this.annGraphicOverlayList.push(
                new AnnBaseGraphicOverlay(undefined, graphicOverlayData, imageViewer, imageViewer.getImageLayerId())));
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    onFlip(vertical: boolean) {
        this.annGraphicOverlayList.forEach(annObj => annObj.onFlip(vertical));
    }

    setVisible(visible: boolean) {
        this.annGraphicOverlayList.forEach(annObj => annObj.setVisible(visible));
    }

    onReset() {
        this.annGraphicOverlayList.forEach(annObj => annObj.onReset());
    }

    del() {
        this.annGraphicOverlayList.forEach(annObj => annObj.onDeleteChildren());
    }

    drawToMgLayer() {
        if (!this.mgLayerDrawn) {
            this.graphicOverlayDataList.forEach(
                graphicOverlayData => this.annGraphicOverlayList.push(
                    new AnnBaseGraphicOverlay(undefined, graphicOverlayData, this.imageViewer, this.imageViewer.getMgLayer().id)));
        }

        this.mgLayerDrawn = true;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}