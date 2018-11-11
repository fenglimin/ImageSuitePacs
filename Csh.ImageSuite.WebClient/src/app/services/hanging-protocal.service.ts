import { Injectable } from '@angular/core';
import { ViewerShellData } from '../models/viewer-shell-data';
import { LayoutPosition, LayoutMatrix, Layout, GroupLayout, ImageLayout } from '../models/layout';
import { GroupHangingProtocal, ImageHangingProtocal} from '../models/hanging-protocal';
import { Patient, Study, Series, Image } from '../models/pssi';

@Injectable({
  providedIn: 'root'
})
export class HangingProtocalService {
  defaultGroupHangingProtocal = GroupHangingProtocal.BySeries;
  defaultImageHangingPrococal = ImageHangingProtocal.Auto;

  groupLayoutNumberList = [11, 11, 12, 22, 22];
  imageLayoutNumberList = [11, 11, 12, 22, 22, 23, 23, 33];
  constructor() { }

  getGroupLayoutMatrix(viewerShellData: ViewerShellData, groupHangingProtocal: GroupHangingProtocal): LayoutMatrix {
    let groupCount = 0;
    let layoutMatrix = new LayoutMatrix(1,1);
    let groupLayoutNumber = 0;

    if (groupHangingProtocal === GroupHangingProtocal.ByPatent) {
      groupCount = viewerShellData.getTotalPatientCount();
    }else if (groupHangingProtocal === GroupHangingProtocal.ByStudy) {
      groupCount = viewerShellData.getTotalStudyCount();
    }else if (groupHangingProtocal === GroupHangingProtocal.BySeries) {
      groupCount = viewerShellData.getTotalSeriesCount();
    } else {
      layoutMatrix.fromNumber(groupHangingProtocal);
      return layoutMatrix;
    }

    return this.getGroupLayoutMatrixFromCount(groupCount);
  }

  /*
  getImageLayoutMatrix(viewerShellData: ViewerShellData, imageLayout: ImageLayout): LayoutMatrix {
    let layoutMatrix = new LayoutMatrix(1, 1);
    let groupIndex = imageLayout.groupLayout.layout.position.rowIndex * imageLayout.groupLayout.layout.matrix.colCount +
      imageLayout.groupLayout.layout.position.colIndex;

    let layoutNumber = 1;
    if (imageLayout.groupLayout.hangingProtocal === GroupHangingProtocal.ByPatent) {
      let patientImage = viewerShellData.splitGroupByPatient()[groupIndex];
      if (patientImage.studies.length > 1) {
        layoutNumber = patientImage.studies.length;
      } else if (patientImage.studies[0].seriesList.length > 1) {
        layoutNumber = patientImage.studies[0].seriesList.length;
      }
    }
    return layoutMatrix;
  }

  getGroupDataList(viewerShellData: ViewerShellData, groupHangingProtocal: GroupHangingProtocal): Array<ViewerShellData> {
    if (groupHangingProtocal === GroupHangingProtocal.ByPatent) {
      return viewerShellData.splitGroupByPatient();
    } else if (groupHangingProtocal === GroupHangingProtocal.ByStudy) {
      return viewerShellData.splitGroupByStudy();
    } else if (groupHangingProtocal === GroupHangingProtocal.BySeries) {
      return viewerShellData.splitGroupBySeries();
    } else {
      let groupDataList = new Array<ViewerShellData>();
      groupDataList.push(viewerShellData);
      return groupDataList;
    }
  }
  */

  createImageLayoutList(viewerShellData: ViewerShellData, imageHangingProcotal: ImageHangingProtocal,
                        groupLayout: GroupLayout): Array<ImageLayout> {

    let imageLayoutList = new Array<ImageLayout>();
    let groupIndex = groupLayout.layout.position.rowIndex * groupLayout.layout.matrix.colCount +
      groupLayout.layout.position.colIndex;


    if (groupLayout.hangingProtocal === GroupHangingProtocal.ByPatent) {
      // GroupIndex is the patient index
      if (imageHangingProcotal === ImageHangingProtocal.Overlap) {
        // 1x1, only one image cell
        let layout = new Layout(new LayoutPosition(0, 0), new LayoutMatrix(1, 1));
        let imageLayout = new ImageLayout(groupLayout, layout, imageHangingProcotal);
        imageLayout.imageList = viewerShellData.getAllImageOfPatientByIndex(groupIndex);
        imageLayoutList.push(imageLayout);        
      } else if (imageHangingProcotal === ImageHangingProtocal.Auto) {
        let count = viewerShellData.getPatientStudyCountByIndex(groupIndex);
        if (count === 1) {
          // Only one study
          count = viewerShellData.getPatientSeriesCountByIndex(groupIndex);
          let layoutMatrix = this.getImageLayoutMatrixFromCount(count);
          for (let i = 0; i < count; i++) {
            let imageLayout = this.createImageLayoutFromGroupLayout(groupLayout, imageHangingProcotal, layoutMatrix, i);
            imageLayout.imageList = viewerShellData.getAllImageOfPatientStudySeriesByIndex(groupIndex, 0, i);
            imageLayoutList.push(imageLayout); 
          }
        } else {
          // Multiple study
          let layoutMatrix = this.getImageLayoutMatrixFromCount(count);
          for (let i = 0; i < count; i++) {
            let imageLayout = this.createImageLayoutFromGroupLayout(groupLayout, imageHangingProcotal, layoutMatrix, i);
            imageLayout.imageList = viewerShellData.getAllImageOfPatientStudyByIndex(groupIndex, i);
            imageLayoutList.push(imageLayout); 
          }
        }
      }
      
    }
    return imageLayoutList;
  }

  private createImageLayoutFromGroupLayout(groupLayout: GroupLayout, imageHangingProcotal: ImageHangingProtocal,
    layoutMatrix: LayoutMatrix, index: number): ImageLayout {

    let layoutPosition = new LayoutPosition(-1, -1);
    layoutPosition.fromNumber(index, layoutMatrix.colCount);

    let layout = new Layout(layoutPosition, layoutMatrix);
    let imageLayout = new ImageLayout(groupLayout, layout, imageHangingProcotal);
    return imageLayout;
  }

  private getGroupLayoutMatrixFromCount(count: number): LayoutMatrix {
    return this.getLayoutMatrixFromCount(count, this.groupLayoutNumberList);
  }

  private getImageLayoutMatrixFromCount(count: number): LayoutMatrix {
    return this.getLayoutMatrixFromCount(count, this.imageLayoutNumberList);
  }

  private getLayoutMatrixFromCount(count: number, layoutNumberList: number[]): LayoutMatrix {
    let layoutMatrix = new LayoutMatrix(1, 1);

    let matrixNumber = 33;
    if (count < layoutNumberList.length) {
      matrixNumber = layoutNumberList[count];
    }

    layoutMatrix.fromNumber(matrixNumber);
    return layoutMatrix;
  }

}

