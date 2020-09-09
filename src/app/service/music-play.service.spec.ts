import { TestBed } from '@angular/core/testing';

import { MusicPlayService } from './music-play.service';

describe('MusicPlayService', () => {
  let service: MusicPlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicPlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
