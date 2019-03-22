import { TestBed } from "@angular/core/testing";

import { HangingProtocolService } from "./hanging-protocol.service";

describe("HangingProtocolService",
    () => {
        beforeEach(() => TestBed.configureTestingModule({}));

        it("should be created",
            () => {
                const service: HangingProtocolService = TestBed.get(HangingProtocolService);
                expect(service).toBeTruthy();
            });
    });
