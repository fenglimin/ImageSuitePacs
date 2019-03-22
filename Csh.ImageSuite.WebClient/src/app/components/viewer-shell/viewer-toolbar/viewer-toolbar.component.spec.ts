import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ViewerToolbarComponent } from "./viewer-toolbar.component";

describe("ViewerToolbarComponent",
    () => {
        let component: ViewerToolbarComponent;
        let fixture: ComponentFixture<ViewerToolbarComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                    declarations: [ViewerToolbarComponent]
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(ViewerToolbarComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("should create",
            () => {
                expect(component).toBeTruthy();
            });
    });
