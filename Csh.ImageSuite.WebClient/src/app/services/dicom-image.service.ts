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

  getImage(image: Image): Observable<Blob> {
    const imageUrl = `${this.dicomImageUrl}/details/${image.id}`;
    return this.http.get(imageUrl, { responseType: 'blob' });
  }
}
