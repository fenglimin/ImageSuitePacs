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
    defaultGroupHangingProtocol = GroupHangingProtocol.BySeries;
    defaultImageHangingProtocol = ImageHangingProtocol.FreeHang_1X1;

    groupLayoutNumberList = [11, 11, 12, 22, 22];
    imageLayoutNumberList = [11, 11, 12, 22, 22, 23, 23, 33];

    groupHangingDataList: GroupHangingData[] = [
        { groupHangingProtocol: GroupHangingProtocol.ByPatent, name: "Patient", tip: "Group Image by Patient" },
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

    getDefaultImageHangingProtocol(): ImageHangingProtocol {
        return this.defaultImageHangingProtocol;
    }

    getGroupHangingDataList(): GroupHangingData[] {
        return this.groupHangingDataList;
    }

    getDefaultGroupHangingData(): GroupHangingData {
        return this.groupHangingDataList[2];
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

    getGroupLayoutDataByMatrix(groupMatrix: LayoutMatrix) {
        return this.getLayoutDataByMatrix(true, groupMatrix);
    }

    getImageLayoutDataByMatrix(imageMatrix: LayoutMatrix) {
        return this.getLayoutDataByMatrix(false, imageMatrix);
    }

    applyGroupHangingProtocol(viewerShellData: ViewerShellData, groupHangingProtocol: GroupHangingProtocol) {

        this.logService.info("HP service: applyGroupHangingProtocol to viewer " + viewerShellData.getName() + ", protocol is " + GroupHangingProtocol[groupHangingProtocol]);
        if (groupHangingProtocol >= GroupHangingProtocol.FreeHang) {
            const groupMatrix = LayoutMatrix.fromNumber(groupHangingProtocol);
            if (!groupMatrix.equal(viewerShellData.groupMatrix)) {

                viewerShellData.groupMatrix = groupMatrix;

                viewerShellData.removeAllEmptyGroup();

                // For the existing group, only change its position
                for (let i = 0; i < viewerShellData.groupDataList.length; i++) {
                    viewerShellData.updateGroupPositionFromIndex(i); 
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

                for (let i = 0; i < groupCount; i++) {
                    viewerShellData.addGroup(false);
                }
            }
        }

        viewerShellData.normalizeGroupList();
    }

    applyImageHangingProtocol(groupData: ViewerGroupData, imageHangingProtocol: ImageHangingProtocol) {

        this.logService.info("HP service: applyImageHangingProtocol to Group" + groupData.getId() + ", protocol is " + ImageHangingProtocol[imageHangingProtocol]);

        groupData.imageHangingProtocol = imageHangingProtocol;

        if (groupData.imageCount === 0) {
            // This is the first time to apply 
            this.createImageDataListOfGroup(groupData);
            groupData.normalizeImageList();
        } else {
            let imageMatrix: LayoutMatrix;
            if (imageHangingProtocol >= ImageHangingProtocol.FreeHang) {
                imageMatrix = LayoutMatrix.fromNumber(imageHangingProtocol);
            } else {
                if (imageHangingProtocol !== ImageHangingProtocol.Auto) {
                    alert(`applyImageHangingProtocol() => Invalid Image Hanging Protocol : ${imageHangingProtocol}`);
                    return;
                }

                imageMatrix = this.getImageLayoutMatrixFromCount(groupData.imageCount);
            }

            if (!imageMatrix.equal(groupData.imageMatrix)) {
                groupData.imageMatrix = imageMatrix;
                groupData.removeAllEmptyImage();

                // For the image cell that contains image, only change its position
                for (let i = 0; i < groupData.imageDataList.length; i++) {
                    groupData.updateImagePositionFromIndex(i);
                }

                groupData.normalizeImageList();
            }
        }

        groupData.resetPageInfo();
    }

    createImageDataListOfGroup(groupData: ViewerGroupData) {

        const groupIndex = groupData.getIndex();
        const groupHangingProtocol = groupData.viewerShellData.groupHangingProtocol;

        let ret = false;
        if (groupHangingProtocol === GroupHangingProtocol.ByPatent) {
            // GroupIndex is the patient index
            ret = this.createImageDataListByPatient(groupData, groupIndex);
        } else if (groupHangingProtocol === GroupHangingProtocol.ByStudy) {
            // GroupIndex is the study index
            ret = this.createImageDataListByStudy(groupData, groupIndex);
        } else if (groupHangingProtocol === GroupHangingProtocol.BySeries) {
            // GroupIndex is the series index
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
        groupData.imageMatrix = LayoutMatrix.fromNumber(groupData.imageHangingProtocol);

        for (let i = 0; i < imageList.length; i++) {
            groupData.addImage(imageList[i]);
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

    private getLayoutDataByMatrix(groupLayout: boolean, matrix: LayoutMatrix): any {
        const hangingProtocol = matrix.toNumber();
        const result = groupLayout ? this.groupLayoutDataList.filter(groupLayoutData => groupLayoutData.groupHangingProtocol === hangingProtocol) : 
            this.imageLayoutDataList.filter(imageLayoutData => imageLayoutData.imageHangingProtocol === hangingProtocol);;

        const layoutType = groupLayout ? "group" : "image";
        if (result.length === 0) {
            alert(`HangingProtocolService.getLayoutDataByMatrix() => Can NOT find ${layoutType} layer data in ${layoutType} layout data list!`);
        } else if (result.length > 1) {
            alert(`HangingProtocolService.getLayoutDataByMatrix() => Find same ${layoutType} layer data in ${layoutType} layout data list!`);
        } else {
            return result[0];
        }

        return undefined;
    }
}
