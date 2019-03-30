export class  Overlay {
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

export class OverlayDisplayGroup {
    gridX: number;
    gridY: number;
    modality: string;

    itemListAlignLeft: Overlay[];
    itemListAlignRight: Overlay[];

    constructor(overlay: Overlay) {
        this.gridX = overlay.gridX;
        this.gridY = overlay.gridY;
        this.modality = overlay.modality;
        this.itemListAlignLeft = [];
        this.itemListAlignRight = [];
    }

    match(overlay: Overlay):boolean {
        return this.gridX === overlay.gridX && this.gridY === overlay.gridY && this.modality === overlay.modality;
    }

    add(overlay: Overlay) {
        overlay.offsetX > 0 ? this.itemListAlignLeft.push(overlay) : this.itemListAlignRight.push(overlay);
    }
}

export class OverlayDisplayItem {
    id: string;
    posX: number;
    posY: number;
    text: string;
    align: string;
}