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

    if (groupHangingProtocal === GroupHangingProtocal.ByPatent) {
      groupCount = viewerShellData.getTotalPatientCount();
    }else if (groupHangingProtocal === GroupHangingProtocal.ByStudy) {
      groupCount = viewerShellData.getTotalStudyCount();
    }else if (groupHangingProtocal === GroupHangingProtocal.BySeries) {
      groupCount = viewerShellData.getTotalSeriesCount();
    } else {
      return LayoutMatrix.fromNumber(groupHangingProtocal);
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
    } else if (groupLayout.hangingProtocal === GroupHangingProtocal.BySeries) {
      return this.createImageLayoutListBySeries(viewerShellData, imageHangingProcotal, groupLayout, groupIndex);
    } else {
      return null;
    }
  }

  private createImageLayoutListByPatient(viewerShellData: ViewerShellData, imageHangingProcotal: ImageHangingProtocal,
    groupLayout: GroupLayout, patientIndex: number): Array<ImageLayout> {
 
    const patient = viewerShellData.getPatientByIndex(patientIndex);
    if (patient === null || patient === undefined) {
      // This is an empty group
      return null;
    }
    
    const imageList = viewerShellData.getAllImageOfPatient(patient);
    return this.createImageLayoutListFromImageList(imageList, imageHangingProcotal, groupLayout);
  }

  private createImageLayoutListByStudy(viewerShellData: ViewerShellData, imageHangingProcotal: ImageHangingProtocal,
    groupLayout: GroupLayout, studyIndex: number): Array<ImageLayout> {
    
    const study = viewerShellData.getStudyByIndex(studyIndex);
    if (study === null || study === undefined) {
      // This is an empty group
      return null;
    }

    const imageList = viewerShellData.getAllImageOfStudy(study);
    return this.createImageLayoutListFromImageList(imageList, imageHangingProcotal, groupLayout);
  }

  private createImageLayoutListBySeries(viewerShellData: ViewerShellData, imageHangingProcotal: ImageHangingProtocal,
    groupLayout: GroupLayout, seriesIndex: number): Array<ImageLayout> {
    
    const series = viewerShellData.getSeriesByIndex(seriesIndex);
    if (series === null || series === undefined) {
      // This is an empty group
      return null;
    }

    return this.createImageLayoutListFromImageList(series.imageList, imageHangingProcotal, groupLayout);
  }

  private createImageLayoutListFromImageList(imageList: Array<Image>, imageHangingProcotal: ImageHangingProtocal,
    groupLayout: GroupLayout): Array<ImageLayout> {
    
    const imageLayoutList = new Array<ImageLayout>();
    const count = imageList.length;
    let layoutMatrix: LayoutMatrix;

    if (imageHangingProcotal === ImageHangingProtocal.Auto) {
      layoutMatrix = this.getImageLayoutMatrixFromCount(count);
    } else {
      layoutMatrix = LayoutMatrix.fromNumber(imageHangingProcotal);
    }

    const totalCount = layoutMatrix.rowCount * layoutMatrix.colCount;
    for (let i = 0; i < totalCount; i++) {
      const imageLayout = this.createImageLayoutFromGroupLayout(groupLayout, imageHangingProcotal, layoutMatrix, i);
      imageLayout.setImage(i < count? imageList[i] : null);
      imageLayoutList.push(imageLayout);
    }

    return imageLayoutList;
  }

  private createImageLayoutFromGroupLayout(groupLayout: GroupLayout, imageHangingProcotal: ImageHangingProtocal,
    layoutMatrix: LayoutMatrix, index: number): ImageLayout {

    let layoutPosition = LayoutPosition.fromNumber(index, layoutMatrix.colCount);

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
    let matrixNumber = 33;
    if (count < layoutNumberList.length) {
      matrixNumber = layoutNumberList[count];
    }

    return LayoutMatrix.fromNumber(matrixNumber)
  }

}

