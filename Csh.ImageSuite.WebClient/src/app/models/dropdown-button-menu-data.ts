import { OperationData } from "../services/view-context.service";

export class SelectedButtonData {
    name: string;       // Button's image name
    tip: string;        // Button's tip
    operationData: OperationData;
}

export class ButtonStyleToken {
    normal: string;
    over: string;
    down: string;
    disable: string;
}
