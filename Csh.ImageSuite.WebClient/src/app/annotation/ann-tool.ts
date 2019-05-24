import { Point, Size, Rectangle, PositionInRectangle } from '../models/annotation';
import { Image } from "../models/pssi";
import { IImageViewer } from "../interfaces/image-viewer-interface";

export class AnnTool {

    static minDelta = 0.0000000001;

    static screenToImage(point: Point, transform: any): Point {
        const x = point.x;
        const y = point.y;
        const imgPt = [0, 0, 1];

        const a = x;
        const b = y;
        const n1 = transform[0][0];
        const n2 = transform[0][1];
        const n3 = transform[0][2];
        const n4 = transform[1][0];
        const n5 = transform[1][1];
        const n6 = transform[1][2];

        let t = a * n4 - n3 * n4 - b * n1 + n1 * n6;
        const t2 = n2 * n4 - n1 * n5;

        imgPt[1] = t / t2;

        t = b * n2 - n2 * n6 - a * n5 + n3 * n5;
        imgPt[0] = t / t2;

        return {
            x: imgPt[0],
            y: imgPt[1]
        };
    }

    static imageToScreen(point: Point, transform: any): Point {
        const x = point.x;
        const y = point.y;
        const imgPt = [x, y, 1];
        const screenPt = [0, 0, 1];

        screenPt[0] = transform[0][0] * imgPt[0] + transform[0][1] * imgPt[1] + transform[0][2] * imgPt[2];
        screenPt[1] = transform[1][0] * imgPt[0] + transform[1][1] * imgPt[1] + transform[1][2] * imgPt[2];

        return {
            x: screenPt[0],
            y: screenPt[1]
        };
    }

    static imageToImage(sourcePoint: Point, sourceTransform: any, destTransform: any): Point {
        const screenPoint = AnnTool.imageToScreen(sourcePoint, sourceTransform);
        return AnnTool.screenToImage(screenPoint, destTransform);
    }

    static imageListToImageList(pointList: Point[], sourceTransform: any, destTransform: any): Point[] {
        const retList = [];

        for (let i = 0; i < pointList.length; i++) {
            retList.push(AnnTool.imageToImage(pointList[i], sourceTransform, destTransform));
        }

        return retList;
    }

    static annLabelLayerToAnnLayer(point: Point, imageViewer: IImageViewer): Point {
        return AnnTool.imageToImage(point, imageViewer.getAnnLabelLayer().transform(), imageViewer.getImageLayer().transform());
    }

    static annLayerToAnnLabelLayer(point: Point, imageViewer: IImageViewer): Point {
        return AnnTool.imageToImage(point, imageViewer.getImageLayer().transform(), imageViewer.getAnnLabelLayer().transform());
    }

    static isJcanvasObject(obj: any): boolean {
        if (!obj) {
            return false;
        }

        if (obj.optns) {
            return true;
        }

        return false;
    }

    static countDistance(point1: Point, point2: Point): number {
        let value = Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2);
        value = Math.sqrt(value);

