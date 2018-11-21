import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs';
import { Shortcut } from '../models/shortcut';
import { DatabaseService } from './database.service'
import { ViewerShellData } from '../models/viewer-shell-data';
import { HangingProtocalService } from './hanging-protocal.service';
import { ShellNavigatorService } from './shell-navigator.service';
import { Study } from '../models/pssi';
import { DataSource } from '../models/shortcut';

@Injectable({
  providedIn: 'root'
})
export class WorklistService {
  studies : Study[];

  private _shortcut : Shortcut;
  set shortcut(value: Shortcut) {
    this._shortcut = value;
    this.studies = this.onQueryStudies();
  }
  get shortcut(): Shortcut {
    return this._shortcut;
  }

  private _showHistoryStudies = true;
  set showHistoryStudies(value: boolean) {
    this._showHistoryStudies = value;
  }
  get showHistoryStudies(): boolean {
    return this._showHistoryStudies;
  }

  // Observable Shortcut sources
  private shortcutSelectedSource = new Subject<Shortcut>();

  // Observable Shortcut streams
  shortcutSelected$ = this.shortcutSelectedSource.asObservable();

  // Service Shortcut commands
  shortcutSelected(shortcut: Shortcut) {
    this.shortcutSelectedSource.next(shortcut);
  }

  constructor(private databaseService: DatabaseService,
    private shellNavigatorService: ShellNavigatorService,
    private hangingProtocalService: HangingProtocalService) {

    this._shortcut = new Shortcut();
  }

  onQueryStudies(): Study[] {

    if (this.isUsingLocalTestData()) {
      this.studies = this.databaseService.getStudiesTest();  
    } else {
      this.databaseService.getStudies().subscribe(studies => this.formatStudies(studies));  
    }

    return this.studies;
  }

  onShowStudy(study: Study) {
    if (this.isUsingLocalTestData()) {
      const viewerShellData = new ViewerShellData(this.hangingProtocalService.getDefaultGroupHangingProtocal(),
        this.hangingProtocalService.getDefaultImageHangingPrococal());
      this.studies.forEach(study1 => {
        if (study1.checked) {
          viewerShellData.addStudy(study1);
        }
      });

      this.shellNavigatorService.shellNavigate(viewerShellData);
    } else {
      this.studies.forEach(study1 => {
        if (study1.checked) {
          this.databaseService.getStudy(study1.id).subscribe(value => this.studyDetailsLoaded(this.studies.indexOf(study1), value));
        }
      });
    }
  }

  isUsingLocalTestData(): boolean {
    return this._shortcut.dataSource === DataSource.LocalTestData;
  }
  
  setDataSource(dataSource: DataSource) {
    this._shortcut.dataSource = dataSource;
    this.studies = this.onQueryStudies();
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Private functions
  private formatStudies(studies) {
    for (let i = 0; i < studies.length; i++) {
      studies[i].checked = false;
      studies[i].detailsLoaded = false;
      for (let j = 0; j < studies[i].seriesList.length; j++) {
        studies[i].seriesList[j].study = studies[i];
      }    
    }

    this.studies = studies;
  }

  private studyDetailsLoaded(index: number, studyNew: Study) {

    studyNew.checked = true;
    studyNew.detailsLoaded = true;
    this.studies[index] = studyNew;

    if (this.studies.every(study => study.checked === study.detailsLoaded)) {
      const viewerShellData = new ViewerShellData(this.hangingProtocalService.getDefaultGroupHangingProtocal(),
        this.hangingProtocalService.getDefaultImageHangingPrococal());
      this.studies.forEach(value => {
        if (value.checked && value.detailsLoaded) {
          viewerShellData.addStudy(value);
        }
      });
      this.shellNavigatorService.shellNavigate(viewerShellData);

      this.studies.forEach(value => {
        value.detailsLoaded = false;
        value.checked = false;
      });
    }
  }
}
