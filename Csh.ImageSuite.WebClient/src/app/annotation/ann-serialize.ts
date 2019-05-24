import { Point, Size, Rectangle, PositionInRectangle } from '../models/annotation';
import { IImageViewer } from "../interfaces/image-viewer-interface";
import { AnnLine } from "./extend-object/ann-line";
import { AnnArrow } from "./extend-object/ann-arrow";
import { AnnRectangle } from "./extend-object/ann-rectangle";
import { AnnPolygon } from "./extend-object/ann-polygon";
import { AnnAngle } from "./extend-object/ann-angle";
import { AnnExtendObject } from "./extend-object/ann-extend-object";

export class AnnSerialize {
    private annData: Uint8Array;
    private imageViewer: IImageViewer;
    private annString = "";
    private version = 1023;

    constructor(annData: Uint8Array, imageViewer: IImageViewer) {
        this.annData = annData;
        this.imageViewer = imageViewer;
    }

    createAnn() {
        if (!this.annData) return;

        if (this.annData[this.annData.length - 1] === 0X20) {
            // Remove the last 0X20
            this.readNumber(1);
        }

        this.version = this.readNumber(4);
        const annCount = this.readNumber(4);

        
        for (let i = 0; i < annCount; i++) {
            let annObj = undefined;
            const annName = this.readString();
            switch (annName) {
                case "CGXAnnLineEx":
                    annObj = new AnnLine(undefined, this.imageViewer);
                    break;
                case "CGXAnnArrowMark":
                    annObj = new AnnArrow(undefined, this.imageViewer);
                    break;
                case "CGXAnnSquare":
                    annObj = new AnnRectangle(undefined, this.imageViewer);
                    break;
                case "CGXAnnPolygon":
                    annObj = new AnnPolygon(undefined, this.imageViewer);
                    break;
                case "CGXAnnProtractor":
                    annObj = new AnnAngle(undefined, this.imageViewer);
                    break;
                default:
                    alert("Unknown annotation " + annName);
            }

            if (annObj) {
                annObj.onLoad(this);
            }
        }
    }

    getAnnString(annList: AnnExtendObject[]): string {
        this.annString = "";
        this.writeNumber(this.version, 4);
        this.writeNumber(annList.length, 4);
        annList.forEach(annObj => annObj.onSave(this));
        return this.annString;
    }

    readNumber(bytes: number): number {
        const length = this.annData.length;
        let value = 0;
        for (let i = 0; i < bytes; i++) {
            value += this.annData[length - i - 1] << (i * 8);
        }

        this.annData = this.annData.slice(0, length - bytes);
        return value;
    }

    readString(): string {
        const strLen = this.readNumber(4) / 2;
        let str = "";

        for (let index = 0; index < strLen; index++) {
            const ch = this.readNumber(2);
            str += String.fromCharCode(ch);
        }

        return str;
    }

    readPoint(): Point {
        return { x: this.readNumber(4), y: this.readNumber(4) };
    }

    writePoint(point: Point) {
        this.writeNumber(point.x, 4);
        this.writeNumber(point.y, 4);
    }

    writeNumber(value: number, bytes: number) {
        // Old image suite annotation save the number in integer. Need to round it.
        value = Math.round(value);
        const byteArray = [];
        for (let index = 0; index < bytes; index++) {
            const byte = value & 0xff;
            byteArray.unshift(byte);
            value = (value - byte) / 256;
        }

        this.annString = this.byteArrayToHexString(byteArray) + this.annString;
    }

    writeString(str: string) {
        const length = str.length;
        this.writeNumber(length * 2, 4);
        for (let index = 0; index < length; index ++) {
            this.writeNumber(str.charCodeAt(index), 2);
        }
    }

    private byteArrayToHexString(byteArray): string {
        let s = "";
        byteArray.forEach(byte => {
            s += ("0" + (byte & 0xFF).toString(16)).slice(-2);
        });

        return s;
    }
}