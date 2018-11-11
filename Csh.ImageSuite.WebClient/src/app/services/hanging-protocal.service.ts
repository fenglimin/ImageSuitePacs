import { Injectable } from '@angular/core';
import { OpenedViewerShell } from '../models/opened-viewer-shell';
import { LayoutMatrix, ImageLayout } from '../models/layout';
import { GroupHangingProtocal, ImageHangingProtocal} from '../models/hanging-protocal';
import { Patient, Study, Series, Image } from '../models/pssi';

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

  getImageLayoutMatrix(openedViewerShell: OpenedViewerShell, imageLayout: ImageLayout): LayoutMatrix {
    let layoutMatrix = new LayoutMatrix(1, 1);
    let groupIndex = imageLayout.groupLayout.layout.position.rowIndex * imageLayout.groupLayout.layout.matrix.colCount +
      imageLayout.groupLayout.layout.position.colIndex;

    let layoutNumber = 1;
    if (imageLayout.groupLayout.hangingProtocal === GroupHangingProtocal.ByPatent) {
      let patientImage = openedViewerShell.splitGroupByPatient()[groupIndex];
      if (patientImage.studies.length > 1) {
        layoutNumber = patientImage.studies.length;
      } else if (patientImage.studies[0].seriesList.length > 1) {
        layoutNumber = patientImage.studies[0].seriesList.length;
      }
    }
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

  getImageList(openedViewerShell: OpenedViewerShell, imageLayout: ImageLayout): Array<Image> {
    let imageList = new Array<Image>();
    let groupIndex = imageLayout.groupLayout.layout.position.rowIndex * imageLayout.groupLayout.layout.matrix.colCount +
      imageLayout.groupLayout.layout.position.colIndex;
    let imageIndex = imageLayout.layout.position.rowIndex * imageLayout.layout.matrix.colCount +
      imageLayout.layout.position.colIndex;

    if (imageLayout.groupLayout.hangingProtocal === GroupHangingProtocal.ByPatent) {
      let patientImage = openedViewerShell.splitGroupByPatient()[groupIndex];
    }
    return imageList;
  }
}

