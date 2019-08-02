import { Image } from "../models/pssi";
import { LayoutPosition } from "../models/layout";
import { ViewerGroupData } from "../models/viewer-group-data";
import { LogService } from "../services/log.service";

export class ViewerImageData {
    static logService: LogService;
    groupData: ViewerGroupData;
    position: LayoutPosition;

    selected = false;
    hide = true;

    image: Image;

    constructor(viewerGroupData: ViewerGroupData, position: LayoutPosition) {
        this.groupData = viewerGroupData;
        this.position = position;

        ViewerImageData.logService.debug("ViewerImageData " + this.getId() + " created!");
    }

    getId(): string {
        return (this.groupData && this.position)? this.groupData.getId() + this.position.getId() : "Temp";
    }

    setPosition(position: LayoutPosition) {
        this.position = position;
    }

    setImage(image: Image) {
        this.image = image;
    }

    isEmpty(): boolean {
        return this.image === null;
    }

    sameImage(image: Image): boolean {
        return this.image === image;
    }

    sameGroup(image: Image): boolean {
        return this.groupData.getViewerImageDataByImage(image) !== undefined;
    }

    sameShell(image: Image): boolean {
        return this.groupData.viewerShellData.getViewerImageDataByImage(image) !== undefined;
    }
}
