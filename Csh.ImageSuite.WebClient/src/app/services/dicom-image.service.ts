import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Image } from "../models/pssi";
import { ConfigurationService } from "../services/configuration.service";
import { Overlay, OverlayDisplayGroup, OverlayDisplayItem } from '../models/overlay';
import { LogService } from "../services/log.service";

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': "application/json" })
};

@Injectable({
    providedIn: "root"
})
export class DicomImageService {

    private logPrefix = "DicomImageService: ";
    private dicomImageUrl = "dicomImage";
    private baseUrl;
    private overlayDisplayGroupList: OverlayDisplayGroup[] = [];


    constructor(private http: HttpClient, private configurationService: ConfigurationService,
        private logService: LogService) {

        this.baseUrl = this.configurationService.getBaseUrl();

        
    }

    /** Save Image annotation */
    saveImageAnn(id, annString): Observable<string> {
        const url = `${this.dicomImageUrl}/saveAnnotation/`;
        let data = { id: id, annString: annString };

        return this.http.post<string>(url, data, httpOptions);
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
        const imageUri = "wadouri:{0}/wado?requestType=WADO&studyUID={studyUID}&seriesUID={serieUID}&objectUID={1}&frameIndex={2}&contentType=application%2Fdicom".format(this.baseUrl, image.id, 0);
        this.logService.info("Dicom Image Service : Downloading dicom image, url is " + imageUri);
        return cornerstone.loadImage(imageUri);
    }

    getOverlayDisplayList(image: Image, canvasWidth: number, canvasHeight: number, canvasContext: any): OverlayDisplayItem[] {
        if (this.overlayDisplayGroupList.length === 0) {
            const overlayList = this.configurationService.getOverlayConfigList();
            this.formatOverlayList(overlayList);
        }

        var overlayDisplayList: OverlayDisplayItem[] = [];

        const groupList = this.getOverlayDisplayGroup(image.series.modality);
        groupList.forEach(group => {

            this.addOverlayDisplayList(overlayDisplayList, group.itemListAlignLeft, true, image, canvasWidth, canvasHeight, canvasContext);
            this.addOverlayDisplayList(overlayDisplayList, group.itemListAlignRight, false, image, canvasWidth, canvasHeight, canvasContext);
        });

        return overlayDisplayList;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Text overlay functions
    private formatOverlayList(overlayList: Overlay[]) {

        overlayList.forEach(overlay => {
            this.addOverlayToGroup(overlay);
        });

        this.overlayDisplayGroupList.forEach(group => {

            group.itemListAlignLeft = group.itemListAlignLeft.sort((n1, n2) => {
                return (n1.offsetX < n2.offsetX) ? -1 : 1;
            });

            group.itemListAlignRight = group.itemListAlignRight.sort((n1, n2) => {
                return (n1.offsetX < n2.offsetX) ? 1 : -1;
            });
        });
    }

    private addOverlayToGroup(overlay: Overlay) {
        const filtered = this.overlayDisplayGroupList.filter(value => value.match(overlay));

        let overlayGroup = null;
        if (filtered.length === 0) {
            overlayGroup = new OverlayDisplayGroup(overlay);
            this.overlayDisplayGroupList.push(overlayGroup);
        } else {
            overlayGroup = filtered[0];
        }

        overlayGroup.add(overlay);
    }

    private getOverlayDisplayGroup(modality: string): OverlayDisplayGroup[] {
        return this.overlayDisplayGroupList.filter(group => group.modality === modality);
    }

    private getTextOverlayValue(image: Image, overlay: Overlay): string {

        let tagValue: string;
        if (overlay.overlayId === "9003") {
            tagValue = "W: {0}, L: {1}";
        } else if (overlay.overlayId === "9004") {
            tagValue = "{0}";
        }else if (overlay.tableName && overlay.fieldName) {

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
                this.logService.error(this.logPrefix + "Invalid table name " + overlay.tableName);
                return "Error!";
            }

            tagValue = obj[overlay.fieldName];
        } else {
            const tagString = this.getTagString(overlay.groupNumber, overlay.elementNumber);
            if (tagString === "x0011101c") {
                tagValue = "Measure at anatomy";
            } else {
                tagValue = image.cornerStoneImage.data.string(tagString);
            }
        }

        return tagValue === undefined ? "" : tagValue;
    }

    private decimalToHexString(decimal: number, padding: number): string {
        var hex = Number(decimal).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? 2 : padding;

        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return hex;
    }

    private getTagString(group: number, element: number): string {
        return 'x' + this.decimalToHexString(group, 4) + this.decimalToHexString(element, 4);
    }

    private addOverlayDisplayList(overlayDisplayList: OverlayDisplayItem[], overlayList: Overlay[],
        alignLeft: boolean, image: Image, canvasWidth: number, canvasHeight: number, canvasContext: any) {

        const lineWidth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        overlayList.forEach(overlayConfig => {
            const displayItem = new OverlayDisplayItem();
            displayItem.align = alignLeft ? "left" : "right";

            let posX = overlayConfig.gridX / 2 * canvasWidth;
            if (overlayConfig.gridX === 0) {
                posX += 5;
            } else if (overlayConfig.gridX === 2) {
                posX -= 5;
            } else if (overlayConfig.gridX === 1) {
                alignLeft? posX += 5 : posX -= 5;
            }

            let posY = overlayConfig.gridY / 2 * canvasHeight;
            if (overlayConfig.gridY === 0) {
                posY += 18;
            } else if (overlayConfig.gridY === 2) {
                posY += 15; // ? why
            }

            const fontHeight = 20;
            if (overlayConfig.offsetY > 0) {
                posY += fontHeight * (overlayConfig.offsetY - 1);
            } else {
                posY += fontHeight * overlayConfig.offsetY;
            }

            displayItem.id = overlayConfig.overlayId;
            displayItem.text = overlayConfig.prefix + this.getTextOverlayValue(image, overlayConfig) + overlayConfig.suffix;

            const offSetY = overlayConfig.offsetY + 6;
            
            displayItem.posX = posX;
            displayItem.posX += alignLeft ? lineWidth[offSetY] : -lineWidth[offSetY];
            displayItem.posY = posY;

            lineWidth[offSetY] += canvasContext.measureText(displayItem.text).width + 10;

            overlayDisplayList.push(displayItem);
        });

    }
}
