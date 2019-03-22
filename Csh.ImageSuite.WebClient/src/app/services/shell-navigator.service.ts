import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ViewerShellData } from "../models/viewer-shell-data";

@Injectable({
    providedIn: "root"
})
export class ShellNavigatorService {

    viewerShellDataList = new Array<ViewerShellData>();
    viewerShellDataHighlighted: ViewerShellData; // The shell current highlighted

    // Observable string sources
    private shellSelectedSource = new Subject<ViewerShellData>();

    // Observable string streams
    shellSelected$ = this.shellSelectedSource.asObservable();

    // Observable string sources
    private shellCreatedSource = new Subject<ViewerShellData>();

    // Observable string streams
    shellCreated$ = this.shellCreatedSource.asObservable();

    // Observable string sources
    private shellDeletedSource = new Subject<ViewerShellData>();

    // Observable string streams
    shellDeleted$ = this.shellDeletedSource.asObservable();

    constructor() {
    }

    // Service string commands
    private shellCreated(viewerShellData: ViewerShellData) {
        this.shellCreatedSource.next(viewerShellData);
    }

    // Service string commands
    private shellSelected(viewerShellData: ViewerShellData) {
        this.shellSelectedSource.next(viewerShellData);
    }

    shellNavigate(viewerShellData: ViewerShellData) {
        if (!this.isViewerShellOpened(viewerShellData)) {
            this.viewerShellDataList.push(viewerShellData);
            this.shellCreated(viewerShellData);
        } else {
            this.shellSelected(viewerShellData);
        }

        this.viewerShellDataHighlighted = viewerShellData;
    }

    shellDelete(viewerShellData: ViewerShellData): ViewerShellData {
        if (this.isViewerShellOpened(viewerShellData)) {
            let index = this.viewerShellDataList.indexOf(viewerShellData);
            this.viewerShellDataList =
                this.viewerShellDataList.filter((value, index, array) => value.getId() !== viewerShellData.getId());
            if (index >= this.viewerShellDataList.length) {
                index--;
            }

            if (this.viewerShellDataHighlighted === viewerShellData) {
                if (index >= 0) {
                    this.viewerShellDataHighlighted = this.viewerShellDataList[index];
                } else {
                    this.viewerShellDataHighlighted = null;
                }
                this.shellNavigate(this.viewerShellDataHighlighted);
                this.shellDeletedSource.next(viewerShellData);

            }
            return this.viewerShellDataHighlighted;
        }

        return null;
    }

    private isViewerShellOpened(viewerShellData: ViewerShellData): boolean {
        if (viewerShellData === null)
            return true;

        return this.viewerShellDataList.some((value, index, array) => value.getId() === viewerShellData.getId());
    }
}
