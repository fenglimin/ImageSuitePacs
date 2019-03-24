import { Injectable } from "@angular/core";
import { ViewerShellData } from "../models/viewer-shell-data";
import { LayoutMatrix } from "../models/layout";
import { GroupHangingProtocol, ImageHangingProtocol, GroupHangingData, ImageHangingData } from
    "../models/hanging-protocol";
import { Image } from "../models/pssi";
import { ViewerGroupData } from "../models/viewer-group-data";
import { ViewerImageData } from "../models/viewer-image-data";
import { LogService } from "./log.service";

@Injectable({
    providedIn: "root"
})
export class HangingProtocolService {
    defaultGroupHangingProtocol = GroupHangingProtocol.ByStudy;
    defaultImageHangingPrococal = ImageHangingProtocol.Auto;

    groupLayoutNumberList = [11, 11, 12, 22, 22];
    imageLayoutNumberList = [11, 11, 12, 22, 22, 23, 23, 33];

    groupHangingDataList: GroupHangingData[] = [
        { groupHangingProtocol: GroupHangingProtocol.ByPatent, name: "Patient", tip: "Group Image by Paitient" },
        { groupHangingProtocol: GroupHangingProtocol.ByStudy, name: "Study", tip: "Group Image by Study" },
        { groupHangingProtocol: GroupHangingProtocol.BySeries, name: "Series", tip: "Group Image by Series" },
        { groupHangingProtocol: GroupHangingProtocol.FreeHang, name: "FreeHang", tip: "Free Hang" }
    ];

    groupLayoutDataList: GroupHangingData[] = [
        { groupHangingProtocol: GroupHangingProtocol.FreeHang_1X1, name: "Layout_1X1", tip: "Layout Group by 1X1" },
        { groupHangingProtocol: GroupHangingProtocol.FreeHang_2X1, name: "Layout_1X2", tip: "Layout Group by 1X2" },
        { groupHangingProtocol: GroupHangingProtocol.FreeHang_1X2, name: "Layout_2X1", tip: "Layout Group by 2X1" },
        { groupHangingProtocol: GroupHangingProtocol.FreeHang_2X2, name: "Layout_2X2", tip: "Layout Group by 2X2" },
        { groupHangingProtocol: GroupHangingProtocol.FreeHang_3X3, name: "Layout_3X3", tip: "Layout Group by 3X3" }
    ];

    imageLayoutDataList: ImageHangingData[] = [
        { imageHangingProtocol: ImageHangingProtocol.Auto, name: "tile", tip: "Layout Image by Modality" },
        { imageHangingProtocol: ImageHangingProtocol.FreeHang_1X1, name: "SubLayout_1X1", tip: "Layout Image by 1X1" },
        { imageHangingProtocol: ImageHangingProtocol.FreeHang_2X1, name: "SubLayout_1X2", tip: "Layout Image by 1X2" },
        { imageHangingProtocol: ImageHangingProtocol.FreeHang_1X2, name: "SubLayout_2X1", tip: "Layout Image by 2X1" },
        { imageHangingProtocol: ImageHangingProtocol.FreeHang_2X2, name: "SubLayout_2X2", tip: "Layout Image by 2X2" },
        { imageHangingProtocol: ImageHangingProtocol.FreeHang_3X3, name: "SubLayout_3X3", tip: "Layout Image by 3X3" },
        { imageHangingProtocol: ImageHangingProtocol.FreeHang_4X3, name: "SubLayout_3X4", tip: "Layout Image by 3X4" },
        { imageHangingProtocol: ImageHangingProtocol.FreeHang_6X5, name: "SubLayout_5X6", tip: "Layout Image by 5X6" }
    ];

    constructor(private logService: LogService) {}

    getDefaultGroupHangingProtocol(): GroupHangingProtocol {
        return this.defaultGroupHangingProtocol;
    }

    getDefaultImageHangingPrococal(): ImageHangingProtocol {
        return this.defaultImageHangingPrococal;
    }

    getGroupHangingDataList(): GroupHangingData[] {
        return this.groupHangingDataList;
    }

    getDefaultGroupHangingData(): GroupHangingData {
        return this.groupHangingDataList[1];
    }

    getGroupLayoutDataList(): GroupHangingData[] {
        return this.groupLayoutDataList;
    }

    getDefaultGroupLayoutData(): GroupHangingData {
        return this.groupLayoutDataList[0];
    }

    getImageLayoutDataList(): ImageHangingData[] {
        return this.imageLayoutDataList;
    }

    getDefaultImageLayoutData(): ImageHangingData {
        return this.imageLayoutDataList[0];
    }

    applyGroupHangingProtocol(viewerShellData: ViewerShellData, groupHangingProtocol: GroupHangingProtocol) {

        this.logService.info("HP service: applyGroupHangingProtocol to viewer " + viewerShellData.getName() + ", protocol is " + GroupHangingProtocol[groupHangingProtocol]);
        if (groupHangingProtocol >= GroupHangingProtocol.FreeHang) {
            const groupMatrix = LayoutMatrix.fromNumber(groupHangingProtocol);
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

            let groupCount: number;

            if (groupHangingProtocol === GroupHangingProtocol.ByPatent) {
                groupCount = viewerShellData.getTotalPatientCount();
            } else if (groupHangingProtocol === GroupHangingProtocol.ByStudy) {
                groupCount = viewerShellData.getTotalStudyCount();
            } else if (groupHangingProtocol === GroupHangingProtocol.BySeries) {
                groupCount = viewerShellData.getTotalSeriesCount();
            } else {
                alert(`applyGroupHangingProtocol() => Invalid Group Hanging Protocol : ${groupHangingProtocol}`);
                return;
            }

            viewerShellData.groupHangingProtocol = groupHangingProtocol;

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

    applyImageHangingProtocol(groupData: ViewerGroupData, imageHangingProtocol: ImageHangingProtocol) {

        this.logService.info("HP service: applyImageHangingProtocol to Group" + groupData.getId() + ", protocol is " + ImageHangingProtocol[imageHangingProtocol]);

        if (groupData.imageCount === 0) {
            // This is the first time to apply 
            groupData.imageHangingProtocol = imageHangingProtocol;
            this.createImageDataListOfGroup(groupData);
            return;
        }

        groupData.imageHangingProtocol = imageHangingProtocol;

        if (imageHangingProtocol >= ImageHangingProtocol.FreeHang) {
            const imageMatrix = LayoutMatrix.fromNumber(imageHangingProtocol);
            if (!imageMatrix.equal(groupData.imageMatrix)) {
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

            if (imageHangingProtocol !== ImageHangingProtocol.Auto) {
                alert(`applyImageHangingProtocol() => Invalid Image Hanging Protocol : ${imageHangingProtocol}`);
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
        const groupHangingProtocol = groupData.viewerShellData.groupHangingProtocol;

        let ret = false;
        if (groupHangingProtocol === GroupHangingProtocol.ByPatent) {
            // GroupIndex is the patient index
            ret = this.createImageDataListByPatient(groupData, groupIndex);
        } else if (groupHangingProtocol === GroupHangingProtocol.ByStudy) {
            ret = this.createImageDataListByStudy(groupData, groupIndex);
        } else if (groupHangingProtocol === GroupHangingProtocol.BySeries) {
            ret = this.createImageDataListBySeries(groupData, groupIndex);
        } else {
            alert(`createImageListOfGroup() => Invalid Group Hanging Protocol : ${groupHangingProtocol}`);
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
            const image = i < groupData.imageCount ? imageList[i] : null;
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

        return LayoutMatrix.fromNumber(matrixNumber);
    }

}
