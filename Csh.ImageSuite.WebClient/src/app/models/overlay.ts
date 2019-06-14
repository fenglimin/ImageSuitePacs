export class TextOverlayData {
    gridX: number;
    gridY: number;
    offsetX: number;
    offsetY: number;
    prefix: string;
    suffix: string;
    overlayId: string;
    overlayUid: string;
    overlayName: string;
    modality: string;
    localName: string;
    dicomName: string;
    tableName: string;
    fieldName: string;
    groupNumber: number;
    elementNumber: number;
}

export class TextOverlayDisplayGroup {
    gridX: number;
    gridY: number;
    modality: string;

    itemListAlignLeft: TextOverlayData[];
    itemListAlignRight: TextOverlayData[];

    constructor(overlay: TextOverlayData) {
        this.gridX = overlay.gridX;
        this.gridY = overlay.gridY;
        this.modality = overlay.modality;
        this.itemListAlignLeft = [];
        this.itemListAlignRight = [];
    }

    match(overlay: TextOverlayData): boolean {
        return this.gridX === overlay.gridX && this.gridY === overlay.gridY && this.modality === overlay.modality;
    }

    add(overlay: TextOverlayData) {
        overlay.offsetX > 0 ? this.itemListAlignLeft.push(overlay) : this.itemListAlignRight.push(overlay);
    }
}

export class TextOverlayDisplayItem {
    id: string;
    posX: number;
    posY: number;
    text: string;
    align: string;
}

export class GraphicOverlayData {
    rows: number;
    cols: number;
    startX: number;
    startY: number;

    type: string;
    label: string;
    desc: string;
    dataList = [];
}