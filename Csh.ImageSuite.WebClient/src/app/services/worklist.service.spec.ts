import { TestBed } from '@angular/core/testing';

import { WorklistService } from './worklist.service';

describe('WorklistService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorklistService = TestBed.get(WorklistService);
    expect(service).toBeTruthy();
  });
});
