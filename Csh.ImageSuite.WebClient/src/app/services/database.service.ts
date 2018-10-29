import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Shortcut } from '../models/shortcut';
import { Patient } from '../models/pssi';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private shortcutUrl = 'shortcut';  // URL to web api
  private patientUrl = 'patient';  // URL to web api
  private worklistUrl = 'worklist';  // URL to web api

  constructor(private http: HttpClient) {
  }

  /** GET shortcut from the server */
  getPatients (): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.patientUrl)
      .pipe(
        tap(heroes => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes', []))
      );
  }

  getShortcut(id : number): Observable<Shortcut> {
    const url = `${this.shortcutUrl}/details/${id}`;
    return this.http.get<Shortcut>(url);
  }


  /** GET shortcut from the server */
  getShortcuts (): Observable<Shortcut[]> {

    this.http.get('https://api.github.com/users/seeschweiler').subscribe(data => {
      console.log(data);
    });

    this.http.get(this.patientUrl).subscribe(data => {
      console.log(data);
    });

    return this.http.get<Shortcut[]>(this.shortcutUrl)
      .pipe(
        tap(heroes => this.log('fetched heroes')),
        catchError(this.handleError('getHeroes', []))
      );
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
