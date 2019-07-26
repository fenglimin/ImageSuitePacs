import { ImageOperationData } from "../models/image-operation";

export enum ToolbarButtonTypeEnum {
    SingleButton = 0,
    ListButton,
    Divider
}

export class ToolbarButtonData {
    buttonType: ToolbarButtonTypeEnum;
    buttonData: any;

    constructor(buttonType: ToolbarButtonTypeEnum, buttonData: any) {
        this.buttonType = buttonType;
        this.buttonData = buttonData;
    }
}

export class SelectedButtonData {
    name: string;       // Button's image name
    tip: string;        // Button's tip
    operationData: ImageOperationData;
}

export class ButtonStyleToken {
    normal: string;
    over: string;
    down: string;
    disable: string;
}
