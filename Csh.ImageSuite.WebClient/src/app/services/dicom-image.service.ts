import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { Image } from "../models/pssi";
import { ConfigurationService } from "../services/configuration.service";


@Injectable({
    providedIn: "root"
})
export class DicomImageService {
    private dicomImageUrl = "dicomImage";
    private baseUrl;

    constructor(private http: HttpClient, private configurationService: ConfigurationService) {
        this.baseUrl = this.configurationService.getBaseUrl();
    }

    getDicomFile(image: Image): Observable<Blob> {
        const imageUrl = `${this.dicomImageUrl}/dicom/${image.id}`;
        return this.http.get(imageUrl, { responseType: "blob" });
    }

    getThumbnailFile(image: Image): Observable<Blob> {
        const imageUrl = `${this.dicomImageUrl}/thumbnail/${image.id}`;
        return this.http.get(imageUrl, { responseType: "blob" });
    }


    getCornerStoneImage(image: Image) {
        const imageUri =
            "wadouri:{0}/wado?requestType=WADO&studyUID={studyUID}&seriesUID={serieUID}&objectUID={1}&frameIndex={2}&contentType=application%2Fdicom"
                .format(this.baseUrl, image.id, 0);

        cornerstone.loadImage(imageUri).then(ctImage => {
            image.cornerStoneImage = ctImage;
        });
    }
}
