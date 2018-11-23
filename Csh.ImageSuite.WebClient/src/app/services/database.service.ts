import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Shortcut } from '../models/shortcut';
import { Patient, Study, Series, Image } from '../models/pssi';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private shortcutUrl = 'shortcut';  // URL to web api
  private pssiUrl = 'pssi';
  private id_patient = 1;
  private id_study = 1;
  private id_series = 1;
  private id_image = 1;

  private localTestData : Study[];

  constructor(private http: HttpClient) {
    this.localTestData = this.createStudiesTest();
  }


  getShortcut(id : number): Observable<Shortcut> {
    const url = `${this.shortcutUrl}/details/${id}`;
    return this.http.get<Shortcut>(url);
  }


  /** GET shortcut from the server */
  getShortcuts (): Observable<Shortcut[]> {
    return this.http.get<Shortcut[]>(this.shortcutUrl)
      .pipe(
        tap(heroes => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes', []))
      );
  }

  /** GET studies from the server */
  getStudies (shortcut: Shortcut): Observable<Study[]> {
    const url = `${this.pssiUrl}/search/`;
    return this.http.post<Study[]>(url, shortcut, httpOptions)
      .pipe(
        tap(studies => this.log('fetched studies')),
        catchError(this.handleError('getStudies', []))
      );
  }

  /** GET study from the server */
  getStudy (id: number): Observable<Study> {
    const url = `${this.pssiUrl}/details/${id}`;
    return this.http.get<Study>(url)
      .pipe(
        tap(_ => this.log(`fetched Study id=${id}`)),
        catchError(this.handleError<Study>(`getStudy id=${id}`))
      );
  }

  getStudiesTest(): Study[] {
    return this.localTestData;
  }

  private createStudiesTest(): Study[] {
    let studies = new Array<Study>();
    let patient1 = this.createPatient('PID001', 'Tom', 'M');
    let patient2 = this.createPatient('PID002', 'Jerry', 'M');
    let patient3 = this.createPatient('PID003', 'Mark', 'M');

    let study = this.createStudy(patient1, 1);
    studies.push(study);

    study = this.createStudy(patient2, 2);
    studies.push(study);

    study = this.createStudy(patient2, 3);
    studies.push(study);

    study = this.createStudy(patient3, 1);
    studies.push(study);

    study = this.createStudy(patient3, 2);
    studies.push(study);

    study = this.createStudy(patient3, 5);
    studies.push(study);

    return studies;
  }

  private createPatient(patientId: string, patientName: string, gender: string): Patient {

    let patient = new Patient();

    patient.id = this.id_patient++;
    patient.patientId = patientId;
    patient.patientName = patientName;
    patient.gender = gender;
    patient.studyList = new Array<Study>();
    
    return patient;
  }

  private createStudy(patient: Patient, seriesCount: number): Study {

    let study = new Study();

    study.id = this.id_study++;
    study.studyInstanceUid = study.id + '.' + study.id;
    study.seriesCount = seriesCount;
    study.imageCount = seriesCount * seriesCount;
    study.studyId = '' + study.id;
    study.accessionNo = study.studyId;
    study.studyDateString = '2018-11-11';
    study.studyTimeString = '12:11:12';
    study.modality = 'DX';
    study.checked = false;

    study.seriesList = new Array<Series>();
    for (let i = 0; i < seriesCount; i++){
      study.seriesList.push(this.createSeries(study, seriesCount));
    }

    study.patient = patient;
    patient.studyList.push(study);
    return study;
  }

  private createSeries(study: Study, imageCount: number): Series {
    let series = new Series();

    series.id = this.id_series++;
    series.study = study;

    series.imageList = new Array<Image>();
    for (let i = 0; i < imageCount; i++) {
      series.imageList.push(this.createImage(series));
    }

    return series;
  }

  private createImage(series: Series): Image {
    let image = new Image();

    image.id = this.id_image++;
    image.series = series;

    return image;
  }
  /**
  * Handle Http operation that failed.
  * Let the app continue.
  * @param operation - name of the operation that failed
  * @param result - optional value to return as the observable result
  */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    //alert(`HeroService: ${message}`);
  }
}
