export class Patient {
  id: string;
  name: string;
  studies: Array<Study>;
}

export class Study {
    patient: Patient;

    studyInstanceUid: string;
    studyId: string;

    series: Array<Series>;
}

export class Series {
    study: Study;

    seriesInstanceUid: string;
    modality: string;

    images: Array<Image>;
}

export class Image {
    series: Series;

    objectFile: string;
}