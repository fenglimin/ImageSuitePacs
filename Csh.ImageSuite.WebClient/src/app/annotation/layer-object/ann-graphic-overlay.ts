import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseGraphicOverlay } from "../base-object/ann-base-graphic-overlay";
import { GraphicOverlayData } from '../../models/overlay';

export class AnnGraphicOverlay {

    private annGraphicOverlayList = new Array<AnnBaseGraphicOverlay>();

    constructor(graphicOverlayDataList: GraphicOverlayData[], imageViewer: IImageViewer) {
        graphicOverlayDataList.forEach(
            graphicOverlayData => this.annGraphicOverlayList.push(
                new AnnBaseGraphicOverlay(undefined, graphicOverlayData, imageViewer)));
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
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}