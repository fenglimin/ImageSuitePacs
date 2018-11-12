import { Injectable } from '@angular/core';
import { ViewerShellData } from '../models/viewer-shell-data';
import { LayoutPosition, LayoutMatrix, Layout, GroupLayout, ImageLayout } from '../models/layout';
import { GroupHangingProtocal, ImageHangingProtocal} from '../models/hanging-protocal';
import { Patient, Study, Series, Image } from '../models/pssi';

@Injectable({
  providedIn: 'root'
})
export class HangingProtocalService {
  defaultGroupHangingProtocal = GroupHangingProtocal.ByStudy;
  defaultImageHangingPrococal = ImageHangingProtocal.Auto;

  groupLayoutNumberList = [11, 11, 12, 22, 22];
  imageLayoutNumberList = [11, 11, 12, 22, 22, 23, 23, 33];
  constructor() { }

  getDefaultGroupHangingProtocal(): GroupHangingProtocal {
    return this.defaultGroupHangingProtocal;
  }

  getDefaultImageHangingPrococal(): ImageHangingProtocal {
    return this.defaultImageHangingPrococal;
  }


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

  createImageLayoutList(viewerShellData: ViewerShellData, imageHangingProcotal: ImageHangingProtocal,
                        groupLayout: GroupLayout): Array<ImageLayout> {

    let groupIndex = groupLayout.layout.position.rowIndex * groupLayout.layout.matrix.colCount +
      groupLayout.layout.position.colIndex;

    if (groupLayout.hangingProtocal === GroupHangingProtocal.ByPatent) {
      // GroupIndex is the patient index
      return this.createImageLayoutListByPatient(viewerShellData, imageHangingProcotal, groupLayout, groupIndex);
    } else if (groupLayout.hangingProtocal === GroupHangingProtocal.ByStudy) {
      return this.createImageLayoutListByStudy(viewerShellData, imageHangingProcotal, groupLayout, groupIndex);
    } else {
      return null;
    }
  }

  private createImageLayoutListByPatient(viewerShellData: ViewerShellData, imageHangingProcotal: ImageHangingProtocal,
    groupLayout: GroupLayout, patientIndex: number): Array<ImageLayout> {
    
    const imageLayoutList = new Array<ImageLayout>();

    if (imageHangingProcotal === ImageHangingProtocal.Overlap) {
      // 1x1, only one image cell
      let layout = new Layout(new LayoutPosition(0, 0), new LayoutMatrix(1, 1));
      let imageLayout = new ImageLayout(groupLayout, layout, imageHangingProcotal);
      imageLayout.imageList = viewerShellData.getAllImageOfPatientByIndex(patientIndex);
      imageLayoutList.push(imageLayout);        
    } else if (imageHangingProcotal === ImageHangingProtocal.Auto) {
      let count = viewerShellData.getPatientStudyCountByIndex(patientIndex);
      let layoutMatrix = this.getImageLayoutMatrixFromCount(count);

      for (let i = 0; i < count; i++) {
        let imageLayout = this.createImageLayoutFromGroupLayout(groupLayout, imageHangingProcotal, layoutMatrix, i);
        imageLayout.imageList = viewerShellData.getAllImageOfPatientStudyByIndex(patientIndex, i);
        imageLayoutList.push(imageLayout);
      }
    } else {
      const layoutMatrix = new LayoutMatrix(1, 1);
      layoutMatrix.fromNumber(imageHangingProcotal);
      let count = viewerShellData.getPatientStudyCountByIndex(patientIndex);

      for (let i = 0; i < count; i++) {
        let imageLayout = this.createImageLayoutFromGroupLayout(groupLayout, imageHangingProcotal, layoutMatrix, i);
        imageLayout.imageList = viewerShellData.getAllImageOfPatientStudyByIndex(patientIndex, i);
        imageLayoutList.push(imageLayout);
      }
    }

    return imageLayoutList;
  }

  private createImageLayoutListByStudy(viewerShellData: ViewerShellData, imageHangingProcotal: ImageHangingProtocal,
    groupLayout: GroupLayout, studyIndex: number): Array<ImageLayout> {
    
    const imageLayoutList = new Array<ImageLayout>();
    const study = viewerShellData.getStudyByIndex(studyIndex);

    if (imageHangingProcotal === ImageHangingProtocal.Overlap) {
      // 1x1, only one image cell
      let layout = new Layout(new LayoutPosition(0, 0), new LayoutMatrix(1, 1));
      let imageLayout = new ImageLayout(groupLayout, layout, imageHangingProcotal);
      imageLayout.imageList = viewerShellData.getAllImageOfStudy(study);
      imageLayoutList.push(imageLayout);        
    } else if (imageHangingProcotal === ImageHangingProtocal.Auto) {
      let count = study.seriesList.length;
      let layoutMatrix = this.getImageLayoutMatrixFromCount(count);

      for (let i = 0; i < count; i++) {
        let imageLayout = this.createImageLayoutFromGroupLayout(groupLayout, imageHangingProcotal, layoutMatrix, i);
        imageLayout.imageList = study.seriesList[i].imageList;
        imageLayoutList.push(imageLayout);
      }
    } else {
      const layoutMatrix = new LayoutMatrix(1, 1);
      layoutMatrix.fromNumber(imageHangingProcotal);
      let count = study.seriesList.length;

      for (let i = 0; i < count; i++) {
        let imageLayout = this.createImageLayoutFromGroupLayout(groupLayout, imageHangingProcotal, layoutMatrix, i);
        imageLayout.imageList = study.seriesList[i].imageList;
        imageLayoutList.push(imageLayout);
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

