import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Image } from "../models/pssi";
import { ConfigurationService } from "../services/configuration.service";
import { TextOverlayData, TextOverlayDisplayGroup, TextOverlayDisplayItem, GraphicOverlayData } from '../models/overlay';
import { LogService } from "../services/log.service";
import { FontData } from "../models/misc-data";

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
    private textOverlayDisplayGroupList: TextOverlayDisplayGroup[] = [];


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

    getOverlayDisplayList(image: Image, canvas: any, font: FontData): TextOverlayDisplayItem[] {
        if (this.textOverlayDisplayGroupList.length === 0) {
            const overlayList = this.configurationService.getTextOverlayConfigList();
            this.formatOverlayList(overlayList);
        }

        const canvasContext = canvas.getContext("2d");
        canvasContext.font = font.getCanvasFontString();

        var overlayDisplayList: TextOverlayDisplayItem[] = [];

        const groupList = this.getOverlayDisplayGroup(image.series.modality);
        groupList.forEach(group => {

            this.addOverlayDisplayList(overlayDisplayList, group.itemListAlignLeft, true, image, canvas.width, canvas.height, canvasContext, font.size);
            this.addOverlayDisplayList(overlayDisplayList, group.itemListAlignRight, false, image, canvas.width, canvas.height, canvasContext, font.size);
        });

        return overlayDisplayList;
    }

    getGraphicOverlayList(image: Image): GraphicOverlayData[] {
        const graphicOverlayList = [];

        // There are max 16 graphic overlays in a image
        const groupNumber = 24576; // Hex 0x6000
        for (let i = 0; i < 16; i++) {
            const groupString = this.decimalToHexString(groupNumber + i * 2, 2);
            const graphicOverlayData = this.getGraphicOverlayData(image, "x" + groupString);
            if (graphicOverlayData) {
                graphicOverlayList.push(graphicOverlayData);
            }
        }

        return graphicOverlayList;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Text overlay functions
    private formatOverlayList(overlayList: TextOverlayData[]) {

        overlayList.forEach(overlay => {
            this.addOverlayToGroup(overlay);
        });

        this.textOverlayDisplayGroupList.forEach(group => {

            group.itemListAlignLeft = group.itemListAlignLeft.sort((n1, n2) => {
                return (n1.offsetX < n2.offsetX) ? -1 : 1;
            });

            group.itemListAlignRight = group.itemListAlignRight.sort((n1, n2) => {
                return (n1.offsetX < n2.offsetX) ? 1 : -1;
            });
        });
    }

    private addOverlayToGroup(overlay: TextOverlayData) {
        const filtered = this.textOverlayDisplayGroupList.filter(value => value.match(overlay));

        let overlayGroup = null;
        if (filtered.length === 0) {
            overlayGroup = new TextOverlayDisplayGroup(overlay);
            this.textOverlayDisplayGroupList.push(overlayGroup);
        } else {
            overlayGroup = filtered[0];
        }

        overlayGroup.add(overlay);
    }

    private getOverlayDisplayGroup(modality: string): TextOverlayDisplayGroup[] {
        return this.textOverlayDisplayGroupList.filter(group => group.modality === modality);
    }

    private getTextOverlayValue(image: Image, overlay: TextOverlayData): string {

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
        let hex = Number(decimal).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? 2 : padding;

        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return hex;
    }

    private getTagString(group: number, element: number): string {
        return 'x' + this.decimalToHexString(group, 4) + this.decimalToHexString(element, 4);
    }

    private addOverlayDisplayList(overlayDisplayList: TextOverlayDisplayItem[], overlayList: TextOverlayData[],
        alignLeft: boolean, image: Image, canvasWidth: number, canvasHeight: number, canvasContext: any, fontHeight: number) {

        const lineWidth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        overlayList.forEach(overlayConfig => {
            const displayItem = new TextOverlayDisplayItem();
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
                posY += fontHeight + 3;
            } else if (overlayConfig.gridY === 2) {
                posY += fontHeight; // ? why
            }

            const height = fontHeight + 4;
            if (overlayConfig.offsetY > 0) {
                posY += height * (overlayConfig.offsetY - 1);
            } else {
                posY += height * overlayConfig.offsetY;
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

    private getGraphicOverlayData(image: Image, groupString: string): GraphicOverlayData {

        const element = image.cornerStoneImage.data.elements[groupString + "3000"];
        const rows = image.cornerStoneImage.data.uint16(groupString + "0010");
        const cols = image.cornerStoneImage.data.uint16(groupString + "0011");
        const type = image.cornerStoneImage.data.string(groupString + "0040");
        const startX = image.cornerStoneImage.data.uint16(groupString + "0050", 0);
        const startY = image.cornerStoneImage.data.uint16(groupString + "0050", 1);

        if (!element || !rows || !cols || !type || !startX || !startY) {
            return undefined;
        }

        const graphicOverlayData = new GraphicOverlayData;
        graphicOverlayData.rows = rows;
        graphicOverlayData.cols = cols;
        graphicOverlayData.type = type;
        graphicOverlayData.startX = startX;
        graphicOverlayData.startY = startY;

        const imageWidth = image.width();
        const imageHeight = image.height();

        for (let i = 0; i < element.length; i++) {
            const byte = image.cornerStoneImage.data.byteArray[element.dataOffset + i];
            if (byte === 0) {
                continue;
            }

            const y = Math.floor(i * 8 / cols);
            const x = i * 8 % cols;
            let flag = 128;
            for (let j = 0; j < 8; j++) {
                if (byte & flag) {
                    const px = x - j + startX - 1;
                    const py = y + startY - 1;
                    if (px >= 0 && px < imageWidth && py >= 0 && py < imageHeight) {
                        graphicOverlayData.dataList.push({ x: px, y: py });
                    }
                }
                flag = flag >> 1;
            }
        }

        graphicOverlayData.desc = image.cornerStoneImage.data.string(groupString + "0022");
        graphicOverlayData.label = image.cornerStoneImage.data.string(groupString + "1500");

        return graphicOverlayData;
    }
}
