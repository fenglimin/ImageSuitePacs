import { Point, Size, Rectangle, PositionInRectangle } from '../models/annotation';
import { AnnSerialize } from "./ann-serialize";

export class AnnConfigLoader {

    static loadBaseLine(annSerialize: AnnSerialize): any {
        const annName = annSerialize.readString(); // CGXAnnLine
        const created = annSerialize.readNumber(4);
        const moving = annSerialize.readNumber(4);
        const selected = annSerialize.readNumber(1);

        const startPoint = annSerialize.readPoint();
        const endPoint = annSerialize.readPoint();

        return { startPoint: startPoint, endPoint: endPoint };
    }

    static loadLine(annSerialize: AnnSerialize): any {
        const annType = annSerialize.readNumber(4); // 33
        const created = annSerialize.readNumber(4);
        const selected = annSerialize.readNumber(1);
        const config = AnnConfigLoader.loadBaseLine(annSerialize);

        return config;
    }

    static loadArrow(annSerialize: AnnSerialize, loadArrowMark: boolean = true): any {
        // CGXAnnArrowMark
        if (loadArrowMark) {
            const annType = annSerialize.readNumber(4); // 10
            const created = annSerialize.readNumber(4);
            const selected = annSerialize.readNumber(1);
        }

        // CGXAnnArrow
        const annName1 = annSerialize.readString();
        const created1 = annSerialize.readNumber(4);
        const selected1 = annSerialize.readNumber(1);

        const config = AnnConfigLoader.loadBaseLine(annSerialize);

        // The two small lines of the arrow will be created dynamically, read but ignore it
        AnnConfigLoader.loadBaseLine(annSerialize);
        AnnConfigLoader.loadBaseLine(annSerialize);

        return config;
    }

    static loadBaseText(annSerialize: AnnSerialize): any {
        const annName = annSerialize.readString(); // CGXAnnText
        const created = annSerialize.readNumber(4);
        const moving = annSerialize.readNumber(4);
        const selected = annSerialize.readNumber(1);

        const bottomRightPoint = annSerialize.readPoint();
        const topLeftPoint = annSerialize.readPoint();
        const text = annSerialize.readString();
        const isRotateCreated = annSerialize.readNumber(4);
        const rotateCreated = annSerialize.readNumber(4);
        const fontHeight = annSerialize.readNumber(4);

        return { topLeftPoint: topLeftPoint, bottomRightPoint: bottomRightPoint, text: text };
    }

    static loadTextIndicator(annSerialize: AnnSerialize): any {
        const annName = annSerialize.readString(); // CGXAnnLabel
        const created = annSerialize.readNumber(4);
        const selected = annSerialize.readNumber(1);

        const arrow = AnnConfigLoader.loadArrow(annSerialize, false);
        const baseText = AnnConfigLoader.loadBaseText(annSerialize);

        return arrow;
    }

    static loadBaseRectangle(annSerialize: AnnSerialize): any {
        const annName = annSerialize.readString(); // CGXAnnRectangle
        const created = annSerialize.readNumber(4);
        const moving = annSerialize.readNumber(4);
        const selected = annSerialize.readNumber(1);

        const topLeftPoint = annSerialize.readPoint();
        const bottomRightPoint = annSerialize.readPoint();
        const topRightPoint = annSerialize.readPoint();
        const bottomLeftPoint = annSerialize.readPoint();

        return { topLeftPoint: topLeftPoint, width: bottomRightPoint.x - topLeftPoint.x, height: bottomRightPoint.y - topLeftPoint.y };
    }

    static loadRectangle(annSerialize: AnnSerialize): any {
        const annType = annSerialize.readNumber(4); // 2
        const created = annSerialize.readNumber(4);
        const selected = annSerialize.readNumber(1);

        const baseRect = AnnConfigLoader.loadBaseRectangle(annSerialize);
        const textIndicator = AnnConfigLoader.loadTextIndicator(annSerialize);

        return { baseRect: baseRect, textIndicator: textIndicator}
    }
}
