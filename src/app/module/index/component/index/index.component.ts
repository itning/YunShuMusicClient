import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Page} from '../../../../entity/page/Page';
import {Music} from '../../../../entity/Music';
import {PageEvent} from '@angular/material/paginator';
import {HttpClient} from '@angular/common/http';
import {MusicPlaybackDurationChangeEvent, MusicPlayService} from '../../../../service/music-play.service';
import {FileService} from '../../../../service/file.service';
import {MusicListService, PlayMode} from '../../../../service/music-list.service';
import {PlayEvent} from '../control/control.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  @ViewChild('musicCanvas', {static: true})
  musicCanvas: ElementRef;

  private isSearch = false;
  private playMode = PlayMode.LOOP;
  private canvasContext: CanvasRenderingContext2D;

  searchKeyword: string;
  list: Music[];
  originalResponse: Page<Music> = new Page();
  nowPlayingMusicId: string;
  nowPlayMusicInfo: string;
  isPlay = false;
  musicTimeChangeEvent: MusicPlaybackDurationChangeEvent = new MusicPlaybackDurationChangeEvent(0, 0.1, null);

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar,
              private musicPlayService: MusicPlayService,
              private musicListService: MusicListService,
              private fileService: FileService) {
  }

  ngOnInit(): void {
    this.canvasContext = this.getCanvasContext();

    this.musicListService.getMusicList().subscribe(music => this.refreshMusicList(music));

    this.musicPlayService.onPlayChangeEvent.subscribe((status) => {
      this.isPlay = status;
    });
    this.musicPlayService.onTimeChangeEvent.subscribe((time) => {
      this.musicTimeChangeEvent = time;
      this.drawTimeRanges(time.totalTime, time.timeRanges);
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
  }

  private getCanvasContext(): CanvasRenderingContext2D {
    const context: CanvasRenderingContext2D = this.musicCanvas.nativeElement.getContext('2d');
    context.fillStyle = 'lightgray';
    context.fillRect(0, 0, this.musicCanvas.nativeElement.width, this.musicCanvas.nativeElement.height);
    context.fillStyle = 'red';
    context.strokeStyle = 'white';
    return context;
  }

  private drawTimeRanges(duration: number, timeRanges: TimeRanges): void {
    const inc = this.musicCanvas.nativeElement.width / duration;

    for (let i = 0; i < timeRanges.length; i++) {

      const startX = timeRanges.start(i) * inc;
      const endX = timeRanges.end(i) * inc;
      const width = endX - startX;

      this.canvasContext.fillRect(startX, 0, width, this.musicCanvas.nativeElement.height);
      this.canvasContext.rect(startX, 0, width, this.musicCanvas.nativeElement.height);
      this.canvasContext.stroke();
    }
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
  }
}
