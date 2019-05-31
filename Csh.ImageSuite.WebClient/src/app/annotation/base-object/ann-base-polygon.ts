import { Point, MouseEventType } from '../../models/annotation';
import { AnnTool } from "../ann-tool";
import { IImageViewer } from "../../interfaces/image-viewer-interface";
import { AnnBaseObject } from "./ann-base-object";
import { AnnObject } from '../ann-object';
import { AnnSerialize } from "../ann-serialize";

export class AnnBasePolygon extends AnnBaseObject {

    constructor(parentObj: AnnObject, pointList: any, imageViewer: IImageViewer, annSerialize: AnnSerialize = undefined) {
        super(parentObj, imageViewer);
        this.jcObj = jCanvaScript.lines(pointList, this.selectedColor).layer(this.layerId);
        super.setJcObj();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Override functions of base class
    onSave(annSerialize: AnnSerialize) {
        annSerialize.writeString("CGXAnnPolygon");
        annSerialize.writeInteger(3, 4);
        annSerialize.writeInteger(1, 4);
        annSerialize.writeInteger(this.selected ? 1 : 0, 1);

        const points = this.jcObj.points();
        const length = points.length;
        annSerialize.writeInteger(length, 4);
        annSerialize.writeInteger(length, 4);

        for (let i = 0; i < length; i ++) {
            annSerialize.writeInteger(points[i][0], 4);
            annSerialize.writeInteger(points[i][1], 4);
        }

        for (let i = 0; i < length; i++) {
            annSerialize.writeString("CGXAnnLine"); // CGXAnnLine
            annSerialize.writeInteger(1, 4);
            annSerialize.writeInteger(0, 4);
            annSerialize.writeInteger(0, 1);

            if (i !== length - 1) {
                annSerialize.writeInteger(points[i][0], 4);
                annSerialize.writeInteger(points[i][1], 4);
                annSerialize.writeInteger(points[i + 1][0], 4);
                annSerialize.writeInteger(points[i + 1][1], 4);
            } else {
                annSerialize.writeInteger(points[0][0], 4);
                annSerialize.writeInteger(points[0][1], 4);
                annSerialize.writeInteger(points[length - 1][0], 4);
                annSerialize.writeInteger(points[length - 1][1], 4);
            }
        }
    }

    onFlip(vertical: boolean) {
        const points = this.jcObj.points();
        if (vertical) {
            const height = this.image.height();
            points.forEach(point => {
                point[1] = height - point[1];
            });
        } else {
            const width = this.image.width();
            points.forEach(point => {
                point[0] = width - point[0];
            });
        }

        this.jcObj.points(points);
    }

    onTranslate(deltaX: number, deltaY: number) {
        const points = this.jcObj.points();
        points.forEach(point => {
            point[0] += deltaX;
            point[1] += deltaY;
        });

        this.jcObj.points(points);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    setClosed(closed: boolean) {
        this.jcObj._closed = closed;
    }

    addPoint(point: Point) {
        this.jcObj.addPoint(point.x, point.y);
    }

    deletePoint(point: Point) {
        this.jcObj.delPoint(point.x, point.y, 1);
    }

    updateLastPoint(point: Point) {
        this.updatePoint(this.jcObj.points().length - 1, point);
    }

    updatePoint(index: number, point: Point) {
        const points = this.jcObj.points();
        if (index >= points.length || index < 0) {
            alert("Internal error, invalid index in AnnBasePolygon.updatePoint()");
            return;
        }

        points[index][0] = point.x;
        points[index][1] = point.y;

        this.jcObj.points(points);
    }

    getAreaString(): string {
        let areaString = "Size = ";

        const originalPoint = new Point(0, 0);

        const points = this.jcObj.points();
        const length = points.length;
        let area = AnnTool.countTriangleArea(originalPoint,
            new Point(points[length - 1][0], points[length - 1][1]),
            new Point(points[0][0], points[0][1]));

        for (let i = 1; i < length; i ++) {
            area += AnnTool.countTriangleArea(originalPoint,
                new Point(points[i - 1][0], points[i - 1][1]),
                new Point(points[i][0], points[i][1]));
        }

        area = Math.abs(area);
        if (this.pixelSpacing) {
            areaString += (area * this.pixelSpacing.cx * this.pixelSpacing.cy).toFixed(2) + "mm";
        } else {
            areaString += area.toFixed(2) + "pt";
        }

        areaString += "\xb2";
        return areaString;
    }

    setPointList(pointList: any) {
        this.jcObj.points(pointList);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
}