        return value;
    }

    static countPhysicalDistance(point1: Point, point2: Point, pixelSpacing: Size) {
        const phyDistX = Math.abs(point1.x - point2.x) * pixelSpacing.cx;
        const phyDistY = Math.abs(point1.y - point2.y) * pixelSpacing.cy;

        let value = Math.pow(phyDistX, 2) + Math.pow(phyDistY, 2);
        value = Math.sqrt(value);
        return value;
    }

    static countTriangleArea(point1: Point, point2: Point, point3: Point): number {
        return (point2.x * point3.y +
                point1.x * point2.y +
                point1.y * point3.x -
                point1.y * point2.x -
                point2.y * point3.x -
                point1.x * point3.y) / 2.0;
    }

    static countTrianglePhysicalArea(point1: Point, point2: Point, point3: Point, pixelSpacing: Size): number {
        return AnnTool.countTriangleArea(point1, point2, point3) * pixelSpacing.cx * pixelSpacing.cy;
    }

    static getSineTheta(pt1: Point, pt2: Point) {
        const distance = AnnTool.countDistance(pt1, pt2);
        if (Math.abs(distance) < AnnTool.minDelta) {
            return 0.0;
        } else {
            const sineTheta = -(Math.abs(pt1.y - pt2.y)) / distance;
            return (pt1.y > pt2.y) ? sineTheta : -sineTheta;
        }
    }

    static getCosineTheta(pt1: Point, pt2: Point) {
        const distance = AnnTool.countDistance(pt1, pt2);
        if (Math.abs(distance) < AnnTool.minDelta) {
            return 0.0;
        } else {
            const cosineTheta = (Math.abs(pt1.x - pt2.x)) / distance;
            return (pt1.x < pt2.x) ? cosineTheta : -cosineTheta;
        }
    }

    static multiplyPointM(x, y, m) {
        return {
            x: (x * m[0][0] + y * m[0][1] + m[0][2]),
            y: (x * m[1][0] + y * m[1][1] + m[1][2])
        }
    }

    static equalPoint(p1: Point, p2: Point): boolean {
        return Math.abs(p1.x - p2.x) < 0.0001 && Math.abs(p1.y - p2.y) < 0.0001;
    }

    static pointListFromRect(rect: Rectangle): Point[] {
        const retPointList = [];

        retPointList.push({ x: rect.x, y: rect.y });
        retPointList.push({ x: rect.x + rect.width, y: rect.y });
        retPointList.push({ x: rect.x + rect.width, y: rect.y + rect.height });
        retPointList.push({ x: rect.x, y: rect.y + rect.height });

        return retPointList;
    }

    static pointListFrom(point: Point, posInRect: PositionInRectangle, width: number, height: number): Point[] {
        const retPointList = [];

        if (posInRect === PositionInRectangle.TopLeft) {
            retPointList.push({ x: point.x, y: point.y });
            retPointList.push({ x: point.x + width, y: point.y });
            retPointList.push({ x: point.x + width, y: point.y + height });
            retPointList.push({ x: point.x, y: point.y + height });
        } else if (posInRect === PositionInRectangle.TopRight) {
            retPointList.push({ x: point.x - width, y: point.y });
            retPointList.push({ x: point.x, y: point.y });
            retPointList.push({ x: point.x, y: point.y + height });
            retPointList.push({ x: point.x - width, y: point.y + height });
        } else if (posInRect === PositionInRectangle.BottomRight) {
            retPointList.push({ x: point.x - width, y: point.y - height });
            retPointList.push({ x: point.x, y: point.y - height });
            retPointList.push({ x: point.x, y: point.y });
            retPointList.push({ x: point.x - width, y: point.y });
        } else if (posInRect === PositionInRectangle.BottomLeft) {
            retPointList.push({ x: point.x, y: point.y - height });
            retPointList.push({ x: point.x + width, y: point.y - height });
            retPointList.push({ x: point.x + width, y: point.y });
            retPointList.push({ x: point.x, y: point.y });
        }


        return retPointList;
    }

    static centerPoint(point1: Point, point2: Point): Point {
        return { x: (point1.x + point2.x) / 2.0, y: (point1.y + point2.y) / 2.0 };
    }


    static calcLineAngle(point1: Point, point2: Point): number {

        const dwSin = AnnTool.getSineTheta(point1, point2);
        const dwCos = AnnTool.getCosineTheta(point1, point2);

        let dwTheta: number;
        if (dwSin >= 0 && dwCos >= 0) {
            dwTheta = Math.asin(Math.abs(dwSin));
        } else if (dwSin >= 0 && dwCos < 0) {
            dwTheta = Math.asin(Math.abs(dwSin));
            dwTheta = Math.PI - dwTheta;
        } else if (dwSin < 0 && dwCos <= 0) {
            dwTheta = Math.asin(Math.abs(dwSin));
            dwTheta = Math.PI + dwTheta;
        } else {
            dwTheta = Math.asin(Math.abs(dwSin));
            dwTheta = Math.PI * 2 - dwTheta;
        }
        if (180.0 / Math.PI * dwTheta > 360) {
            return 180.0 / Math.PI * dwTheta - 360;
        }

        return 180.0 / Math.PI * dwTheta;
    }

    static pointInRect(point: Point, rect: Rectangle): boolean {
        const startX = Math.min(rect.x, rect.x + rect.width);
        const endX = Math.max(rect.x, rect.x + rect.width);
        const startY = Math.min(rect.y, rect.y + rect.height);
        const endY = Math.max(rect.y, rect.y + rect.height);

        return startX <= point.x && point.x <= endX && startY <= point.y && point.y <= endY;
    }

    static pointInLine(point: Point, lineStartPoint: Point, lineEndPoint: Point): any {
        const lenToStart = AnnTool.countDistance(point, lineStartPoint);
        const lenToEnd = AnnTool.countDistance(point, lineEndPoint);
        const length = AnnTool.countDistance(lineStartPoint, lineEndPoint);
        const lenDelta = lenToStart + lenToEnd - length;

        return { isInLine: lenDelta < 0.01, nearStart: lenToStart < lenToEnd };
    }

    static calcFootPoint(point1: Point, point2: Point, pointDrag: Point): Point {
        const dSinB = AnnTool.getSineTheta(point1, point2);
        const dCosB = AnnTool.getCosineTheta(point1, point2);

        const dSinC = AnnTool.getSineTheta(point1, pointDrag);
        const dCosC = AnnTool.getCosineTheta(point1, pointDrag);

        const dCosBsubC = dCosB * dCosC + dSinB * dSinC; // Cos(B-C)

        const dLineAC = AnnTool.countDistance(point1, pointDrag);
        const dLineAM = dLineAC * dCosBsubC;

        return { x: point1.x + dLineAM * dCosB, y: point1.y + dLineAM * dSinB };
    }

    static formatRect(rect: Rectangle): Rectangle {
        // Format the rect to make sure that both width and height are positive
        if (rect.width < 0) {
            rect.x += rect.width;
            rect.width = -rect.width;
        }

        if (rect.height < 0) {
            rect.y += rect.height;
            rect.height = -rect.height;
        }

        return rect;
    }

    static pointInLineByDistance(lineStartPoint: Point, lineEndPoint: Point, distanceToStart: number): Point {
        const lineDistance = AnnTool.countDistance(lineStartPoint, lineEndPoint);
        const lineRatio = distanceToStart / lineDistance;
        const x = (lineEndPoint.x - lineStartPoint.x) * lineRatio + lineStartPoint.x;
        const y = (lineEndPoint.y - lineStartPoint.y) * lineRatio + lineStartPoint.y;
        return { x: x, y: y };
    }

    // Calculate the middle point of the curve (The curve is determined by start/end point and its radius, default direction is left or up)
    static calcMiddlePointOfArc(startPoint: Point, endPoint: Point, radius: number): Point {
        const pointDir = { x: 1, y: 1 };
        const centerPoint = AnnTool.centerPoint(startPoint, endPoint);

        const dSinAB = AnnTool.getSineTheta(startPoint, endPoint);
        const dCosAB = AnnTool.getCosineTheta(startPoint, endPoint);

        const dLineAD = AnnTool.countDistance(startPoint, centerPoint);

        const ptO1 = new Point(0, 0);
        const ptO2 = new Point(0, 0);

        //get the two center ponints.
        //check if the arc is almost 180, if true, lineAd is the radius
        if (Math.abs(dLineAD - radius) < AnnTool.minDelta || radius < dLineAD) {
            ptO1.x = ptO2.x = centerPoint.x;
            ptO1.y = ptO2.y = centerPoint.y;
        } else {
            const dLineOD = Math.sqrt(Math.abs(radius * radius - dLineAD * dLineAD));

            ptO1.x = centerPoint.x + dLineOD * dSinAB;
            ptO1.y = centerPoint.y - dLineOD * dCosAB;

            ptO2.x = centerPoint.x - dLineOD * dSinAB;
            ptO2.y = centerPoint.y + dLineOD * dCosAB;
        }

        var dSinBA = AnnTool.getSineTheta(endPoint, startPoint),
            dCosBA = AnnTool.getCosineTheta(endPoint, startPoint),
            dSinBC = AnnTool.getSineTheta(endPoint, pointDir),
            dCosBC = AnnTool.getCosineTheta(endPoint, pointDir);

        //determine the center point
        const middlePoint = new Point(0, 0);
        var dSinBC_BA = dSinBC * dCosBA - dCosBC * dSinBA;
        if (dSinBC_BA < 0.0) {
            middlePoint.x = ptO1.x - radius * dSinAB;
            middlePoint.y = ptO1.y + radius * dCosAB;
        } else {
            middlePoint.x = ptO2.x + radius * dSinAB;
            middlePoint.y = ptO2.y - radius * dCosAB;
        }

        return middlePoint;
    }

    // Calculate the center point of the curve ( The curve is determined by three points )
    static calcCenterBy3Points(startPoint: Point, endPoint: Point, middlePoint: Point): any {
        let isInvalid = false;
        let needRevert = false;

        // D and E is center point of Line AB and Line BC
        const ptD = AnnTool.centerPoint(startPoint, endPoint);
        const ptE = AnnTool.centerPoint(endPoint, middlePoint);

        // k of Line OD and Line OE
        // O is center point of arc
        //
        const dkOD = -(endPoint.x - startPoint.x) / (endPoint.y - startPoint.y);
        const dkOE = -(middlePoint.x - endPoint.x) / (middlePoint.y - endPoint.y);

        const centerPoint = new Point(0, 0);
        if (Math.abs(middlePoint.y - endPoint.y) < AnnTool.minDelta) {
            centerPoint.x = ptE.x;
            centerPoint.y = (ptE.x - ptD.x) * dkOD + ptD.y;
        } else if (Math.abs(endPoint.y - startPoint.y) < AnnTool.minDelta) {
            centerPoint.x = ptD.x;
            centerPoint.y = (ptD.x - ptE.x) * dkOE + ptE.y;
        } else if (Math.abs(middlePoint.x - endPoint.x) < AnnTool.minDelta) {
            centerPoint.y = ptE.y;
            centerPoint.x = (ptE.y - ptD.y) / dkOD + ptD.x;
        } else if (Math.abs(endPoint.x - startPoint.x) < AnnTool.minDelta) {
            centerPoint.y = ptD.y;
            centerPoint.x = (ptD.y - ptE.y) / dkOE + ptE.x;
        } else {
            centerPoint.x = (ptE.y - ptD.y - (ptE.x * dkOE) + (ptD.x * dkOD)) / (dkOD - dkOE);
            centerPoint.y = ptD.y + dkOD * (centerPoint.x - ptD.x);
        }

        // Analysis Start Point and End point
        // Arc() always draw arc in a Clockwise
        //
        var dSinBA = AnnTool.getSineTheta(endPoint, startPoint),
            dCosBA = AnnTool.getCosineTheta(endPoint, startPoint),
            dSinBC = AnnTool.getSineTheta(endPoint, middlePoint),
            dCosBC = AnnTool.getCosineTheta(endPoint, middlePoint);

        var dSinBC_BA = dSinBC * dCosBA - dCosBC * dSinBA;

        // Check Arc angle
        //
        var dSinOA = AnnTool.getSineTheta(centerPoint, startPoint),
            dCosOA = AnnTool.getCosineTheta(centerPoint, startPoint),
            dSinOB = AnnTool.getSineTheta(centerPoint, endPoint),
            dCosOB = AnnTool.getCosineTheta(centerPoint, endPoint);

        var dSinArc = dSinOA * dCosOB - dCosOA * dSinOB;

        if (dSinBC_BA > 0.0) {
            dSinArc = (-1.0) * dSinArc;
        }

        if (dSinArc < 0.0) {
            isInvalid = true;
        }

        //need to revert start and end.
        if (dSinBC_BA > 0.0) {
            needRevert = true;
        }

        return { centerPoint: centerPoint, isInvalid: isInvalid, needRevert: needRevert };
    }

    // Calculate all necessary information of a curve
    static calcArcBy3Points(startPoint: Point, endPoint: Point, middlePoint: Point, needCheckArc: boolean): any {
        const arcData = AnnTool.calcCenterBy3Points(startPoint, endPoint, middlePoint);

        if (needCheckArc && arcData.isInvalid)
            return false; //user may drag the point out of range

        const radius = AnnTool.countDistance(arcData.centerPoint, startPoint);

        const dSinAB = AnnTool.getSineTheta(startPoint, endPoint);
        const dCosAB = AnnTool.getCosineTheta(startPoint, endPoint);

        if (arcData.needRevert) {
            middlePoint.x = arcData.centerPoint.x + radius * dSinAB;
            middlePoint.y = arcData.centerPoint.y - radius * dCosAB;
        } else {
            middlePoint.x = arcData.centerPoint.x - radius * dSinAB;
            middlePoint.y = arcData.centerPoint.y + radius * dCosAB;
        }

        const arcStart = AnnTool.calcLineAngle(arcData.centerPoint, startPoint);
        let arcEnd = AnnTool.calcLineAngle(arcData.centerPoint, endPoint);
        if (arcEnd < arcStart) {
            arcEnd = arcEnd + 360.0;
        }

        return {
            centerPoint: arcData.centerPoint,
            startPoint: startPoint,
            endPoint: endPoint,
            middlePoint: middlePoint,
            radius: radius,
            startAngle: arcStart,
            endAngle: arcEnd,
            anticlockwise: !arcData.needRevert
        };
    }
}