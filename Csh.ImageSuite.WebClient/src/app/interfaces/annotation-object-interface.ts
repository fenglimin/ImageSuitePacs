import { Point } from '../models/annotation';
import { MouseEventType } from '../annotation/ann-object';

export interface IAnnotationObject {
    isSelected(): boolean;
    isCreated(): boolean;
    onSelect(selected: boolean, focused: boolean): void;
    onMouseEvent(mouseEventType: MouseEventType, point: Point):void;
    onDeleteChildren(): void;
    onScale(): void;
    onFlip(vertical: boolean): void;
    onKeyDown(keyEvent: any): void;
    onSwitchFocus(): void;

    onDrawEnded();
    onChildDragged(draggedObj: any, deltaX: number, deltaY: number);
}