
export enum MessageBoxType {
    Info,
    Question,
    Warning,
    Error,
    Input
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
}
