import { Image } from "../models/pssi";
import { LayoutPosition } from "../models/layout";
import { ViewerGroupData } from "../models/viewer-group-data";
import { LogService } from "../services/log.service";

export class ViewerImageData {
    static logService: LogService;
    groupData: ViewerGroupData;
    position: LayoutPosition;

    image: Image;

    constructor(viewerGroupData: ViewerGroupData, position: LayoutPosition) {
        this.groupData = viewerGroupData;
        this.position = position;

        ViewerImageData.logService.debug("ViewerImageData " + this.getId() + " created!");
    }

    getId(): string {
        return this.groupData.getId() + this.position.getId();
    }

    setPosition(position: LayoutPosition) {
        this.position = position;
    }

    setImage(image: Image) {
        this.image = image;
    }
}
