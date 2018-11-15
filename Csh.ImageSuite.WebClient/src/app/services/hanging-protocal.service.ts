import { Injectable } from '@angular/core';
import { ViewerShellData } from '../models/viewer-shell-data';
import { LayoutPosition, LayoutMatrix } from '../models/layout';
import { GroupHangingProtocal, ImageHangingProtocal} from '../models/hanging-protocal';
import { Patient, Study, Series, Image } from '../models/pssi';
import { ViewerGroupData } from '../models/viewer-group-data';
import { ViewerImageData } from '../models/viewer-image-data';

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


  applyGroupHangingProtocal(viewerShellData: ViewerShellData, groupHangingProtocal: GroupHangingProtocal) {

    if (groupHangingProtocal >= GroupHangingProtocal.FreeHang) {
      const groupMatrix = LayoutMatrix.fromNumber(groupHangingProtocal);
      if (!groupMatrix.equal(viewerShellData.groupMatrix)) {
        const oldMatrixSize = viewerShellData.groupMatrix.rowCount * viewerShellData.groupMatrix.colCount;
        viewerShellData.groupMatrix = groupMatrix;

        // For the exsiting group, only change its position
        for (let i = 0; i < viewerShellData.groupDataList.length; i++) {
          viewerShellData.updateGroupPositionFromIndex(i);
        }

        // Add empty group if matrix size becomes bigger
        const matrixSize = viewerShellData.groupMatrix.rowCount * viewerShellData.groupMatrix.colCount;
        for (let i = viewerShellData.groupDataList.length; i < matrixSize; i++) {
          viewerShellData.addEmptyGroup(i);
        }
      }
    } else {
      
      let groupCount : number;

      if (groupHangingProtocal === GroupHangingProtocal.ByPatent) {
        groupCount = viewerShellData.getTotalPatientCount();
      }else if (groupHangingProtocal === GroupHangingProtocal.ByStudy) {
        groupCount = viewerShellData.getTotalStudyCount();
      }else if (groupHangingProtocal === GroupHangingProtocal.BySeries) {
        groupCount = viewerShellData.getTotalSeriesCount();
      } else {
        alert("applyGroupHangingProtocal() => Invalid Group Hanging Protocal : " + groupHangingProtocal);
        return;
      }

      viewerShellData.groupHangingProtocal = groupHangingProtocal;

      if (groupCount !== viewerShellData.groupCount) {
        viewerShellData.cleanGroup();

        viewerShellData.groupCount = groupCount;
        viewerShellData.groupMatrix = this.getGroupLayoutMatrixFromCount(groupCount);

        const matrixSize = viewerShellData.groupMatrix.rowCount * viewerShellData.groupMatrix.colCount;
        for (let i = 0; i < matrixSize; i++) {
            viewerShellData.addGroup(i);
        }
      }
    }
  }

  applyImageHangingProtocal(groupData: ViewerGroupData, imageHangingProtocal: ImageHangingProtocal) {

    if (groupData.imageCount === 0) {
      // This is the first time to apply 
      groupData.imageHangingProtocal = imageHangingProtocal;
      this.createImageDataListOfGroup(groupData);
      return;
    }

    groupData.imageHangingProtocal = imageHangingProtocal;

    if (imageHangingProtocal >= ImageHangingProtocal.FreeHang) {
      const imageMatrix = LayoutMatrix.fromNumber(imageHangingProtocal);
      if (imageMatrix !== groupData.imageMatrix) {
        const oldMatrixSize = groupData.imageMatrix.rowCount * groupData.imageMatrix.colCount;
        groupData.imageMatrix = imageMatrix;

        // For the image cell that contains image, only change its position
        for (let i = 0; i < groupData.imageDataList.length; i++) {
          groupData.updateImagePositionFromIndex(i);
        }

        // Add empty image if matrix size becomes bigger
        const matrixSize = groupData.imageMatrix.rowCount * groupData.imageMatrix.colCount;
        for (let i = groupData.imageDataList.length; i < matrixSize; i++) {
          groupData.addImage(i, null);
        }
      }
    } else {
      
      if (imageHangingProtocal !== ImageHangingProtocal.Auto) {
        alert("applyImageHangingProtocal() => Invalid Image Hanging Protocal : " + imageHangingProtocal);
        return;
      }

      
      groupData.imageMatrix = this.getImageLayoutMatrixFromCount(groupData.imageCount);

      // For the image cell that contains image, only change its position
      for (let i = 0; i < groupData.imageDataList.length; i++) {
        groupData.updateImagePositionFromIndex(i);
      }
    }
  }

  createImageDataListOfGroup(groupData: ViewerGroupData) {

    const groupIndex = groupData.getIndex();
    const groupHangingProtocal = groupData.viewerShellData.groupHangingProtocal;

    let ret = false;
    if ( groupHangingProtocal === GroupHangingProtocal.ByPatent) {
      // GroupIndex is the patient index
      ret = this.createImageDataListByPatient(groupData, groupIndex);
    } else if (groupHangingProtocal === GroupHangingProtocal.ByStudy) {
      ret = this.createImageDataListByStudy(groupData, groupIndex);
    } else if (groupHangingProtocal === GroupHangingProtocal.BySeries) {
      ret = this.createImageDataListBySeries(groupData, groupIndex);
    } else {
      alert("createImageListOfGroup() => Invalid Group Hanging Protocal : " + groupHangingProtocal);
    }

    if (!ret) {
      groupData.setEmpty();
    }
  }

  private createImageDataListByPatient(groupData: ViewerGroupData, patientIndex: number): boolean {
 
    const patient = groupData.viewerShellData.getPatientByIndex(patientIndex);
    if (patient === null || patient === undefined) {
      // This is an empty group
      return false;
    }
    
    const imageList = groupData.viewerShellData.getAllImageOfPatient(patient);
    return this.createImageDataListFromImageList(groupData, imageList);
  }

  private createImageDataListByStudy(groupData: ViewerGroupData, studyIndex: number): boolean {
    
    const study = groupData.viewerShellData.getStudyByIndex(studyIndex);
    if (study === null || study === undefined) {
      // This is an empty group
      return false;
    }

    const imageList = groupData.viewerShellData.getAllImageOfStudy(study);
    return this.createImageDataListFromImageList(groupData, imageList);
  }

  private createImageDataListBySeries(groupData: ViewerGroupData, seriesIndex: number): boolean {
    
    const series = groupData.viewerShellData.getSeriesByIndex(seriesIndex);
    if (series === null || series === undefined) {
      // This is an empty group
      return false;
    }

    return this.createImageDataListFromImageList(groupData, series.imageList);
  }

  private createImageDataListFromImageList(groupData: ViewerGroupData, imageList: Array<Image>): boolean {
    
    groupData.imageDataList = new Array<ViewerImageData>();
    groupData.imageCount = imageList.length;
    groupData.imageMatrix = this.getImageLayoutMatrixFromCount(groupData.imageCount);

    const matrixSize = groupData.imageMatrix.rowCount * groupData.imageMatrix.colCount;
    for (let i = 0; i < matrixSize; i++) {
      const image = i < groupData.imageCount? imageList[i] : null;
      groupData.addImage(i, image);
    }

    return true;
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

