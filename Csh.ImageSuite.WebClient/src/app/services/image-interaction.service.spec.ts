import { TestBed } from '@angular/core/testing';

import { ImageInteractionService } from './image-interaction.service';

describe('ImageInteractionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageInteractionService = TestBed.get(ImageInteractionService);
    expect(service).toBeTruthy();
  });
});
