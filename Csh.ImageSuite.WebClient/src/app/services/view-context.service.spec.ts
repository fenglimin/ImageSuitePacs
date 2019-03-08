import { TestBed } from '@angular/core/testing';

import { ViewContextService } from './view-context.service';

describe('ViewContextService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
      const service: ViewContextService = TestBed.get(ViewContextService);
    expect(service).toBeTruthy();
  });
});
