import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { Image } from "../models/pssi";
import { ConfigurationService } from "../services/configuration.service";
import { Overlay, OverlayDisplayGroup, OverlayDisplayItem } from '../models/overlay';

@Injectable({
    providedIn: "root"
})
export class DicomImageService {
    private dicomImageUrl = "dicomImage";
    private baseUrl;

    constructor(private http: HttpClient, private configurationService: ConfigurationService) {
        this.baseUrl = this.configurationService.getBaseUrl();
    }

    getDicomFile(image: Image): Observable<Blob> {
        const imageUrl = `${this.dicomImageUrl}/dicom/${image.id}`;
        return this.http.get(imageUrl, { responseType: "blob" });
    }

    getThumbnailFile(image: Image): Observable<Blob> {
        const imageUrl = `${this.dicomImageUrl}/thumbnail/${image.id}`;
        return this.http.get(imageUrl, { responseType: "blob" });
    }


    getCornerStoneImage(image: Image) {
        const imageUri =
            "wadouri:{0}/wado?requestType=WADO&studyUID={studyUID}&seriesUID={serieUID}&objectUID={1}&frameIndex={2}&contentType=application%2Fdicom"
                .format(this.baseUrl, image.id, 0);

        cornerstone.loadImage(imageUri).then(ctImage => {
            image.cornerStoneImage = ctImage;
        });
    }

    getTextOverlayValue(image: Image, overlay: Overlay): string {
        if (overlay.tableName && overlay.fieldName) {

            var obj: any;
            switch (overlay.tableName) {
            case 'image':
                obj = image;
                break;
            case 'series':
                obj = image.series;
                break;
            case 'study':
                obj = image.series.study;
                break;
            case 'patient':
                obj = image.series.study.patient;
                break;
            default:
                return "";
            }

            return obj[overlay.fieldName];
        } else {
            const tagString = this.getTagString(overlay.groupNumber, overlay.elementNumber);
            const tagValue = image.cornerStoneImage.data.string(tagString);
            return  tagValue === undefined ? "" : tagValue;
        }
    }

    decimalToHexString(decimal: number, padding: number): string {
        var hex = Number(decimal).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? 2 : padding;

        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return hex;
    }

    getTagString(group: number, element: number): string {
        return 'x' + this.decimalToHexString(group, 4) + this.decimalToHexString(element, 4);
    }

    addOverlayDisplayList(overlayDisplayList: OverlayDisplayItem[], overlayList: Overlay[],
        alignLeft: boolean, image: Image, canvasWidth: number, canvasHeight: number) {

        let totalOverlayWidth = 0;

        overlayList.forEach(overlayConfig => {
            const displayItem = new OverlayDisplayItem();
            displayItem.align = alignLeft ? "left" : "right";

            let posX = overlayConfig.gridX / 2 * canvasWidth;
            if (overlayConfig.gridX === 0) {
                posX += 5;
            } else if (overlayConfig.gridX === 2) {
                posX -= 5;
            }

            let posY = overlayConfig.gridY / 2 * canvasHeight;
            if (overlayConfig.gridY === 0) {
                posY += 18;
            } else if (overlayConfig.gridY === 2) {
                posY -= 1;
            }

            const fontHeight = 20;
            if (overlayConfig.offsetY > 0) {
                posY += fontHeight * (overlayConfig.offsetY - 1);
            } else {
                posY += fontHeight * overlayConfig.offsetY;
            }

            displayItem.text = overlayConfig.prefix + this.getTextOverlayValue(image, overlayConfig) + overlayConfig.suffix;
            displayItem.posX = posX;
            displayItem.posX += totalOverlayWidth;
            displayItem.posY = posY;

            //totalOverlayWidth += 
            overlayDisplayList.push(displayItem);
        });

    }

    getOverlayDisplayList(image: Image, canvasWidth: number, canvasHeight: number): OverlayDisplayItem[] {

        var overlayDisplayList: OverlayDisplayItem[] = [];

        const groupList = this.configurationService.getOverlayDisplayGroup(image.series.modality);
        groupList.forEach(group => {

            this.addOverlayDisplayList(overlayDisplayList, group.itemListAlignLeft, true, image, canvasWidth, canvasHeight);
            this.addOverlayDisplayList(overlayDisplayList, group.itemListAlignRight, false, image, canvasWidth, canvasHeight);
        });

        return overlayDisplayList;
    }
}
