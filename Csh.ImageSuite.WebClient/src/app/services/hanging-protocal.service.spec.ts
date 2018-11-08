import { TestBed } from '@angular/core/testing';

import { HangingProtocalService } from './hanging-protocal.service';

describe('HangingProtocalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HangingProtocalService = TestBed.get(HangingProtocalService);
    expect(service).toBeTruthy();
  });
});
