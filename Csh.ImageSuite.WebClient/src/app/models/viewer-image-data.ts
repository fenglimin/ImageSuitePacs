import { Patient, Study, Series, Image } from '../models/pssi';
import { LayoutPosition, LayoutMatrix } from '../models/layout';
import { ViewerGroupData } from '../models/viewer-group-data';

export class ViewerImageData {
  groupData: ViewerGroupData;
  position: LayoutPosition;

  image: Image;

  constructor(viewerGroupData: ViewerGroupData, position: LayoutPosition) {
    this.groupData = viewerGroupData;
    this.position = position;
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
