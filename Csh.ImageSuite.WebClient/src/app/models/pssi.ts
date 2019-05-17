import { Shortcut } from "../models/shortcut";
import { Size } from "../models/annotation";

export abstract class Pssi {
    id: number;
    hide: boolean;

    abstract setHide(hide: boolean): void;
}

export class Patient extends Pssi {

    patientId: string;
    patientName: string;
    firstName: string;
    middleName: string;
    lastName: string;
    patientBirthDate: string;
    patientSex: string;
    patientAge: string;
    breed: string;
    species: string;

    studyList: Array<Study>;

    setHide(hide: boolean) {
        this.hide = hide;
        this.studyList.forEach(study => study.setHide(hide));
    }

    static clone(patient: Patient, cloneChild: boolean): Patient {
        const clonedPatient = new Patient();

        clonedPatient.id = patient.id;
        clonedPatient.patientId = patient.patientId;
        clonedPatient.patientName = patient.patientName;
        clonedPatient.firstName = patient.firstName;
        clonedPatient.middleName = patient.middleName;
        clonedPatient.lastName = patient.lastName;
        clonedPatient.patientBirthDate = patient.patientBirthDate;
        clonedPatient.patientSex = patient.patientSex;
        clonedPatient.patientAge = patient.patientAge;
        clonedPatient.breed = patient.breed;
        clonedPatient.species = patient.species;

        clonedPatient.studyList = new Array<Study>();
        if (cloneChild) {
            patient.studyList.forEach(study => {
                const clonedStudy = Study.clone(study, cloneChild);
                clonedStudy.patient = clonedPatient;
                clonedPatient.studyList.push(clonedStudy);
            });
        }

        return clonedPatient;
    }
}

export class Study extends Pssi {

    checked: boolean;
    detailsLoaded: boolean;

    studyInstanceUid: string;
    studyId: string;
    studyDate: string;
    studyTime: string;
    accessionNo: string;
    seriesCount: number;
    imageCount: number;
    modality: string;
    studyDescription: string;
    referPhysician: string;
    tokenId: string;
    additionalPatientHistory: string;
    veterinarian: string;
    requestedProcPriority: string;

    instanceAvailability: string;
    printed: string;
    reserved: string;
    readed: string;
    scanStatus: string;

    accessGroups: string;
    send: number;

    patient: Patient;
    seriesList: Array<Series>;
    bodyPartList: Array<string>;

    setHide(hide: boolean) {
        this.hide = hide;
        this.seriesList.forEach(series => series.setHide(hide));
    }

    static clone(study: Study, cloneChild: boolean): Study {
        const clonedStudy = new Study();

        clonedStudy.checked = study.checked;
        clonedStudy.detailsLoaded = study.detailsLoaded;

        clonedStudy.id = study.id;
        clonedStudy.studyId = study.studyId;
        clonedStudy.studyInstanceUid = study.studyInstanceUid;
        clonedStudy.studyDate = study.studyDate;
        clonedStudy.studyTime = study.studyTime;
        clonedStudy.accessionNo = study.accessionNo;
        clonedStudy.seriesCount = study.seriesCount;
        clonedStudy.imageCount = study.imageCount;
        clonedStudy.modality = study.modality;
        clonedStudy.studyDescription = study.studyDescription;
        clonedStudy.referPhysician = study.referPhysician;
        clonedStudy.tokenId = study.tokenId;
        clonedStudy.additionalPatientHistory = study.additionalPatientHistory;
        clonedStudy.veterinarian = study.veterinarian;
        clonedStudy.requestedProcPriority = study.requestedProcPriority;

        clonedStudy.seriesList = new Array<Series>();
        if (cloneChild) {
            study.seriesList.forEach(series => {
                const clonedSeries = Series.clone(series, cloneChild);
                clonedSeries.study = clonedStudy;
                clonedStudy.seriesList.push(clonedSeries);
            });
        }

        return clonedStudy;
    }
}


export class Series extends Pssi {

    seriesInstanceUid: string;
    modality: string;
    seriesDateString: string;
    seriesTimeString: string;
    bodyPart: string;
    viewPosition: string;
    seriesNumber: number;
    imageCount: number;
    contrastBolus: string;
    localBodyPart: string;
    seriesDescription: string;
    operatorName: string;
    referHospital: string;
    patientPosition: string;
    localViewPosition: string;

    study: Study;
    imageList: Array<Image>;

    setHide(hide: boolean) {
        this.hide = hide;
        this.imageList.forEach(image => image.setHide(hide));
    }

