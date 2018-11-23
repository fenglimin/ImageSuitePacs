
export enum MessageBoxType {
  Info,
  Question,
  Warning,
  Error
}

export class MessageBoxContent {
  title: string;
  messageText: string;
  messageType: MessageBoxType;
}