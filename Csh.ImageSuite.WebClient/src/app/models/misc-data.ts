export class FontData {
    name: string;
    color: string;
    size: number;

    constructor(name: string, color: string, size: number) {
        this.name = name;
        this.color = color;
        this.size = size;
    }

    getCanvasFontString(): string {
        return "{0}px {1}".format(this.size, this.name);
    }
} 