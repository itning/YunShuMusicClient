import { TestBed } from '@angular/core/testing';

import { LyricService } from './lyric.service';

describe('LyricService', () => {
  let service: LyricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LyricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
