import { Component, OnInit, Input } from "@angular/core";
import { SelectedButtonData } from "../../../models/dropdown-button-menu-data";

@Component({
    selector: "app-dropdown-button-menu",
    templateUrl: "./dropdown-button-menu.component.html",
    styleUrls: ["./dropdown-button-menu.component.css"]
})
export class DropdownButtonMenuComponent implements OnInit {
    selectedButton: SelectedButtonData;
    @Input()
    menuButtonList: SelectedButtonData[];

    constructor() {
    }

    ngOnInit() {
        this.selectedButton = this.menuButtonList[0];

        const $dropdownLi = $("li.dropdown");

        $dropdownLi.mouseover(function() {
            $(this).addClass("open");
        }).mouseout(function() {
            $(this).removeClass("open");
        }).click(function() {
            $(this).addClass("open");
        });
    }

    onSelectChanged(menuButton: SelectedButtonData) {
        this.selectedButton = menuButton;
    }
}
