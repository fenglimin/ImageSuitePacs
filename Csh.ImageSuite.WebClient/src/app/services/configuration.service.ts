import { Injectable } from "@angular/core";
import { LocationStrategy } from "@angular/common";
import { DatabaseService } from "./database.service";
import { TextOverlayData, TextOverlayDisplayGroup } from '../models/overlay';
import { LogService } from "../services/log.service";
import { FontData, MarkerGroupData } from '../models/misc-data';
import { AnnGuide } from "../annotation/layer-object/ann-guide";

@Injectable({
    providedIn: "root"
})
export class ConfigurationService {

    private baseUrl: string;
    private textOverlayList: TextOverlayData[] = [];
    private markerConfig: MarkerGroupData[] = [];
    private textOverlayFont: FontData;
    private marked: boolean;
    
    constructor(private databaseService: DatabaseService, private locationStrategy: LocationStrategy,
        private logService: LogService) {

        this.baseUrl = window.location.origin + this.locationStrategy.getBaseHref();
        this.logService.info(`Config: Base url is ${this.baseUrl}`);

        this.databaseService.getTextOverlays().subscribe(overlayList => {
            this.textOverlayList = overlayList;
        });

        this.databaseService.getMarkerConfig().subscribe(markerConfig => {
            this.markerConfig = markerConfig;
        });
        //this.databaseService.getOverFont().subscribe(fontData => {
        //    this.textOverlayFont = fontData;
        //});

        AnnGuide.createAnnGuideDataList();
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    getTextOverlayConfigList(): TextOverlayData[] {
        return this.textOverlayList;
    }

    getTextOverlayFont(): FontData {
        this.textOverlayFont = new FontData("Times New Roman", "#FFF", 15);
        return this.textOverlayFont;
    }

    getMarkerConfig(): MarkerGroupData[] {
        return this.markerConfig;
    }

    setKeyImage(id, marked) {
        this.databaseService.setKeyImage(id, marked).subscribe(value => this.marked = value);
    }
}
