import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Image } from '../models/pssi';

@Injectable({
  providedIn: 'root'
})
export class DicomImageService {
  private dicomImageUrl = 'dicomImage';
  constructor(private http: HttpClient) { }

  getDicomFile(image: Image): Observable<Blob> {
    const imageUrl = `${this.dicomImageUrl}/dicom/${image.id}`;
    return this.http.get(imageUrl, { responseType: 'blob' });
  }

  getThumbnailFile(image: Image): Observable<Blob> {
    const imageUrl = `${this.dicomImageUrl}/thumbnail/${image.id}`;
    return this.http.get(imageUrl, { responseType: 'blob' });
  }
}