    static clone(series: Series, cloneChild: boolean): Series {
        const clonedSeries = new Series();

        clonedSeries.id = series.id;
        clonedSeries.seriesInstanceUid = series.seriesInstanceUid;
        clonedSeries.modality = series.modality;
        clonedSeries.seriesDateString = series.seriesDateString;
        clonedSeries.seriesTimeString = series.seriesTimeString;
        clonedSeries.bodyPart = series.bodyPart;
        clonedSeries.viewPosition = series.viewPosition;
        clonedSeries.seriesNumber = series.seriesNumber;
        clonedSeries.imageCount = series.imageCount;
        clonedSeries.contrastBolus = series.contrastBolus;
        clonedSeries.localBodyPart = series.localBodyPart;
        clonedSeries.seriesDescription = series.seriesDescription;
        clonedSeries.operatorName = series.operatorName;
        clonedSeries.referHospital = series.referHospital;
        clonedSeries.patientPosition = series.patientPosition;
        clonedSeries.localViewPosition = series.localViewPosition;

        clonedSeries.imageList = new Array<Image>();
        if (cloneChild) {
            series.imageList.forEach(image => {
                const clonedImage = Image.clone(image, cloneChild);
                clonedImage.series = clonedSeries;
                clonedSeries.imageList.push(clonedImage);
            });
        }

        return clonedSeries;
    }
}

export class Image extends Pssi {

    series: Series;
    objectFile: string;
    imageColumns: number;
    imageRows: number;
    keyImage: string;
    imageNo: string;
    bitsAllocated: number;
    acquisitionTime: string;
    imageTime: string;
    acquisitionDate: string;
    imageDate: string;



    cornerStoneImage: any;
    annData: Uint8Array;
    serializeJson: string;
    transformMatrix: any;
    windowCenter: number;
    windowWidth: number;

    static clone(image: Image, cloneChild: boolean): Image {
        const clonedImage = new Image();

        clonedImage.id = image.id;
        clonedImage.objectFile = image.objectFile;
        clonedImage.imageColumns = image.imageColumns;
        clonedImage.imageRows = image.imageRows;
        clonedImage.keyImage = image.keyImage;
        clonedImage.imageNo = image.imageNo;
        clonedImage.bitsAllocated = image.bitsAllocated;
        clonedImage.acquisitionTime = image.acquisitionTime;
        clonedImage.acquisitionDate = image.acquisitionDate;
        clonedImage.imageTime = image.imageTime;
        clonedImage.imageDate = image.imageDate;

        return clonedImage;
    }

    setHide(hide: boolean) {
        this.hide = hide;
    }

    width() {
        return this.imageColumns;
    }

    height() {
        return this.imageRows;
    }

    getRotateAngle(): number {
        if (!this.transformMatrix)
            return 0;

        const transImg = this.transformMatrix;
        const n1 = transImg[0][0];
        const n3 = transImg[0][1];
        const n5 = transImg[0][2];
        const n2 = transImg[1][0];
        const n4 = transImg[1][1];
        const n6 = transImg[1][2]; //transform dy

        const a = n1;
        const b = n3;
        const c = n2;
        const d = n4;

        const scale = Math.sqrt(a * a + b * b);

        // arc sin, convert from radians to degrees, round
        const sin = b / scale;
        // next line works for 30deg but not 130deg (returns 50);
        // var angle = Math.round(Math.asin(sin) * (180/Math.PI));
        const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

        return angle;
    }

    getScaleValue(): number {
        if (!this.transformMatrix)
            return 1;

        const transImg = this.transformMatrix;
        const n1 = transImg[0][0];
        const n3 = transImg[0][1];
        const n5 = transImg[0][2];
        const n2 = transImg[1][0];
        const n4 = transImg[1][1];
        const n6 = transImg[1][2]; //transform dy

        const a = n1;
        const b = n3;
        const c = n2;
        const d = n4;

        const scale = Math.sqrt(a * a + b * b);
        return scale;
    }

    getPixelSpacing(): Size {
        let tagValue = this.cornerStoneImage.data.string("x00280030");
        if (!tagValue) {
            tagValue = this.cornerStoneImage.data.string("x00181164");
        }
        if (!tagValue) {
            return null;
        }

        const valueList = tagValue.split("\\");
        if (valueList.length !== 2) {
            return null;
        }

        const pixelSpacing = new Size(0, 0);
        pixelSpacing.cx = Number(valueList[0]);
        pixelSpacing.cy = Number(valueList[1]);

        return pixelSpacing;
    }

    setCornerStoneImage(ctImage: any) {
        let annData = undefined;

        const element = ctImage.data.elements["x0011101d"];
        if (element) {
            annData = new Uint8Array(element.length);
            for (let i = 0; i < element.length; i++) {
                annData[i] = ctImage.data.byteArray[element.dataOffset + i];
            }
        }

        this.annData = annData;
        this.cornerStoneImage = ctImage;
    }
}

export class MultiframeImage extends Image {

}

export class WorklistColumn {
    columnId: string;
    columnText: string;
    sortDirection: string;
    controlType: string;
    valueList: Array<string>;
    columnSequece: number;
    visible: boolean;
    shortcutType: Shortcut;
    studyCol: Study;
}

export class RecWorklistData {
    public studies: Study[];
    public pageCount: number;
    public worklistColumns: WorklistColumn[];
}