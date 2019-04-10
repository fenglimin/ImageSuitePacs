export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export enum AnnType {
    Line = 1,
    Circle = 2,
    Rectangle = 3
}