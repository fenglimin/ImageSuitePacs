import { OperationData } from '../services/view-context.service';

export class SelectedButtonData {
  name: string;        
  tip: string;
  operationData: OperationData;
}

export class ButtonStyleToken {
  normal: string;
  over: string;
  down: string;
  disable: string;
}