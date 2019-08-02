import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseText } from "../base-object/ann-base-text";
import { TextOverlayData, TextOverlayDisplayGroup, TextOverlayDisplayItem } from "../../models/overlay";
import { DicomImageService } from "../../services/dicom-image.service";
import { Image } from "../../models/pssi";
import { FontData } from "../../models/misc-data";

export class AnnTextOverlay {

    private jcTextOverlayList = [];
    private textOverlayDataList = [];
    private layerId: string;
    private canvas: any;
    private image: Image;
    private windowCenterIndex: number;
    private zoomRatioIndex: number;
    private font: FontData;

    constructor(private imageViewer: IImageViewer, private dicomImageService: DicomImageService) {
        this.canvas = this.imageViewer.getCanvas();
        this.image = this.imageViewer.getImage();
        this.layerId = this.imageViewer.getTextOverlayLayerId();
        this.font = this.imageViewer.getTextFont();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    updateWindowCenter(width: number, center: number) {
        if (this.windowCenterIndex !== -1) {
            const text = this.textOverlayDataList[this.windowCenterIndex].text.format(width, center);
            this.jcTextOverlayList[this.windowCenterIndex].string(text);
        }
    }

    updateZoomRatioTextOverlay(roomRatio: number) {
        if (this.zoomRatioIndex !== -1) {
            const text = this.textOverlayDataList[this.zoomRatioIndex].text.format(roomRatio.toFixed(2));
            this.jcTextOverlayList[this.zoomRatioIndex].string(text);
        }
    }

    redraw() {
        this.del();
        this.windowCenterIndex = -1;
        this.zoomRatioIndex = -1;

        if (this.canvas.width) {
            if (this.canvas.width >= 800) {
                this.font.size = 15;
            } else if (this.canvas.width < 300) {
                this.font.size = 10;
            } else {
                this.font.size = 10 + Math.floor((this.canvas.width - 300) / 100);
            }
        }

        this.textOverlayDataList = this.dicomImageService.getOverlayDisplayList(this.image, this.canvas, this.font);
        this.textOverlayDataList.forEach((overlay, index) => {
            const label = jCanvaScript.text(overlay.text, overlay.posX, overlay.posY).layer(this.layerId)
                .color(this.font.color).font(this.font.getCanvasFontString()).align(overlay.align);

            this.jcTextOverlayList.push(label);

            if (overlay.id === "9003") {
                this.windowCenterIndex = index;
                this.updateWindowCenter(this.image.cornerStoneImageList[0].windowWidth, this.image.cornerStoneImageList[0].windowCenter);
            } else if (overlay.id === "9004") {
                this.zoomRatioIndex = index;
                this.updateZoomRatioTextOverlay(this.image.getScaleValue());
            }
        });
    }

    del() {
        this.jcTextOverlayList.forEach(jcText => jcText.del());
        this.jcTextOverlayList.length = 0;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    
}