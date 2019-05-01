import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { Shortcut } from '../models/shortcut';
import { Patient, Study, Series, Image, RecWorklistData } from '../models/pssi';
import { Overlay } from '../models/overlay';
import { FontData } from '../models/misc-data';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': "application/json"})
};

@Injectable({
    providedIn: "root"
})



export class DatabaseService {

    private shortcutUrl = "shortcut"; // URL to web api
    private pssiUrl = "pssi";
    private overlayUrl = "overlay";
    private id_patient = 1;
    private id_study = 1;
    private id_series = 1;
    private id_image = 1;

    private localTestData: Study[];
    private revStudies: Study[];

    constructor(private http: HttpClient) {
        this.localTestData = this.createStudiesTest();
    }


    getShortcut(id: number): Observable<Shortcut> {
        const url = `${this.shortcutUrl}/details/${id}`;
        return this.http.get<Shortcut>(url);
    }

    getOverFont(): Observable<FontData> {
        const url = `${this.overlayUrl}/font/`;
        return this.http.get<FontData>(url);
    }

    getOverlays(): Observable<Overlay[]> {
        const url = `${this.overlayUrl}/`;
        return this.http.get<Overlay[]>(url)
            .pipe(
                tap(Overlay => this.log("fetched Overlay")),
                catchError(this.handleError("getOverlays", []))
            );
    }

    /** GET shortcut from the server */
    getShortcuts(): Observable<Shortcut[]> {
        const url = `${this.shortcutUrl}/search/`;
        return this.http.get<Shortcut[]>(url)
            .pipe(
                tap(shortcuts => this.log("fetched shortcuts")),
                catchError(this.handleError("getShortcuts", []))
            );
    }

    getWorklistCol(): Observable<Shortcut[]> {
        const url = `${this.shortcutUrl}/search/`;
        return this.http.get<Shortcut[]>(url)
            .pipe(
                tap(shortcuts => this.log("fetched shortcuts")),
                catchError(this.handleError("getShortcuts", []))
            );
    }

    /** Save shortcut to the server */
    saveShortcut(shortcut: Shortcut): Observable<Shortcut[]> {
        const url = `${this.shortcutUrl}/create/`;
        return this.http.post<Shortcut[]>(url, shortcut, httpOptions)
            .pipe(
                tap(shortcut => this.log("save shortcut")),
                catchError(this.handleError("saveShortcut", []))
            );
    }

    setRead(id: string): Observable<Shortcut[]> {
        const url = `${this.pssiUrl}/setread/`;
        let jsonId = { id: id };
        return this.http.post<Shortcut[]>(url, jsonId, httpOptions)
            .pipe(
                tap(shortcut => this.log("setRead")),
            catchError(this.handleError("setRead", []))
            );
    }

    setUnread(id: string): Observable<Shortcut[]> {
        const url = `${this.pssiUrl}/setunread/`;
        let jsonId = { id: id };
        return this.http.post<Shortcut[]>(url, jsonId, httpOptions)
            .pipe(
            tap(shortcut => this.log("setUnread")),
            catchError(this.handleError("setUnread", []))
            );
    }

    setDeletePrevent(id: string): Observable<Shortcut[]> {
        const url = `${this.pssiUrl}/setdeleteprevent/`;
        let jsonId = { id: id };
        return this.http.post<Shortcut[]>(url, jsonId, httpOptions)
            .pipe(
                tap(shortcut => this.log("set delete prevent")),
            catchError(this.handleError("setDeletePrevent", []))
            );
    }

    setDeleteAllow(id: string): Observable<Shortcut[]> {
        const url = `${this.pssiUrl}/setdeleteallow/`;
        let jsonId = { id: id };
        return this.http.post<Shortcut[]>(url, jsonId, httpOptions)
            .pipe(
                tap(shortcut => this.log("set delete prevent")),
            catchError(this.handleError("setDeleteAllow", []))
            );
    }

