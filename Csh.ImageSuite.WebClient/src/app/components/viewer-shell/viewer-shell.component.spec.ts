import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ViewerShellComponent } from "./viewer-shell.component";

describe("ViewerShellComponent",
    () => {
        let component: ViewerShellComponent;
        let fixture: ComponentFixture<ViewerShellComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [ViewerShellComponent]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ViewerShellComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("should create",
            () => {
                expect(component).toBeTruthy();
            });
    });
