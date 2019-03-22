import { TestBed } from "@angular/core/testing";

import { ShellNavigatorService } from "./shell-navigator.service";

describe("ShellNavigatorService",
    () => {
        beforeEach(() => TestBed.configureTestingModule({}));

        it("should be created",
            () => {
                const service: ShellNavigatorService = TestBed.get(ShellNavigatorService);
                expect(service).toBeTruthy();
            });
    });
