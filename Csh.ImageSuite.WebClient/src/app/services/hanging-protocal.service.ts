import { Injectable } from '@angular/core';
import { OpenedViewerShell } from '../models/opened-viewer-shell';
import { LayoutMatrix } from '../models/layout';
import { GroupHangingProtocal, ImageHangingProtocal} from '../models/hanging-protocal';

@Injectable({
  providedIn: 'root'
})
export class HangingProtocalService {
  defaultGroupHangingProtocal = GroupHangingProtocal.BySeries;
  defaultImageHangingPrococal = ImageHangingProtocal.ByModality;

  groupLayoutNumberList = [11, 11, 12, 22, 22];
  constructor() { }

  getGroupLayoutMatrix(openedViewerShell: OpenedViewerShell, groupHangingProtocal: GroupHangingProtocal): LayoutMatrix {
    let groupCount = 0;
    let layoutMatrix = new LayoutMatrix(1,1);
    let groupLayoutNumber = 0;

    if (groupHangingProtocal === GroupHangingProtocal.ByPatent) {
      groupCount = openedViewerShell.getTotalPatientCount();
    }else if (groupHangingProtocal === GroupHangingProtocal.ByStudy) {
      groupCount = openedViewerShell.getTotalStudyCount();
    }else if (groupHangingProtocal === GroupHangingProtocal.BySeries) {
      groupCount = openedViewerShell.getTotalSeriesCount();
    } else {
      layoutMatrix.fromNumber(groupHangingProtocal);
      return layoutMatrix;
    }

    if (groupCount > 4) {
      groupLayoutNumber = 33;
    } else {
      groupLayoutNumber = this.groupLayoutNumberList[groupCount];
    }

    layoutMatrix.fromNumber(groupLayoutNumber);
    return layoutMatrix;
  }

  getGroupDataList(openedViewerShell: OpenedViewerShell, groupHangingProtocal: GroupHangingProtocal): Array<OpenedViewerShell> {
    if (groupHangingProtocal === GroupHangingProtocal.ByPatent) {
      return openedViewerShell.splitGroupByPatient();
    } else if (groupHangingProtocal === GroupHangingProtocal.ByStudy) {
      return openedViewerShell.splitGroupByStudy();
    } else if (groupHangingProtocal === GroupHangingProtocal.BySeries) {
      return openedViewerShell.splitGroupBySeries();
    } else {
      let groupDataList = new Array<OpenedViewerShell>();
      groupDataList.push(openedViewerShell);
      return groupDataList;
    }
  }
}