    deleteStudy(id: string, deletionReason): Observable<Shortcut[]> {
        const url = `${this.pssiUrl}/deletestudy/`;
        let jsonId = { id: id, deletionReason: deletionReason };
        return this.http.post<Shortcut[]>(url, jsonId, httpOptions)
            .pipe(
                tap(shortcut => this.log("delete study")),
                catchError(this.handleError("deleteStudy", []))
            );
    }

    /** Delete shortcut to the server */
    deleteShortcut(shortcut: Shortcut): Observable<Shortcut[]> {
        const url = `${this.shortcutUrl}/delete`;
        return this.http.post<Shortcut[]>(url, shortcut, httpOptions)
            .pipe(
                tap(shortcut => this.log("delete shortcut")),
                catchError(this.handleError("deleteShortcut", []))
            );
    }

    /** GET studies from the server */
    getStudies(shortcut: Shortcut, pageIndex: number, sortItem: String): Observable<RecWorklistData> {
        const url = `${this.pssiUrl}/search/`;
        let data = { shortcut: shortcut, pageIndex: pageIndex, sortItem: sortItem };
        return this.http.post<RecWorklistData>(url, data, httpOptions)
            .pipe(
            tap(recWorklistData => this.log('fetched recWorklistData')),
            catchError(this.handleError<RecWorklistData>('getRecWorklistData'))
            );
    }

  /** GET study from the server */
    getStudiesForDcmViewer(id: number, showHistoryStudies): Observable<Study[]> {
        const url = `${this.pssiUrl}/GetStudiesForDcmViewer/`;
        let data = { id: id, showHistoryStudies: showHistoryStudies};

        return this.http.post<Study[]>(url, data, httpOptions)
            .pipe(
                tap(recWorklistData => this.log('fetched recWorklistData')),
            catchError(this.handleError<Study[]>('getRecWorklistData'))
            );
    }



    getStudiesTest(): Study[] {
        const aa = this.localTestData.sort(this.compareStudy);
        return aa;
    }

    compareStudy(study1: Study, study2: Study): number {
        return study1.patient.patientName > study2.patient.patientName ? 1 : -1;
    }

    private createStudiesTest(): Study[] {
        const studies = new Array<Study>();
        const patient1 = this.createPatient("PID001", "Tom", "M");
        const patient2 = this.createPatient("PID002", "Jerry", "M");
        const patient3 = this.createPatient("PID003", "Mark", "M");

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

        const patient = new Patient();

        patient.id = this.id_patient++;
        patient.patientId = patientId;
        patient.patientName = patientName;
        patient.patientSex = gender;
        patient.studyList = new Array<Study>();

        return patient;
    }

    private createStudy(patient: Patient, seriesCount: number): Study {

        const study = new Study();

        study.id = this.id_study++;
        study.studyInstanceUid = study.id + "." + study.id;
        study.seriesCount = seriesCount;
        study.imageCount = seriesCount * seriesCount;
        study.studyId = `${study.id}`;
        study.accessionNo = study.studyId;
        study.studyDate = "2018-11-11";
        study.studyTime = "12:11:12";
        study.modality = "DX";
        study.checked = false;
        study.studyDescription = "Study Desc";

        study.seriesList = new Array<Series>();
        for (let i = 0; i < seriesCount; i++) {
            study.seriesList.push(this.createSeries(study, seriesCount));
        }

        study.patient = patient;
        patient.studyList.push(study);
        return study;
    }

    private createSeries(study: Study, imageCount: number): Series {
        const series = new Series();

        series.id = this.id_series++;
        series.study = study;
        series.modality = "CR";
        series.imageCount = imageCount;

        series.imageList = new Array<Image>();
        for (let i = 0; i < imageCount; i++) {
            series.imageList.push(this.createImage(series));
        }

        return series;
    }

    private createImage(series: Series): Image {
        const image = new Image();

        image.id = this.id_image++;
        image.series = series;
        image.imageColumns = 1;
        image.imageRows = 1;

        return image;
    }

    /**
    * Handle Http operation that failed.
    * Let the app continue.
    * @param operation - name of the operation that failed
    * @param result - optional value to return as the observable result
    */
    private handleError<T>(operation = "operation", result?: T) {
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
