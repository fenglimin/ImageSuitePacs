import { TestBed } from '@angular/core/testing';

import { DicomImageService } from './dicom-image.service';

describe('DicomImageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DicomImageService = TestBed.get(DicomImageService);
    expect(service).toBeTruthy();
  });
});
