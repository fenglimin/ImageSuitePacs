import { Injectable } from "@angular/core";
import { LocationStrategy } from "@angular/common";
import { DatabaseService } from "./database.service";
import { Overlay, OverlayDisplayGroup } from '../models/overlay';

@Injectable({
    providedIn: "root"
})
export class ConfigurationService {

    baseUrl: string;
    overlayDisplayGroupList: OverlayDisplayGroup[] = [];

    constructor(private databaseService: DatabaseService, private locationStrategy: LocationStrategy) {
        this.baseUrl = window.location.origin + this.locationStrategy.getBaseHref();

        this.databaseService.getOverlays().subscribe(overlayList => {
            this.formatOverlayList(overlayList);
        });
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    formatOverlayList(overlayList: Overlay[]) {
        overlayList.forEach(overlay => this.addOverlayToGroup(overlay));
        this.overlayDisplayGroupList.forEach(group => {
            group.itemListAlignLeft = group.itemListAlignLeft.sort((n1, n2) => {
                return (n1.gridX > n2.gridX) ? 1 : -1;
            });

            group.itemListAlignRight = group.itemListAlignRight.sort((n1, n2) => {
                return (n1.gridX > n2.gridX) ? -1 : 1;
            });
        });
    }

    addOverlayToGroup(overlay: Overlay) {
        const filtered = this.overlayDisplayGroupList.filter(value => value.match(overlay));

        let overlayGroup = null;
        if (filtered.length === 0) {
            overlayGroup = new OverlayDisplayGroup(overlay);
            this.overlayDisplayGroupList.push(overlayGroup);
        } else {
            overlayGroup = filtered[0];
        }

        overlayGroup.add(overlay);
    }

    getOverlayDisplayGroup(modality: string): OverlayDisplayGroup[] {
        return this.overlayDisplayGroupList.filter(group => group.modality === modality);
    }
}
