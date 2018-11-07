import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Shortcut } from '../models/shortcut';
import { Patient, Study } from '../models/pssi';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private shortcutUrl = 'shortcut';  // URL to web api
  private pssiUrl = 'pssi';

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
