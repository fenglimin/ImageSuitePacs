import { Injectable } from "@angular/core";
import { LocationStrategy } from "@angular/common";
import { DatabaseService } from "./database.service";
import { Overlay, OverlayDisplayGroup } from '../models/overlay';
import { LogService } from "../services/log.service";
import { FontData } from '../models/misc-data';
import { AnnGuide } from "../annotation/layer-object/ann-guide";

@Injectable({
    providedIn: "root"
})
export class ConfigurationService {

    private baseUrl: string;
    private overLayList: Overlay[] = [];
    private textOverlayFont: FontData;
    
    constructor(private databaseService: DatabaseService, private locationStrategy: LocationStrategy,
        private logService: LogService) {

        this.baseUrl = window.location.origin + this.locationStrategy.getBaseHref();
        this.logService.info(`Config: Base url is ${this.baseUrl}`);

        this.databaseService.getOverlays().subscribe(overlayList => {
            this.overLayList = overlayList;
        });

        this.databaseService.getOverFont().subscribe(fontData => {
            this.textOverlayFont = fontData;
        });

        AnnGuide.createAnnGuideDataList();
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    getOverlayConfigList(): Overlay[] {
        return this.overLayList;
    }

    getOverlayFont(): FontData {
        this.textOverlayFont = new FontData("Times New Roman", "#FFF", 15);
        return this.textOverlayFont;
    }
    
}
