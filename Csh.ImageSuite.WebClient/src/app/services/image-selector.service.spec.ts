import { TestBed } from '@angular/core/testing';

import { ImageSelectorService } from './image-selector.service';

describe('ImageSelectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageSelectorService = TestBed.get(ImageSelectorService);
    expect(service).toBeTruthy();
  });
});
