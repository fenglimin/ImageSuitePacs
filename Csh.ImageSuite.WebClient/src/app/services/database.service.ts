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


  constructor(private http: HttpClient) {
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

  /** GET shortcut from the server */
  getStudies (): Observable<Study[]> {
    return this.http.get<Study[]>(this.pssiUrl)
      .pipe(
        tap(studies => this.log('fetched studies')),
        catchError(this.handleError('getStudies', []))
      );
  }

  getStudiesTest(): Study[] {
    let studies = new Array<Study>();
    let patient1 = this.createPatient('PID001', 'Tom', 'M');
    let patient2 = this.createPatient('PID002', 'Jerry', 'M');
    let patient3 = this.createPatient('PID003', 'Mark', 'M');

    let study = this.createStudy(1);
    study.patient = patient1;
    studies.push(study);

    study = this.createStudy(2);
    study.patient = patient2;
    studies.push(study);

    study = this.createStudy(3);
    study.patient = patient2;
    studies.push(study);

    study = this.createStudy(1);
    study.patient = patient3;
    studies.push(study);

    study = this.createStudy(2);
    study.patient = patient3;
    studies.push(study);

    study = this.createStudy(5);
    study.patient = patient3;
    studies.push(study);

    return studies;
  }

  createPatient(patientId: string, patientName: string, gender: string): Patient {

    let patient = new Patient();

    patient.id = this.id_patient++;
    patient.patientId = patientId;
    patient.patientName = patientName;
    patient.gender = gender;

    return patient;
  }

  createStudy(seriesCount: number): Study {

    let study = new Study();

    study.id = this.id_study++;
    study.studyInstanceUid = study.id + '.' + study.id;
    study.seriesCount = seriesCount;
    study.imageCount = seriesCount;
    study.studyId = '1';
    study.studyDateString = '2018-11-11';
    study.studyTimeString = '12:11:12';

    study.seriesList = new Array<Series>();
    for (let i = 0; i < seriesCount; i++){
      study.seriesList.push(this.createSeries());
    }

    return study;
  }

  createSeries(): Series {
    let series = new Series();

    series.id = this.id_series++;

    return series;
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
