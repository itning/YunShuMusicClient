import {Component, OnInit} from '@angular/core';
import {Page} from '../../../../entity/page/Page';
import {Music} from '../../../../entity/Music';
import {PageEvent} from '@angular/material/paginator';
import {HttpClient} from '@angular/common/http';
import {MusicPlaybackDurationChangeEvent, MusicPlayService} from '../../../../service/music-play.service';
import {FileService} from '../../../../service/file.service';
import {MusicListService, PlayMode} from '../../../../service/music-list.service';
import {PlayEvent} from '../control/control.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  private isSearch = false;
  private playMode = PlayMode.LOOP;

  searchKeyword: string;
  list: Music[];
  originalResponse: Page<Music> = new Page();
  nowPlayingMusicId: string;
  isPlay = false;
  musicTimeChangeEvent: MusicPlaybackDurationChangeEvent = new MusicPlaybackDurationChangeEvent(0, 0.1);

  constructor(private http: HttpClient,
              private musicPlayService: MusicPlayService,
              private musicListService: MusicListService,
              private fileService: FileService) {
  }

  ngOnInit(): void {
    this.musicListService.getMusicList().subscribe(music => this.refreshMusicList(music));

    this.musicPlayService.onPlayChangeEvent.subscribe((status) => {
      this.isPlay = status;
    });
    this.musicPlayService.onTimeChangeEvent.subscribe((time) => {
      this.musicTimeChangeEvent = time;
    });
    this.musicPlayService.onPlayEndEvent.subscribe(() => {
      if (this.playMode === PlayMode.REPEAT) {
        this.musicPlayService.start(this.fileService.getMusicFileUrl(this.nowPlayingMusicId)).subscribe((status) => {
            if (!status) {
              alert('播放失败');
            }
          }
        );
      } else {
        this.onPlayStatusChange(PlayEvent.NEXT);
      }
    });
  }

  private refreshMusicList(originalResponse: Page<Music>): void {
    this.list = originalResponse.content;
    this.originalResponse = originalResponse;
  }

  doOnClick(musicId: string): void {
    if (this.nowPlayingMusicId !== musicId) {
      this.musicPlayService.start(this.fileService.getMusicFileUrl(musicId))
        .subscribe((status) => {
          if (status) {
            this.nowPlayingMusicId = musicId;
          } else {
            alert('播放失败');
          }
        });
    } else {
      if (this.musicPlayService.isPlayingNow()) {
        this.musicPlayService.pause().subscribe();
      } else {
        this.musicPlayService.play().subscribe();
      }
    }
  }

  onPageChange(pageEvent: PageEvent): void {
    if (this.isSearch) {
      this.musicListService.search(this.searchKeyword, pageEvent.pageIndex, pageEvent.pageSize)
        .subscribe(music => this.refreshMusicList(music));
    } else {
      this.musicListService.getMusicList(pageEvent.pageIndex, pageEvent.pageSize)
        .subscribe(music => this.refreshMusicList(music));
    }
  }

  onSearch(): void {
    if (this.searchKeyword) {
      this.isSearch = true;
      this.musicListService.search(this.searchKeyword).subscribe(music => this.refreshMusicList(music));
    } else {
      this.isSearch = false;
      this.musicListService.getMusicList().subscribe(music => this.refreshMusicList(music));
    }
  }

  onTimeChange(time: number): void {
    this.musicPlayService.seek(time).subscribe();
  }

  onPlayStatusChange(event: PlayEvent): void {
    switch (event) {
      case PlayEvent.PLAY:
        if (!this.musicPlayService.isPlayingNow()) {
          if (this.nowPlayingMusicId) {
            this.musicPlayService.play().subscribe();
          } else {
            this.onPlayStatusChange(PlayEvent.NEXT);
          }
        }
        break;
      case PlayEvent.PAUSE:
        if (this.musicPlayService.isPlayingNow()) {
          this.musicPlayService.pause().subscribe();
        }
        break;
      case PlayEvent.NEXT:
        const nextMusic = this.musicListService.getNextMusic(this.playMode, this.nowPlayingMusicId, this.originalResponse);
        this.musicPlayService.start(this.fileService.getMusicFileUrl(nextMusic.musicId))
          .subscribe((status) => {
            if (status) {
              this.nowPlayingMusicId = nextMusic.musicId;
            } else {
              alert('播放失败');
            }
          });
        break;
      case PlayEvent.PREVIOUS:
        const previousMusic = this.musicListService.getPreviousMusic(this.playMode, this.nowPlayingMusicId, this.originalResponse);
        this.musicPlayService.start(this.fileService.getMusicFileUrl(previousMusic.musicId))
          .subscribe((status) => {
            if (status) {
              this.nowPlayingMusicId = previousMusic.musicId;
            } else {
              alert('播放失败');
            }
          });
        break;
      default:
    }
  }

  onPlayModeChange(mode: PlayMode): void {
    this.playMode = mode;
  }
}
