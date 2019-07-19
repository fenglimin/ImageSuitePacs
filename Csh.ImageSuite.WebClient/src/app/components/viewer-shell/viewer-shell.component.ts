import { Component, OnInit, ViewChildren, QueryList, AfterViewInit } from "@angular/core";
import { GroupViewerComponent } from "./group-viewer/group-viewer.component";
import { ShellNavigatorService } from "../../services/shell-navigator.service";
import { HangingProtocolService } from "../../services/hanging-protocol.service";
import { Subscription } from "rxjs";
import { ViewerShellData } from "../../models/viewer-shell-data";
import { ViewerGroupData } from "../../models/viewer-group-data";
import { LogService } from "../../services/log.service";


@Component({
    selector: "app-viewer-shell",
    templateUrl: "./viewer-shell.component.html",
    styleUrls: ["./viewer-shell.component.css"]
})
export class ViewerShellComponent implements OnInit, AfterViewInit {
    Arr = Array; //Array type captured in a variable

    viewerShellData: ViewerShellData;
    pageIndex = 0;
    pageCount: number;

    subscriptionShellNavigated: Subscription;

    viewerGroupData: ViewerGroupData;

    @ViewChildren(GroupViewerComponent)
    childGroups: QueryList<GroupViewerComponent>;

    constructor(private shellNavigatorService: ShellNavigatorService,
        private hangingProtocolService: HangingProtocolService,
        private logService: LogService) {
        this.subscriptionShellNavigated = shellNavigatorService.shellSelected$.subscribe(
            viewerShellData => {
                this.viewerShellData.hide =
                    (viewerShellData === null || viewerShellData.getId() !== this.viewerShellData.getId());
            });
    }

    ngOnInit() {
        this.onChangeGroupLayout(this.viewerShellData.defaultGroupHangingProtocol);
    }

    ngAfterViewInit() {
        const self = this;
        $(".sp_panel-left").spResizable({
            handleSelector: ".sp_splitter",
            resizeHeight: false
        });

        $(window).resize(function() {
            self.onResize();
        });

        this.onResize();
    }

    onChangeGroupLayout(groupHangingProtocolNumber: number): void {
        if (this.childGroups) {
            this.childGroups.forEach(child => child.setHeight(0));
        }

        this.hangingProtocolService.applyGroupHangingProtocol(this.viewerShellData, groupHangingProtocolNumber);
        this.pageIndex = 0;
        this.pageCount = this.viewerShellData.getPageCount();
        this.onResize();
    }

    onResize(): void {
        //if (this.viewerShellData.hide)
        //    return;

        if (!this.childGroups)
            return;

        if (this.childGroups) {
            this.childGroups.forEach(child => child.setHeight(0));
        }

        this.logService.debug("Viewer: onResize()");

        this.childGroups.forEach((groupViewer) => {
            groupViewer.onResize();
        });
    }

    getGroupData(rowIndex: number, colIndex: number): ViewerGroupData {
        return this.viewerShellData.getGroup(this.pageIndex, rowIndex, colIndex);
    }

    onSaveImage(event) {
        this.childGroups.forEach(groupViewer => {
            if (groupViewer.selected) {
                groupViewer.saveSelectedImage();
            }
        });
    }

    onNavigateGroup(delta) {
        this.pageIndex += delta;
    }
}
