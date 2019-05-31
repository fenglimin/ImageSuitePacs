
export enum MessageBoxType {
    Info,
    Question,
    Warning,
    Error,
    Input,
    InfoCancel
}

export enum DialogResult {
    Ok,
    Cancel,
    Yes,
    No
}

export class MessageBoxContent {
    title: string;
    messageText: string;
    messageType: MessageBoxType;
    callbackOwner: any;
    callbackFunction: any;
    callbackArg: any;
}
