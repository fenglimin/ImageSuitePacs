import { TestBed } from '@angular/core/testing';

import { ImageOperationService } from './image-operation.service';

describe('ImageOperationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageOperationService = TestBed.get(ImageOperationService);
    expect(service).toBeTruthy();
  });
});
