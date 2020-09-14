import {Component, HostListener, OnInit} from '@angular/core';
import {Page} from '../../../../entity/page/Page';
import {Music} from '../../../../entity/Music';
import {PageEvent} from '@angular/material/paginator';
import {HttpClient} from '@angular/common/http';
import {MusicLoadEvent, MusicPlaybackDurationChangeEvent, MusicPlayService} from '../../../../service/music-play.service';
import {FileService} from '../../../../service/file.service';
import {MusicListService, PlayMode} from '../../../../service/music-list.service';
import {PlayEvent} from '../control/control.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subject, timer} from 'rxjs';
import {ConfigService} from '../../../../service/config.service';
import {ProgressBarMode} from '@angular/material/progress-bar/progress-bar';
import {filter, mapTo, switchMap} from 'rxjs/operators';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  private isSearch = false;

  playMode = PlayMode.LOOP;
  searchKeyword: string;
  list: Music[];
  originalResponse: Page<Music> = new Page();
  nowPlayingMusicId: string;
  nowPlayMusicInfo: string;
  isPlay = false;
  musicTimeChangeEvent: MusicPlaybackDurationChangeEvent = new MusicPlaybackDurationChangeEvent(0, 0.1, null);
  onTimeChangeEventSubject = new Subject<MusicPlaybackDurationChangeEvent>();
  volumeValue = 1;
  progressMode: ProgressBarMode;

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar,
              private musicPlayService: MusicPlayService,
              private musicListService: MusicListService,
              private fileService: FileService,
              private configService: ConfigService,
              private titleService: Title) {
  }

  ngOnInit(): void {
    this.initDefaultConfig();
    this.handlerMusicPlayServiceEvent();
    this.musicListService.getMusicList().subscribe(music => this.refreshMusicList(music));
  }

  private handlerMusicPlayServiceEvent(): void {
    this.musicPlayService.onPlayChangeEvent.subscribe((status) => {
      this.isPlay = status;
    });
    this.musicPlayService.onTimeChangeEvent.subscribe(this.onTimeChangeEventSubject);
    this.onTimeChangeEventSubject.subscribe((time) => {
      this.musicTimeChangeEvent = time;
    });
    this.musicPlayService.onPlayEndEvent.subscribe(() => {
      // 单曲循环
      if (this.playMode === PlayMode.REPEAT) {
        this.musicPlayService.start(this.fileService.getMusicFileUrl(this.nowPlayingMusicId)).subscribe((status) => {
            if (!status) {
              this.snackBar.open('播放失败', '我知道了');
            }
          }
        );
      } else {
        this.onPlayStatusChange(PlayEvent.NEXT);
      }
    });

    const musicLoadEventSubject = new Subject<MusicLoadEvent>();
    this.musicPlayService.onLoadEvent.subscribe(musicLoadEventSubject);

    musicLoadEventSubject
      .pipe(
        filter(value => value === MusicLoadEvent.LOADING),
        switchMap(() => timer(2000).pipe(mapTo(MusicLoadEvent.STARTED)))
      )
      .subscribe(() => {
        this.progressMode = null;
      });
    musicLoadEventSubject.subscribe((event) => {
      switch (event) {
        case MusicLoadEvent.START:
          this.progressMode = 'indeterminate';
          break;
        case MusicLoadEvent.LOADING:
          this.progressMode = 'buffer';
          break;
        case MusicLoadEvent.STARTED:
          this.progressMode = null;
          break;
      }
    });
  }

  private initDefaultConfig(): void {
    const defaultVolume = this.configService.getDefaultVolume();
    this.volumeValue = defaultVolume;
    this.musicPlayService.volume(defaultVolume);
    this.playMode = this.configService.getDefaultMusicPlayMode();
  }

  private refreshMusicList(originalResponse: Page<Music>): void {
    this.list = originalResponse.content;
    this.originalResponse = originalResponse;
  }

  private refreshMusicInfo(nowPlayingMusicId: string): void {
    this.nowPlayingMusicId = nowPlayingMusicId;
    const nowPlayMusic = this.list.find(item => item.musicId === nowPlayingMusicId);
    if (nowPlayMusic) {
      this.nowPlayMusicInfo = `${nowPlayMusic.name}-${nowPlayMusic.singer}`;
      this.titleService.setTitle(`${this.nowPlayMusicInfo}-云舒音乐`);
    } else {
      this.nowPlayMusicInfo = '';
      this.titleService.setTitle('云舒音乐');
    }
  }

  @HostListener('window:keydown.space', ['$event'])
  onSpaceKeyDown(): void {
    if (!this.musicPlayService.isPlayingNow()) {
      if (this.nowPlayingMusicId) {
        this.musicPlayService.play().subscribe();
      } else {
        this.onPlayStatusChange(PlayEvent.NEXT);
      }
    } else {
      this.onPlayStatusChange(PlayEvent.PAUSE);
    }
  }

  @HostListener('window:keydown.control.ArrowLeft', ['$event'])
  @HostListener('window:keydown.control.ArrowRight', ['$event'])
  onArrowLeftOrArrowRightKeyDown($event: KeyboardEvent): void {
    if ($event.ctrlKey && $event.key !== undefined) {
      if ($event.key === 'ArrowLeft') {
        this.onPlayStatusChange(PlayEvent.PREVIOUS);
        return;
      }
      if ($event.key === 'ArrowRight') {
        this.onPlayStatusChange(PlayEvent.NEXT);
        return;
      }
    }
  }

  doOnClick(musicId: string): void {
    if (this.nowPlayingMusicId !== musicId) {
      this.musicPlayService.start(this.fileService.getMusicFileUrl(musicId))
        .subscribe((status) => {
          if (status) {
            this.refreshMusicInfo(musicId);
          } else {
            this.snackBar.open('播放失败', '我知道了');
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
      this.musicListService.search(this.searchKeyword.trim()).subscribe(music => this.refreshMusicList(music));
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
              this.refreshMusicInfo(nextMusic.musicId);
            } else {
              this.snackBar.open('播放失败', '我知道了');
            }
          });
        break;
      case PlayEvent.PREVIOUS:
        const previousMusic = this.musicListService.getPreviousMusic(this.playMode, this.nowPlayingMusicId, this.originalResponse);
        this.musicPlayService.start(this.fileService.getMusicFileUrl(previousMusic.musicId))
          .subscribe((status) => {
            if (status) {
              this.refreshMusicInfo(previousMusic.musicId);
            } else {
              this.snackBar.open('播放失败', '我知道了');
            }
          });
        break;
      default:
    }
  }

  onPlayModeChange(mode: PlayMode): void {
    this.playMode = mode;
    this.configService.setDefaultMusicPlayMode(mode);
  }

  onVolumeChange(volume: number): void {
    this.musicPlayService.volume(volume);
    this.configService.setDefaultVolume(volume);
  }

  onLocationClick(): void {
    let index = this.list.findIndex(item => item.musicId === this.nowPlayingMusicId);
    if (index !== -1) {
      const clientHeight = document.getElementsByTagName('mat-list-option')[0].clientHeight;
      index -= 10;
      index = index < 0 ? 0 : index;
      document.getElementsByTagName('mat-sidenav-content')[0].scrollTop = clientHeight * index;
    }
  }
}
