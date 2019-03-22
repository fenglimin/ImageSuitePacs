import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ManualWlDialogComponent } from "./manual-wl-dialog.component";

describe("ManualWlDialogComponent",
    () => {
        let component: ManualWlDialogComponent;
        let fixture: ComponentFixture<ManualWlDialogComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [ManualWlDialogComponent]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ManualWlDialogComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("should create",
            () => {
                expect(component).toBeTruthy();
            });
    });
