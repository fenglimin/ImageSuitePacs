import { Patient, Study, Series, Image } from "../models/pssi";
import { ViewerGroupData } from "../models/viewer-group-data";
import { GroupHangingProtocol, ImageHangingProtocol } from "../models/hanging-protocol";
import { LayoutPosition, LayoutMatrix } from "../models/layout";
import { LogService } from "../services/log.service";

export class ViewerShellData {
    static logService: LogService;
    hide: boolean;
    patientList = new Array<Patient>();

    groupCount = 0; // The count of groups that contain image, NOT including empty groups
    groupMatrix = new LayoutMatrix(1, 1);
    groupDataList = new Array<ViewerGroupData>(); // Must contains all group even if its an empty group

    groupHangingProtocol: GroupHangingProtocol;
    defaultGroupHangingProtocol: GroupHangingProtocol;
    defaultImageHangingProtocol: ImageHangingProtocol;

    constructor(defaultGroupHangingProtocol: GroupHangingProtocol, defaultImageHangingProtocol: ImageHangingProtocol) {
        this.defaultGroupHangingProtocol = defaultGroupHangingProtocol;
        this.defaultImageHangingProtocol = defaultImageHangingProtocol;
        this.hide = false;

        ViewerShellData.logService.debug("ViewerShellData " + this.getId() + " created!");
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public functions
    addStudy(studyInWorklist: Study) {


        const study = Study.clone(studyInWorklist, true);
        study.hide = false;
        // Set parent for all series and all images, since they are NOT set in JSON string returned from server
        for (let i = 0; i < study.seriesList.length; i++) {
            const series = study.seriesList[i];
            series.study = study;
            series.hide = false;
            for (let j = 0; j < series.imageList.length; j++) {
                series.imageList[j].hide = false;
                series.imageList[j].series = series;
            }

            // Sort the images in series by ImageNo. We already query the image by ImageNo order in backend,
            // but ImageNo is saved in DB with string format, so "10" is prior than "2",
            // Need to adjust it by sort by number type
            series.imageList.sort((n1, n2) => {
                return (Number(n1.imageNo) < Number(n2.imageNo)) ? -1 : 1;
            });
        }


        let index = -1;
        for (let i = 0; i < this.patientList.length; i++) {
            if (this.patientList[i].id === studyInWorklist.patient.id) {
                index = i;
                break;
            }
        }

        let patient = null;
        if (index === -1) {
            // Clone a patient and added to the list
            patient = Patient.clone(studyInWorklist.patient, false);
            this.patientList.push(patient);
        } else {
            patient = this.patientList[index];
        }

        study.patient = patient;
        patient.hide = false;
        patient.studyList.push(study);
    }

    getId(): string {
        let id = "";
        this.patientList.forEach(patient => id += this.getIdFromPatient(patient));
        return id;
    }

    getName(): string {
        let name = "";
        this.patientList.forEach(patient => name += patient.patientId + "_" + patient.patientName + " | ");
        return name.substr(0, name.length - 3);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Get count
    getTotalPatientCount(): number {
        return this.patientList.length;
    }

    getTotalStudyCount(): number {
        let count = 0;
        this.patientList.forEach(patient => count += patient.studyList.length);
        return count;
    }

    getTotalSeriesCount(): number {
        let count = 0;
        this.patientList.forEach(patient => {
            patient.studyList.forEach(study => count += study.seriesList.length);
        });
        return count;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Group Operation
    cleanGroup() {
        this.groupDataList.length = 0;
        this.groupCount = 0;
    }

    getGroup(pageIndex: number, rowIndex: number, colIndex: number): ViewerGroupData {
        const groupIndex = pageIndex * this.groupMatrix.rowCount * this.groupMatrix.colCount + rowIndex * this.groupMatrix.colCount + colIndex;
        if (groupIndex >= this.groupDataList.length) {
            alert(`Invalid group index : ${groupIndex}`);
            return null;
        }

        //ViewerShellData.logService.debug("ViewData: Get group for " + this.getId() + rowIndex + colIndex);
        return this.groupDataList[groupIndex];
    }

    addGroup(isEmpty: boolean) {
        const groupIndex = this.groupDataList.length;
        const groupData = new ViewerGroupData(this, this.defaultImageHangingProtocol,
            LayoutPosition.fromNumber(groupIndex, this.groupMatrix));

        if (isEmpty) {
            groupData.setEmpty();
        }

        this.groupDataList.push(groupData);
    }

    updateGroupPositionFromIndex(groupIndex: number) {
        if (groupIndex < 0 || groupIndex >= this.groupDataList.length) {
            alert(`updateGroupPositionFromIndex() => Invalid group index : ${groupIndex}`);
            return;
        }

        this.groupDataList[groupIndex].setPosition(LayoutPosition.fromNumber(groupIndex, this.groupMatrix));
    }

    getPageCount(): number {
        return Math.ceil(this.groupDataList.length / (this.groupMatrix.rowCount * this.groupMatrix.colCount));
    }

    removeAllEmptyGroup() {
        while (this.groupDataList[this.groupDataList.length - 1].isEmpty()) {
            this.groupDataList.pop();
        }
    }

    normalizeGroupList() {
        // Need to add some empty groups to make sure the total group (include empty group) is valid.
        // For example, if the group count is 5(not empty), and the layout matrix is 2x2, need to add
        // 3 empty groups to make sure total group number(8) is multiple of the matrix size(4)

        const matrixSize = this.groupMatrix.rowCount * this.groupMatrix.colCount;
        const totalSize = this.getPageCount() * matrixSize;
        for (let i = this.groupDataList.length; i < totalSize; i++) {
            this.addGroup(true);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Get image
    getAllImageOfPatient(patient: Patient): Array<Image> {
        let images = new Array<Image>();
        patient.studyList.forEach(study => {
            study.seriesList.forEach(series => images = images.concat(series.imageList));
        });

        return images;
    }

    getAllImageOfStudy(study: Study): Array<Image> {
        let images = new Array<Image>();
        study.seriesList.forEach(series => images = images.concat(series.imageList));
        return images;
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Get object by index
    getPatientByIndex(patientIndex: number): Patient {
        if (patientIndex >= this.patientList.length) {
            return null;
        }

        return this.patientList[patientIndex];
    }

    getStudyByIndex(studyIndex: number): Study {
        const studyList = this.getAllStudyList();
        if (studyIndex >= studyList.length) {
            //alert('Error get study by index : ' + studyIndex + ', total study count is ' + studyList.length);
            return null;
        }

        return studyList[studyIndex];
    }

    getSeriesByIndex(seriesIndex: number): Series {
        const seriesList = this.getAllSeriesList();
        if (seriesIndex >= seriesList.length) {
            //alert('Error get series by index : ' + seriesIndex + ', total series count is ' + seriesList.length);
            return null;
        }

        return seriesList[seriesIndex];
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Private functions
    private getIdFromPatient(patient: Patient): string {
        let id = "";
        patient.studyList.forEach(value => id += `_${value.id}`);
        return id;
    }

    private getAllStudyList(): Array<Study> {
        let studies = new Array<Study>();
        this.patientList.forEach(patient => studies = studies.concat(patient.studyList));
        return studies;
    }

    private getAllSeriesList(): Array<Series> {
        const studyList = this.getAllStudyList();

        let series = new Array<Series>();
        studyList.forEach(study => series = series.concat(study.seriesList));
        return series;
    }
}
