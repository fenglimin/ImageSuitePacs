import { Point } from '../models/annotation';
import { MouseEventType } from '../annotation/ann-object';

export interface IAnnotationObject {
    isCreated(): boolean;
    onSelect(selected: boolean): void;
    onMouseEvent(mouseEventType: MouseEventType, point: Point):void;
    onDeleteChildren(): void;
    onScale(): void;
}