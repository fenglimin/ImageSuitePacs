
export enum MessageBoxType {
  Info,
  Question,
  Warning,
  Error,
  Input
}

export class MessageBoxContent {
  title: string;
  messageText: string;
  messageType: MessageBoxType;
}